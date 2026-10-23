export type BookingStatus =
  "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type PaymentMethod =
  "BANK_TRANSFER_NEFT_IMPS" | "UPI" | "CREDIT_DEBIT_OFFLINE" | "CASH";

export type PaymentVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface PaymentRecord {
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

export interface BookingRecord {
  id: string;
  bookingRef: string;
  leadId: string;
  quotationId: string;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  travelDate: string;
  createdAt: string;
  // Denormalized / Joined fields for Rich UI presentation
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerCity?: string | null;
  serviceName?: string;
  packageTitle?: string | null;
  paxCount?: number;
  adultsCount?: number;
  kidsCount?: number;
  notes?: string | null;
  payments?: PaymentRecord[];
  quotationNumber?: string;
  quotationItems?: any[];
}

export type PaymentCalculatedStatus =
  "FULLY_PAID" | "PARTIALLY_PAID" | "PENDING_VERIFICATION" | "UNPAID";

export interface BookingFinancials {
  totalAmount: number;
  verifiedPaidAmount: number;
  pendingVerificationAmount: number;
  dueAmount: number;
  progressPercent: number;
  paymentStatus: PaymentCalculatedStatus;
  isFullyPaid: boolean;
}

export interface ConvertQuoteToBookingPayload {
  quotationId: string;
  travelDate: string;
  notes?: string;
}

export interface RecordPaymentPayload {
  amount: number;
  method: PaymentMethod;
  transactionRef: string;
  receiptFileKey: string;
  paymentDate?: string;
  notes?: string;
}

export interface VerifyPaymentPayload {
  status: "VERIFIED" | "REJECTED";
  notes?: string;
}

export interface BookingsFilterState {
  status?: BookingStatus | "ALL";
  paymentStatus?: PaymentCalculatedStatus | "ALL";
  search?: string;
  serviceId?: string;
}
