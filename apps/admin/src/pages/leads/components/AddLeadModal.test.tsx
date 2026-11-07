// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddLeadModal } from "./AddLeadModal";
import { leadsApi } from "../../../lib/leadsApi";
import type { LeadItem, ServiceSummary } from "@flyora/types";

vi.mock("../../../lib/leadsApi", () => ({
  leadsApi: {
    createLead: vi.fn(),
  },
}));

vi.mock("../../../lib/packagesApi", () => ({
  packagesApi: {
    listPackages: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    }),
  },
}));

const mockServices: ServiceSummary[] = [
  {
    id: "11111111-1111-4111-a111-111111111111",
    name: "Holiday Packages",
    slug: "holiday-packages",
    minMarginPercent: 10,
  },
  {
    id: "22222222-2222-4222-a222-222222222222",
    name: "Hotel Booking",
    slug: "hotel-booking",
    minMarginPercent: 8,
  },
];

const mockCreatedLead: LeadItem = {
  id: "lead-new-123",
  customerId: "cust-1",
  customer: {
    id: "cust-1",
    fullName: "Priya Nair",
    phone: "+919876543210",
    email: "priya@example.com",
    city: "Kochi",
  },
  serviceId: "11111111-1111-4111-a111-111111111111",
  serviceName: "Holiday Packages",
  packageId: null,
  packageTitle: null,
  assignedToId: "staff-1",
  assignedToName: "Sara Ahmed",
  claimedAt: new Date().toISOString(),
  status: "NEW",
  source: "PHONE_CALL",
  travelDate: null,
  numberOfAdults: 2,
  numberOfKids: 0,
  estimatedBudget: 50000,
  followUpDate: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(cleanup);

function renderModal(props = {}) {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <AddLeadModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
        services={mockServices}
        defaultServiceId="11111111-1111-4111-a111-111111111111"
        {...props}
      />
    </QueryClientProvider>,
  );

  return { ...utils, onClose, onSuccess };
}

it("renders the modal with customer inputs and default service", () => {
  renderModal();
  expect(screen.getByText("Add new enquiry")).toBeTruthy();
  expect(screen.getByLabelText(/Customer full name/i)).toBeTruthy();
  expect(screen.getByLabelText(/Phone number/i)).toBeTruthy();
  expect(
    screen.getByRole("button", { name: /Add & Assign to Me/i }),
  ).toBeTruthy();
});

it("submits the form and calls createLead with correct data", async () => {
  vi.mocked(leadsApi.createLead).mockResolvedValue(mockCreatedLead);
  const { onSuccess, onClose } = renderModal();

  fireEvent.change(screen.getByLabelText(/Customer full name/i), {
    target: { value: "Priya Nair" },
  });
  fireEvent.change(screen.getByLabelText(/Phone number/i), {
    target: { value: "+919876543210" },
  });
  fireEvent.change(screen.getByLabelText(/Email address/i), {
    target: { value: "priya@example.com" },
  });

  fireEvent.submit(screen.getByTestId("add-lead-form"));

  await waitFor(() => {
    expect(leadsApi.createLead).toHaveBeenCalledTimes(1);
  });

  expect(leadsApi.createLead).toHaveBeenCalledWith(
    expect.objectContaining({
      fullName: "Priya Nair",
      phone: "+919876543210",
      email: "priya@example.com",
      serviceId: "11111111-1111-4111-a111-111111111111",
      source: "PHONE_CALL",
      status: "NEW",
    }),
  );

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalledWith(mockCreatedLead);
    expect(onClose).toHaveBeenCalled();
  });
});
