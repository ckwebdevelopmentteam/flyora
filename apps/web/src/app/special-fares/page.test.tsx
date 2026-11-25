import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import SpecialFaresPage from "./page";
import {
  fetchPublicSpecialFareRoutes,
  fetchPublicSpecialFares,
  submitSpecialFareEnquiry,
} from "../../lib/specialFaresApi";

vi.mock("../../lib/specialFaresApi", () => ({
  fetchPublicSpecialFares: vi.fn(),
  fetchPublicSpecialFareRoutes: vi.fn(),
  submitSpecialFareEnquiry: vi.fn(),
}));

vi.mock("../../components/layout/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

vi.mock("../../components/layout/Footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));

vi.mock("../../components/EnquiryModal", () => ({
  EnquiryModal: () => null,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const mockDeals = [
  {
    id: "sf-1",
    airlineName: "Air India Express",
    airlineCode: "IX",
    flightNumber: "IX-345",
    originCity: "Kozhikode",
    originCode: "CCJ",
    destinationCity: "Dubai",
    destinationCode: "DXB",
    departureDate: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
    arrivalDate: new Date(
      Date.now() + 3 * 86400 * 1000 + 4 * 3600 * 1000,
    ).toISOString(),
    flightType: "NON_STOP" as const,
    baggageInfo: "30 Kg Check-in + 7 Kg Cabin",
    isRefundable: true,
    cabinClass: "ECONOMY" as const,
    availableSeats: 2,
    originalFare: 14500,
    farePerSeat: 9499,
    expiresAt: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
    metadata: null,
  },
  {
    id: "sf-2",
    airlineName: "IndiGo",
    airlineCode: "6E",
    flightNumber: "6E-1420",
    originCity: "Mumbai",
    originCode: "BOM",
    destinationCity: "Doha",
    destinationCode: "DOH",
    departureDate: new Date(Date.now() + 4 * 86400 * 1000).toISOString(),
    arrivalDate: null,
    flightType: "CONNECTING" as const,
    baggageInfo: "25 Kg Check-in + 7 Kg Cabin",
    availableSeats: 7,
    farePerSeat: 12800,
    expiresAt: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
    metadata: null,
  },
];

describe("SpecialFaresPage", () => {
  beforeEach(() => {
    vi.mocked(fetchPublicSpecialFares).mockResolvedValue({
      items: mockDeals,
      total: 2,
    });
    vi.mocked(fetchPublicSpecialFareRoutes).mockResolvedValue([
      {
        originCity: "Kozhikode",
        originCode: "CCJ",
        destinationCity: "Dubai",
        destinationCode: "DXB",
        count: 1,
        minFare: 9499,
      },
    ]);
    vi.mocked(submitSpecialFareEnquiry).mockResolvedValue({
      success: true,
      leadId: "lead-sf-99",
      message: "Your special fare enquiry has been confirmed.",
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders search bar, date strip, filters, and live ticket cards", async () => {
    render(<SpecialFaresPage />);

    expect(
      await screen.findByRole("heading", { name: "Air India Express" }),
    ).toBeDefined();
    expect(screen.getByRole("heading", { name: "IndiGo" })).toBeDefined();
    expect(screen.getByText("Only 2 Left")).toBeDefined();
    expect(screen.getByText("7 Left")).toBeDefined();
    expect(screen.getAllByText(/₹\s?14,500/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/₹\s?9,499/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("30 Kg Check-in + 7 Kg Cabin")).toBeDefined();
  });

  it("filters deals by Non-Stop stop selector", async () => {
    render(<SpecialFaresPage />);
    await screen.findByRole("heading", { name: "Air India Express" });

    const nonStopBtn = screen.getByRole("button", { name: /Non-Stop/i });
    fireEvent.click(nonStopBtn);

    expect(
      screen.getByRole("heading", { name: "Air India Express" }),
    ).toBeDefined();
    expect(screen.queryByRole("heading", { name: "IndiGo" })).toBeNull();
  });

  it("opens Claim Modal and submits a booking enquiry", async () => {
    render(<SpecialFaresPage />);
    await screen.findByRole("heading", { name: "Air India Express" });

    const bookButtons = screen.getAllByRole("button", { name: "Book Now" });
    fireEvent.click(bookButtons[0]);

    expect(
      await screen.findByRole("heading", { name: "Claim Your Special Fare" }),
    ).toBeDefined();

    fireEvent.change(
      screen.getByPlaceholderText("Enter lead passenger full name"),
      { target: { value: "Rashid Khan" } },
    );
    fireEvent.change(screen.getByPlaceholderText("+91 98765 43210"), {
      target: { value: "9876543210" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Request Booking" }));

    await waitFor(() => {
      expect(submitSpecialFareEnquiry).toHaveBeenCalledWith("sf-1", {
        fullName: "Rashid Khan",
        phone: "9876543210",
        email: undefined,
        passengerCount: 1,
        notes: undefined,
      });
    });

    expect(await screen.findByText("Seat Request Received!")).toBeDefined();
    expect(screen.getByText("lead-sf-99")).toBeDefined();
  });

  it("shows Price Range, Travel Window, and Baggage filters by default, and reveals Departure/Arrival Time when a date is chosen", async () => {
    render(<SpecialFaresPage />);
    await screen.findByRole("heading", { name: "Air India Express" });

    // Default multi-date filters shown
    expect(screen.getByText("Price Range")).toBeDefined();
    expect(screen.getByText("Travel Window")).toBeDefined();
    expect(screen.getByText("Baggage Included")).toBeDefined();

    // Time filters hidden until a date is selected
    expect(screen.queryByText("Departure Time")).toBeNull();
    expect(screen.queryByText("Arrival Time")).toBeNull();

    // Filter by 30 Kg+ Check-in
    fireEvent.click(screen.getByRole("button", { name: "30 Kg+ Check-in" }));
    expect(
      screen.getByRole("heading", { name: "Air India Express" }),
    ).toBeDefined();
    expect(screen.queryByRole("heading", { name: "IndiGo" })).toBeNull();

    // Reset filter and select a specific date from Date Price Strip
    fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
    const dateStrip = screen.getByRole("button", {
      name: /All Dates/i,
    }).parentElement!;
    const dateBtn = Array.from(dateStrip.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("₹9,499"),
    );
    expect(dateBtn).toBeDefined();
    fireEvent.click(dateBtn!);

    // Conditional Departure & Arrival Time filters appear
    expect(await screen.findByText("Departure Time")).toBeDefined();
    expect(screen.getByText("Arrival Time")).toBeDefined();

    // Verify AirportCombobox still opens cleanly
    const fromInput = screen.getByLabelText("From");
    fireEvent.focus(fromInput);
    expect(await screen.findByText("Important Airports")).toBeDefined();
    expect(screen.getAllByText("Mumbai").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("BOM").length).toBeGreaterThanOrEqual(1);
  });
});
