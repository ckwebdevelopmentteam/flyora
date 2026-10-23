"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Phone, Printer } from "lucide-react";
import {
  coordinatorNumber,
  formatQuoteDate,
  quoteExpired,
  type PublicQuote,
} from "./publicQuote";
import styles from "./QuoteProposal.module.css";

type Validity = Pick<PublicQuote, "validUntil" | "isExpired" | "status"> & {
  initialNow: number;
};
function useQuoteClock(initialNow: number, validUntil: string) {
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const interval = setInterval(update, 15000);
    const deadline = setTimeout(
      update,
      Math.min(Math.max(0, Date.parse(validUntil) - Date.now()), 2147483647),
    );
    const onVisible = () => {
      if (!document.hidden) update();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      clearTimeout(deadline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [validUntil]);
  return now;
}

export function QuoteValidity(props: Validity) {
  const now = useQuoteClock(props.initialNow, props.validUntil);
  const expired = quoteExpired(props, now);
  if (expired)
    return (
      <div className={styles.expired} role="status">
        {Date.parse(props.validUntil) <= now
          ? `This quotation expired on ${formatQuoteDate(props.validUntil)}.`
          : "This quotation has expired."}{" "}
        Please contact your coordinator for an updated quote.
      </div>
    );
  if (props.status === "DRAFT")
    return (
      <div className={styles.notice}>
        Draft proposal — please ask your coordinator for the final quotation
        before confirming.
      </div>
    );
  if (props.status === "REJECTED")
    return (
      <div className={styles.notice}>
        This quotation is closed. Your coordinator can prepare a revised
        proposal.
      </div>
    );
  if (props.status === "ACCEPTED")
    return (
      <div className={styles.notice}>
        This quotation is marked as accepted. Contact your coordinator for the
        next booking steps.
      </div>
    );
  const hours = Math.max(
    1,
    Math.ceil((Date.parse(props.validUntil) - now) / 3600000),
  );
  return (
    <div className={styles.validity}>
      Offer valid until {formatQuoteDate(props.validUntil)}{" "}
      <span>
        {hours >= 24
          ? `${Math.ceil(hours / 24)} days remaining`
          : `${hours} ${hours === 1 ? "hour" : "hours"} remaining`}
      </span>
    </div>
  );
}

export function QuoteActions(
  props: Validity &
    Pick<PublicQuote, "coordinator" | "quoteNumber" | "serviceTitle">,
) {
  const now = useQuoteClock(props.initialNow, props.validUntil);
  const expired = quoteExpired(props, now);
  const number = coordinatorNumber(props.coordinator.phone);
  const confirm = !expired && props.status === "SENT";
  const revised = expired || props.status === "REJECTED";
  const label = confirm
    ? "Accept & Confirm via WhatsApp"
    : revised
      ? "Request an Updated Quote"
      : props.status === "DRAFT"
        ? "Request the Final Quote"
        : "Discuss Your Booking";
  const message = confirm
    ? `Hi ${props.coordinator.fullName}, I reviewed quotation #${props.quoteNumber} for ${props.serviceTitle}. I would like to confirm and proceed with booking!`
    : `Hi ${props.coordinator.fullName}, I reviewed quotation #${props.quoteNumber} for ${props.serviceTitle}. ${revised ? "Please send me an updated quotation." : props.status === "DRAFT" ? "Please share the final quotation." : "I would like to discuss the next booking steps."}`;
  return (
    <div className={styles.actions} aria-label="Quotation actions">
      {number ? (
        <>
          <a
            className={styles.whatsapp}
            href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} aria-hidden="true" />
            {label}
          </a>
          <a className={styles.call} href={`tel:+${number}`}>
            <Phone size={17} aria-hidden="true" />
            Call Coordinator
          </a>
        </>
      ) : (
        <p className={styles.contactMissing}>
          Please contact your Flyora coordinator to discuss this proposal.
        </p>
      )}
      <button className={styles.print} onClick={() => window.print()}>
        <Printer size={17} aria-hidden="true" />
        Print / Save PDF
      </button>
      <p className={styles.actionHint}>
        WhatsApp opens a conversation. Your coordinator will confirm
        availability and booking.
      </p>
    </div>
  );
}

export function QuoteRetry() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      className={styles.retry}
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? "Loading your quotation…" : "Try again"}
    </button>
  );
}
