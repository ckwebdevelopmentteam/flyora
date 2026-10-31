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
// SERVICE-SPECIFIC DATA & PRESETS
// ---------------------------------------------------------------------------

// 1. Flights
const FLIGHT_ORIGINS = [
  {
    code: "BOM",
    name: "Mumbai (BOM)",
    city: "Mumbai, India",
    airport: "Chhatrapati Shivaji Maharaj Intl",
  },
  {
    code: "DEL",
    name: "New Delhi (DEL)",
    city: "Delhi, India",
    airport: "Indira Gandhi International",
  },
  {
    code: "BLR",
    name: "Bengaluru (BLR)",
    city: "Bangalore, India",
    airport: "Kempegowda International",
  },
  {
    code: "HYD",
    name: "Hyderabad (HYD)",
    city: "Hyderabad, India",
    airport: "Rajiv Gandhi International",
  },
  {
    code: "DXB",
    name: "Dubai (DXB)",
    city: "Dubai, UAE",
    airport: "Dubai International Airport",
  },
];

const FLIGHT_DESTINATIONS = [
  {
    code: "DXB",
    name: "Dubai (DXB)",
    city: "Dubai, UAE",
    airport: "Dubai International Airport",
  },
  {
    code: "LHR",
    name: "London (LHR)",
    city: "London, UK",
    airport: "Heathrow Airport",
  },
  {
    code: "SIN",
    name: "Singapore (SIN)",
    city: "Singapore",
    airport: "Changi International Airport",
  },
  {
    code: "JED",
    name: "Jeddah (JED)",
    city: "Jeddah, Saudi Arabia",
    airport: "King Abdulaziz International",
  },
  {
    code: "BKK",
    name: "Bangkok (BKK)",
    city: "Bangkok, Thailand",
    airport: "Suvarnabhumi Airport",
  },
];

const FLIGHT_DATES = [
  { label: "Tomorrow", subtitle: "Express departure", value: "Tomorrow" },
  { label: "This Weekend", subtitle: "Weekend getaway", value: "This Weekend" },
  {
    label: "15 Nov 2026",
    subtitle: "Lowest fare calendar",
    value: "15 Nov 2026",
  },
  {
    label: "Next 30 Days",
    subtitle: "Advance business booking",
    value: "Next 30 Days",
  },
  {
    label: "Flexible Dates",
    subtitle: "Best price across month",
    value: "Flexible Dates",
  },
];

const FLIGHT_CLASSES = [
  "1 Adult, Economy",
  "2 Adults, Economy",
  "1 Adult, Business Class",
  "2 Adults, Business Class",
  "Family (2 Adults, 2 Kids)",
  "Group (5+ Passengers)",
];

// 2. Trains
const TRAIN_ORIGINS = [
  {
    code: "NDLS",
    name: "New Delhi (NDLS)",
    station: "New Delhi Railway Station",
  },
  {
    code: "MMCT",
    name: "Mumbai Central (MMCT)",
    station: "Mumbai Central Terminus",
  },
  {
    code: "HWH",
    name: "Howrah Junction (HWH)",
    station: "Howrah Railway Station",
  },
  {
    code: "SBC",
    name: "KSR Bengaluru (SBC)",
    station: "Bengaluru City Junction",
  },
  {
    code: "MAS",
    name: "Chennai Central (MAS)",
    station: "Puratchi Thalaivar Dr. MGR Central",
  },
];

const TRAIN_DESTINATIONS = [
  {
    code: "MMCT",
    name: "Mumbai Central (MMCT)",
    station: "Mumbai Central Terminus",
  },
  {
    code: "MAO",
    name: "Madgaon (MAO)",
    station: "Goa Konkan Railway Terminus",
  },
  {
    code: "BSB",
    name: "Varanasi Junction (BSB)",
    station: "Varanasi Cantt Station",
  },
  {
    code: "JP",
    name: "Jaipur Junction (JP)",
    station: "Pink City Railway Station",
  },
  {
    code: "AGC",
    name: "Agra Cantt (AGC)",
    station: "Agra Cantt Railway Station",
  },
];

const TRAIN_DATES = [
  {
    label: "Tomorrow (Tatkal Quota)",
    subtitle: "Immediate confirmed berths",
    value: "Tomorrow (Tatkal)",
  },
  {
    label: "18 Nov 2026",
    subtitle: "General reservation confirmed",
    value: "18 Nov 2026",
  },
  {
    label: "Next Weekend",
    subtitle: "Scenic Vande Bharat route",
    value: "Next Weekend",
  },
  {
    label: "Next 30 Days",
    subtitle: "Advance 120-day booking",
    value: "Next 30 Days",
  },
];

const TRAIN_CLASSES = [
  "1st AC (1A) Confirmed",
  "2nd AC (2A)",
  "3rd AC (3A)",
  "Executive Chair Car (EC)",
  "Sleeper Class (SL)",
];

// 3. Buses
const BUS_ORIGINS = [
  { name: "Bangalore", area: "Majestic / Silk Board / Electronic City" },
  { name: "Mumbai", area: "Borivali / Dadar / Vashi / Chembur" },
  { name: "Pune", area: "Swargate / Wakad / Hinjawadi" },
  { name: "Hyderabad", area: "Ameerpet / Gachibowli / LB Nagar" },
  { name: "Delhi", area: "Kashmiri Gate / Anand Vihar" },
];

const BUS_DESTINATIONS = [
  { name: "Goa", area: "Panjim / Mapusa / Calangute" },
  { name: "Manali", area: "Mall Road Private Bus Stand" },
  { name: "Shimla", area: "Old ISBT / Victory Tunnel" },
  { name: "Ooty", area: "Central Bus Stand" },
  { name: "Jaipur", area: "Sindhi Camp / Narayan Singh Circle" },
];

const BUS_DATES = [
  {
    label: "Tonight / Tomorrow",
    subtitle: "Instant seat boarding pass",
    value: "Tonight / Tomorrow",
  },
  {
    label: "This Weekend",
    subtitle: "Friday evening roundtrip",
    value: "This Weekend",
  },
  {
    label: "Next 7 – 10 Days",
    subtitle: "Advance sleeper reservation",
    value: "Next 7-10 Days",
  },
  {
    label: "Private Charter Dates",
    subtitle: "Custom group pickup schedule",
    value: "Charter Dates",
  },
];

const BUS_SEATS = [
  "2 Sleeper Berths (Volvo AC)",
  "1 Single Lower Sleeper",
  "2 Semi-Sleeper Seats",
  "Full Luxury Coach Charter (35+)",
];

// 4. Visa Assistance
const VISA_COUNTRIES = [
  {
    name: "Schengen Europe (29 Countries)",
    subtitle: "Tourist & Business Multi-entry",
    flag: "🇪🇺",
  },
  {
    name: "United Kingdom Visa",
    subtitle: "Standard Visitor & Express Processing",
    flag: "🇬🇧",
  },
  {
    name: "United States (B1/B2 Visa)",
    subtitle: "Interview Slot Prep & DS-160",
    flag: "🇺🇸",
  },
  {
    name: "Dubai / UAE Express Visa",
    subtitle: "30 & 60 Days E-Visa (24-48 hrs)",
    flag: "🇦🇪",
  },
  {
    name: "Saudi Arabia Tourist / Umrah",
    subtitle: "Instant E-Visa Processing",
    flag: "🇸🇦",
  },
  { name: "Singapore Tourist Visa", subtitle: "Fast 3-Day E-Visa", flag: "🇸🇬" },
];

const VISA_PASSPORTS = [
  "Indian Passport",
  "US / UK / EU Passport",
  "GCC / Middle East Passport",
  "Other Nationality Passport",
];

const VISA_DATES = [
  {
    label: "Express / Urgent (7–14 Days)",
    subtitle: "Immediate biometric slot prep",
    value: "Express (7-14 Days)",
  },
  {
    label: "Within 30 Days",
    subtitle: "Standard embassy timeline",
    value: "Within 30 Days",
  },
  {
    label: "Next 1 – 3 Months",
    subtitle: "Advance planned vacation",
    value: "Next 1-3 Months",
  },
  {
    label: "Flexible / Exploring",
    subtitle: "Document consultation first",
    value: "Flexible Timeline",
  },
];

const VISA_APPLICANTS = [
  "Single Applicant (1 Person)",
  "Couple (2 Applicants)",
  "Family (3 – 4 Applicants)",
  "Corporate Group (5+ Applicants)",
];

// 5. Hajj Packages
const HAJJ_TIERS = [
  {
    name: "Executive Non-Shifting (Mina A)",
    subtitle: "VIP air-conditioned tents & 5★ Makkah hotel",
    flag: "🕋",
  },
  {
    name: "Deluxe Shifting Full Season (30 Days)",
    subtitle: "Azizia transit + 5★ Haram frontage",
    flag: "✨",
  },
  {
    name: "Short Duration Express Hajj (14 Days)",
    subtitle: "Tailored for working executives & couples",
    flag: "⏱️",
  },
  {
    name: "VIP Private Tent & Haramain Rail",
    subtitle: "Dedicated Islamic scholar & private transport",
    flag: "🕊️",
  },
];

const HAJJ_SEASONS = [
  {
    label: "May - June 2027",
    subtitle: "Hajj Pilgrimage Season",
    value: "May - June 2027",
  },
  {
    label: "May - June 2028",
    subtitle: "Advance Pilgrimage Registration",
    value: "May - June 2028",
  },
  {
    label: "Flexible Schedule",
    subtitle: "Recommend best package tier",
    value: "Flexible Schedule",
  },
];

const HAJJ_PILGRIMS = [
  "Couple (2 Adults)",
  "Solo Pilgrim (1 Male / Female)",
  "Family (3 – 4 Pilgrims)",
  "Large Group (5+ Pilgrims)",
];

// 6. Custom Holidays
const HOLIDAY_DESTINATIONS = [
  {
    name: "Switzerland & The Alps",
    subtitle: "Scenic Trains & Luxury Chalets",
    flag: "🇨🇭",
  },
  {
    name: "Bali, Indonesia",
    subtitle: "Private Pool Villas & Culture",
    flag: "🇮🇩",
  },
  {
    name: "Dubai & Abu Dhabi, UAE",
    subtitle: "Desert Glamping & Burj Khalifa",
    flag: "🇦🇪",
  },
  {
    name: "Kyoto & Tokyo, Japan",
    subtitle: "Cherry Blossoms & Ryokans",
    flag: "🇯🇵",
  },
  {
    name: "Rome & Amalfi Coast, Italy",
    subtitle: "Historic Luxury & Coastal Drives",
    flag: "🇮🇹",
  },
  {
    name: "Maldives Islands",
    subtitle: "Overwater Bungalows & Reefs",
    flag: "🇲🇻",
  },
];

const HOLIDAY_MONTHS = [
  {
    label: "November 2026",
    subtitle: "Autumn & Pre-Winter Getaways",
    value: "November 2026",
  },
  {
    label: "December 2026",
    subtitle: "Winter Break & New Year Celebrations",
    value: "December 2026",
  },
  {
    label: "Jan - Feb 2027",
    subtitle: "Fresh Start Journeys",
    value: "Jan - Feb 2027",
  },
  {
    label: "Spring 2027",
    subtitle: "Cherry Blossoms & Mild Weather",
    value: "Spring 2027",
  },
  {
    label: "Flexible Dates",
    subtitle: "Open to recommendations",
    value: "Flexible Dates",
  },
];

const HOLIDAY_TRAVELERS = [
  "Couple (2 Adults)",
  "Solo Traveler (1 Adult)",
  "Family (2 Adults, 2 Kids)",
  "Small Group (3 – 5 Adults)",
  "Large Group (6+ Travelers)",
];

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
  const [searchFilter, setSearchFilter] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsScrollRef = useRef<HTMLDivElement>(null);

  const activeService =
    SERVICES_DATA.find((s) => s.id === activeTab) || SERVICES_DATA[0];

  // Update fields dynamically and appropriately when clicking any service card
  const handleCardClick = (serviceId: ServiceId) => {
    setActiveTab(serviceId);
    setOpenDropdown(null);
    setSearchFilter("");
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

  // Swap From & To for route-based services
  const handleSwapLocations = (e: React.MouseEvent) => {
    e.stopPropagation();
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  // Close dropdown on outside click
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

  // Form Submission
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
          MAIN WHITE CONCIERGE CARD:
          - Dynamically transforms the input fields to be 100% RELATED to the
            selected service (Flights: From/To/Date/Class; Trains: From/To/Date/Berth;
            Buses: From/To/Date/Seats; Visa: Country/Passport/Date/Applicants;
            Hajj: Tier/Season/Pilgrims; Holidays: Destination/Month/Travelers).
          ======================================================================= */}
      <div className="relative bg-white text-[#1E1A17] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 md:p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#EAE3D9] text-left transition-all duration-300">
        <form onSubmit={handleSubmit}>
          {/* ===================================================================
              CASE 1: FLIGHT BOOKING INPUT BOXES
              =================================================================== */}
          {activeTab === "flight-booking" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
              {/* FROM AIRPORT */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <PlaneTakeoff className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Flying From</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "flight-from" ? null : "flight-from",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "flight-from"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {fromLocation}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Origin Airport
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "flight-from" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "flight-from" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[320px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Departure City
                    </div>
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                      {FLIGHT_ORIGINS.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setFromLocation(item.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                            fromLocation === item.name ? "bg-[#FAF7F2]" : ""
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.name}
                            </div>
                            <div className="text-[10.5px] text-[#7A7167]">
                              {item.airport}
                            </div>
                          </div>
                          {fromLocation === item.name && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TO AIRPORT */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5">
                    <PlaneLanding className="w-3.5 h-3.5 text-[#7A7167]" />
                    <span>Flying To</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    title="Swap Origin and Destination"
                    className="p-0.5 text-[#7A7167] hover:text-[#1E1A17] transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "flight-to" ? null : "flight-to",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "flight-to"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {toLocation}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Destination Airport
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "flight-to" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "flight-to" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[320px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Destination Airport
                    </div>
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                      {FLIGHT_DESTINATIONS.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setToLocation(item.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                            toLocation === item.name ? "bg-[#FAF7F2]" : ""
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.name}
                            </div>
                            <div className="text-[10.5px] text-[#7A7167]">
                              {item.airport}
                            </div>
                          </div>
                          {toLocation === item.name && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* DEPARTURE DATE */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Departure Date</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "flight-date" ? null : "flight-date",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "flight-date"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {routeDate}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Direct / Best Fares
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-[#7A7167] shrink-0" />
                </button>

                {openDropdown === "flight-date" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[280px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Choose Departure Timeline
                    </div>
                    <div className="space-y-1">
                      {FLIGHT_DATES.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setRouteDate(item.value);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-[#7A7167]">
                              {item.subtitle}
                            </div>
                          </div>
                          {routeDate === item.value && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PASSENGERS & CLASS */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Passengers & Class</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "flight-class" ? null : "flight-class",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "flight-class"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {routeClassOrSeats}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Cabin & Guests
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "flight-class" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "flight-class" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[260px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Class & Travelers
                    </div>
                    <div className="space-y-1">
                      {FLIGHT_CLASSES.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setRouteClassOrSeats(item);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <span className="font-medium text-[#1E1A17]">
                            {item}
                          </span>
                          {routeClassOrSeats === item && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
              CASE 2: TRAIN BOOKING INPUT BOXES
              =================================================================== */}
          {activeTab === "train-booking" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
              {/* FROM STATION */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Train className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>From Station</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "train-from" ? null : "train-from",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "train-from"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {fromLocation}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Departure Boarding
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "train-from" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "train-from" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[320px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Origin Station
                    </div>
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                      {TRAIN_ORIGINS.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setFromLocation(item.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                            fromLocation === item.name ? "bg-[#FAF7F2]" : ""
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.name}
                            </div>
                            <div className="text-[10.5px] text-[#7A7167]">
                              {item.station}
                            </div>
                          </div>
                          {fromLocation === item.name && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TO STATION */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7A7167]" />
                    <span>To Station</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    title="Swap Origin and Destination"
                    className="p-0.5 text-[#7A7167] hover:text-[#1E1A17] transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "train-to" ? null : "train-to",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "train-to"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {toLocation}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Destination Station
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "train-to" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "train-to" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[320px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Destination Station
                    </div>
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                      {TRAIN_DESTINATIONS.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setToLocation(item.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                            toLocation === item.name ? "bg-[#FAF7F2]" : ""
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.name}
                            </div>
                            <div className="text-[10.5px] text-[#7A7167]">
                              {item.station}
                            </div>
                          </div>
                          {toLocation === item.name && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* JOURNEY DATE */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Journey Date</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "train-date" ? null : "train-date",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "train-date"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {routeDate}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Confirmed Quota
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-[#7A7167] shrink-0" />
                </button>

                {openDropdown === "train-date" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[280px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Travel Date
                    </div>
                    <div className="space-y-1">
                      {TRAIN_DATES.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setRouteDate(item.value);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-[#7A7167]">
                              {item.subtitle}
                            </div>
                          </div>
                          {routeDate === item.value && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CLASS & BERTHS */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Class & Berths</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "train-class" ? null : "train-class",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "train-class"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {routeClassOrSeats}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Berth Preference
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "train-class" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "train-class" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[260px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Choose Train Class
                    </div>
                    <div className="space-y-1">
                      {TRAIN_CLASSES.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setRouteClassOrSeats(item);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <span className="font-medium text-[#1E1A17]">
                            {item}
                          </span>
                          {routeClassOrSeats === item && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
              CASE 3: BUS BOOKING INPUT BOXES
              =================================================================== */}
          {activeTab === "bus-booking" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
              {/* FROM CITY */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Bus className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>From City</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "bus-from" ? null : "bus-from",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "bus-from"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {fromLocation}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Pickup Point
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "bus-from" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "bus-from" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[320px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Boarding City
                    </div>
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                      {BUS_ORIGINS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFromLocation(item.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                            fromLocation === item.name ? "bg-[#FAF7F2]" : ""
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.name}
                            </div>
                            <div className="text-[10.5px] text-[#7A7167]">
                              {item.area}
                            </div>
                          </div>
                          {fromLocation === item.name && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TO CITY */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7A7167]" />
                    <span>To City</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    title="Swap Origin and Destination"
                    className="p-0.5 text-[#7A7167] hover:text-[#1E1A17] transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "bus-to" ? null : "bus-to")
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "bus-to"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {toLocation}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Drop Location
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "bus-to" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "bus-to" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[320px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Destination City
                    </div>
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                      {BUS_DESTINATIONS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setToLocation(item.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                            toLocation === item.name ? "bg-[#FAF7F2]" : ""
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.name}
                            </div>
                            <div className="text-[10.5px] text-[#7A7167]">
                              {item.area}
                            </div>
                          </div>
                          {toLocation === item.name && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* DEPARTURE DATE */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Departure Date</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "bus-date" ? null : "bus-date",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "bus-date"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {routeDate}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Boarding Time
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-[#7A7167] shrink-0" />
                </button>

                {openDropdown === "bus-date" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[280px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Choose Departure Date
                    </div>
                    <div className="space-y-1">
                      {BUS_DATES.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setRouteDate(item.value);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-[#7A7167]">
                              {item.subtitle}
                            </div>
                          </div>
                          {routeDate === item.value && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SEATS & BUS TYPE */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Seats & Bus Type</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "bus-seats" ? null : "bus-seats",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "bus-seats"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {routeClassOrSeats}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Coach Preference
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "bus-seats" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "bus-seats" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[260px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Seats / Berth Type
                    </div>
                    <div className="space-y-1">
                      {BUS_SEATS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setRouteClassOrSeats(item);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <span className="font-medium text-[#1E1A17]">
                            {item}
                          </span>
                          {routeClassOrSeats === item && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
              CASE 4: VISA ASSISTANCE INPUT BOXES
              =================================================================== */}
          {activeTab === "visa-assistance" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
              {/* VISA COUNTRY */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <PassportIcon className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Visa Destination</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "visa-dest" ? null : "visa-dest",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "visa-dest"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {visaCountry}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Embassy / E-Visa
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "visa-dest" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "visa-dest" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[340px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="p-2 border-b border-neutral-100 mb-1">
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-[#7A7167] absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search Schengen, UK, US, Dubai..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-transparent focus:border-[#1E1A17]/30 focus:outline-none text-[#1E1A17]"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                      {VISA_COUNTRIES.filter(
                        (c) =>
                          c.name
                            .toLowerCase()
                            .includes(searchFilter.toLowerCase()) ||
                          c.subtitle
                            .toLowerCase()
                            .includes(searchFilter.toLowerCase()),
                      ).map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setVisaCountry(item.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-2 rounded-[10px] text-left flex items-start justify-between gap-2 hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                            visaCountry === item.name ? "bg-[#FAF7F2]" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm shrink-0">
                                {item.flag}
                              </span>
                              <span className="font-semibold text-[#1E1A17] truncate">
                                {item.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#7A7167] mt-0.5 truncate pl-5">
                              {item.subtitle}
                            </div>
                          </div>
                          {visaCountry === item.name && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PASSPORT / NATIONALITY */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Passport / Nationality</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "visa-passport" ? null : "visa-passport",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "visa-passport"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {passportCountry}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Citizenship
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "visa-passport" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "visa-passport" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[260px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Passport Type
                    </div>
                    <div className="space-y-1">
                      {VISA_PASSPORTS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPassportCountry(item);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <span className="font-medium text-[#1E1A17]">
                            {item}
                          </span>
                          {passportCountry === item && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* EXPECTED TRAVEL DATE */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Expected Date</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "visa-date" ? null : "visa-date",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "visa-date"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {visaDate}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Embassy Timeline
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-[#7A7167] shrink-0" />
                </button>

                {openDropdown === "visa-date" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[280px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Choose Travel Timeline
                    </div>
                    <div className="space-y-1">
                      {VISA_DATES.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setVisaDate(item.value);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-[#7A7167]">
                              {item.subtitle}
                            </div>
                          </div>
                          {visaDate === item.value && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* APPLICANTS */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Applicants</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "visa-app" ? null : "visa-app",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "visa-app"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {visaApplicants}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Passport Count
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "visa-app" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "visa-app" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[260px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Number of Applicants
                    </div>
                    <div className="space-y-1">
                      {VISA_APPLICANTS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setVisaApplicants(item);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <span className="font-medium text-[#1E1A17]">
                            {item}
                          </span>
                          {visaApplicants === item && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
              CASE 5: HAJJ PACKAGES INPUT BOXES (Matches Reference Mockup)
              =================================================================== */}
          {activeTab === "hajj-packages" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-stretch">
              {/* HAJJ PACKAGE TIER */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Hajj Package Tier</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "hajj-tier" ? null : "hajj-tier",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "hajj-tier"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {selectedPackage}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Hajj Packages • Selected
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "hajj-tier" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "hajj-tier" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[360px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="p-2 border-b border-neutral-100 mb-1">
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-[#7A7167] absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search Mina A, Deluxe Shifting, Express..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-transparent focus:border-[#1E1A17]/30 focus:outline-none text-[#1E1A17]"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                      {HAJJ_TIERS.filter(
                        (t) =>
                          t.name
                            .toLowerCase()
                            .includes(searchFilter.toLowerCase()) ||
                          t.subtitle
                            .toLowerCase()
                            .includes(searchFilter.toLowerCase()),
                      ).map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedPackage(item.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-2 rounded-[10px] text-left flex items-start justify-between gap-2 hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                            selectedPackage === item.name ? "bg-[#FAF7F2]" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm shrink-0">
                                {item.flag}
                              </span>
                              <span className="font-semibold text-[#1E1A17] truncate">
                                {item.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#7A7167] mt-0.5 truncate pl-5">
                              {item.subtitle}
                            </div>
                          </div>
                          {selectedPackage === item.name && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* HAJJ SEASON */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Hajj Season</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "hajj-season" ? null : "hajj-season",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "hajj-season"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {packageDate}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Pilgrimage Calendar
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-[#7A7167] shrink-0" />
                </button>

                {openDropdown === "hajj-season" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[320px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Hajj Season
                    </div>
                    <div className="space-y-1">
                      {HAJJ_SEASONS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPackageDate(item.value);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-[#7A7167]">
                              {item.subtitle}
                            </div>
                          </div>
                          {packageDate === item.value && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PILGRIMS / PARTY */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Pilgrims / Party</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "hajj-guests" ? null : "hajj-guests",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "hajj-guests"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {packageGuests}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Travel party size
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "hajj-guests" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "hajj-guests" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[280px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Pilgrim Count
                    </div>
                    <div className="space-y-1">
                      {HAJJ_PILGRIMS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPackageGuests(item);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <span className="font-medium text-[#1E1A17]">
                            {item}
                          </span>
                          {packageGuests === item && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
              CASE 6: CUSTOM HOLIDAYS INPUT BOXES
              =================================================================== */}
          {activeTab === "custom-holidays" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-stretch">
              {/* HOLIDAY DESTINATION */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Holiday Destination</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "holiday-dest" ? null : "holiday-dest",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "holiday-dest"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {selectedPackage}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Custom Holidays • Selected
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "holiday-dest" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "holiday-dest" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[360px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="p-2 border-b border-neutral-100 mb-1">
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-[#7A7167] absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search Switzerland, Bali, Dubai, Japan..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-transparent focus:border-[#1E1A17]/30 focus:outline-none text-[#1E1A17]"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                      {HOLIDAY_DESTINATIONS.filter(
                        (h) =>
                          h.name
                            .toLowerCase()
                            .includes(searchFilter.toLowerCase()) ||
                          h.subtitle
                            .toLowerCase()
                            .includes(searchFilter.toLowerCase()),
                      ).map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedPackage(item.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-2 rounded-[10px] text-left flex items-start justify-between gap-2 hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                            selectedPackage === item.name ? "bg-[#FAF7F2]" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm shrink-0">
                                {item.flag}
                              </span>
                              <span className="font-semibold text-[#1E1A17] truncate">
                                {item.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#7A7167] mt-0.5 truncate pl-5">
                              {item.subtitle}
                            </div>
                          </div>
                          {selectedPackage === item.name && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TRAVEL MONTH */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Travel Month</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "holiday-month" ? null : "holiday-month",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "holiday-month"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {packageDate}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Holiday Season
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-[#7A7167] shrink-0" />
                </button>

                {openDropdown === "holiday-month" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[320px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Choose Travel Month
                    </div>
                    <div className="space-y-1">
                      {HOLIDAY_MONTHS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPackageDate(item.value);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-[#1E1A17]">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-[#7A7167]">
                              {item.subtitle}
                            </div>
                          </div>
                          {packageDate === item.value && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TRAVELERS / PARTY */}
              <div className="relative">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>Travelers / Party</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "holiday-guests"
                        ? null
                        : "holiday-guests",
                    )
                  }
                  className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                    openDropdown === "holiday-guests"
                      ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                      : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {packageGuests}
                    </div>
                    <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                      Travel party size
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                      openDropdown === "holiday-guests" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "holiday-guests" && (
                  <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[280px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                      Select Party Size
                    </div>
                    <div className="space-y-1">
                      {HOLIDAY_TRAVELERS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPackageGuests(item);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                        >
                          <span className="font-medium text-[#1E1A17]">
                            {item}
                          </span>
                          {packageGuests === item && (
                            <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
              ROW 2: DYNAMIC CONTACT DETAILS & SERVICE-MATCHED CTA BUTTON
              =================================================================== */}
          <div className="mt-3.5 sm:mt-4 grid grid-cols-1 sm:grid-cols-[1fr_1.1fr_auto] gap-3 items-center">
            {/* INPUT 1: DYNAMIC NAME */}
            <div className="relative flex items-center min-h-[48px] sm:min-h-[52px] px-3.5 rounded-[14px] border border-[#E5DFD7] bg-white focus-within:border-[#1E1A17] focus-within:ring-1 focus-within:ring-[#1E1A17]/20 transition-all">
              <User className="w-4 h-4 text-[#9A9187] mr-2 shrink-0" />
              <input
                type="text"
                placeholder={
                  activeTab === "flight-booking"
                    ? "Passenger / Booker Name"
                    : activeTab === "train-booking"
                      ? "Passenger Full Name"
                      : activeTab === "bus-booking"
                        ? "Passenger Contact Name"
                        : activeTab === "visa-assistance"
                          ? "Applicant Full Name"
                          : activeTab === "hajj-packages"
                            ? "Pilgrim / Lead Booker Name"
                            : "Your Full Name"
                }
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-[#1E1A17] placeholder:text-[#9A9187] focus:outline-none bg-transparent"
              />
            </div>

            {/* INPUT 2: DYNAMIC PHONE / WHATSAPP */}
            <div className="relative flex items-center min-h-[48px] sm:min-h-[52px] px-3.5 rounded-[14px] border border-[#E5DFD7] bg-white focus-within:border-[#1E1A17] focus-within:ring-1 focus-within:ring-[#1E1A17]/20 transition-all">
              <MessageCircle className="w-4 h-4 text-[#9A9187] mr-2 shrink-0" />
              <input
                type="tel"
                placeholder={
                  activeTab === "flight-booking"
                    ? "WhatsApp for Instant Fare Locks"
                    : activeTab === "train-booking"
                      ? "WhatsApp for Confirmed Berth Alerts"
                      : activeTab === "bus-booking"
                        ? "WhatsApp for Ticket & Boarding Point"
                        : activeTab === "visa-assistance"
                          ? "WhatsApp for Document Checklist"
                          : activeTab === "hajj-packages"
                            ? "WhatsApp for Hajj Itinerary"
                            : "WhatsApp for Holiday Itinerary"
                }
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-[#1E1A17] placeholder:text-[#9A9187] focus:outline-none bg-transparent"
              />
            </div>

            {/* BUTTON: DYNAMIC ACTION TEXT MATCHING SERVICE */}
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-7 sm:px-9 rounded-[14px] bg-[#221D1A] hover:bg-[#342D28] active:bg-[#14110F] text-white flex items-center justify-center gap-2.5 font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              {isSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-200">Quote Requested!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-amber-300 stroke-[2.2] shrink-0" />
                  <span>
                    {activeTab === "flight-booking"
                      ? "Search Flights"
                      : activeTab === "train-booking"
                        ? "Check Train Seats"
                        : activeTab === "bus-booking"
                          ? "Book Bus Tickets"
                          : activeTab === "visa-assistance"
                            ? "Get Visa Checklist"
                            : activeTab === "hajj-packages"
                              ? "Get Hajj Quote"
                              : "Plan My Holiday"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2] shrink-0" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Micro-Trust Feedback Inside Card */}
        {isSubmitted && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Thank you {customerName || "traveler"}! Our {activeService.label}{" "}
              concierge will send your confirmed itinerary & quote via WhatsApp
              shortly.
            </span>
          </div>
        )}
      </div>

      {/* =======================================================================
          BOTTOM FOOTNOTE: Direct WhatsApp Link
          ======================================================================= */}
      <div className="mt-2.5 px-2 flex items-center justify-center text-center text-white/95 text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
        <a
          href={`https://wa.me/919876543210?text=${encodeURIComponent(
            `Hi Flyora Travels, I would like to enquire about ${activeService.label} for travel around ${
              activeTab === "flight-booking" ||
              activeTab === "train-booking" ||
              activeTab === "bus-booking"
                ? routeDate
                : activeTab === "visa-assistance"
                  ? visaDate
                  : packageDate
            }.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 font-medium text-white hover:text-amber-200 underline underline-offset-4 transition-colors cursor-pointer text-[11.5px] sm:text-xs shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Prefer WhatsApp chat? Connect directly →</span>
        </a>
      </div>
    </div>
  );
};

export default HeroSearchCard;
