"use client";

import React from "react";
import type { FlightType } from "@flyora/types";
import { RotateCcw, Sun, Sunset, Moon, Sunrise } from "lucide-react";

export type DepartureWindow = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";

export interface SpecialFareFilterState {
  flightType: FlightType | "ALL";
  departureWindows: DepartureWindow[];
  arrivalWindows: DepartureWindow[];
  selectedAirlines: string[];
}

interface AirlineFilterOption {
  name: string;
  minFare: number;
  count: number;
}

interface SpecialFareFiltersProps {
  filters: SpecialFareFilterState;
  onChange: (next: Partial<SpecialFareFilterState>) => void;
  onReset: () => void;
  airlines: AirlineFilterOption[];
  nonStopMinFare?: number | null;
  connectingMinFare?: number | null;
}

const TIME_WINDOWS: Array<{
  id: DepartureWindow;
  label: string;
  range: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "MORNING", label: "Morning", range: "05am - 12pm", icon: Sunrise },
  { id: "AFTERNOON", label: "Afternoon", range: "12pm - 6pm", icon: Sun },
  { id: "EVENING", label: "Evening", range: "6pm - 11pm", icon: Sunset },
  { id: "NIGHT", label: "Night", range: "11pm - 05am", icon: Moon },
];

export function SpecialFareFilters({
  filters,
  onChange,
  onReset,
  airlines,
  nonStopMinFare,
  connectingMinFare,
}: SpecialFareFiltersProps) {
  const hasActiveFilters =
    filters.flightType !== "ALL" ||
    filters.departureWindows.length > 0 ||
    filters.arrivalWindows.length > 0 ||
    filters.selectedAirlines.length > 0;

  const toggleTimeWindow = (
    field: "departureWindows" | "arrivalWindows",
    win: DepartureWindow,
  ) => {
    const current = filters[field];
    const exists = current.includes(win);
    onChange({
      [field]: exists ? current.filter((w) => w !== win) : [...current, win],
    });
  };

  const toggleAirline = (name: string) => {
    const exists = filters.selectedAirlines.includes(name);
    onChange({
      selectedAirlines: exists
        ? filters.selectedAirlines.filter((a) => a !== name)
        : [...filters.selectedAirlines, name],
    });
  };

  return (
    <aside className="bg-white rounded-[14px] border border-stone-200/90 p-5 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h2 className="text-sm font-bold text-[#1C1815] tracking-tight">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-semibold text-[#002f89] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Stops Filter */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-[#1C1815]">Stops</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({
                flightType:
                  filters.flightType === "NON_STOP" ? "ALL" : "NON_STOP",
              })
            }
            className={`px-3 py-2 rounded-lg border text-center transition-all cursor-pointer ${
              filters.flightType === "NON_STOP"
                ? "border-[#002f89] bg-[#002f89]/5 text-[#002f89]"
                : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
            }`}
          >
            <div className="text-xs font-semibold">Non-Stop</div>
            {nonStopMinFare ? (
              <div className="text-[10px] text-stone-500 mt-0.5">
                ₹{nonStopMinFare.toLocaleString("en-IN")}
              </div>
            ) : (
              <div className="text-[10px] text-stone-400 mt-0.5">—</div>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              onChange({
                flightType:
                  filters.flightType === "CONNECTING" ? "ALL" : "CONNECTING",
              })
            }
            className={`px-3 py-2 rounded-lg border text-center transition-all cursor-pointer ${
              filters.flightType === "CONNECTING"
                ? "border-[#002f89] bg-[#002f89]/5 text-[#002f89]"
                : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
            }`}
          >
            <div className="text-xs font-semibold">1+ Stop</div>
            {connectingMinFare ? (
              <div className="text-[10px] text-stone-500 mt-0.5">
                ₹{connectingMinFare.toLocaleString("en-IN")}
              </div>
            ) : (
              <div className="text-[10px] text-stone-400 mt-0.5">—</div>
            )}
          </button>
        </div>
      </div>

      {/* 2. Departure Times */}
      <div className="space-y-2.5 pt-2 border-t border-stone-100">
        <h3 className="text-xs font-semibold text-[#1C1815]">Departure Time</h3>
        <div className="grid grid-cols-2 gap-2">
          {TIME_WINDOWS.map((win) => {
            const Icon = win.icon;
            const active = filters.departureWindows.includes(win.id);
            return (
              <button
                key={`dep-${win.id}`}
                type="button"
                onClick={() => toggleTimeWindow("departureWindows", win.id)}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  active
                    ? "border-[#002f89] bg-[#002f89]/5 text-[#002f89]"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium leading-tight">
                  {win.range}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Arrival Times */}
      <div className="space-y-2.5 pt-2 border-t border-stone-100">
        <h3 className="text-xs font-semibold text-[#1C1815]">Arrival Time</h3>
        <div className="grid grid-cols-2 gap-2">
          {TIME_WINDOWS.map((win) => {
            const Icon = win.icon;
            const active = filters.arrivalWindows.includes(win.id);
            return (
              <button
                key={`arr-${win.id}`}
                type="button"
                onClick={() => toggleTimeWindow("arrivalWindows", win.id)}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  active
                    ? "border-[#002f89] bg-[#002f89]/5 text-[#002f89]"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium leading-tight">
                  {win.range}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Airlines */}
      {airlines.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-stone-100">
          <h3 className="text-xs font-semibold text-[#1C1815]">Airlines</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {airlines.map((airline) => {
              const checked = filters.selectedAirlines.includes(airline.name);
              return (
                <label
                  key={airline.name}
                  className="flex items-center justify-between gap-2 text-xs text-stone-700 cursor-pointer group"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAirline(airline.name)}
                      className="rounded border-stone-300 text-[#002f89] focus:ring-[#002f89] cursor-pointer"
                    />
                    <span className="truncate group-hover:text-black">
                      {airline.name}{" "}
                      <span className="text-stone-400">({airline.count})</span>
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold text-stone-600 shrink-0">
                    ₹{airline.minFare.toLocaleString("en-IN")}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
