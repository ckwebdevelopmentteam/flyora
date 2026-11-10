import { test } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { packagesRoutes } from "../src/modules/packages/packages.controller";
const serviceId = "d9f3e000-8bca-4cd9-986d-277d4ecf8031";
const input = {
  serviceId,
  title: "Kerala backwaters",
  destination: "Alleppey, India",
  destinationType: "DOMESTIC",
  durationDays: 3,
  durationNights: 2,
  startingPrice: 25000,
  coverImageUrl: "https://assets.example.com/kerala.jpg",
  overview: "Three days in the backwaters of Kerala.",
  itinerary: [
    { day: 1, title: "Arrival", description: "Arrive and check in." },
  ],
};
function setup() {
  const rows: any[] = [];
  const app = Fastify();
  app.decorate("authenticate", async (req: any, reply: any) => {
    if (!req.headers.authorization) return reply.code(401).send({});
    req.user = { role: req.headers.authorization };
  });
  const matching = (where: any) =>
    rows.filter(
      (p) =>
        (where.destinationType === undefined ||
          p.destinationType === where.destinationType) &&
        (where.isPublished === undefined ||
          p.isPublished === where.isPublished) &&
        (!where.service || p.service.isActive),
    );
  app.decorate("prisma", {
    package: {
      findUnique: async ({ where }: any) =>
        rows.find((p) =>
          where.id ? p.id === where.id : p.slug === where.slug,
        ),
      create: async ({ data }: any) => {
        const row = {
          ...data,
          id: "d9f3e000-8bca-4cd9-986d-277d4ecf8032",
          createdAt: new Date(),
          updatedAt: new Date(),
          service: { name: "Holiday Packages", isActive: true },
        };
        rows.push(row);
        return row;
      },
      update: async ({ where, data }: any) =>
        Object.assign(
          rows.find((p) => p.id === where.id),
          data,
        ),
      findMany: async ({ where }: any) => matching(where),
      count: async ({ where }: any) => matching(where).length,
    },
  } as any);
  app.register(packagesRoutes, { prefix: "/packages" });
  return { app, rows };
}
test("destination type is required and only valid categories can be saved", async () => {
  const { app, rows } = setup();
  try {
    for (const destinationType of [undefined, "OVERSEAS", null, ""]) {
      const res = await app.inject({
        method: "POST",
        url: "/packages",
        headers: { authorization: "SUPER_ADMIN" },
        payload: { ...input, destinationType },
      });
      assert.equal(res.statusCode, 400);
      assert.match(res.json().message, /Choose Domestic or International/);
    }
    assert.equal(rows.length, 0);
  } finally {
    await app.close();
  }
});
test("create, edit, details and public filtering preserve the classification", async () => {
  const { app, rows } = setup();
  const headers = { authorization: "SUPER_ADMIN" };
  try {
    const created = await app.inject({
      method: "POST",
      url: "/packages",
      headers,
      payload: input,
    });
    assert.equal(created.statusCode, 201);
    assert.equal(created.json().data.destinationType, "DOMESTIC");
    const domestic = await app.inject("/packages?destinationType=DOMESTIC");
    assert.equal(domestic.json().data.items[0].destinationType, "DOMESTIC");
    assert.equal(domestic.json().data.items[0].overview, input.overview);
    assert.equal(
      (await app.inject("/packages?destinationType=INTERNATIONAL")).json().data
        .total,
      0,
    );
    const changed = await app.inject({
      method: "PUT",
      url: `/packages/${rows[0].id}`,
      headers,
      payload: { destinationType: "INTERNATIONAL" },
    });
    assert.equal(changed.statusCode, 200);
    assert.equal(changed.json().data.destinationType, "INTERNATIONAL");
    assert.equal(
      (await app.inject(`/packages/${rows[0].slug}`)).json().data
        .destinationType,
      "INTERNATIONAL",
    );
    assert.equal(
      (await app.inject("/packages?destinationType=DOMESTIC")).json().data
        .total,
      0,
    );
    assert.equal(
      (await app.inject("/packages?destinationType=INTERNATIONAL")).json().data
        .total,
      1,
    );
    rows[0].isPublished = false;
    assert.equal(
      (await app.inject("/packages?destinationType=INTERNATIONAL")).json().data
        .total,
      0,
    );
    rows[0].isPublished = true;
    rows[0].service.isActive = false;
    assert.equal(
      (await app.inject("/packages?destinationType=INTERNATIONAL")).json().data
        .total,
      0,
    );
    assert.equal(
      (await app.inject("/packages?destinationType=INVALID")).statusCode,
      400,
    );
  } finally {
    await app.close();
  }
});
