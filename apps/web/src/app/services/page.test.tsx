import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
  }) =>
    props.isOpen ? (
      <div role="dialog">
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
  isFeatured: true,
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
it("renders CMS packages with their image, rupee price, itinerary link and exact enquiry category", async () => {
  render(<ServicesPage />);
  await screen.findByRole("link", { name: "View itinerary" });
  expect(
    screen.getByRole("link", { name: "View itinerary" }).getAttribute("href"),
  ).toBe("/tours/bali-island-escape");
  expect(screen.getByText("₹48,000")).toBeDefined();
  expect(screen.getAllByAltText(pkg.title)[0].getAttribute("src")).toBe(
    pkg.coverImageUrl,
  );
  expect(screen.queryByText(/FLYHOLIDAY25/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Enquire Now" }));
  expect(screen.getByRole("dialog").textContent).toBe(
    `${holiday.id}:${pkg.id}`,
  );
});
it("submits a real service enquiry and shows success only after the API acknowledges it", async () => {
  render(<ServicesPage />);
  await screen.findByRole("button", { name: "Holiday Packages" });
  fireEvent.change(screen.getByLabelText("Your name"), {
    target: { value: "Sana Ali" },
  });
  fireEvent.change(screen.getByLabelText("Phone / WhatsApp"), {
    target: { value: "+91 98765 43210" },
  });
  fireEvent.change(screen.getByLabelText("Guests / Travelers"), {
    target: { value: "Family (2 Adults, 2 Kids)" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Submit Enquiry" }));
  await screen.findByText("Enquiry received");
  const post = vi
    .mocked(fetch)
    .mock.calls.find(([, opts]) => opts?.method === "POST");
  expect(post?.[0]).toContain("/public/enquiry");
  expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
    serviceId: holiday.id,
    phone: "9876543210",
    fullName: "Sana Ali",
    numberOfAdults: 2,
    numberOfKids: 2,
  });
});
it("selects legacy navbar hashes using the live service and filters packages when switching services", async () => {
  window.history.replaceState(null, "", "/services#visas");
  render(<ServicesPage />);
  await screen.findByText(/No packages are published for Visa Assistance/);
  expect(screen.queryByRole("link", { name: "View itinerary" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Holiday Packages" }));
  expect(
    await screen.findByRole("link", { name: "View itinerary" }),
  ).toBeDefined();
});
it("does not show sample packages on backend failure and can retry", async () => {
  const retry = async () => {
    vi.mocked(useServicesCatalog).mockReturnValue({
      services: [holiday, visa],
      loaded: true,
      error: false,
      retry: async () => {},
    });
  };
  vi.mocked(useServicesCatalog).mockReturnValue({
    services: [],
    loaded: true,
    error: true,
    retry,
  });
  render(<ServicesPage />);
  await screen.findByRole("alert");
  expect(screen.queryByRole("button", { name: "Enquire Now" })).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Submit Enquiry",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByRole("link", { name: "View itinerary" });
});
it("a failed submission does not claim success or permit an accidental duplicate", async () => {
  vi.mocked(fetch).mockImplementation(async (url, opts) =>
    opts?.method === "POST"
      ? json(null, 500)
      : String(url).includes("/packages")
        ? json({ items: [], totalPages: 0 })
        : json([holiday]),
  );
  render(<ServicesPage />);
  await screen.findByRole("button", { name: "Holiday Packages" });
  fireEvent.change(screen.getByLabelText("Your name"), {
    target: { value: "Sana Ali" },
  });
  fireEvent.change(screen.getByLabelText("Phone / WhatsApp"), {
    target: { value: "9876543210" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Submit Enquiry" }));
  await screen.findByRole("alert");
  expect(screen.queryByText("Enquiry received")).toBeNull();
  await waitFor(() =>
    expect(
      (
        screen.getByRole("button", {
          name: "Submit Enquiry",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true),
  );
});
