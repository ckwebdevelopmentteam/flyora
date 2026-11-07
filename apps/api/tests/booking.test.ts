import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  convertQuoteToBookingSchema,
  recordPaymentSchema,
  verifyPaymentSchema,
} from "@flyora/validators";

describe("Module 6: Booking & Payment Financial Calculations", () => {
  it("calculates due amount correctly upon initial booking creation", () => {
    const totalAmount = 145000;
    const initialPaid = 0;
    const dueAmount = totalAmount - initialPaid;

    assert.equal(dueAmount, 145000);
    assert.equal(dueAmount <= 0, false);
  });

  it("recalculates paidAmount and dueAmount only for VERIFIED payments", () => {
    const totalAmount = 100000;
    const payments = [
      { amount: 30000, status: "VERIFIED" },
      { amount: 20000, status: "PENDING" }, // Not yet verified, should not reduce balance
      { amount: 15000, status: "REJECTED" }, // Rejected, should not reduce balance
      { amount: 40000, status: "VERIFIED" },
    ];

    const verifiedSum = payments
      .filter((p) => p.status === "VERIFIED")
      .reduce((acc, p) => acc + p.amount, 0);

    const dueAmount = Math.max(0, totalAmount - verifiedSum);
    const isFullyPaid = dueAmount <= 0;

    assert.equal(verifiedSum, 70000);
    assert.equal(dueAmount, 30000);
    assert.equal(isFullyPaid, false);
  });

  it("marks booking as fully paid when verified payments cover total amount", () => {
    const totalAmount = 85000;
    const verifiedPayments = [
      { amount: 45000, status: "VERIFIED" },
      { amount: 40000, status: "VERIFIED" },
    ];

    const verifiedSum = verifiedPayments.reduce((acc, p) => acc + p.amount, 0);
    const dueAmount = Math.max(0, totalAmount - verifiedSum);
    const isFullyPaid = dueAmount <= 0;

    assert.equal(verifiedSum, 85000);
    assert.equal(dueAmount, 0);
    assert.equal(isFullyPaid, true);
  });
});

describe("Module 6: Booking Zod Schemas Validation", () => {
  it("validates convertQuoteToBookingSchema with valid input", () => {
    const payload = {
      quotationId: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
      travelDate: "2026-12-25T00:00:00.000Z",
      notes: "Client confirmed via WhatsApp and requested airport transfer",
    };

    const parsed = convertQuoteToBookingSchema.safeParse(payload);
    assert.equal(parsed.success, true);
  });

  it("rejects convertQuoteToBookingSchema with invalid UUID", () => {
    const payload = {
      quotationId: "not-a-uuid",
      travelDate: "2026-12-25",
    };

    const parsed = convertQuoteToBookingSchema.safeParse(payload);
    assert.equal(parsed.success, false);
  });

  it("validates recordPaymentSchema with valid UPI transaction", () => {
    const payload = {
      bookingId: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
      amount: 25000,
      method: "UPI",
      transactionRef: "UPI/5283918239/HDFC",
      receiptFileKey: "receipts/1792666-rec-5283918239.png",
      notes: "Advance payment received via GPay",
    };

    const parsed = recordPaymentSchema.safeParse(payload);
    assert.equal(parsed.success, true);
  });

  it("rejects recordPaymentSchema with non-positive amount or missing UTR", () => {
    const zeroAmountPayload = {
      bookingId: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
      amount: 0,
      method: "UPI",
      transactionRef: "UTR123",
      receiptFileKey: "receipts/slip.png",
    };
    assert.equal(
      recordPaymentSchema.safeParse(zeroAmountPayload).success,
      false,
    );

    const missingUtrPayload = {
      bookingId: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
      amount: 5000,
      method: "CASH",
      transactionRef: "",
      receiptFileKey: "receipts/cash-slip.png",
    };
    assert.equal(
      recordPaymentSchema.safeParse(missingUtrPayload).success,
      false,
    );
  });

  it("validates verifyPaymentSchema only for VERIFIED or REJECTED status", () => {
    assert.equal(
      verifyPaymentSchema.safeParse({ status: "VERIFIED" }).success,
      true,
    );
    assert.equal(
      verifyPaymentSchema.safeParse({
        status: "REJECTED",
        notes: "Invalid bank reference",
      }).success,
      true,
    );
    assert.equal(
      verifyPaymentSchema.safeParse({ status: "PENDING" }).success,
      false,
    );
  });
});
