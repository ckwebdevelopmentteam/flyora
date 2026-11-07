// Keep this opt-in cross-workspace harness outside the web TypeScript build.
// Production customer pages must not depend on generated backend Prisma types.
import React from "react";
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { createServer as reservePort } from "node:net";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import jwtPlugin from "../../../../api/src/plugins/jwt";
import { authRoutes } from "../../../../api/src/modules/auth/auth.controller";
import {
  quotationRoutes,
  publicQuotationRoutes,
} from "../../../../api/src/modules/quotation/quotation.controller";
import { getPublicQuote } from "./getPublicQuote";
import { QuoteProposal } from "./QuoteProposal";
// Opt in to this suite only with an isolated local test database. Never load .env.
const databaseUrl = process.env.TEST_DATABASE_URL;
if (
  databaseUrl &&
  (!["localhost", "127.0.0.1"].includes(new URL(databaseUrl).hostname) ||
    !new URL(databaseUrl).pathname.endsWith("_test"))
)
  throw new Error(
    "TEST_DATABASE_URL must name an isolated local *_test database",
  );
describe.skipIf(!databaseUrl)(
  "Module 5: merged Dev 2 client → real Dev 1 API → Dev 3 page",
  () => {
    const db = new PrismaClient({ datasourceUrl: databaseUrl });
    const app = Fastify({ logger: false });
    const storage = new Map();
    const publicApiHeaders = [];
    let userId, customerId, serviceId, leadId;
    let quoteId, token, baseUrl;
    let quotesApi;
    let authClient;
    const privateNote = "PRIVATE_STAFF_NOTE_CANARY";
    const password = "Local-integration-only-password-42";
    const requests = [];
    beforeAll(async () => {
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("JWT_SECRET", "local-test-access-secret-".repeat(3));
      vi.stubEnv("JWT_REFRESH_SECRET", "local-test-refresh-secret-".repeat(3));
      vi.stubEnv("ADMIN_APP_URL", "http://localhost:3001");
      vi.stubEnv("WEB_APP_URL", "http://localhost:3000");
      vi.stubGlobal("BroadcastChannel", undefined);
      vi.stubGlobal("localStorage", {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      });
      const email = `${randomUUID()}@example.test`;
      const user = await db.user.create({
        data: {
          email,
          fullName: "Local Integration Coordinator",
          phone: "+919876543210",
          passwordHash: await bcrypt.hash(password, 12),
          role: "SERVICE_COORDINATOR",
        },
      });
      userId = user.id;
      const service = await db.service.create({
        data: {
          name: `Integration Holiday ${randomUUID()}`,
          slug: `test-${randomUUID()}`,
          minMarginPercent: 12,
        },
      });
      serviceId = service.id;
      await db.userService.create({ data: { userId, serviceId } });
      const customer = await db.customer.create({
        data: { fullName: "Local Integration Customer", phone: "9876543201" },
      });
      customerId = customer.id;
      const lead = await db.lead.create({
        data: {
          customerId,
          serviceId,
          assignedToId: userId,
          status: "CONTACTED",
          travelDate: new Date("2026-12-20T00:00:00Z"),
          numberOfAdults: 2,
          numberOfKids: 1,
        },
      });
      leadId = lead.id;
      app.addHook("onRequest", async (request) => {
        if (request.url.startsWith("/api/v1/public/quotes/"))
          publicApiHeaders.push({
            authorization: request.headers.authorization,
            cookie: request.headers.cookie,
          });
      });
      app.decorate("prisma", db);
      await app.register(fp(async () => {}, { name: "prisma" }));
      await app.register(cookie);
      await app.register(rateLimit, { global: false });
      await app.register(jwtPlugin);
      await app.register(authRoutes, { prefix: "/api/v1/auth" });
      await app.register(quotationRoutes, { prefix: "/api/v1/quotes" });
      await app.register(publicQuotationRoutes, { prefix: "/api/v1/public" });
      baseUrl = await app.listen({ host: "127.0.0.1", port: 0 });
      vi.stubEnv("VITE_API_URL", `${baseUrl}/api/v1`);
      vi.stubEnv("API_INTERNAL_URL", `${baseUrl}/api/v1`);
      const realFetch = globalThis.fetch;
      vi.stubGlobal("fetch", async (url, init) => {
        const headers = new Headers(init?.headers);
        // Node has no browser Origin handling/cookie jar. Emulate only the Origin;
        // actual staff auth still uses the backend-issued access token.
        if (String(url).startsWith(baseUrl))
          headers.set("Origin", "http://localhost:3001");
        requests.push({
          url: String(url),
          authorization: headers.get("Authorization"),
          cookie: headers.get("Cookie"),
        });
        return realFetch(url, { ...init, headers });
      });
      authClient = await import("../../../../admin/src/lib/apiClient");
      ({ quotesApi } =
        await import("../../../../admin/src/pages/quotes/quotesApi"));
      await authClient.login({ email, password });
    }, 20000);
    afterAll(async () => {
      try {
        if (leadId) {
          await db.leadActivity.deleteMany({ where: { leadId } });
          await db.quotation.deleteMany({ where: { leadId } });
          await db.lead.deleteMany({ where: { id: leadId } });
        }
        if (customerId)
          await db.customer.deleteMany({ where: { id: customerId } });
        if (userId) await db.user.deleteMany({ where: { id: userId } });
        if (serviceId)
          await db.service.deleteMany({ where: { id: serviceId } });
      } finally {
        await app.close();
        await db.$disconnect();
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
      }
    });
    it("creates a persisted quotation with Dev 2's actual request adapter, not its mock fallback", async () => {
      const created = await quotesApi.createQuotation({
        leadId,
        serviceName: "Holiday Packages",
        minMarginPercent: 12,
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [
          {
            id: randomUUID(),
            type: "FLIGHT",
            title: "Return flights",
            description: "Economy and baggage",
            quantity: 2,
            supplierCost: 20000,
            sellingPrice: 28000,
          },
          {
            id: randomUUID(),
            type: "HOTEL",
            title: "Four-night hotel stay",
            description: "Breakfast included",
            quantity: 1,
            supplierCost: 30000,
            sellingPrice: 40000,
          },
        ],
        inclusions: ["Daily breakfast"],
        exclusions: ["Personal expenses"],
        notes: privateNote,
      });
      expect(created.id).toMatch(/^[a-f0-9-]{36}$/);
      expect(created.shareToken).toMatch(/^[a-f0-9-]{36}$/);
      quoteId = created.id;
      token = created.shareToken;
      const saved = await db.quotation.findUniqueOrThrow({
        where: { id: quoteId },
      });
      expect(saved.notes).toBe(privateNote);
      expect(Number(saved.sellingPrice)).toBe(96000);
      expect(saved.status).toBe("DRAFT");
      expect(
        (await db.lead.findUniqueOrThrow({ where: { id: leadId } })).status,
      ).toBe("QUOTED");
      expect(
        (await quotesApi.fetchQuotationsForLead(leadId)).some(
          (quote) => quote.id === quoteId,
        ),
      ).toBe(true);
    });
    it("renders the merged API's sanitized DRAFT response and does not invent trip context", async () => {
      expect(token).toBeTruthy();
      const response = await fetch(`${baseUrl}/api/v1/public/quotes/${token}`);
      const payload = await response.json();
      expect(response.status).toBe(200);
      const serialized = JSON.stringify(payload);
      for (const key of [
        "supplierCost",
        "marginAmount",
        "marginPercent",
        "notes",
        privateNote,
      ])
        expect(serialized).not.toContain(key);
      const result = await getPublicQuote(token);
      expect(result.kind).toBe("ready");
      if (result.kind !== "ready")
        throw new Error("Public quotation was not renderable");
      expect(result.quote.status).toBe("DRAFT");
      expect(result.quote.totalPrice).toBe(96000);
      expect(result.quote).not.toHaveProperty("shareToken");
      const html = renderToStaticMarkup(
        React.createElement(QuoteProposal, {
          quote: result.quote,
          initialNow: result.receivedAt,
        }),
      );
      expect(html).toContain("Local Integration Customer");
      expect(html).toContain("₹96,000");
      expect(html).toContain("₹56,000");
      expect(html).toContain("Request the Final Quote");
      expect(html).not.toContain("Accept &amp; Confirm via WhatsApp");
      expect(html).toContain("To be confirmed");
      expect(html).not.toContain(privateNote);
    });
    it("aligns SENT, ACCEPTED, REJECTED and EXPIRED actions with actual status updates", async () => {
      for (const [status, label] of [
        ["SENT", "Accept &amp; Confirm via WhatsApp"],
        ["ACCEPTED", "Discuss Your Booking"],
        ["REJECTED", "Request an Updated Quote"],
        ["EXPIRED", "Request an Updated Quote"],
      ]) {
        await quotesApi.updateQuoteStatus(quoteId, status);
        expect(
          (await db.quotation.findUniqueOrThrow({ where: { id: quoteId } }))
            .status,
        ).toBe(status);
        const result = await getPublicQuote(token);
        expect(result.kind).toBe("ready");
        if (result.kind !== "ready")
          throw new Error("Public quotation was not renderable");
        const html = renderToStaticMarkup(
          React.createElement(QuoteProposal, {
            quote: result.quote,
            initialNow: result.receivedAt,
          }),
        );
        expect(html).toContain(label);
        if (status !== "SENT")
          expect(html).not.toContain("Accept &amp; Confirm via WhatsApp");
        if (status === "EXPIRED")
          expect(html).toContain("This quotation has expired.");
      }
    });
    it("does not cache an earlier validity date or fabricate another token's proposal", async () => {
      await quotesApi.updateQuoteStatus(quoteId, "SENT");
      await db.quotation.update({
        where: { id: quoteId },
        data: { validUntil: new Date(Date.now() - 86400000) },
      });
      const result = await getPublicQuote(token);
      expect(result.kind).toBe("ready");
      if (result.kind !== "ready")
        throw new Error("Public quotation was not renderable");
      expect(result.quote.isExpired).toBe(true);
      const html = renderToStaticMarkup(
        React.createElement(QuoteProposal, {
          quote: result.quote,
          initialNow: result.receivedAt,
        }),
      );
      expect(html).toContain("This quotation expired on");
      expect(html).not.toContain("Accept &amp; Confirm via WhatsApp");
      expect(await getPublicQuote(randomUUID())).toEqual({ kind: "not-found" });
      const publicCalls = requests.filter((request) =>
        request.url.includes("/api/v1/public/quotes/"),
      );
      expect(publicCalls.length).toBeGreaterThan(0);
      expect(
        publicCalls.every(
          (request) => !request.authorization && !request.cookie,
        ),
      ).toBe(true);
    });
    it("serves the saved quotation through the production Next route with no private-data leakage", async () => {
      await db.quotation.update({
        where: { id: quoteId },
        data: { status: "SENT", validUntil: new Date(Date.now() + 86400000) },
      });
      const reservation = reservePort();
      await new Promise((resolve) =>
        reservation.listen(0, "127.0.0.1", resolve),
      );
      const address = reservation.address();
      if (!address || typeof address === "string")
        throw new Error("Could not reserve web port");
      const port = address.port;
      await new Promise((resolve) => reservation.close(() => resolve()));
      const require = createRequire(import.meta.url);
      const web = spawn(
        process.execPath,
        [
          require.resolve("next/dist/bin/next"),
          "start",
          "--hostname",
          "127.0.0.1",
          "--port",
          String(port),
        ],
        {
          cwd: fileURLToPath(new URL("../../../", import.meta.url)),
          env: {
            ...process.env,
            NODE_ENV: "production",
            API_INTERNAL_URL: `${baseUrl}/api/v1`,
            NEXT_TELEMETRY_DISABLED: "1",
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let output = "";
      web.stdout.on("data", (data) => {
        output += String(data);
      });
      web.stderr.on("data", (data) => {
        output += String(data);
      });
      try {
        for (
          let attempt = 0;
          attempt < 100 && !output.includes("Ready");
          attempt++
        ) {
          if (web.exitCode !== null)
            throw new Error(
              `Next server failed to start: ${output.slice(-1000)}`,
            );
          await delay(100);
        }
        expect(output).toContain("Ready");
        const response = await fetch(
          `http://127.0.0.1:${port}/quote/${token}`,
          {
            headers: {
              Cookie: "staff_session=DO_NOT_FORWARD",
              Authorization: "Bearer DO_NOT_FORWARD",
            },
            signal: AbortSignal.timeout(20000),
          },
        );
        const html = await response.text();
        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toContain("no-store");
        expect(html).toContain("Local Integration Customer");
        expect(html).toContain("₹96,000");
        expect(html).toContain("₹56,000");
        expect(html).toContain("Accept &amp; Confirm via WhatsApp");
        expect(html).toContain("https://wa.me/919876543210");
        expect(html).toMatch(
          /name="robots" content="[^"]*noindex[^"]*nofollow/,
        );
        expect(html).toContain('name="referrer" content="no-referrer"');
        for (const secret of [
          privateNote,
          "supplierCost",
          "marginAmount",
          "marginPercent",
          "DO_NOT_FORWARD",
        ])
          expect(html).not.toContain(secret);
        expect(publicApiHeaders.length).toBeGreaterThan(0);
        expect(
          publicApiHeaders.every(
            (headers) => !headers.authorization && !headers.cookie,
          ),
        ).toBe(true);
      } finally {
        web.kill("SIGTERM");
        if (web.exitCode === null)
          await new Promise((resolve) => {
            web.once("exit", () => resolve());
            setTimeout(() => {
              if (web.exitCode === null) web.kill("SIGKILL");
              resolve();
            }, 5000).unref();
          });
      }
    }, 30000);
  },
);
