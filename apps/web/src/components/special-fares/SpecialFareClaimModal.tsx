"use client";

import React, { useEffect, useState } from "react";
import type { SpecialFareSummary } from "@flyora/types";
import { submitSpecialFareEnquiry } from "../../lib/specialFaresApi";
import {
  X,
  Plane,
  CheckCircle2,
  Loader2,
  Luggage,
  MessageCircle,
  Users,
} from "lucide-react";

interface SpecialFareClaimModalProps {
  ticket: SpecialFareSummary | null;
  initialPassengers: number;
  onClose: () => void;
}

export function SpecialFareClaimModal({
  ticket,
  initialPassengers,
  onClose,
}: SpecialFareClaimModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [passengerCount, setPassengerCount] = useState(initialPassengers || 1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    leadId: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (ticket) {
      setPassengerCount(
        Math.min(ticket.availableSeats, Math.max(1, initialPassengers || 1)),
      );
      setErrorMsg(null);
      setSuccessData(null);
    }
  }, [ticket, initialPassengers]);

  useEffect(() => {
    if (!ticket) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [ticket, submitting, onClose]);

  if (!ticket) return null;

  const totalEstimatedFare = ticket.farePerSeat * passengerCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (phone.trim().length < 7) {
      setErrorMsg("Please enter a valid phone / WhatsApp number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitSpecialFareEnquiry(ticket.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        passengerCount,
        notes: notes.trim() || undefined,
      });
      setSuccessData({ leadId: res.leadId, message: res.message });
    } catch (err: any) {
      setErrorMsg(
        err?.message || "Could not submit your enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappText = encodeURIComponent(
    successData
      ? `Hi Flyora Travels, I submitted an enquiry for the Special Fare deal (${ticket.originCode} to ${ticket.destinationCode} on ${ticket.airlineName}). My enquiry reference: ${successData.leadId}.`
      : `Hi Flyora Travels, I would like to enquire about ${passengerCount} seat(s) on the ${ticket.originCode} to ${ticket.destinationCode} Special Fare (${ticket.airlineName} at ₹${ticket.farePerSeat}).`,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sf-modal-title"
        className="bg-white rounded-t-3xl sm:rounded-[20px] shadow-2xl border border-stone-200/80 w-full max-w-[540px] max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#002f89]">
              <Plane className="w-3.5 h-3.5" />
              Special Group Fare Deal
            </span>
            <h2
              id="sf-modal-title"
              className="text-lg sm:text-xl font-bold text-[#1C1815] mt-1"
            >
              {successData
                ? "Special Fare Enquiry Received!"
                : "Enquire About This Fare"}
            </h2>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Close enquiry dialog"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Selected Flight Deal Pill Summary */}
          <div className="p-4 rounded-[14px] bg-[#FAF9F6] border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold text-sm text-[#1C1815]">
                {ticket.originCity} ({ticket.originCode}) ➔{" "}
                {ticket.destinationCity} ({ticket.destinationCode})
              </div>
              <div className="text-sm font-bold text-[#002f89]">
                ₹{ticket.farePerSeat.toLocaleString("en-IN")}
                <span className="text-[11px] font-normal text-stone-500">
                  /seat
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
              <span>
                {ticket.airlineName}{" "}
                {ticket.flightNumber ? `(${ticket.flightNumber})` : ""}
              </span>
              <span>
                {new Date(ticket.departureDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <Luggage className="w-3.5 h-3.5" />
                {ticket.baggageInfo}
              </span>
              {ticket.isRefundable && (
                <span className="text-emerald-700 font-medium">Refundable</span>
              )}
              {(ticket.childFare != null || ticket.infantFare != null) && (
                <span className="text-stone-500">
                  {ticket.childFare != null
                    ? `Child ₹${ticket.childFare.toLocaleString("en-IN")}`
                    : ""}
                  {ticket.childFare != null && ticket.infantFare != null
                    ? " · "
                    : ""}
                  {ticket.infantFare != null
                    ? `Infant ₹${ticket.infantFare.toLocaleString("en-IN")}`
                    : ""}
                </span>
              )}
            </div>
          </div>

          {successData ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-stone-700 leading-relaxed max-w-sm mx-auto">
                  {successData.message}
                </p>
                <p className="text-xs font-mono text-stone-500">
                  Reference ID: <strong>{successData.leadId}</strong>
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/919876543210?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Discuss on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form
              id="claim-sf-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {errorMsg && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
                >
                  {errorMsg}
                </div>
              )}

              <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                This is an enquiry only. Seats are not reserved until a Flyora
                flight coordinator confirms availability and your booking.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter lead passenger full name"
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f89]/20 focus:border-[#002f89]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    WhatsApp / Mobile Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f89]/20 focus:border-[#002f89]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Passengers (Max {ticket.availableSeats})
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={passengerCount}
                      onChange={(e) =>
                        setPassengerCount(Number(e.target.value))
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#002f89]/20 focus:border-[#002f89]"
                    >
                      {Array.from(
                        { length: Math.min(9, ticket.availableSeats) },
                        (_, i) => i + 1,
                      ).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Traveller" : "Travellers"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ticket@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f89]/20 focus:border-[#002f89]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Remarks (Optional)
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Wheelchair assistance or extra baggage request"
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f89]/20 focus:border-[#002f89]"
                />
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="block text-[11px] text-stone-500">
                    Estimated fare ({passengerCount}{" "}
                    {passengerCount === 1 ? "seat" : "seats"})
                  </span>
                  <span className="text-lg font-bold text-[#1C1815]">
                    ₹{totalEstimatedFare.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-md bg-[#002f89] hover:bg-[#00246b] text-white text-xs font-semibold tracking-wide inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Send Enquiry</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
