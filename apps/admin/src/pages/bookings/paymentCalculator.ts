import type {
  PaymentRecord,
  BookingFinancials,
  PaymentCalculatedStatus,
  PaymentMethod,
} from "./types";

export interface CalculateBookingFinancialsInput {
  totalAmount: number;
  payments?: PaymentRecord[] | null;
}

/**
 * Pure calculation engine to compute real-time verified balance,
 * pending verification amounts, payment progress percentages, and status.
 */
export function calculateBookingFinancials({
  totalAmount,
  payments = [],
}: CalculateBookingFinancialsInput): BookingFinancials {
  const safeTotal = Math.max(0, Number(totalAmount) || 0);
  const safePayments = Array.isArray(payments) ? payments : [];

  const verifiedPaidAmount = safePayments
    .filter((p) => p && p.status === "VERIFIED")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const pendingVerificationAmount = safePayments
    .filter((p) => p && p.status === "PENDING")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const dueAmount = Math.max(0, safeTotal - verifiedPaidAmount);

  let progressPercent = 0;
  if (safeTotal > 0) {
    progressPercent = Math.min(
      100,
      Math.max(0, Math.round((verifiedPaidAmount / safeTotal) * 100)),
    );
  } else if (verifiedPaidAmount > 0) {
    progressPercent = 100;
  }

  let paymentStatus: PaymentCalculatedStatus = "UNPAID";
  if (safeTotal > 0 && verifiedPaidAmount >= safeTotal) {
    paymentStatus = "FULLY_PAID";
  } else if (verifiedPaidAmount > 0) {
    paymentStatus = "PARTIALLY_PAID";
  } else if (pendingVerificationAmount > 0) {
    paymentStatus = "PENDING_VERIFICATION";
  } else {
    paymentStatus = "UNPAID";
  }

  return {
    totalAmount: safeTotal,
    verifiedPaidAmount,
    pendingVerificationAmount,
    dueAmount,
    progressPercent,
    paymentStatus,
    isFullyPaid: paymentStatus === "FULLY_PAID",
  };
}

/**
 * Format currency in Indian Rupee format (INR).
 */
export function formatINR(amount: number): string {
  const safeNum = Math.round(Number(amount) || 0);
  return "₹" + safeNum.toLocaleString("en-IN");
}

/**
 * Human readable label for payment method enum.
 */
export function formatPaymentMethod(method: PaymentMethod): string {
  switch (method) {
    case "BANK_TRANSFER_NEFT_IMPS":
      return "Bank Transfer (NEFT/IMPS)";
    case "UPI":
      return "UPI Transfer";
    case "CASH":
      return "Cash Deposit";
    case "CREDIT_DEBIT_OFFLINE":
      return "Credit/Debit Card (POS)";
    default:
      return method;
  }
}
