// TEST_DATABASE_URL must point to a disposable local PostgreSQL *_test database.
import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import jwtPlugin from "../../../../api/src/plugins/jwt";
import { authRoutes } from "../../../../api/src/modules/auth/auth.controller";
import { quotationRoutes } from "../../../../api/src/modules/quotation/quotation.controller";
import {
  bookingsRoutes,
  paymentsRoutes,
  publicBookingsRoutes,
} from "../../../../api/src/modules/bookings/bookings.controller";
import { getPublicBooking } from "./getPublicBooking";
import { StorageService } from "../../../../api/src/modules/storage/storage.service";
import { startVoucherServer } from "./testServer.mjs";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (
  databaseUrl &&
  (!["localhost", "127.0.0.1"].includes(new URL(databaseUrl).hostname) ||
    !new URL(databaseUrl).pathname.endsWith("_test"))
)
  throw new Error("Use an isolated local *_test database");

describe.skipIf(!databaseUrl)(
  "Module 6: real admin client → API → database → customer voucher",
  () => {
    const db = new PrismaClient({ datasourceUrl: databaseUrl });
    const app = Fastify({ logger: false });
    const storage = new Map(),
      publicHeaders = [];
    let user,
      service,
      customer,
      lead,
      quote,
      booking,
      firstPayment,
      secondPayment,
      client,
      apiBase,
      web;
    const privateNote = "PRIVATE_BOOKING_NOTE_CANARY";
    beforeAll(async () => {
      // This suite uses a local database and simulated uploaded objects.
      // The real R2 upload/download path is covered by the explicit live receipt test.
      const uploaded = new Set([
        "receipts/PRIVATE_RECEIPT_CANARY.pdf",
        "receipts/PRIVATE_SECOND_RECEIPT_CANARY.pdf",
        "receipts/PRIVATE_CORRECTED_RECEIPT_CANARY.pdf",
      ]);
      vi.spyOn(
        StorageService.prototype,
        "assertReceiptExists",
      ).mockImplementation(async (key) => {
        if (!uploaded.has(key))
          throw Object.assign(new Error("Receipt missing"), {
            statusCode: 404,
          });
      });
      vi.spyOn(
        StorageService.prototype,
        "getPresignedDownloadUrl",
      ).mockResolvedValue({
        downloadUrl: "https://receipts.example.test/proof?temporary=1",
        isMock: false,
      });
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("JWT_SECRET", "voucher-test-access-secret-".repeat(3));
      vi.stubEnv(
        "JWT_REFRESH_SECRET",
        "voucher-test-refresh-secret-".repeat(3),
      );
      vi.stubEnv("ADMIN_APP_URL", "http://localhost:3001");
      vi.stubEnv("WEB_APP_URL", "http://localhost:3000");
      for (const key of [
        "R2_ACCOUNT_ID",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
      ])
        vi.stubEnv(key, "");
      vi.stubGlobal("BroadcastChannel", undefined);
      vi.stubGlobal("localStorage", {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      });
      const password = "Local-voucher-integration-password-42";
      user = await db.user.create({
        data: {
          email: `${randomUUID()}@example.test`,
          fullName: "Voucher Test Admin",
          phone: "+919876543210",
          passwordHash: await bcrypt.hash(password, 12),
          role: "SUPER_ADMIN",
        },
      });
      service = await db.service.create({
        data: {
          name: "Voucher Integration Holiday",
          slug: `voucher-${randomUUID()}`,
          minMarginPercent: 12,
        },
      });
      customer = await db.customer.create({
        data: { fullName: "Voucher Integration Customer", phone: "9876543201" },
      });
      lead = await db.lead.create({
        data: {
          customerId: customer.id,
          serviceId: service.id,
          assignedToId: user.id,
          status: "CONTACTED",
          numberOfAdults: 2,
          numberOfKids: 0,
        },
      });
      app.decorate("prisma", db);
      await app.register(fp(async () => {}, { name: "prisma" }));
      await app.register(cookie);
      await app.register(rateLimit, { global: false });
      await app.register(jwtPlugin);
      await app.register(authRoutes, { prefix: "/api/v1/auth" });
      await app.register(quotationRoutes, { prefix: "/api/v1/quotes" });
      await app.register(bookingsRoutes, { prefix: "/api/v1/bookings" });
      await app.register(paymentsRoutes, { prefix: "/api/v1/payments" });
      await app.register(publicBookingsRoutes, { prefix: "/api/v1/public" });
      app.addHook("onRequest", async (request) => {
        if (request.url.startsWith("/api/v1/public/bookings/"))
          publicHeaders.push(request.headers);
      });
      apiBase = await app.listen({ host: "127.0.0.1", port: 0 });
      vi.stubEnv("VITE_API_URL", `${apiBase}/api/v1`);
      vi.stubEnv("API_INTERNAL_URL", `${apiBase}/api/v1`);
      const realFetch = globalThis.fetch;
      vi.stubGlobal("fetch", (url, init) => {
        const headers = new Headers(init?.headers);
        if (String(url).startsWith(apiBase))
          headers.set("Origin", "http://localhost:3001");
        return realFetch(url, { ...init, headers });
      });
      const auth = await import("../../../../admin/src/lib/apiClient");
      await auth.login({ email: user.email, password });
      ({ bookingsApi: client } =
        await import("../../../../admin/src/pages/bookings/bookingsApi"));
      const { quotesApi } =
        await import("../../../../admin/src/pages/quotes/quotesApi");
      quote = await quotesApi.createQuotation({
        leadId: lead.id,
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
        items: [
          {
            id: randomUUID(),
            type: "FLIGHT",
            title: "Return flights",
            description: "Economy with baggage",
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
      expect(quote.id).toMatch(/^[a-f0-9-]{36}$/);
      web = await startVoucherServer(`${apiBase}/api/v1`);
    }, 20000);
    afterAll(async () => {
      try {
        if (web) await web.close();
        if (lead) {
          const ids = (
            await db.booking.findMany({
              where: { leadId: lead.id },
              select: { id: true },
            })
          ).map((row) => row.id);
          await db.payment.deleteMany({ where: { bookingId: { in: ids } } });
          await db.booking.deleteMany({ where: { leadId: lead.id } });
          await db.leadActivity.deleteMany({ where: { leadId: lead.id } });
          await db.quotation.deleteMany({ where: { leadId: lead.id } });
          await db.lead.delete({ where: { id: lead.id } });
        }
        if (customer) await db.customer.delete({ where: { id: customer.id } });
        if (service) await db.service.delete({ where: { id: service.id } });
        if (user) await db.user.delete({ where: { id: user.id } });
      } finally {
        await app.close();
        await db.$disconnect();
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
      }
    });
    async function view() {
      const response = await fetch(`${web.url}/booking/${booking.bookingRef}`, {
        headers: {
          Cookie: "staff=PRIVATE_CREDENTIAL_CANARY",
          Authorization: "Bearer PRIVATE_CREDENTIAL_CANARY",
        },
        signal: AbortSignal.timeout(15000),
      });
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(html).not.toMatch(
        /PRIVATE_\w+_CANARY|supplierCost|marginAmount|marginPercent|receiptFileKey|transactionRef/,
      );
      return html;
    }
    it("converts the actual quotation to a persisted booking and renders an unpaid voucher", async () => {
      booking = await client.convertQuoteToBooking({
        quotationId: quote.id,
        travelDate: "2026-12-20",
        notes: privateNote,
      });
      expect(booking.id).toMatch(/^[a-f0-9-]{36}$/);
      expect(booking.bookingRef).toMatch(/^BK-\d{4}-\d{4,}$/);
      expect(
        (await db.lead.findUniqueOrThrow({ where: { id: lead.id } })).status,
      ).toBe("BOOKED");
      expect(
        (await db.quotation.findUniqueOrThrow({ where: { id: quote.id } }))
          .status,
      ).toBe("ACCEPTED");
      expect(
        (
          await db.booking.findUniqueOrThrow({ where: { id: booking.id } })
        ).paidAmount.toNumber(),
      ).toBe(0);
      const html = await view();
      expect(html).toContain("Voucher Integration Customer");
      expect(html).toContain("₹96,000");
      expect(html).toContain("Awaiting verified payment");
    });
    it("does not count a PENDING offline payment toward the customer balance", async () => {
      firstPayment = await client.recordPayment(booking.id, {
        amount: 40000,
        method: "UPI",
        transactionRef: "PRIVATE_UTR_CANARY",
        receiptFileKey: "receipts/PRIVATE_RECEIPT_CANARY.pdf",
        notes: privateNote,
      });
      expect(firstPayment.id).toMatch(/^[a-f0-9-]{36}$/);
      expect(
        (await db.payment.findUniqueOrThrow({ where: { id: firstPayment.id } }))
          .status,
      ).toBe("PENDING");
      const result = await getPublicBooking(booking.bookingRef);
      expect(result.kind).toBe("ready");
      expect(result.booking).toMatchObject({
        paidAmount: 0,
        dueAmount: 96000,
        isFullyPaid: false,
      });
      expect(await view()).toContain("Awaiting verified payment");
    });
    it("repairs a pending receipt on the original payment without changing its amount or balance", async () => {
      const key = "receipts/PRIVATE_CORRECTED_RECEIPT_CANARY.pdf";
      await client.replacePaymentReceipt(firstPayment.id, key);
      const payment = await db.payment.findUniqueOrThrow({
        where: { id: firstPayment.id },
      });
      expect(payment.receiptFileKey).toBe(key);
      expect(payment.status).toBe("PENDING");
      expect(Number(payment.amount)).toBe(40000);
      expect(await db.payment.count({ where: { bookingId: booking.id } })).toBe(
        1,
      );
      expect(
        (await getPublicBooking(booking.bookingRef)).booking,
      ).toMatchObject({ paidAmount: 0, dueAmount: 96000 });
      expect(await client.getReceiptPresignedUrl(firstPayment.id)).toEqual({
        url: "https://receipts.example.test/proof?temporary=1",
      });
      const rows = await client.fetchBookings();
      const persisted = rows.find((row) => row.id === booking.id);
      expect(persisted.customerName).toBe("Voucher Integration Customer");
      expect(persisted.payments).toHaveLength(1);
      expect(persisted.payments[0]).toMatchObject({
        id: firstPayment.id,
        amount: 40000,
        status: "PENDING",
        receiptFileKey: key,
      });
      await expect(
        client.replacePaymentReceipt(
          firstPayment.id,
          "receipts/not-uploaded.png",
        ),
      ).rejects.toThrow("Receipt missing");
      expect(
        (await db.payment.findUniqueOrThrow({ where: { id: firstPayment.id } }))
          .receiptFileKey,
      ).toBe(key);
    });

    it("reflects VERIFIED payments after reload without exposing transaction or receipt data", async () => {
      await client.verifyPayment(firstPayment.id, { status: "VERIFIED" });
      expect(
        (await db.payment.findUniqueOrThrow({ where: { id: firstPayment.id } }))
          .status,
      ).toBe("VERIFIED");
      const result = await getPublicBooking(booking.bookingRef);
      expect(result.booking).toMatchObject({
        paidAmount: 40000,
        dueAmount: 56000,
        isFullyPaid: false,
      });
      const html = await view();
      expect(html).toContain("₹40,000");
      expect(html).toContain("₹56,000");
      expect(html).toContain("Partially paid");
    });
    it("excludes REJECTED payments, then shows Fully Paid only when the balance is actually verified", async () => {
      secondPayment = await client.recordPayment(booking.id, {
        amount: 56000,
        method: "BANK_TRANSFER_NEFT_IMPS",
        transactionRef: "PRIVATE_BANK_REF_CANARY",
        receiptFileKey: "receipts/PRIVATE_SECOND_RECEIPT_CANARY.pdf",
      });
      expect(secondPayment.id).toMatch(/^[a-f0-9-]{36}$/);
      await client.verifyPayment(secondPayment.id, { status: "REJECTED" });
      expect(
        (await getPublicBooking(booking.bookingRef)).booking.paidAmount,
      ).toBe(40000);
      await client.verifyPayment(secondPayment.id, { status: "VERIFIED" });
      expect(
        (await getPublicBooking(booking.bookingRef)).booking,
      ).toMatchObject({ paidAmount: 96000, dueAmount: 0, isFullyPaid: true });
      expect(await view()).toContain("Fully Paid &amp; Verified");
    });
    it("renders later booking status changes without a stale confirmation or cached payment badge", async () => {
      for (const [status, label] of [
        ["IN_PROGRESS", "In progress"],
        ["COMPLETED", "Completed"],
        ["CANCELLED", "not an active travel confirmation"],
      ]) {
        await db.booking.update({
          where: { id: booking.id },
          data: { status },
        });
        const html = await view();
        expect(html).toContain(label);
        if (status === "CANCELLED")
          expect(html).not.toContain("Fully Paid &amp; Verified");
      }
      expect(await getPublicBooking("BK-1900-9999999999")).toEqual({
        kind: "not-found",
      });
      expect(publicHeaders.length).toBeGreaterThan(0);
      expect(
        publicHeaders.every(
          (headers) => !headers.authorization && !headers.cookie,
        ),
      ).toBe(true);
    });
  },
);
