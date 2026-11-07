import type { PublicQuotationView, QuoteStatus } from "@flyora/types";

// Reuse Dev 1's merged public contract, excluding the bearer link token from
// rendered props. Raw API responses are still validated and allowlisted below.
export type PublicQuote = Omit<PublicQuotationView, "shareToken"> & {
  // Optional trip context is not yet in Dev 1's public API; never invent it.
  packageTitle?: string;
  destination?: string;
  travelDate?: string;
  numberOfAdults?: number;
  numberOfKids?: number;
};

const categories = [
  "FLIGHT",
  "HOTEL",
  "VISA",
  "TRANSFER",
  "ACTIVITY",
  "OTHER",
] as const;
const statuses: QuoteStatus[] = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
];
const sensitiveKeys = new Set([
  "suppliercost",
  "marginamount",
  "marginpercent",
  "notes",
  "internalnotes",
]);
function assertPublic(value: unknown, depth = 0): void {
  if (depth > 25) throw new Error("Invalid public quotation");
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (sensitiveKeys.has(key.replace(/[_-]/g, "").toLowerCase()))
      throw new Error("Invalid public quotation");
    assertPublic(child, depth + 1);
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid public quotation");
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 2000): string {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new Error("Invalid public quotation");
  return value;
}
function price(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1e10
  )
    throw new Error("Invalid public quotation");
  return value;
}
function date(value: unknown): string {
  const result = text(value, 50);
  if (
    !/^\d{4}-\d{2}-\d{2}T/.test(result) ||
    !Number.isFinite(Date.parse(result))
  )
    throw new Error("Invalid public quotation");
  return result;
}
function strings(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 100)
    throw new Error("Invalid public quotation");
  return value.map((entry) => text(entry));
}
function count(value: unknown, min: number): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > 1000
  )
    throw new Error("Invalid public quotation");
  return value;
}

export function parsePublicQuote(payload: unknown, token: string): PublicQuote {
  // Audit before projecting: even hidden/internal nested objects must not enter RSC.
  assertPublic(payload);
  const quote = record(record(payload).data);
  if (
    quote.shareToken !== token ||
    !statuses.includes(quote.status as QuoteStatus) ||
    typeof quote.isExpired !== "boolean"
  )
    throw new Error("Invalid public quotation");
  if (
    !Array.isArray(quote.items) ||
    !quote.items.length ||
    quote.items.length > 100
  )
    throw new Error("Invalid public quotation");
  const items = quote.items.map((value) => {
    const item = record(value);
    if (!categories.includes(item.type as (typeof categories)[number]))
      throw new Error("Invalid public quotation");
    return {
      id: text(item.id, 100),
      type: item.type as (typeof categories)[number],
      title: text(item.title, 300),
      ...(item.description == null || item.description === ""
        ? {}
        : { description: text(item.description) }),
      quantity: count(item.quantity, 1),
      sellingPrice: price(item.sellingPrice),
    };
  });
  if (new Set(items.map((item) => item.id)).size !== items.length)
    throw new Error("Invalid public quotation");
  const totalPrice = price(quote.totalPrice);
  if (
    Math.abs(
      Math.round(totalPrice * 100) -
        items.reduce(
          (sum, item) =>
            sum + Math.round(item.sellingPrice * 100) * item.quantity,
          0,
        ),
    ) > 1
  )
    throw new Error("Invalid public quotation");
  const coordinator = record(quote.coordinator);
  return {
    quoteNumber: text(quote.quoteNumber, 100),
    status: quote.status as QuoteStatus,
    validUntil: date(quote.validUntil),
    createdAt: date(quote.createdAt),
    isExpired: quote.isExpired,
    customerName: text(quote.customerName, 200),
    serviceTitle: text(quote.serviceTitle, 200),
    serviceSlug: text(quote.serviceSlug, 200),
    totalPrice,
    items,
    inclusions: strings(quote.inclusions),
    exclusions: strings(quote.exclusions),
    coordinator: {
      fullName: text(coordinator.fullName, 200),
      ...(coordinator.phone == null || coordinator.phone === ""
        ? {}
        : { phone: text(coordinator.phone, 50) }),
    },
    ...(quote.packageTitle == null
      ? {}
      : { packageTitle: text(quote.packageTitle, 300) }),
    ...(quote.destination == null
      ? {}
      : { destination: text(quote.destination, 200) }),
    ...(quote.travelDate == null ? {} : { travelDate: date(quote.travelDate) }),
    ...(quote.numberOfAdults == null
      ? {}
      : { numberOfAdults: count(quote.numberOfAdults, 1) }),
    ...(quote.numberOfKids == null
      ? {}
      : { numberOfKids: count(quote.numberOfKids, 0) }),
  };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
export function formatQuoteDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}
export function coordinatorNumber(phone?: string | null): string | undefined {
  const digits = (phone || "").replace(/[+\s()-]/g, "");
  if (/^[1-9]\d{9}$/.test(digits)) return `91${digits}`;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : undefined;
}
export function quoteExpired(
  quote: Pick<PublicQuote, "isExpired" | "status" | "validUntil">,
  now: number,
): boolean {
  return (
    quote.isExpired ||
    quote.status === "EXPIRED" ||
    Date.parse(quote.validUntil) <= now
  );
}
