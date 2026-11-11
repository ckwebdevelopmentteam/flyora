import React from "react";
vi.mock("@/components/ui/timeline", () => ({ default: () => null }));
vi.mock("@/components/ui/bento-gallery", () => ({ default: () => null }));
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ServicesPage from "./page";
import { useServicesCatalog } from "../../lib/use-services-catalog";
vi.mock("../../lib/use-services-catalog", () => ({
  useServicesCatalog: vi.fn(),
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));
vi.mock("../../components/layout/Navbar", () => ({ Navbar: () => null }));
vi.mock("../../components/layout/Footer", () => ({ Footer: () => null }));
vi.mock("../../components/FloatingWhatsApp", () => ({
  FloatingWhatsApp: () => null,
}));
vi.mock("../../components/EnquiryModal", () => ({
  EnquiryModal: (props: {
    isOpen: boolean;
    defaultServiceId?: string;
    defaultPackageId?: string;
    prefill?: unknown;
  }) =>
    props.isOpen ? (
      <div role="dialog" data-prefill={JSON.stringify(props.prefill)}>
        {props.defaultServiceId}:{props.defaultPackageId}
      </div>
    ) : null,
}));
const holiday = {
  id: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
  name: "Holiday Packages",
  slug: "holiday-packages",
  minMarginPercent: 10,
};
const visa = {
  id: "8fcdf946-37af-4b1b-a994-c5509a5605ae",
  name: "Visa Assistance",
  slug: "visa-assistance",
  minMarginPercent: 10,
};
const pkg = {
  id: "9fcdf946-37af-4b1b-a994-c5509a5605ae",
  serviceId: holiday.id,
  serviceName: holiday.name,
  title: "Bali Island Escape",
  slug: "bali-island-escape",
  destination: "Bali",
  durationDays: 5,
  durationNights: 4,
  startingPrice: 48000,
  coverImageUrl: "https://assets.example.com/bali.jpg",
  isPublished: true,
  isFeatured: false,
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify({ data }), { status });
beforeEach(() => {
  vi.mocked(useServicesCatalog).mockReturnValue({
    services: [holiday, visa],
    loaded: true,
    error: false,
    retry: async () => {},
  });
  window.history.replaceState(null, "", "/services");
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) =>
      options?.method === "POST"
        ? json({ success: true, leadId: "lead" }, 201)
        : url.includes("/packages")
          ? json({ items: [pkg], totalPages: 1 })
          : json([holiday, visa]),
    ),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("renders CMS packages with their image, rupee price, and itinerary link", async () => {
  render(<ServicesPage />);
  await screen.findByRole("link", { name: /View itinerary/ });
  expect(
    screen.getByRole("link", { name: /View itinerary/ }).getAttribute("href"),
  ).toBe("/tours/bali-island-escape");
  expect(screen.getByText(/₹\s?48,000/)).toBeDefined();
  expect(screen.getAllByAltText(pkg.title)[0].getAttribute("src")).toBe(
    pkg.coverImageUrl,
  );
  expect(screen.queryByText(/FLYHOLIDAY25/)).toBeNull();
  expect(screen.queryByRole("button", { name: "Enquire Now" })).toBeNull();
});
it("opens the connected enquiry modal with the chosen service and concierge details", async () => {
  render(<ServicesPage />);
  await screen.findByRole("button", { name: "Select Custom Holidays" });
  fireEvent.click(screen.getByRole("button", { name: "Request a Quote" }));
  const modal = screen.getByRole("dialog");
  expect(modal.textContent).toBe(`${holiday.id}:`);
  expect(JSON.parse(modal.getAttribute("data-prefill") || "{}")).toMatchObject({
    serviceId: holiday.id,
    serviceName: holiday.name,
    adults: 2,
  });
  expect(
    vi.mocked(fetch).mock.calls.some(([, opts]) => opts?.method === "POST"),
  ).toBe(false);
});

it("keeps holiday packages visible when the enquiry service changes", async () => {
  window.history.replaceState(null, "", "/services#visa-assistance");
  render(<ServicesPage />);
  await screen.findByRole("link", { name: /View itinerary/ });
  expect(
    screen.getByRole("heading", {
      name: "Hassle-Free Global Visa Approvals",
      level: 1,
    }),
  ).toBeDefined();
  fireEvent.click(
    screen.getByRole("button", { name: "Select Custom Holidays" }),
  );
  expect(screen.getByRole("link", { name: /View itinerary/ })).toBeDefined();
  fireEvent.click(
    screen.getByRole("button", { name: "Select Visa Assistance" }),
  );
  expect(screen.getByRole("link", { name: /View itinerary/ })).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Request a Quote" }));
  expect(screen.getByRole("dialog").textContent).toBe(`${visa.id}:`);
});

it("renders all 8 curated service cards in the hero section", async () => {
  render(<ServicesPage />);
  await screen.findByRole("button", { name: "Select Custom Holidays" });
  expect(
    screen.getByRole("button", { name: "Select Custom Holidays" }),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Select Visa Assistance" }),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Select Flight Booking" }),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Select Bus & Train Booking" }),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Select Hotel Booking" }),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Select Umrah & Hajj" }),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Select Passport Assistance" }),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Select Travel Insurance" }),
  ).toBeDefined();
});

it("does not invent package cards after a failed package request and can retry", async () => {
  vi.mocked(fetch).mockResolvedValue(json(null, 500));
  render(<ServicesPage />);
  await screen.findByRole("alert");
  expect(screen.queryByRole("link", { name: /View itinerary/ })).toBeNull();
  vi.mocked(fetch).mockResolvedValue(json({ items: [pkg], totalPages: 1 }));
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("link", { name: /View itinerary/ }),
  ).toBeDefined();
});
