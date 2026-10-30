import { test } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { packagesRoutes } from "../src/modules/packages/packages.controller";
import { packageFilterSchema } from "@flyora/validators";
function setup() {
  const queries: any[] = [];
  const pkg = {
    id: "package",
    serviceId: "service",
    title: "Bali",
    slug: "bali",
    service: { name: "Holidays", isActive: true },
    isPublished: false,
    startingPrice: 48000,
    createdAt: new Date(),
    updatedAt: new Date(),
    keywords: [],
    itinerary: [],
    inclusions: [],
    exclusions: [],
    galleryImageUrls: [],
  };
  const app = Fastify();
  app.decorate("authenticate", async (request: any, reply: any) => {
    const role = request.headers.authorization;
    if (!role) return reply.code(401).send({ message: "Sign in" });
    request.user = { id: "user", role };
  });
  app.decorate("prisma", {
    package: {
      findMany: async (query: any) => {
        queries.push(query);
        return [];
      },
      count: async () => 0,
      findUnique: async () => pkg,
    },
  } as any);
  app.register(packagesRoutes, { prefix: "/packages" });
  return { app, queries, pkg };
}
test("public lists use published packages from active services and parse false query flags correctly", async () => {
  assert.equal(
    packageFilterSchema.parse({
      includeUnpublished: "false",
      featuredOnly: "false",
    }).includeUnpublished,
    false,
  );
  assert.equal(
    packageFilterSchema.safeParse({ includeUnpublished: "anything" }).success,
    false,
  );
  const { app, queries } = setup();
  try {
    const res = await app.inject(
      "/packages?includeUnpublished=false&featuredOnly=false",
    );
    assert.equal(res.statusCode, 200);
    assert.deepEqual(queries[0].where, {
      isPublished: true,
      service: { isActive: true },
    });
  } finally {
    await app.close();
  }
});
test("draft listings require an admin role while admin editing keeps access", async () => {
  const { app, queries } = setup();
  try {
    assert.equal(
      (await app.inject("/packages?includeUnpublished=true")).statusCode,
      401,
    );
    assert.equal(
      (
        await app.inject({
          url: "/packages?includeUnpublished=true",
          headers: { authorization: "SERVICE_COORDINATOR" },
        })
      ).statusCode,
      403,
    );
    assert.equal(queries.length, 0);
    assert.equal(
      (
        await app.inject({
          url: "/packages?includeUnpublished=true",
          headers: { authorization: "SUPER_ADMIN" },
        })
      ).statusCode,
      200,
    );
    assert.deepEqual(queries[0].where, {});
  } finally {
    await app.close();
  }
});
test("draft and inactive-service detail pages stay private but admins can preview them", async () => {
  const { app, pkg } = setup();
  try {
    assert.equal((await app.inject("/packages/bali")).statusCode, 404);
    assert.equal(
      (
        await app.inject({
          url: "/packages/bali",
          headers: { authorization: "SUPER_ADMIN" },
        })
      ).statusCode,
      200,
    );
    pkg.isPublished = true;
    assert.equal((await app.inject("/packages/bali")).statusCode, 200);
    pkg.service.isActive = false;
    assert.equal((await app.inject("/packages/bali")).statusCode, 404);
  } finally {
    await app.close();
  }
});
