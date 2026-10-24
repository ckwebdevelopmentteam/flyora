import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import fixture from "./__fixtures__/public-booking.json";
import { parsePublicBooking, type PublicBooking } from "./publicBooking";
import { BookingVoucher } from "./BookingVoucher";
import {
  BookingNotFound,
  BookingUnavailable,
  BookingLoading,
} from "./BookingStates";
import BookingPage, {
  generateMetadata,
} from "../../app/booking/[bookingRef]/page";
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
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
const booking = () => parsePublicBooking(fixture, fixture.data.bookingRef);
const show = (changes: Partial<PublicBooking> = {}) =>
  render(<BookingVoucher booking={{ ...booking(), ...changes }} />);

describe("customer digital voucher", () => {
  it("shows real itinerary, date and verified balance without inventing missing trip details", () => {
    show();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Dubai Holiday",
    );
    expect(screen.getAllByText("Amina Voucher Test").length).toBeGreaterThan(0);
    for (const value of [
      "₹96,000",
      "₹40,000",
      "₹56,000",
      "20 Dec 2026",
      "Quantity: 2",
      "Partially paid",
    ])
      expect(screen.getByText(value)).toBeTruthy();
    expect(
      screen
        .getByRole("progressbar", { name: "Verified payment progress" })
        .getAttribute("value"),
    ).toBe(String((40000 / 96000) * 100));
    expect(screen.getByText(/Only payments verified by Flyora/)).toBeTruthy();
    expect(screen.queryByText("Fully Paid & Verified")).toBeNull();
  });
  it("shows a verified fully-paid badge and clamps overpayment progress to 100%", () => {
    show({ paidAmount: 100000, dueAmount: 0, isFullyPaid: true });
    expect(screen.getByText("Fully Paid & Verified")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("value")).toBe("100");
  });
  it("shows an unpaid state when there are no verified payments", () => {
    show({ paidAmount: 0, dueAmount: 96000 });
    expect(screen.getByText("Awaiting verified payment")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("value")).toBe("0");
  });
  it.each(["IN_PROGRESS", "COMPLETED"] as const)(
    "supports the %s booking status",
    (status) => {
      show({ status });
      expect(
        screen.getByText(status === "COMPLETED" ? "Completed" : "In progress"),
      ).toBeTruthy();
    },
  );
  it("makes cancellation unambiguous and does not present it as active or fully paid", () => {
    show({
      status: "CANCELLED",
      paidAmount: 96000,
      dueAmount: 0,
      isFullyPaid: true,
    });
    expect(screen.getByRole("alert").textContent).toContain(
      "not an active travel confirmation",
    );
    expect(screen.getByText("Cancelled")).toBeTruthy();
    expect(screen.queryByText("Fully Paid & Verified")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Original itinerary & services" }),
    ).toBeTruthy();
  });
  it("opens coordinator contact intents with the right reference and phone without mutating the booking", () => {
    show();
    const link = screen.getByRole("link", {
      name: "Chat with Coordinator on WhatsApp",
    });
    const url = new URL(link.getAttribute("href")!);
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/919876543210");
    expect(url.searchParams.get("text")).toContain(
      "BK-2026-0042 for Dubai Holiday",
    );
    expect(
      screen.getByRole("link", { name: "Emergency Call" }).getAttribute("href"),
    ).toBe("tel:+919876543210");
  });
  it("never invents coordinator contact numbers", () => {
    show({ coordinator: { fullName: "Sara", phone: null } });
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).toBeNull();
    expect(screen.queryByRole("link", { name: "Emergency Call" })).toBeNull();
  });
  it("prints only on a user click and refreshes payment status explicitly", () => {
    const print = vi.fn();
    vi.stubGlobal("print", print);
    show();
    expect(print).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Print / Save PDF Voucher" }),
    );
    expect(print).toHaveBeenCalledOnce();
    fireEvent.click(
      screen.getByRole("button", { name: "Refresh payment status" }),
    );
    expect(refresh).toHaveBeenCalledOnce();
  });
  it("escapes customer text and renders an honest empty itinerary", () => {
    const html = renderToStaticMarkup(
      <BookingVoucher
        booking={{
          ...booking(),
          customerName: '<img src=x onerror="alert(1)">',
          itineraryItems: [],
        }}
      />,
    );
    expect(html).toContain("&lt;img");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("share the detailed itinerary");
    for (const key of [
      "supplierCost",
      "marginAmount",
      "receiptFileKey",
      "transactionRef",
    ])
      expect(html).not.toContain(key);
  });
});
describe("booking route and boundaries", () => {
  it("renders branded loading and missing states", () => {
    render(<BookingLoading />);
    expect(screen.getByRole("status").textContent).toContain("trip voucher");
    cleanup();
    render(<BookingNotFound />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Booking reference not found",
    );
  });
  it("offers a safe retry after an upstream failure", () => {
    render(<BookingUnavailable />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledOnce();
  });
  it("renders the actual asynchronous route using the public response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(fixture))),
    );
    render(
      await BookingPage({
        params: Promise.resolve({ bookingRef: fixture.data.bookingRef }),
      }),
    );
    expect(screen.getByText("₹96,000")).toBeTruthy();
    expect(generateMetadata().robots).toMatchObject({
      index: false,
      follow: false,
    });
  });
  it("uses the route notFound boundary for missing references", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Missing", { status: 404 })),
    );
    await expect(
      BookingPage({
        params: Promise.resolve({ bookingRef: fixture.data.bookingRef }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
  it("never renders a sensitive upstream response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: { ...fixture.data, receiptFileKey: "PRIVATE_CANARY" },
          }),
        ),
      ),
    );
    const html = renderToStaticMarkup(
      await BookingPage({
        params: Promise.resolve({ bookingRef: fixture.data.bookingRef }),
      }),
    );
    expect(html).not.toContain("PRIVATE_CANARY");
    expect(html).not.toContain(fixture.data.customerName);
    expect(html).toContain("We couldn");
  });
});
