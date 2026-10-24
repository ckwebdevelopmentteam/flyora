// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { QuotationBuilderModal } from "./QuotationBuilderModal";
import { quotesApi } from "./quotesApi";
import type { LeadItem } from "@flyora/types";

vi.mock("./quotesApi", () => ({
  quotesApi: {
    createQuotation: vi.fn(),
    fetchQuotationsForLead: vi.fn().mockResolvedValue([]),
    updateQuoteStatus: vi.fn(),
  },
}));

const mockLead: LeadItem = {
  id: "lead-test-01",
  customerId: "cust-01",
  customer: {
    id: "cust-01",
    fullName: "Fatima Zahra",
    phone: "+91 98451 12345",
    email: "fatima@example.com",
    city: "Mumbai",
  },
  serviceId: "srv-dubai",
  serviceName: "Dubai Luxury Holidays",
  packageId: "pkg-dxb",
  packageTitle: "5D/4N Glitz of Dubai",
  assignedToId: "coord-01",
  assignedToName: "Coordinator One",
  claimedAt: new Date().toISOString(),
  status: "CONTACTED",
  source: "WEBSITE_FORM",
  travelDate: "2026-11-20T00:00:00.000Z",
  numberOfAdults: 2,
  numberOfKids: 1,
  estimatedBudget: 150000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("QuotationBuilderModal & Margin Guard (Dev 2)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(cleanup);

  it("renders lead metadata and initial package items pre-filled", () => {
    render(
      <QuotationBuilderModal lead={mockLead} isOpen={true} onClose={vi.fn()} />,
    );

    // Verify customer info & package context
    expect(screen.getByText("Fatima Zahra")).toBeTruthy();
    expect(screen.getByText("+91 98451 12345")).toBeTruthy();
    expect(screen.getByText("5D/4N Glitz of Dubai")).toBeTruthy();
    expect(screen.getByText(/3 Pax/)).toBeTruthy();

    // Verify initial line items for package exist
    expect(
      screen.getByDisplayValue("5D/4N Glitz of Dubai - Hotel Accommodation"),
    ).toBeTruthy();
    expect(
      screen.getByDisplayValue("Airport Transfers & Sightseeing Transport"),
    ).toBeTruthy();
  });

  it("adds quick preset line items when shortcut buttons are clicked", () => {
    render(
      <QuotationBuilderModal lead={mockLead} isOpen={true} onClose={vi.fn()} />,
    );

    const addFlightBtn = screen.getByRole("button", { name: "+ Flight" });
    fireEvent.click(addFlightBtn);

    expect(screen.getByDisplayValue("Round-trip Flights")).toBeTruthy();
  });

  it("lets a quantity of one be cleared and replaced without changing another row", () => {
    render(
      <QuotationBuilderModal lead={mockLead} isOpen={true} onClose={vi.fn()} />,
    );

    const [hotel, transfer] = screen.getAllByRole<HTMLInputElement>(
      "spinbutton",
      { name: "Quantity (Pax / Units)" },
    );
    expect(transfer.value).toBe("1");
    fireEvent.change(transfer, { target: { value: "" } });
    expect(transfer.value).toBe("");
    expect(hotel.value).toBe("3");

    fireEvent.change(transfer, { target: { value: "12" } });
    fireEvent.blur(transfer);
    expect(transfer.value).toBe("12");
    expect(hotel.value).toBe("3");
  });

  it("restores an empty quantity to one on blur and retains a positive minimum", () => {
    render(
      <QuotationBuilderModal lead={mockLead} isOpen={true} onClose={vi.fn()} />,
    );

    const quantity = screen.getAllByRole<HTMLInputElement>("spinbutton", {
      name: "Quantity (Pax / Units)",
    })[0];
    fireEvent.change(quantity, { target: { value: "" } });
    expect(quantity.value).toBe("");
    fireEvent.blur(quantity);
    expect(quantity.value).toBe("1");

    fireEvent.change(quantity, { target: { value: "0" } });
    expect(quantity.value).toBe("1");
    fireEvent.change(quantity, { target: { value: "-2" } });
    expect(quantity.value).toBe("1");
  });

  it("uses the replaced numeric quantity in totals and the creation payload", async () => {
    render(
      <QuotationBuilderModal lead={mockLead} isOpen={true} onClose={vi.fn()} />,
    );
    const quantity = screen.getAllByRole<HTMLInputElement>("spinbutton", {
      name: "Quantity (Pax / Units)",
    })[1];
    fireEvent.change(quantity, { target: { value: "" } });
    fireEvent.change(quantity, { target: { value: "2" } });
    fireEvent.blur(quantity);

    const costs = screen.getAllByPlaceholderText("0");
    fireEvent.change(costs[2], { target: { value: "20000" } });
    fireEvent.change(costs[3], { target: { value: "28000" } });
    expect(screen.getAllByText("₹56,000").length).toBeGreaterThan(0);

    fireEvent.click(
      screen.getByRole("button", { name: "Generate & Finalize Quotation" }),
    );
    await waitFor(() =>
      expect(quotesApi.createQuotation).toHaveBeenCalledOnce(),
    );
    expect(
      vi.mocked(quotesApi.createQuotation).mock.calls[0][0].items[1],
    ).toMatchObject({ quantity: 2, supplierCost: 20000, sellingPrice: 28000 });
  });

  it("shows sub-target warning alert and exact shortfall when prices are below target margin", async () => {
    render(
      <QuotationBuilderModal lead={mockLead} isOpen={true} onClose={vi.fn()} />,
    );

    // Set high supplier cost and low selling price on first item
    const costInputs = screen.getAllByPlaceholderText("0");
    // Cost = 100,000, Price = 105,000 -> 5,000 margin (~4.7%) which is < 12% target
    fireEvent.change(costInputs[0], { target: { value: "100000" } });
    fireEvent.change(costInputs[1], { target: { value: "105000" } });

    // Should display Sub-Target alert
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText(/Margin Below Target/i)).toBeTruthy();
    expect(
      screen.getByText(
        /You need to increase the total package price by at least/i,
      ),
    ).toBeTruthy();
  });

  it("displays Healthy Margin badge when pricing meets or exceeds floor threshold", async () => {
    render(
      <QuotationBuilderModal lead={mockLead} isOpen={true} onClose={vi.fn()} />,
    );

    // Cost = 100,000, Price = 125,000 -> 25,000 profit (20.0% > 12.0%)
    const costInputs = screen.getAllByPlaceholderText("0");
    fireEvent.change(costInputs[0], { target: { value: "100000" } });
    fireEvent.change(costInputs[1], { target: { value: "125000" } });

    expect(await screen.findByText(/Healthy Margin/i)).toBeTruthy();
    expect(
      screen.getByText(/Package pricing satisfies the minimum 12% threshold/i),
    ).toBeTruthy();
  });

  it("adds and removes inclusions chips dynamically", () => {
    render(
      <QuotationBuilderModal lead={mockLead} isOpen={true} onClose={vi.fn()} />,
    );

    expect(screen.getByText("Daily Breakfast")).toBeTruthy();

    // Click remove button on Daily Breakfast
    const removeBtn = screen.getByRole("button", {
      name: "Remove Daily Breakfast",
    });
    fireEvent.click(removeBtn);

    expect(screen.queryByText("Daily Breakfast")).toBeNull();

    // Add custom inclusion
    const customInput = screen.getByPlaceholderText(
      /Type custom inclusion & Enter/i,
    );
    fireEvent.change(customInput, { target: { value: "VIP Lounge Access" } });
    fireEvent.keyDown(customInput, { key: "Enter" });

    expect(screen.getByText("VIP Lounge Access")).toBeTruthy();
  });

  it("creates quotation and opens share modal with WhatsApp pitch", async () => {
    const onQuoteCreated = vi.fn();
    vi.mocked(quotesApi.createQuotation).mockResolvedValue({
      id: "quote-123",
      quoteNumber: "FLY-2026-0042",
      leadId: mockLead.id,
      createdById: "coord-01",
      status: "SENT",
      shareToken: "token-abc-123",
      supplierCost: 80000,
      sellingPrice: 100000,
      marginAmount: 20000,
      marginPercent: 20.0,
      items: [],
      inclusions: ["Breakfast"],
      exclusions: ["Insurance"],
      validUntil: "2026-11-25",
      createdAt: new Date().toISOString(),
    });

    render(
      <QuotationBuilderModal
        lead={mockLead}
        isOpen={true}
        onClose={vi.fn()}
        onQuoteCreated={onQuoteCreated}
      />,
    );

    // Set prices to be healthy: Cost 80,000, Selling 100,000
    const costInputs = screen.getAllByPlaceholderText("0");
    fireEvent.change(costInputs[0], { target: { value: "80000" } });
    fireEvent.change(costInputs[1], { target: { value: "100000" } });

    const submitBtn = screen.getByRole("button", {
      name: "Generate & Finalize Quotation",
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(quotesApi.createQuotation).toHaveBeenCalledOnce();
      expect(onQuoteCreated).toHaveBeenCalledOnce();
    });

    // ShareQuoteSuccessModal celebration modal should now be shown
    expect(await screen.findByText("FLY-2026-0042")).toBeTruthy();
    expect(screen.getByText(/Quotation Ready for Dispatch/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Copy Link/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Send WhatsApp/i })).toBeTruthy();
  });

  it("shows confirmation dialog if submitting a quote with sub-target margin", async () => {
    vi.mocked(quotesApi.createQuotation).mockResolvedValue({
      id: "quote-sub",
      quoteNumber: "FLY-2026-0043",
      leadId: mockLead.id,
      createdById: "coord-01",
      status: "SENT",
      shareToken: "token-sub",
      supplierCost: 95000,
      sellingPrice: 100000,
      marginAmount: 5000,
      marginPercent: 5.0,
      items: [],
      inclusions: [],
      exclusions: [],
      validUntil: "2026-11-25",
      createdAt: new Date().toISOString(),
    });

    render(
      <QuotationBuilderModal lead={mockLead} isOpen={true} onClose={vi.fn()} />,
    );

    // Sub-target margin: Cost 95,000, Selling 100,000 (5% < 12%)
    const costInputs = screen.getAllByPlaceholderText("0");
    fireEvent.change(costInputs[0], { target: { value: "95000" } });
    fireEvent.change(costInputs[1], { target: { value: "100000" } });

    const submitBtn = screen.getByRole("button", {
      name: "Generate Quotation (Sub-Target)",
    });
    fireEvent.click(submitBtn);

    // Sub-target confirmation warning dialog should be visible
    expect(await screen.findByText(/Sub-Target Margin Warning/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Proceed Anyway" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Adjust Pricing" })).toBeTruthy();

    // Click Proceed Anyway
    fireEvent.click(screen.getByRole("button", { name: "Proceed Anyway" }));

    await waitFor(() => {
      expect(quotesApi.createQuotation).toHaveBeenCalledOnce();
    });
  });
});
