"use client";

import React, { useState } from "react";
import { whatsappLink } from "../lib/enquiry";
import { MessageSquareText, PhoneCall, Plus } from "lucide-react";
import { FloatingButton, FloatingButtonItem } from "./ui/floating-button";

interface FloatingWhatsAppProps {
  onOpenEnquiry?: () => void;
  whatsappNumber?: string;
}

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.36 7.03 9.08 7.09 8.84 7.35C8.61 7.61 7.95 8.22 7.95 9.48C7.95 10.74 8.87 11.95 9 12.12C9.13 12.29 10.8 14.86 13.37 15.97C15.5 16.89 15.94 16.71 16.39 16.67C16.85 16.63 17.86 16.07 18.07 15.48C18.28 14.89 18.28 14.39 18.22 14.28C18.15 14.18 17.99 14.12 17.74 14C17.49 13.87 16.27 13.27 16.04 13.19C15.82 13.11 15.65 13.06 15.49 13.31C15.32 13.56 14.84 14.12 14.7 14.28C14.55 14.45 14.41 14.47 14.16 14.35C13.91 14.22 13.12 13.96 12.17 13.12C11.44 12.46 10.94 11.66 10.8 11.41C10.66 11.16 10.78 11.03 10.91 10.9C11.02 10.79 11.16 10.61 11.28 10.46C11.41 10.32 11.45 10.21 11.53 10.05C11.62 9.88 11.57 9.74 11.51 9.61C11.45 9.49 10.96 8.28 10.75 7.78C10.55 7.3 10.35 7.36 10.2 7.36C10.05 7.35 9.89 7.35 9.72 7.35L9.53 7.03Z" />
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  onOpenEnquiry,
  whatsappNumber,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // If whatsappNumber is explicitly passed, use it.
  // Otherwise, use process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.
  // If undefined in env, fall back to Flyora's standard WhatsApp support number ("919876543210").
  // If explicitly stubbed to "" (e.g. in tests), resolved is undefined so no fake link is generated.
  const resolvedNumber =
    whatsappNumber !== undefined
      ? whatsappNumber || undefined
      : process.env.NEXT_PUBLIC_WHATSAPP_NUMBER !== undefined
        ? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || undefined
        : "919876543210";

  const whatsappUrl = whatsappLink(
    resolvedNumber,
    "Hello Flyora Travels! I would like to enquire about your travel packages and services.",
  );

  const handleOpenEnquiry = () => {
    setIsOpen(false);
    if (onOpenEnquiry) {
      onOpenEnquiry();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("flyora:open-enquiry"));
    }
  };

  return (
    <aside
      aria-label="Floating support menu"
      className="fixed bottom-6 right-6 z-50 font-sans"
    >
      <FloatingButton
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        triggerContent={
          <button
            type="button"
            aria-label="Contact Flyora"
            title="Chat with Us"
            aria-expanded={isOpen}
            className="group relative flex items-center justify-center w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white shadow-[0_10px_28px_rgba(0,47,137,0.38)] hover:shadow-[0_14px_36px_rgba(0,47,137,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-0 outline-none select-none"
          >
            <div className="relative w-8 h-8 flex items-center justify-center pointer-events-none">
              <MessageSquareText
                className={`w-7.5 h-7.5 sm:w-8 sm:h-8 text-white transition-all duration-200 ${
                  isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
                }`}
                strokeWidth={2}
              />
              <Plus
                className={`absolute w-7 h-7 sm:w-7.5 sm:h-7.5 text-white transition-all duration-200 ${
                  isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
                strokeWidth={2.4}
              />
            </div>
          </button>
        }
      >
        {/* Option 1: Request a Callback */}
        <FloatingButtonItem>
          <div className="relative flex items-center justify-center group">
            <button
              type="button"
              onClick={handleOpenEnquiry}
              aria-label="Request a Callback"
              title="Request a Callback"
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center bg-[#002f89] hover:bg-[#00246b] text-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-5 h-5 text-white" strokeWidth={2} />
            </button>
            <span className="hidden sm:inline-block absolute right-full mr-3 px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Request Callback
            </span>
          </div>
        </FloatingButtonItem>

        {/* Option 2: Facebook */}
        <FloatingButtonItem>
          <div className="relative flex items-center justify-center group">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Flyora on Facebook"
              onClick={() => setIsOpen(false)}
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center bg-[#1877f2] hover:bg-[#166fe5] text-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <FacebookIcon className="w-5 h-5" />
            </a>
            <span className="hidden sm:inline-block absolute right-full mr-3 px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Facebook
            </span>
          </div>
        </FloatingButtonItem>

        {/* Option 3: Instagram */}
        <FloatingButtonItem>
          <div className="relative flex items-center justify-center group">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Flyora on Instagram"
              onClick={() => setIsOpen(false)}
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <span className="hidden sm:inline-block absolute right-full mr-3 px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Instagram
            </span>
          </div>
        </FloatingButtonItem>

        {/* Option 4: WhatsApp */}
        {whatsappUrl && (
          <FloatingButtonItem>
            <div className="relative flex items-center justify-center group">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                title="Chat on WhatsApp"
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              >
                <WhatsAppIcon className="w-5.5 h-5.5" />
              </a>
              <span className="hidden sm:inline-block absolute right-full mr-3 px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                WhatsApp
              </span>
            </div>
          </FloatingButtonItem>
        )}
      </FloatingButton>
    </aside>
  );
};
