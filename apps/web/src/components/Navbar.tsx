"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowRight,
  MessageCircle,
  Phone,
  Search,
  MapPin,
} from "lucide-react";

export interface NavbarProps {
  onFindAdvisor?: () => void;
  onBecomeAdvisor?: () => void;
  defaultSearchOpen?: boolean;
}

const QUICK_SEARCH_SUGGESTIONS = [
  { label: "China (Shanghai & Cultural Highlights)", query: "China" },
  { label: "Indonesia (Komodo & Bali Luxury)", query: "Indonesia" },
  { label: "Italy (Cinque Terre & Amalfi Coast)", query: "Italy" },
  { label: "Brazil (Rio de Janeiro & Coastline)", query: "Brazil" },
  { label: "Chile (Patagonian Wilderness)", query: "Chile" },
  { label: "Aspen (Alpine Spas & Wellness)", query: "Aspen" },
  { label: "Garry x Olivia (Luxury Travel Advisors)", query: "Garry" },
  { label: "Stephanie Bloom (London Luxury Advisor)", query: "Stephanie" },
];

export const Navbar: React.FC<NavbarProps> = ({
  onFindAdvisor,
  onBecomeAdvisor,
  defaultSearchOpen = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(defaultSearchOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const targetUrl = query
      ? `/explore?q=${encodeURIComponent(query)}`
      : "/explore";
    if (typeof window !== "undefined") {
      window.location.href = targetUrl;
    }
  };

  const handleSuggestionClick = (query: string) => {
    if (typeof window !== "undefined") {
      window.location.href = `/explore?q=${encodeURIComponent(query)}`;
    }
  };

  const filteredSuggestions = searchQuery.trim()
    ? QUICK_SEARCH_SUGGESTIONS.filter((s) =>
        s.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : [];

  return (
    <header className="sticky top-6 sm:top-8 z-50 px-4 sm:px-8 w-full max-w-5xl mx-auto transition-all duration-300">
      {/* Floating White Navbar Card */}
      <div
        className={`relative bg-white rounded-2xl border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 ${
          isScrolled ? "shadow-[0_12px_36px_rgb(0,0,0,0.09)]" : ""
        }`}
      >
        {isSearchOpen ? (
          /* =========================================================================
             SEARCH NAVBAR STATE: Exact 1:1 match to user screenshot
             [ FLYORA   EXPLORE   ( 🔍 Discover destinations, advisors, and more )   GET MATCHED   ≡ ]
             ========================================================================= */
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4 animate-in fade-in duration-200">
            {/* Left: Brand Logo & EXPLORE Label (Clean gap, NO vertical line) */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <Link
                href="/"
                className="group flex items-center justify-center transition-opacity hover:opacity-85"
              >
                <span className="font-serif text-[22px] sm:text-[24px] font-normal tracking-[0.2em] text-[#1C1815] uppercase select-none">
                  FLYORA
                </span>
              </Link>
              <Link
                href="/explore"
                className="hidden sm:inline-block text-[11.5px] font-sans font-semibold uppercase tracking-[0.14em] text-[#38312B] hover:text-black transition-colors select-none cursor-pointer"
              >
                EXPLORE
              </Link>
            </div>

            {/* Center: Search Input Bar Pill */}
            <div className="flex-1 max-w-lg mx-1 sm:mx-3 relative">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <div className="bg-[#F8F3EC] hover:bg-[#F3ECE3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#463d34]/20 border border-[#EFE8DF] rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2.5 transition-all">
                  <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0 stroke-[2]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Discover destinations, advisors, and more"
                    aria-label="Discover destinations, advisors, and more"
                    className="w-full bg-transparent text-xs sm:text-[13px] text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    title="Close search"
                    aria-label="Close search"
                    className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Instant Suggestions Dropdown */}
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-zinc-200 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-3 py-1">
                    Matching Destinations &amp; Guides
                  </p>
                  {filteredSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(item.query)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-800 hover:bg-[#F8F3EC] hover:text-black flex items-center gap-2 transition"
                    >
                      <MapPin className="w-3 h-3 text-[#463d34]" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: GET MATCHED Button & Hamburger Menu */}
            <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
              <button
                onClick={() => {
                  if (onFindAdvisor) onFindAdvisor();
                  else if (onBecomeAdvisor) onBecomeAdvisor();
                }}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-md bg-[#463d34] hover:bg-[#38312a] active:bg-[#2b2520] text-white text-[11px] sm:text-[11.5px] font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-200 shadow-xs cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <span className="hidden sm:inline">GET MATCHED</span>
                <span className="sm:hidden">MATCH</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                className="p-1.5 rounded-lg text-[#38312B] hover:text-black hover:bg-zinc-100 transition cursor-pointer"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 stroke-[1.75]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[1.75]" />
                )}
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
             STANDARD NAVBAR STATE:
             [ FIND AN ADVISOR   EXPLORE   ABOUT ]   [ FLYORA ]   [ 🔍   BECOME AN ADVISOR ]
             Clean spacing, NO lone search icon between EXPLORE and ABOUT
             ========================================================================= */
          <div className="h-16 px-6 sm:px-8 flex items-center justify-between relative">
            {/* Left: Navigation Links (Desktop) - Clean spacing, NO stray icons */}
            <nav
              aria-label="Primary Navigation"
              className="hidden md:flex items-center gap-7 lg:gap-8"
            >
              <button
                onClick={() => {
                  if (onFindAdvisor) onFindAdvisor();
                  else handleLinkClick("#why-us");
                }}
                className="text-[12px] font-sans font-medium uppercase tracking-[0.14em] text-[#38312B] hover:text-black transition-colors cursor-pointer"
              >
                FIND AN ADVISOR
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-[12px] font-sans font-medium uppercase tracking-[0.14em] text-[#38312B] hover:text-black transition-colors cursor-pointer"
              >
                EXPLORE
              </button>
              <button
                onClick={() => handleLinkClick("#why-us")}
                className="text-[12px] font-sans font-medium uppercase tracking-[0.14em] text-[#38312B] hover:text-black transition-colors cursor-pointer"
              >
                ABOUT
              </button>
            </nav>

            {/* Left: Hamburger Toggle (Mobile) */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                className="p-1.5 -ml-2 rounded-lg text-[#38312B] hover:text-black hover:bg-zinc-100 transition"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 stroke-[1.75]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[1.75]" />
                )}
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search destinations and advisors"
                className="p-1.5 rounded-lg text-[#38312B] hover:text-black hover:bg-zinc-100 transition"
              >
                <Search className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Center: Brand Logo (FLYORA in luxury serif typography) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
              <Link
                href="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="group flex items-center justify-center"
              >
                <span className="font-serif text-[22px] sm:text-[25px] font-normal tracking-[0.22em] text-[#1C1815] uppercase select-none transition-opacity group-hover:opacity-85">
                  FLYORA
                </span>
              </Link>
            </div>

            {/* Right: Search Icon Button & CTA Button (BECOME AN ADVISOR) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search destinations and advisors"
                title="Search destinations and advisors"
                className="hidden sm:flex p-2 rounded-full text-[#38312B] hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[2]" />
              </button>

              <button
                onClick={() => {
                  if (onBecomeAdvisor) onBecomeAdvisor();
                  else if (onFindAdvisor) onFindAdvisor();
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-md bg-[#463d34] hover:bg-[#352e27] active:bg-[#2b2520] text-white text-[11px] sm:text-[11.5px] font-sans font-semibold sm:font-medium uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-xs whitespace-nowrap"
              >
                <span className="hidden sm:inline">BECOME AN ADVISOR</span>
                <span className="sm:hidden">ADVISOR</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-zinc-100 px-6 py-5 bg-white/95 backdrop-blur-sm rounded-b-2xl animate-in slide-in-from-top-2 duration-200 space-y-4">
            <div className="flex flex-col space-y-3 pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onFindAdvisor) onFindAdvisor();
                  else handleLinkClick("#why-us");
                }}
                className="text-left text-xs font-sans font-medium uppercase tracking-[0.14em] text-[#38312B] hover:text-black py-1.5 transition-colors"
              >
                FIND AN ADVISOR
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="text-left text-xs font-sans font-medium uppercase tracking-[0.14em] text-[#38312B] hover:text-black py-1.5 transition-colors flex items-center justify-between"
              >
                <span>EXPLORE &amp; SEARCH</span>
                <Search className="w-3.5 h-3.5 text-zinc-400" />
              </button>
              <button
                onClick={() => handleLinkClick("#why-us")}
                className="text-left text-xs font-sans font-medium uppercase tracking-[0.14em] text-[#38312B] hover:text-black py-1.5 transition-colors"
              >
                ABOUT
              </button>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left text-[11px] font-mono text-zinc-400 hover:text-zinc-700 py-1"
              >
                Staff Portal ↗
              </a>
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onBecomeAdvisor) onBecomeAdvisor();
                }}
                className="w-full py-2.5 rounded-lg bg-[#463d34] hover:bg-[#352e27] text-white text-xs font-semibold uppercase tracking-[0.12em] transition text-center flex items-center justify-center gap-2"
              >
                <span>BECOME AN ADVISOR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                <a
                  href="https://wa.me/919876543210?text=Hello%20Flyora%20Travels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onFindAdvisor) onFindAdvisor();
                  }}
                  className="py-2 px-3 rounded-lg bg-zinc-100 text-zinc-700 text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Coordinator</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
