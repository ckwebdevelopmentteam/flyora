import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwtPlugin from "../src/plugins/jwt";
import { authRoutes } from "../src/modules/auth/auth.controller";
import { requireRole } from "../src/middleware/rbac";
import { authConfig } from "../src/modules/auth/auth.config";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname) ||
  !new URL(url).pathname.endsWith("_test")
)
  throw new Error(
    "TEST_DATABASE_URL must name an isolated local *_test database",
  );
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-access-secret-".repeat(4);
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-".repeat(4);
process.env.ADMIN_APP_URL = "http://localhost:3001";
process.env.WEB_APP_URL = "http://localhost:3000";
const db = new PrismaClient({ datasourceUrl: url });
const origin = { origin: "http://localhost:3001" };
const password = "Integration-test-password-42";
const hash = bcrypt.hashSync(password, 12);

async function fixture() {
  const user = await db.user.create({
    data: {
      email: `${randomUUID()}@example.test`,
      fullName: "Test Staff",
      passwordHash: hash,
      role: "SUPER_ADMIN",
    },
  });
  const app = Fastify();
  app.decorate("prisma", db);
  await app.register(cookie);
  await app.register(rateLimit, { global: false });
  // The production plugin declares this dependency; decorate through a named test plugin.
  const fp = (await import("fastify-plugin")).default;
  await app.register(fp(async () => {}, { name: "prisma" }));
  await app.register(jwtPlugin);
  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  app.get(
    "/protected",
    { preHandler: [app.authenticate] },
    async (request) => ({ role: request.user.role }),
  );
  app.get(
    "/admin",
    { preHandler: [app.authenticate, requireRole(["SUPER_ADMIN"])] },
    async () => ({ ok: true }),
  );
  app.setErrorHandler((error: any, _request, reply) =>
    reply
      .code(error.statusCode || 500)
      .send({ message: error.statusCode ? error.message : "Unavailable" }),
  );
  await app.ready();
  const login = () =>
    app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: origin,
      payload: { email: user.email, password },
    });
  const refresh = (value: string, operation = randomUUID()) =>
    app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      headers: { ...origin, cookie: value, "x-refresh-operation": operation },
      payload: {},
    });
  const bearer = (accessToken: string) => ({
    authorization: `Bearer ${accessToken}`,
  });
  return {
    app,
    user,
    login,
    refresh,
    bearer,
    close: async () => {
      await app.close();
      await db.user.delete({ where: { id: user.id } });
    },
  };
}
function cookieFrom(response: { headers: Record<string, unknown> }) {
  return String(response.headers["set-cookie"]).split(";")[0];
}

test("Flyora database-backed browser auth", async (t) => {
  await t.test(
    "login returns only an access token and stores an opaque refresh hash",
    async () => {
      const f = await fixture();
      try {
        const response = await f.login();
        assert.equal(response.statusCode, 200);
        const data = response.json().data;
        assert.equal(data.refreshToken, undefined);
        assert.equal(data.accessExpiresIn, 900);
        assert.match(String(response.headers["set-cookie"]), /HttpOnly/);
        assert.match(String(response.headers["set-cookie"]), /SameSite=Lax/);
        assert.equal(response.headers["cache-control"], "no-store");
        const session = await db.authSession.findFirstOrThrow({
          where: { userId: f.user.id },
        });
        assert.match(session.refreshTokenHash, /^[0-9a-f]{64}$/);
        assert.ok(!cookieFrom(response).includes(session.refreshTokenHash));
        assert.equal(
          (
            await f.app.inject({
              url: "/protected",
              headers: f.bearer(data.accessToken),
            })
          ).statusCode,
          200,
        );
        const claims = f.app.jwt.decode<{ exp: number; iat: number }>(
          data.accessToken,
        );
        assert.equal(claims.exp - claims.iat, 900);
      } finally {
        await f.close();
      }
    },
  );
  await t.test(
    "refresh cookies and legacy JWTs cannot authenticate bearer requests",
    async () => {
      const f = await fixture();
      try {
        const login = await f.login();
        const raw = cookieFrom(login).split("=")[1];
        assert.equal(
          (await f.app.inject({ url: "/protected", headers: f.bearer(raw) }))
            .statusCode,
          401,
        );
        const legacy = f.app.jwt.sign({ id: f.user.id } as any);
        assert.equal(
          (await f.app.inject({ url: "/protected", headers: f.bearer(legacy) }))
            .statusCode,
          401,
        );
        assert.equal(
          (
            await f.app.inject({
              method: "POST",
              url: "/api/v1/auth/refresh",
              headers: origin,
              payload: { refreshToken: login.json().data.accessToken },
            })
          ).statusCode,
          401,
        );
      } finally {
        await f.close();
      }
    },
  );
  await t.test(
    "rotation recovers a lost response only for the same operation",
    async () => {
      const f = await fixture();
      try {
        const login = await f.login();
        const original = cookieFrom(login);
        const operation = randomUUID();
        const rotated = await f.refresh(original, operation);
        assert.equal(rotated.statusCode, 200);
        assert.notEqual(cookieFrom(rotated), original);
        const retryOld = await f.refresh(original, operation);
        assert.equal(retryOld.statusCode, 200);
        assert.equal(cookieFrom(retryOld), cookieFrom(rotated));
        const retryNew = await f.refresh(cookieFrom(rotated), operation);
        assert.equal(retryNew.statusCode, 200);
        assert.equal(cookieFrom(retryNew), cookieFrom(rotated));
        const expiresBefore = (
          await db.authSession.findFirstOrThrow({
            where: { userId: f.user.id },
          })
        ).expiresAt;
        const next = await f.refresh(cookieFrom(rotated));
        assert.equal(next.statusCode, 200);
        assert.equal(
          (
            await db.authSession.findFirstOrThrow({
              where: { userId: f.user.id },
            })
          ).expiresAt.getTime(),
          expiresBefore.getTime(),
        );
        const replay = await f.refresh(original);
        assert.equal(replay.statusCode, 401);
        assert.equal(
          (
            await f.app.inject({
              url: "/protected",
              headers: f.bearer(next.json().data.accessToken),
            })
          ).statusCode,
          401,
        );
        assert.ok(
          (
            await db.authSession.findFirstOrThrow({
              where: { userId: f.user.id },
            })
          ).revokedAt,
        );
      } finally {
        await f.close();
      }
    },
  );
  await t.test(
    "refresh survives a database delay beyond Prisma's old five-second timeout",
    async () => {
      const f = await fixture();
      const original = db.$transaction;
      try {
        const login = await f.login();
        db.$transaction = ((callback: any, options: any) =>
          original.call(
            db,
            async (tx: any) => {
              await tx.$executeRaw`SELECT pg_sleep(6)`;
              return callback(tx);
            },
            options,
          )) as any;
        const refreshed = await f.refresh(cookieFrom(login));
        assert.equal(refreshed.statusCode, 200);
        assert.equal(
          (
            await f.app.inject({
              url: "/protected",
              headers: f.bearer(refreshed.json().data.accessToken),
            })
          ).statusCode,
          200,
        );
      } finally {
        db.$transaction = original;
        await f.close();
      }
    },
  );
  await t.test(
    "concurrent same-operation refreshes share one successor",
    async () => {
      const f = await fixture();
      try {
        const login = await f.login();
        const operation = randomUUID();
        const responses = await Promise.all(
          Array.from({ length: 5 }, () =>
            f.refresh(cookieFrom(login), operation),
          ),
        );
        assert.ok(responses.every((response) => response.statusCode === 200));
        assert.equal(new Set(responses.map(cookieFrom)).size, 1);
      } finally {
        await f.close();
      }
    },
  );
  await t.test(
    "expired recovery windows and expired sessions fail closed",
    async () => {
      const f = await fixture();
      try {
        const login = await f.login();
        const operation = randomUUID();
        const rotated = await f.refresh(cookieFrom(login), operation);
        await db.authSession.updateMany({
          where: { userId: f.user.id },
          data: { lastUsedAt: new Date(Date.now() - 31_000) },
        });
        assert.equal(
          (await f.refresh(cookieFrom(rotated), operation)).statusCode,
          401,
        );
        const another = await f.login();
        await db.authSession.updateMany({
          where: { userId: f.user.id },
          data: { expiresAt: new Date(Date.now() - 1000) },
        });
        assert.equal((await f.refresh(cookieFrom(another))).statusCode, 401);
      } finally {
        await f.close();
      }
    },
  );
  await t.test(
    "forged refresh tokens do not revoke a known session id",
    async () => {
      const f = await fixture();
      try {
        const login = await f.login();
        const value = cookieFrom(login);
        const parts = value.split(".");
        parts[1] = "0".repeat(64);
        assert.equal((await f.refresh(parts.join("."))).statusCode, 401);
        assert.equal(
          (
            await f.app.inject({
              url: "/protected",
              headers: f.bearer(login.json().data.accessToken),
            })
          ).statusCode,
          200,
        );
      } finally {
        await f.close();
      }
    },
  );
  await t.test(
    "origin checks protect login, refresh and logout including missing Origin",
    async () => {
      const f = await fixture();
      try {
        for (const route of ["login", "refresh", "logout"])
          for (const headers of [{}, { origin: "https://evil.example" }]) {
            assert.equal(
              (
                await f.app.inject({
                  method: "POST",
                  url: `/api/v1/auth/${route}`,
                  headers,
                  payload: {},
                })
              ).statusCode,
              403,
            );
          }
      } finally {
        await f.close();
      }
    },
  );
  await t.test(
    "roles and account status are database-authoritative on every API call",
    async () => {
      const f = await fixture();
      try {
        const login = await f.login();
        const headers = f.bearer(login.json().data.accessToken);
        assert.equal(
          (await f.app.inject({ url: "/admin", headers })).statusCode,
          200,
        );
        await db.user.update({
          where: { id: f.user.id },
          data: { role: "SERVICE_COORDINATOR" },
        });
        assert.equal(
          (await f.app.inject({ url: "/admin", headers })).statusCode,
          403,
        );
        await db.user.update({
          where: { id: f.user.id },
          data: { isActive: false },
        });
        assert.equal(
          (await f.app.inject({ url: "/protected", headers })).statusCode,
          401,
        );
        assert.equal((await f.refresh(cookieFrom(login))).statusCode, 401);
      } finally {
        await f.close();
      }
    },
  );
  await t.test(
    "logout revokes only this session and invalidates its bearer immediately",
    async () => {
      const f = await fixture();
      try {
        const a = await f.login();
        const b = await f.login();
        const response = await f.app.inject({
          method: "POST",
          url: "/api/v1/auth/logout",
          headers: { ...origin, cookie: cookieFrom(a) },
          payload: {},
        });
        assert.equal(response.statusCode, 200);
        assert.match(
          String(response.headers["set-cookie"]),
          /Max-Age=0|Expires=Thu, 01 Jan 1970/,
        );
        assert.equal(
          (
            await f.app.inject({
              url: "/protected",
              headers: f.bearer(a.json().data.accessToken),
            })
          ).statusCode,
          401,
        );
        assert.equal(
          (
            await f.app.inject({
              url: "/protected",
              headers: f.bearer(b.json().data.accessToken),
            })
          ).statusCode,
          200,
        );
        assert.equal((await f.refresh(cookieFrom(a))).statusCode, 401);
      } finally {
        await f.close();
      }
    },
  );
  await t.test("login is rate limited", async () => {
    const f = await fixture();
    try {
      for (let index = 0; index < 10; index++)
        assert.equal(
          (
            await f.app.inject({
              method: "POST",
              url: "/api/v1/auth/login",
              headers: origin,
              payload: {},
            })
          ).statusCode,
          400,
        );
      assert.equal(
        (
          await f.app.inject({
            method: "POST",
            url: "/api/v1/auth/login",
            headers: origin,
            payload: {},
          })
        ).statusCode,
        429,
      );
    } finally {
      await f.close();
    }
  });
  await t.test(
    "production cookies have the host prefix, Secure, HttpOnly and no Domain",
    async () => {
      process.env.NODE_ENV = "production";
      process.env.ADMIN_APP_URL = "https://admin.example.com";
      process.env.WEB_APP_URL = "https://www.example.com";
      const f = await fixture();
      try {
        assert.equal(authConfig().cookieName, "__Host-flyora_refresh");
        const response = await f.app.inject({
          method: "POST",
          url: "/api/v1/auth/login",
          headers: { origin: "https://admin.example.com" },
          payload: { email: f.user.email, password },
        });
        assert.equal(response.statusCode, 200);
        const cookie = String(response.headers["set-cookie"]);
        assert.match(cookie, /^__Host-flyora_refresh=/);
        assert.match(cookie, /; Secure/);
        assert.match(cookie, /; HttpOnly/);
        assert.match(cookie, /; Path=\//);
        assert.match(cookie, /; SameSite=Lax/);
        assert.ok(!cookie.includes("Domain="));
      } finally {
        await f.close();
        process.env.NODE_ENV = "test";
        process.env.ADMIN_APP_URL = "http://localhost:3001";
        process.env.WEB_APP_URL = "http://localhost:3000";
      }
    },
  );
}).finally(() => db.$disconnect());
