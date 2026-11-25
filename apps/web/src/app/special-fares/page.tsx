"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
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
} from "lucide-react";

type SortMode = "CHEAPEST" | "EARLIEST";

function getDepartureWindow(iso: string): DepartureWindow {
  const hour = new Date(iso).getHours();
  if (hour >= 5 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 18) return "AFTERNOON";
  if (hour >= 18 && hour < 23) return "EVENING";
  return "NIGHT";
}

export default function SpecialFaresPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-stone-500 text-sm">
          Loading special fare deals…
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
  const [filters, setFilters] = useState<SpecialFareFilterState>({
    flightType: "ALL",
    departureWindows: [],
    arrivalWindows: [],
    selectedAirlines: [],
  });
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
    setFilters({
      flightType: "ALL",
      departureWindows: [],
      arrivalWindows: [],
      selectedAirlines: [],
    });
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

  // Filter options derived from active tickets
  const { airlines, nonStopMinFare, connectingMinFare } = useMemo(() => {
    const airlineMap = new Map<string, { minFare: number; count: number }>();
    let minNonStop: number | null = null;
    let minConnecting: number | null = null;

    for (const t of tickets) {
      const existing = airlineMap.get(t.airlineName);
      if (!existing) {
        airlineMap.set(t.airlineName, { minFare: t.farePerSeat, count: 1 });
      } else {
        existing.count += 1;
        if (t.farePerSeat < existing.minFare) existing.minFare = t.farePerSeat;
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
    };
  }, [tickets]);

  // Filtered & Sorted Results
  const visibleTickets = useMemo(() => {
    const list = tickets.filter((t) => {
      if (t.availableSeats < passengers) return false;
      if (filters.flightType !== "ALL" && t.flightType !== filters.flightType) {
        return false;
      }
      if (filters.departureWindows.length > 0) {
        const win = getDepartureWindow(t.departureDate);
        if (!filters.departureWindows.includes(win)) return false;
      }
      if (filters.arrivalWindows.length > 0) {
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
  }, [tickets, passengers, filters, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C1815]">
      <Navbar activePath="/special-fares" />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        {/* Top Search Setup Strip */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#002f89]">
                Exclusive Group Allotments
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1815] tracking-tight mt-1">
                Special Fare Flight Deals
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md">
              Pre-purchased airline blocks at up to 40% lower rates with
              guaranteed baggage. Limited seats per departure.
            </p>
          </div>

          {/* Search Setup Form (Akbar reference adapted cleanly to Flyora theme) */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-[14px] border border-stone-200/90 shadow-sm p-3.5 sm:p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
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

              {/* Swap Button */}
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
                    className="w-full pl-9 pr-2.5 py-2.5 text-sm font-medium text-[#1C1815] bg-[#FAF9F6] border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002f89]/20 focus:border-[#002f89]"
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
                    className="w-full pl-8 pr-2 py-2.5 text-sm font-semibold text-[#1C1815] bg-[#FAF9F6] border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002f89]/20 focus:border-[#002f89]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-md bg-[#002f89] hover:bg-[#00246b] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-xs min-h-[42px]"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Fares</span>
                </button>
              </div>
            </div>

            {/* Active Route Quick Pills */}
            {routes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
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
                      <span>
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
          <div className="mt-7 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Sidebar Filters (Desktop) */}
            <div className="hidden lg:block lg:col-span-1 sticky top-24">
              <SpecialFareFilters
                filters={filters}
                onChange={(next) =>
                  setFilters((prev) => ({ ...prev, ...next }))
                }
                onReset={() =>
                  setFilters({
                    flightType: "ALL",
                    departureWindows: [],
                    arrivalWindows: [],
                    selectedAirlines: [],
                  })
                }
                airlines={airlines}
                nonStopMinFare={nonStopMinFare}
                connectingMinFare={connectingMinFare}
              />
            </div>

            {/* Right Results Area */}
            <div className="lg:col-span-3 space-y-4">
              {/* Mobile Filter Trigger */}
              <div className="flex lg:hidden items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="px-4 py-2 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-700 inline-flex items-center gap-2 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#002f89]" />
                  <span>Filter Flights</span>
                </button>
                <span className="text-xs text-stone-500 font-medium">
                  {visibleTickets.length} deals available
                </span>
              </div>

              {/* Date Price Strip (Horizontal Dates) */}
              {datePriceStrip.length > 0 && (
                <div className="bg-white rounded-[14px] border border-stone-200/90 p-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setDateInput("");
                      setAppliedSearch((prev) => ({ ...prev, date: "" }));
                    }}
                    className={`px-3.5 py-2 rounded-lg text-center shrink-0 transition cursor-pointer ${
                      !appliedSearch.date
                        ? "bg-[#002f89]/10 text-[#002f89] border border-[#002f89]/30 font-semibold"
                        : "text-stone-600 hover:bg-stone-50 border border-transparent"
                    }`}
                  >
                    <div className="text-xs font-semibold">All Dates</div>
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
                        className={`px-3.5 py-2 rounded-lg text-center shrink-0 transition border cursor-pointer ${
                          isActive
                            ? "bg-[#002f89]/10 border-[#002f89] text-[#002f89]"
                            : "bg-white border-stone-100 hover:border-stone-300 text-stone-700"
                        }`}
                      >
                        <div className="text-xs font-semibold">{label}</div>
                        <div className="text-[11px] font-bold text-emerald-700">
                          ₹{d.minFare.toLocaleString("en-IN")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sort Pills & Count Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-[14px] border border-stone-200/90 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSortBy("CHEAPEST")}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
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
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      sortBy === "EARLIEST"
                        ? "bg-[#002f89] text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    Earliest Departure
                  </button>
                </div>

                <div className="text-xs text-stone-500 font-medium">
                  Showing{" "}
                  <strong className="text-[#1C1815]">
                    {visibleTickets.length}
                  </strong>{" "}
                  special {visibleTickets.length === 1 ? "fare" : "fares"}
                </div>
              </div>

              {/* Ticket List Content */}
              {loading ? (
                <div className="bg-white rounded-[14px] border border-stone-200/90 p-14 flex flex-col items-center justify-center gap-3 text-stone-500">
                  <Loader2 className="w-7 h-7 animate-spin text-[#002f89]" />
                  <p className="text-xs font-medium">
                    Searching Flyora group flight inventory…
                  </p>
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

      {/* Mobile Filters Slide-Over Drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden flex justify-end"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileFiltersOpen(false);
          }}
        >
          <div className="w-[85vw] max-w-sm bg-[#FAF9F6] h-full overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="text-sm font-bold">Filter Special Fares</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 text-stone-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SpecialFareFilters
              filters={filters}
              onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
              onReset={() =>
                setFilters({
                  flightType: "ALL",
                  departureWindows: [],
                  arrivalWindows: [],
                  selectedAirlines: [],
                })
              }
              airlines={airlines}
              nonStopMinFare={nonStopMinFare}
              connectingMinFare={connectingMinFare}
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full py-2.5 rounded-md bg-[#002f89] text-white text-xs font-semibold cursor-pointer"
            >
              Show {visibleTickets.length} Results
            </button>
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
