import { Link } from "react-router-dom";
import {
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";
import type { LeadItem } from "@flyora/types";
import type { QuotationRecord } from "../../quotes/types";
import { quotePublicUrl } from "../../quotes/quotePresentation";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});
const date = (value: string) =>
  Number.isFinite(Date.parse(value))
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not set";
export function QuotationCard({
  quote,
  lead,
  copied,
  onCopy,
  onBook,
}: {
  quote: QuotationRecord;
  lead: LeadItem;
  copied: boolean;
  onCopy: () => void;
  onBook: () => void;
}) {
  const url = quotePublicUrl(quote.shareToken);
  const phone = lead.customer.phone.replace(/[^0-9]/g, "");
  const pitch = `Hello ${lead.customer.fullName}! Here is your travel quotation from Flyora Travels:\nTotal: ${money.format(quote.sellingPrice)}\nValid until: ${date(quote.validUntil)}\n${url}`;
  const booked = lead.status === "BOOKED";
  const status = quote.status.charAt(0) + quote.status.slice(1).toLowerCase();
  return (
    <article className="saved-quotation">
      <header>
        <h3>{quote.quoteNumber}</h3>
        <span
          className={`quotation-status status-${quote.status.toLowerCase()}`}
        >
          {status}
        </span>
      </header>
      <div className="quotation-price">
        <span>Customer total</span>
        <strong>{money.format(quote.sellingPrice)}</strong>
      </div>
      <dl className="quotation-facts">
        <div>
          <dt>Estimated profit</dt>
          <dd>
            {money.format(quote.marginAmount)}{" "}
            <span>({quote.marginPercent.toFixed(1)}%)</span>
          </dd>
        </div>
        <div>
          <dt>Valid until</dt>
          <dd>{date(quote.validUntil)}</dd>
        </div>
        <div>
          <dt>Services</dt>
          <dd>{quote.items?.length || 0}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{date(quote.createdAt)}</dd>
        </div>
      </dl>
      <div className="quotation-actions">
        <button type="button" className="button-secondary" onClick={onCopy}>
          {copied ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <Copy size={15} aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <a
          className="button-secondary"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={15} aria-hidden="true" />
          View quote
        </a>
        {phone && (
          <a
            className="button-secondary"
            href={`https://wa.me/${phone}?text=${encodeURIComponent(pitch)}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageSquare size={15} aria-hidden="true" />
            WhatsApp
          </a>
        )}
      </div>
      {booked ? (
        <div className="quotation-booked">
          <CalendarCheck size={17} aria-hidden="true" />
          <span>
            {quote.status === "ACCEPTED"
              ? "Booking confirmed"
              : "Enquiry already booked"}
          </span>
          <Link to="/bookings">View bookings</Link>
        </div>
      ) : (
        <button
          type="button"
          className="button-primary w-full"
          onClick={onBook}
        >
          <CalendarCheck size={16} aria-hidden="true" />
          Confirm booking
        </button>
      )}
    </article>
  );
}
