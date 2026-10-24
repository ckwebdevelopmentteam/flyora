import React from "react";
import Link from "next/link";
import {
  Compass,
  PhoneCall,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-stone-200/90 text-stone-700 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Trust Badge Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-center shrink-0 text-[#4A2E18]">
              <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-900">
                100% Verified
              </p>
              <p className="text-[11px] text-stone-500">
                IATA & Govt Certified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-center shrink-0 text-[#4A2E18]">
              <Sparkles className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-900">
                Custom Handcrafted
              </p>
              <p className="text-[11px] text-stone-500">Zero Rigid Templates</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-center shrink-0 text-[#4A2E18]">
              <Clock className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-900">
                24/7 Concierge
              </p>
              <p className="text-[11px] text-stone-500">Real-Time WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-center shrink-0 text-[#4A2E18]">
              <Award className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-900">
                Best Rate Guarantee
              </p>
              <p className="text-[11px] text-stone-500">
                Direct Hotel Contracts
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#4A2E18] text-white flex items-center justify-center shadow-xs">
                <Compass className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-wider uppercase text-stone-900">
                  Flyora
                </span>
                <span className="text-[10px] text-stone-400 font-mono tracking-widest uppercase -mt-1">
                  Tours & Travels
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Curating luxury outbound travel experiences, bespoke honeymoon
              escapes, and fast-track global visa concierge services.
            </p>
          </div>

          {/* Popular Destinations */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider font-mono">
              Top Destinations
            </p>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link
                  href="/tours?destination=Dubai"
                  className="hover:text-[#4A2E18] transition"
                >
                  Dubai & Abu Dhabi
                </Link>
              </li>
              <li>
                <Link
                  href="/tours?destination=Maldives"
                  className="hover:text-[#4A2E18] transition"
                >
                  Maldives Luxury Atolls
                </Link>
              </li>
              <li>
                <Link
                  href="/tours?destination=Bali"
                  className="hover:text-[#4A2E18] transition"
                >
                  Bali Ubud & Seminyak
                </Link>
              </li>
              <li>
                <Link
                  href="/tours?destination=Switzerland"
                  className="hover:text-[#4A2E18] transition"
                >
                  Scenic Switzerland Rail
                </Link>
              </li>
            </ul>
          </div>

          {/* Travel Services */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider font-mono">
              Our Services
            </p>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link href="/tours" className="hover:text-[#4A2E18] transition">
                  Handcrafted Tour Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="hover:text-[#4A2E18] transition"
                >
                  International Visas
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="hover:text-[#4A2E18] transition"
                >
                  Corporate Flights
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="hover:text-[#4A2E18] transition"
                >
                  Umrah & Hajj Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider font-mono">
              Direct Contact
            </p>
            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-[#4A2E18] shrink-0" />
                <span>+91 98765 43210 / +91 98765 43211</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#4A2E18] shrink-0" />
                <span>concierge@flyora.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#4A2E18] shrink-0 mt-0.5" />
                <span>Flyora Travels Tower, Suite 402, High Street Plaza</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 mt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-4">
          <p>
            © {new Date().getFullYear()} Flyora Tours & Travels LLP. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-stone-700 transition">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-stone-700 transition">
              Terms of Booking
            </Link>
            <Link href="/" className="hover:text-stone-700 transition">
              Refund & Cancellation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
