import type { LeadItem } from "@flyora/types";
// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import {
  DashboardMetrics,
  summarizeBookings,
  countDueFollowups,
} from "./DashboardMetrics";
import { leadsApi } from "../../lib/leadsApi";
import { bookingsApi } from "../bookings/bookingsApi";
import { packagesApi } from "../../lib/packagesApi";
import type { BookingRecord, PaymentRecord } from "../bookings/types";
vi.mock("../../lib/leadsApi", () => ({
  leadsApi: {
    getAllLeads: vi.fn(),
    fetchMyLeads: vi.fn(),
    fetchPoolLeads: vi.fn(),
  },
}));
vi.mock("../bookings/bookingsApi", () => ({
  bookingsApi: { fetchBookings: vi.fn() },
}));
vi.mock("../../lib/packagesApi", () => ({
  packagesApi: { listPackages: vi.fn() },
}));
const payment = (
  amount: number,
  status: PaymentRecord["status"],
): PaymentRecord => ({
  id: `${status}-${amount}`,
  bookingId: "booking-1",
  recordedById: "staff-1",
  amount,
  status,
  method: "UPI",
  transactionRef: "UPI-123",
  receiptFileKey: "receipts/proof.pdf",
  paymentDate: "2026-10-26",
  createdAt: "2026-10-26",
});
const booking = (patch: Partial<BookingRecord> = {}): BookingRecord => ({
  id: "booking-1",
  bookingRef: "BK-2026-0001",
  leadId: "lead-1",
  quotationId: "quote-1",
  status: "CONFIRMED",
  totalAmount: 1000,
  paidAmount: 400,
  dueAmount: 600,
  travelDate: "2026-11-01",
  createdAt: "2026-10-26",
  payments: [
    payment(400, "VERIFIED"),
    payment(200, "PENDING"),
    payment(50, "REJECTED"),
  ],
  ...patch,
});
function show(role = "SUPER_ADMIN") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <DashboardMetrics role={role} userId="staff-1" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(leadsApi.getAllLeads).mockResolvedValue({
    leads: [],
    total: 23,
    page: 1,
    limit: 1,
  });
  vi.mocked(leadsApi.fetchMyLeads).mockResolvedValue([]);
  vi.mocked(leadsApi.fetchPoolLeads).mockResolvedValue([]);
  vi.mocked(bookingsApi.fetchBookings).mockResolvedValue([booking()]);
  vi.mocked(packagesApi.listPackages).mockResolvedValue({ total: 4 } as any);
});
afterEach(cleanup);
it("uses only verified money and excludes cancelled balances", () => {
  expect(
    summarizeBookings([
      booking(),
      booking({
        id: "cancelled",
        status: "CANCELLED",
        totalAmount: 500,
        payments: [payment(100, "VERIFIED")],
      }),
    ]),
  ).toEqual({ confirmed: 1, collected: 500, outstanding: 600, pending: 1 });
});
it("shows real totals rather than the first page length or pending receipts", async () => {
  show();
  expect(
    await screen.findByRole("link", { name: "New enquiries: 23" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Payments collected: ₹400" }),
  ).toBeTruthy();
  expect(screen.getByRole("link", { name: "Balance due: ₹600" })).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Confirmed bookings: 1" }),
  ).toBeTruthy();
  expect(
    screen.getByText("1 payment is waiting for verification"),
  ).toBeTruthy();
  expect(leadsApi.getAllLeads).toHaveBeenCalledWith({
    status: "NEW",
    limit: 1,
  });
});
it("doesn't show zero while a request is loading", async () => {
  vi.mocked(bookingsApi.fetchBookings).mockReturnValue(new Promise(() => {}));
  show();
  expect(
    await screen.findByRole("link", { name: "New enquiries: 23" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Balance due: Loading" }),
  ).toBeTruthy();
  expect(screen.queryByRole("link", { name: "Balance due: ₹0" })).toBeNull();
});
it("keeps unrelated counts and offers refresh when financial numbers fail", async () => {
  vi.mocked(bookingsApi.fetchBookings).mockRejectedValueOnce(
    new Error("Prisma connection: private details"),
  );
  show();
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.getByRole("link", { name: "New enquiries: 23" })).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Balance due: Unavailable" }),
  ).toBeTruthy();
  expect(screen.queryByText(/Prisma/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Refresh numbers" }));
  expect(
    await screen.findByRole("link", { name: "Balance due: ₹600" }),
  ).toBeTruthy();
});
it("uses a coordinator's own enquiries instead of manager data", async () => {
  show("SERVICE_COORDINATOR");
  expect(
    await screen.findByRole("link", { name: "Follow-ups due: 0" }),
  ).toBeTruthy();
  expect(leadsApi.fetchMyLeads).toHaveBeenCalledWith();
  expect(leadsApi.getAllLeads).not.toHaveBeenCalled();
});
it("gives Accounts a review queue without calling enquiry APIs", async () => {
  show("ACCOUNTS");
  expect(
    await screen.findByRole("link", { name: "Payments to review: 1" }),
  ).toBeTruthy();
  expect(leadsApi.getAllLeads).not.toHaveBeenCalled();
  expect(leadsApi.fetchMyLeads).not.toHaveBeenCalled();
});
it("gives Content Managers package counts without fetching customer finances", async () => {
  show("CONTENT_MANAGER");
  expect(
    await screen.findByRole("link", { name: "Tour packages: 4" }),
  ).toBeTruthy();
  await waitFor(() =>
    expect(packagesApi.listPackages).toHaveBeenCalledTimes(3),
  );
  expect(bookingsApi.fetchBookings).not.toHaveBeenCalled();
  expect(leadsApi.getAllLeads).not.toHaveBeenCalled();
  expect(leadsApi.fetchMyLeads).not.toHaveBeenCalled();
});

it("counts overdue and today's follow-ups without reviving booked or lost enquiries", () => {
  const leads = [
    { status: "CONTACTED", followUpDate: "2026-10-25" },
    { status: "QUOTED", followUpDate: "2026-10-26" },
    { status: "NEW", followUpDate: "2026-10-27" },
    { status: "BOOKED", followUpDate: "2026-10-25" },
    { status: "LOST", followUpDate: "2026-10-25" },
    { status: "NEW", followUpDate: null },
  ] as LeadItem[];
  expect(countDueFollowups(leads, new Date("2026-10-26T12:00:00"))).toBe(2);
});
