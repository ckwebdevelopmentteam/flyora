"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronRight, Sparkles } from "lucide-react";
import type { TourFilterState } from "./types";

interface TourHeaderProps {
  totalResults: number;
  sortBy: TourFilterState["sortBy"];
  onSortChange: (sort: TourFilterState["sortBy"]) => void;
  onOpenMobileFilter?: () => void;
}

export const TourHeader: React.FC<TourHeaderProps> = ({
  totalResults,
  sortBy,
  onSortChange,
  onOpenMobileFilter,
}) => {
  return (
    <div className="space-y-4 pb-6 border-b border-stone-200/80">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-400 font-mono">
        <Link href="/" className="hover:text-stone-700 transition">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-stone-300" />
        <span className="text-[#4A2E18] font-medium">Tour Packages</span>
      </nav>

      {/* Main Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EBE6] text-[#4A2E18] text-[11px] font-semibold tracking-wider uppercase font-mono">
            <Sparkles className="w-3 h-3 text-[#4A2E18]" />
            <span>Curated Luxury Catalog</span>
          </div> */}
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
              className="lg:hidden px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-semibold shadow-xs flex items-center gap-1.5"
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
                aria-label="Sort packages"
                value={sortBy}
                onChange={(e) =>
                  onSortChange(e.target.value as TourFilterState["sortBy"])
                }
                className="appearance-none pl-3 pr-8 py-2 text-xs font-medium rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-hidden focus:border-[#4A2E18] cursor-pointer shadow-xs"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration-asc">Duration: Short to Long</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Result Count Status */}
      <div className="pt-2 text-xs font-mono text-stone-500 flex items-center gap-2">
        {/* <span className="w-2 h-2 rounded-full bg-emerald-500"></span> */}
        <span>
          Showing <strong className="text-stone-900">{totalResults}</strong>{" "}
          handcrafted travel packages
        </span>
      </div>
    </div>
  );
};
