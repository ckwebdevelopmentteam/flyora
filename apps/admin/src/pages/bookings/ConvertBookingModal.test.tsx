// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { ConvertBookingModal } from "./ConvertBookingModal";
import { bookingsApi } from "./bookingsApi";
import type { LeadItem } from "@flyora/types";
import type { QuotationRecord } from "../quotes/types";

vi.mock("./bookingsApi", () => ({
  bookingsApi: {
    convertQuoteToBooking: vi.fn(),
  },
}));

const mockLead: LeadItem = {
  id: "lead-01",
  customerId: "cust-01",
  customer: {
    id: "cust-01",
    fullName: "Aamir & Priya Sheikh",
    phone: "+91 98200 11223",
    email: "aamir.sheikh@example.com",
    city: "Bangalore",
  },
  serviceId: "srv-dubai",
  serviceName: "Dubai Luxury Holidays",
  packageId: "pkg-dxb",
  packageTitle: "5D/4N Glitz of Dubai",
  assignedToId: "coord-01",
  assignedToName: "Coordinator One",
  claimedAt: new Date().toISOString(),
  status: "QUOTED",
  source: "WEBSITE_FORM",
  travelDate: "2026-11-20T00:00:00.000Z",
  numberOfAdults: 2,
  numberOfKids: 1,
  estimatedBudget: 180000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockQuotation: QuotationRecord = {
  id: "quote-01",
  quoteNumber: "FLY-2026-0042",
  leadId: mockLead.id,
  createdById: "coord-01",
  status: "SENT",
  shareToken: "token-quote-42",
  supplierCost: 150000,
  sellingPrice: 185000,
  marginAmount: 35000,
  marginPercent: 18.9,
  items: [],
  inclusions: ["Breakfast", "Burj Khalifa"],
  exclusions: ["Insurance"],
  validUntil: "2026-11-15",
  createdAt: new Date().toISOString(),
};

describe("ConvertBookingModal Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(cleanup);

  it("renders quote summary, travel date picker, and internal notes", () => {
    render(
      <ConvertBookingModal
        isOpen={true}
        onClose={vi.fn()}
        quotation={mockQuotation}
        lead={mockLead}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Confirm booking" }),
    ).toBeTruthy();
    expect(screen.getByText(/Aamir & Priya Sheikh/)).toBeTruthy();
    expect(screen.getByText(/5D\/4N Glitz of Dubai/)).toBeTruthy();
    expect(screen.getByText("₹1,85,000")).toBeTruthy();
    expect(screen.getByText("Booking total")).toBeTruthy();
    expect(screen.getByDisplayValue("2026-11-20")).toBeTruthy();
  });

  it("submits booking conversion and displays celebration dialog with booking reference and voucher link", async () => {
    vi.mocked(bookingsApi.convertQuoteToBooking).mockResolvedValue({
      id: "bk-99",
      bookingRef: "BK-2026-0099",
      leadId: mockLead.id,
      quotationId: mockQuotation.id,
      status: "CONFIRMED",
      totalAmount: 185000,
      paidAmount: 0,
      dueAmount: 185000,
      travelDate: "2026-11-20",
      createdAt: new Date().toISOString(),
      customerName: mockLead.customer.fullName,
      customerPhone: mockLead.customer.phone,
    });

    const onBookingConverted = vi.fn();

    render(
      <ConvertBookingModal
        isOpen={true}
        onClose={vi.fn()}
        quotation={mockQuotation}
        lead={mockLead}
        onBookingConverted={onBookingConverted}
      />,
    );

    const submitBtn = screen.getByRole("button", {
      name: /^Confirm booking$/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(bookingsApi.convertQuoteToBooking).toHaveBeenCalledOnce();
      expect(onBookingConverted).toHaveBeenCalledOnce();
    });

    // Celebration modal
    expect(await screen.findByText("BK-2026-0099")).toBeTruthy();
    expect(screen.getByText(/Booking Confirmed/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Copy Link/i })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /Open in WhatsApp/i }),
    ).toBeTruthy();

    const whatsappLink = screen.getByRole("link", {
      name: /Open in WhatsApp/i,
    });
    expect(whatsappLink.getAttribute("href")).toContain("919820011223");
    expect(whatsappLink.getAttribute("href")).toContain("BK-2026-0099");
  });
});
