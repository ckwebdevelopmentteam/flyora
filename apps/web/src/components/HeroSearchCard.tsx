"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CalendarDays,
  Users,
  Check,
  ChevronDown,
  ArrowRight,
  Plane,
  Train,
  Bus,
  PlaneTakeoff,
  MapPin,
  Compass,
  CheckCircle2,
} from "lucide-react";

// Pixel-perfect SVG icons matching the reference mockup
const MosqueIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3c-1.5 1.5-2 3-2 5h4c0-2-.5-3.5-2-5z" />
    <path d="M4 10h16v11H4z" />
    <path d="M9 21v-5a3 3 0 0 1 6 0v5" />
    <path d="M2 13h2v8H2z" />
    <path d="M20 13h2v8h-2z" />
  </svg>
);

const PassportIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <circle cx="12" cy="10" r="2.5" />
    <path d="M9 16h6" />
  </svg>
);

const VacationPlaneIcon = ({
  className = "w-4 h-4",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
  </svg>
);

export interface HeroSearchCardProps {
  onOpenEnquiry?: (serviceOrDest?: string) => void;
  onExploreJourneys?: () => void;
  className?: string;
}

export type ServiceId =
  | "hajj-packages"
  | "custom-holidays"
  | "visa-assistance"
  | "flight-booking"
  | "train-booking"
  | "bus-booking";

interface ServiceMetadata {
  id: ServiceId;
  label: string;
  subtitle: string;
  imageSrc: string;
  imagePosition?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SERVICES_DATA: ServiceMetadata[] = [
  {
    id: "hajj-packages",
    label: "Hajj Packages",
    subtitle: "Spiritual Journeys",
    imageSrc: "/services/umrah-packages.jpg",
    imagePosition: "object-[82%_45%]",
    icon: MosqueIcon,
  },
  {
    id: "custom-holidays",
    label: "Custom Holidays",
    subtitle: "International & Local",
    imageSrc: "/services/custom-holidays.jpg",
    imagePosition: "object-[72%_50%]",
    icon: VacationPlaneIcon,
  },
  {
    id: "visa-assistance",
    label: "Visa Assistance",
    subtitle: "Hassle-free Process",
    imageSrc: "/services/visa-assistance.jpg",
    imagePosition: "object-[30%_55%]",
    icon: PassportIcon,
  },
  {
    id: "flight-booking",
    label: "Flight Booking",
    subtitle: "Best Fares",
    imageSrc: "/services/flight-booking.jpg",
    imagePosition: "object-[65%_45%]",
    icon: Plane,
  },
  {
    id: "train-booking",
    label: "Train Booking",
    subtitle: "Easy & Fast",
    imageSrc: "/services/train-booking.jpg",
    imagePosition: "object-[70%_55%]",
    icon: Train,
  },
  {
    id: "bus-booking",
    label: "Bus Booking",
    subtitle: "Comfort Travel",
    imageSrc: "/services/bus-booking.jpg",
    imagePosition: "object-[24%_65%]",
    icon: Bus,
  },
];

// ---------------------------------------------------------------------------
// SERVICE-SPECIFIC OPTIONS (Minimalist, Curated & Clean)
// ---------------------------------------------------------------------------

interface OptionItem {
  label: string;
  sub?: string;
}

// 1. Flights
const POPULAR_FLIGHT_ROUTES: OptionItem[] = [
  { label: "Mumbai (BOM) → Dubai (DXB)", sub: "Non-stop daily flights" },
  { label: "New Delhi (DEL) → London (LHR)", sub: "Direct premium carrier" },
  { label: "Bengaluru (BLR) → Singapore (SIN)", sub: "Changi direct gateway" },
  { label: "Mumbai (BOM) → Jeddah (JED)", sub: "Hajj & Umrah connection" },
  { label: "New Delhi (DEL) → Bangkok (BKK)", sub: "Southeast Asia direct" },
];

const FLIGHT_DATES: OptionItem[] = [
  { label: "Tomorrow", sub: "Express departure" },
  { label: "This Weekend", sub: "Weekend getaway" },
  { label: "15 Nov 2026", sub: "Best fare available" },
  { label: "Next 30 Days", sub: "Advance booking" },
  { label: "Flexible Dates", sub: "Lowest fare calendar" },
];

const FLIGHT_CLASSES: OptionItem[] = [
  { label: "1 Adult, Economy" },
  { label: "2 Adults, Economy" },
  { label: "1 Adult, Business Class" },
  { label: "2 Adults, Business Class" },
  { label: "Family (2 Adults, 2 Children)" },
  { label: "Group (5+ Passengers)" },
];

// 2. Trains
const POPULAR_TRAIN_ROUTES: OptionItem[] = [
  {
    label: "New Delhi → Mumbai Central",
    sub: "Vande Bharat & Rajdhani Express",
  },
  {
    label: "Mumbai Central → Goa (Madgaon)",
    sub: "Tejas & Konkan Kanya Express",
  },
  { label: "New Delhi → Varanasi Cantt", sub: "Vande Bharat Superfast" },
  {
    label: "Bengaluru (SBC) → Chennai Central",
    sub: "Shatabdi & Vande Bharat",
  },
  { label: "New Delhi → Jaipur Junction", sub: "Ajmer Shatabdi Express" },
];

const TRAIN_DATES: OptionItem[] = [
  { label: "Tomorrow (Tatkal)", sub: "Immediate quota booking" },
  { label: "18 Nov 2026", sub: "General reservation" },
  { label: "This Weekend", sub: "Scenic route express" },
  { label: "Next 30 Days", sub: "Advance 120-day window" },
];

const TRAIN_CLASSES: OptionItem[] = [
  { label: "1st AC (1A) Confirmed" },
  { label: "2nd AC (2A)" },
  { label: "3rd AC (3A)" },
  { label: "Executive Chair Car (EC)" },
  { label: "Sleeper Class (SL)" },
];

// 3. Buses
const POPULAR_BUS_ROUTES: OptionItem[] = [
  {
    label: "Bangalore → Goa (Panjim)",
    sub: "Luxury Volvo Multi-Axle Sleeper",
  },
  { label: "Mumbai → Pune (Swargate)", sub: "Express AC Shivneri & Scania" },
  { label: "Delhi → Manali (Mall Road)", sub: "Volvo B11R Semi-Sleeper" },
  { label: "Hyderabad → Bangalore", sub: "Overnight Luxury AC Sleeper" },
  {
    label: "Delhi → Jaipur (Sindhi Camp)",
    sub: "Expressway AC Mercedes Benz",
  },
];

const BUS_DATES: OptionItem[] = [
  { label: "Tonight / Tomorrow", sub: "Instant boarding" },
  { label: "This Weekend", sub: "Friday roundtrip" },
  { label: "Next 7–10 Days", sub: "Advance sleeper" },
  { label: "Flexible Dates", sub: "Best seat availability" },
];

const BUS_SEATS: OptionItem[] = [
  { label: "2 Sleeper Berths (Volvo AC)" },
  { label: "1 Single Lower Sleeper" },
  { label: "2 Semi-Sleeper Seats" },
  { label: "Full Luxury Coach Charter (35+)" },
];

// 4. Visa Assistance
const VISA_COUNTRIES: OptionItem[] = [
  {
    label: "Schengen Europe (29 Countries)",
    sub: "Tourist & Business Multi-entry",
  },
  { label: "United Kingdom", sub: "Standard Visitor & Express" },
  { label: "United States (B1/B2)", sub: "Appointment prep & filing" },
  { label: "Dubai / UAE", sub: "30 & 60 Days E-Visa" },
  { label: "Saudi Arabia", sub: "Tourist & Umrah E-Visa" },
  { label: "Singapore", sub: "Fast Tourist E-Visa" },
];

const VISA_DATES: OptionItem[] = [
  { label: "Express (Within 14 Days)", sub: "Urgent slot assistance" },
  { label: "Within 30 Days", sub: "Standard embassy timeline" },
  { label: "Next 1–3 Months", sub: "Advance vacation planning" },
  { label: "Flexible Schedule", sub: "Document consultation first" },
];

const VISA_APPLICANTS: OptionItem[] = [
  { label: "Single Applicant (1 Person)" },
  { label: "Couple (2 Applicants)" },
  { label: "Family (3–4 Applicants)" },
  { label: "Corporate Group (5+ Applicants)" },
];

// 5. Hajj Packages - Exact match to user design mockup:
// "Travel Period: May – Jun 2027" | "Travellers: 2 Adults"
const HAJJ_SEASONS: OptionItem[] = [
  { label: "May – Jun 2027", sub: "Upcoming Hajj pilgrimage season" },
  { label: "May – Jun 2028", sub: "Advance pilgrimage registration" },
  { label: "Flexible Dates", sub: "Consult with pilgrimage curator" },
];

const HAJJ_PILGRIMS: OptionItem[] = [
  { label: "2 Adults", sub: "Couple / Dual pilgrims" },
  { label: "1 Adult", sub: "Solo pilgrim" },
  { label: "Family (3–4 Pilgrims)", sub: "Quad sharing accommodation" },
  { label: "Private Group (5+ Pilgrims)", sub: "Custom group arrangement" },
];

// 6. Custom Holidays
const HOLIDAY_DESTINATIONS: OptionItem[] = [
  { label: "Switzerland & The Alps", sub: "Scenic trains & luxury chalets" },
  { label: "Bali, Indonesia", sub: "Private pool villas & cultural retreat" },
  { label: "Dubai & Abu Dhabi", sub: "5-star luxury & desert experience" },
  { label: "Kyoto & Tokyo, Japan", sub: "Traditional ryokans & modern Tokyo" },
  { label: "Amalfi Coast, Italy", sub: "Cliffside suites & coastal drives" },
  { label: "Maldives Islands", sub: "Overwater bungalows & private reef" },
];

const HOLIDAY_MONTHS: OptionItem[] = [
  { label: "Nov – Dec 2026", sub: "Festive & new year getaways" },
  { label: "Jan – Feb 2027", sub: "Winter escapes & alpine snow" },
  { label: "March – April 2027", sub: "Spring blossoms & pleasant climate" },
  { label: "Flexible Dates", sub: "Year-round bespoke availability" },
];

const HOLIDAY_TRAVELERS: OptionItem[] = [
  { label: "2 Adults", sub: "Couple / Dual travelers" },
  { label: "Solo Traveler", sub: "Single luxury journey" },
  { label: "Family (3–4 Guests)", sub: "Private suite / villa" },
  { label: "Private Group (5+ Guests)", sub: "Bespoke chartered itinerary" },
];

// ---------------------------------------------------------------------------
// LUXURY ARTISAN FIELD (Matching Exact Reference Screenshot)
// ---------------------------------------------------------------------------

interface ConciergePillFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  options: OptionItem[];
  onSelect: (val: string) => void;
  dropdownWidth?: string;
}

const ConciergePillField: React.FC<ConciergePillFieldProps> = ({
  icon: IconComponent,
  label,
  value,
  isOpen,
  onToggle,
  options,
  onSelect,
  dropdownWidth = "w-72 sm:w-80",
}) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-3 sm:gap-3.5 group cursor-pointer text-left focus:outline-none transition-transform duration-150 active:scale-[0.99] py-1 select-none"
      >
        {/* Soft Circular Icon Container - Exact background from user mockup */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F4F1EA] group-hover:bg-[#EAE5DC] flex items-center justify-center shrink-0 transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          <IconComponent className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[#2C241E] stroke-[1.6]" />
        </div>

        {/* Text Block: Label on top, Value + Chevron below */}
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-[11.5px] sm:text-[12px] text-[#78716A] font-normal leading-tight mb-0.5 select-none truncate">
            {label}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[14.5px] sm:text-[15.5px] font-semibold text-[#1C1917] tracking-tight leading-tight group-hover:text-[#6e4f23] transition-colors truncate">
              {value}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#78716A] group-hover:text-[#1C1917] shrink-0 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[#6e4f23]" : ""
              }`}
            />
          </div>
        </div>
      </button>

      {/* Downward luxury dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 top-[calc(100%+12px)] z-50 ${dropdownWidth} bg-white rounded-2xl p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.16)] border border-neutral-200/90 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[280px] overflow-y-auto no-scrollbar`}
        >
          {options.map((opt, idx) => {
            const isSelected = value === opt.label;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(opt.label)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#F4F1EA] text-[#6e4f23] font-semibold"
                    : "hover:bg-neutral-50 text-neutral-800 font-normal"
                }`}
              >
                <div className="min-w-0 pr-1">
                  <div className="text-[13.5px] truncate">{opt.label}</div>
                  {opt.sub && (
                    <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {opt.sub}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#6e4f23] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const HeroSearchCard: React.FC<HeroSearchCardProps> = ({
  onOpenEnquiry,
  onExploreJourneys,
  className = "",
}) => {
  // Active Tab state (defaults to Hajj Packages)
  const [activeTab, setActiveTab] = useState<ServiceId>("hajj-packages");

  // Route-based states (Flights, Trains, Buses)
  const [flightRoute, setFlightRoute] = useState<string>(
    "Mumbai (BOM) → Dubai (DXB)",
  );
  const [trainRoute, setTrainRoute] = useState<string>(
    "New Delhi → Mumbai Central",
  );
  const [busRoute, setBusRoute] = useState<string>("Bangalore → Goa (Panjim)");
  const [routeDate, setRouteDate] = useState<string>("This Weekend");
  const [routeClassOrSeats, setRouteClassOrSeats] =
    useState<string>("1 Adult, Economy");

  // Visa states
  const [visaCountry, setVisaCountry] = useState<string>(
    "Schengen Europe (29 Countries)",
  );
  const [visaDate, setVisaDate] = useState<string>("Within 30 Days");
  const [visaApplicants, setVisaApplicants] = useState<string>(
    "Single Applicant (1 Person)",
  );

  // Custom Holidays states
  const [holidayDest, setHolidayDest] = useState<string>(
    "Switzerland & The Alps",
  );
  const [holidayMonth, setHolidayMonth] = useState<string>("Nov – Dec 2026");
  const [holidayTravelers, setHolidayTravelers] = useState<string>("2 Adults");

  // Hajj states - EXACT MATCH TO IMAGE:
  // "Travel Period": "May – Jun 2027" | "Travellers": "2 Adults"
  const [hajjSeason, setHajjSeason] = useState<string>("May – Jun 2027");
  const [hajjPilgrims, setHajjPilgrims] = useState<string>("2 Adults");

  // Popover / Dropdown Manager (only 1 open at a time)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsScrollRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (serviceId: ServiceId) => {
    setActiveTab(serviceId);
    setOpenDropdown(null);
    setIsSubmitted(false);

    if (serviceId === "flight-booking") {
      setFlightRoute("Mumbai (BOM) → Dubai (DXB)");
      setRouteDate("This Weekend");
      setRouteClassOrSeats("1 Adult, Economy");
    } else if (serviceId === "train-booking") {
      setTrainRoute("New Delhi → Mumbai Central");
      setRouteDate("18 Nov 2026");
      setRouteClassOrSeats("1st AC (1A) Confirmed");
    } else if (serviceId === "bus-booking") {
      setBusRoute("Bangalore → Goa (Panjim)");
      setRouteDate("Tonight / Tomorrow");
      setRouteClassOrSeats("2 Sleeper Berths (Volvo AC)");
    } else if (serviceId === "visa-assistance") {
      setVisaCountry("Schengen Europe (29 Countries)");
      setVisaDate("Within 30 Days");
      setVisaApplicants("Single Applicant (1 Person)");
    } else if (serviceId === "hajj-packages") {
      setHajjSeason("May – Jun 2027");
      setHajjPilgrims("2 Adults");
    } else if (serviceId === "custom-holidays") {
      setHolidayDest("Switzerland & The Alps");
      setHolidayMonth("Nov – Dec 2026");
      setHolidayTravelers("2 Adults");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRequestQuote = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    let enquirySummary = "";
    if (activeTab === "hajj-packages") {
      enquirySummary = `Hajj Packages | Travel Period: ${hajjSeason} | Travellers: ${hajjPilgrims}`;
    } else if (activeTab === "custom-holidays") {
      enquirySummary = `Custom Holidays to ${holidayDest} | Travel Period: ${holidayMonth} | Travellers: ${holidayTravelers}`;
    } else if (activeTab === "visa-assistance") {
      enquirySummary = `Visa Assistance: ${visaCountry} | Timeline: ${visaDate} | Applicants: ${visaApplicants}`;
    } else if (activeTab === "flight-booking") {
      enquirySummary = `Flight Booking: ${flightRoute} | Departure: ${routeDate} | Passengers: ${routeClassOrSeats}`;
    } else if (activeTab === "train-booking") {
      enquirySummary = `Train Booking: ${trainRoute} | Date: ${routeDate} | Class: ${routeClassOrSeats}`;
    } else if (activeTab === "bus-booking") {
      enquirySummary = `Bus Booking: ${busRoute} | Date: ${routeDate} | Seats: ${routeClassOrSeats}`;
    }

    if (onOpenEnquiry) {
      onOpenEnquiry(enquirySummary);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 4500);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[1360px] mx-auto select-none ${className}`}
    >
      {/* =======================================================================
          TOP SERVICE CARDS:
          - Absolutely ZERO fixed aura / ring / glow on the first card at rest.
          - ALL cards share the exact identical neutral border (border-white/20).
          - Glowing white aura ONLY forms when hovering any card.
          - Full text is displayed with zero truncation.
          - Sized luxuriously to arrange along the exact same length as the navbar.
          ======================================================================= */}
      <div className="relative mb-3.5 -mt-4 sm:-mt-5">
        <div
          ref={cardsScrollRef}
          className="flex md:grid md:grid-cols-6 items-stretch gap-2.5 sm:gap-3 lg:gap-3.5 overflow-x-auto md:overflow-visible no-scrollbar scroll-smooth px-1 md:px-0 pt-7 pb-5"
        >
          {SERVICES_DATA.map((service) => {
            const IconComponent = service.icon;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleCardClick(service.id)}
                aria-pressed={activeTab === service.id}
                aria-label={`Select ${service.label}`}
                className="group relative shrink-0 w-[190px] sm:w-[210px] md:w-auto min-h-[165px] sm:min-h-[180px] md:h-[200px] lg:h-[210px] rounded-[22px] sm:rounded-[26px] transition-all duration-300 ease-out cursor-pointer text-left select-none p-4 sm:p-5 flex flex-col justify-between bg-neutral-950 hover:-translate-y-2 hover:scale-[1.02] hover:z-30"
              >
                {/* Inner clipped canvas for crisp photo & contrast scrims */}
                <div className="absolute inset-0 rounded-[22px] sm:rounded-[26px] overflow-hidden pointer-events-none">
                  {/* Full-bleed crisp background photo with optimal framing */}
                  <img
                    src={service.imageSrc}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover ${service.imagePosition || "object-center"} scale-[1.05] sm:scale-[1.08] transition-transform duration-500 ease-out group-hover:scale-[1.14]`}
                  />

                  {/* Contrast Scrims: softened so photo colors and subject content are vivid & clearly visible */}
                  <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/50 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                </div>

                {/* Outer pristine border and hover white glowing aura on z-20 (never clipped) */}
                <div className="absolute inset-0 rounded-[22px] sm:rounded-[26px] border border-white/20 transition-all duration-300 pointer-events-none z-20 group-hover:border-white group-hover:ring-2 group-hover:ring-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.65)]" />

                {/* Top Row: Crisp Vector Icon */}
                <div className="relative z-30 flex items-center justify-start w-full">
                  <div className="text-white drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.95)] transition-transform duration-200 group-hover:scale-110">
                    <IconComponent className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px]" />
                  </div>
                </div>

                {/* Bottom Row: 100% Full Width Typography - No Truncation */}
                <div className="relative z-30 w-full mt-auto">
                  <div className="text-[14px] sm:text-[15px] md:text-[16px] font-bold text-white leading-tight drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.95)] whitespace-normal break-words">
                    {service.label}
                  </div>
                  <div className="text-[11.5px] sm:text-[12px] md:text-[12.5px] font-medium text-white/95 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] whitespace-normal break-words mt-1.5">
                    {service.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =======================================================================
          2. MAIN ADAPTIVE SEARCH BAR - EXACT MATCH TO REFERENCE DESIGN:
          - Ultra-clean rounded luxury pill card with warm cream `#FAF8F5` surface.
          - Soft circular icon badges `#F4F1EA`.
          - Downward dropdowns with artisan typography.
          - Rich warm cognac / walnut brown `#6e4f23` "Request a Quote ->" pill button.
          ======================================================================= */}
      <div className="relative w-full bg-[#FAF8F5] text-[#1E1A17] rounded-[24px] sm:rounded-[28px] p-3 sm:px-8 sm:py-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-stone-200/60 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Active Service Fields Group */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 divide-y sm:divide-y-0 divide-[#E5E0D5]/50">
            {/* CASE 1: HAJJ PACKAGES (Exact match to reference design mockup) */}
            {activeTab === "hajj-packages" && (
              <>
                <ConciergePillField
                  icon={CalendarDays}
                  label="Travel Period"
                  value={hajjSeason}
                  isOpen={openDropdown === "hajj-season"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "hajj-season" ? null : "hajj-season",
                    )
                  }
                  options={HAJJ_SEASONS}
                  onSelect={(val) => {
                    setHajjSeason(val);
                    setOpenDropdown(null);
                  }}
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={Users}
                  label="Travellers"
                  value={hajjPilgrims}
                  isOpen={openDropdown === "hajj-pilgrims"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "hajj-pilgrims" ? null : "hajj-pilgrims",
                    )
                  }
                  options={HAJJ_PILGRIMS}
                  onSelect={(val) => {
                    setHajjPilgrims(val);
                    setOpenDropdown(null);
                  }}
                />
              </>
            )}

            {/* CASE 2: CUSTOM HOLIDAYS */}
            {activeTab === "custom-holidays" && (
              <>
                <ConciergePillField
                  icon={Compass}
                  label="Destination"
                  value={holidayDest}
                  isOpen={openDropdown === "holiday-dest"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "holiday-dest" ? null : "holiday-dest",
                    )
                  }
                  options={HOLIDAY_DESTINATIONS}
                  onSelect={(val) => {
                    setHolidayDest(val);
                    setOpenDropdown(null);
                  }}
                  dropdownWidth="w-72 sm:w-80"
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={CalendarDays}
                  label="Travel Period"
                  value={holidayMonth}
                  isOpen={openDropdown === "holiday-month"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "holiday-month" ? null : "holiday-month",
                    )
                  }
                  options={HOLIDAY_MONTHS}
                  onSelect={(val) => {
                    setHolidayMonth(val);
                    setOpenDropdown(null);
                  }}
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={Users}
                  label="Travellers"
                  value={holidayTravelers}
                  isOpen={openDropdown === "holiday-travelers"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "holiday-travelers"
                        ? null
                        : "holiday-travelers",
                    )
                  }
                  options={HOLIDAY_TRAVELERS}
                  onSelect={(val) => {
                    setHolidayTravelers(val);
                    setOpenDropdown(null);
                  }}
                />
              </>
            )}

            {/* CASE 3: VISA ASSISTANCE */}
            {activeTab === "visa-assistance" && (
              <>
                <ConciergePillField
                  icon={PassportIcon}
                  label="Destination Country"
                  value={visaCountry}
                  isOpen={openDropdown === "visa-country"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "visa-country" ? null : "visa-country",
                    )
                  }
                  options={VISA_COUNTRIES}
                  onSelect={(val) => {
                    setVisaCountry(val);
                    setOpenDropdown(null);
                  }}
                  dropdownWidth="w-72 sm:w-80"
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={CalendarDays}
                  label="Travel Timeline"
                  value={visaDate}
                  isOpen={openDropdown === "visa-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "visa-date" ? null : "visa-date",
                    )
                  }
                  options={VISA_DATES}
                  onSelect={(val) => {
                    setVisaDate(val);
                    setOpenDropdown(null);
                  }}
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={Users}
                  label="Applicants"
                  value={visaApplicants}
                  isOpen={openDropdown === "visa-applicants"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "visa-applicants"
                        ? null
                        : "visa-applicants",
                    )
                  }
                  options={VISA_APPLICANTS}
                  onSelect={(val) => {
                    setVisaApplicants(val);
                    setOpenDropdown(null);
                  }}
                />
              </>
            )}

            {/* CASE 4: FLIGHT BOOKING */}
            {activeTab === "flight-booking" && (
              <>
                <ConciergePillField
                  icon={PlaneTakeoff}
                  label="Flight Route"
                  value={flightRoute}
                  isOpen={openDropdown === "flight-route"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "flight-route" ? null : "flight-route",
                    )
                  }
                  options={POPULAR_FLIGHT_ROUTES}
                  onSelect={(val) => {
                    setFlightRoute(val);
                    setOpenDropdown(null);
                  }}
                  dropdownWidth="w-72 sm:w-88"
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={CalendarDays}
                  label="Departure Date"
                  value={routeDate}
                  isOpen={openDropdown === "flight-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "flight-date" ? null : "flight-date",
                    )
                  }
                  options={FLIGHT_DATES}
                  onSelect={(val) => {
                    setRouteDate(val);
                    setOpenDropdown(null);
                  }}
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={Users}
                  label="Passengers & Class"
                  value={routeClassOrSeats}
                  isOpen={openDropdown === "flight-class"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "flight-class" ? null : "flight-class",
                    )
                  }
                  options={FLIGHT_CLASSES}
                  onSelect={(val) => {
                    setRouteClassOrSeats(val);
                    setOpenDropdown(null);
                  }}
                />
              </>
            )}

            {/* CASE 5: TRAIN BOOKING */}
            {activeTab === "train-booking" && (
              <>
                <ConciergePillField
                  icon={Train}
                  label="Train Route"
                  value={trainRoute}
                  isOpen={openDropdown === "train-route"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "train-route" ? null : "train-route",
                    )
                  }
                  options={POPULAR_TRAIN_ROUTES}
                  onSelect={(val) => {
                    setTrainRoute(val);
                    setOpenDropdown(null);
                  }}
                  dropdownWidth="w-72 sm:w-88"
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={CalendarDays}
                  label="Travel Date"
                  value={routeDate}
                  isOpen={openDropdown === "train-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "train-date" ? null : "train-date",
                    )
                  }
                  options={TRAIN_DATES}
                  onSelect={(val) => {
                    setRouteDate(val);
                    setOpenDropdown(null);
                  }}
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={Users}
                  label="Travel Class"
                  value={routeClassOrSeats}
                  isOpen={openDropdown === "train-class"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "train-class" ? null : "train-class",
                    )
                  }
                  options={TRAIN_CLASSES}
                  onSelect={(val) => {
                    setRouteClassOrSeats(val);
                    setOpenDropdown(null);
                  }}
                />
              </>
            )}

            {/* CASE 6: BUS BOOKING */}
            {activeTab === "bus-booking" && (
              <>
                <ConciergePillField
                  icon={Bus}
                  label="Bus Route"
                  value={busRoute}
                  isOpen={openDropdown === "bus-route"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "bus-route" ? null : "bus-route",
                    )
                  }
                  options={POPULAR_BUS_ROUTES}
                  onSelect={(val) => {
                    setBusRoute(val);
                    setOpenDropdown(null);
                  }}
                  dropdownWidth="w-72 sm:w-88"
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={CalendarDays}
                  label="Travel Date"
                  value={routeDate}
                  isOpen={openDropdown === "bus-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "bus-date" ? null : "bus-date",
                    )
                  }
                  options={BUS_DATES}
                  onSelect={(val) => {
                    setRouteDate(val);
                    setOpenDropdown(null);
                  }}
                />
                <div className="h-9 w-px bg-[#E5E0D5] mx-4 sm:mx-6 lg:mx-8 shrink-0 hidden sm:block" />
                <ConciergePillField
                  icon={Users}
                  label="Seat Preference"
                  value={routeClassOrSeats}
                  isOpen={openDropdown === "bus-seats"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "bus-seats" ? null : "bus-seats",
                    )
                  }
                  options={BUS_SEATS}
                  onSelect={(val) => {
                    setRouteClassOrSeats(val);
                    setOpenDropdown(null);
                  }}
                />
              </>
            )}
          </div>

          {/* Luxury Rounded-Full Action Button ("Request a Quote ->") */}
          <button
            type="button"
            onClick={handleRequestQuote}
            className="w-full sm:w-auto h-[48px] sm:h-[52px] px-7 sm:px-8 rounded-full bg-[#6e4f23] hover:bg-[#5b401c] active:bg-[#4d3617] text-white font-medium text-[14.5px] sm:text-[15px] flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(110,79,35,0.28)] hover:shadow-[0_6px_22px_rgba(110,79,35,0.4)] cursor-pointer whitespace-nowrap shrink-0 sm:ml-auto select-none"
          >
            {isSubmitted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Quote Requested</span>
              </>
            ) : (
              <>
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4 text-white shrink-0" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSearchCard;
