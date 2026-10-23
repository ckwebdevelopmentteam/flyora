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
import { BookingsPage } from "./BookingsPage";
import { bookingsApi } from "./bookingsApi";
import { quotesApi } from "../quotes/quotesApi";
import type { LeadItem, LeadActivityItem } from "@flyora/types";
import type { QuotationRecord } from "../quotes/types";
import type { BookingRecord, PaymentRecord } from "./types";

vi.mock("./bookingsApi", () => ({
  bookingsApi: {
    fetchBookings: vi.fn(),
    fetchBookingById: vi.fn(),
    convertQuoteToBooking: vi.fn(),
    recordPayment: vi.fn(),
    verifyPayment: vi.fn(),
    getReceiptPresignedUrl: vi.fn(),
    uploadReceiptSlip: vi.fn(),
  },
}));

vi.mock("../quotes/quotesApi", () => ({
  quotesApi: {
    fetchQuotationsForLead: vi.fn(),
    createQuotation: vi.fn(),
    updateQuoteStatus: vi.fn(),
  },
}));

vi.mock("../../stores/authStore", () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: {
        id: "admin-01",
        email: "admin@flyora.com",
        fullName: "Operations Admin",
        role: "OPERATIONS_MANAGER",
      },
    }),
}));

const mockLead: LeadItem = {
  id: "lead-e2e-01",
  customerId: "cust-01",
  customer: {
    id: "cust-01",
    fullName: "Tariq & Zoya Merchant",
    phone: "+91 98111 22334",
    email: "tariq@example.com",
    city: "Mumbai",
  },
  serviceId: "srv-kashmir",
  serviceName: "Kashmir Paradise Tour",
  packageId: "pkg-ksm-01",
  packageTitle: "6D/5N Enchanting Kashmir",
  assignedToId: "coord-01",
  assignedToName: "Coordinator One",
  claimedAt: new Date().toISOString(),
  status: "QUOTED",
  source: "WHATSAPP_CLICK",
  travelDate: "2026-12-15T00:00:00.000Z",
  numberOfAdults: 2,
  numberOfKids: 0,
  estimatedBudget: 150000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockActivities: LeadActivityItem[] = [
  {
    id: "act-01",
    leadId: mockLead.id,
    userId: "coord-01",
    userName: "Coordinator One",
    action: "STATUS_CHANGED",
    details: "Quote sent to customer on WhatsApp",
    createdAt: new Date().toISOString(),
  },
];

const mockQuote: QuotationRecord = {
  id: "quote-e2e-01",
  quoteNumber: "FLY-2026-0088",
  leadId: mockLead.id,
  createdById: "coord-01",
  status: "SENT",
  shareToken: "token-ksm-88",
  supplierCost: 110000,
  sellingPrice: 140000,
  marginAmount: 30000,
  marginPercent: 21.4,
  items: [],
  inclusions: ["Deluxe Houseboat", "Pahalgam Day Tour"],
  exclusions: ["Airfare"],
  validUntil: "2026-11-30",
  createdAt: new Date().toISOString(),
};

describe("Dev 2 Module 6 End-to-End Workflow Verification", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(cleanup);

  it("completes full quote-to-booking conversion, offline payment logging, R2 slip upload, and accounts verification", async () => {
    // Stage 1: Setup Mocks
    vi.mocked(quotesApi.fetchQuotationsForLead).mockResolvedValue([mockQuote]);

    const createdBooking: BookingRecord = {
      id: "bk-e2e-01",
      bookingRef: "BK-2026-0088",
      leadId: mockLead.id,
      quotationId: mockQuote.id,
      status: "CONFIRMED",
      totalAmount: 140000,
      paidAmount: 0,
      dueAmount: 140000,
      travelDate: "2026-12-15",
      createdAt: new Date().toISOString(),
      customerName: mockLead.customer.fullName,
      customerPhone: mockLead.customer.phone,
      customerCity: mockLead.customer.city,
      serviceName: mockLead.serviceName,
      packageTitle: mockLead.packageTitle,
      paxCount: 2,
      payments: [],
    };

    vi.mocked(bookingsApi.convertQuoteToBooking).mockResolvedValue(
      createdBooking,
    );
    const onUpdateStatus = vi.fn().mockResolvedValue(undefined);

    // 1. Coordinator opens Lead Detail Drawer
    const { unmount: unmountDrawer } = render(
      <LeadDetailDrawer
        lead={mockLead}
        activities={mockActivities}
        isOpen={true}
        onClose={vi.fn()}
        onUpdateStatus={onUpdateStatus}
        onAddNote={vi.fn()}
      />,
    );

    // Switch to Quotations Tab
    const quotesTabBtn = screen.getByRole("button", { name: /Quotations/i });
    fireEvent.click(quotesTabBtn);

    // Verify Quote Card is visible
    expect(await screen.findByText("FLY-2026-0088")).toBeTruthy();

    // 2. Click "Convert to Booking"
    const convertBtn = screen.getByRole("button", {
      name: /Convert to Booking/i,
    });
    fireEvent.click(convertBtn);

    // 3. ConvertBookingModal opens
    expect(
      await screen.findByText("Convert to Confirmed Booking"),
    ).toBeTruthy();
    expect(screen.getAllByText("₹1,40,000").length).toBeGreaterThanOrEqual(1);

    // Confirm conversion
    const confirmConversionBtn = screen.getByRole("button", {
      name: /Confirm Booking \(Generate Reference\)/i,
    });
    fireEvent.click(confirmConversionBtn);

    // 4. Celebration modal appears with BK-2026-0088 and WhatsApp voucher link
    await waitFor(() => {
      expect(bookingsApi.convertQuoteToBooking).toHaveBeenCalledOnce();
      expect(onUpdateStatus).toHaveBeenCalledWith("BOOKED");
    });

    expect(await screen.findByText("BK-2026-0088")).toBeTruthy();
    expect(screen.getByText(/Booking Confirmed/i)).toBeTruthy();

    // Close modal & unmount drawer
    const doneBtn = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneBtn);
    unmountDrawer();

    // Stage 2: Bookings Dashboard Table
    let currentBookingInStore: BookingRecord = { ...createdBooking };
    vi.mocked(bookingsApi.fetchBookings).mockImplementation(() =>
      Promise.resolve([currentBookingInStore]),
    );

    const { unmount: unmountDashboard } = render(<BookingsPage />);

    expect(await screen.findByText("BK-2026-0088")).toBeTruthy();
    expect(screen.getByText("Tariq & Zoya Merchant")).toBeTruthy();

    // Initially UNPAID
    expect(screen.getByText("UNPAID")).toBeTruthy();

    // 5. Click "Payment" to record manual offline advance
    const paymentBtn = screen.getByRole("button", { name: "Payment" });
    fireEvent.click(paymentBtn);

    expect(await screen.findByText("Record Offline Payment")).toBeTruthy();

    // Upload receipt slip
    vi.mocked(bookingsApi.uploadReceiptSlip).mockResolvedValue({
      fileKey: "receipts/kashmir-upi-slip.png",
      publicUrl: "https://r2.flyora.com/slip.png",
    });

    const pendingPayment: PaymentRecord = {
      id: "pay-e2e-01",
      bookingId: currentBookingInStore.id,
      recordedById: "coord-01",
      recordedByName: "Coordinator One",
      amount: 50000,
      method: "UPI",
      transactionRef: "UPI/592840192841",
      receiptFileKey: "receipts/kashmir-upi-slip.png",
      status: "PENDING",
      paymentDate: "2026-10-23",
      createdAt: new Date().toISOString(),
    };

    vi.mocked(bookingsApi.recordPayment).mockImplementation(() => {
      currentBookingInStore = {
        ...currentBookingInStore,
        payments: [pendingPayment],
      };
      return Promise.resolve(pendingPayment);
    });

    // Enter UTR and Amount (default is 140000, change to 50000 advance)
    const amountInput = screen.getByPlaceholderText("0");
    fireEvent.change(amountInput, { target: { value: "50000" } });

    const utrInput = screen.getByPlaceholderText(/e.g. UPI\/528391823901/i);
    fireEvent.change(utrInput, { target: { value: "UPI/592840192841" } });

    // Simulate drop file
    const file = new File(["test receipt"], "kashmir_upi.png", {
      type: "image/png",
    });
    const dropzone = screen.getByText(
      /Click to upload or drag & drop slip proof/i,
    );
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(bookingsApi.uploadReceiptSlip).toHaveBeenCalledOnce();
    });

    // Submit payment
    const recordSubmitBtn = screen.getByRole("button", {
      name: /Record & Submit for Verification/i,
    });
    fireEvent.click(recordSubmitBtn);

    await waitFor(() => {
      expect(bookingsApi.recordPayment).toHaveBeenCalledOnce();
    });

    unmountDashboard();

    // Stage 3: Accounts Verification in BookingDetailDrawer
    const verifiedPayment: PaymentRecord = {
      ...pendingPayment,
      status: "VERIFIED",
    };

    currentBookingInStore = {
      ...currentBookingInStore,
      paidAmount: 50000,
      dueAmount: 90000,
      payments: [verifiedPayment],
    };

    vi.mocked(bookingsApi.verifyPayment).mockResolvedValue(verifiedPayment);
    vi.mocked(bookingsApi.fetchBookings).mockResolvedValue([
      currentBookingInStore,
    ]);

    render(<BookingsPage />);

    expect(await screen.findByText("BK-2026-0088")).toBeTruthy();

    // Open Details Drawer
    const detailsBtn = screen.getByRole("button", { name: "Details" });
    fireEvent.click(detailsBtn);

    // Verify payment in drawer
    expect(await screen.findByText("UPI/592840192841")).toBeTruthy();
    expect(screen.getAllByText("₹1,40,000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("₹50,000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("₹90,000").length).toBeGreaterThanOrEqual(1);

    // Progress updated to 36%
    expect(screen.getByText("36%")).toBeTruthy();
    expect(screen.getAllByText("PARTIALLY PAID").length).toBeGreaterThanOrEqual(
      1,
    );
  });
});
