import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import fixture from "./__fixtures__/public-quote.json";
import { parsePublicQuote, type PublicQuote } from "./publicQuote";
import { QuoteProposal } from "./QuoteProposal";
import { QuoteLoading, QuoteNotFound, QuoteUnavailable } from "./QuoteStates";
import { getPublicQuote } from "./getPublicQuote";
import QuotePage, { generateMetadata } from "../../app/quote/[token]/page";
const { refresh, notFound } = vi.hoisted(() => ({
  refresh: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
  notFound,
}));
const now = Date.parse("2026-10-23T10:00:00Z");
const quote = () => parsePublicQuote(fixture, fixture.data.shareToken);
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
function show(overrides: Partial<PublicQuote> = {}) {
  render(
    <QuoteProposal quote={{ ...quote(), ...overrides }} initialNow={now} />,
  );
}

describe("customer proposal", () => {
  it("renders real proposal data, grouped services and quantity-adjusted line prices", () => {
    show();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Dubai Holiday",
    );
    expect(screen.getByText("Amina Test")).toBeTruthy();
    expect(screen.getAllByText("#FLY-2026-0042").length).toBeGreaterThan(0);
    expect(
      within(screen.getByRole("region", { name: "Flights" })).getByText(
        "₹56,000",
      ),
    ).toBeTruthy();
    expect(screen.getByText("₹1,19,500")).toBeTruthy();
    expect(screen.getByText("Daily breakfast")).toBeTruthy();
    expect(screen.getByText("Personal expenses")).toBeTruthy();
    expect(screen.queryByText("To be confirmed")).toBeNull();
  });
  it("keeps the customer, price and advisor clear without inventing terms", () => {
    show();
    expect(screen.getByText("Prepared for")).toBeTruthy();
    expect(screen.getByRole("complementary").textContent).toContain(
      "Total price",
    );
    expect(screen.getAllByText("Sara Test")).toHaveLength(1);
    expect(
      screen.queryByText(/All applicable taxes included|No hidden charges/),
    ).toBeNull();
  });
  it("omits empty inclusion lists and keeps long proposal content available", () => {
    const data = quote();
    show({
      inclusions: [],
      exclusions: [],
      items: Array.from({ length: 30 }, (_, i) => ({
        ...data.items[0],
        id: `item-${i}`,
        title: `Service ${i + 1}`,
      })),
    });
    expect(
      screen.queryByRole("region", { name: "What is included" }),
    ).toBeNull();
    expect(screen.getByText("Service 30")).toBeTruthy();
    expect(
      screen
        .getByRole("region", { name: "Proposal details" })
        .getAttribute("tabindex"),
    ).toBe("0");
  });
  it("uses the quoted service as the title when a single-item quote has no trip title", () => {
    const item = quote().items[0];
    show({ items: [item] });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      item.title,
    );
  });
  it("uses trip context when the public endpoint supplies it", () => {
    show({
      packageTitle: "Four nights in Dubai",
      travelDate: "2026-12-20T00:00:00Z",
      numberOfAdults: 2,
      numberOfKids: 1,
    });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Four nights in Dubai",
    );
    expect(screen.getByText("20 Dec 2026")).toBeTruthy();
    expect(screen.getByText("2 adults · 1 child")).toBeTruthy();
  });
  it("provides assigned-coordinator WhatsApp intent and phone links without changing quote status", () => {
    show();
    const link = screen.getByRole("link", {
      name: "Discuss & book",
    });
    const url = new URL(link.getAttribute("href")!);
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/919876543210");
    expect(url.searchParams.get("text")).toContain(
      "Hi Sara Test, I reviewed quotation #FLY-2026-0042 for Dubai Holiday.",
    );
    expect(url.searchParams.get("text")).not.toContain(fixture.data.shareToken);
    expect(
      screen.getByRole("link", { name: "Call advisor" }).getAttribute("href"),
    ).toBe("tel:+919876543210");
  });
  it("expired quotes request an update rather than offering confirmation", () => {
    show({ validUntil: "2026-10-01T12:00:00Z", isExpired: true });
    expect(screen.getByRole("status").textContent).toContain(
      "Expired on 1 Oct 2026",
    );
    expect(screen.queryByRole("link", { name: "Discuss & book" })).toBeNull();
    expect(
      new URL(
        screen
          .getByRole("link", { name: "Request new quote" })
          .getAttribute("href")!,
      ).searchParams.get("text"),
    ).toContain("updated quotation");
  });
  it("updates confirmation actions when a previously valid page expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    show({ validUntil: new Date(now + 10000).toISOString() });
    expect(screen.getByRole("link", { name: "Discuss & book" })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(screen.queryByRole("link", { name: "Discuss & book" })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Request new quote" }),
    ).toBeTruthy();
  });
  it.each(["DRAFT", "REJECTED", "ACCEPTED"] as const)(
    "does not offer new acceptance for a %s quotation",
    (status) => {
      show({ status });
      expect(screen.queryByRole("link", { name: "Discuss & book" })).toBeNull();
      expect(
        screen.getByRole("link", {
          name:
            status === "DRAFT"
              ? "Request final quote"
              : status === "REJECTED"
                ? "Request new quote"
                : "Discuss booking",
        }),
      ).toBeTruthy();
    },
  );
  it("never invents a number when coordinator contact is unavailable", () => {
    show({ coordinator: { fullName: "Sara Test", phone: null } });
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).toBeNull();
    expect(screen.queryByRole("link", { name: "Call advisor" })).toBeNull();
    expect(
      screen.getByText(/Contact your travel advisor to continue/),
    ).toBeTruthy();
  });
  it("prints only when explicitly requested", () => {
    const print = vi.fn();
    vi.stubGlobal("print", print);
    show();
    expect(print).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Save / Print PDF" }));
    expect(print).toHaveBeenCalledOnce();
  });
  it("escapes customer and item text, never injecting HTML", () => {
    const data = quote();
    data.customerName = '<img src=x onerror="alert(1)">';
    data.items[0].description = "<script>PRIVATE_CANARY</script>";
    const html = renderToStaticMarkup(
      <QuoteProposal quote={data} initialNow={now} />,
    );
    expect(html).not.toContain("<script>PRIVATE_CANARY</script>");
    expect(html).toContain("&lt;img");
    expect(html).not.toContain("supplierCost");
    expect(html).not.toContain("marginPercent");
    expect(html).not.toContain(fixture.data.shareToken);
  });
});

describe("route and edge states", () => {
  it("renders a branded loading state", () => {
    render(<QuoteLoading />);
    expect(screen.getByRole("status").textContent).toContain(
      "Preparing your Flyora proposal",
    );
    expect(screen.getByRole("main").getAttribute("aria-busy")).toBe("true");
  });
  it("shows a missing-link message without fake contact or proposal data", () => {
    render(<QuoteNotFound />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Quotation not found or link has expired",
    );
    expect(screen.queryByText("₹1,19,500")).toBeNull();
  });
  it("can retry an unavailable server request", () => {
    render(<QuoteUnavailable />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledOnce();
  });
  it("renders the async server page from the public response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(fixture))),
    );
    render(
      await QuotePage({
        params: Promise.resolve({ token: fixture.data.shareToken }),
      }),
    );
    expect(screen.getByText("Amina Test")).toBeTruthy();
    expect(generateMetadata().robots).toMatchObject({
      index: false,
      follow: false,
    });
  });
  it("uses the route's notFound boundary for a missing link", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Missing", { status: 404 })),
    );
    await expect(
      QuotePage({
        params: Promise.resolve({ token: fixture.data.shareToken }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledOnce();
  });
  it("keeps a rejected sensitive payload out of server-rendered output", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        async () =>
          new Response(
            JSON.stringify({
              ...fixture,
              data: { ...fixture.data, supplierCost: "PRIVATE_CANARY" },
            }),
          ),
      ),
    );
    expect(await getPublicQuote(fixture.data.shareToken)).toEqual({
      kind: "unavailable",
    });
    const html = renderToStaticMarkup(
      await QuotePage({
        params: Promise.resolve({ token: fixture.data.shareToken }),
      }),
    );
    expect(html).not.toContain("PRIVATE_CANARY");
    expect(html).not.toContain("Amina Test");
    expect(html).not.toContain("supplierCost");
  });
});
