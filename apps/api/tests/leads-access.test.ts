import { test } from "node:test";
import assert from "node:assert/strict";
import { LeadsService } from "../src/modules/leads/leads.service";
const lead = { id: "lead", assignedToId: "owner", serviceId: "holidays" };
function fixture(role = "SERVICE_COORDINATOR") {
  const calls: any[] = [];
  const db: any = {
    user: {
      findUnique: async () => ({
        id: "owner",
        role,
        isActive: true,
        services: [{ serviceId: "holidays" }],
      }),
    },
    lead: {
      findUnique: async () => lead,
      updateMany: async (arg: any) => {
        calls.push(arg);
        return { count: 0 };
      },
    },
    userService: { findMany: async () => [{ serviceId: "holidays" }] },
    leadActivity: { create: async () => {} },
  };
  return { db, calls, service: new LeadsService({ prisma: db } as any) };
}
test("admins can inspect enquiries but cannot work or claim them", async () => {
  const { service, calls } = fixture("SUPER_ADMIN");
  await service.assertLeadAccess("lead", "admin", "SUPER_ADMIN");
  await assert.rejects(
    service.assertLeadAccess("lead", "admin", "SUPER_ADMIN", true),
    (e: any) => e.statusCode === 403,
  );
  await assert.rejects(
    service.takeLead("lead", "admin"),
    (e: any) => e.statusCode === 403,
  );
  assert.equal(calls.length, 0);
});
test("staff can only read or update their own enquiries", async () => {
  const { service } = fixture();
  await service.assertLeadAccess("lead", "owner", "SERVICE_COORDINATOR", true);
  await assert.rejects(
    service.assertLeadAccess("lead", "other", "SERVICE_COORDINATOR"),
    (e: any) => e.statusCode === 403,
  );
  await assert.rejects(
    service.assertLeadAccess("lead", "content", "CONTENT_MANAGER"),
    (e: any) => e.statusCode === 403,
  );
});
test("atomic claim restricts service and cannot overwrite a taken enquiry", async () => {
  const { service, calls } = fixture();
  await assert.rejects(
    service.takeLead("lead", "owner"),
    (e: any) => e.statusCode === 409,
  );
  assert.equal(calls[0].where.assignedToId, null);
  assert.deepEqual(calls[0].where.serviceId, { in: ["holidays"] });
});
test("All includes taken enquiries only within the staff member's services", async () => {
  const { service, db } = fixture();
  let query: any;
  db.lead.findMany = async (arg: any) => {
    query = arg;
    return [];
  };
  await service.getCoordinatorLeadPool("owner", "SERVICE_COORDINATOR", true);
  assert.deepEqual(query.where.serviceId, { in: ["holidays"] });
  assert.equal("assignedToId" in query.where, false);
  await service.getCoordinatorLeadPool("owner", "SERVICE_COORDINATOR");
  assert.equal(query.where.assignedToId, null);
});
