import { MemoryRouter } from "react-router-dom";
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { BookingsPage } from "./BookingsPage";
import { bookingsApi } from "./bookingsApi";
import type { BookingRecord } from "./types";

vi.mock("./bookingsApi", () => ({
  bookingsApi: {
    fetchBookings: vi.fn(),
    fetchBookingById: vi.fn(),
  },
}));

vi.mock("../../stores/authStore", () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: {
        id: "admin-01",
        email: "admin@flyora.com",
        fullName: "Super Admin",
        role: "SUPER_ADMIN",
      },
    }),
}));

const mockBookingsList: BookingRecord[] = [
  {
    id: "bk-01",
    bookingRef: "BK-2026-0001",
    leadId: "lead-01",
    quotationId: "q-01",
    status: "CONFIRMED",
    totalAmount: 100000,
    paidAmount: 50000,
    dueAmount: 50000,
    travelDate: "2026-11-20",
    createdAt: new Date().toISOString(),
    customerName: "Aamir Sheikh",
    customerPhone: "+91 98200 11223",
    serviceName: "Dubai Luxury Holidays",
    packageTitle: "5D/4N Glitz of Dubai",
    paxCount: 2,
    payments: [
      {
        id: "p1",
        bookingId: "bk-01",
        recordedById: "c1",
        amount: 50000,
        method: "UPI",
        transactionRef: "UPI/102938",
        receiptFileKey: "receipts/slip.png",
        status: "VERIFIED",
        paymentDate: "2026-10-20",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "bk-02",
    bookingRef: "BK-2026-0002",
    leadId: "lead-02",
    quotationId: "q-02",
    status: "CONFIRMED",
    totalAmount: 200000,
    paidAmount: 200000,
    dueAmount: 0,
    travelDate: "2026-12-05",
    createdAt: new Date().toISOString(),
    customerName: "Fatima Zahra",
    customerPhone: "+91 98765 43210",
    serviceName: "Deluxe Umrah Package",
    packageTitle: "15D Executive Umrah",
    paxCount: 4,
    payments: [
      {
        id: "p2",
        bookingId: "bk-02",
        recordedById: "c1",
        amount: 200000,
        method: "BANK_TRANSFER_NEFT_IMPS",
        transactionRef: "NEFT/928491",
        receiptFileKey: "receipts/slip2.pdf",
        status: "VERIFIED",
        paymentDate: "2026-10-21",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

describe("BookingsPage Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(cleanup);

  it("renders financial aggregate cards and bookings list", async () => {
    vi.mocked(bookingsApi.fetchBookings).mockResolvedValue(mockBookingsList);

    render(
      <MemoryRouter>
        <BookingsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("BK-2026-0001")).toBeTruthy();
    expect(screen.getByText("BK-2026-0002")).toBeTruthy();
    expect(screen.getByText("Aamir Sheikh")).toBeTruthy();
    expect(screen.getByText("Fatima Zahra")).toBeTruthy();

    // Summary cards: Total Bookings (2), Total Booked (₹3,00,000)
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("₹3,00,000")).toBeTruthy();
    expect(screen.getByText("₹2,50,000")).toBeTruthy(); // 50k + 200k verified
    expect(screen.getAllByText("₹50,000").length).toBeGreaterThanOrEqual(1);
  });

  it("filters bookings by payment status", async () => {
    vi.mocked(bookingsApi.fetchBookings).mockResolvedValue(mockBookingsList);

    render(
      <MemoryRouter>
        <BookingsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("BK-2026-0001")).toBeTruthy();
    expect(screen.getByText("BK-2026-0002")).toBeTruthy();

    // Click "Fully Paid" filter
    const fullyPaidFilter = screen.getByRole("button", { name: "Fully Paid" });
    fireEvent.click(fullyPaidFilter);

    // Only BK-2026-0002 should remain
    expect(screen.queryByText("BK-2026-0001")).toBeNull();
    expect(screen.getByText("BK-2026-0002")).toBeTruthy();
  });

  it("opens BookingDetailDrawer when Details button is clicked", async () => {
    vi.mocked(bookingsApi.fetchBookings).mockResolvedValue(mockBookingsList);
    vi.mocked(bookingsApi.fetchBookingById).mockResolvedValue(
      mockBookingsList[0],
    );

    render(
      <MemoryRouter>
        <BookingsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("BK-2026-0001")).toBeTruthy();

    const detailButtons = screen.getAllByRole("button", { name: "Details" });
    fireEvent.click(detailButtons[0]);

    // Drawer should open with customer city, etc.
    expect(await screen.findByText("Payment Status")).toBeTruthy();
    expect(screen.getByText("Confirmed Trip Itinerary")).toBeTruthy();
  });

  it("opens RecordPaymentModal when Payment button is clicked", async () => {
    vi.mocked(bookingsApi.fetchBookings).mockResolvedValue(mockBookingsList);

    render(
      <MemoryRouter>
        <BookingsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("BK-2026-0001")).toBeTruthy();

    const paymentButtons = screen.getAllByRole("button", { name: "Payment" });
    fireEvent.click(paymentButtons[0]);

    expect(await screen.findByText("Record payment")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Continue/ })).toBeTruthy();
  });

  it("reports a failed live booking load and recovers on refresh without demo records", async () => {
    vi.mocked(bookingsApi.fetchBookings)
      .mockRejectedValueOnce(new Error("Booking API unavailable"))
      .mockResolvedValueOnce(mockBookingsList);
    render(
      <MemoryRouter>
        <BookingsPage />
      </MemoryRouter>,
    );
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Bookings could not be loaded",
    );
    expect(screen.queryByText("BK-2026-0001")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(await screen.findByText("BK-2026-0001")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("Payment review from the dashboard", () => {
  afterEach(cleanup);
  it("includes pending receipts on partially paid bookings", async () => {
    const partial = {
      ...mockBookingsList[0],
      payments: [
        ...mockBookingsList[0].payments!,
        {
          ...mockBookingsList[0].payments![0],
          id: "pending-new",
          amount: 10000,
          status: "PENDING" as const,
        },
      ],
    };
    vi.mocked(bookingsApi.fetchBookings).mockResolvedValue([
      partial,
      mockBookingsList[1],
    ]);
    render(
      <MemoryRouter initialEntries={["/bookings?payment=review"]}>
        <BookingsPage />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Aamir Sheikh")).toBeTruthy();
    expect(screen.queryByText("Fatima Zahra")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "All Payments" }));
    expect(await screen.findByText("Fatima Zahra")).toBeTruthy();
  });
});
