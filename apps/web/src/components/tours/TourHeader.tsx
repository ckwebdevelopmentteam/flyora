"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronRight,
  Globe2,
  Compass,
  MapPin,
  Search,
  X,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import type { TourFilterState, TourCategoryTab } from "./types";

const SORT_OPTIONS: { value: TourFilterState["sortBy"]; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "duration-asc", label: "Duration: Short to Long" },
  { value: "duration-desc", label: "Duration: Long to Short" },
];

interface TourHeaderProps {
  totalResults: number;
  sortBy: TourFilterState["sortBy"];
  onSortChange: (sort: TourFilterState["sortBy"]) => void;
  categoryTab: TourCategoryTab;
  onCategoryChange: (tab: TourCategoryTab) => void;
  categoryCounts: { all: number; international: number; domestic: number };
  onOpenMobileFilter?: () => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const TourHeader: React.FC<TourHeaderProps> = ({
  totalResults,
  sortBy,
  onSortChange,
  categoryTab,
  onCategoryChange,
  categoryCounts,
  onOpenMobileFilter,
  isLoading,
  searchQuery = "",
  onSearchChange,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort menu on Escape key
  useEffect(() => {
    if (!isSortOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSortOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSortOpen]);

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Recommended";
  return (
    <div className="space-y-4 sm:space-y-5 pb-6 border-b border-stone-200/80">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-400 font-mono">
        <Link href="/" className="hover:text-stone-700 transition">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-stone-300" />
        <span className="text-[#002f89] font-medium">Tour Packages</span>
      </nav>

      {/* Main Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-stone-900 tracking-tight">
            Handcrafted Tour Packages
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Personalized itineraries featuring private luxury stays, airport
            transfers, curated excursions, and 24/7 dedicated travel coordinator
            concierge.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-start md:self-end">
          {/* Mobile Filter Button */}
          {onOpenMobileFilter && (
            <button
              onClick={onOpenMobileFilter}
              className="lg:hidden px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-stone-50 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#002f89]" />
              <span>Filters</span>
            </button>
          )}

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-mono hidden sm:inline">
              Sort by:
            </span>
            <div ref={sortRef} className="relative">
              {/* Accessible Hidden Select for automated tests & form agents */}
              <select
                aria-label="Sort packages"
                value={sortBy}
                onChange={(e) =>
                  onSortChange(e.target.value as TourFilterState["sortBy"])
                }
                className="sr-only"
                tabIndex={-1}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Styled Custom Trigger Button */}
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                aria-expanded={isSortOpen}
                aria-haspopup="listbox"
                aria-label={`Sort by: ${currentSortLabel}`}
                className={`flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 cursor-pointer shadow-xs ${
                  isSortOpen
                    ? "border-[#002f89] ring-2 ring-[#002f89]/15 bg-white text-stone-900"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <span>{currentSortLabel}</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              </button>

              {/* Styled Popover Dropdown Menu */}
              {isSortOpen && (
                <>
                  {/* Backdrop for outside click dismissal */}
                  <div
                    className="fixed inset-0 z-40 bg-black/10 backdrop-blur-2xs sm:bg-transparent"
                    onClick={() => setIsSortOpen(false)}
                    aria-hidden="true"
                  />

                  <div
                    role="listbox"
                    aria-label="Sort options"
                    className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 sm:w-56 bg-white rounded-xl border border-stone-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.14)] p-1.5 animate-dropdown-in"
                  >
                    <div className="px-2.5 py-1 text-[10.5px] font-mono uppercase tracking-wider text-stone-400 border-b border-stone-100 mb-1 select-none">
                      Sort packages by
                    </div>
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = opt.value === sortBy;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onSortChange(opt.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left select-none ${
                            isSelected
                              ? "bg-[#002f89]/8 text-[#002f89] font-bold"
                              : "text-stone-700 hover:bg-stone-100/70 hover:text-stone-900 font-medium"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && (
                            <Check
                              className="w-3.5 h-3.5 text-[#002f89] shrink-0"
                              strokeWidth={2.5}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Directly accessible on mobile/tablet where left sidebar is hidden) */}
      {onSearchChange && (
        <div className="lg:hidden relative w-full pt-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search destination or package name"
            placeholder="Search destination, tour title (e.g. Dubai, Bali, Kashmir)..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-[14px] border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-[#002f89] focus:ring-1 focus:ring-[#002f89] shadow-xs transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Category Segment Tabs & Result Count Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            {
              id: "all" as const,
              label: "All Packages",
              count: categoryCounts.all,
              icon: Compass,
            },
            {
              id: "international" as const,
              label: "International",
              count: categoryCounts.international,
              icon: Globe2,
            },
            {
              id: "domestic" as const,
              label: "Domestic (India)",
              count: categoryCounts.domestic,
              icon: MapPin,
            },
          ].map((tab) => {
            const isActive = categoryTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#002f89] text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/80"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-blue-200" : "text-stone-500"
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white text-stone-600 border border-stone-200/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result Count Status */}
        <div className="text-xs font-mono text-stone-500 shrink-0">
          {isLoading ? (
            <span className="flex items-center gap-2 text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
              Loading travel packages...
            </span>
          ) : (
            <span>
              Showing{" "}
              <strong className="text-stone-900 font-semibold">
                {totalResults}
              </strong>{" "}
              {totalResults === 1 ? "package" : "packages"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
