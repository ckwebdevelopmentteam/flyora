import { z } from "zod";

export const convertQuoteToBookingSchema = z.object({
  quotationId: z.string().uuid("Invalid quotation ID"),
  travelDate: z.string().min(1, "Travel date is required"),
  notes: z.string().max(2000).optional(),
});

export const recordPaymentSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  method: z.enum([
    "BANK_TRANSFER_NEFT_IMPS",
    "UPI",
    "CREDIT_DEBIT_OFFLINE",
    "CASH",
  ]),
  transactionRef: z
    .string()
    .min(3, "Transaction reference or UTR is required")
    .max(100),
  receiptFileKey: z
    .string()
    .min(3, "Receipt proof file key is required")
    .max(255),
  notes: z.string().max(1000).optional(),
  paymentDate: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  notes: z.string().max(1000).optional(),
});

export const bookingFilterSchema = z.object({
  status: z
    .enum(["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
  serviceId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ConvertQuoteToBookingInput = z.infer<
  typeof convertQuoteToBookingSchema
>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type BookingFilterInput = z.infer<typeof bookingFilterSchema>;
