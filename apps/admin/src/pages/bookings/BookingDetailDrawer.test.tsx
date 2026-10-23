// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { BookingDetailDrawer } from "./BookingDetailDrawer";
import { bookingsApi } from "./bookingsApi";
import type { BookingRecord } from "./types";

vi.mock("./bookingsApi", () => ({
  bookingsApi: {
    verifyPayment: vi.fn(),
    getReceiptPresignedUrl: vi.fn(),
  },
}));

vi.mock("../../stores/authStore", () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: {
        id: "admin-01",
        email: "admin@flyora.com",
        fullName: "Super Admin",
        role: "SUPER_ADMIN",
      },
    }),
}));

const mockBooking: BookingRecord = {
  id: "bk-drawer-01",
  bookingRef: "BK-2026-0042",
  leadId: "lead-01",
  quotationId: "quote-01",
  status: "CONFIRMED",
  totalAmount: 180000,
  paidAmount: 60000,
  dueAmount: 120000,
  travelDate: "2026-11-20",
  createdAt: new Date().toISOString(),
  customerName: "Aamir & Priya Sheikh",
  customerPhone: "+91 98200 11223",
  customerCity: "Bangalore",
  serviceName: "Dubai Luxury Holidays",
  packageTitle: "5D/4N Glitz of Dubai",
  paxCount: 3,
  payments: [
    {
      id: "pay-01",
      bookingId: "bk-drawer-01",
      recordedById: "coord-01",
      recordedByName: "Coordinator One",
      amount: 60000,
      method: "BANK_TRANSFER_NEFT_IMPS",
      transactionRef: "HDFC92849182",
      receiptFileKey: "receipts/hdfc.pdf",
      status: "VERIFIED",
      paymentDate: "2026-10-20",
      createdAt: new Date().toISOString(),
    },
    {
      id: "pay-02",
      bookingId: "bk-drawer-01",
      recordedById: "coord-01",
      recordedByName: "Coordinator One",
      amount: 40000,
      method: "UPI",
      transactionRef: "UPI/394829104",
      receiptFileKey: "receipts/upi-slip.png",
      status: "PENDING",
      paymentDate: "2026-10-22",
      createdAt: new Date().toISOString(),
    },
  ],
};

describe("BookingDetailDrawer Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(cleanup);

  it("renders booking details, trip info, and financial metrics", () => {
    render(
      <BookingDetailDrawer
        isOpen={true}
        onClose={vi.fn()}
        booking={mockBooking}
      />,
    );

    expect(screen.getByText("BK-2026-0042")).toBeTruthy();
    expect(screen.getByText("Aamir & Priya Sheikh")).toBeTruthy();
    expect(screen.getByText("Bangalore")).toBeTruthy();
    expect(screen.getByText("Dubai Luxury Holidays")).toBeTruthy();
    expect(screen.getByText("5D/4N Glitz of Dubai")).toBeTruthy();
    expect(screen.getByText("₹1,80,000")).toBeTruthy();
    expect(screen.getAllByText("₹60,000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("₹1,20,000")).toBeTruthy();
  });

  it("displays payment list with status tags and allows Admin to verify a pending payment", async () => {
    vi.mocked(bookingsApi.verifyPayment).mockResolvedValue({
      id: "pay-02",
      bookingId: mockBooking.id,
      recordedById: "coord-01",
      amount: 40000,
      method: "UPI",
      transactionRef: "UPI/394829104",
      receiptFileKey: "receipts/upi-slip.png",
      status: "VERIFIED",
      paymentDate: "2026-10-22",
      createdAt: new Date().toISOString(),
    });

    const onPaymentVerified = vi.fn();

    render(
      <BookingDetailDrawer
        isOpen={true}
        onClose={vi.fn()}
        booking={mockBooking}
        onPaymentVerified={onPaymentVerified}
      />,
    );

    expect(screen.getByText("HDFC92849182")).toBeTruthy();
    expect(screen.getByText("UPI/394829104")).toBeTruthy();
    expect(screen.getByText("PENDING")).toBeTruthy();

    // Click Verify button for pending payment
    const verifyBtn = screen.getByRole("button", { name: "Verify" });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(bookingsApi.verifyPayment).toHaveBeenCalledWith("pay-02", {
        status: "VERIFIED",
      });
      expect(onPaymentVerified).toHaveBeenCalledOnce();
    });
  });

  it("opens presigned receipt URL when View Receipt Slip is clicked", async () => {
    const windowOpenSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null);

    vi.mocked(bookingsApi.getReceiptPresignedUrl).mockResolvedValue({
      url: "https://r2.flyora.com/presigned-slip-url",
    });

    render(
      <BookingDetailDrawer
        isOpen={true}
        onClose={vi.fn()}
        booking={mockBooking}
      />,
    );

    const receiptButtons = screen.getAllByRole("button", {
      name: /View Receipt Slip/i,
    });
    fireEvent.click(receiptButtons[0]);

    await waitFor(() => {
      expect(bookingsApi.getReceiptPresignedUrl).toHaveBeenCalledWith("pay-01");
      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://r2.flyora.com/presigned-slip-url",
        "_blank",
        "noopener,noreferrer",
      );
    });

    windowOpenSpy.mockRestore();
  });
});
