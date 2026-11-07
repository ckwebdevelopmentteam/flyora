"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronRight,
  Globe2,
  Compass,
  MapPin,
} from "lucide-react";
import type { TourFilterState, TourCategoryTab } from "./types";

interface TourHeaderProps {
  totalResults: number;
  sortBy: TourFilterState["sortBy"];
  onSortChange: (sort: TourFilterState["sortBy"]) => void;
  categoryTab: TourCategoryTab;
  onCategoryChange: (tab: TourCategoryTab) => void;
  categoryCounts: { all: number; international: number; domestic: number };
  onOpenMobileFilter?: () => void;
  isLoading?: boolean;
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
}) => {
  return (
    <div className="space-y-5 pb-6 border-b border-stone-200/80">
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
        <div className="flex items-center gap-3 self-start md:self-end">
          {/* Mobile Filter Button */}
          {onOpenMobileFilter && (
            <button
              onClick={onOpenMobileFilter}
              className="lg:hidden px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Filters</span>
            </button>
          )}

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-mono hidden sm:inline">
              Sort by:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  onSortChange(e.target.value as TourFilterState["sortBy"])
                }
                className="appearance-none pl-3 pr-8 py-2 text-xs font-medium rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-hidden focus:border-[#002f89] cursor-pointer shadow-xs"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration-asc">Duration: Short to Long</option>
                <option value="duration-desc">Duration: Long to Short</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

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
