"use client";

import React from "react";
import Link from "next/link";
import {
  Train,
  Bus,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Compass,
  Sparkles,
  Ticket,
} from "lucide-react";

export interface TransitBookingCTAProps {
  onOpenEnquiry?: (serviceId?: string) => void;
}

export function TransitBookingCTA({ onOpenEnquiry }: TransitBookingCTAProps) {
  return (
    <section
      id="transit-booking"
      aria-label="Book Train & Bus Tickets"
      className="relative w-full bg-gradient-to-b from-white via-[#fafcff] to-white border-t border-black/[0.06] py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      {/* Subtle background ambient glows */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-24 left-1/4 w-[480px] h-[360px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(191,219,254,0.6) 0%, rgba(219,234,254,0.2) 60%, transparent 80%)",
          }}
        />
        <div
          className="absolute -bottom-24 right-1/4 w-[480px] h-[360px] rounded-full opacity-35 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(191,219,254,0.5) 0%, rgba(219,234,254,0.15) 60%, transparent 80%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-100 text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-[#002f89] mb-3.5 shadow-2xs">
            <Ticket className="w-3.5 h-3.5 text-[#002f89]" />
            <span>GROUND TRANSIT CONCIERGE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#111827] mb-3.5">
            Seamless <span className="text-[#002f89]">Train & Bus</span>{" "}
            Bookings
          </h2>

          <p className="text-sm sm:text-base text-[#4b5563] max-w-2xl mx-auto font-normal leading-relaxed">
            Skip long counter queues and booking uncertainty. From Tatkal rail
            quotas and iconic scenic tracks to luxury Volvo AC sleeper coaches,
            get confirmed tickets issued with personal care.
          </p>
        </div>

        {/* 2 Modern Minimal Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Train Booking */}
          <div className="group relative flex flex-col rounded-3xl bg-white border border-neutral-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_44px_rgba(0,47,137,0.12)] transition-all duration-300 overflow-hidden">
            {/* Image Container with Badges */}
            <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-neutral-100">
              <img
                src="/services/train-booking.jpg"
                alt="Confirmed Train Booking and Scenic Rail Journeys"
                className="w-full h-full object-cover object-[70%_55%] transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

              {/* Top Badges */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-sans font-semibold text-[#002f89] shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#002f89]" />
                  <span>IRCTC Authorized Portal</span>
                </span>
                <span className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#002f89] shadow-sm">
                  <Train className="w-4 h-4" />
                </span>
              </div>

              {/* Bottom Quick Metrics Inside Photo */}
              <div className="absolute bottom-3.5 inset-x-4 flex items-center justify-between text-white text-[11.5px] sm:text-xs font-medium pointer-events-none">
                <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  98.7% Confirmed Berth Rate
                </span>
                <span className="bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-white/95">
                  Tatkal & 1st AC Priority
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-7 lg:p-8 flex flex-col flex-1 justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#002f89] font-bold">
                    RAIL TICKETING
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-sans font-bold text-[#111827] mb-2.5 group-hover:text-[#002f89] transition-colors duration-200">
                  Scenic Rail & Confirmed Train Berths
                </h3>
                <p className="text-xs sm:text-sm text-[#4b5563] leading-relaxed mb-5">
                  Specialized Tatkal opening-minute strategy, First AC and
                  Executive Chair Car allocations, alongside Vande Bharat and
                  iconic scenic railway reservations with zero cancellation
                  headaches.
                </p>

                {/* Feature Tags Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#002f89] shrink-0" />
                    <span>Tatkal Priority Desk</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#002f89] shrink-0" />
                    <span>Live WhatsApp PNR</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#002f89] shrink-0" />
                    <span>Lower Berth Allocation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#002f89] shrink-0" />
                    <span>Instant Refund Support</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => onOpenEnquiry?.("Train Booking")}
                  className="w-full sm:flex-1 py-3 px-5 rounded-md bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white text-xs sm:text-[13px] font-sans font-semibold uppercase tracking-[0.1em] transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Train className="w-4 h-4" />
                  <span>Book Train Tickets</span>
                </button>
                <Link
                  href="/services#train-booking"
                  className="w-full sm:w-auto py-3 px-4 rounded-md border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs sm:text-[13px] font-sans font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Bus Booking */}
          <div className="group relative flex flex-col rounded-3xl bg-white border border-neutral-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_44px_rgba(0,47,137,0.12)] transition-all duration-300 overflow-hidden">
            {/* Image Container with Badges */}
            <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-neutral-100">
              <img
                src="/services/bus-booking.jpg"
                alt="Luxury Volvo and Sleeper Bus Bookings"
                className="w-full h-full object-cover object-[24%_65%] transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

              {/* Top Badges */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-sans font-semibold text-[#002f89] shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#002f89]" />
                  <span>Luxury Volvo & Sleeper Network</span>
                </span>
                <span className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#002f89] shadow-sm">
                  <Bus className="w-4 h-4" />
                </span>
              </div>

              {/* Bottom Quick Metrics Inside Photo */}
              <div className="absolute bottom-3.5 inset-x-4 flex items-center justify-between text-white text-[11.5px] sm:text-xs font-medium pointer-events-none">
                <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  Top-Tier Multi-Axle Coaches
                </span>
                <span className="bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-white/95">
                  Family Live GPS Link
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-7 lg:p-8 flex flex-col flex-1 justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#002f89] font-bold">
                    HIGHWAY TRANSIT
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-sans font-bold text-[#111827] mb-2.5 group-hover:text-[#002f89] transition-colors duration-200">
                  Intercity Buses & Luxury Sleeper Coaches
                </h3>
                <p className="text-xs sm:text-sm text-[#4b5563] leading-relaxed mb-5">
                  Travel in highway comfort with certified premium operators.
                  Enjoy private operator lounge boarding, verified clean
                  amenities, and live vehicle tracking shareable with family.
                </p>

                {/* Feature Tags Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#002f89] shrink-0" />
                    <span>AC Multi-Axle Sleepers</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#002f89] shrink-0" />
                    <span>Live GPS Vehicle Link</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#002f89] shrink-0" />
                    <span>Private Lounge Boarding</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#374151]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#002f89] shrink-0" />
                    <span>100% Paperless M-Ticket</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => onOpenEnquiry?.("Bus Booking")}
                  className="w-full sm:flex-1 py-3 px-5 rounded-md bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white text-xs sm:text-[13px] font-sans font-semibold uppercase tracking-[0.1em] transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Bus className="w-4 h-4" />
                  <span>Book Bus Tickets</span>
                </button>
                <Link
                  href="/services#bus-booking"
                  className="w-full sm:w-auto py-3 px-4 rounded-md border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs sm:text-[13px] font-sans font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Reassurance Trust Strip */}
        <div className="mt-12 sm:mt-14 pt-8 border-t border-neutral-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-[#002f89] mb-1.5" />
            <span className="text-xs sm:text-sm font-semibold text-[#111827]">
              Official Portals
            </span>
            <span className="text-[11px] text-[#6b7280]">
              Authorized IRCTC & verified operators
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Clock className="w-5 h-5 text-[#002f89] mb-1.5" />
            <span className="text-xs sm:text-sm font-semibold text-[#111827]">
              Fast Confirmation
            </span>
            <span className="text-[11px] text-[#6b7280]">
              Instant ticket issuance & WhatsApp delivery
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Compass className="w-5 h-5 text-[#002f89] mb-1.5" />
            <span className="text-xs sm:text-sm font-semibold text-[#111827]">
              Pan-India Coverage
            </span>
            <span className="text-[11px] text-[#6b7280]">
              All railway divisions & major highway corridors
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Sparkles className="w-5 h-5 text-[#002f89] mb-1.5" />
            <span className="text-xs sm:text-sm font-semibold text-[#111827]">
              Zero Booking Friction
            </span>
            <span className="text-[11px] text-[#6b7280]">
              Dedicated human travel desk assistance
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
