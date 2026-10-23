import type { MarginCalculationResult } from "./types";

export interface CalculateMarginInput {
  items: Array<{
    supplierCost: number;
    sellingPrice: number;
    quantity: number;
  }>;
  minMarginPercent: number;
}

/**
 * Calculates line-item totals, gross margin amount, margin percentage,
 * and shortfall amount required to meet the service's minimum margin threshold.
 */
export function calculateMargin({
  items,
  minMarginPercent,
}: CalculateMarginInput): MarginCalculationResult {
  const safeThreshold = Math.max(0, Number(minMarginPercent) || 0);

  const totalSupplierCost = items.reduce((sum, item) => {
    const cost = Math.max(0, Number(item.supplierCost) || 0);
    const qty = Math.max(1, Number(item.quantity) || 1);
    return sum + cost * qty;
  }, 0);

  const totalSellingPrice = items.reduce((sum, item) => {
    const price = Math.max(0, Number(item.sellingPrice) || 0);
    const qty = Math.max(1, Number(item.quantity) || 1);
    return sum + price * qty;
  }, 0);

  const grossMarginAmount = totalSellingPrice - totalSupplierCost;

  const marginPercent =
    totalSellingPrice > 0 ? (grossMarginAmount / totalSellingPrice) * 100 : 0;

  // Margin is healthy if percentage meets or exceeds threshold
  const isHealthy =
    totalSellingPrice > 0 && marginPercent >= safeThreshold - 0.001;

  // Target required selling price to achieve minMarginPercent:
  // sellingPrice * (1 - threshold / 100) = supplierCost
  // => sellingPrice = supplierCost / (1 - threshold / 100)
  let shortfallAmount = 0;
  if (totalSupplierCost > 0 && safeThreshold < 100) {
    const requiredSellingPrice = totalSupplierCost / (1 - safeThreshold / 100);
    shortfallAmount = Math.max(
      0,
      Math.ceil(requiredSellingPrice - totalSellingPrice),
    );
  } else if (totalSupplierCost > 0 && totalSellingPrice < totalSupplierCost) {
    shortfallAmount = totalSupplierCost - totalSellingPrice;
  }

  return {
    totalSupplierCost,
    totalSellingPrice,
    grossMarginAmount,
    marginPercent: Number(marginPercent.toFixed(1)),
    minMarginPercent: safeThreshold,
    isHealthy,
    shortfallAmount,
  };
}

/**
 * Resolves standard minimum margin threshold based on service name or slug.
 */
export function resolveServiceMinMargin(
  serviceNameOrSlug?: string | null,
  fallback = 12.0,
): number {
  if (!serviceNameOrSlug) return fallback;
  const s = serviceNameOrSlug.toLowerCase();
  if (s.includes("visa")) return 20.0;
  if (s.includes("flight") || s.includes("air")) return 5.0;
  if (s.includes("umrah") || s.includes("hajj")) return 15.0;
  if (s.includes("hotel")) return 10.0;
  if (
    s.includes("holiday") ||
    s.includes("tour") ||
    s.includes("package") ||
    s.includes("escape")
  )
    return 12.0;
  return fallback;
}
