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
import styles from "./ProposalDocument.module.css";

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
          ? `Expired on ${formatQuoteDate(props.validUntil)}.`
          : "This quote has expired."}{" "}
        Request an updated quote.
      </div>
    );
  if (props.status === "DRAFT")
    return (
      <div className={styles.notice}>
        Draft · Ask for the final quote before booking.
      </div>
    );
  if (props.status === "REJECTED")
    return (
      <div className={styles.notice}>
        Closed · Ask your advisor for a new quote.
      </div>
    );
  if (props.status === "ACCEPTED")
    return (
      <div className={styles.notice}>
        Accepted · Contact your advisor to arrange your booking.
      </div>
    );
  return (
    <div className={styles.validity}>
      Valid until {formatQuoteDate(props.validUntil)}
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
    ? "Discuss & book"
    : revised
      ? "Request new quote"
      : props.status === "DRAFT"
        ? "Request final quote"
        : "Discuss booking";
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
            Call advisor
          </a>
        </>
      ) : (
        <p className={styles.contactMissing}>
          Contact your travel advisor to continue.
        </p>
      )}
      <button className={styles.print} onClick={() => window.print()}>
        <Printer size={17} aria-hidden="true" />
        Save / Print PDF
      </button>
      {number && confirm && (
        <p className={styles.actionHint}>
          Opens WhatsApp. Your advisor will confirm your booking.
        </p>
      )}
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
