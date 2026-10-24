"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Menu,
  X,
  PhoneCall,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  onOpenEnquiry?: (serviceId?: string) => void;
  activePath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenEnquiry,
  activePath = "/tours",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Tour Packages", href: "/tours" },
    { label: "Custom Holidays", href: "/#services" },
    { label: "Visas", href: "/#services" },
    { label: "Flights", href: "/#services" },
    { label: "Umrah", href: "/#services" },
  ];

  return (
    <>
      {/* Top Operations Ticker */}
      <div className="bg-[#1C1614] text-stone-300 text-[11px] py-1.5 px-4 font-mono tracking-tight flex items-center justify-between border-b border-stone-800">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline text-stone-300">
              Flyora Luxury Outbound Desk:
            </span>
            <span className="text-white font-medium">
              Live Coordinator Assistance Available
            </span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <a
              href="tel:+919876543210"
              className="hover:text-white transition flex items-center gap-1.5"
            >
              <PhoneCall className="w-3 h-3 text-stone-400" />
              <span>+91 98765 43210</span>
            </a>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline hover:text-stone-200 transition text-[10px]"
            >
              Staff Portal ↗
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#4A2E18] text-white flex items-center justify-center shadow-sm group-hover:bg-[#38200F] transition">
              <Compass className="w-5 h-5 stroke-[2] text-[#F5EBE6]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-wider uppercase text-stone-900 group-hover:text-[#4A2E18] transition">
                Flyora
              </span>
              <span className="text-[10px] text-stone-500 font-mono tracking-widest uppercase -mt-1">
                Tours & Travels
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-medium text-stone-600">
            {navLinks.map((link) => {
              const isActive = activePath === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition py-1 relative ${
                    isActive
                      ? "text-[#4A2E18] font-semibold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A2E18] rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://wa.me/919876543210?text=Hi%20Flyora%20Travels,%20I%20am%20looking%20for%20a%20customized%20tour%20package."
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-stone-200 hover:border-emerald-500 text-stone-700 hover:text-emerald-700 bg-white hover:bg-emerald-50/50 transition flex items-center gap-1.5 text-xs font-medium"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden xl:inline text-xs">WhatsApp</span>
            </a>

            <button
              onClick={() => onOpenEnquiry && onOpenEnquiry()}
              className="px-5 py-2.5 rounded-xl bg-[#4A2E18] hover:bg-[#38200F] active:scale-98 text-white text-xs font-semibold shadow-sm hover:shadow-md transition flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E6D5C7]" />
              <span>Plan My Trip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-stone-200 bg-white px-5 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-stone-700 hover:text-[#4A2E18] py-1.5"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEnquiry && onOpenEnquiry();
                }}
                className="w-full py-2.5 rounded-xl bg-[#4A2E18] text-white text-xs font-semibold text-center flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E6D5C7]" />
                <span>Plan My Trip</span>
              </button>
              <a
                href="https://wa.me/919876543210?text=Hi%20Flyora%20Travels,%20I%20am%20looking%20for%20a%20customized%20tour%20package."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl border border-emerald-500 text-emerald-800 bg-emerald-50/50 text-xs font-semibold text-center flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
