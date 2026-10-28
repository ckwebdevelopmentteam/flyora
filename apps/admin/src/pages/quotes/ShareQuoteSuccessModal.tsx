import React, { useState } from "react";
import type { QuotationRecord } from "./types";
import { Check, Copy, ExternalLink, MessageSquare } from "lucide-react";
import { Modal, FormError } from "../../components/ui/Modal";

interface ShareQuoteSuccessModalProps {
  quote: QuotationRecord;
  customerName?: string;
  customerPhone?: string;
  destinationOrService?: string;
  adultsCount?: number;
  kidsCount?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareQuoteSuccessModal: React.FC<ShareQuoteSuccessModalProps> = ({
  quote,
  customerName = "Valued Traveler",
  customerPhone = "",
  destinationOrService = "Your Dream Trip",
  adultsCount = 1,
  kidsCount = 0,
  isOpen,
  onClose,
}) => {
  const [copyError, setCopyError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  if (!isOpen) return null;

  // Determine web URL: default to current host's web port or flyora.com
  const webBaseUrl =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://flyora.com";

  const publicQuoteUrl = `${webBaseUrl}/quote/${quote.shareToken}`;

  const travelersText = `${adultsCount} Adult${adultsCount > 1 ? "s" : ""}${
    kidsCount > 0 ? `, ${kidsCount} Child${kidsCount > 1 ? "ren" : ""}` : ""
  }`;

  const formattedPrice =
    "₹" + Math.round(quote.sellingPrice).toLocaleString("en-IN");
  const formattedDate = new Date(quote.validUntil).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const whatsAppPitchText = `Hello ${customerName}! Greetings from Flyora Travels.

Here is your customized travel quotation for ${destinationOrService}:
• Travelers: ${travelersText}
• Total Package Price: ${formattedPrice} (All Inclusive)
• Valid Until: ${formattedDate}

View your detailed day-by-day itinerary and package inclusions here:
${publicQuoteUrl}

Feel free to reply here if you'd like any customizations!`;

  const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
  const directWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    whatsAppPitchText,
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicQuoteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopyError(
        "We couldn't copy this. Select the link or message and copy it manually.",
      );
    }
  };

  const handleCopyPitch = async () => {
    try {
      await navigator.clipboard.writeText(whatsAppPitchText);
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2500);
    } catch {
      setCopyError(
        "We couldn't copy this. Select the link or message and copy it manually.",
      );
    }
  };

  return (
    <Modal
      title="Quotation saved"
      description={`${quote.quoteNumber} · ${customerName}`}
      onClose={onClose}
      footer={
        <>
          <a
            href={publicQuoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button-secondary"
          >
            Preview quotation <ExternalLink size={15} />
          </a>
          <button className="button-primary" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="notice flex justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Customer total</p>
            <strong className="text-lg">{formattedPrice}</strong>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Valid until</p>
            <strong>{formattedDate}</strong>
          </div>
        </div>
        <FormError>{copyError}</FormError>
        <div className="field">
          <label htmlFor="quote-customer-link">Customer link</label>
          <div className="flex gap-2">
            <input
              id="quote-customer-link"
              readOnly
              value={publicQuoteUrl}
              className="min-w-0"
              onFocus={(event) => event.currentTarget.select()}
            />
            <button
              type="button"
              className="button-secondary shrink-0"
              onClick={handleCopyLink}
            >
              {copiedLink ? <Check size={15} /> : <Copy size={15} />}{" "}
              {copiedLink ? "Copied" : "Copy link"}
            </button>
          </div>
          <small>
            Share this link so the customer can view their quotation.
          </small>
        </div>
        <details className="surface p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Message to customer
          </summary>
          <textarea
            aria-label="Message to customer"
            readOnly
            value={whatsAppPitchText}
            rows={7}
            className="w-full mt-3 p-3 text-sm border rounded-lg"
          />
          <button className="button-secondary mt-3" onClick={handleCopyPitch}>
            {copiedPitch ? "Copied" : "Copy message"}
          </button>
        </details>
        {cleanPhone && (
          <a
            className="button-primary w-full"
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare size={17} />
            Open in WhatsApp
          </a>
        )}
        <p className="text-xs text-slate-500">
          Opening WhatsApp prepares the message. You choose when to send it.
        </p>
      </div>
    </Modal>
  );
};
