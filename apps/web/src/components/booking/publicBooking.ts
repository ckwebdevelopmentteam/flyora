import type { PublicBookingView } from "@flyora/types";

export type PublicBooking = PublicBookingView;
export const bookingReferencePattern = /^BK-\d{4}-\d{4,10}$/;

const statuses = ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const categories = ["FLIGHT", "HOTEL", "VISA", "TRANSFER", "ACTIVITY", "OTHER"];
const privateKeys = new Set([
  "suppliercost",
  "marginamount",
  "marginpercent",
  "notes",
  "internalnotes",
  "payments",
  "transactionref",
  "receiptfilekey",
  "receiptpresignedurl",
  "downloadurl",
  "accesstoken",
  "refreshtoken",
  "passwordhash",
]);

function audit(value: unknown, depth = 0): void {
  if (depth > 25) throw new Error("Invalid public booking");
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (privateKeys.has(key.replace(/[_-]/g, "").toLowerCase()))
      throw new Error("Invalid public booking");
    audit(child, depth + 1);
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid public booking");
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 2000): string {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new Error("Invalid public booking");
  return value;
}
function date(value: unknown): string {
  const result = text(value, 50);
  if (
    !/^\d{4}-\d{2}-\d{2}T/.test(result) ||
    !Number.isFinite(Date.parse(result))
  )
    throw new Error("Invalid public booking");
  return result;
}
function money(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1e10
  )
    throw new Error("Invalid public booking");
  return value;
}
function strings(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 100)
    throw new Error("Invalid public booking");
  return value.map((item) => text(item));
}

export function parsePublicBooking(
  payload: unknown,
  reference: string,
): PublicBooking {
  audit(payload);
  const booking = record(record(payload).data);
  if (
    !bookingReferencePattern.test(reference) ||
    booking.bookingRef !== reference ||
    !statuses.includes(booking.status as string)
  )
    throw new Error("Invalid public booking");
  const totalAmount = money(booking.totalAmount);
  const paidAmount = money(booking.paidAmount);
  const dueAmount = money(booking.dueAmount);
  const dueCents = Math.round(dueAmount * 100);
  const expectedDue = Math.max(
    0,
    Math.round(totalAmount * 100) - Math.round(paidAmount * 100),
  );
  if (
    Math.abs(dueCents - expectedDue) > 1 ||
    typeof booking.isFullyPaid !== "boolean" ||
    booking.isFullyPaid !== (dueCents === 0)
  )
    throw new Error("Invalid public booking");
  if (
    !Array.isArray(booking.itineraryItems) ||
    booking.itineraryItems.length > 100
  )
    throw new Error("Invalid public booking");
  const itineraryItems = booking.itineraryItems.map((value) => {
    const item = record(value);
    if (
      !categories.includes(item.type as string) ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10000
    )
      throw new Error("Invalid public booking");
    return {
      title: text(item.title, 300),
      type: item.type as string,
      quantity: item.quantity,
      ...(item.description == null || item.description === ""
        ? {}
        : { description: text(item.description) }),
    };
  });
  const coordinator = record(booking.coordinator);
  return {
    bookingRef: reference,
    status: booking.status as PublicBooking["status"],
    travelDate: date(booking.travelDate),
    createdAt: date(booking.createdAt),
    customerName: text(booking.customerName, 200),
    serviceTitle: text(booking.serviceTitle, 200),
    serviceSlug: text(booking.serviceSlug, 200),
    totalAmount,
    paidAmount,
    dueAmount,
    isFullyPaid: booking.isFullyPaid,
    itineraryItems,
    inclusions: strings(booking.inclusions),
    exclusions: strings(booking.exclusions),
    coordinator: {
      fullName: text(coordinator.fullName, 200),
      ...(coordinator.phone == null || coordinator.phone === ""
        ? {}
        : { phone: text(coordinator.phone, 50) }),
    },
  };
}
