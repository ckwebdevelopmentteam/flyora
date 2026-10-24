"use client";

import React from "react";
import { X, Check } from "lucide-react";
import type { TourFilterState } from "./types";
import { TourFilterSidebar } from "./TourFilterSidebar";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TourFilterState;
  onChange: (updated: Partial<TourFilterState>) => void;
  onReset: () => void;
  availableDestinations: string[];
  totalResults: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  availableDestinations,
  totalResults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl z-10 overflow-hidden">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-stone-900">Filter Tours</h3>
            <span className="text-xs text-stone-400 font-mono">
              ({totalResults} available)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 overflow-y-auto flex-1">
          <TourFilterSidebar
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            availableDestinations={availableDestinations}
          />
        </div>

        {/* Drawer Footer with Coffee Brown Action Button */}
        <div className="p-4 border-t border-stone-100 bg-white flex items-center gap-3">
          <button
            onClick={onReset}
            className="py-3 px-4 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-[#4A2E18] text-white text-xs font-semibold shadow-sm hover:bg-[#38200F] transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Show {totalResults} Packages</span>
          </button>
        </div>
      </div>
    </div>
  );
};
