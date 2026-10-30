"use client";

import React from "react";
import {
  Search,
  RotateCcw,
  MapPin,
  Clock,
  IndianRupee,
  SlidersHorizontal,
} from "lucide-react";
import type { TourFilterState } from "./types";

interface TourFilterSidebarProps {
  filters: TourFilterState;
  onChange: (updated: Partial<TourFilterState>) => void;
  onReset: () => void;
  availableDestinations: string[];
}

export const TourFilterSidebar: React.FC<TourFilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  availableDestinations,
}) => {
  const toggleDestination = (dest: string) => {
    const current = [...filters.selectedDestinations];
    const index = current.indexOf(dest);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(dest);
    }
    onChange({ selectedDestinations: current });
  };

  const durationOptions = [
    { label: "All Durations", value: "all" },
    { label: "1 - 3 Days", value: "short" },
    { label: "4 - 5 Days", value: "medium" },
    { label: "6+ Days", value: "long" },
  ];

  const budgetOptions = [
    { label: "All Budgets", value: "all" },
    { label: "Under ₹60,000", value: "under60k" },
    { label: "₹60,000 - ₹1,00,000", value: "60k-100k" },
    { label: "Above ₹1,00,000", value: "above100k" },
  ];

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.selectedDestinations.length > 0 ||
    filters.durationCategory !== "all" ||
    filters.budgetRange !== "all";

  return (
    <aside className="w-full bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-[#4A2E18]" />
          <span>Filter Packages</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-[#4A2E18] hover:text-[#38200F] font-medium flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-700 block">
          Search Destination or Title
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            aria-label="Search destination or title"
            placeholder="e.g. Dubai, Bali, Maldives..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:border-[#4A2E18] focus:ring-1 focus:ring-[#4A2E18] text-stone-800 transition"
          />
        </div>
      </div>

      {/* Destinations Filter */}
      <div className="space-y-3 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
          <MapPin className="w-3.5 h-3.5 text-[#4A2E18]" />
          <span>Top Destinations</span>
        </div>
        <div className="space-y-2">
          {availableDestinations.map((dest) => {
            const isChecked = filters.selectedDestinations.includes(dest);
            return (
              <label
                key={dest}
                className="flex items-center gap-2.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer select-none py-0.5"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleDestination(dest)}
                  className="rounded border-stone-300 text-[#4A2E18] focus:ring-[#4A2E18] w-4 h-4 accent-[#4A2E18]"
                />
                <span>{dest}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Trip Duration Filter */}
      <div className="space-y-3 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
          <Clock className="w-3.5 h-3.5 text-[#4A2E18]" />
          <span>Trip Duration</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {durationOptions.map((opt) => {
            const isSelected = filters.durationCategory === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange({ durationCategory: opt.value })}
                className={`py-2 px-2.5 text-[11px] rounded-xl font-medium transition text-center ${
                  isSelected
                    ? "bg-[#4A2E18] text-white shadow-xs"
                    : "bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Range Filter */}
      <div className="space-y-3 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
          <IndianRupee className="w-3.5 h-3.5 text-[#4A2E18]" />
          <span>Starting price</span>
        </div>
        <div className="space-y-2">
          {budgetOptions.map((opt) => {
            const isSelected = filters.budgetRange === opt.value;
            return (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer select-none py-0.5"
              >
                <input
                  type="radio"
                  name="budgetRange"
                  checked={isSelected}
                  onChange={() => onChange({ budgetRange: opt.value })}
                  className="text-[#4A2E18] focus:ring-[#4A2E18] w-4 h-4 accent-[#4A2E18]"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
