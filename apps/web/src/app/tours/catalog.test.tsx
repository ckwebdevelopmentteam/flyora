import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ToursPage from "./page";
import TourDetailPage from "./[slug]/page";
vi.mock("next/navigation", () => ({ useParams: () => ({ slug: "bali" }) }));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span>{alt}</span>,
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
  }) =>
    props.isOpen ? (
      <div role="dialog">
        {props.defaultServiceId}:{props.defaultPackageId}
      </div>
    ) : null,
}));
const pkg = {
  id: "package",
  serviceId: "holiday-service",
  serviceName: "Holidays",
  title: "Bali Escape",
  slug: "bali",
  destination: "Bali",
  startingPrice: 48000,
  durationDays: 5,
  durationNights: 4,
  itinerary: [{ day: 1, title: "Arrival", description: "Transfer to hotel" }],
  inclusions: ["Four nights accommodation"],
  exclusions: ["Flights"],
  galleryImageUrls: [],
};
beforeEach(() =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ data: pkg }))),
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("shows real itinerary content instead of an unrelated fallback and passes the package service into enquiries", async () => {
  render(<TourDetailPage />);
  await screen.findByText("Transfer to hotel");
  expect(screen.queryByText("Loading itinerary…")).toBeNull();
  fireEvent.click(
    screen.getAllByRole("button", { name: /customize|enquire|quote/i })[0],
  );
  expect(screen.getByRole("dialog").textContent).toBe(
    "holiday-service:package",
  );
});
it("an unavailable package never substitutes a different sample trip", async () => {
  vi.mocked(fetch).mockResolvedValue(new Response("{}", { status: 404 }));
  render(<TourDetailPage />);
  await screen.findByText("This package is no longer available.");
  expect(screen.queryByText(/Dubai Family Luxury/)).toBeNull();
});
it("the catalogue honours an empty backend instead of showing bundled sample trips", async () => {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify({ data: { items: [], totalPages: 0 } })),
  );
  render(<ToursPage />);
  await screen.findByText(/No .*found/i);
  expect(screen.queryByText("Loading packages…")).toBeNull();
  expect(screen.queryByText(/Dubai Family Luxury/)).toBeNull();
});
