import type { PackageSummary } from "@flyora/types";

export type TourCategoryTab = "all" | "international" | "domestic";

export interface TourFilterState {
  categoryTab: TourCategoryTab;
  searchQuery: string;
  selectedDestinations: string[];
  durationCategory: string; // "all" | "short" (1-3) | "medium" (4-5) | "long" (6+)
  budgetRange: string; // "all" | "under30k" | "30k-50k" | "50k-100k" | "above100k"
  sortBy:
    | "recommended"
    | "price-asc"
    | "price-desc"
    | "duration-asc"
    | "duration-desc";
}

export const INITIAL_FILTERS: TourFilterState = {
  categoryTab: "all",
  searchQuery: "",
  selectedDestinations: [],
  durationCategory: "all",
  budgetRange: "all",
  sortBy: "recommended",
};

export const BUDGET_LABELS: Record<string, string> = {
  under30k: "Under ₹30,000",
  "30k-50k": "₹30,000 – ₹50,000",
  "50k-100k": "₹50,000 – ₹1,00,000",
  above100k: "Above ₹1,00,000",
};

export const DURATION_LABELS: Record<string, string> = {
  short: "1 – 3 Days",
  medium: "4 – 5 Days",
  long: "6+ Days",
};

export function isDomesticPackage(pkg: PackageSummary): boolean {
  if (pkg.destinationType) return pkg.destinationType === "DOMESTIC";
  const text = `${pkg.destination} ${pkg.title}`.toLowerCase();
  const domesticKeywords = [
    "india",
    "kashmir",
    "srinagar",
    "gulmarg",
    "pahalgam",
    "ladakh",
    "leh",
    "goa",
    "kerala",
    "munnar",
    "alleppey",
    "kochi",
    "wayanad",
    "manali",
    "shimla",
    "himachal",
    "uttarakhand",
    "rishikesh",
    "mussoorie",
    "nainital",
    "rajasthan",
    "jaipur",
    "udaipur",
    "jodhpur",
    "jaisalmer",
    "agra",
    "delhi",
    "mumbai",
    "andaman",
    "havelock",
    "port blair",
    "varanasi",
    "darjeeling",
    "sikkim",
    "gangtok",
    "ooty",
    "coorg",
    "mysore",
    "tamil nadu",
    "karnataka",
  ];
  return domesticKeywords.some((kw) => text.includes(kw));
}
