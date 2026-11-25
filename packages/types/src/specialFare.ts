export type FlightType = "NON_STOP" | "CONNECTING";

export type SpecialFareStatus = "ACTIVE" | "SOLD_OUT" | "EXPIRED" | "PAUSED";

/**
 * Public-facing Special Fare Ticket Summary
 * Strips all internal costs, supplier data, and PNR references.
 */
export interface SpecialFareSummary {
  id: string;
  airlineName: string;
  airlineCode?: string | null;
  flightNumber?: string | null;
  originCity: string;
  originCode: string;
  destinationCity: string;
  destinationCode: string;
  departureDate: string;
  arrivalDate?: string | null;
  flightType: FlightType;
  baggageInfo: string;
  availableSeats: number;
  originalFare?: number | null;
  farePerSeat: number;
  expiresAt: string;
  metadata?: Record<string, unknown> | null;
}

/**
 * Full Admin Detail for Coordinators & Operations Managers
 * Includes wholesale supplier costs, margin calculations, and group PNR references.
 */
export interface SpecialFareAdminDetail extends SpecialFareSummary {
  totalSeats: number;
  supplierCost?: number | null;
  pnrNumber?: string | null;
  notes?: string | null;
  marginAmount?: number | null;
  marginPercent?: number | null;
  status: SpecialFareStatus;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
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
  notes?: string;
}
