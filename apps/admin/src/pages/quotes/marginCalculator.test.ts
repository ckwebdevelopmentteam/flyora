import { describe, it, expect } from "vitest";
import { calculateMargin, resolveServiceMinMargin } from "./marginCalculator";

describe("calculateMargin", () => {
  it("calculates healthy margin when margin percentage exceeds target", () => {
    // 2 flights: supplierCost = 20,000, sellingPrice = 25,000 each
    // Total cost = 40,000, Total price = 50,000
    // Gross margin = 10,000 (20.0%)
    // Target = 12%
    const result = calculateMargin({
      items: [{ supplierCost: 20000, sellingPrice: 25000, quantity: 2 }],
      minMarginPercent: 12.0,
    });

    expect(result.totalSupplierCost).toBe(40000);
    expect(result.totalSellingPrice).toBe(50000);
    expect(result.grossMarginAmount).toBe(10000);
    expect(result.marginPercent).toBe(20.0);
    expect(result.isHealthy).toBe(true);
    expect(result.shortfallAmount).toBe(0);
  });

  it("detects sub-target margin and accurately calculates required price shortfall", () => {
    // Cost = 90,000, Selling = 100,000
    // Margin = 10,000 (10.0%)
    // Target = 15.0%
    // Required price = 90,000 / (1 - 0.15) = 90,000 / 0.85 = 105,882.35 -> 105,883
    // Shortfall = 105,883 - 100,000 = 5,883
    const result = calculateMargin({
      items: [{ supplierCost: 90000, sellingPrice: 100000, quantity: 1 }],
      minMarginPercent: 15.0,
    });

    expect(result.totalSupplierCost).toBe(90000);
    expect(result.totalSellingPrice).toBe(100000);
    expect(result.grossMarginAmount).toBe(10000);
    expect(result.marginPercent).toBe(10.0);
    expect(result.isHealthy).toBe(false);
    expect(result.shortfallAmount).toBeGreaterThanOrEqual(5882);
    expect(result.shortfallAmount).toBeLessThanOrEqual(5884);
  });

  it("handles negative margin when priced below supplier cost", () => {
    // Loss case: Cost 50,000, Selling 45,000
    const result = calculateMargin({
      items: [{ supplierCost: 50000, sellingPrice: 45000, quantity: 1 }],
      minMarginPercent: 10.0,
    });

    expect(result.grossMarginAmount).toBe(-5000);
    expect(result.marginPercent).toBeLessThan(0);
    expect(result.isHealthy).toBe(false);
    expect(result.shortfallAmount).toBeGreaterThan(5000);
  });

  it("handles empty items safely without division by zero", () => {
    const result = calculateMargin({
      items: [],
      minMarginPercent: 12.0,
    });

    expect(result.totalSupplierCost).toBe(0);
    expect(result.totalSellingPrice).toBe(0);
    expect(result.grossMarginAmount).toBe(0);
    expect(result.marginPercent).toBe(0);
    expect(result.isHealthy).toBe(false);
    expect(result.shortfallAmount).toBe(0);
  });
});

describe("resolveServiceMinMargin", () => {
  it("resolves correct target margins by service category keywords", () => {
    expect(resolveServiceMinMargin("Dubai Holiday Tours")).toBe(12.0);
    expect(resolveServiceMinMargin("Express Visa Services")).toBe(20.0);
    expect(resolveServiceMinMargin("Domestic Flights")).toBe(5.0);
    expect(resolveServiceMinMargin("Deluxe Umrah Pilgrimage")).toBe(15.0);
    expect(resolveServiceMinMargin("5-Star Luxury Hotels")).toBe(10.0);
    expect(resolveServiceMinMargin(null)).toBe(12.0);
  });
});
