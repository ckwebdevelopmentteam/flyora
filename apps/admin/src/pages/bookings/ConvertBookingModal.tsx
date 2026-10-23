import React, { useState } from "react";
import type { LeadItem } from "@flyora/types";
import type { QuotationRecord } from "../quotes/types";
import type { BookingRecord } from "./types";
import { bookingsApi } from "./bookingsApi";
import { formatINR } from "./paymentCalculator";
import {
  Calendar,
  Check,
  Compass,
  Copy,
  ExternalLink,
  FileCheck,
  Loader2,
  Lock,
  MessageSquare,
  Sparkles,
  Users,
  X,
} from "lucide-react";

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
        err.message || "Failed to convert quote to booking. Please try again.",
      );
    } finally {
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
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150">
          {!createdBooking ? (
            /* Conversion Confirmation Form */
            <form onSubmit={handleConfirm}>
              {/* Header */}
              <div className="px-6 py-5 bg-[#FAFAF9] border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                    <FileCheck className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">
                      Convert to Confirmed Booking
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Advances quote #{quotation.quoteNumber} to confirmed
                      booking
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200/60 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Error Banner */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs"
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Quotation Snapshot Card */}
                <div className="p-4 rounded-xl bg-[#F8F8F6] border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                        Customer & Trip
                      </span>
                      <p className="text-sm font-semibold text-zinc-900">
                        {lead.customer.fullName}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {lead.packageTitle || lead.serviceName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                        Total Package Price
                      </span>
                      <p className="text-base font-bold font-mono text-zinc-900">
                        {formatINR(quotation.sellingPrice)}
                      </p>
                      <span className="inline-block mt-0.5 text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        {quotation.marginPercent.toFixed(1)}% Margin
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      {paxCount} Pax ({lead.numberOfAdults}A,{" "}
                      {lead.numberOfKids}K)
                    </span>
                    <span>Quote: #{quotation.quoteNumber}</span>
                  </div>
                </div>

                {/* Travel Date */}
                <div>
                  <label className="text-xs font-semibold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    Confirmed Travel Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-1">
                    Customer trip voucher will reflect this departure date
                  </span>
                </div>

                {/* Internal Coordinator Notes */}
                <div>
                  <label className="text-xs font-semibold text-zinc-800 block mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    Internal Booking Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Advance paid via UPI, hotel reservations held until 5 PM..."
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-zinc-400 resize-none"
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-6 py-4 bg-[#FAFAF9] border-t border-zinc-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-black hover:bg-zinc-200/60 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Confirming Booking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Confirm Booking (Generate Reference)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Celebration & Dispatch Success Modal */
            <div>
              {/* Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-6 text-white relative">
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                    <Compass className="w-4 h-4" />
                  </span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
                    Booking Confirmed
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight font-mono">
                  {createdBooking.bookingRef}
                </h2>
                <p className="text-xs text-emerald-100/90 mt-1">
                  Trip confirmed for {lead.customer.fullName} •{" "}
                  {lead.packageTitle || lead.serviceName}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8F8F6] border border-zinc-200 font-mono text-center">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 block font-sans">
                      Total Package
                    </span>
                    <span className="text-base font-bold text-zinc-900">
                      {formatINR(createdBooking.totalAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 block font-sans">
                      Balance Due
                    </span>
                    <span className="text-base font-bold text-amber-700">
                      {formatINR(createdBooking.dueAmount)}
                    </span>
                  </div>
                </div>

                {/* Digital Trip Voucher Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-800 block">
                    Customer Digital Trip Voucher Link
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAFAF9] border border-zinc-200">
                    <input
                      type="text"
                      readOnly
                      value={publicVoucherUrl}
                      className="flex-1 bg-transparent text-xs font-mono text-zinc-600 select-all focus:outline-hidden truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyVoucher}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-xs ${
                        copiedVoucher
                          ? "bg-emerald-600 text-white"
                          : "bg-black text-white hover:bg-zinc-800"
                      }`}
                    >
                      {copiedVoucher ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* WhatsApp Pitch / Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  {cleanPhone && (
                    <a
                      href={directWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send WhatsApp Trip Voucher</span>
                    </a>
                  )}

                  <a
                    href={publicVoucherUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-medium transition"
                  >
                    <span>Preview Voucher</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
