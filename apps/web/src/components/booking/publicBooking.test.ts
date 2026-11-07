import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "./__fixtures__/public-booking.json";
import { parsePublicBooking } from "./publicBooking";
import { getPublicBooking } from "./getPublicBooking";
import { bookingMetadata } from "./metadata";

const reference = fixture.data.bookingRef;
const payload = (changes: Record<string, unknown> = {}) => ({
  data: { ...fixture.data, ...changes },
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("public booking contract and privacy", () => {
  it("allowlists the shared public contract and discards unexpected fields", () => {
    const result = parsePublicBooking(
      payload({ debug: { customerId: "PRIVATE_ID" } }),
      reference,
    );
    expect(result).toEqual(fixture.data);
    expect(JSON.stringify(result)).not.toContain("PRIVATE_ID");
  });
  it.each([
    "supplierCost",
    "marginAmount",
    "marginPercent",
    "notes",
    "internal_notes",
    "payments",
    "transactionRef",
    "receiptFileKey",
    "receiptPresignedUrl",
    "downloadUrl",
    "accessToken",
    "refreshToken",
    "passwordHash",
  ])("rejects private %s fields at every depth", (key) => {
    expect(() =>
      parsePublicBooking(payload({ [key]: "PRIVATE_CANARY" }), reference),
    ).toThrow();
    expect(() =>
      parsePublicBooking(
        payload({ debug: { [key]: "PRIVATE_CANARY" } }),
        reference,
      ),
    ).toThrow();
  });
  it.each([NaN, Infinity, -1, "96000", null])(
    "rejects invalid money %s",
    (value) => {
      expect(() =>
        parsePublicBooking(payload({ totalAmount: value }), reference),
      ).toThrow();
    },
  );
  it("rejects mismatched references, invalid status/dates/items and inconsistent balances", () => {
    for (const change of [
      { bookingRef: "BK-2026-9999" },
      { status: "PAID" },
      { travelDate: "tomorrow" },
      { dueAmount: 1 },
      { isFullyPaid: true },
      { isFullyPaid: "false" },
      { itineraryItems: [{ ...fixture.data.itineraryItems[0], quantity: 0 }] },
      {
        itineraryItems: [{ ...fixture.data.itineraryItems[0], quantity: 1.5 }],
      },
      {
        itineraryItems: [
          { ...fixture.data.itineraryItems[0], type: "UNKNOWN" },
        ],
      },
    ])
      expect(() => parsePublicBooking(payload(change), reference)).toThrow();
  });
  it("accepts full and overpayment with zero balance as calculated by the API", () => {
    for (const paidAmount of [96000, 100000])
      expect(
        parsePublicBooking(
          payload({ paidAmount, dueAmount: 0, isFullyPaid: true }),
          reference,
        ).isFullyPaid,
      ).toBe(true);
  });
  it("accepts all four booking statuses and an itinerary still being prepared", () => {
    for (const status of ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
      expect(
        parsePublicBooking(payload({ status, itineraryItems: [] }), reference)
          .status,
      ).toBe(status);
  });
  it("uses generic metadata with no customer or booking reference, and disables indexing and referrers", () => {
    expect(bookingMetadata.robots).toMatchObject({
      index: false,
      follow: false,
      nocache: true,
    });
    expect(bookingMetadata.referrer).toBe("no-referrer");
    expect(JSON.stringify(bookingMetadata)).not.toContain(reference);
    expect(JSON.stringify(bookingMetadata)).not.toContain(
      fixture.data.customerName,
    );
  });
});

describe("anonymous public booking adapter", () => {
  it("fetches the configured public endpoint without cache, redirects or staff credentials", async () => {
    vi.stubEnv("API_INTERNAL_URL", "https://api.example.test/api/v1/");
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(fixture)));
    vi.stubGlobal("fetch", fetcher);
    expect(await getPublicBooking(reference)).toEqual({
      kind: "ready",
      booking: fixture.data,
    });
    expect(fetcher).toHaveBeenCalledExactlyOnceWith(
      `https://api.example.test/api/v1/public/bookings/${reference}`,
      expect.objectContaining({
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        headers: { Accept: "application/json" },
      }),
    );
  });
  it.each([404, 410])("maps %s to missing", async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Missing", { status })),
    );
    expect(await getPublicBooking(reference)).toEqual({ kind: "not-found" });
  });
  it.each([400, 401, 403, 429, 500, 503])(
    "maps %s to retry without exposing upstream error data",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("PRIVATE_ERROR", { status })),
      );
      expect(await getPublicBooking(reference)).toEqual({
        kind: "unavailable",
      });
    },
  );
  it("handles network, malformed JSON and sensitive responses safely", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValueOnce(new Error("PRIVATE_ERROR"))
        .mockResolvedValueOnce(new Response("PRIVATE_ERROR"))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(payload({ payments: [] }))),
        ),
    );
    for (let i = 0; i < 3; i++)
      expect(await getPublicBooking(reference)).toEqual({
        kind: "unavailable",
      });
  });
  it("never fetches invalid references or credential-bearing API URLs", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    for (const ref of [
      "",
      "../auth",
      "BK-2026-1",
      "https://example.test",
      "BK-2026-0042/secret",
      "BK-2026-0042?x=1",
    ])
      expect(await getPublicBooking(ref)).toEqual({ kind: "not-found" });
    vi.stubEnv("API_INTERNAL_URL", "https://user:secret@example.test/api/v1");
    expect(await getPublicBooking(reference)).toEqual({ kind: "unavailable" });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
