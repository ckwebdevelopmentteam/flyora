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
      displayOrder: 0,
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
  const db: any = {
    service: {
      findMany: async ({ where }: any) => {
        reads++;
        return rows
          .filter((r) => !where || r.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((r) => ({ ...r }));
      },
      aggregate: async () => ({
        _max: {
          displayOrder: rows.length
            ? Math.max(...rows.map((r) => r.displayOrder))
            : null,
        },
      }),
      findUnique: async ({ where }: any) =>
        rows.find((r) => r.slug === where.slug),
      create: async ({ data }: any) => {
        if (rows.some((r) => r.slug === data.slug || r.name === data.name))
          throw { code: "P2002" };
        const row = {
          minMarginPercent: 10,
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
  };
  db.$transaction = async (operation: (tx: any) => Promise<unknown>) => {
    const before = structuredClone(rows);
    try {
      return await operation(db);
    } catch (error) {
      rows.splice(0, rows.length, ...before);
      throw error;
    }
  };
  app.decorate("prisma", db);
  app.register(servicesRoutes, { prefix: "/services" });
  return { app, rows, db, reads: () => reads };
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
        (
          await app.inject({
            method: "PUT",
            url: "/services/order",
            headers,
            payload: { serviceIds: [], expectedServiceIds: [] },
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

test("services append at the end, and changing text never changes the quotation floor", async () => {
  const { app, rows } = setup();
  const headers = { authorization: "SUPER_ADMIN" };
  try {
    const created = await app.inject({
      method: "POST",
      url: "/services",
      headers,
      payload: { name: "Bus booking", description: "Coach travel" },
    });
    assert.equal(created.statusCode, 201);
    assert.equal(created.json().data.displayOrder, 1);
    assert.equal(created.json().data.minMarginPercent, 10);
    assert.equal((await app.inject("/services")).json().data[0].id, "existing");
    rows[0].minMarginPercent = 12;
    const updated = await app.inject({
      method: "PATCH",
      url: "/services/existing",
      headers,
      payload: { description: "New description" },
    });
    assert.equal(updated.statusCode, 200);
    assert.equal(rows[0].minMarginPercent, 12);
  } finally {
    await app.close();
  }
});
const firstId = "71c15b2c-a1df-4f5a-8acd-9d1284abfd01";
const secondId = "71c15b2c-a1df-4f5a-8acd-9d1284abfd02";
function orderedRows(rows: any[]) {
  rows[0].id = firstId;
  rows.push({
    ...structuredClone(rows[0]),
    id: secondId,
    name: "Visas",
    slug: "visas",
    displayOrder: 1,
  });
}
test("saved order is used by public lists and invalidates the cache", async () => {
  const { app, rows } = setup();
  orderedRows(rows);
  const headers = { authorization: "SUPER_ADMIN" };
  try {
    const old = await app.inject("/services");
    const saved = await app.inject({
      method: "PUT",
      url: "/services/order",
      headers,
      payload: {
        serviceIds: [secondId, firstId],
        expectedServiceIds: [firstId, secondId],
      },
    });
    assert.equal(saved.statusCode, 200);
    const fresh = await app.inject({
      url: "/services",
      headers: { "if-none-match": old.headers.etag as string },
    });
    assert.equal(fresh.statusCode, 200);
    assert.deepEqual(
      fresh.json().data.map((s: any) => s.id),
      [secondId, firstId],
    );
    assert.deepEqual(
      (await app.inject({ url: "/services/manage", headers }))
        .json()
        .data.map((s: any) => s.id),
      [secondId, firstId],
    );
    const stale = await app.inject({
      method: "PUT",
      url: "/services/order",
      headers,
      payload: {
        serviceIds: [firstId, secondId],
        expectedServiceIds: [firstId, secondId],
      },
    });
    assert.equal(stale.statusCode, 409);
    assert.equal(rows.find((r) => r.id === secondId).displayOrder, 0);
  } finally {
    await app.close();
  }
});
test("partial, duplicate and unknown service orders do not modify the list", async () => {
  const { app, rows } = setup();
  orderedRows(rows);
  const headers = { authorization: "SUPER_ADMIN" };
  try {
    for (const ids of [
      [firstId],
      [firstId, firstId],
      [firstId, "71c15b2c-a1df-4f5a-8acd-9d1284abfd03"],
    ]) {
      const res = await app.inject({
        method: "PUT",
        url: "/services/order",
        headers,
        payload: { serviceIds: ids, expectedServiceIds: [firstId, secondId] },
      });
      assert.ok([400, 409].includes(res.statusCode));
      assert.deepEqual(
        rows.map((r) => r.displayOrder),
        [0, 1],
      );
    }
  } finally {
    await app.close();
  }
});
test("a failed reorder is atomic and leaves the previous cached order valid", async () => {
  const { app, rows, db } = setup();
  orderedRows(rows);
  const headers = { authorization: "SUPER_ADMIN" };
  const update = db.service.update;
  db.service.update = async (q: any) => {
    if (q.where.id === firstId) throw new Error("Simulated update failure");
    return update(q);
  };
  try {
    const cached = await app.inject("/services");
    const res = await app.inject({
      method: "PUT",
      url: "/services/order",
      headers,
      payload: {
        serviceIds: [secondId, firstId],
        expectedServiceIds: [firstId, secondId],
      },
    });
    assert.equal(res.statusCode, 500);
    assert.deepEqual(
      rows.map((r) => r.displayOrder),
      [0, 1],
    );
    assert.equal(
      (
        await app.inject({
          url: "/services",
          headers: { "if-none-match": cached.headers.etag as string },
        })
      ).statusCode,
      304,
    );
  } finally {
    await app.close();
  }
});
