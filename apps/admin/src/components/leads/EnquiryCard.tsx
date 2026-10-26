import { isFollowUpDue } from "../../lib/followUps";
import { Phone, MessageSquare } from "lucide-react";
import type { LeadItem } from "@flyora/types";

export function EnquiryCard({
  lead,
  onOpen,
  action = "Details",
  secondary,
  showOwner = false,
}: {
  lead: LeadItem;
  onOpen: () => void;
  action?: string;
  showOwner?: boolean;
  secondary?: { label: string; onClick: () => void };
}) {
  const phone = lead.customer.phone.replace(/[^0-9]/g, "");
  const stage = lead.status.charAt(0) + lead.status.slice(1).toLowerCase();
  const message = `Hello ${lead.customer.fullName}, this is Flyora Travels regarding your ${lead.packageTitle || lead.serviceName} enquiry.`;
  return (
    <article className="mobile-enquiry-card">
      <header>
        <h3>{lead.customer.fullName}</h3>
        <span
          className={`quotation-status status-${lead.status === "BOOKED" ? "accepted" : "draft"}`}
        >
          {stage}
        </span>
      </header>
      <p className="mobile-enquiry-phone">{lead.customer.phone}</p>
      <p className="mobile-enquiry-service">
        {lead.packageTitle || lead.serviceName}
      </p>
      {showOwner && (
        <p className="mobile-enquiry-owner">
          {lead.assignedToName ? `With ${lead.assignedToName}` : "Unassigned"}
        </p>
      )}
      <div className="mobile-enquiry-dates">
        {lead.travelDate && (
          <span>
            Travel{" "}
            {new Date(lead.travelDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
        {lead.followUpDate &&
          lead.status !== "BOOKED" &&
          lead.status !== "LOST" && (
            <span className={isFollowUpDue(lead) ? "text-amber-700" : ""}>
              Follow-up{" "}
              {new Date(lead.followUpDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
      </div>
      <div className="mobile-enquiry-actions">
        <a
          className="button-secondary"
          href={`tel:${phone}`}
          aria-label={`Call ${lead.customer.fullName}`}
        >
          <Phone size={15} aria-hidden="true" />
          Call
        </a>
        <a
          className="button-secondary"
          href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`WhatsApp ${lead.customer.fullName}`}
        >
          <MessageSquare size={15} aria-hidden="true" />
          WhatsApp
        </a>
        <button
          type="button"
          className="button-primary"
          onClick={onOpen}
          aria-label={`${action} for ${lead.customer.fullName}`}
        >
          {action}
        </button>
        {secondary && (
          <button
            type="button"
            className="button-secondary mobile-enquiry-secondary"
            onClick={secondary.onClick}
          >
            {secondary.label}
          </button>
        )}
      </div>
    </article>
  );
}
