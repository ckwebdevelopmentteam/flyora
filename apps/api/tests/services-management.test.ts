import { test } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { servicesRoutes } from "../src/modules/services/services.controller";
function setup() {
  const rows: any[] = [
    {
      id: "existing",
      name: "Holidays",
      slug: "holidays",
      description: "Trips",
      isActive: true,
      minMarginPercent: 10,
      _count: { coordinators: 2, packages: 1, leads: 1 },
    },
  ];
  let reads = 0;
  const app = Fastify();
  app.decorate("authenticate", async (request: any, reply: any) => {
    if (!request.headers.authorization)
      return reply.code(401).send({ message: "Sign in" });
    request.user = { role: request.headers.authorization };
  });
  app.decorate("prisma", {
    service: {
      findMany: async ({ where }: any) => {
        reads++;
        return rows.filter((r) => !where || r.isActive).map((r) => ({ ...r }));
      },
      findUnique: async ({ where }: any) =>
        rows.find((r) => r.slug === where.slug),
      create: async ({ data }: any) => {
        if (rows.some((r) => r.slug === data.slug || r.name === data.name))
          throw { code: "P2002" };
        const row = {
          ...data,
          id: `service-${rows.length}`,
          _count: { coordinators: 0, packages: 0, leads: 0 },
        };
        rows.push(row);
        return row;
      },
      update: async ({ where, data }: any) => {
        const row = rows.find((r) => r.id === where.id);
        if (!row) throw { code: "P2025" };
        Object.assign(row, data);
        return row;
      },
    },
  } as any);
  app.register(servicesRoutes, { prefix: "/services" });
  return { app, rows, reads: () => reads };
}
test("only Super Admin can create, edit or view paused services", async () => {
  const { app, rows } = setup();
  try {
    for (const role of [
      undefined,
      "OPERATIONS_MANAGER",
      "SERVICE_COORDINATOR",
      "CONTENT_MANAGER",
    ]) {
      const headers = role ? { authorization: role } : {};
      const expected = role ? 403 : 401;
      assert.equal(
        (
          await app.inject({
            method: "POST",
            url: "/services",
            headers,
            payload: { name: "Trains", minMarginPercent: 10 },
          })
        ).statusCode,
        expected,
      );
      assert.equal(
        (
          await app.inject({
            method: "PATCH",
            url: "/services/existing",
            headers,
            payload: { isActive: false },
          })
        ).statusCode,
        expected,
      );
      assert.equal(
        (await app.inject({ url: "/services/manage", headers })).statusCode,
        expected,
      );
    }
    assert.equal(rows.length, 1);
    assert.equal(rows[0].isActive, true);
  } finally {
    await app.close();
  }
});
test("create and edit invalidate the public cache and ETag; pausing preserves identity and assignments", async () => {
  const { app, rows, reads } = setup();
  const headers = { authorization: "SUPER_ADMIN" };
  try {
    const first = await app.inject("/services");
    assert.equal(first.statusCode, 200);
    assert.equal(
      (
        await app.inject({
          url: "/services",
          headers: { "if-none-match": first.headers.etag as string },
        })
      ).statusCode,
      304,
    );
    assert.equal(reads(), 1);
    const created = await app.inject({
      method: "POST",
      url: "/services",
      headers,
      payload: {
        name: "Rail journeys",
        description: "Scenic train trips",
        minMarginPercent: 12,
      },
    });
    assert.equal(created.statusCode, 201);
    const row = created.json().data;
    assert.equal(row.slug, "rail-journeys");
    const fresh = await app.inject({
      url: "/services",
      headers: { "if-none-match": first.headers.etag as string },
    });
    assert.equal(fresh.statusCode, 200);
    assert.notEqual(fresh.headers.etag, first.headers.etag);
    assert.equal(fresh.json().data.length, 2);
    assert.equal(reads(), 2);
    assert.equal(
      (
        await app.inject({
          method: "PATCH",
          url: "/services/existing",
          headers,
          payload: { name: "Tailored holidays", isActive: false },
        })
      ).statusCode,
      200,
    );
    assert.equal((await app.inject("/services")).json().data.length, 1);
    assert.equal(rows[0].slug, "holidays");
    assert.equal(rows[0]._count.coordinators, 2);
    assert.equal((await app.inject("/services/holidays")).statusCode, 404);
    assert.equal(
      (await app.inject({ url: "/services/manage", headers })).json().data
        .length,
      2,
    );
  } finally {
    await app.close();
  }
});
test("invalid and duplicate services fail safely without invalidating a good cached list", async () => {
  const { app, rows, reads } = setup();
  const headers = { authorization: "SUPER_ADMIN" };
  try {
    await app.inject("/services");
    for (const payload of [
      { name: "", minMarginPercent: 10 },
      { name: "Visa", minMarginPercent: 100 },
      { name: "Visa", minMarginPercent: 10, role: "SUPER_ADMIN" },
    ])
      assert.equal(
        (
          await app.inject({
            method: "POST",
            url: "/services",
            headers,
            payload,
          })
        ).statusCode,
        400,
      );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/services",
          headers,
          payload: { name: "Holidays", minMarginPercent: 10 },
        })
      ).statusCode,
      409,
    );
    await app.inject("/services");
    assert.equal(rows.length, 1);
    assert.equal(reads(), 1);
  } finally {
    await app.close();
  }
});
