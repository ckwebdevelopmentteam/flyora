export type FlightType = "NON_STOP" | "CONNECTING";

export type CabinClass = "ECONOMY" | "BUSINESS" | "FIRST_CLASS";

export type SpecialFareStatus = "ACTIVE" | "SOLD_OUT" | "EXPIRED" | "PAUSED";

/**
 * Public-facing Special Fare Ticket Summary
 * Strips all internal costs, supplier data, RBD, and PNR references.
 */
export interface SpecialFareSummary {
  id: string;
  airlineName: string;
  airlineCode?: string | null;
  flightNumber?: string | null;
  originCity: string;
  originCode: string;
  originTerminal?: string | null;
  destinationCity: string;
  destinationCode: string;
  destinationTerminal?: string | null;
  departureDate: string;
  arrivalDate?: string | null;
  flightType: FlightType;
  cabinClass?: CabinClass;
  baggageInfo: string;
  isRefundable?: boolean;
  availableSeats: number;
  originalFare?: number | null;
  farePerSeat: number;
  childFare?: number | null;
  infantFare?: number | null;
  expiresAt: string;
}

/**
 * Full Admin Detail for Coordinators & Operations Managers
 * Includes wholesale supplier costs, margin calculations, RBD, and group PNR references.
 */
export interface SpecialFareAdminDetail extends SpecialFareSummary {
  totalSeats: number;
  rbd?: string | null;
  supplierCost?: number | null;
  pnrNumber?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  marginAmount?: number | null;
  marginPercent?: number | null;
  status: SpecialFareStatus;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Bulk create response for series & CSV sheet imports
 */
export interface BulkSpecialFareResult {
  createdCount: number;
  items: SpecialFareAdminDetail[];
}

/**
 * Aggregated Route Information for Sector Filter Chips
 */
export interface SpecialFareRoute {
  originCity: string;
  originCode: string;
  destinationCity: string;
  destinationCode: string;
  count: number;
  minFare: number;
}

/**
 * Query filters for searching special fares
 */
export interface SpecialFareSearchQuery {
  from?: string;
  to?: string;
  date?: string;
  airline?: string;
  status?: SpecialFareStatus;
  page?: number;
  limit?: number;
}

/**
 * Lead enquiry payload when claiming a special fare deal
 */
export interface SpecialFareEnquiryPayload {
  fullName: string;
  phone: string;
  email?: string;
  passengerCount: number;
  childCount?: number;
  infantCount?: number;
  notes?: string;
}
