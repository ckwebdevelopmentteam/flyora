"use client";

import React, { useState } from "react";
import type { SpecialFareSummary } from "@flyora/types";
import {
  Plane,
  Luggage,
  Armchair,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";

interface SpecialFareTicketCardProps {
  ticket: SpecialFareSummary;
  passengers: number;
  onClaim: (ticket: SpecialFareSummary) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function computeDuration(
  depIso: string,
  arrIso?: string | null,
): string | null {
  if (!arrIso) return null;
  const dep = new Date(depIso).getTime();
  const arr = new Date(arrIso).getTime();
  if (isNaN(dep) || isNaN(arr) || arr <= dep) return null;
  const mins = Math.round((arr - dep) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function isNextDay(depIso: string, arrIso?: string | null): boolean {
  if (!arrIso) return false;
  const dep = new Date(depIso);
  const arr = new Date(arrIso);
  return (
    arr.getUTCDate() !== dep.getUTCDate() ||
    arr.getUTCMonth() !== dep.getUTCMonth() ||
    arr.getUTCFullYear() !== dep.getUTCFullYear()
  );
}

export function SpecialFareTicketCard({
  ticket,
  passengers,
  onClaim,
}: SpecialFareTicketCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const duration = computeDuration(ticket.departureDate, ticket.arrivalDate);
  const nextDay = isNextDay(ticket.departureDate, ticket.arrivalDate);
  const isLowSeats = ticket.availableSeats <= 3;

  const hoursLeft = Math.max(
    0,
    Math.floor((new Date(ticket.expiresAt).getTime() - Date.now()) / 3600000),
  );
  const isExpiringSoon = hoursLeft <= 24;

  const codeBadge =
    ticket.airlineCode?.toUpperCase() ||
    ticket.airlineName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const metadataEntries =
    ticket.metadata && typeof ticket.metadata === "object"
      ? Object.entries(ticket.metadata)
      : [];

  return (
    <article className="bg-white rounded-[14px] border border-stone-200/90 hover:border-[#002f89]/40 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Main Horizontal Row */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        {/* 1. Airline Info */}
        <div className="flex items-center gap-3.5 md:w-[190px] shrink-0">
          <div className="w-11 h-11 rounded-xl bg-[#F4F6FA] border border-stone-200/80 flex items-center justify-center font-mono font-bold text-sm text-[#002f89] shrink-0">
            {codeBadge}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#1C1815] leading-tight truncate">
              {ticket.airlineName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-500 font-medium">
              {ticket.flightNumber && (
                <span className="font-mono text-stone-600">
                  {ticket.flightNumber}
                </span>
              )}
              {ticket.flightNumber && <span>·</span>}
              <span>{formatShortDate(ticket.departureDate)}</span>
            </div>
          </div>
        </div>

        {/* 2. Route & Timing Timeline */}
        <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-6 flex-1 min-w-0">
          {/* Origin */}
          <div className="text-left sm:text-right min-w-[75px]">
            <div className="text-lg sm:text-xl font-bold text-[#1C1815] leading-none">
              {formatTime(ticket.departureDate)}
            </div>
            <div className="text-xs font-semibold text-stone-700 mt-1">
              {ticket.originCity}{" "}
              <span className="text-stone-400 font-mono">
                ({ticket.originCode})
              </span>
            </div>
          </div>

          {/* Flight Line */}
          <div className="flex flex-col items-center flex-1 max-w-[160px] px-1">
            <span className="text-[11px] font-medium text-stone-500 mb-1 whitespace-nowrap">
              {duration ||
                (ticket.flightType === "NON_STOP" ? "Direct Flight" : "1 Stop")}
            </span>
            <div className="relative w-full flex items-center justify-center">
              <div className="w-full border-t border-dashed border-stone-300" />
              <div className="absolute bg-white px-1.5">
                <Plane className="w-3.5 h-3.5 text-[#002f89] rotate-90 sm:rotate-0" />
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mt-1">
              {ticket.flightType === "NON_STOP" ? "Non-Stop" : "Connecting"}
            </span>
          </div>

          {/* Destination */}
          <div className="text-right sm:text-left min-w-[75px]">
            <div className="text-lg sm:text-xl font-bold text-[#1C1815] leading-none flex items-baseline gap-1 justify-end sm:justify-start">
              <span>
                {ticket.arrivalDate ? formatTime(ticket.arrivalDate) : "TBA"}
              </span>
              {nextDay && (
                <span className="text-[10px] font-semibold text-[#002f89]">
                  +1d
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-stone-700 mt-1">
              {ticket.destinationCity}{" "}
              <span className="text-stone-400 font-mono">
                ({ticket.destinationCode})
              </span>
            </div>
          </div>
        </div>

        {/* 3. Seat Urgency & Price + CTA */}
        <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 shrink-0">
          {/* Seats Remaining */}
          <div className="flex flex-col items-start md:items-center">
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isLowSeats
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-stone-50 text-stone-700 border-stone-200"
              }`}
            >
              <Armchair className="w-3 h-3 shrink-0" />
              <span>
                {isLowSeats
                  ? `Only ${ticket.availableSeats} Left`
                  : `${ticket.availableSeats} Left`}
              </span>
            </div>
            {isExpiringSoon && (
              <span className="text-[10px] font-medium text-amber-700 mt-1 inline-flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                Ends in {hoursLeft}h
              </span>
            )}
          </div>

          {/* Price & Claim Button */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="text-right">
              {ticket.originalFare &&
                ticket.originalFare > ticket.farePerSeat && (
                  <div className="text-xs font-semibold text-rose-600 line-through leading-none mb-0.5">
                    ₹{ticket.originalFare.toLocaleString("en-IN")}
                  </div>
                )}
              <div className="text-lg sm:text-xl font-bold text-emerald-700 leading-tight">
                ₹{ticket.farePerSeat.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-medium text-stone-500">
                Per seat · Special Fare
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={() => onClaim(ticket)}
                className="px-4 py-2 rounded-md bg-[#002f89] hover:bg-[#00246b] active:scale-[0.98] text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                Book Now
              </button>
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="text-[11px] font-medium text-[#002f89] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>{showDetails ? "Hide Details" : "+ Details"}</span>
                {showDetails ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Footer Info Strip */}
      <div className="px-4 sm:px-5 py-2 bg-[#FAF9F6] border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
        <div className="inline-flex items-center gap-1.5">
          <Luggage className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="font-medium text-stone-700">
            {ticket.baggageInfo}
          </span>
        </div>

        <div className="text-stone-500">
          {passengers > 1 && (
            <span>
              Total for {passengers} travellers:{" "}
              <strong className="text-stone-900">
                ₹{(ticket.farePerSeat * passengers).toLocaleString("en-IN")}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Expandable Details Panel */}
      {showDetails && (
        <div className="px-4 sm:px-5 py-3.5 bg-white border-t border-stone-100 text-xs text-stone-600 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
              Fare Type
            </span>
            <span className="font-medium text-stone-800">
              Flyora Contracted Group Allotment
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
              Baggage Allowance
            </span>
            <span className="font-medium text-stone-800">
              {ticket.baggageInfo}
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
              Deal Availability Window
            </span>
            <span className="font-medium text-stone-800">
              Book before{" "}
              {new Date(ticket.expiresAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {metadataEntries.map(([key, val]) => (
            <div key={key}>
              <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                {key}
              </span>
              <span className="font-medium text-stone-800">{String(val)}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
