// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { bookingsApi } from "./bookingsApi";
import type { BookingRecord } from "./types";

vi.mock("./bookingsApi", () => ({
  bookingsApi: {
    recordPayment: vi.fn(),
    uploadReceiptSlip: vi.fn(),
  },
}));

const mockBooking: BookingRecord = {
  id: "bk-test-01",
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
  serviceName: "Dubai Luxury Holidays",
};

describe("RecordPaymentModal Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(cleanup);

  it("renders booking financials, due balance, and preset buttons", () => {
    render(
      <RecordPaymentModal
        isOpen={true}
        onClose={vi.fn()}
        booking={mockBooking}
      />,
    );

    expect(screen.getByText("Record Offline Payment")).toBeTruthy();
    expect(screen.getByText(/BK-2026-0042/i)).toBeTruthy();
    expect(screen.getByText(/₹1,80,000/i)).toBeTruthy();
    expect(screen.getByText(/₹60,000/i)).toBeTruthy();
    expect(screen.getAllByText(/₹1,20,000/i).length).toBeGreaterThanOrEqual(1);

    // Default amount set to full due
    const amountInput = screen.getByPlaceholderText("0") as HTMLInputElement;
    expect(amountInput.value).toBe("120000");

    // Click 50% preset
    const halfBtn = screen.getByRole("button", { name: "50% Due" });
    fireEvent.click(halfBtn);
    expect(amountInput.value).toBe("60000");
  });

  it("validates required fields: transaction ref and receipt proof", async () => {
    render(
      <RecordPaymentModal
        isOpen={true}
        onClose={vi.fn()}
        booking={mockBooking}
      />,
    );

    const submitBtn = screen.getByRole("button", {
      name: /Record & Submit for Verification/i,
    });
    fireEvent.click(submitBtn);

    // Should require transaction reference
    expect(
      await screen.findByText(/Transaction reference or Bank UTR is required/i),
    ).toBeTruthy();
  });

  it("records payment successfully with transaction ref and uploaded receipt proof", async () => {
    vi.mocked(bookingsApi.uploadReceiptSlip).mockResolvedValue({
      fileKey: "receipts/slip-2026.png",
      publicUrl: "https://r2.flyora.com/slip.png",
    });

    vi.mocked(bookingsApi.recordPayment).mockResolvedValue({
      id: "pay-new-01",
      bookingId: mockBooking.id,
      recordedById: "coord-01",
      amount: 60000,
      method: "UPI",
      transactionRef: "UPI/528391823901",
      receiptFileKey: "receipts/slip-2026.png",
      status: "PENDING",
      paymentDate: "2026-10-23",
      createdAt: new Date().toISOString(),
    });

    const onPaymentRecorded = vi.fn();
    const onClose = vi.fn();

    render(
      <RecordPaymentModal
        isOpen={true}
        onClose={onClose}
        booking={mockBooking}
        onPaymentRecorded={onPaymentRecorded}
      />,
    );

    // Fill UTR
    const utrInput = screen.getByPlaceholderText(/e.g. UPI\/528391823901/i);
    fireEvent.change(utrInput, { target: { value: "UPI/528391823901" } });

    // Simulate file upload
    const file = new File(["dummy content"], "payment_slip.png", {
      type: "image/png",
    });
    const fileDropzone = screen.getByText(
      /Click to upload or drag & drop slip proof/i,
    );
    fireEvent.drop(fileDropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(bookingsApi.uploadReceiptSlip).toHaveBeenCalledOnce();
    });

    // Submit form
    const submitBtn = screen.getByRole("button", {
      name: /Record & Submit for Verification/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(bookingsApi.recordPayment).toHaveBeenCalledWith(mockBooking.id, {
        amount: 120000,
        method: "UPI",
        transactionRef: "UPI/528391823901",
        receiptFileKey: "receipts/slip-2026.png",
        paymentDate: expect.any(String),
        notes: undefined,
      });
      expect(onPaymentRecorded).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it("keeps failed uploads unsubmitted and allows retrying the same file", async () => {
    vi.mocked(bookingsApi.uploadReceiptSlip)
      .mockRejectedValueOnce(
        new Error(
          "Private storage rejected the receipt upload. Please try again.",
        ),
      )
      .mockResolvedValueOnce({ fileKey: "receipts/retry.png" });
    render(
      <RecordPaymentModal isOpen booking={mockBooking} onClose={vi.fn()} />,
    );
    const input = screen.getByLabelText("Payment receipt") as HTMLInputElement;
    const file = new File(["proof"], "slip.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(input.value).toBe("");
    fireEvent.change(screen.getByPlaceholderText(/e.g. UPI/), {
      target: { value: "UTR-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Record & Submit/ }));
    expect(bookingsApi.recordPayment).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/Please attach a payment receipt/),
    ).toBeTruthy();
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText("slip.png")).toBeTruthy();
    expect(bookingsApi.uploadReceiptSlip).toHaveBeenCalledTimes(2);
  });

  it("rejects unsupported receipt files before upload", async () => {
    render(
      <RecordPaymentModal isOpen booking={mockBooking} onClose={vi.fn()} />,
    );
    fireEvent.change(screen.getByLabelText("Payment receipt"), {
      target: {
        files: [new File(["html"], "bad.html", { type: "text/html" })],
      },
    });
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Choose a PNG, JPG or PDF receipt.",
    );
    expect(bookingsApi.uploadReceiptSlip).not.toHaveBeenCalled();
  });

  it("prevents duplicate submission and retains the form on a server failure", async () => {
    let rejectRequest!: (reason: Error) => void;
    vi.mocked(bookingsApi.uploadReceiptSlip).mockResolvedValue({
      fileKey: "receipts/slip.png",
    });
    vi.mocked(bookingsApi.recordPayment).mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectRequest = reject;
        }),
    );
    const close = vi.fn(),
      recorded = vi.fn();
    const { container } = render(
      <RecordPaymentModal
        isOpen
        booking={mockBooking}
        onClose={close}
        onPaymentRecorded={recorded}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText(/e.g. UPI/), {
      target: { value: "UTR-123" },
    });
    fireEvent.change(screen.getByLabelText("Payment receipt"), {
      target: {
        files: [new File(["proof"], "slip.png", { type: "image/png" })],
      },
    });
    await screen.findByText("slip.png");
    fireEvent.submit(container.querySelector("form")!);
    fireEvent.submit(container.querySelector("form")!);
    expect(bookingsApi.recordPayment).toHaveBeenCalledOnce();
    rejectRequest(new Error("Receipt is missing from storage"));
    expect(
      await screen.findByText("Receipt is missing from storage"),
    ).toBeTruthy();
    expect(close).not.toHaveBeenCalled();
    expect(recorded).not.toHaveBeenCalled();
  });
});
