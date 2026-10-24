import { apiClient } from "../../lib/apiClient";
import { receiptContentType } from "./receiptUpload";
import type {
  BookingRecord,
  PaymentRecord,
  ConvertQuoteToBookingPayload,
  RecordPaymentPayload,
  VerifyPaymentPayload,
  BookingsFilterState,
} from "./types";

import type { BookingDetails, BookingSummary } from "@flyora/types";

function normalizeBooking(
  data: BookingDetails | BookingSummary,
): BookingRecord {
  if (!data?.id || !data.bookingRef)
    throw new Error("The booking response was incomplete. Please refresh.");
  const common = {
    id: data.id,
    bookingRef: data.bookingRef,
    leadId: data.leadId,
    quotationId: data.quotationId,
    status: data.status,
    totalAmount: data.totalAmount,
    paidAmount: data.paidAmount,
    dueAmount: data.dueAmount,
    travelDate: data.travelDate,
    createdAt: data.createdAt,
    quotationNumber: data.quoteNumber,
    payments: data.payments,
  };
  if ("customer" in data)
    return {
      ...common,
      customerName: data.customer.fullName,
      customerPhone: data.customer.phone,
      customerEmail: data.customer.email,
      customerCity: data.customer.city,
      serviceName: data.service.name,
      quotationItems: data.quotation.items,
    };
  return {
    ...common,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    serviceName: data.serviceName,
  };
}
interface BookingPage {
  items: BookingSummary[];
  totalPages: number;
}

export const bookingsApi = {
  /**
   * Fetch all bookings with optional filtering
   */
  async fetchBookings(filters?: BookingsFilterState): Promise<BookingRecord[]> {
    const params = new URLSearchParams({ limit: "100" });
    if (filters?.status && filters.status !== "ALL")
      params.set("status", filters.status);
    if (filters?.serviceId) params.set("serviceId", filters.serviceId);
    const readPage = async (page: number) => {
      const query = new URLSearchParams(params);
      query.set("page", String(page));
      const result = await apiClient.get<BookingPage>(`/bookings?${query}`);
      if (
        !Array.isArray(result?.items) ||
        !Number.isInteger(result.totalPages) ||
        result.totalPages < 1
      )
        throw new Error("The booking list was incomplete. Please try again.");
      return result;
    };
    const first = await readPage(1);
    const items = [...first.items];
    // Fetch further pages in bounded batches; never substitute cached/demo records.
    for (let page = 2; page <= first.totalPages; page += 4) {
      const pages = await Promise.all(
        Array.from(
          { length: Math.min(4, first.totalPages - page + 1) },
          (_, offset) => readPage(page + offset),
        ),
      );
      items.push(...pages.flatMap((result) => result.items));
    }
    const results = items.map(normalizeBooking);
    const search = filters?.search?.trim().toLowerCase();
    return search
      ? results.filter((booking) =>
          [
            booking.bookingRef,
            booking.customerName,
            booking.customerPhone,
            booking.serviceName,
          ].some((value) => value?.toLowerCase().includes(search)),
        )
      : results;
  },

  /**
   * Fetch single booking by ID
   */
  async fetchBookingById(id: string): Promise<BookingRecord | null> {
    const response = await apiClient.get<BookingDetails>(
      `/bookings/${encodeURIComponent(id)}`,
    );
    return normalizeBooking(response);
  },

  /**
   * 1-Click WhatsApp Booking Conversion: Converts Quotation into a Confirmed Booking
   */
  async convertQuoteToBooking(
    payload: ConvertQuoteToBookingPayload & {
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      customerCity?: string;
      serviceName?: string;
      packageTitle?: string | null;
      sellingPrice?: number;
      leadId?: string;
      paxCount?: number;
      adultsCount?: number;
      kidsCount?: number;
      quoteNumber?: string;
    },
  ): Promise<BookingRecord> {
    const response = await apiClient.post<BookingDetails>(
      "/bookings/convert-quote",
      {
        quotationId: payload.quotationId,
        travelDate: payload.travelDate,
        notes: payload.notes,
      },
    );
    return {
      ...normalizeBooking(response),
      packageTitle: payload.packageTitle,
      paxCount: payload.paxCount,
      adultsCount: payload.adultsCount,
      kidsCount: payload.kidsCount,
    };
  },

  /**
   * Record manual offline payment for a booking
   */
  async recordPayment(
    bookingId: string,
    payload: RecordPaymentPayload,
  ): Promise<PaymentRecord> {
    const response = await apiClient.post<PaymentRecord>(
      `/bookings/${encodeURIComponent(bookingId)}/payments`,
      payload,
    );
    if (!response?.id || response.status !== "PENDING")
      throw new Error(
        "Payment was not confirmed by the server. Refresh the booking before trying again.",
      );
    return response;
  },

  /**
   * Accounts / Admin verification of recorded payment
   */
  async verifyPayment(
    paymentId: string,
    payload: VerifyPaymentPayload,
  ): Promise<PaymentRecord> {
    const response = await apiClient.patch<PaymentRecord>(
      `/payments/${encodeURIComponent(paymentId)}/verify`,
      payload,
    );
    if (response?.id !== paymentId || response.status !== payload.status)
      throw new Error(
        "The payment status was not confirmed. Refresh the booking before trying again.",
      );
    return response;
  },

  /**
   * Fetch 15-minute presigned secure download URL for receipt proof from private R2 bucket
   */
  async replacePaymentReceipt(
    paymentId: string,
    receiptFileKey: string,
  ): Promise<void> {
    const result = await apiClient.patch<
      Pick<PaymentRecord, "id" | "status" | "receiptFileKey">
    >(`/payments/${encodeURIComponent(paymentId)}/receipt`, { receiptFileKey });
    if (
      result?.id !== paymentId ||
      result.receiptFileKey !== receiptFileKey ||
      result.status !== "PENDING"
    )
      throw new Error(
        "Receipt replacement was not confirmed. Refresh the booking before trying again.",
      );
  },

  async getReceiptPresignedUrl(paymentId: string): Promise<{ url: string }> {
    const response = await apiClient.get<{ downloadUrl: string }>(
      `/payments/${encodeURIComponent(paymentId)}/receipt-url`,
    );
    if (
      !response?.downloadUrl ||
      new URL(response.downloadUrl).protocol !== "https:"
    )
      throw new Error("The receipt could not be opened. Please try again.");
    return { url: response.downloadUrl };
  },

  /**
   * Upload payment slip proof to Cloudflare R2 private bucket
   */
  async uploadReceiptSlip(
    file: File,
  ): Promise<{ fileKey: string; publicUrl?: string }> {
    const contentType = receiptContentType(file);
    const presigned = await apiClient.post<{
      uploadUrl: string;
      fileKey: string;
      isMock: boolean;
    }>("/storage/upload-url", {
      folder: "receipts",
      filename: file.name,
      contentType,
    });
    if (
      presigned?.isMock !== false ||
      !presigned.fileKey?.startsWith("receipts/")
    )
      throw new Error(
        "Private receipt storage is unavailable. Please try again after it is configured.",
      );
    const url = new URL(presigned.uploadUrl);
    if (url.protocol !== "https:" || url.username || url.password)
      throw new Error(
        "Private receipt storage returned an invalid upload URL.",
      );
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
        credentials: "omit",
        redirect: "error",
        signal: AbortSignal.timeout(60000),
      });
    } catch {
      throw new Error(
        "Receipt upload failed. Check your connection and try again.",
      );
    }
    if (!response.ok)
      throw new Error(
        "Private storage rejected the receipt upload. Please try again.",
      );
    return { fileKey: presigned.fileKey };
  },
};
