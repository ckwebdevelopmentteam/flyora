"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles, MessageCircle, Phone } from "lucide-react";

export interface NavbarProps {
  onFindAdvisor?: () => void;
  onBecomeAdvisor?: () => void;
  onOpenEnquiry?: (serviceId?: string) => void;
  activePath?: string;
  isFixed?: boolean;
  className?: string;
  ctaLabel?: string;
  // Backwards compatibility props (no-op since search bar is replaced)
  alwaysShowSearch?: boolean;
  defaultSearchOpen?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  serviceId?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Tour Packages", href: "/tours" },
  {
    label: "Custom Holidays",
    href: "/#how-it-works",
    serviceId: "Custom Holidays",
  },
  { label: "Visas", href: "/#services", serviceId: "Visas" },
  { label: "Flights", href: "/#services", serviceId: "Flights" },
  { label: "Umrah", href: "/#services", serviceId: "Umrah Packages" },
];

export const Navbar: React.FC<NavbarProps> = ({
  onFindAdvisor,
  onBecomeAdvisor,
  onOpenEnquiry,
  activePath = "",
  isFixed = false,
  className = "",
  ctaLabel = "Plan My Trip",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    setMobileMenuOpen(false);

    // If an enquiry handler is provided and the item represents a service enquiry
    if (item.serviceId && onOpenEnquiry) {
      e.preventDefault();
      onOpenEnquiry(item.serviceId);
      return;
    }

    // Smooth scroll for hash links on the same page
    if (item.href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleCtaClick = () => {
    if (onOpenEnquiry) {
      onOpenEnquiry();
    } else if (onFindAdvisor) {
      onFindAdvisor();
    } else if (onBecomeAdvisor) {
      onBecomeAdvisor();
    }
  };

  return (
    <header
      className={`${
        isFixed ? "fixed top-4 sm:top-6 inset-x-0" : "sticky top-3 sm:top-5"
      } z-50 px-4 sm:px-5 w-full max-w-[1360px] mx-auto pointer-events-none transition-all duration-300 ${className}`}
    >
      {/* Floating Glassmorphic Navbar Card */}
      <div
        className={`pointer-events-auto relative bg-white/95 backdrop-blur-md rounded-2xl border border-black/[0.07] transition-all duration-300 ${
          isScrolled
            ? "shadow-[0_12px_36px_rgb(0,0,0,0.12)] bg-white"
            : "shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
        }`}
      >
        <div className="h-16 px-5 sm:px-7 flex items-center justify-between">
          {/* Left: Brand Logo (FLYORA in Luxury Serif) */}
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2 select-none shrink-0"
          >
            <span className="font-serif text-[22px] sm:text-[24px] font-normal tracking-[0.2em] text-[#1C1815] uppercase transition-opacity group-hover:opacity-85">
              FLYORA
            </span>
          </Link>

          {/* Center: 5 Clean Editorial Navigation Links (Replaces previous search bar) */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-5 lg:gap-7 xl:gap-8"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                activePath === item.href ||
                (item.href === "/tours" && activePath.startsWith("/tours"));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`text-[11.5px] lg:text-[12px] font-sans font-medium uppercase tracking-[0.14em] transition-colors py-1 relative select-none ${
                    isActive
                      ? "text-[#1C1815] font-semibold"
                      : "text-[#4A423B] hover:text-black"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#463D34] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick WhatsApp & Action CTA Button */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* WhatsApp Quick Chat */}
            <a
              href="https://wa.me/919876543210?text=Hi%20Flyora%20Travels,%20I%20am%20looking%20for%20a%20customized%20tour%20package."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-md border border-black/[0.08] text-[#38312B] hover:text-emerald-700 hover:border-emerald-500/50 hover:bg-emerald-50/40 text-[11px] font-medium transition cursor-pointer"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Primary Action Button */}
            <button
              onClick={handleCtaClick}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-md bg-[#463D34] hover:bg-[#352E27] active:bg-[#2B2520] text-white text-[11px] sm:text-[11.5px] font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1.5"
            >
              {/* <Sparkles className="w-3.5 h-3.5 text-[#E6D5C7]" /> */}
              <span>{ctaLabel}</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="md:hidden p-1.5 rounded-lg text-[#38312B] hover:text-black hover:bg-zinc-100 transition cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[1.75]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[1.75]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/[0.06] px-5 py-4 bg-white/98 backdrop-blur-md rounded-b-2xl animate-in slide-in-from-top-2 duration-200 space-y-3">
            <div className="flex flex-col space-y-1.5 pt-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  activePath === item.href ||
                  (item.href === "/tours" && activePath.startsWith("/tours"));

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`text-left text-xs font-sans font-medium uppercase tracking-[0.14em] py-2 transition-colors ${
                      isActive
                        ? "text-[#1C1815] font-semibold"
                        : "text-[#38312B] hover:text-black"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCtaClick();
                }}
                className="w-full py-2.5 rounded-md bg-[#463D34] hover:bg-[#352E27] text-white text-xs font-semibold uppercase tracking-[0.12em] transition text-center flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E6D5C7]" />
                <span>{ctaLabel}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                <a
                  href="https://wa.me/919876543210?text=Hello%20Flyora%20Travels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="tel:+919876543210"
                  className="py-2 px-3 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Desk</span>
                </a>
              </div>

              <div className="pt-2 text-center">
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-zinc-400 hover:text-zinc-700"
                >
                  Staff &amp; Operations Portal ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
