import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "./__fixtures__/public-quote.json";
import {
  parsePublicQuote,
  coordinatorNumber,
  formatPrice,
  quoteExpired,
  formatQuoteDate,
} from "./publicQuote";
import { getPublicQuote } from "./getPublicQuote";
import { quoteMetadata } from "./metadata";
const token = fixture.data.shareToken;
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("public quotation trust boundary", () => {
  it("projects the published public contract without forwarding the bearer token or extra fields", () => {
    const quote = parsePublicQuote(
      {
        ...fixture,
        data: {
          ...fixture.data,
          extra: { debug: "must not reach the client" },
        },
      },
      token,
    );
    expect(quote.totalPrice).toBe(119500);
    expect(quote.items[0]).toMatchObject({ quantity: 2, sellingPrice: 28000 });
    expect(quote).not.toHaveProperty("shareToken");
    expect(quote).not.toHaveProperty("extra");
    expect(quote).not.toHaveProperty("supplierCost");
  });
  it.each([
    "supplierCost",
    "marginAmount",
    "marginPercent",
    "notes",
    "internalNotes",
    "supplier_cost",
    "margin-percent",
  ])("rejects %s at any level", (key) => {
    const root = structuredClone(fixture);
    Object.assign(root.data, { [key]: "PRIVATE_CANARY" });
    expect(() => parsePublicQuote(root, token)).toThrow(
      "Invalid public quotation",
    );
    const nested = structuredClone(fixture);
    Object.assign(nested.data.items[0], {
      auxiliary: { [key]: "PRIVATE_CANARY" },
    });
    expect(() => parsePublicQuote(nested, token)).toThrow(
      "Invalid public quotation",
    );
  });
  it.each([NaN, Infinity, -1, "119500", null])(
    "rejects invalid prices %s",
    (value) => {
      expect(() =>
        parsePublicQuote(
          { ...fixture, data: { ...fixture.data, totalPrice: value } },
          token,
        ),
      ).toThrow();
    },
  );
  it("rejects incorrect totals, unknown statuses/categories, malformed dates, duplicate IDs and invalid quantities", () => {
    const changes = [
      { totalPrice: 1 },
      { status: "BOOKED" },
      { validUntil: "tomorrow" },
      { items: [{ ...fixture.data.items[0], type: "SECRET" }] },
      { items: [{ ...fixture.data.items[0], quantity: 0 }] },
      { items: [{ ...fixture.data.items[0], quantity: 1.5 }] },
      { items: [fixture.data.items[0], fixture.data.items[0]] },
      { items: [] },
    ];
    for (const change of changes)
      expect(() =>
        parsePublicQuote(
          { ...fixture, data: { ...fixture.data, ...change } },
          token,
        ),
      ).toThrow();
  });
  it("rejects another quotation's share token", () => {
    expect(() => parsePublicQuote(fixture, "different-token-value")).toThrow();
  });
  it("supports optional trip context without inventing missing information", () => {
    expect(parsePublicQuote(fixture, token).numberOfAdults).toBeUndefined();
    const quote = parsePublicQuote(
      {
        ...fixture,
        data: {
          ...fixture.data,
          destination: "Dubai",
          packageTitle: "Four nights in Dubai",
          travelDate: "2026-12-20T00:00:00.000Z",
          numberOfAdults: 2,
          numberOfKids: 0,
        },
      },
      token,
    );
    expect(quote).toMatchObject({
      destination: "Dubai",
      numberOfAdults: 2,
      numberOfKids: 0,
    });
  });
  it("formats Indian prices and dates consistently", () => {
    expect(formatPrice(119500)).toBe("₹1,19,500");
    expect(formatPrice(100.25)).toBe("₹100.25");
    expect(formatQuoteDate("2026-10-23T23:30:00.000Z")).toBe("24 Oct 2026");
  });
  it("only uses valid coordinator numbers and adds India's country code to ten-digit numbers", () => {
    expect(coordinatorNumber("9876543210")).toBe("919876543210");
    expect(coordinatorNumber("+91 (98765) 43210")).toBe("919876543210");
    for (const phone of [
      undefined,
      null,
      "",
      "call me",
      "javascript:alert(1)",
      "0000000000",
    ])
      expect(coordinatorNumber(phone)).toBeUndefined();
  });
  it("honors both explicit and clock-based expiry, including the exact deadline", () => {
    const quote = parsePublicQuote(fixture, token);
    expect(quoteExpired(quote, Date.parse(quote.validUntil) - 1)).toBe(false);
    expect(quoteExpired(quote, Date.parse(quote.validUntil))).toBe(true);
    expect(quoteExpired({ ...quote, isExpired: true }, 0)).toBe(true);
    expect(quoteExpired({ ...quote, status: "EXPIRED" }, 0)).toBe(true);
  });
});

describe("server public API adapter", () => {
  it("fetches only the configured public endpoint without caching or credentials", async () => {
    vi.stubEnv("API_INTERNAL_URL", "https://api.example.test/api/v1/");
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(fixture)));
    vi.stubGlobal("fetch", fetcher);
    const result = await getPublicQuote(token);
    expect(result.kind).toBe("ready");
    expect(fetcher).toHaveBeenCalledExactlyOnceWith(
      `https://api.example.test/api/v1/public/quotes/${token}`,
      expect.objectContaining({
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        headers: { Accept: "application/json" },
      }),
    );
    expect(fetcher.mock.calls[0][1].headers).not.toHaveProperty(
      "Authorization",
    );
  });
  it.each([404, 410])("maps HTTP %s to not-found", async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Missing", { status })),
    );
    expect(await getPublicQuote(token)).toEqual({ kind: "not-found" });
  });
  it.each([401, 403, 429, 500, 503])(
    "does not mislabel HTTP %s as an expired or missing quote",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("PRIVATE_CANARY", { status })),
      );
      expect(await getPublicQuote(token)).toEqual({ kind: "unavailable" });
    },
  );
  it("handles network and JSON failures without forwarding error content", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("PRIVATE_CANARY"))
      .mockResolvedValueOnce(new Response("PRIVATE_CANARY"));
    vi.stubGlobal("fetch", fetcher);
    expect(await getPublicQuote(token)).toEqual({ kind: "unavailable" });
    expect(await getPublicQuote(token)).toEqual({ kind: "unavailable" });
  });
  it("fails closed if the backend accidentally returns internal pricing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ...fixture,
            data: { ...fixture.data, supplierCost: 99999 },
          }),
        ),
      ),
    );
    expect(await getPublicQuote(token)).toEqual({ kind: "unavailable" });
  });
  it("does not fetch arbitrary or malformed share tokens", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    for (const value of [
      "",
      "short",
      "../private-path",
      "https://example.test/x",
      "%2fsecret",
      "a".repeat(129),
    ])
      expect(await getPublicQuote(value)).toEqual({ kind: "not-found" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("keeps customer data and token URLs out of metadata and disables indexing/referrers", () => {
    expect(quoteMetadata.robots).toMatchObject({
      index: false,
      follow: false,
      nocache: true,
    });
    expect(quoteMetadata.referrer).toBe("no-referrer");
    expect(JSON.stringify(quoteMetadata)).not.toContain(token);
    expect(JSON.stringify(quoteMetadata)).not.toContain(
      fixture.data.customerName,
    );
    expect(JSON.stringify(quoteMetadata)).not.toContain(
      String(fixture.data.totalPrice),
    );
  });
});
