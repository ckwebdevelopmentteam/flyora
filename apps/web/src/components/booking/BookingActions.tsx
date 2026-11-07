"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Phone, Printer, RefreshCw } from "lucide-react";
import { coordinatorNumber } from "../quote/publicQuote";
import type { PublicBooking } from "./publicBooking";
import shared from "../quote/QuoteProposal.module.css";

export function BookingActions({
  coordinator,
  bookingRef,
  serviceTitle,
  status,
}: Pick<
  PublicBooking,
  "coordinator" | "bookingRef" | "serviceTitle" | "status"
>) {
  const number = coordinatorNumber(coordinator.phone);
  const message = `Hi ${coordinator.fullName}, I am checking my ${status === "CANCELLED" ? "cancelled " : ""}booking ${bookingRef} for ${serviceTitle}. I have a query regarding ${status === "CANCELLED" ? "the cancellation and next steps." : "my trip."}`;
  return (
    <div className={shared.actions} aria-label="Booking actions">
      {number ? (
        <>
          <a
            className={shared.whatsapp}
            href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Chat with Coordinator on WhatsApp
          </a>
          <a className={shared.call} href={`tel:+${number}`}>
            <Phone size={17} aria-hidden="true" />
            Emergency Call
          </a>
        </>
      ) : (
        <p className={shared.contactMissing}>
          Please contact your Flyora coordinator for help with this booking.
        </p>
      )}
      <button
        type="button"
        className={shared.print}
        onClick={() => window.print()}
      >
        <Printer size={17} aria-hidden="true" />
        Print / Save PDF Voucher
      </button>
      <p className={shared.actionHint}>
        Contact actions open your phone or WhatsApp. They do not change your
        booking or record a payment.
      </p>
    </div>
  );
}

export function BookingRefresh({ retry = false }: { retry?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={shared.retry}
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw size={15} aria-hidden="true" />
      {pending
        ? "Updating voucher…"
        : retry
          ? "Try again"
          : "Refresh payment status"}
    </button>
  );
}
