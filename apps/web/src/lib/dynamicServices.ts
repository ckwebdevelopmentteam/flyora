/**
 * Dynamic Service Types and Context-Aware Suggestions Engine for Flyora
 *
 * Implements cascading service selection, domestic vs international trip context detection,
 * service-specific type options, and destination-aware intelligent suggestions.
 *
 * STRICTLY uses existing backend contracts and maps to `/api/v1/services` and `/api/v1/public/enquiry`.
 */

export type TripMode = "domestic" | "international";

export interface DestinationItem {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  isDomestic: boolean;
  subRegion?: string;
  popularServices: string[]; // slugs of services typically relevant
}

export interface OriginItem {
  code: string;
  name: string;
  city: string;
  country: string;
  isDomestic: boolean;
  sub?: string;
}

export interface ServiceTypeOption {
  id: string;
  label: string;
  description?: string;
  badge?: string;
}

export interface SuggestionItem {
  id: string;
  label: string;
  description?: string;
  category: "comfort" | "savings" | "experience" | "speed" | "family";
  iconName?: string;
}

// =============================================================================
// 1. ORIGIN & DESTINATION CATALOGS (Domestic & International)
// =============================================================================

export const POPULAR_ORIGINS: OriginItem[] = [
  // Domestic Hubs (India)
  {
    code: "BOM",
    name: "Mumbai",
    city: "Mumbai",
    country: "India",
    isDomestic: true,
    sub: "Chhatrapati Shivaji Maharaj Intl (BOM)",
  },
  {
    code: "DEL",
    name: "New Delhi",
    city: "Delhi",
    country: "India",
    isDomestic: true,
    sub: "Indira Gandhi International (DEL)",
  },
  {
    code: "BLR",
    name: "Bengaluru",
    city: "Bengaluru",
    country: "India",
    isDomestic: true,
    sub: "Kempegowda International (BLR)",
  },
  {
    code: "HYD",
    name: "Hyderabad",
    city: "Hyderabad",
    country: "India",
    isDomestic: true,
    sub: "Rajiv Gandhi International (HYD)",
  },
  {
    code: "MAA",
    name: "Chennai",
    city: "Chennai",
    country: "India",
    isDomestic: true,
    sub: "Chennai International (MAA)",
  },
  {
    code: "CCU",
    name: "Kolkata",
    city: "Kolkata",
    country: "India",
    isDomestic: true,
    sub: "Netaji Subhash Chandra Bose Intl (CCU)",
  },
  {
    code: "COK",
    name: "Kochi",
    city: "Kochi",
    country: "India",
    isDomestic: true,
    sub: "Cochin International (COK)",
  },
  {
    code: "AMD",
    name: "Ahmedabad",
    city: "Ahmedabad",
    country: "India",
    isDomestic: true,
    sub: "Sardar Vallabhbhai Patel Intl (AMD)",
  },
  // International Hubs
  {
    code: "DXB",
    name: "Dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    isDomestic: false,
    sub: "Dubai International Airport (DXB)",
  },
  {
    code: "LHR",
    name: "London",
    city: "London",
    country: "United Kingdom",
    isDomestic: false,
    sub: "Heathrow Airport (LHR)",
  },
  {
    code: "SIN",
    name: "Singapore",
    city: "Singapore",
    country: "Singapore",
    isDomestic: false,
    sub: "Changi International Airport (SIN)",
  },
  {
    code: "JED",
    name: "Jeddah",
    city: "Jeddah",
    country: "Saudi Arabia",
    isDomestic: false,
    sub: "King Abdulaziz International (JED)",
  },
];

export const POPULAR_DESTINATIONS: DestinationItem[] = [
  // Domestic Destinations (India)
  {
    id: "dest-goa",
    name: "Goa (Beaches & Heritage)",
    country: "India",
    countryCode: "IN",
    isDomestic: true,
    subRegion: "Coastal Western India",
    popularServices: [
      "holiday-packages",
      "flight-booking",
      "hotel-booking",
      "bus-booking",
      "train-booking",
    ],
  },
  {
    id: "dest-kashmir",
    name: "Kashmir (Srinagar & Gulmarg)",
    country: "India",
    countryCode: "IN",
    isDomestic: true,
    subRegion: "Himalayas",
    popularServices: ["holiday-packages", "flight-booking", "hotel-booking"],
  },
  {
    id: "dest-kerala",
    name: "Kerala (Munnar & Backwaters)",
    country: "India",
    countryCode: "IN",
    isDomestic: true,
    subRegion: "South India",
    popularServices: [
      "holiday-packages",
      "flight-booking",
      "hotel-booking",
      "train-booking",
    ],
  },
  {
    id: "dest-manali",
    name: "Manali & Shimla (Himachal)",
    country: "India",
    countryCode: "IN",
    isDomestic: true,
    subRegion: "Himalayas",
    popularServices: ["holiday-packages", "bus-booking", "hotel-booking"],
  },
  {
    id: "dest-jaipur",
    name: "Jaipur & Udaipur (Rajasthan)",
    country: "India",
    countryCode: "IN",
    isDomestic: true,
    subRegion: "North India",
    popularServices: [
      "holiday-packages",
      "train-booking",
      "flight-booking",
      "hotel-booking",
    ],
  },
  {
    id: "dest-andaman",
    name: "Andaman & Nicobar Islands",
    country: "India",
    countryCode: "IN",
    isDomestic: true,
    subRegion: "Island Territories",
    popularServices: ["holiday-packages", "flight-booking", "hotel-booking"],
  },
  {
    id: "dest-varanasi",
    name: "Varanasi (Spiritual Ghats)",
    country: "India",
    countryCode: "IN",
    isDomestic: true,
    subRegion: "North India",
    popularServices: [
      "holiday-packages",
      "train-booking",
      "flight-booking",
      "hotel-booking",
    ],
  },
  // International Destinations
  {
    id: "dest-dubai",
    name: "Dubai & Abu Dhabi",
    country: "United Arab Emirates",
    countryCode: "AE",
    isDomestic: false,
    subRegion: "Middle East",
    popularServices: [
      "flight-booking",
      "visa-assistance",
      "hotel-booking",
      "holiday-packages",
    ],
  },
  {
    id: "dest-swiss",
    name: "Switzerland & The Alps",
    country: "Switzerland",
    countryCode: "CH",
    isDomestic: false,
    subRegion: "Western Europe",
    popularServices: [
      "flight-booking",
      "visa-assistance",
      "holiday-packages",
      "hotel-booking",
    ],
  },
  {
    id: "dest-bali",
    name: "Bali & Ubud Sanctuary",
    country: "Indonesia",
    countryCode: "ID",
    isDomestic: false,
    subRegion: "Southeast Asia",
    popularServices: [
      "flight-booking",
      "visa-assistance",
      "hotel-booking",
      "holiday-packages",
    ],
  },
  {
    id: "dest-maldives",
    name: "Maldives Islands",
    country: "Maldives",
    countryCode: "MV",
    isDomestic: false,
    subRegion: "Indian Ocean",
    popularServices: ["flight-booking", "hotel-booking", "holiday-packages"],
  },
  {
    id: "dest-makkah",
    name: "Makkah & Madinah (Umrah/Hajj)",
    country: "Saudi Arabia",
    countryCode: "SA",
    isDomestic: false,
    subRegion: "Middle East",
    popularServices: [
      "umrah-hajj",
      "visa-assistance",
      "flight-booking",
      "hotel-booking",
    ],
  },
  {
    id: "dest-london",
    name: "London & Great Britain",
    country: "United Kingdom",
    countryCode: "GB",
    isDomestic: false,
    subRegion: "Europe",
    popularServices: [
      "flight-booking",
      "visa-assistance",
      "holiday-packages",
      "hotel-booking",
    ],
  },
  {
    id: "dest-singapore",
    name: "Singapore City & Sentosa",
    country: "Singapore",
    countryCode: "SG",
    isDomestic: false,
    subRegion: "Southeast Asia",
    popularServices: [
      "flight-booking",
      "visa-assistance",
      "hotel-booking",
      "holiday-packages",
    ],
  },
  {
    id: "dest-japan",
    name: "Kyoto & Tokyo",
    country: "Japan",
    countryCode: "JP",
    isDomestic: false,
    subRegion: "East Asia",
    popularServices: [
      "flight-booking",
      "visa-assistance",
      "holiday-packages",
      "hotel-booking",
    ],
  },
  {
    id: "dest-paris",
    name: "Paris & French Riviera",
    country: "France",
    countryCode: "FR",
    isDomestic: false,
    subRegion: "Western Europe",
    popularServices: [
      "flight-booking",
      "visa-assistance",
      "holiday-packages",
      "hotel-booking",
    ],
  },
  {
    id: "dest-tulum",
    name: "Tulum & Riviera Maya",
    country: "Mexico",
    countryCode: "MX",
    isDomestic: false,
    subRegion: "North America",
    popularServices: ["flight-booking", "hotel-booking", "holiday-packages"],
  },
];

// Helper to infer or detect trip mode from origin and destination
export function detectTripMode(
  originName?: string,
  destName?: string,
): TripMode {
  if (!destName && !originName) return "domestic";

  // Check destination first
  if (destName) {
    const matchedDest = POPULAR_DESTINATIONS.find(
      (d) =>
        d.name.toLowerCase().includes(destName.toLowerCase()) ||
        destName.toLowerCase().includes(d.name.toLowerCase()) ||
        destName.toLowerCase().includes(d.country.toLowerCase()),
    );
    if (matchedDest) {
      return matchedDest.isDomestic ? "domestic" : "international";
    }

    const internationalKeywords = [
      "dubai",
      "uae",
      "switzerland",
      "alps",
      "london",
      "uk",
      "bali",
      "indonesia",
      "maldives",
      "makkah",
      "madinah",
      "saudi",
      "hajj",
      "umrah",
      "singapore",
      "japan",
      "tokyo",
      "kyoto",
      "paris",
      "france",
      "europe",
      "schengen",
      "tulum",
      "mexico",
      "rome",
      "italy",
      "bangkok",
      "thailand",
    ];
    if (internationalKeywords.some((k) => destName.toLowerCase().includes(k))) {
      return "international";
    }
  }

  // Check origin
  if (originName) {
    const matchedOrigin = POPULAR_ORIGINS.find(
      (o) =>
        o.name.toLowerCase().includes(originName.toLowerCase()) ||
        o.city.toLowerCase().includes(originName.toLowerCase()) ||
        originName.toLowerCase().includes(o.code.toLowerCase()),
    );
    if (matchedOrigin && !matchedOrigin.isDomestic) {
      return "international";
    }
  }

  return "domestic";
}

// =============================================================================
// 2. DYNAMIC SERVICE FILTERING BASED ON TRIP CONTEXT & BACKEND DATA
// =============================================================================

export interface BackendServiceRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
}

/**
 * Filters backend services according to the trip context (Domestic vs International).
 * STRICTLY respects the services returned by the backend API.
 */
export function filterServicesByTripMode<T extends BackendServiceRecord>(
  backendServices: T[],
  tripMode: TripMode,
  destinationCountryOrName?: string,
): T[] {
  if (!backendServices || !backendServices.length) return [];

  const destLower = (destinationCountryOrName || "").toLowerCase();
  const isPilgrimageDestination =
    destLower.includes("saudi") ||
    destLower.includes("makkah") ||
    destLower.includes("madinah") ||
    destLower.includes("jeddah") ||
    destLower.includes("umrah") ||
    destLower.includes("hajj");

  return backendServices.filter((srv) => {
    const slug = (srv.slug || "").toLowerCase();
    const name = (srv.name || "").toLowerCase();
    const combined = `${slug} ${name}`;

    if (tripMode === "domestic") {
      // Domestic trips do not require Visa Assistance
      if (combined.includes("visa")) return false;
      // Umrah & Hajj is located in Saudi Arabia, not domestic India
      if (combined.includes("umrah") || combined.includes("hajj")) return false;

      // Domestic supports: Flights, Trains, Buses, Hotels, Holiday Packages
      return true;
    } else {
      // International trips
      // Buses and Trains are domestic ground transport, unsupported cross-border from India
      if (combined.includes("bus")) return false;
      if (combined.includes("train") || combined.includes("rail")) return false;

      // Umrah & Hajj is only relevant if travelling to Saudi Arabia / pilgrimage destination
      // or if no specific destination is yet selected
      if (combined.includes("umrah") || combined.includes("hajj")) {
        return !destinationCountryOrName || isPilgrimageDestination;
      }

      // International supports: Flights, Hotels, Visa Assistance, Holiday Packages
      return true;
    }
  });
}

// =============================================================================
// 3. DYNAMIC SERVICE TYPES CONFIGURATIONS (Per Service)
// =============================================================================

export interface ServiceTypeDefinition {
  primaryTypeLabel: string;
  primaryTypes: ServiceTypeOption[];
  secondaryTypeLabel?: string;
  secondaryTypes?: ServiceTypeOption[];
}

export const DYNAMIC_SERVICE_TYPES: Record<string, ServiceTypeDefinition> = {
  // 1. FLIGHT BOOKING
  "flight-booking": {
    primaryTypeLabel: "Trip Type",
    primaryTypes: [
      {
        id: "round-trip",
        label: "Round-trip",
        description: "Standard return departure & arrival",
      },
      { id: "one-way", label: "One-way", description: "Single journey ticket" },
      {
        id: "multi-city",
        label: "Multi-city",
        description: "Complex custom flight route",
        badge: "Flexible",
      },
    ],
    secondaryTypeLabel: "Cabin Class",
    secondaryTypes: [
      {
        id: "economy",
        label: "Economy Class",
        description: "Best available commercial fares",
      },
      {
        id: "premium-economy",
        label: "Premium Economy",
        description: "Extra legroom, priority check-in",
      },
      {
        id: "business",
        label: "Business Class",
        description: "Lie-flat beds, lounge access, gourmet meals",
        badge: "Luxury",
      },
      {
        id: "first-class",
        label: "First Class",
        description: "Private suites & bespoke VIP ground concierge",
        badge: "VIP",
      },
    ],
  },

  // 2. HOTEL BOOKING
  "hotel-booking": {
    primaryTypeLabel: "Accommodation Tier",
    primaryTypes: [
      {
        id: "luxury-5star",
        label: "Luxury 5-Star Resort",
        description: "World-class properties & curated hospitality",
        badge: "5★",
      },
      {
        id: "premium-4star",
        label: "Premium 4-Star Hotel",
        description: "High-end comfort with executive amenities",
        badge: "4★",
      },
      {
        id: "boutique-heritage",
        label: "Boutique & Heritage Stay",
        description: "Unique local charm, villas or palaces",
      },
      {
        id: "comfort-3star",
        label: "Comfort Standard (3-Star)",
        description: "Convenient central location & essentials",
      },
      {
        id: "budget",
        label: "Budget-Friendly Stay",
        description: "Clean, verified verified guest stays",
      },
    ],
    secondaryTypeLabel: "Room Configuration",
    secondaryTypes: [
      {
        id: "double-twin",
        label: "Double / Twin Room",
        description: "1 King or 2 Queen beds",
      },
      {
        id: "single-exec",
        label: "Single Executive Room",
        description: "Solo traveller / business setup",
      },
      {
        id: "family-suite",
        label: "Family Suite / Interconnecting",
        description: "Spacious layout for parents & kids",
      },
      {
        id: "pool-villa",
        label: "Private Pool Villa / Penthouse",
        description: "Secluded private pool & personalized butler",
      },
    ],
  },

  // 3. VISA ASSISTANCE
  "visa-assistance": {
    primaryTypeLabel: "Visa Category",
    primaryTypes: [
      {
        id: "tourist-visa",
        label: "Tourist Visa",
        description: "Vacation, leisure & sightseeing travel",
      },
      {
        id: "business-visa",
        label: "Business Visa",
        description: "Conferences, client meetings & commercial visits",
      },
      {
        id: "express-urgent",
        label: "Express / Priority Filing",
        description: "Accelerated embassy slot assistance",
        badge: "Fast-Track",
      },
      {
        id: "transit-visa",
        label: "Transit Visa",
        description: "Short stopovers & airport layovers",
      },
    ],
    secondaryTypeLabel: "Entry Preference",
    secondaryTypes: [
      {
        id: "single-entry",
        label: "Single Entry (30 Days)",
        description: "Standard single visit",
      },
      {
        id: "multiple-entry",
        label: "Multiple Entry (60–90 Days)",
        description: "Multi-destination or recurring travel",
      },
      {
        id: "long-term",
        label: "Long-term Multi-Year Visa",
        description: "Extended validity visitor visa (US/UK/Schengen)",
      },
    ],
  },

  // 4. HOLIDAY PACKAGES
  "holiday-packages": {
    primaryTypeLabel: "Experience Style",
    primaryTypes: [
      {
        id: "curated-full",
        label: "Complete Tour Package",
        description: "Flights + 4/5★ Stays + Guided Sightseeing + Transfers",
        badge: "All-Inclusive",
      },
      {
        id: "private-guided",
        label: "Private Chauffeur & Guided Tour",
        description: "Personalized vehicle, driver & licensed historian",
      },
      {
        id: "adventure-nature",
        label: "Adventure & Wilderness Itinerary",
        description: "Trekking, watersports & natural wonders",
      },
      {
        id: "cultural-heritage",
        label: "Cultural & Culinary Immersion",
        description: "Local artisans, food tours & historic landmarks",
      },
      {
        id: "leisure-wellness",
        label: "Relaxation & Wellness Retreat",
        description: "Spa sanctuaries, private pool villas & scenic downtime",
      },
    ],
    secondaryTypeLabel: "Pace & Schedule",
    secondaryTypes: [
      {
        id: "relaxed",
        label: "Relaxed & Leisurely Pace",
        description: "Ample free time with unhurried mornings",
      },
      {
        id: "comprehensive",
        label: "Comprehensive Highlights Tour",
        description: "See all major monuments and key experiences",
      },
      {
        id: "bespoke",
        label: "Fully Tailor-made Itinerary",
        description: "Designed entirely around your wishlist",
      },
    ],
  },

  // 5. UMRAH & HAJJ
  "umrah-hajj": {
    primaryTypeLabel: "Pilgrimage Category",
    primaryTypes: [
      {
        id: "umrah-executive",
        label: "Executive Umrah (5★ Haram Frontage)",
        description:
          "Makkah Clock Tower / Madinah 5★ hotels with luxury transfers",
        badge: "VIP 5★",
      },
      {
        id: "umrah-economy",
        label: "Deluxe Economy Umrah",
        description: "Comfortable hotel with dedicated 24/7 shuttle service",
      },
      {
        id: "hajj-nonshifting",
        label: "Hajj: Executive Non-Shifting (Mina A)",
        description:
          "Zero-transit Makkah stay & VIP air-conditioned Mina tents",
        badge: "Executive",
      },
      {
        id: "hajj-deluxe",
        label: "Hajj: Deluxe Shifting (Full Season)",
        description: "Complete pilgrimage itinerary with Azizia stay",
      },
      {
        id: "hajj-express",
        label: "Hajj: Express Pilgrimage (14 Days)",
        description: "Short-duration program for working professionals",
      },
    ],
    secondaryTypeLabel: "Sharing & Accommodation",
    secondaryTypes: [
      {
        id: "dual-sharing",
        label: "Double Sharing (2 Beds)",
        description: "Private room for couple or two pilgrims",
      },
      {
        id: "triple-sharing",
        label: "Triple Sharing (3 Beds)",
        description: "Shared family room",
      },
      {
        id: "quad-sharing",
        label: "Quad Sharing (4 Beds)",
        description: "Standard group room",
      },
      {
        id: "private-suite",
        label: "Private Suite (Haram View)",
        description: "Direct Kaaba / Haram view suite",
      },
    ],
  },

  // 6. TRAIN BOOKING (Domestic)
  "train-booking": {
    primaryTypeLabel: "Booking Quota",
    primaryTypes: [
      {
        id: "general",
        label: "General Quota (GN)",
        description: "Standard advance railway reservation",
      },
      {
        id: "tatkal",
        label: "Tatkal Quota (CK)",
        description: "Urgent emergency quota reservation",
        badge: "Urgent",
      },
      {
        id: "premium-tatkal",
        label: "Premium Tatkal (PT)",
        description: "Dynamic fare emergency booking",
      },
      {
        id: "ladies",
        label: "Ladies Quota (LD)",
        description: "Reserved berths for female travelers",
      },
    ],
    secondaryTypeLabel: "Travel Class",
    secondaryTypes: [
      {
        id: "1a-ac",
        label: "1st AC (1A)",
        description: "Lockable private 2-berth / 4-berth compartment",
      },
      {
        id: "2a-ac",
        label: "2nd AC (2A)",
        description: "Air-conditioned 2-tier sleeper with privacy curtains",
      },
      {
        id: "3a-ac",
        label: "3rd AC (3A)",
        description: "Air-conditioned 3-tier sleeper",
      },
      {
        id: "ec-chair",
        label: "Executive Chair Car (EC)",
        description: "Premium 2x2 spacious recliner seats",
      },
      {
        id: "sl-sleeper",
        label: "Sleeper Class (SL)",
        description: "Non-AC budget sleeper berths",
      },
    ],
  },

  // 7. BUS BOOKING (Domestic)
  "bus-booking": {
    primaryTypeLabel: "Coach Category",
    primaryTypes: [
      {
        id: "volvo-sleeper",
        label: "Volvo / Scania Multi-Axle AC Sleeper",
        description: "Smooth ride, air suspension & plush berths",
        badge: "Top Comfort",
      },
      {
        id: "ac-semi-sleeper",
        label: "AC Semi-Sleeper (2+2 Recliners)",
        description: "Spacious ergonomic pushback seating",
      },
      {
        id: "non-ac-sleeper",
        label: "Non-AC Sleeper Coach",
        description: "Economical overnight long-distance travel",
      },
      {
        id: "luxury-charter",
        label: "Full Luxury Coach Charter",
        description: "Private 35-50 seater for family or wedding groups",
        badge: "Charter",
      },
    ],
    secondaryTypeLabel: "Berth / Seat Preference",
    secondaryTypes: [
      {
        id: "single-lower",
        label: "Single Lower Sleeper",
        description: "Easy access window berth",
      },
      {
        id: "double-lower",
        label: "Double Lower Sleeper (Couple)",
        description: "Side-by-side berths for two",
      },
      {
        id: "upper-sleeper",
        label: "Upper Berth (Quiet & Private)",
        description: "Elevated peaceful sleeping berth",
      },
      {
        id: "front-seats",
        label: "Front Row Window Seat",
        description: "Scenic panoramic view with extra legroom",
      },
    ],
  },
};

// Fallback helper to resolve service type definitions flexibly
export function getServiceTypeDefinition(
  serviceSlugOrName?: string,
): ServiceTypeDefinition {
  if (!serviceSlugOrName) return DYNAMIC_SERVICE_TYPES["holiday-packages"];

  const clean = serviceSlugOrName.toLowerCase().trim();
  if (clean.includes("flight") || clean.includes("air"))
    return DYNAMIC_SERVICE_TYPES["flight-booking"];
  if (
    clean.includes("hotel") ||
    clean.includes("stay") ||
    clean.includes("resort")
  )
    return DYNAMIC_SERVICE_TYPES["hotel-booking"];
  if (clean.includes("visa") || clean.includes("passport"))
    return DYNAMIC_SERVICE_TYPES["visa-assistance"];
  if (clean.includes("train") || clean.includes("rail"))
    return DYNAMIC_SERVICE_TYPES["train-booking"];
  if (clean.includes("bus") || clean.includes("coach"))
    return DYNAMIC_SERVICE_TYPES["bus-booking"];
  if (
    clean.includes("umrah") ||
    clean.includes("hajj") ||
    clean.includes("pilgrim")
  )
    return DYNAMIC_SERVICE_TYPES["umrah-hajj"];

  return DYNAMIC_SERVICE_TYPES["holiday-packages"];
}

// =============================================================================
// 4. INTELLIGENT CONTEXT-AWARE SUGGESTIONS ENGINE
// =============================================================================

export interface SuggestionContext {
  tripMode: TripMode;
  origin?: string;
  destination?: string;
  travelDate?: string;
  adults?: number;
  children?: number;
  serviceSlug?: string;
  selectedPrimaryTypeId?: string;
  selectedSecondaryTypeId?: string;
}

/**
 * Produces personalized, context-aware suggestions taking into account destination,
 * party composition, service type, and trip mode.
 */
export function getContextAwareSuggestions(
  ctx: SuggestionContext,
): SuggestionItem[] {
  const suggestions: SuggestionItem[] = [];
  const destLower = (ctx.destination || "").toLowerCase();
  const serviceKey = (ctx.serviceSlug || "holiday-packages").toLowerCase();
  const totalTravellers = (ctx.adults || 1) + (ctx.children || 0);
  const isFamily = (ctx.children || 0) > 0 || totalTravellers >= 3;
  const isCouple = ctx.adults === 2 && (ctx.children || 0) === 0;
  const isSolo = totalTravellers === 1;

  // ---------------------------------------------------------------------------
  // A. FLIGHT SUGGESTIONS
  // ---------------------------------------------------------------------------
  if (serviceKey.includes("flight")) {
    if (ctx.tripMode === "international") {
      suggestions.push({
        id: "intl-extra-baggage",
        label: "2x23kg Check-in Baggage Included",
        description:
          "Optimal allowance for overseas holiday shopping and essentials",
        category: "comfort",
      });
      suggestions.push({
        id: "intl-lounge",
        label: "International Airport Lounge Access",
        description:
          "Complimentary gourmet dining and quiet rest before long-haul flights",
        category: "experience",
      });
    } else {
      suggestions.push({
        id: "dom-seat-legroom",
        label: "Front-Row / Emergency Exit Extra Legroom",
        description: "Pre-reserved prime seating with priority deboarding",
        category: "comfort",
      });
    }

    if (isFamily) {
      suggestions.push({
        id: "family-seating",
        label: "Adjacent Family Seating Guaranteed",
        description: "Seats together with kid-friendly meal pre-ordering",
        category: "family",
      });
    }

    if (ctx.selectedPrimaryTypeId === "round-trip") {
      suggestions.push({
        id: "flex-cancel",
        label: "Zero-Penalty Flight Date Change",
        description: "Reschedule freely up to 24 hours before departure",
        category: "savings",
      });
    }

    if (isCouple) {
      suggestions.push({
        id: "couple-window-aisle",
        label: "Window + Aisle Paired Seats",
        description: "Comfortable two-seat row preference",
        category: "comfort",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // B. HOTEL BOOKING SUGGESTIONS
  // ---------------------------------------------------------------------------
  else if (serviceKey.includes("hotel")) {
    if (destLower.includes("maldives") || destLower.includes("bali")) {
      suggestions.push({
        id: "hotel-villa",
        label: "Overwater / Private Pool Villa Upgrade",
        description: "Secluded sanctuary with direct lagoon or garden access",
        category: "experience",
      });
      suggestions.push({
        id: "hotel-halfboard",
        label: "Half-Board Dining (Breakfast & Dinner)",
        description: "Chef-curated daily multi-course meals included",
        category: "savings",
      });
    } else if (destLower.includes("swiss") || destLower.includes("alps")) {
      suggestions.push({
        id: "hotel-chalet",
        label: "Alpine Mountain-View Balcony Room",
        description: "Panoramic vistas of snow-capped alpine peaks",
        category: "experience",
      });
    } else if (destLower.includes("dubai")) {
      suggestions.push({
        id: "hotel-skyline",
        label: "High-Floor Burj / Marina View Suite",
        description: "Stunning floor-to-ceiling city skyline views",
        category: "experience",
      });
    } else if (destLower.includes("goa")) {
      suggestions.push({
        id: "hotel-goa-beach",
        label: "Direct Beachfront Access with Pool",
        description: "Steps from white sand and ocean breeze",
        category: "experience",
      });
    } else {
      suggestions.push({
        id: "hotel-breakfast",
        label: "Complimentary Buffet Breakfast & Early Check-in",
        description: "Guaranteed check-in flexibility upon arrival",
        category: "comfort",
      });
    }

    if (isFamily) {
      suggestions.push({
        id: "hotel-interconnecting",
        label: "Interconnecting Family Rooms",
        description:
          "Adjoining rooms with shared internal door for peace of mind",
        category: "family",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // C. VISA ASSISTANCE SUGGESTIONS (International only)
  // ---------------------------------------------------------------------------
  else if (serviceKey.includes("visa")) {
    if (destLower.includes("dubai") || destLower.includes("uae")) {
      suggestions.push({
        id: "visa-dubai-48h",
        label: "48-Hour UAE E-Visa Express Approval",
        description:
          "Fast-track digital issuance with comprehensive travel insurance",
        category: "speed",
      });
      suggestions.push({
        id: "visa-dubai-multiple",
        label: "60-Day Multiple Entry Visa",
        description: "Ideal for extended vacations and regional GCC day trips",
        category: "comfort",
      });
    } else if (
      destLower.includes("swiss") ||
      destLower.includes("europe") ||
      destLower.includes("paris") ||
      destLower.includes("rome") ||
      destLower.includes("schengen")
    ) {
      suggestions.push({
        id: "visa-schengen-slot",
        label: "VFS Schengen Biometrics Appointment Slot Assistance",
        description: "Earliest available embassy slot booking support",
        category: "speed",
      });
      suggestions.push({
        id: "visa-schengen-dossier",
        label: "Cover Letter & Itinerary Documentation Review",
        description:
          "Senior visa officer pre-scrutiny to ensure zero rejection risk",
        category: "experience",
      });
    } else if (destLower.includes("london") || destLower.includes("uk")) {
      suggestions.push({
        id: "visa-uk-priority",
        label: "UK Standard Visitor Visa Filing & Document Verification",
        description: "Complete financial statement audit and sponsor letters",
        category: "comfort",
      });
    } else if (destLower.includes("saudi") || destLower.includes("makkah")) {
      suggestions.push({
        id: "visa-saudi-evisa",
        label: "Instant Saudi Tourism / Umrah E-Visa with Medical Cover",
        description: "1-year multi-entry with 90 days stay per visit",
        category: "speed",
      });
    } else {
      suggestions.push({
        id: "visa-doorstep",
        label: "Doorstep Document Pick-Up & Visa Verification",
        description:
          "Full concierge review of passports, photos, and bank letters",
        category: "comfort",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // D. TRAIN BOOKING (Domestic only)
  // ---------------------------------------------------------------------------
  else if (serviceKey.includes("train")) {
    suggestions.push({
      id: "train-catering",
      label: "Onboard Meals & Catering Inclusion",
      description:
        "Pre-booked hygienic breakfast, lunch and dinner on express journeys",
      category: "comfort",
    });
    suggestions.push({
      id: "train-confirmed-berth",
      label: "Confirmed Lower / Middle Berth Preference",
      description: "Priority allocation for comfortable overnight sleep",
      category: "comfort",
    });
    suggestions.push({
      id: "train-tatkal",
      label: "Instant Tatkal Quota Booking Assistance",
      description: "Authorized fast booking for urgent short-notice travel",
      category: "speed",
    });
  }

  // ---------------------------------------------------------------------------
  // E. BUS BOOKING (Domestic only)
  // ---------------------------------------------------------------------------
  else if (serviceKey.includes("bus")) {
    suggestions.push({
      id: "bus-volvo-sleeper",
      label: "Multi-Axle Volvo AC Sleeper Lower Berth",
      description:
        "Maximum vibration absorption with USB ports and clean blankets",
      category: "comfort",
    });
    suggestions.push({
      id: "bus-city-pickup",
      label: "Direct City-Center Boarding Point",
      description: "Convenient pickup avoiding outer bypass traffic",
      category: "speed",
    });
  }

  // ---------------------------------------------------------------------------
  // F. UMRAH & HAJJ (Pilgrimage)
  // ---------------------------------------------------------------------------
  else if (serviceKey.includes("umrah") || serviceKey.includes("hajj")) {
    suggestions.push({
      id: "umrah-haram-frontage",
      label: "Direct Haram View (Zero Walking Distance)",
      description:
        "Steps away from the holy Kaaba courtyard for seamless prayer access",
      category: "experience",
    });
    suggestions.push({
      id: "umrah-private-gmc",
      label: "Private GMC Yukon / VIP Coach Transfers",
      description: "Airport to Makkah and Madinah with zero waiting",
      category: "comfort",
    });
    suggestions.push({
      id: "umrah-ziyarat",
      label: "Guided Historical Ziyarat Tour with Islamic Scholar",
      description:
        "Visits to Jabal al-Nour, Cave Hira, Mount Uhud, and Masjid Quba",
      category: "experience",
    });
  }

  // ---------------------------------------------------------------------------
  // G. HOLIDAY PACKAGES & SIGHTSEEING
  // ---------------------------------------------------------------------------
  else {
    if (destLower.includes("swiss") || destLower.includes("alps")) {
      suggestions.push({
        id: "exp-swiss-jungfrau",
        label: "Jungfraujoch 'Top of Europe' Cogwheel Pass",
        description:
          "Ascend to Europe's highest railway station with glacier ice palace",
        category: "experience",
      });
      suggestions.push({
        id: "exp-swiss-glacier",
        label: "Glacier Express Panoramic Train Journey",
        description:
          "World's slowest express train crossing 291 alpine bridges",
        category: "experience",
      });
    } else if (destLower.includes("bali")) {
      suggestions.push({
        id: "exp-bali-penida",
        label: "Nusa Penida Kelingking & Angel's Billabong Cruise",
        description: "Fast boat island excursion with private snorkeling",
        category: "experience",
      });
      suggestions.push({
        id: "exp-bali-rafting",
        label: "Ayung River White Water Rafting & Spa",
        description:
          "Thrilling rainforest canyon descent followed by Balinese massage",
        category: "adventure" as any,
      });
    } else if (destLower.includes("dubai")) {
      suggestions.push({
        id: "exp-dubai-safari",
        label: "VIP Desert Safari with Red Dune Bashing & BBQ",
        description:
          "Sunset photography, camel trekking and traditional Arabian performances",
        category: "experience",
      });
      suggestions.push({
        id: "exp-dubai-burj",
        label: "Burj Khalifa 124th + 125th Floor Fast-Track Pass",
        description:
          "Skip the ticket lines for panoramic sunset observatory access",
        category: "speed",
      });
    } else if (destLower.includes("kashmir")) {
      suggestions.push({
        id: "exp-kashmir-gondola",
        label: "Gulmarg Gondola Phase 1 & 2 Passes",
        description: "World's second-highest cable car up to Apharwat Peak",
        category: "experience",
      });
      suggestions.push({
        id: "exp-kashmir-shikara",
        label: "Sunset Dal Lake Shikara Cruise & Kashmiri Kahwa",
        description:
          "Relaxing private wooden boat ride through floating lotus gardens",
        category: "experience",
      });
    } else if (destLower.includes("goa")) {
      suggestions.push({
        id: "exp-goa-watersports",
        label: "Grand Island Scuba Diving & Dolphin Cruise",
        description:
          "Guided underwater reef exploration with video & equipment",
        category: "adventure" as any,
      });
    } else {
      suggestions.push({
        id: "exp-private-chauffeur",
        label: "Private Air-Conditioned Chauffeur Vehicle throughout",
        description: "Dedicated English-speaking driver for custom local stops",
        category: "comfort",
      });
      suggestions.push({
        id: "exp-curated-dining",
        label: "Handpicked Authentic Culinary Tasting Experiences",
        description:
          "Reservations at renowned local restaurants and hidden gems",
        category: "experience",
      });
    }

    if (isFamily) {
      suggestions.push({
        id: "exp-family-friendly",
        label: "Child-Friendly Itinerary with Minimal Transit Times",
        description:
          "Optimized travel durations, kid-friendly attractions & meal pauses",
        category: "family",
      });
    }
  }

  return suggestions;
}
