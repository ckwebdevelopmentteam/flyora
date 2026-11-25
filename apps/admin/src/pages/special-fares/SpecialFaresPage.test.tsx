// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { SpecialFaresPage } from "./SpecialFaresPage";
import { useAuthStore } from "../../stores/authStore";
import { specialFaresApi } from "../../lib/specialFaresApi";

vi.mock("../../lib/specialFaresApi", () => ({
  specialFaresApi: {
    listAdminSpecialFares: vi.fn(),
    updateSeats: vi.fn(),
    toggleStatus: vi.fn(),
    deleteSpecialFare: vi.fn(),
    createSpecialFare: vi.fn(),
    updateSpecialFare: vi.fn(),
  },
}));

const mockTicket = {
  id: "deal-1",
  airlineName: "Air India Express",
  airlineCode: "IX",
  flightNumber: "IX-345",
  originCity: "Kozhikode",
  originCode: "CCJ",
  destinationCity: "Dubai",
  destinationCode: "DXB",
  departureDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  arrivalDate: new Date(
    Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000,
  ).toISOString(),
  flightType: "NON_STOP" as const,
  baggageInfo: "30 Kg Check-in + 7 Kg Cabin",
  totalSeats: 20,
  availableSeats: 5,
  farePerSeat: 10500,
  supplierCost: 7500,
  pnrNumber: "GRP9981",
  notes: "Direct group allotment",
  marginAmount: 3000,
  marginPercent: 28.6,
  metadata: null,
  expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  status: "ACTIVE" as const,
  isActive: true,
  displayOrder: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SpecialFaresPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SpecialFaresPage", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: "admin-1",
        fullName: "Flyora Admin",
        email: "admin@flyora.com",
        role: "SUPER_ADMIN",
        availability: "AVAILABLE",
        isActive: true,
        services: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    });

    vi.mocked(specialFaresApi.listAdminSpecialFares).mockResolvedValue({
      items: [mockTicket],
      total: 1,
    });
    vi.mocked(specialFaresApi.updateSeats).mockResolvedValue({
      id: "deal-1",
      availableSeats: 4,
      status: "ACTIVE",
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    useAuthStore.setState({ user: null });
  });

  it("renders inventory dashboard metrics and allotment rows with margin", async () => {
    renderPage();

    expect(await screen.findByText("CCJ")).toBeTruthy();
    expect(screen.getByText("DXB")).toBeTruthy();
    expect(screen.getByText("Air India Express")).toBeTruthy();
    expect(screen.getByText("PNR: GRP9981")).toBeTruthy();
    expect(screen.getByText("+28.6%")).toBeTruthy();
    expect(screen.getByText("5 / 20")).toBeTruthy();
    expect(screen.getByText("₹15,000")).toBeTruthy(); // 3000 * 5 remaining seats
  });

  it("executes 1-click seat adjustment when clicking minus button", async () => {
    renderPage();

    await screen.findByText("5 / 20");
    const decBtn = screen.getByRole("button", { name: "Decrease seats" });
    fireEvent.click(decBtn);

    await waitFor(() => {
      expect(specialFaresApi.updateSeats).toHaveBeenCalledWith("deal-1", {
        change: -1,
      });
    });
  });

  it("opens Add Allotment drawer when button is clicked", async () => {
    renderPage();

    await screen.findByText("Special Fare Inventory");
    const addBtn = screen.getByRole("button", { name: /Add Allotment/i });
    fireEvent.click(addBtn);

    expect(await screen.findByText("Add Special Fare Allotment")).toBeTruthy();
  });
});
