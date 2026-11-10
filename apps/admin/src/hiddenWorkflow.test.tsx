// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import type { LeadItem, UserRole } from "@flyora/types";
import { DashboardMetrics } from "./pages/dashboard/DashboardMetrics";
import { DashboardChart } from "./pages/dashboard/DashboardChart";
import { LeadDetailDrawer } from "./pages/leads/components/LeadDetailDrawer";
import { leadsApi } from "./lib/leadsApi";
import { bookingsApi } from "./pages/bookings/bookingsApi";
import { quotesApi } from "./pages/quotes/quotesApi";
import { useAuthStore } from "./stores/authStore";
import App from "./App";

vi.mock("./lib/apiClient", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./lib/apiClient")>()),
  initializeAuth: vi.fn(),
}));
vi.mock("./lib/leadsApi", () => ({
  leadsApi: {
    getAllLeads: vi.fn(),
    fetchMyLeads: vi.fn(),
    fetchPoolLeads: vi.fn(),
  },
}));
vi.mock("./pages/bookings/bookingsApi", () => ({
  bookingsApi: { fetchBookings: vi.fn() },
}));
vi.mock("./pages/quotes/quotesApi", () => ({
  quotesApi: { fetchQuotationsForLead: vi.fn() },
}));

const lead = {
  id: "lead-1",
  customer: { id: "customer-1", fullName: "Aisha", phone: "1234567890" },
  serviceId: "service-1",
  serviceName: "Holiday Packages",
  status: "CONTACTED",
  source: "WEBSITE_FORM",
  createdAt: "2026-11-10",
  updatedAt: "2026-11-10",
  numberOfAdults: 2,
  numberOfKids: 0,
} as LeadItem;
function show(children: React.ReactNode) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: 0 } },
        })
      }
    >
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(leadsApi.getAllLeads).mockResolvedValue({
    leads: [],
    total: 5,
    page: 1,
    limit: 1,
  });
  vi.mocked(leadsApi.fetchMyLeads).mockResolvedValue([lead]);
  vi.mocked(leadsApi.fetchPoolLeads).mockResolvedValue([]);
});
afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

it.each([
  "SUPER_ADMIN",
  "OPERATIONS_MANAGER",
  "SERVICE_COORDINATOR",
  "ACCOUNTS",
])("hides finance metrics and avoids payment requests for %s", async (role) => {
  show(
    <>
      <DashboardMetrics role={role} userId="staff-1" />
      <DashboardChart role={role} userId="staff-1" />
    </>,
  );
  if (role === "SERVICE_COORDINATOR")
    expect(
      await screen.findByRole("link", { name: "My enquiries: 1" }),
    ).toBeTruthy();
  else if (role !== "ACCOUNTS")
    expect(
      await screen.findByRole("link", { name: "All enquiries: 5" }),
    ).toBeTruthy();
  expect(
    screen.queryByText(
      /Confirmed bookings|Payments collected|Balance due|Payment verification/i,
    ),
  ).toBeNull();
  expect(document.querySelector('a[href^="/bookings"]')).toBeNull();
  expect(bookingsApi.fetchBookings).not.toHaveBeenCalled();
});

it("retains enquiry details and notes without quotation entry points or requests", () => {
  show(
    <LeadDetailDrawer
      lead={lead}
      activities={[]}
      isOpen
      onClose={vi.fn()}
      onUpdateStatus={vi.fn()}
      onAddNote={vi.fn()}
    />,
  );
  expect(screen.getByText("Aisha")).toBeTruthy();
  expect(
    screen.queryByRole("button", {
      name: /Create quotation|Quotations|Convert to Booking/i,
    }),
  ).toBeNull();
  expect(quotesApi.fetchQuotationsForLead).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: /^Activity/ }));
  expect(screen.getByText(/No activity/i)).toBeTruthy();
});

it.each(["SUPER_ADMIN", "SERVICE_COORDINATOR", "ACCOUNTS"] as UserRole[])(
  "does not expose the bookings page by direct URL for %s",
  async (role) => {
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      sessionUnavailable: false,
      user: { id: "staff-1", role } as any,
    });
    window.history.replaceState({}, "", "/bookings?payment=review");
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "Page Not Found" }),
    ).toBeTruthy();
    expect(bookingsApi.fetchBookings).not.toHaveBeenCalled();
  },
);
