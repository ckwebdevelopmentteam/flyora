"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Tag,
  Calendar,
  User,
  MessageCircle,
  Send,
  Check,
  ChevronDown,
  Search,
  ArrowRight,
  ArrowLeftRight,
  CheckCircle2,
  Plane,
  Train,
  Bus,
  PlaneTakeoff,
  PlaneLanding,
  MapPin,
  Compass,
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
const FLIGHT_ORIGINS: OptionItem[] = [
  { label: "Mumbai (BOM)", sub: "Chhatrapati Shivaji Maharaj Intl" },
  { label: "New Delhi (DEL)", sub: "Indira Gandhi International" },
  { label: "Bengaluru (BLR)", sub: "Kempegowda International" },
  { label: "Hyderabad (HYD)", sub: "Rajiv Gandhi International" },
  { label: "Dubai (DXB)", sub: "Dubai International Airport" },
];

const FLIGHT_DESTINATIONS: OptionItem[] = [
  { label: "Dubai (DXB)", sub: "United Arab Emirates" },
  { label: "London (LHR)", sub: "Heathrow Airport, UK" },
  { label: "Singapore (SIN)", sub: "Changi International" },
  { label: "Jeddah (JED)", sub: "King Abdulaziz Intl, Saudi Arabia" },
  { label: "Bangkok (BKK)", sub: "Suvarnabhumi Airport, Thailand" },
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
const TRAIN_ORIGINS: OptionItem[] = [
  { label: "New Delhi (NDLS)", sub: "New Delhi Railway Station" },
  { label: "Mumbai Central (MMCT)", sub: "Mumbai Central Terminus" },
  { label: "Howrah Junction (HWH)", sub: "Kolkata Railway Station" },
  { label: "KSR Bengaluru (SBC)", sub: "Bengaluru City Junction" },
  { label: "Chennai Central (MAS)", sub: "Dr. MGR Central" },
];

const TRAIN_DESTINATIONS: OptionItem[] = [
  { label: "Mumbai Central (MMCT)", sub: "Mumbai Central Terminus" },
  { label: "Madgaon, Goa (MAO)", sub: "Konkan Railway Terminus" },
  { label: "Varanasi Junction (BSB)", sub: "Varanasi Cantt Station" },
  { label: "Jaipur Junction (JP)", sub: "Pink City Railway Station" },
  { label: "Agra Cantt (AGC)", sub: "Taj Express Route" },
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
const BUS_ORIGINS: OptionItem[] = [
  { label: "Bangalore", sub: "Majestic / Electronic City" },
  { label: "Mumbai", sub: "Borivali / Dadar / Vashi" },
  { label: "Pune", sub: "Swargate / Hinjawadi" },
  { label: "Hyderabad", sub: "Gachibowli / Ameerpet" },
  { label: "Delhi", sub: "Kashmiri Gate / Anand Vihar" },
];

const BUS_DESTINATIONS: OptionItem[] = [
  { label: "Goa", sub: "Panjim / Mapusa" },
  { label: "Manali", sub: "Mall Road Private Stand" },
  { label: "Shimla", sub: "Victory Tunnel Stand" },
  { label: "Ooty", sub: "Central Bus Stand" },
  { label: "Jaipur", sub: "Sindhi Camp Stand" },
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

const VISA_PASSPORTS: OptionItem[] = [
  { label: "Indian Passport" },
  { label: "US / UK / EU Passport" },
  { label: "GCC / Middle East Passport" },
  { label: "Other Nationality Passport" },
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

// 5. Hajj Packages
const HAJJ_TIERS: OptionItem[] = [
  {
    label: "Executive Non-Shifting (Mina A)",
    sub: "5-Star Makkah hotel & VIP Mina tents",
  },
  {
    label: "Deluxe Shifting (30 Days)",
    sub: "Full season with Azizia transit",
  },
  {
    label: "Express Hajj (14 Days)",
    sub: "Executive short duration pilgrimage",
  },
  {
    label: "VIP Private Pilgrimage",
    sub: "Dedicated scholar & private transport",
  },
];

const HAJJ_SEASONS: OptionItem[] = [
  { label: "May - June 2027", sub: "Upcoming Hajj pilgrimage season" },
  { label: "May - June 2028", sub: "Advance pilgrimage registration" },
  { label: "Flexible Schedule", sub: "Recommend best package tier" },
];

const HAJJ_PILGRIMS: OptionItem[] = [
  { label: "Couple (2 Adults)" },
  { label: "Solo Pilgrim (1 Person)" },
  { label: "Family (3–4 Pilgrims)" },
  { label: "Private Group (5+ Pilgrims)" },
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
  { label: "November 2026", sub: "Autumn getaways" },
  { label: "December 2026", sub: "Festive & new year" },
  { label: "Jan – Feb 2027", sub: "Winter escapes" },
  { label: "Flexible Dates", sub: "Year-round availability" },
];

const HOLIDAY_TRAVELERS: OptionItem[] = [
  { label: "Couple (2 Adults)" },
  { label: "Solo Traveler" },
  { label: "Family (3–4 Guests)" },
  { label: "Private Group (5+ Guests)" },
];

// ---------------------------------------------------------------------------
// MINIMAL REUSABLE SELECT FIELD (Apple / Linear / Airbnb quality)
// ---------------------------------------------------------------------------

interface SelectFieldProps {
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  options: OptionItem[];
  onSelect: (val: string) => void;
  className?: string;
  dropdownWidth?: string;
  headerRight?: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  isOpen,
  onToggle,
  options,
  onSelect,
  className = "",
  dropdownWidth = "w-full sm:w-[300px]",
  headerRight,
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider select-none">
          {label}
        </label>
        {headerRight}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full min-h-[50px] px-4 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer bg-neutral-50/60 hover:bg-neutral-50 ${
          isOpen
            ? "border-neutral-900 ring-1 ring-neutral-900/10 bg-white"
            : "border-neutral-200/90 hover:border-neutral-300"
        }`}
      >
        <span className="text-[14px] font-semibold text-neutral-900 truncate leading-tight">
          {value}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-neutral-800" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 top-[calc(100%+6px)] z-50 ${dropdownWidth} bg-white rounded-2xl p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-neutral-200/90 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[260px] overflow-y-auto no-scrollbar`}
        >
          {options.map((opt, idx) => {
            const isSelected = value === opt.label;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(opt.label)}
                className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-neutral-100 font-semibold"
                    : "hover:bg-neutral-50 font-normal"
                }`}
              >
                <div className="min-w-0 pr-1">
                  <div className="text-[13.5px] text-neutral-900 truncate">
                    {opt.label}
                  </div>
                  {opt.sub && (
                    <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {opt.sub}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
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
  const [fromLocation, setFromLocation] = useState<string>("Mumbai (BOM)");
  const [toLocation, setToLocation] = useState<string>("Dubai (DXB)");
  const [routeDate, setRouteDate] = useState<string>("15 Nov 2026");
  const [routeClassOrSeats, setRouteClassOrSeats] =
    useState<string>("1 Adult, Economy");

  // Visa states
  const [visaCountry, setVisaCountry] = useState<string>(
    "Schengen Europe (29 Countries)",
  );
  const [passportCountry, setPassportCountry] =
    useState<string>("Indian Passport");
  const [visaDate, setVisaDate] = useState<string>("Within 30 Days");
  const [visaApplicants, setVisaApplicants] = useState<string>(
    "Single Applicant (1 Person)",
  );

  // Package / Holiday states (Hajj, Custom Holidays)
  const [selectedPackage, setSelectedPackage] = useState<string>(
    "Executive Non-Shifting (Mina A)",
  );
  const [packageDate, setPackageDate] = useState<string>("May - June 2027");
  const [packageGuests, setPackageGuests] =
    useState<string>("Couple (2 Adults)");

  // Shared Contact Details
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // Popover / Dropdown Manager (only 1 open at a time)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsScrollRef = useRef<HTMLDivElement>(null);

  const activeService =
    SERVICES_DATA.find((s) => s.id === activeTab) || SERVICES_DATA[0];

  const handleCardClick = (serviceId: ServiceId) => {
    setActiveTab(serviceId);
    setOpenDropdown(null);
    setIsSubmitted(false);

    if (serviceId === "flight-booking") {
      setFromLocation("Mumbai (BOM)");
      setToLocation("Dubai (DXB)");
      setRouteDate("15 Nov 2026");
      setRouteClassOrSeats("1 Adult, Economy");
    } else if (serviceId === "train-booking") {
      setFromLocation("New Delhi (NDLS)");
      setToLocation("Mumbai Central (MMCT)");
      setRouteDate("18 Nov 2026");
      setRouteClassOrSeats("1st AC (1A) Confirmed");
    } else if (serviceId === "bus-booking") {
      setFromLocation("Bangalore");
      setToLocation("Goa");
      setRouteDate("Tonight / Tomorrow");
      setRouteClassOrSeats("2 Sleeper Berths (Volvo AC)");
    } else if (serviceId === "visa-assistance") {
      setVisaCountry("Schengen Europe (29 Countries)");
      setPassportCountry("Indian Passport");
      setVisaDate("Within 30 Days");
      setVisaApplicants("Single Applicant (1 Person)");
    } else if (serviceId === "hajj-packages") {
      setSelectedPackage("Executive Non-Shifting (Mina A)");
      setPackageDate("May - June 2027");
      setPackageGuests("Couple (2 Adults)");
    } else if (serviceId === "custom-holidays") {
      setSelectedPackage("Switzerland & The Alps");
      setPackageDate("December 2026");
      setPackageGuests("Couple (2 Adults)");
    }
  };

  const handleSwapLocations = (e: React.MouseEvent) => {
    e.stopPropagation();
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let enquirySummary = "";
    if (
      activeTab === "flight-booking" ||
      activeTab === "train-booking" ||
      activeTab === "bus-booking"
    ) {
      enquirySummary = `${activeService.label}: ${fromLocation} → ${toLocation} | Date: ${routeDate} | Passengers/Seats: ${routeClassOrSeats}`;
    } else if (activeTab === "visa-assistance") {
      enquirySummary = `Visa Assistance: ${visaCountry} (${passportCountry}) | Travel: ${visaDate} | Applicants: ${visaApplicants}`;
    } else {
      enquirySummary = `${activeService.label}: ${selectedPackage} | Timeline: ${packageDate} | Travelers: ${packageGuests}`;
    }

    if (customerName) enquirySummary += ` | Name: ${customerName}`;
    if (customerPhone) enquirySummary += ` | Phone: ${customerPhone}`;

    if (onOpenEnquiry) {
      onOpenEnquiry(enquirySummary);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 4500);
  };

  const getPhonePlaceholder = (id: ServiceId) => {
    switch (id) {
      case "flight-booking":
        return "WhatsApp Number for Fare Alerts";
      case "train-booking":
        return "WhatsApp Number for Seat Alerts";
      case "bus-booking":
        return "WhatsApp Number for Boarding Details";
      case "visa-assistance":
        return "WhatsApp Number for Document Checklist";
      case "hajj-packages":
        return "WhatsApp Number for Hajj Itinerary";
      case "custom-holidays":
      default:
        return "WhatsApp Number for Holiday Itinerary";
    }
  };

  const getCtaText = (id: ServiceId) => {
    switch (id) {
      case "flight-booking":
        return "Search Flights";
      case "train-booking":
        return "Check Train Seats";
      case "bus-booking":
        return "Search Buses";
      case "visa-assistance":
        return "Get Visa Checklist";
      case "hajj-packages":
        return "Get Hajj Quote";
      case "custom-holidays":
      default:
        return "Plan My Holiday";
    }
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
      <div className="relative mb-2.5 -mt-4 sm:-mt-5">
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
          MAIN CONCIERGE CARD (Minimal, refined & bespoke UI/UX):
          - Clear, understated typography.
          - Dropdowns open downward with smooth luxury elevation.
          - Zero emojis, zero marketing fluff, zero redundant micro-copy.
          ======================================================================= */}
      <div className="relative bg-white text-[#1E1A17] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-neutral-200/80 text-left transition-all duration-300">
        <form onSubmit={handleSubmit}>
          {/* ===================================================================
              CASE 1: FLIGHT BOOKING
              =================================================================== */}
          {activeTab === "flight-booking" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
              <SelectField
                label="Flying From"
                value={fromLocation}
                isOpen={openDropdown === "flight-from"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "flight-from" ? null : "flight-from",
                  )
                }
                options={FLIGHT_ORIGINS}
                onSelect={(val) => {
                  setFromLocation(val);
                  setOpenDropdown(null);
                }}
                headerRight={
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    title="Swap Locations"
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                }
              />
              <SelectField
                label="Flying To"
                value={toLocation}
                isOpen={openDropdown === "flight-to"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "flight-to" ? null : "flight-to",
                  )
                }
                options={FLIGHT_DESTINATIONS}
                onSelect={(val) => {
                  setToLocation(val);
                  setOpenDropdown(null);
                }}
              />
              <SelectField
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
              <SelectField
                label="Travelers & Class"
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
            </div>
          )}

          {/* ===================================================================
              CASE 2: TRAIN BOOKING
              =================================================================== */}
          {activeTab === "train-booking" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
              <SelectField
                label="From Station"
                value={fromLocation}
                isOpen={openDropdown === "train-from"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "train-from" ? null : "train-from",
                  )
                }
                options={TRAIN_ORIGINS}
                onSelect={(val) => {
                  setFromLocation(val);
                  setOpenDropdown(null);
                }}
                headerRight={
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    title="Swap Stations"
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                }
              />
              <SelectField
                label="To Station"
                value={toLocation}
                isOpen={openDropdown === "train-to"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "train-to" ? null : "train-to",
                  )
                }
                options={TRAIN_DESTINATIONS}
                onSelect={(val) => {
                  setToLocation(val);
                  setOpenDropdown(null);
                }}
              />
              <SelectField
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
              <SelectField
                label="Class"
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
            </div>
          )}

          {/* ===================================================================
              CASE 3: BUS BOOKING
              =================================================================== */}
          {activeTab === "bus-booking" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
              <SelectField
                label="From City"
                value={fromLocation}
                isOpen={openDropdown === "bus-from"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "bus-from" ? null : "bus-from",
                  )
                }
                options={BUS_ORIGINS}
                onSelect={(val) => {
                  setFromLocation(val);
                  setOpenDropdown(null);
                }}
                headerRight={
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    title="Swap Cities"
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                }
              />
              <SelectField
                label="To City"
                value={toLocation}
                isOpen={openDropdown === "bus-to"}
                onToggle={() =>
                  setOpenDropdown(openDropdown === "bus-to" ? null : "bus-to")
                }
                options={BUS_DESTINATIONS}
                onSelect={(val) => {
                  setToLocation(val);
                  setOpenDropdown(null);
                }}
              />
              <SelectField
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
              <SelectField
                label="Seat Type"
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
            </div>
          )}

          {/* ===================================================================
              CASE 4: VISA ASSISTANCE
              =================================================================== */}
          {activeTab === "visa-assistance" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
              <SelectField
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
              />
              <SelectField
                label="Passport"
                value={passportCountry}
                isOpen={openDropdown === "visa-passport"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "visa-passport" ? null : "visa-passport",
                  )
                }
                options={VISA_PASSPORTS}
                onSelect={(val) => {
                  setPassportCountry(val);
                  setOpenDropdown(null);
                }}
              />
              <SelectField
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
              <SelectField
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
            </div>
          )}

          {/* ===================================================================
              CASE 5: HAJJ PACKAGES
              =================================================================== */}
          {activeTab === "hajj-packages" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-stretch">
              <SelectField
                label="Package Tier"
                value={selectedPackage}
                isOpen={openDropdown === "hajj-tier"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "hajj-tier" ? null : "hajj-tier",
                  )
                }
                options={HAJJ_TIERS}
                onSelect={(val) => {
                  setSelectedPackage(val);
                  setOpenDropdown(null);
                }}
                dropdownWidth="w-full sm:w-[340px]"
              />
              <SelectField
                label="Season"
                value={packageDate}
                isOpen={openDropdown === "hajj-season"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "hajj-season" ? null : "hajj-season",
                  )
                }
                options={HAJJ_SEASONS}
                onSelect={(val) => {
                  setPackageDate(val);
                  setOpenDropdown(null);
                }}
              />
              <SelectField
                label="Pilgrims / Party"
                value={packageGuests}
                isOpen={openDropdown === "hajj-guests"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "hajj-guests" ? null : "hajj-guests",
                  )
                }
                options={HAJJ_PILGRIMS}
                onSelect={(val) => {
                  setPackageGuests(val);
                  setOpenDropdown(null);
                }}
              />
            </div>
          )}

          {/* ===================================================================
              CASE 6: CUSTOM HOLIDAYS
              =================================================================== */}
          {activeTab === "custom-holidays" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-stretch">
              <SelectField
                label="Destination"
                value={selectedPackage}
                isOpen={openDropdown === "holiday-dest"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "holiday-dest" ? null : "holiday-dest",
                  )
                }
                options={HOLIDAY_DESTINATIONS}
                onSelect={(val) => {
                  setSelectedPackage(val);
                  setOpenDropdown(null);
                }}
                dropdownWidth="w-full sm:w-[340px]"
              />
              <SelectField
                label="Travel Month"
                value={packageDate}
                isOpen={openDropdown === "holiday-month"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "holiday-month" ? null : "holiday-month",
                  )
                }
                options={HOLIDAY_MONTHS}
                onSelect={(val) => {
                  setPackageDate(val);
                  setOpenDropdown(null);
                }}
              />
              <SelectField
                label="Travelers"
                value={packageGuests}
                isOpen={openDropdown === "holiday-guests"}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === "holiday-guests" ? null : "holiday-guests",
                  )
                }
                options={HOLIDAY_TRAVELERS}
                onSelect={(val) => {
                  setPackageGuests(val);
                  setOpenDropdown(null);
                }}
              />
            </div>
          )}

          {/* ===================================================================
              UNIFIED CONTACT & ENQUIRY ACTION ROW
              =================================================================== */}
          <div className="border-t border-neutral-100 mt-5 pt-5 flex flex-col md:flex-row items-center gap-3">
            {/* Lead Booker Name */}
            <div className="w-full md:w-1/3">
              <input
                type="text"
                placeholder="Lead Booker Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full h-[52px] px-4 rounded-xl border border-neutral-200/90 bg-neutral-50/60 hover:bg-neutral-50 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
              />
            </div>

            {/* WhatsApp Phone Number */}
            <div className="w-full md:flex-1">
              <input
                type="tel"
                placeholder={getPhonePlaceholder(activeTab)}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full h-[52px] px-4 rounded-xl border border-neutral-200/90 bg-neutral-50/60 hover:bg-neutral-50 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
              />
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full md:w-auto h-[52px] px-8 rounded-xl bg-neutral-900 hover:bg-black active:bg-neutral-950 text-white font-medium text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow cursor-pointer whitespace-nowrap"
            >
              {isSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-200">Enquiry Received</span>
                </>
              ) : (
                <>
                  <span>{getCtaText(activeTab)}</span>
                  <ArrowRight className="w-4 h-4 text-white/70" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Micro-Trust Footnote */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 text-[11.5px] text-neutral-400 font-normal">
          <div className="flex items-center gap-3">
            <span>✓ 100% verified partner fares</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ Zero hidden fees</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ Dedicated travel advisor</span>
          </div>
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(
              `Hi Flyora Travels, I would like to enquire about ${activeService.label}.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
          >
            Direct WhatsApp chat →
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroSearchCard;
