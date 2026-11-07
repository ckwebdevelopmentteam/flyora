import { test } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { publicEnquiryRoutes } from "../src/modules/leads/leads.controller";
import { LeadsService } from "../src/modules/leads/leads.service";
const serviceId = "7fcdf946-37af-4b1b-a994-c5509a5605ae";
function setup(active = true) {
  const saved: any[] = [];
  const service = {
    id: serviceId,
    name: "Holidays",
    isActive: active,
    coordinators: [],
  };
  const db: any = {
    service: { findUnique: async () => service },
    customer: {
      upsert: async () => ({
        id: "customer",
        fullName: "Sana",
        phone: "0000000000",
      }),
    },
    lead: {
      create: async (q: any) => {
        saved.push(q.data);
        return { id: "lead" };
      },
    },
  };
  const app = Fastify();
  app.decorate("prisma", db);
  app.register(publicEnquiryRoutes, { prefix: "/api/v1/public" });
  return { app, db, saved };
}
test("public contact messages are persisted with the correct CMS service and source", async () => {
  const { app, saved } = setup();
  try {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/public/enquiry",
      payload: {
        fullName: "Sana",
        phone: "0000000000",
        serviceId,
        notes: "  Bali trip.\nVegetarian meals, please.  ",
      },
    });
    assert.equal(res.statusCode, 201);
    assert.equal(res.json().data.success, true);
    assert.deepEqual(saved[0], {
      customerId: "customer",
      serviceId,
      packageId: null,
      assignedToId: null,
      status: "NEW",
      source: "WEBSITE_FORM",
      customerNotes: "Bali trip.\nVegetarian meals, please.",
      travelDate: null,
      numberOfAdults: 1,
      numberOfKids: 0,
    });
  } finally {
    await app.close();
  }
});
test("inactive services and oversized messages do not create enquiries", async () => {
  const { app, saved } = setup(false);
  try {
    for (const notes of ["A holiday", "x".repeat(1001)]) {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/public/enquiry",
        payload: { fullName: "Sana", phone: "0000000000", serviceId, notes },
      });
      assert.equal(res.statusCode, 400);
    }
    assert.equal(saved.length, 0);
  } finally {
    await app.close();
  }
});
test("staff can read their customer messages while the shared pool hides other messages", async () => {
  const { db } = setup();
  const date = new Date();
  const row = {
    id: "lead",
    customerId: "customer",
    customer: { id: "customer", fullName: "Sana", phone: "0000000000" },
    serviceId,
    service: { name: "Holidays" },
    status: "NEW",
    source: "WEBSITE_FORM",
    numberOfAdults: 1,
    numberOfKids: 0,
    createdAt: date,
    updatedAt: date,
    customerNotes: "Customer request",
    assignedToId: "owner",
  };
  db.lead.findMany = async () => [row];
  db.userService = { findMany: async () => [{ serviceId }] };
  const service = new LeadsService({ prisma: db } as any);
  assert.equal(
    (await service.getMyLeads("owner"))[0].customerNotes,
    "Customer request",
  );
  assert.equal(
    "customerNotes" in
      (
        await service.getCoordinatorLeadPool(
          "other",
          "SERVICE_COORDINATOR",
          true,
        )
      )[0],
    false,
  );
});
