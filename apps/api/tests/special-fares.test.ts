import { test, describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { SpecialFaresService } from "../src/modules/special-fares/special-fares.service";

describe("SpecialFaresService Unit & Contract Tests", () => {
  it("verifies public special fare DTO strips supplier costs and PNR numbers", async () => {
    const mockPrisma: any = {
      specialFareTicket: {
        count: async () => 1,
        findMany: async () => [
          {
            id: "ticket-123",
            airlineName: "Air India Express",
            airlineCode: "IX",
            flightNumber: "IX-345",
            originCity: "Kozhikode",
            originCode: "CCJ",
            destinationCity: "Dubai",
            destinationCode: "DXB",
            departureDate: new Date("2026-12-01T10:00:00Z"),
            arrivalDate: new Date("2026-12-01T14:00:00Z"),
            flightType: "NON_STOP",
            baggageInfo: "30 Kg Check-in + 7 Kg Cabin",
            availableSeats: 4,
            farePerSeat: 9200,
            expiresAt: new Date("2026-12-01T04:00:00Z"),
            metadata: { terminal: "T2" },
          },
        ],
      },
    };

    const mockFastify: any = { prisma: mockPrisma };
    const service = new SpecialFaresService(mockFastify);

    const result = await service.listPublicSpecialFares({});
    assert.equal(result.total, 1);
    assert.equal(result.items.length, 1);

    const item = result.items[0];
    assert.equal(item.id, "ticket-123");
    assert.equal(item.farePerSeat, 9200);
    assert.equal(item.availableSeats, 4);

    // CRITICAL SECURITY CHECKS: Cost and internal fields must NOT exist in public item
    assert.equal((item as any).supplierCost, undefined);
    assert.equal((item as any).pnrNumber, undefined);
    assert.equal((item as any).notes, undefined);
  });

  it("calculates accurate profit margins in admin listing", async () => {
    const mockPrisma: any = {
      specialFareTicket: {
        count: async () => 1,
        findMany: async () => [
          {
            id: "ticket-admin-1",
            airlineName: "Emirates",
            airlineCode: "EK",
            flightNumber: "EK-501",
            originCity: "Mumbai",
            originCode: "BOM",
            destinationCity: "Dubai",
            destinationCode: "DXB",
            departureDate: new Date("2026-12-05T08:00:00Z"),
            arrivalDate: new Date("2026-12-05T10:30:00Z"),
            flightType: "NON_STOP",
            baggageInfo: "35 Kg Check-in",
            totalSeats: 20,
            availableSeats: 5,
            farePerSeat: 15000,
            supplierCost: 10500,
            pnrNumber: "EMR-GRP-890",
            notes: "Direct airline allotment",
            metadata: null,
            expiresAt: new Date("2026-12-05T02:00:00Z"),
            status: "ACTIVE",
            isActive: true,
            displayOrder: 1,
            createdAt: new Date("2026-11-20T10:00:00Z"),
            updatedAt: new Date("2026-11-20T10:00:00Z"),
          },
        ],
      },
    };

    const mockFastify: any = { prisma: mockPrisma };
    const service = new SpecialFaresService(mockFastify);

    const result = await service.listAdminSpecialFares({});
    assert.equal(result.items.length, 1);

    const adminItem = result.items[0];
    assert.equal(adminItem.farePerSeat, 15000);
    assert.equal(adminItem.supplierCost, 10500);
    assert.equal(adminItem.pnrNumber, "EMR-GRP-890");

    // Margin = 15000 - 10500 = 4500 (30%)
    assert.equal(adminItem.marginAmount, 4500);
    assert.equal(adminItem.marginPercent, 30);
  });

  it("handles atomic seat decrements and marks SOLD_OUT when seats reach 0", async () => {
    let currentSeats = 1;
    let currentStatus = "ACTIVE";

    const mockPrisma: any = {
      specialFareTicket: {
        findUnique: async () => ({
          id: "ticket-seats-1",
          totalSeats: 10,
          availableSeats: currentSeats,
          status: currentStatus,
        }),
        update: async ({ data }: any) => {
          currentSeats = data.availableSeats;
          currentStatus = data.status;
          return {
            id: "ticket-seats-1",
            availableSeats: currentSeats,
            status: currentStatus,
          };
        },
      },
    };

    const mockFastify: any = { prisma: mockPrisma };
    const service = new SpecialFaresService(mockFastify);

    // Decrement by 1 seat
    const res = await service.updateSpecialFareSeats("ticket-seats-1", {
      change: -1,
    });
    assert.equal(res.availableSeats, 0);
    assert.equal(res.status, "SOLD_OUT");
  });
});
