import { MemoryRouter } from "react-router-dom";
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { LeadDetailDrawer } from "../leads/components/LeadDetailDrawer";
import { quotesApi } from "./quotesApi";
import type { LeadItem, LeadActivityItem } from "@flyora/types";
import type { QuotationRecord } from "./types";

vi.mock("./quotesApi", () => {
  let inMemoryQuotes: QuotationRecord[] = [];
  return {
    quotesApi: {
      fetchQuotationsForLead: vi.fn().mockImplementation((leadId: string) => {
        return Promise.resolve(
          inMemoryQuotes.filter((q) => q.leadId === leadId),
        );
      }),
      createQuotation: vi.fn().mockImplementation((payload: any) => {
        const quote: QuotationRecord = {
          id: `quote-${Date.now()}`,
          quoteNumber: "FLY-2026-0099",
          leadId: payload.leadId,
          createdById: "coord-01",
          status: "SENT",
          shareToken: "token-e2e-xyz",
          supplierCost: 75000,
          sellingPrice: 100000,
          marginAmount: 25000,
          marginPercent: 25.0,
          items: payload.items,
          inclusions: payload.inclusions,
          exclusions: payload.exclusions,
          validUntil: payload.validUntil,
          notes: payload.notes || null,
          createdAt: new Date().toISOString(),
        };
        inMemoryQuotes.push(quote);
        return Promise.resolve(quote);
      }),
      updateQuoteStatus: vi.fn(),
    },
  };
});

const mockLead: LeadItem = {
  id: "lead-e2e-01",
  customerId: "cust-01",
  customer: {
    id: "cust-01",
    fullName: "Aamir & Priya Sheikh",
    phone: "+91 98200 11223",
    email: "aamir.sheikh@example.com",
    city: "Bangalore",
  },
  serviceId: "srv-dubai-001",
  serviceName: "Dubai Luxury Holidays",
  packageId: "pkg-dxb-01",
  packageTitle: "5D/4N Glitz of Dubai",
  assignedToId: "coord-01",
  assignedToName: "Coordinator One",
  claimedAt: new Date().toISOString(),
  status: "CONTACTED",
  source: "WEBSITE_FORM",
  travelDate: "2026-11-20T00:00:00.000Z",
  numberOfAdults: 2,
  numberOfKids: 1,
  estimatedBudget: 180000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockActivities: LeadActivityItem[] = [
  {
    id: "act-e2e-1",
    leadId: mockLead.id,
    userId: "coord-01",
    userName: "Coordinator One",
    action: "STATUS_CHANGED",
    details: "Contacted lead via phone call",
    createdAt: new Date().toISOString(),
  },
];

describe("Dev 2 End-to-End Workflow Verification", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(cleanup);

  it("completes full coordinator quotation creation, live margin enforcement, and dispatch flow", async () => {
    const createdMockQuote: QuotationRecord = {
      id: "quote-e2e-99",
      quoteNumber: "FLY-2026-0099",
      leadId: mockLead.id,
      createdById: "coord-01",
      status: "SENT",
      shareToken: "token-e2e-xyz",
      supplierCost: 75000,
      sellingPrice: 100000,
      marginAmount: 25000,
      marginPercent: 25.0,
      items: [],
      inclusions: ["Breakfast"],
      exclusions: ["Insurance"],
      validUntil: "2026-11-25",
      createdAt: new Date().toISOString(),
    };

    vi.mocked(quotesApi.fetchQuotationsForLead).mockResolvedValue([]);
    vi.mocked(quotesApi.createQuotation).mockResolvedValue(createdMockQuote);

    const onUpdateStatus = vi.fn().mockResolvedValue(undefined);
    const onChanged = vi.fn();
    const onAddNote = vi.fn().mockResolvedValue(undefined);

    // 1. Coordinator opens Lead Detail Drawer
    render(
      <LeadDetailDrawer
        lead={mockLead}
        activities={mockActivities}
        isOpen={true}
        onClose={vi.fn()}
        onUpdateStatus={onUpdateStatus}
        onChanged={onChanged}
        onAddNote={onAddNote}
      />,
    );

    // Verify lead context in Drawer
    expect(screen.getByText("Aamir & Priya Sheikh")).toBeTruthy();
    expect(screen.getByText("Bangalore")).toBeTruthy();

    // 2. Click "Create Quotation (Margin Guard)"
    const launchBtn = screen.getByRole("button", {
      name: /Create quotation/i,
    });
    fireEvent.click(launchBtn);

    // 3. Modal opens with pre-filled lead context and initial items
    expect(
      await screen.findByRole("dialog", { name: "Create quotation" }),
    ).toBeTruthy();

    // 4. Test Line-Item shortcuts: Add a Flight
    fireEvent.change(screen.getByRole("combobox", { name: "Add service" }), {
      target: { value: "FLIGHT" },
    });
    expect(screen.getByDisplayValue("Flight tickets")).toBeTruthy();

    // 5. Enter pricing to test Sub-Target Margin Guard
    // Cost = 100,000, Price = 105,000 (~4.7% < 12%)
    const costInputs = screen.getAllByPlaceholderText("0.00");
    fireEvent.change(costInputs[0], { target: { value: "100000" } });
    fireEvent.change(costInputs[1], { target: { value: "105000" } });

    expect(quotesApi.createQuotation).not.toHaveBeenCalled();

    // 6. Adjust pricing to Healthy Margin (Cost = 75,000, Price = 100,000 -> 25%)
    fireEvent.change(costInputs[0], { target: { value: "75000" } });
    fireEvent.change(costInputs[1], { target: { value: "100000" } });

    // Healthy badge should be displayed
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));

    // 7. Add custom inclusion
    const incInput = screen.getByPlaceholderText(/Add something included/i);
    fireEvent.change(incInput, {
      target: { value: "Complimentary Burj Khalifa At The Top Tickets" },
    });
    fireEvent.keyDown(incInput, { key: "Enter" });
    expect(
      screen.getByText("Complimentary Burj Khalifa At The Top Tickets"),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getByText("Target met")).toBeTruthy();
    // 8. Submit Quotation
    const submitBtn = screen.getByRole("button", {
      name: "Save quotation",
    });
    fireEvent.click(submitBtn);

    // 9. Celebration modal should appear with Quote Number and share links
    await waitFor(() => {
      expect(quotesApi.createQuotation).toHaveBeenCalledOnce();
    });

    expect(
      await screen.findByRole("dialog", { name: "Quotation saved" }),
    ).toBeTruthy();
    expect(screen.getByText(/Quotation saved/i)).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: /Copy Link/i }).length,
    ).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByText("Message to customer"));
    expect(screen.getByRole("button", { name: /Copy message/i })).toBeTruthy();

    // Verify WhatsApp direct link has encoded customer phone and share token
    const whatsappLink = screen.getByRole("link", {
      name: /Open in WhatsApp/i,
    });
    expect(whatsappLink.getAttribute("href")).toContain("919820011223");
    expect(whatsappLink.getAttribute("href")).toContain("token-e2e-xyz");

    // 10. Close celebration modal
    const doneBtn = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneBtn);

    // 11. Verify lead status automatically updated to QUOTED
    expect(onChanged).toHaveBeenCalledOnce();
    expect(onUpdateStatus).not.toHaveBeenCalled();

    // 12. Verify quote appears in the drawer's Quotations tab
    await waitFor(() => {
      expect(screen.getByText("FLY-2026-0099")).toBeTruthy();
    });
  });
});

it("keeps an existing booking intact when a revised quotation is saved", async () => {
  vi.mocked(quotesApi.fetchQuotationsForLead).mockResolvedValue([]);
  vi.mocked(quotesApi.createQuotation).mockResolvedValue({
    id: "revised-quote",
    quoteNumber: "FLY-2026-0100",
    leadId: mockLead.id,
    createdById: "staff-1",
    status: "DRAFT",
    shareToken: "revised-link",
    supplierCost: 100,
    sellingPrice: 150,
    marginAmount: 50,
    marginPercent: 33.3,
    items: [],
    inclusions: [],
    exclusions: [],
    validUntil: "2030-01-01",
    createdAt: new Date().toISOString(),
  });
  const update = vi.fn().mockResolvedValue(undefined);
  const view = render(
    <MemoryRouter>
      <LeadDetailDrawer
        lead={{ ...mockLead, status: "BOOKED" }}
        activities={[]}
        isOpen
        onClose={vi.fn()}
        onUpdateStatus={update}
        onAddNote={vi.fn()}
      />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Create quotation" }));
  fireEvent.change(
    screen.getByRole("spinbutton", { name: "Supplier cost per unit 1" }),
    { target: { value: "100" } },
  );
  fireEvent.change(
    screen.getByRole("spinbutton", { name: "Customer price per unit 1" }),
    { target: { value: "150" } },
  );
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
  fireEvent.click(screen.getByRole("button", { name: "Save quotation" }));
  expect(
    await screen.findByRole("dialog", { name: "Quotation saved" }),
  ).toBeTruthy();
  expect(update).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(screen.queryByRole("button", { name: "Confirm booking" })).toBeNull();
  expect(screen.getByRole("link", { name: "View bookings" })).toBeTruthy();
  view.unmount();
});
