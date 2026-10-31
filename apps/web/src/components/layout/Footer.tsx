"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  PhoneCall,
  Mail,
  MapPin,
} from "lucide-react";

export interface FooterProps {
  onOpenEnquiry?: (serviceId?: string) => void;
  onBecomeAdvisor?: () => void;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenEnquiry,
  onBecomeAdvisor,
  className = "",
}) => {
  return (
    <footer
      className={`border-t border-black/[0.06] bg-[#F7F2EC] text-[#5C534A] pt-14 pb-10 transition-colors ${className}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center shrink-0 text-[#463D34]">
              <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1C1815]">
                100% Verified
              </p>
              <p className="text-[11px] text-[#7A7167]">
                IATA &amp; Govt Certified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center shrink-0 text-[#463D34]">
              <Sparkles className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1C1815]">
                Custom Handcrafted
              </p>
              <p className="text-[11px] text-[#7A7167]">Zero Rigid Templates</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center shrink-0 text-[#463D34]">
              <Clock className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1C1815]">
                24/7 Concierge
              </p>
              <p className="text-[11px] text-[#7A7167]">Real-Time Assistance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center shrink-0 text-[#463D34]">
              <Award className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1C1815]">
                Preferred Partner Desk
              </p>
              <p className="text-[11px] text-[#7A7167]">4,500+ Luxury Hotels</p>
            </div>
          </div>
        </div>

        {/* Main Footer Directory */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand & Contact Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl font-normal tracking-[0.2em] text-[#1C1815] uppercase block">
                FLYORA
              </span>
              <span className="text-[10px] text-[#7A7167] font-mono tracking-widest uppercase -mt-1 block">
                Tours &amp; Travels
              </span>
            </Link>

            <p className="text-xs text-[#6B6156] leading-relaxed max-w-sm">
              Flyora is a modern luxury travel platform matching discerning
              travelers with handpicked travel curators worldwide. Unlock VIP
              upgrades, bespoke itineraries, and concierge care.
            </p>

            <div className="space-y-2 pt-2 text-xs text-[#6B6156]">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-[#463D34] shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#463D34] shrink-0" />
                <span>concierge@flyora.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#463D34] shrink-0 mt-0.5" />
                <span>Flyora Travels Tower, Suite 402, High Street Plaza</span>
              </div>
            </div>
          </div>

          {/* Top Destinations Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#1C1815] uppercase tracking-wider font-mono">
              Top Destinations
            </p>
            <ul className="space-y-2 text-xs text-[#6B6156]">
              <li>
                <Link
                  href="/tours?destination=Dubai"
                  className="hover:text-black transition"
                >
                  Dubai &amp; Abu Dhabi
                </Link>
              </li>
              <li>
                <Link
                  href="/tours?destination=Maldives"
                  className="hover:text-black transition"
                >
                  Maldives Luxury Atolls
                </Link>
              </li>
              <li>
                <Link
                  href="/tours?destination=Bali"
                  className="hover:text-black transition"
                >
                  Bali Ubud &amp; Seminyak
                </Link>
              </li>
              <li>
                <Link
                  href="/tours?destination=Switzerland"
                  className="hover:text-black transition"
                >
                  Scenic Switzerland Rail
                </Link>
              </li>
              <li>
                <Link
                  href="/explore?q=Amalfi"
                  className="hover:text-black transition"
                >
                  Amalfi Coast &amp; Capri
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#1C1815] uppercase tracking-wider font-mono">
              Our Services
            </p>
            <ul className="space-y-2 text-xs text-[#6B6156]">
              <li>
                <Link href="/tours" className="hover:text-black transition">
                  Tour Packages
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onOpenEnquiry && onOpenEnquiry("Custom Holidays")
                  }
                  className="hover:text-black transition text-left cursor-pointer"
                >
                  Custom Holidays
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenEnquiry && onOpenEnquiry("Visas")}
                  className="hover:text-black transition text-left cursor-pointer"
                >
                  International Visas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenEnquiry && onOpenEnquiry("Flights")}
                  className="hover:text-black transition text-left cursor-pointer"
                >
                  Corporate &amp; Leisure Flights
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    onOpenEnquiry && onOpenEnquiry("Umrah Packages")
                  }
                  className="hover:text-black transition text-left cursor-pointer"
                >
                  Umrah &amp; Hajj Concierge
                </button>
              </li>
              <li>
                <Link href="/explore" className="hover:text-black transition">
                  Explore Destinations &amp; Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Curators & Operations Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#1C1815] uppercase tracking-wider font-mono">
              Curators &amp; Partners
            </p>
            <ul className="space-y-2 text-xs text-[#6B6156]">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenEnquiry && onOpenEnquiry()}
                  className="hover:text-black transition text-left cursor-pointer"
                >
                  Match with an Advisor
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onBecomeAdvisor && onBecomeAdvisor()}
                  className="hover:text-black transition text-left cursor-pointer font-medium text-[#463D34]"
                >
                  Become a Flyora Advisor ↗
                </button>
              </li>
              <li>
                <Link href="/about" className="hover:text-black transition">
                  About Flyora
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-black transition"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#perks" className="hover:text-black transition">
                  VIP Hotel Perks
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-black transition">
                  Advisor FAQs
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition"
                >
                  Staff &amp; Operations Portal ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 mt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A7167] gap-4">
          <p>
            © {new Date().getFullYear()} Flyora Tours &amp; Travels LLP. All
            rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-black transition">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-black transition">
              Terms of Booking
            </Link>
            <Link href="/" className="hover:text-black transition">
              Cookie Preferences
            </Link>
            <Link href="/" className="hover:text-black transition">
              Refund &amp; Cancellation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
