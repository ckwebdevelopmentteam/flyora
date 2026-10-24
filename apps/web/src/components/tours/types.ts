import type { PackageSummary } from "@flyora/types";

export interface TourFilterState {
  searchQuery: string;
  selectedDestinations: string[];
  durationCategory: string; // "all" | "short" (1-3) | "medium" (4-5) | "long" (6+)
  budgetRange: string; // "all" | "under60k" | "60k-100k" | "above100k"
  sortBy: "recommended" | "price-asc" | "price-desc" | "duration-asc";
}

export const INITIAL_FILTERS: TourFilterState = {
  searchQuery: "",
  selectedDestinations: [],
  durationCategory: "all",
  budgetRange: "all",
  sortBy: "recommended",
};
