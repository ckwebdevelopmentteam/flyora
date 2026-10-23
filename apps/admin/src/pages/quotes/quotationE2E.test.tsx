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
    const onAddNote = vi.fn().mockResolvedValue(undefined);

    // 1. Coordinator opens Lead Detail Drawer
    render(
      <LeadDetailDrawer
        lead={mockLead}
        activities={mockActivities}
        isOpen={true}
        onClose={vi.fn()}
        onUpdateStatus={onUpdateStatus}
        onAddNote={onAddNote}
      />,
    );

    // Verify lead context in Drawer
    expect(screen.getByText("Aamir & Priya Sheikh")).toBeTruthy();
    expect(screen.getByText("Bangalore")).toBeTruthy();

    // 2. Click "Create Quotation (Margin Guard)"
    const launchBtn = screen.getByRole("button", {
      name: /Create Quotation \(Margin Guard\)/i,
    });
    fireEvent.click(launchBtn);

    // 3. Modal opens with pre-filled lead context and initial items
    expect(
      await screen.findByText("Quotation Builder & Margin Guard"),
    ).toBeTruthy();
    expect(
      screen.getByText(/Enforcing floor rule for Dubai Luxury Holidays/i),
    ).toBeTruthy();

    // 4. Test Line-Item shortcuts: Add a Flight
    const addFlightBtn = screen.getByRole("button", { name: "+ Flight" });
    fireEvent.click(addFlightBtn);
    expect(screen.getByDisplayValue("Round-trip Flights")).toBeTruthy();

    // 5. Enter pricing to test Sub-Target Margin Guard
    // Cost = 100,000, Price = 105,000 (~4.7% < 12%)
    const costInputs = screen.getAllByPlaceholderText("0");
    fireEvent.change(costInputs[0], { target: { value: "100000" } });
    fireEvent.change(costInputs[1], { target: { value: "105000" } });

    // Warning alert should trigger
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText(/Margin Below Target/i)).toBeTruthy();

    // 6. Adjust pricing to Healthy Margin (Cost = 75,000, Price = 100,000 -> 25%)
    fireEvent.change(costInputs[0], { target: { value: "75000" } });
    fireEvent.change(costInputs[1], { target: { value: "100000" } });

    // Healthy badge should be displayed
    expect(await screen.findByText(/Healthy Margin/i)).toBeTruthy();

    // 7. Add custom inclusion
    const incInput = screen.getByPlaceholderText(
      /Type custom inclusion & Enter/i,
    );
    fireEvent.change(incInput, {
      target: { value: "Complimentary Burj Khalifa At The Top Tickets" },
    });
    fireEvent.keyDown(incInput, { key: "Enter" });
    expect(
      screen.getByText("Complimentary Burj Khalifa At The Top Tickets"),
    ).toBeTruthy();

    // 8. Submit Quotation
    const submitBtn = screen.getByRole("button", {
      name: "Generate & Finalize Quotation",
    });
    fireEvent.click(submitBtn);

    // 9. Celebration modal should appear with Quote Number and share links
    await waitFor(() => {
      expect(quotesApi.createQuotation).toHaveBeenCalledOnce();
    });

    expect(
      await screen.findByRole("heading", { name: "FLY-2026-0099" }),
    ).toBeTruthy();
    expect(screen.getByText(/Quotation Ready for Dispatch/i)).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: /Copy Link/i }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("button", { name: /Copy Pitch Text/i }),
    ).toBeTruthy();

    // Verify WhatsApp direct link has encoded customer phone and share token
    const whatsappLink = screen.getByRole("link", { name: /Send WhatsApp/i });
    expect(whatsappLink.getAttribute("href")).toContain("919820011223");
    expect(whatsappLink.getAttribute("href")).toContain("token-e2e-xyz");

    // 10. Close celebration modal
    const doneBtn = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneBtn);

    // 11. Verify lead status automatically updated to QUOTED
    expect(onUpdateStatus).toHaveBeenCalledWith("QUOTED");

    // 12. Verify quote appears in the drawer's Quotations tab
    await waitFor(() => {
      expect(screen.getByText("FLY-2026-0099")).toBeTruthy();
    });
  });
});
