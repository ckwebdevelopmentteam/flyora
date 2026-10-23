import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateQuotationMargins } from "../src/modules/quotation/quotation.service";
import {
  createQuotationSchema,
  updateQuotationStatusSchema,
} from "@flyora/validators";
import { QuotationItem } from "@flyora/types";

describe("Module 5: Margin Guard Calculations", () => {
  it("correctly calculates margins when above target (Healthy Margin)", () => {
    const items: QuotationItem[] = [
      {
        id: "item-1",
        type: "FLIGHT",
        title: "BOM-DXB Return Flight",
        quantity: 2,
        supplierCost: 20000, // Total cost: 40,000
        sellingPrice: 25000, // Total price: 50,000
      },
      {
        id: "item-2",
        type: "HOTEL",
        title: "Novotel Al Barsha 4N",
        quantity: 1,
        supplierCost: 30000,
        sellingPrice: 40000,
      },
    ];

    // Total Cost: 40,000 + 30,000 = 70,000
    // Total Price: 50,000 + 40,000 = 90,000
    // Margin Amount: 20,000
    // Margin %: (20,000 / 90,000) * 100 = 22.22%
    // Target threshold: 12%
    const result = calculateQuotationMargins(items, 12);

    assert.equal(result.supplierCost, 70000);
    assert.equal(result.sellingPrice, 90000);
    assert.equal(result.marginAmount, 20000);
    assert.equal(result.marginPercent, 22.22);
    assert.equal(result.isHealthy, true);
    assert.equal(result.shortfallAmount, 0);
  });

  it("correctly detects sub-target margin and calculates price shortfall", () => {
    const items: QuotationItem[] = [
      {
        id: "item-1",
        type: "HOTEL",
        title: "Atlantis The Palm 3N",
        quantity: 1,
        supplierCost: 92000,
        sellingPrice: 100000, // Margin: 8,000 / 100,000 = 8.0%
      },
    ];

    // Target threshold: 12%
    // Required Price for 12% margin: 92,000 / (1 - 0.12) = 92,000 / 0.88 = 104,545.45
    // Shortfall: ~4,545.45
    const result = calculateQuotationMargins(items, 12);

    assert.equal(result.supplierCost, 92000);
    assert.equal(result.sellingPrice, 100000);
    assert.equal(result.marginAmount, 8000);
    assert.equal(result.marginPercent, 8.0);
    assert.equal(result.isHealthy, false);
    assert.ok(result.shortfallAmount > 4545 && result.shortfallAmount < 4546);
  });

  it("handles zero cost and empty items gracefully", () => {
    const result = calculateQuotationMargins([], 10);
    assert.equal(result.supplierCost, 0);
    assert.equal(result.sellingPrice, 0);
    assert.equal(result.marginAmount, 0);
    assert.equal(result.marginPercent, 0);
    assert.equal(result.isHealthy, false);
  });
});

describe("Module 5: Quotation Zod Schemas", () => {
  it("validates valid quotation payload", () => {
    const payload = {
      leadId: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
      items: [
        {
          type: "FLIGHT",
          title: "Emirates BOM-DXB",
          quantity: 2,
          supplierCost: 22000,
          sellingPrice: 26000,
        },
      ],
      inclusions: ["Baggage 30kg", "In-flight meals"],
      exclusions: ["Visa fee"],
      validUntil: "2026-11-01T00:00:00.000Z",
      notes: "Customer prefers window seats",
    };

    const parsed = createQuotationSchema.safeParse(payload);
    assert.equal(parsed.success, true);
  });

  it("rejects quotation with empty items array", () => {
    const payload = {
      leadId: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
      items: [],
      validUntil: "2026-11-01T00:00:00.000Z",
    };

    const parsed = createQuotationSchema.safeParse(payload);
    assert.equal(parsed.success, false);
  });

  it("validates quote status transitions", () => {
    assert.equal(
      updateQuotationStatusSchema.safeParse({ status: "SENT" }).success,
      true,
    );
    assert.equal(
      updateQuotationStatusSchema.safeParse({ status: "ACCEPTED" }).success,
      true,
    );
    assert.equal(
      updateQuotationStatusSchema.safeParse({ status: "INVALID_STATUS" })
        .success,
      false,
    );
  });
});
