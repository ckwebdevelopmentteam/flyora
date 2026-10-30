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

test("package enquiries reject drafts and mismatched services before creating customers or leads", async () => {
  const { app, db, saved } = setup();
  const packageId = "9fcdf946-37af-4b1b-a994-c5509a5605ae";
  let customerWrites = 0;
  db.customer.upsert = async () => {
    customerWrites++;
    return { id: "customer" };
  };
  try {
    for (const pkg of [
      null,
      { isPublished: false, serviceId },
      { isPublished: true, serviceId: "other" },
    ]) {
      db.package = { findUnique: async () => pkg };
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/public/enquiry",
        payload: {
          fullName: "Sana",
          phone: "0000000000",
          serviceId,
          packageId,
        },
      });
      assert.equal(res.statusCode, 400);
    }
    assert.equal(saved.length, 0);
    assert.equal(customerWrites, 0);
    db.package = {
      findUnique: async () => ({ id: packageId, serviceId, isPublished: true }),
    };
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/public/enquiry",
      payload: { fullName: "Sana", phone: "0000000000", serviceId, packageId },
    });
    assert.equal(res.statusCode, 201);
    assert.equal(saved[0].packageId, packageId);
    assert.equal(saved[0].serviceId, serviceId);
    assert.equal(saved[0].assignedToId, null);
  } finally {
    await app.close();
  }
});

test("service enquiries are only offered to staff mapped to the selected service", async () => {
  const { db } = setup();
  const queries: any[] = [];
  db.userService = {
    findMany: async ({ where }: any) =>
      where.userId === "holiday-staff"
        ? [{ serviceId }]
        : [{ serviceId: "flight-service" }],
  };
  db.lead.findMany = async (query: any) => {
    queries.push(query);
    return [];
  };
  const leads = new LeadsService({ prisma: db } as any);
  await leads.getCoordinatorLeadPool("holiday-staff", "SERVICE_COORDINATOR");
  await leads.getCoordinatorLeadPool("flight-staff", "SERVICE_COORDINATOR");
  assert.deepEqual(queries[0].where, {
    assignedToId: null,
    serviceId: { in: [serviceId] },
  });
  assert.deepEqual(queries[1].where, {
    assignedToId: null,
    serviceId: { in: ["flight-service"] },
  });
});
