import React, { useState, useId, useRef } from "react";
import type { LeadItem } from "@flyora/types";
import type { QuotationRecord } from "../quotes/types";
import type { BookingRecord } from "./types";
import { bookingsApi } from "./bookingsApi";
import { formatINR } from "./paymentCalculator";
import { Copy, ExternalLink, MessageSquare, Loader2 } from "lucide-react";
import { Modal, FormError } from "../../components/ui/Modal";
import { userMessage } from "../../lib/userMessage";

interface ConvertBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: QuotationRecord;
  lead: LeadItem;
  onBookingConverted?: (booking: BookingRecord) => void;
}

export const ConvertBookingModal: React.FC<ConvertBookingModalProps> = ({
  isOpen,
  onClose,
  quotation,
  lead,
  onBookingConverted,
}) => {
  const formId = useId();
  const submitting = useRef(false);
  const [travelDate, setTravelDate] = useState<string>(() => {
    if (lead.travelDate) {
      return new Date(lead.travelDate).toISOString().slice(0, 10);
    }
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success celebration state
  const [createdBooking, setCreatedBooking] = useState<BookingRecord | null>(
    null,
  );
  const [copiedVoucher, setCopiedVoucher] = useState<boolean>(false);

  if (!isOpen) return null;

  const paxCount = (lead.numberOfAdults || 1) + (lead.numberOfKids || 0);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    if (!travelDate || !Number.isFinite(Date.parse(travelDate))) {
      setErrorMessage("Choose a valid travel date.");
      return;
    }
    submitting.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const booking = await bookingsApi.convertQuoteToBooking({
        quotationId: quotation.id,
        travelDate,
        notes: notes.trim() || undefined,
        customerName: lead.customer.fullName,
        customerPhone: lead.customer.phone,
        customerEmail: lead.customer.email || undefined,
        customerCity: lead.customer.city || undefined,
        serviceName: lead.serviceName,
        packageTitle: lead.packageTitle || null,
        sellingPrice: quotation.sellingPrice,
        leadId: lead.id,
        paxCount,
        adultsCount: lead.numberOfAdults,
        kidsCount: lead.numberOfKids,
        quoteNumber: quotation.quoteNumber,
      });

      setCreatedBooking(booking);
      if (onBookingConverted) {
        onBookingConverted(booking);
      }
    } catch (err: any) {
      setErrorMessage(
        userMessage(err, "We couldn't confirm this booking. Please try again."),
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  // Base URL for trip voucher
  const webBaseUrl =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://flyora.com";

  const publicVoucherUrl = createdBooking
    ? `${webBaseUrl}/booking/${createdBooking.bookingRef}`
    : "";

  const cleanPhone = lead.customer.phone.replace(/[^0-9]/g, "");

  const whatsAppMessage = createdBooking
    ? `🎉 Congratulations ${lead.customer.fullName}! Greetings from Flyora Travels.

Your booking for ${lead.packageTitle || lead.serviceName} is confirmed!
• Booking Reference: ${createdBooking.bookingRef}
• Travel Date: ${new Date(travelDate).toLocaleDateString()}
• Total Package Amount: ${formatINR(createdBooking.totalAmount)}

Access your digital Trip Voucher and verified itinerary details here:
${publicVoucherUrl}

Our operations team will be coordinating all flight and hotel confirmations with you.`
    : "";

  const directWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    whatsAppMessage,
  )}`;

  const handleCopyVoucher = async () => {
    try {
      await navigator.clipboard.writeText(publicVoucherUrl);
      setCopiedVoucher(true);
      setTimeout(() => setCopiedVoucher(false), 2500);
    } catch {
      setErrorMessage(
        "We couldn't copy the link. Select it and copy it manually.",
      );
    }
  };

  return (
    <Modal
      title={createdBooking ? "Booking confirmed" : "Confirm booking"}
      description={`${lead.customer.fullName} · ${lead.packageTitle || lead.serviceName}`}
      onClose={onClose}
      busy={isSubmitting}
      footer={
        createdBooking ? (
          <>
            <a
              className="button-secondary"
              href={publicVoucherUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview voucher <ExternalLink size={15} />
            </a>
            <button className="button-primary" onClick={onClose}>
              Done
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="button-secondary"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="button-primary"
              type="submit"
              form={formId}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Confirming…
                </>
              ) : (
                "Confirm booking"
              )}
            </button>
          </>
        )
      }
    >
      <FormError>{errorMessage}</FormError>
      {!createdBooking ? (
        <form id={formId} onSubmit={handleConfirm} className="space-y-6">
          <dl className="review-list">
            <div>
              <dt>Quotation</dt>
              <dd>{quotation.quoteNumber}</dd>
            </div>
            <div>
              <dt>Travellers</dt>
              <dd>{paxCount}</dd>
            </div>
            <div>
              <dt>Booking total</dt>
              <dd>{formatINR(quotation.sellingPrice)}</dd>
            </div>
          </dl>
          <div className="field">
            <label htmlFor="booking-travel-date">Travel date</label>
            <input
              id="booking-travel-date"
              type="date"
              value={travelDate}
              onChange={(event) => setTravelDate(event.target.value)}
              required
              disabled={isSubmitting}
            />
            <small>This will appear on the customer's trip voucher.</small>
          </div>
          <div className="field">
            <label htmlFor="booking-staff-notes">
              Staff notes <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="booking-staff-notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isSubmitting}
              placeholder="Anything your team should know about this trip"
            />
          </div>
          <div className="notice">
            This confirms the booking and creates a customer trip voucher.
            Record any payments separately in Bookings & payments.
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <p className="text-xl font-semibold">{createdBooking.bookingRef}</p>
          <dl className="review-list">
            <div>
              <dt>Total amount</dt>
              <dd>{formatINR(createdBooking.totalAmount)}</dd>
            </div>
            <div>
              <dt>Balance due</dt>
              <dd>{formatINR(createdBooking.dueAmount)}</dd>
            </div>
          </dl>
          <div className="field">
            <label htmlFor="voucher-link">Customer trip voucher</label>
            <div className="flex gap-2">
              <input
                id="voucher-link"
                readOnly
                value={publicVoucherUrl}
                className="min-w-0"
                onFocus={(event) => event.currentTarget.select()}
              />
              <button
                className="button-secondary shrink-0"
                onClick={handleCopyVoucher}
              >
                <Copy size={15} />
                {copiedVoucher ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
          {cleanPhone && (
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button-primary w-full"
            >
              <MessageSquare size={16} />
              Open in WhatsApp
            </a>
          )}
          <p className="text-xs text-slate-500">
            Opening WhatsApp prepares the voucher message. You choose when to
            send it.
          </p>
        </div>
      )}
    </Modal>
  );
};
