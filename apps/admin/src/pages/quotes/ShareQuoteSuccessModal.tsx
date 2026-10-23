import React, { useState } from "react";
import type { QuotationRecord } from "./types";
import {
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react";

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
      // Fallback
    }
  };

  const handleCopyPitch = async () => {
    try {
      await navigator.clipboard.writeText(whatsAppPitchText);
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
                Quotation Ready for Dispatch
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight">
              {quote.quoteNumber}
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1">
              Custom proposal generated for {customerName} (
              {destinationOrService})
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#F8F8F6] border border-zinc-200/80 text-center">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                  Package Total
                </span>
                <span className="text-sm font-bold font-mono text-zinc-900">
                  {formattedPrice}
                </span>
              </div>
              <div className="border-x border-zinc-200">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                  Margin %
                </span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  {quote.marginPercent.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                  Valid Until
                </span>
                <span className="text-xs font-semibold text-zinc-800">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Shareable Link Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 flex items-center justify-between">
                <span>Customer Shareable Link</span>
                <span className="text-[10px] font-mono text-emerald-600 font-normal">
                  Zero cost fields exposed
                </span>
              </label>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAFAF9] border border-zinc-200">
                <input
                  type="text"
                  readOnly
                  value={publicQuoteUrl}
                  className="flex-1 bg-transparent text-xs font-mono text-zinc-600 select-all focus:outline-hidden truncate"
                />

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-xs ${
                    copiedLink
                      ? "bg-emerald-600 text-white"
                      : "bg-black text-white hover:bg-zinc-800"
                  }`}
                >
                  {copiedLink ? (
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

            {/* WhatsApp Pitch Preview Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Pre-Formatted WhatsApp Pitch
                </label>

                <button
                  type="button"
                  onClick={handleCopyPitch}
                  className="text-xs text-zinc-600 hover:text-black font-medium inline-flex items-center gap-1 transition"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">
                        Copied message!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Pitch Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-emerald-200/80 text-[11px] text-zinc-800 font-sans whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                {whatsAppPitchText}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              {cleanPhone && (
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send WhatsApp ({customerPhone})</span>
                </a>
              )}

              <a
                href={publicQuoteUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-medium transition"
              >
                <span>Preview Proposal</span>
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
      </div>
    </div>
  );
};
