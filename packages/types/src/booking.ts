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

export interface BookingSummary {
  id: string;
  bookingRef: string;
  leadId: string;
  quotationId: string;
  quoteNumber?: string;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  travelDate: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  serviceSlug: string;
  coordinatorName?: string;
  createdAt: string;
}

export interface BookingDetails {
  id: string;
  bookingRef: string;
  leadId: string;
  quotationId: string;
  quoteNumber?: string;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  travelDate: string;
  notes?: string | null;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    phone: string;
    email?: string | null;
    city?: string | null;
  };
  service: {
    id: string;
    name: string;
    slug: string;
  };
  quotation: {
    id: string;
    quoteNumber: string;
    sellingPrice: number;
    items: any[];
    inclusions: string[];
    exclusions: string[];
  };
  coordinator: {
    id: string;
    fullName: string;
    phone?: string | null;
  };
  payments: PaymentItem[];
}

export interface PublicBookingView {
  bookingRef: string;
  status: BookingStatus;
  travelDate: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  isFullyPaid: boolean;
  customerName: string;
  serviceTitle: string;
  serviceSlug: string;
  itineraryItems: {
    title: string;
    type: string;
    description?: string;
    quantity: number;
  }[];
  inclusions: string[];
  exclusions: string[];
  coordinator: {
    fullName: string;
    phone?: string | null;
  };
  createdAt: string;
}
