export type BookingStatus =
  "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type PaymentMethod =
  "BANK_TRANSFER_NEFT_IMPS" | "UPI" | "CREDIT_DEBIT_OFFLINE" | "CASH";

export type PaymentVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface PaymentItem {
  id: string;
  bookingId: string;
  recordedById: string;
  recordedByName?: string;
  amount: number;
  method: PaymentMethod;
  transactionRef: string;
  receiptFileKey: string;
  receiptPresignedUrl?: string;
  status: PaymentVerificationStatus;
  notes?: string | null;
  paymentDate: string;
  createdAt: string;
}

export interface BookingDetails {
  id: string;
  bookingRef: string;
  leadId: string;
  quotationId: string;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  travelDate: string;
  payments?: PaymentItem[];
  createdAt: string;
}
