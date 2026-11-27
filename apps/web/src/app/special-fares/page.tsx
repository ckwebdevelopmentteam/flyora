"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { SpecialFareRoute, SpecialFareSummary } from "@flyora/types";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { EnquiryModal } from "../../components/EnquiryModal";
import {
  fetchPublicSpecialFareRoutes,
  fetchPublicSpecialFares,
} from "../../lib/specialFaresApi";
import { SpecialFareTicketCard } from "../../components/special-fares/SpecialFareTicketCard";
import {
  SpecialFareFilters,
  type DepartureWindow,
  type SpecialFareFilterState,
} from "../../components/special-fares/SpecialFareFilters";
import { SpecialFareClaimModal } from "../../components/special-fares/SpecialFareClaimModal";
import {
  AirportCombobox,
  IMPORTANT_AIRPORTS,
  type AirportOption,
} from "../../components/special-fares/AirportCombobox";
import {
  ArrowLeftRight,
  Calendar,
  Plane,
  Search,
  SlidersHorizontal,
  Users,
  X,
  Loader2,
  RotateCcw,
  Percent,
  Luggage,
  UsersRound,
  Check,
} from "lucide-react";

type SortMode = "CHEAPEST" | "EARLIEST";

function getDepartureWindow(iso: string): DepartureWindow {
  const hour = new Date(iso).getHours();
  if (hour >= 5 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 18) return "AFTERNOON";
  if (hour >= 18 && hour < 23) return "EVENING";
  return "NIGHT";
}

function parseCheckedBaggageKg(baggageInfo: string): number {
  const match = baggageInfo.match(/(\d+)\s*kg/i);
  return match ? Number(match[1]) : 0;
}

const INITIAL_FILTERS: SpecialFareFilterState = {
  flightType: "ALL",
  maxPrice: null,
  travelWindow: "ALL",
  baggageTier: "ALL",
  refundableOnly: false,
  departureWindows: [],
  arrivalWindows: [],
  selectedAirlines: [],
};

export default function SpecialFaresPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className="min-h-screen bg-[#FAF9F6] pt-24 pb-16 px-4 sm:px-5"
        >
          <span className="sr-only">Loading special fare deals…</span>
          <div className="max-w-[1360px] mx-auto space-y-6 animate-pulse">
            <div className="h-32 sm:h-44 rounded-2xl bg-blue-100/70" />
            <div className="h-24 rounded-2xl bg-white border border-stone-200/80" />
            <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
              <div className="hidden lg:block h-96 rounded-[14px] bg-white border border-stone-200/80" />
              <div className="space-y-3.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-36 rounded-[14px] bg-white border border-stone-200/80"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SpecialFaresContent />
    </Suspense>
  );
}

function SpecialFaresContent() {
  const searchParams = useSearchParams();

  // Search Inputs
  const [fromInput, setFromInput] = useState(searchParams.get("from") || "");
  const [toInput, setToInput] = useState(searchParams.get("to") || "");
  const [dateInput, setDateInput] = useState(searchParams.get("date") || "");
  const [passengers, setPassengers] = useState(
    Math.max(1, Number(searchParams.get("passengers")) || 1),
  );

  // Active applied search parameters
  const [appliedSearch, setAppliedSearch] = useState({
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    date: searchParams.get("date") || "",
  });

  // Backend Data
  const [tickets, setTickets] = useState<SpecialFareSummary[]>([]);
  const [routes, setRoutes] = useState<SpecialFareRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  // Sidebar Filters & Sort
  const [filters, setFilters] =
    useState<SpecialFareFilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortMode>("CHEAPEST");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Recent airport codes saved in localStorage
  const [savedRecentCodes, setSavedRecentCodes] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("flyora_sf_recent_airports");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSavedRecentCodes(parsed);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveRecentAirport = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean || clean.length < 3 || clean.length > 4) return;
    setSavedRecentCodes((prev) => {
      const next = [clean, ...prev.filter((c) => c !== clean)].slice(0, 5);
      try {
        localStorage.setItem("flyora_sf_recent_airports", JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Booking Claim & Custom Flight Enquiry Modals
  const [selectedTicketForClaim, setSelectedTicketForClaim] =
    useState<SpecialFareSummary | null>(null);
  const [customEnquiryOpen, setCustomEnquiryOpen] = useState(false);

  // Fetch routes once for quick sector options
  useEffect(() => {
    const controller = new AbortController();
    fetchPublicSpecialFareRoutes(controller.signal)
      .then((res) => setRoutes(res))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Fetch live special fares from API whenever applied search changes
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    fetchPublicSpecialFares(
      {
        from: appliedSearch.from || undefined,
        to: appliedSearch.to || undefined,
        date: appliedSearch.date || undefined,
        limit: 100,
      },
      controller.signal,
    )
      .then((res) => {
        setTickets(res.items || []);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setLoadError(err.message || "Unable to load special fares right now.");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [appliedSearch, retryTick]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFrom = fromInput.trim();
    const cleanTo = toInput.trim();
    if (cleanFrom) saveRecentAirport(cleanFrom);
    if (cleanTo) saveRecentAirport(cleanTo);
    setAppliedSearch({
      from: cleanFrom,
      to: cleanTo,
      date: dateInput,
    });
  };

  const handleSwap = () => {
    setFromInput(toInput);
    setToInput(fromInput);
  };

  const handleClearAll = () => {
    setFromInput("");
    setToInput("");
    setDateInput("");
    setAppliedSearch({ from: "", to: "", date: "" });
    setFilters(INITIAL_FILTERS);
  };

  // Merge live routes into extraAirportOptions & recent options
  const { extraAirportOptions, recentOriginOptions, recentDestOptions } =
    useMemo(() => {
      const airportMap = new Map<string, AirportOption>();
      for (const a of IMPORTANT_AIRPORTS) {
        airportMap.set(a.code, a);
      }

      const routeOrigins: AirportOption[] = [];
      const routeDests: AirportOption[] = [];
      const seenOrig = new Set<string>();
      const seenDest = new Set<string>();

      for (const r of routes) {
        const origOpt = airportMap.get(r.originCode) || {
          code: r.originCode,
          city: r.originCity,
          airportName: `${r.originCity} Airport`,
          country: "India",
          flag: "🇮🇳",
        };
        if (!airportMap.has(r.originCode))
          airportMap.set(r.originCode, origOpt);
        if (!seenOrig.has(origOpt.code)) {
          routeOrigins.push(origOpt);
          seenOrig.add(origOpt.code);
        }

        const destOpt = airportMap.get(r.destinationCode) || {
          code: r.destinationCode,
          city: r.destinationCity,
          airportName: `${r.destinationCity} International Airport`,
          country: "International",
          flag: "✈️",
        };
        if (!airportMap.has(r.destinationCode))
          airportMap.set(r.destinationCode, destOpt);
        if (!seenDest.has(destOpt.code)) {
          routeDests.push(destOpt);
          seenDest.add(destOpt.code);
        }
      }

      // Add saved recent airport codes to top if available
      const recentOriginMap = new Map<string, AirportOption>();
      const recentDestMap = new Map<string, AirportOption>();
      for (const code of savedRecentCodes) {
        const found = airportMap.get(code);
        if (found) {
          recentOriginMap.set(code, found);
          recentDestMap.set(code, found);
        }
      }
      for (const o of routeOrigins) {
        if (!recentOriginMap.has(o.code)) recentOriginMap.set(o.code, o);
      }
      for (const d of routeDests) {
        if (!recentDestMap.has(d.code)) recentDestMap.set(d.code, d);
      }

      return {
        extraAirportOptions: Array.from(airportMap.values()),
        recentOriginOptions: Array.from(recentOriginMap.values()),
        recentDestOptions: Array.from(recentDestMap.values()),
      };
    }, [routes, savedRecentCodes]);

  // Date Price Strip derived from active tickets matching origin/destination (ignoring selected date so user can browse nearby dates)
  const datePriceStrip = useMemo(() => {
    const dateMap = new Map<string, { isoDate: string; minFare: number }>();
    for (const t of tickets) {
      const isoDate = t.departureDate.slice(0, 10);
      const existing = dateMap.get(isoDate);
      if (!existing || t.farePerSeat < existing.minFare) {
        dateMap.set(isoDate, { isoDate, minFare: t.farePerSeat });
      }
    }
    return Array.from(dateMap.values()).sort((a, b) =>
      a.isoDate.localeCompare(b.isoDate),
    );
  }, [tickets]);

  // Filter options & price bounds derived from active tickets
  const { airlines, nonStopMinFare, connectingMinFare, priceBounds } =
    useMemo(() => {
      const airlineMap = new Map<string, { minFare: number; count: number }>();
      let minNonStop: number | null = null;
      let minConnecting: number | null = null;
      let minPrice = Infinity;
      let maxPrice = 0;

      for (const t of tickets) {
        if (t.farePerSeat < minPrice) minPrice = t.farePerSeat;
        if (t.farePerSeat > maxPrice) maxPrice = t.farePerSeat;

        const existing = airlineMap.get(t.airlineName);
        if (!existing) {
          airlineMap.set(t.airlineName, { minFare: t.farePerSeat, count: 1 });
        } else {
          existing.count += 1;
          if (t.farePerSeat < existing.minFare)
            existing.minFare = t.farePerSeat;
        }

        if (t.flightType === "NON_STOP") {
          if (minNonStop === null || t.farePerSeat < minNonStop)
            minNonStop = t.farePerSeat;
        } else {
          if (minConnecting === null || t.farePerSeat < minConnecting)
            minConnecting = t.farePerSeat;
        }
      }

      const airlinesList = Array.from(airlineMap.entries())
        .map(([name, info]) => ({ name, ...info }))
        .sort((a, b) => a.minFare - b.minFare);

      return {
        airlines: airlinesList,
        nonStopMinFare: minNonStop,
        connectingMinFare: minConnecting,
        priceBounds: {
          min: minPrice === Infinity ? 0 : Math.floor(minPrice / 500) * 500,
          max: maxPrice === 0 ? 0 : Math.ceil(maxPrice / 500) * 500,
        },
      };
    }, [tickets]);

  // Show Departure/Arrival clock filters only when a specific date is selected
  const showTimeFilters = Boolean(appliedSearch.date);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.flightType !== "ALL") count++;
    if (filters.maxPrice !== null) count++;
    if (filters.travelWindow !== "ALL") count++;
    if (filters.baggageTier !== "ALL") count++;
    if (filters.refundableOnly) count++;
    if (showTimeFilters && filters.departureWindows.length > 0) count++;
    if (showTimeFilters && filters.arrivalWindows.length > 0) count++;
    if (filters.selectedAirlines.length > 0) count++;
    return count;
  }, [filters, showTimeFilters]);

  // Filtered & Sorted Results
  const visibleTickets = useMemo(() => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const nextMonth = (currentMonth + 1) % 12;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    const list = tickets.filter((t) => {
      if (t.availableSeats < passengers) return false;
      if (filters.maxPrice !== null && t.farePerSeat > filters.maxPrice) {
        return false;
      }
      if (filters.flightType !== "ALL" && t.flightType !== filters.flightType) {
        return false;
      }
      if (filters.travelWindow !== "ALL") {
        const dep = new Date(t.departureDate);
        if (filters.travelWindow === "NEXT_7_DAYS" && dep > in7Days) {
          return false;
        }
        if (
          filters.travelWindow === "THIS_MONTH" &&
          (dep.getMonth() !== currentMonth || dep.getFullYear() !== currentYear)
        ) {
          return false;
        }
        if (
          filters.travelWindow === "NEXT_MONTH" &&
          (dep.getMonth() !== nextMonth || dep.getFullYear() !== nextMonthYear)
        ) {
          return false;
        }
      }
      if (filters.baggageTier !== "ALL") {
        const kg = parseCheckedBaggageKg(t.baggageInfo);
        if (filters.baggageTier === "30KG_PLUS" && kg < 30) return false;
        if (filters.baggageTier === "20KG_PLUS" && kg < 20) return false;
      }
      if (filters.refundableOnly && !t.isRefundable) {
        return false;
      }
      if (showTimeFilters && filters.departureWindows.length > 0) {
        const win = getDepartureWindow(t.departureDate);
        if (!filters.departureWindows.includes(win)) return false;
      }
      if (showTimeFilters && filters.arrivalWindows.length > 0) {
        if (!t.arrivalDate) return false;
        const win = getDepartureWindow(t.arrivalDate);
        if (!filters.arrivalWindows.includes(win)) return false;
      }
      if (
        filters.selectedAirlines.length > 0 &&
        !filters.selectedAirlines.includes(t.airlineName)
      ) {
        return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === "CHEAPEST") {
        return a.farePerSeat - b.farePerSeat;
      }
      return (
        new Date(a.departureDate).getTime() -
        new Date(b.departureDate).getTime()
      );
    });
  }, [tickets, passengers, filters, sortBy, showTimeFilters]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C1815]">
      <Navbar activePath="/special-fares" isFixed />

      <main className="flex-1 pb-16">
        {/* Top Sky & Aircraft Hero Banner */}
        <section className="relative overflow-hidden bg-[#dbeafe] pt-[92px] sm:pt-28 pb-9 sm:pb-20">
          <Image
            src="/special-fare-bg.png"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center pointer-events-none select-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/10 to-[#FAF9F6]/85 pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.5)_0%,transparent_68%)] pointer-events-none"
          />

          <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-5 text-center">
            <div className="hidden sm:inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#002f89]">
              <span className="w-8 h-px bg-[#002f89]/40" />
              <span>Exclusive Group Allotments</span>
              <span className="w-8 h-px bg-[#002f89]/40" />
            </div>

            <h1 className="text-[22px] sm:text-4xl lg:text-[42px] font-extrabold tracking-tight sm:mt-1.5 leading-tight">
              <span className="text-[#0c2233]">Special Fare </span>
              <span className="text-[#ef4444]">Flight Deals</span>
            </h1>

            <p className="hidden sm:block text-sm text-[#1c2d42]/85 max-w-xl mx-auto mt-2 font-medium">
              Pre-purchased airline blocks at up to 40% lower rates with
              guaranteed baggage. Limited seats per departure.
            </p>

            <div className="hidden sm:flex mt-4 flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/90 shadow-xs text-xs font-semibold text-[#0c2233]">
                <Percent className="w-3.5 h-3.5 text-[#002f89]" />
                <span>Up to 40% Lower Fares</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/90 shadow-xs text-xs font-semibold text-[#0c2233]">
                <Luggage className="w-3.5 h-3.5 text-[#002f89]" />
                <span>Guaranteed Baggage</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/90 shadow-xs text-xs font-semibold text-[#0c2233]">
                <UsersRound className="w-3.5 h-3.5 text-[#002f89]" />
                <span>Group Allotments</span>
              </span>
            </div>
          </div>
        </section>

        {/* Top Search Setup Strip (Overlapping Banner) */}
        <section className="relative z-20 w-full max-w-[1360px] mx-auto px-3.5 sm:px-5 -mt-5 sm:-mt-12">
          {/* Search Setup Form (Where-Is-My-Train mobile ergonomics + Flyora desktop grid) */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-2xl border border-stone-200/90 shadow-lg shadow-slate-900/5 p-3.5 sm:p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-end">
              {/* Origin + Mobile Floating Swap + Destination */}
              <div className="relative grid grid-cols-1 gap-2.5 md:contents">
                {/* Origin */}
                <div className="md:col-span-3">
                  <AirportCombobox
                    inputId="sf-from-input"
                    label="From"
                    placeholder="City or IATA (e.g. CCJ)"
                    value={fromInput}
                    onChange={(val) => setFromInput(val)}
                    recentAirports={recentOriginOptions}
                    extraAirports={extraAirportOptions}
                  />
                </div>

                {/* Mobile Floating Swap Button (Where-is-my-Train style) */}
                <button
                  type="button"
                  onClick={handleSwap}
                  aria-label="Swap origin and destination (mobile)"
                  className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full border border-stone-200 bg-white shadow-sm hover:bg-stone-50 text-[#002f89] flex items-center justify-center active:scale-95 transition cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4 rotate-90" />
                </button>

                {/* Desktop Swap Button */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center pb-1">
                  <button
                    type="button"
                    onClick={handleSwap}
                    aria-label="Swap origin and destination"
                    className="p-2.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-[#002f89] transition cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Destination */}
                <div className="md:col-span-3">
                  <AirportCombobox
                    inputId="sf-to-input"
                    label="To"
                    placeholder="City or IATA (e.g. DXB)"
                    value={toInput}
                    onChange={(val) => setToInput(val)}
                    recentAirports={recentDestOptions}
                    extraAirports={extraAirportOptions}
                  />
                </div>
              </div>

              {/* Date + Seats side-by-side on mobile, inline on desktop */}
              <div className="grid grid-cols-2 gap-2.5 md:contents">
                {/* Departure Date */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Departure Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full min-h-[42px] pl-9 pr-2 py-2 text-sm font-medium text-[#1C1815] bg-[#FAF9F6] border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002f89]/20 focus:border-[#002f89]"
                    />
                  </div>
                </div>

                {/* Travellers */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Seats
                  </label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      aria-label="Number of passengers"
                      className="w-full min-h-[42px] pl-8 pr-2 py-2 text-sm font-semibold text-[#1C1815] bg-[#FAF9F6] border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002f89]/20 focus:border-[#002f89]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-[#002f89] hover:bg-[#00246b] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Fares</span>
                </button>
              </div>
            </div>

            {/* Active Route Quick Pills (Desktop/Tablet only so mobile goes straight to results) */}
            {routes.length > 0 && (
              <div className="hidden md:flex mt-3 pt-3 border-t border-stone-100 items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-semibold text-stone-400 shrink-0">
                  Popular Sectors:
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 cursor-pointer ${
                    !appliedSearch.from && !appliedSearch.to
                      ? "bg-[#1C1815] text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  All Sectors
                </button>
                {routes.slice(0, 6).map((route) => {
                  const isSelected =
                    appliedSearch.from.toUpperCase() === route.originCode &&
                    appliedSearch.to.toUpperCase() === route.destinationCode;
                  return (
                    <button
                      key={`${route.originCode}-${route.destinationCode}`}
                      type="button"
                      onClick={() => {
                        setFromInput(route.originCode);
                        setToInput(route.destinationCode);
                        setDateInput("");
                        setAppliedSearch({
                          from: route.originCode,
                          to: route.destinationCode,
                          date: "",
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#002f89] text-white border-[#002f89]"
                          : "bg-white text-stone-700 border-stone-200 hover:border-[#002f89]/40"
                      }`}
                    >
                      <span className="capitalize">
                        {route.originCity} ➔ {route.destinationCity}
                      </span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? "text-white/80" : "text-stone-400"
                        }`}
                      >
                        from ₹{route.minFare.toLocaleString("en-IN")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </form>

          {/* 2-Column Workspace */}
          <div className="mt-4 sm:mt-7 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
            {/* Left Sidebar Filters (Desktop) */}
            <div className="hidden lg:block sticky top-24">
              <SpecialFareFilters
                filters={filters}
                onChange={(next) =>
                  setFilters((prev) => ({ ...prev, ...next }))
                }
                onReset={() => setFilters(INITIAL_FILTERS)}
                airlines={airlines}
                nonStopMinFare={nonStopMinFare}
                connectingMinFare={connectingMinFare}
                priceBounds={priceBounds}
                showTimeFilters={showTimeFilters}
              />
            </div>

            {/* Right Results Area */}
            <div className="min-w-0 space-y-3 sm:space-y-4">
              {/* Date Price Strip (Compact Horizontal Dates) */}
              {datePriceStrip.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-[14px] border border-stone-200/90 p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setDateInput("");
                      setAppliedSearch((prev) => ({ ...prev, date: "" }));
                    }}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-center shrink-0 transition cursor-pointer ${
                      !appliedSearch.date
                        ? "bg-[#002f89]/10 text-[#002f89] border border-[#002f89]/30 font-semibold"
                        : "text-stone-600 hover:bg-stone-50 border border-transparent"
                    }`}
                  >
                    <div className="text-[11px] sm:text-xs font-semibold">
                      All Dates
                    </div>
                    <div className="text-[10px] text-stone-500">Flexible</div>
                  </button>

                  {datePriceStrip.map((d) => {
                    const isActive = appliedSearch.date === d.isoDate;
                    const label = new Date(d.isoDate).toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                      },
                    );
                    return (
                      <button
                        key={d.isoDate}
                        type="button"
                        onClick={() => {
                          setDateInput(d.isoDate);
                          setAppliedSearch((prev) => ({
                            ...prev,
                            date: d.isoDate,
                          }));
                        }}
                        className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-center shrink-0 transition border cursor-pointer ${
                          isActive
                            ? "bg-[#002f89]/10 border-[#002f89] text-[#002f89]"
                            : "bg-white border-stone-100 hover:border-stone-300 text-stone-700"
                        }`}
                      >
                        <div className="text-[11px] sm:text-xs font-semibold">
                          {label}
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-emerald-700">
                          ₹{d.minFare.toLocaleString("en-IN")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Unified Filter + Sort + Count Bar */}
              <div className="flex items-center justify-between gap-2 bg-white rounded-xl sm:rounded-[14px] border border-stone-200/90 p-2 sm:px-4 sm:py-2.5 shadow-2xs">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    aria-label="Filter Flights"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden min-h-[36px] px-3 py-1.5 rounded-lg bg-[#002f89]/8 border border-[#002f89]/20 text-xs font-semibold text-[#002f89] inline-flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#002f89] text-white text-[10px] font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSortBy("CHEAPEST")}
                    className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                      sortBy === "CHEAPEST"
                        ? "bg-[#002f89] text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    Cheapest
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("EARLIEST")}
                    className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                      sortBy === "EARLIEST"
                        ? "bg-[#002f89] text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    <span className="sm:hidden">Earliest</span>
                    <span className="hidden sm:inline">Earliest Departure</span>
                  </button>
                </div>

                <div className="text-[11px] sm:text-xs text-stone-500 font-medium shrink-0 pr-1 sm:pr-0">
                  <span className="sm:hidden">
                    <strong className="text-[#1C1815]">
                      {visibleTickets.length}
                    </strong>{" "}
                    {visibleTickets.length === 1 ? "deal" : "deals"}
                  </span>
                  <span className="hidden sm:inline">
                    Showing{" "}
                    <strong className="text-[#1C1815]">
                      {visibleTickets.length}
                    </strong>{" "}
                    special {visibleTickets.length === 1 ? "fare" : "fares"}
                  </span>
                </div>
              </div>

              {/* Active Filter Summary Chips (Tour Packages style) */}
              {activeFilterCount > 0 && (
                <div className="px-3 py-2.5 bg-white border border-stone-200/80 rounded-xl flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-stone-500 mr-1">
                    Active:
                  </span>
                  {filters.flightType !== "ALL" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-stone-200 text-[11px] font-medium text-stone-700">
                      <span>
                        {filters.flightType === "NON_STOP"
                          ? "Direct only"
                          : "1+ Stop"}
                      </span>
                      <button
                        type="button"
                        aria-label="Clear stops filter"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, flightType: "ALL" }))
                        }
                        className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.maxPrice !== null && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-stone-200 text-[11px] font-medium text-stone-700">
                      <span>
                        Up to ₹{filters.maxPrice.toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        aria-label="Clear max price filter"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, maxPrice: null }))
                        }
                        className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.baggageTier !== "ALL" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-stone-200 text-[11px] font-medium text-stone-700">
                      <span>
                        {filters.baggageTier === "30KG_PLUS"
                          ? "30 Kg+ bag"
                          : "20 Kg+ bag"}
                      </span>
                      <button
                        type="button"
                        aria-label="Clear baggage filter"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            baggageTier: "ALL",
                          }))
                        }
                        className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.refundableOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-stone-200 text-[11px] font-medium text-stone-700">
                      <span>Refundable</span>
                      <button
                        type="button"
                        aria-label="Clear refundable filter"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            refundableOnly: false,
                          }))
                        }
                        className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setFilters(INITIAL_FILTERS)}
                    className="ml-auto text-[11px] font-semibold text-[#002f89] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear all</span>
                  </button>
                </div>
              )}

              {/* Ticket List Content */}
              {loading ? (
                <div role="status" className="space-y-3.5">
                  <div className="flex items-center gap-2 px-1 text-xs font-medium text-stone-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#002f89]" />
                    <span>Searching Flyora group flight inventory…</span>
                  </div>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-[14px] border border-stone-200/90 p-4 sm:p-5 space-y-3 animate-pulse"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-100" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-28 bg-stone-100 rounded" />
                            <div className="h-3 w-20 bg-stone-100 rounded" />
                          </div>
                        </div>
                        <div className="h-8 w-24 bg-stone-100 rounded-lg" />
                      </div>
                      <div className="h-10 rounded-xl bg-stone-50" />
                    </div>
                  ))}
                </div>
              ) : loadError ? (
                <div
                  role="alert"
                  className="bg-white rounded-[14px] border border-rose-200 p-10 text-center space-y-3"
                >
                  <p className="text-sm font-medium text-rose-700">
                    {loadError}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryTick((t) => t + 1)}
                    className="px-4 py-2 rounded-md bg-[#002f89] text-white text-xs font-semibold cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : visibleTickets.length === 0 ? (
                <div className="bg-white rounded-[14px] border border-stone-200/90 p-10 sm:p-14 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-base font-bold text-[#1C1815]">
                      No matching special fares found
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      We may still have special partner fares or flexible date
                      options available offline for your route. Clear filters or
                      request a custom quote from our flight desk.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-4 py-2 rounded-md border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Show All Available Deals</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomEnquiryOpen(true)}
                      className="px-5 py-2 rounded-md bg-[#002f89] hover:bg-[#00246b] text-white text-xs font-semibold cursor-pointer"
                    >
                      Request Custom Flight Quote
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {visibleTickets.map((ticket) => (
                    <SpecialFareTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      passengers={passengers}
                      onClaim={(t) => setSelectedTicketForClaim(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Slide-Up Bottom Sheet Filter Drawer (Tour Packages style) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[86dvh] flex flex-col shadow-2xl z-10 overflow-hidden">
            {/* Drag Handle & Header */}
            <div className="pt-2.5 px-5 pb-3.5 border-b border-stone-100">
              <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-stone-900">
                    Filter Special Fares
                  </h3>
                  <span className="text-xs text-stone-400 font-mono">
                    ({visibleTickets.length} available)
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[#FAF9F6] space-y-3">
              {/* Sort By inside Mobile Sheet */}
              <div className="bg-white rounded-xl border border-stone-200/90 p-3.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Sort Fares By
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSortBy("CHEAPEST")}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      sortBy === "CHEAPEST"
                        ? "bg-[#002f89] text-white border-[#002f89]"
                        : "bg-stone-50 text-stone-700 border-stone-200"
                    }`}
                  >
                    Cheapest First
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("EARLIEST")}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      sortBy === "EARLIEST"
                        ? "bg-[#002f89] text-white border-[#002f89]"
                        : "bg-stone-50 text-stone-700 border-stone-200"
                    }`}
                  >
                    Earliest Flight
                  </button>
                </div>
              </div>

              <SpecialFareFilters
                filters={filters}
                onChange={(next) =>
                  setFilters((prev) => ({ ...prev, ...next }))
                }
                onReset={() => setFilters(INITIAL_FILTERS)}
                airlines={airlines}
                nonStopMinFare={nonStopMinFare}
                connectingMinFare={connectingMinFare}
                priceBounds={priceBounds}
                showTimeFilters={showTimeFilters}
              />
            </div>

            {/* Sticky Footer Actions */}
            <div className="p-4 border-t border-stone-100 bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="min-h-[44px] py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-[#002f89] text-white text-xs font-semibold shadow-sm hover:bg-[#00246b] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Show {visibleTickets.length} Fares</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Special Fare Modal */}
      <SpecialFareClaimModal
        ticket={selectedTicketForClaim}
        initialPassengers={passengers}
        onClose={() => setSelectedTicketForClaim(null)}
      />

      {/* Fallback Custom Flight Enquiry Modal */}
      <EnquiryModal
        isOpen={customEnquiryOpen}
        onClose={() => setCustomEnquiryOpen(false)}
        prefill={{
          serviceName: "Flight Booking",
          origin: fromInput || undefined,
          destination: toInput || undefined,
          travelDate: dateInput || undefined,
          adults: passengers,
        }}
      />

      <Footer />
    </div>
  );
}
