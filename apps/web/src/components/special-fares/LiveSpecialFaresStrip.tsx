"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { SpecialFareSummary } from "@flyora/types";
import { ArrowRight, Calendar, Luggage, Plane, Sparkles } from "lucide-react";
import { fetchPublicSpecialFares } from "../../lib/specialFaresApi";

export function LiveSpecialFaresStrip() {
  const [deals, setDeals] = useState<SpecialFareSummary[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchPublicSpecialFares({ limit: 3 }, controller.signal)
      .then((res) => {
        setDeals((res.items || []).slice(0, 3));
      })
      .catch(() => {
        // Hide strip if special fares fail to load
      })
      .finally(() => {
        setLoaded(true);
      });
    return () => controller.abort();
  }, []);

  if (!loaded || deals.length === 0) return null;

  const cardsGridCols =
    deals.length === 1
      ? "grid-cols-1 max-w-md"
      : deals.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      aria-label="Live special fare deals"
      className="w-full pt-0 pb-4 px-4 sm:px-10 lg:px-[105px]"
    >
      <div className="relative overflow-hidden w-full rounded-2xl bg-white p-5 sm:p-7 shadow-[0_10px_32px_rgba(0,47,137,0.12)]">
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-bottom bg-no-repeat z-0 -scale-x-100"
          style={{
            backgroundImage: `url('/destinations/team-curve-bg.svg?v=1')`,
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Left Heading */}
          <div className="shrink-0 xl:max-w-[270px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#ef4444] via-[#dc2626] to-[#991b1b] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              <Plane className="w-3 h-3" />
              Special Fares
            </span>
            <h2 className="font-serif text-xl sm:text-3xl font-normal text-[#1E1A17] tracking-tight mt-2.5">
              Live Group Seat Deals
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5">
              Pre-purchased airline blocks at up to 40% off with guaranteed
              baggage.
            </p>
          </div>

          {/* Right Cards (1, 2, or 3 deals) */}
          <div className={`flex-1 grid ${cardsGridCols} gap-4`}>
            {deals.map((deal) => {
              const depDate = new Date(deal.departureDate).toLocaleDateString(
                "en-IN",
                { day: "2-digit", month: "short", year: "numeric" },
              );
              const depTime = new Date(deal.departureDate).toLocaleTimeString(
                "en-IN",
                { hour: "2-digit", minute: "2-digit" },
              );
              const urgentSeats = deal.availableSeats <= 5;
              return (
                <Link
                  key={deal.id}
                  href={`/special-fares?from=${encodeURIComponent(
                    deal.originCode,
                  )}&to=${encodeURIComponent(deal.destinationCode)}`}
                  className="group rounded-2xl bg-[#002f89] p-2.5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                >
                  {/* White Inner Content Card (no image) */}
                  <div className="bg-white rounded-xl p-4 min-h-[144px] flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#002f89] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full truncate max-w-[65%]">
                        {deal.airlineName}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-500 shrink-0">
                        {deal.flightType === "NON_STOP"
                          ? "Non-Stop"
                          : "1+ Stop"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-lg sm:text-xl font-extrabold text-[#1C1815] tracking-tight group-hover:text-[#002f89] transition-colors">
                        <span>{deal.originCode}</span>
                        <span className="text-stone-400 font-normal text-base">
                          ➔
                        </span>
                        <span>{deal.destinationCode}</span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 truncate">
                        {deal.originCity} to {deal.destinationCity}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-[11px] text-stone-600">
                      <span className="inline-flex items-center gap-1 truncate">
                        <Calendar className="w-3.5 h-3.5 text-[#002f89] shrink-0" />
                        <span>
                          {depDate} · {depTime}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-stone-500 shrink-0">
                        <Luggage className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{deal.baggageInfo.split("+")[0].trim()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Blue Outer Footer */}
                  <div className="px-2 pt-3 pb-1 text-white flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold truncate">
                        {deal.originCity} → {deal.destinationCity}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          urgentSeats
                            ? "bg-amber-400/20 text-amber-200 border border-amber-300/30"
                            : "bg-white/15 text-blue-100 border border-white/20"
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {deal.availableSeats}{" "}
                        {deal.availableSeats === 1 ? "seat" : "seats"} left
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        {deal.originalFare != null &&
                          deal.originalFare > deal.farePerSeat && (
                            <span className="text-xs text-red-300 line-through">
                              ₹{deal.originalFare.toLocaleString("en-IN")}
                            </span>
                          )}
                        <span className="text-lg font-extrabold text-white">
                          ₹{deal.farePerSeat.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] text-blue-200">
                          / seat
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-100 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                        View
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Centered CTA Button Below */}
        <div className="relative z-10 mt-6 flex justify-center">
          <Link
            href="/special-fares"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white text-xs sm:text-[13px] font-semibold tracking-wide transition-colors shadow-xs whitespace-nowrap"
          >
            <span>See Full Tickets</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
