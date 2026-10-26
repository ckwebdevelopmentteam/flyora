// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { DashboardChart } from "./DashboardChart";
import { leadsApi } from "../../lib/leadsApi";
import { bookingsApi } from "../bookings/bookingsApi";
import type { LeadItem } from "@flyora/types";
import type { BookingRecord } from "../bookings/types";
vi.mock("../../lib/leadsApi", () => ({
  leadsApi: { getAllLeads: vi.fn(), fetchMyLeads: vi.fn() },
}));
vi.mock("../bookings/bookingsApi", () => ({
  bookingsApi: { fetchBookings: vi.fn() },
}));
const counts: Record<string, number> = {
  NEW: 2,
  CONTACTED: 3,
  QUOTED: 1,
  NEGOTIATING: 1,
  BOOKED: 4,
  LOST: 1,
};
function show(role = "SUPER_ADMIN") {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: 0 } },
        })
      }
    >
      <MemoryRouter>
        <DashboardChart role={role} userId="staff-1" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(leadsApi.getAllLeads).mockImplementation(async (params) => ({
    leads: [],
    total: counts[params?.status || "NEW"],
    page: 1,
    limit: 1,
  }));
  vi.mocked(leadsApi.fetchMyLeads).mockResolvedValue([
    { status: "NEW" },
    { status: "NEW" },
    { status: "BOOKED" },
  ] as LeadItem[]);
});
afterEach(cleanup);
it("shows actual stage counts with a drill-down to the selected stage", async () => {
  show();
  expect(await screen.findByRole("link", { name: "Booked: 4" })).toHaveProperty(
    "href",
    expect.stringContaining("/admin/leads?status=BOOKED"),
  );
  expect(screen.getByRole("link", { name: "Contacted: 3" })).toBeTruthy();
  expect(screen.getByText("12 enquiries")).toBeTruthy();
  expect(leadsApi.getAllLeads).toHaveBeenCalledTimes(6);
  expect(leadsApi.fetchMyLeads).not.toHaveBeenCalled();
});
it("uses a coordinator's own records without asking for team-wide data", async () => {
  show("SERVICE_COORDINATOR");
  expect(await screen.findByRole("link", { name: "New: 2" })).toHaveProperty(
    "href",
    expect.stringContaining("tab=my-leads&status=NEW"),
  );
  expect(screen.getByText("3 enquiries")).toBeTruthy();
  expect(leadsApi.getAllLeads).not.toHaveBeenCalled();
});
it("doesn't turn a failed stage count into zero", async () => {
  vi.mocked(leadsApi.getAllLeads).mockImplementation(async (params) => {
    if (params?.status === "QUOTED") throw new Error("PRIVATE_DATABASE_ERROR");
    return {
      leads: [],
      total: counts[params?.status || "NEW"],
      page: 1,
      limit: 1,
    };
  });
  show();
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Quoted: Unavailable" }),
  ).toBeTruthy();
  expect(screen.queryByRole("link", { name: "Quoted: 0" })).toBeNull();
  expect(screen.queryByText(/PRIVATE_DATABASE_ERROR/)).toBeNull();
});
it("shows Accounts a payment review breakdown and a direct review link", async () => {
  vi.mocked(bookingsApi.fetchBookings).mockResolvedValue([
    {
      payments: [
        { status: "VERIFIED" },
        { status: "PENDING" },
        { status: "REJECTED" },
      ],
    },
  ] as BookingRecord[]);
  show("ACCOUNTS");
  expect(
    await screen.findByRole("link", { name: "Needs verification: 1" }),
  ).toHaveProperty("href", expect.stringContaining("/bookings?payment=review"));
  expect(screen.getByText("3 payments")).toBeTruthy();
  expect(leadsApi.getAllLeads).not.toHaveBeenCalled();
});
it("does not fetch sales or payment charts for Content Managers", () => {
  show("CONTENT_MANAGER");
  expect(screen.queryByRole("region")).toBeNull();
  expect(bookingsApi.fetchBookings).not.toHaveBeenCalled();
  expect(leadsApi.getAllLeads).not.toHaveBeenCalled();
});
