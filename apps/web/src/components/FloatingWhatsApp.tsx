"use client";

import React, { useState } from "react";
import { whatsappLink } from "../lib/enquiry";
import { MessageCircle, PhoneCall, X } from "lucide-react";

interface FloatingWhatsAppProps {
  onOpenEnquiry?: () => void;
  whatsappNumber?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  onOpenEnquiry,
  whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappUrl = whatsappLink(
    whatsappNumber,
    "Hello Flyora Travels! I would like to enquire about your travel packages and services.",
  );
  if (!whatsappUrl && !onOpenEnquiry) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans">
      {/* Quick Action Popover */}
      {showTooltip && (
        <div className="bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl p-4 w-72 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200 relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-zinc-700 p-1 rounded-full"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900">
                Flyora Travel Desk
              </p>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Travel enquiries
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mb-3">
            Planning a vacation or need visa support? Chat with our specialist
            about your plans.
          </p>
          <div className="flex flex-col gap-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-medium transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                Chat on WhatsApp
              </a>
            )}
            {onOpenEnquiry && (
              <button
                type="button"
                onClick={() => {
                  setShowTooltip(false);
                  onOpenEnquiry();
                }}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Request a Callback
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowTooltip((prev) => !prev)}
        className="group relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Contact Flyora"
        aria-expanded={showTooltip}
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-semibold tracking-wide">
          Chat with Us
        </span>
      </button>
    </div>
  );
};
