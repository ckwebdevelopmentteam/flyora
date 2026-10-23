import { describe, it, expect } from "vitest";
import {
  calculateBookingFinancials,
  formatINR,
  formatPaymentMethod,
} from "./paymentCalculator";
import type { PaymentRecord } from "./types";

describe("Payment Calculator Engine", () => {
  it("computes UNPAID status when no payments have been recorded", () => {
    const result = calculateBookingFinancials({
      totalAmount: 120000,
      payments: [],
    });

    expect(result.totalAmount).toBe(120000);
    expect(result.verifiedPaidAmount).toBe(0);
    expect(result.pendingVerificationAmount).toBe(0);
    expect(result.dueAmount).toBe(120000);
    expect(result.progressPercent).toBe(0);
    expect(result.paymentStatus).toBe("UNPAID");
    expect(result.isFullyPaid).toBe(false);
  });

  it("identifies PENDING_VERIFICATION when payment is recorded but not yet verified by accounts", () => {
    const payments: PaymentRecord[] = [
      {
        id: "p1",
        bookingId: "b1",
        recordedById: "u1",
        amount: 35000,
        method: "UPI",
        transactionRef: "UPI/394829104",
        receiptFileKey: "receipts/slip-01.png",
        status: "PENDING",
        paymentDate: "2026-10-23",
        createdAt: "2026-10-23",
      },
    ];

    const result = calculateBookingFinancials({
      totalAmount: 100000,
      payments,
    });

    expect(result.verifiedPaidAmount).toBe(0);
    expect(result.pendingVerificationAmount).toBe(35000);
    expect(result.dueAmount).toBe(100000); // Pending payments do not deduct due amount until verified
    expect(result.progressPercent).toBe(0);
    expect(result.paymentStatus).toBe("PENDING_VERIFICATION");
    expect(result.isFullyPaid).toBe(false);
  });

  it("computes PARTIALLY_PAID status and correct progress percentage for verified advance", () => {
    const payments: PaymentRecord[] = [
      {
        id: "p1",
        bookingId: "b1",
        recordedById: "u1",
        amount: 50000,
        method: "BANK_TRANSFER_NEFT_IMPS",
        transactionRef: "HDFC938491",
        receiptFileKey: "receipts/neft.pdf",
        status: "VERIFIED",
        paymentDate: "2026-10-20",
        createdAt: "2026-10-20",
      },
      {
        id: "p2",
        bookingId: "b1",
        recordedById: "u1",
        amount: 20000,
        method: "UPI",
        transactionRef: "UPI/9482918",
        receiptFileKey: "receipts/fake.jpg",
        status: "REJECTED", // Rejected does not count
        paymentDate: "2026-10-21",
        createdAt: "2026-10-21",
      },
      {
        id: "p3",
        bookingId: "b1",
        recordedById: "u1",
        amount: 25000,
        method: "UPI",
        transactionRef: "UPI/1092839",
        receiptFileKey: "receipts/pending.png",
        status: "PENDING", // Pending tracked separately
        paymentDate: "2026-10-22",
        createdAt: "2026-10-22",
      },
    ];

    const result = calculateBookingFinancials({
      totalAmount: 100000,
      payments,
    });

    expect(result.verifiedPaidAmount).toBe(50000);
    expect(result.pendingVerificationAmount).toBe(25000);
    expect(result.dueAmount).toBe(50000);
    expect(result.progressPercent).toBe(50);
    expect(result.paymentStatus).toBe("PARTIALLY_PAID");
    expect(result.isFullyPaid).toBe(false);
  });

  it("computes FULLY_PAID status when verified payments equal or exceed total amount", () => {
    const payments: PaymentRecord[] = [
      {
        id: "p1",
        bookingId: "b1",
        recordedById: "u1",
        amount: 70000,
        method: "BANK_TRANSFER_NEFT_IMPS",
        transactionRef: "NEFT-01",
        receiptFileKey: "receipts/01.pdf",
        status: "VERIFIED",
        paymentDate: "2026-10-15",
        createdAt: "2026-10-15",
      },
      {
        id: "p2",
        bookingId: "b1",
        recordedById: "u1",
        amount: 30000,
        method: "UPI",
        transactionRef: "UPI-02",
        receiptFileKey: "receipts/02.png",
        status: "VERIFIED",
        paymentDate: "2026-10-22",
        createdAt: "2026-10-22",
      },
    ];

    const result = calculateBookingFinancials({
      totalAmount: 100000,
      payments,
    });

    expect(result.verifiedPaidAmount).toBe(100000);
    expect(result.dueAmount).toBe(0);
    expect(result.progressPercent).toBe(100);
    expect(result.paymentStatus).toBe("FULLY_PAID");
    expect(result.isFullyPaid).toBe(true);
  });

  it("formats currency values cleanly in INR format", () => {
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(45000)).toBe("₹45,000");
    expect(formatINR(1250000)).toBe("₹12,50,000");
  });

  it("returns clean labels for payment methods", () => {
    expect(formatPaymentMethod("UPI")).toBe("UPI Transfer");
    expect(formatPaymentMethod("BANK_TRANSFER_NEFT_IMPS")).toBe(
      "Bank Transfer (NEFT/IMPS)",
    );
    expect(formatPaymentMethod("CASH")).toBe("Cash Deposit");
    expect(formatPaymentMethod("CREDIT_DEBIT_OFFLINE")).toBe(
      "Credit/Debit Card (POS)",
    );
  });
});
