import {
  bookingReferencePattern,
  parsePublicBooking,
  type PublicBooking,
} from "./publicBooking";

export type BookingResult =
  | { kind: "ready"; booking: PublicBooking }
  | { kind: "not-found" }
  | { kind: "unavailable" };

export async function getPublicBooking(
  reference: string,
): Promise<BookingResult> {
  if (!bookingReferencePattern.test(reference)) return { kind: "not-found" };
  try {
    const base = (
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api/v1"
    ).replace(/\/+$/, "");
    const url = new URL(
      `${base}/public/bookings/${encodeURIComponent(reference)}`,
    );
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return { kind: "unavailable" };
    const response = await fetch(url.toString(), {
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "application/json" },
    });
    if (response.status === 404 || response.status === 410)
      return { kind: "not-found" };
    if (!response.ok) return { kind: "unavailable" };
    return {
      kind: "ready",
      booking: parsePublicBooking(await response.json(), reference),
    };
  } catch {
    // Never log booking identifiers, customer data or upstream error payloads.
    return { kind: "unavailable" };
  }
}
