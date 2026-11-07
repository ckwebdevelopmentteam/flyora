import type { QuoteStatus } from "@flyora/types";

export type QuotationItemType =
  "FLIGHT" | "HOTEL" | "VISA" | "TRANSFER" | "ACTIVITY" | "OTHER";

export interface QuoteItemFormState {
  id: string;
  type: QuotationItemType;
  title: string;
  description: string;
  quantity: number;
  supplierCost: number;
  sellingPrice: number;
}

export interface MarginCalculationResult {
  totalSupplierCost: number;
  totalSellingPrice: number;
  grossMarginAmount: number;
  marginPercent: number;
  minMarginPercent: number;
  isHealthy: boolean;
  shortfallAmount: number;
}

export interface QuotationRecord {
  id: string;
  quoteNumber: string;
  leadId: string;
  createdById: string;
  createdByName?: string;
  status: QuoteStatus;
  shareToken: string;
  supplierCost: number;
  sellingPrice: number;
  marginAmount: number;
  marginPercent: number;
  items: QuoteItemFormState[];
  inclusions: string[];
  exclusions: string[];
  validUntil: string;
  notes?: string | null;
  createdAt: string;
}

export const COMMON_INCLUSIONS = [
  "Daily Breakfast",
  "Airport Pick-up & Drop (Private AC Vehicle)",
  "4-Star Luxury Hotel Accommodation",
  "Sightseeing Tours with English-speaking Guide",
  "Express Visa Assistance & Processing Fees",
  "Welcome Drink on Arrival",
  "Desert Safari with BBQ Dinner & Entertainment",
  "Inter-city Bullet Train / AC Coach Transfers",
  "Taxes & Service Charges",
];

export const COMMON_EXCLUSIONS = [
  "Personal Expenses & Laundry",
  "City Tourism Dirham / Hotel Tax (Paid directly at check-in)",
  "International Travel Insurance",
  "Meals not mentioned in Itinerary",
  "Early Check-In / Late Check-Out Charges",
  "Optional Water Sports & Activities",
  "Tips and Gratuities",
];

export const ITEM_TYPE_PRESETS: Record<
  QuotationItemType,
  { label: string; defaultTitle: string; defaultDesc: string }
> = {
  FLIGHT: {
    label: "Flight",
    defaultTitle: "Round-trip Flights",
    defaultDesc: "Economy class, includes 20kg check-in & 7kg cabin baggage",
  },
  HOTEL: {
    label: "Hotel",
    defaultTitle: "4-Star Hotel Stay",
    defaultDesc: "Double sharing deluxe room with daily breakfast",
  },
  VISA: {
    label: "Visa",
    defaultTitle: "Tourist Visa Processing",
    defaultDesc: "Single entry tourist e-visa with standard processing",
  },
  TRANSFER: {
    label: "Transfer",
    defaultTitle: "Private Airport Transfers",
    defaultDesc: "Airport to Hotel & return in private air-conditioned vehicle",
  },
  ACTIVITY: {
    label: "Activity",
    defaultTitle: "City Tour & Sightseeing",
    defaultDesc: "Half-day guided sightseeing with entrance tickets",
  },
  OTHER: {
    label: "Custom",
    defaultTitle: "Travel Add-on / Miscellaneous",
    defaultDesc: "Special customized arrangement",
  },
};
