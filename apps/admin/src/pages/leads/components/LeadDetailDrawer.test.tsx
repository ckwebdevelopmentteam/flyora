// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { quotesApi } from "../../quotes/quotesApi";
import type { LeadItem, LeadActivityItem } from "@flyora/types";
import type { QuotationRecord } from "../../quotes/types";

vi.mock("../../quotes/quotesApi", () => ({
  quotesApi: {
    fetchQuotationsForLead: vi.fn(),
    createQuotation: vi.fn(),
    updateQuoteStatus: vi.fn(),
  },
}));

const mockLead: LeadItem = {
  id: "lead-drawer-01",
  customerId: "cust-01",
  customer: {
    id: "cust-01",
    fullName: "Imran Khan",
    phone: "+91 99887 66554",
    email: "imran@example.com",
    city: "Hyderabad",
  },
  serviceId: "srv-umrah",
  serviceName: "Deluxe Umrah Package",
  packageId: "pkg-umrah",
  packageTitle: "15D Executive Umrah",
  assignedToId: "coord-01",
  assignedToName: "Coordinator One",
  claimedAt: new Date().toISOString(),
  status: "QUOTED",
  source: "WHATSAPP_CLICK",
  travelDate: "2026-12-10T00:00:00.000Z",
  numberOfAdults: 2,
  numberOfKids: 0,
  estimatedBudget: 220000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockActivities: LeadActivityItem[] = [
  {
    id: "act-1",
    leadId: mockLead.id,
    userId: "coord-01",
    userName: "Coordinator One",
    action: "STATUS_CHANGED",
    details: "Changed status from NEW to CONTACTED",
    createdAt: new Date().toISOString(),
  },
];

const mockQuotes: QuotationRecord[] = [
  {
    id: "q-1",
    quoteNumber: "FLY-2026-0088",
    leadId: mockLead.id,
    createdById: "coord-01",
    status: "SENT",
    shareToken: "token-umrah-88",
    supplierCost: 180000,
    sellingPrice: 220000,
    marginAmount: 40000,
    marginPercent: 18.2,
    items: [],
    inclusions: ["Makkah Hotel", "Madinah Hotel"],
    exclusions: ["Personal laundry"],
    validUntil: "2026-11-30",
    createdAt: new Date().toISOString(),
  },
];

describe("LeadDetailDrawer Quotations Integration (Dev 2)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(cleanup);

  it("renders prominent Create Quotation button and Quotations tab", async () => {
    vi.mocked(quotesApi.fetchQuotationsForLead).mockResolvedValue(mockQuotes);

    render(
      <LeadDetailDrawer
        lead={mockLead}
        activities={mockActivities}
        isOpen={true}
        onClose={vi.fn()}
        onUpdateStatus={vi.fn()}
        onAddNote={vi.fn()}
      />,
    );

    // Verify Create Quotation button is visible in header
    expect(
      screen.getByRole("button", {
        name: /Create quotation/i,
      }),
    ).toBeTruthy();

    // Verify Quotations tab button is present
    expect(screen.getByRole("button", { name: /Quotations/i })).toBeTruthy();
  });

  it("switches to Quotations tab and displays quote history with copy and WhatsApp actions", async () => {
    vi.mocked(quotesApi.fetchQuotationsForLead).mockResolvedValue(mockQuotes);

    render(
      <LeadDetailDrawer
        lead={mockLead}
        activities={mockActivities}
        isOpen={true}
        onClose={vi.fn()}
        onUpdateStatus={vi.fn()}
        onAddNote={vi.fn()}
      />,
    );

    const quotesTabBtn = screen.getByRole("button", { name: /Quotations/i });
    fireEvent.click(quotesTabBtn);

    // Quote details should be displayed
    expect(await screen.findByText("FLY-2026-0088")).toBeTruthy();
    expect(screen.getByText("Sent")).toBeTruthy();
    expect(screen.getByText("₹2,20,000")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy Link" })).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: "WhatsApp" }).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("opens QuotationBuilderModal when Create Quotation button is clicked", async () => {
    vi.mocked(quotesApi.fetchQuotationsForLead).mockResolvedValue([]);

    render(
      <LeadDetailDrawer
        lead={mockLead}
        activities={mockActivities}
        isOpen={true}
        onClose={vi.fn()}
        onUpdateStatus={vi.fn()}
        onAddNote={vi.fn()}
      />,
    );

    const createQuoteBtn = screen.getByRole("button", {
      name: /Create quotation/i,
    });
    fireEvent.click(createQuoteBtn);

    // Modal title should appear
    expect(
      await screen.findByRole("dialog", { name: "Create quotation" }),
    ).toBeTruthy();
  });
});

describe("Enquiry request failures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(quotesApi.fetchQuotationsForLead).mockResolvedValue([]);
  });
  afterEach(cleanup);
  const draw = (onAddNote = vi.fn(), onUpdateStatus = vi.fn()) =>
    render(
      <LeadDetailDrawer
        lead={mockLead}
        activities={[]}
        isOpen
        onClose={vi.fn()}
        onAddNote={onAddNote}
        onUpdateStatus={onUpdateStatus}
      />,
    );
  it("keeps an unsaved note and displays a safe error", async () => {
    draw(vi.fn().mockRejectedValue(new Error("Internal provider exception")));
    fireEvent.change(screen.getByRole("textbox", { name: "Staff note" }), {
      target: { value: "Call tomorrow" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Note/i }));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "We couldn't save the note. Please try again.",
    );
    expect(screen.getByRole("textbox", { name: "Staff note" })).toHaveProperty(
      "value",
      "Call tomorrow",
    );
  });
  it("doesn't pretend a rejected stage change succeeded", async () => {
    draw(
      vi.fn(),
      vi.fn().mockRejectedValue(new Error("Internal provider exception")),
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Enquiry stage" }), {
      target: { value: "CONTACTED" },
    });
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "We couldn't change the stage. Please try again.",
    );
    expect(
      screen.getByRole("combobox", { name: "Enquiry stage" }),
    ).toHaveProperty("value", "QUOTED");
  });
  it("offers retry instead of saying there are no quotations when loading fails", async () => {
    vi.mocked(quotesApi.fetchQuotationsForLead).mockRejectedValueOnce(
      new Error("Internal provider exception"),
    );
    draw();
    fireEvent.click(screen.getByRole("button", { name: /Quotations/ }));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("We couldn't load the quotations"),
    );
    expect(screen.queryByText("No quotations created yet")).toBeNull();
    vi.mocked(quotesApi.fetchQuotationsForLead).mockResolvedValue(mockQuotes);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("FLY-2026-0088")).toBeTruthy();
  });
});
