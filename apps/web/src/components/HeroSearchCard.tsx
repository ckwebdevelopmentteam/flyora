"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Star,
  Globe,
  Plane,
  Train,
  Bus,
  Compass,
  Sparkles,
  Tag,
  Calendar,
  Users,
  MessageCircle,
  Send,
  Check,
  ChevronDown,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

export interface HeroSearchCardProps {
  onOpenEnquiry?: (serviceOrDest?: string) => void;
  onExploreJourneys?: () => void;
  className?: string;
}

export type ServiceId =
  | "custom-holidays"
  | "visa-assistance"
  | "flight-booking"
  | "train-booking"
  | "bus-booking"
  | "umrah-packages"
  | "hajj-packages";

interface ServiceTabItem {
  id: ServiceId;
  label: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  defaultSelection: string;
  options: { name: string; subtitle?: string; flag?: string }[];
}

const SERVICES_CONFIG: ServiceTabItem[] = [
  {
    id: "custom-holidays",
    label: "Custom Holidays",
    subtitle: "Tailored Luxury",
    badge: "Bespoke Itineraries",
    icon: Star,
    accentColor: "text-amber-500",
    defaultSelection: "Switzerland & The Alps",
    options: [
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
        subtitle: "Desert Glamping & Skyscrapers",
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
      {
        name: "Paris & French Riviera, France",
        subtitle: "Haute Cuisine & Côte d'Azur",
        flag: "🇫🇷",
      },
    ],
  },
  {
    id: "visa-assistance",
    label: "Visa Assistance",
    subtitle: "Fast & Seamless",
    badge: "100+ Embassies",
    icon: Globe,
    accentColor: "text-blue-500",
    defaultSelection: "Schengen Europe Visa",
    options: [
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
      {
        name: "Japan Tourist Visa",
        subtitle: "Single & Multiple Entry Assistance",
        flag: "🇯🇵",
      },
    ],
  },
  {
    id: "flight-booking",
    label: "Flight Booking",
    subtitle: "Best Fares",
    badge: "24/7 Flight Support",
    icon: Plane,
    accentColor: "text-sky-500",
    defaultSelection: "International Round-Trip",
    options: [
      {
        name: "International Business / Economy",
        subtitle: "Best routes on Emirates, Qatar, Singapore",
        flag: "✈️",
      },
      {
        name: "Domestic India Express Flights",
        subtitle: "Instant corporate & family fare locks",
        flag: "🇮🇳",
      },
      {
        name: "Middle East Non-Stop Sectors",
        subtitle: "Jeddah, Medina, Dubai, Riyadh, Doha",
        flag: "🇸🇦",
      },
      {
        name: "European Transatlantic Routes",
        subtitle: "London, Zurich, Paris, Frankfurt",
        flag: "🇪🇺",
      },
    ],
  },
  {
    id: "train-booking",
    label: "Train Booking",
    subtitle: "Scenic Rail",
    badge: "Luxury & Tourist Trains",
    icon: Train,
    accentColor: "text-emerald-500",
    defaultSelection: "Swiss Glacier Express & Eurail",
    options: [
      {
        name: "Eurail & Swiss Panoramic Trains",
        subtitle: "Glacier Express, Bernina & Eurostar",
        flag: "🇨🇭",
      },
      {
        name: "Luxury Tourist Heritage Trains",
        subtitle: "Palace on Wheels & Maharaja Express",
        flag: "👑",
      },
      {
        name: "Vande Bharat / IRCTC Express",
        subtitle: "Confirmed 1st AC & Executive Chair Car",
        flag: "🇮🇳",
      },
      {
        name: "Japan Shinkansen Bullet Rail",
        subtitle: "7 & 14 Day Unlimited JR Rail Passes",
        flag: "🇯🇵",
      },
    ],
  },
  {
    id: "bus-booking",
    label: "Bus Booking",
    subtitle: "Highway Comfort",
    badge: "Premium Volvo Fleet",
    icon: Bus,
    accentColor: "text-orange-500",
    defaultSelection: "Intercity Multi-Axle Volvo",
    options: [
      {
        name: "Multi-Axle AC Sleeper Volvo",
        subtitle: "Mumbai, Bangalore, Goa, Hyderabad, Delhi",
        flag: "🚌",
      },
      {
        name: "Private Luxury Charter Coaches",
        subtitle: "Wedding & corporate executive delegates",
        flag: "✨",
      },
      {
        name: "Scenic Hill Station Transfers",
        subtitle: "Shimla, Manali, Ooty, Munnar, Darjeeling",
        flag: "🏔️",
      },
    ],
  },
  {
    id: "umrah-packages",
    label: "Umrah Packages",
    subtitle: "Spiritual Journey",
    badge: "Walkable to Haram",
    icon: Compass,
    accentColor: "text-teal-500",
    defaultSelection: "Deluxe 5★ Haram View (15 Days)",
    options: [
      {
        name: "Deluxe 5★ Clock Tower (15 Days)",
        subtitle: "Swissôtel / Fairmont Makkah & Medina Oberoi",
        flag: "🕋",
      },
      {
        name: "Classic Executive Group (10 Days)",
        subtitle: "Walking distance 350m with 3 full meals",
        flag: "🌙",
      },
      {
        name: "Ramadan Last 10 Days Special",
        subtitle: "Laylatul Qadr spiritual itinerary & ziyaarat",
        flag: "✨",
      },
      {
        name: "Customized Private VIP Umrah",
        subtitle: "Private luxury GMC Yukon transport & guide",
        flag: "🕊️",
      },
    ],
  },
  {
    id: "hajj-packages",
    label: "Hajj Packages",
    subtitle: "The Holy Pillar",
    badge: "Sacred Pilgrimage",
    icon: Sparkles,
    accentColor: "text-amber-500",
    defaultSelection: "Executive Non-Shifting (Mina A)",
    options: [
      {
        name: "Executive Non-Shifting (Mina A-Zone)",
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
        subtitle: "Perfect for working professionals & couples",
        flag: "⏱️",
      },
      {
        name: "VIP Private Tent & Haramain Train",
        subtitle: "Dedicated religious scholar & direct logistics",
        flag: "🕊️",
      },
    ],
  },
];

const GUEST_OPTIONS = [
  { label: "Couple (2 Adults)", subtitle: "1 Private Room" },
  { label: "Solo Traveler (1 Adult)", subtitle: "Single Occupancy" },
  { label: "Family (2 Adults, 2 Kids)", subtitle: "Family Suite / 2 Rooms" },
  { label: "Small Group (3 – 5 Adults)", subtitle: "Shared or Quad Rooms" },
  { label: "Large Group (6+ Pilgrims)", subtitle: "Group Allocation" },
];

const DATE_PRESETS = [
  {
    label: "May – June 2027 (Hajj Season)",
    subtitle: "Blessed Pilgrimage Months",
    value: "May - June 2027",
  },
  {
    label: "Immediate (Next 7–14 Days)",
    subtitle: "Last-minute & Express Departures",
    value: "Immediate Departures",
  },
  {
    label: "November 2026",
    subtitle: "Autumn & Pre-Winter Getaways",
    value: "November 2026",
  },
  {
    label: "December Holiday Season 2026",
    subtitle: "Winter Break & New Year Celebrations",
    value: "December 2026",
  },
  {
    label: "January – February 2027",
    subtitle: "Fresh Start Journeys",
    value: "Jan - Feb 2027",
  },
  {
    label: "Spring Season (Mar – Apr 2027)",
    subtitle: "Cherry Blossoms & Mild Weather",
    value: "Spring 2027",
  },
  {
    label: "Flexible Travel Timeline",
    subtitle: "Open to recommendation",
    value: "Flexible Dates",
  },
];

export const HeroSearchCard: React.FC<HeroSearchCardProps> = ({
  onOpenEnquiry,
  onExploreJourneys,
  className = "",
}) => {
  // Active Tab state
  const [activeTab, setActiveTab] = useState<ServiceId>("hajj-packages");

  // Form Fields state
  const [selectedItem, setSelectedItem] = useState<string>(
    "Executive Non-Shifting (Mina A)",
  );
  const [travelDate, setTravelDate] = useState<string>("May - June 2027");
  const [guestCount, setGuestCount] = useState<string>("Couple (2 Adults)");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // Popover States
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dropdown Refs
  const serviceRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const activeService =
    SERVICES_CONFIG.find((s) => s.id === activeTab) || SERVICES_CONFIG[6];

  // Update selection when switching tabs
  const handleTabChange = (serviceId: ServiceId) => {
    setActiveTab(serviceId);
    const service = SERVICES_CONFIG.find((s) => s.id === serviceId);
    if (service) {
      setSelectedItem(service.defaultSelection);
      if (serviceId === "hajj-packages") {
        setTravelDate("May - June 2027");
      } else if (serviceId === "umrah-packages") {
        setTravelDate("November 2026");
      }
    }
    setIsServiceOpen(false);
    setIsDateOpen(false);
    setIsGuestOpen(false);
    setIsSubmitted(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        serviceRef.current &&
        !serviceRef.current.contains(e.target as Node)
      ) {
        setIsServiceOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDateOpen(false);
      }
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setIsGuestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const enquirySummary = `${activeService.label}: ${selectedItem} | Timeline: ${travelDate} | Party: ${guestCount}${
      customerName ? ` | Name: ${customerName}` : ""
    }${customerPhone ? ` | Contact: ${customerPhone}` : ""}`;

    if (onOpenEnquiry) {
      onOpenEnquiry(enquirySummary);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 4500);
  };

  const filteredOptions = activeService.options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (opt.subtitle &&
        opt.subtitle.toLowerCase().includes(searchFilter.toLowerCase())),
  );

  return (
    <div className={`w-full max-w-[1040px] mx-auto select-none ${className}`}>
      {/* =======================================================================
          TOP SERVICE TABS: Spacious & Centered Pill Switcher
          ======================================================================= */}
      <div className="relative mb-2 sm:mb-2.5">
        <div
          ref={tabsScrollRef}
          className="flex items-center justify-start md:justify-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1"
        >
          {SERVICES_CONFIG.map((service) => {
            const IconComponent = service.icon;
            const isActive = activeTab === service.id;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleTabChange(service.id)}
                className={`group shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white text-[#1C1815] shadow-[0_6px_20px_rgba(0,0,0,0.28)] font-semibold scale-[1.02]"
                    : "bg-[#181512]/80 hover:bg-[#181512]/95 text-white/80 hover:text-white border border-white/10 hover:border-white/25 backdrop-blur-md"
                }`}
              >
                <IconComponent
                  className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? service.accentColor
                      : "text-white/60 group-hover:text-white"
                  }`}
                />
                <span className="whitespace-nowrap">{service.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =======================================================================
          MAIN CONCIERGE CARD: 2-Tier Spacious Architecture (Zero Congestion)
          ======================================================================= */}
      <div className="relative bg-white text-[#1E1A17] rounded-[22px] sm:rounded-[26px] md:rounded-[28px] p-4 sm:p-5 md:p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.32)] border border-[#EAE3D9]/90 text-left transition-all duration-300">
        <form onSubmit={handleSubmit}>
          {/* -------------------------------------------------------------------
              TIER 1: THE PRIMARY JOURNEY DETAILS (3 Wide, Spacious Columns)
              ------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-3 sm:gap-4 items-stretch">
            {/* FIELD 1: SERVICE SPECIFICS & DESTINATION */}
            <div ref={serviceRef} className="relative">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3 h-3 text-[#7A7167]" />
                <span>Selected Service & Style</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsServiceOpen(!isServiceOpen);
                  setIsDateOpen(false);
                  setIsGuestOpen(false);
                }}
                className={`w-full min-h-[52px] sm:min-h-[56px] px-3.5 py-2.5 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                  isServiceOpen
                    ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 bg-[#FAF7F2]/50"
                    : "border-[#E5DFD7] hover:border-[#1E1A17]/40 bg-[#FAF7F2]/30"
                }`}
              >
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                      {activeService.label}
                    </span>
                    <span className="text-[11px] font-serif italic text-amber-700/90 font-medium shrink-0">
                      {activeService.subtitle}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-[#635A50] font-normal truncate mt-0.5">
                    {selectedItem}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                    isServiceOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Service & Option Dropdown (Opens Upward to guarantee visibility) */}
              {isServiceOpen && (
                <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[350px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="p-2 border-b border-neutral-100 mb-1">
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-[#7A7167] absolute left-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search package, route, or city..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-transparent focus:border-[#1E1A17]/30 focus:outline-none text-[#1E1A17]"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                    {filteredOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedItem(opt.name);
                          setIsServiceOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-[10px] text-left flex items-start justify-between gap-2 hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                          selectedItem === opt.name ? "bg-[#FAF7F2]" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {opt.flag && (
                              <span className="text-sm shrink-0">
                                {opt.flag}
                              </span>
                            )}
                            <span className="font-semibold text-[#1E1A17] truncate">
                              {opt.name}
                            </span>
                          </div>
                          {opt.subtitle && (
                            <div className="text-[11px] text-[#7A7167] mt-0.5 truncate pl-5">
                              {opt.subtitle}
                            </div>
                          )}
                        </div>
                        {selectedItem === opt.name && (
                          <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FIELD 2: EXPECTED TIMELINE / DATE */}
            <div ref={dateRef} className="relative">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3 h-3 text-[#7A7167]" />
                <span>Expected Departure</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsDateOpen(!isDateOpen);
                  setIsServiceOpen(false);
                  setIsGuestOpen(false);
                }}
                className={`w-full min-h-[52px] sm:min-h-[56px] px-3.5 py-2.5 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                  isDateOpen
                    ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 bg-[#FAF7F2]/50"
                    : "border-[#E5DFD7] hover:border-[#1E1A17]/40 bg-[#FAF7F2]/30"
                }`}
              >
                <div className="min-w-0 pr-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#1E1A17] truncate block leading-tight">
                    {travelDate}
                  </span>
                  <span className="text-[11px] text-[#7A7167] block mt-0.5">
                    Click to choose timeline
                  </span>
                </div>
                <Calendar className="w-4 h-4 text-[#7A7167] shrink-0" />
              </button>

              {/* Date Popover (Opens Upward) */}
              {isDateOpen && (
                <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[300px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                    Select Departure Timeline
                  </div>
                  <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                    {DATE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTravelDate(preset.value);
                          setIsDateOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-[#1E1A17]">
                            {preset.label}
                          </div>
                          <div className="text-[10px] text-[#7A7167]">
                            {preset.subtitle}
                          </div>
                        </div>
                        {travelDate === preset.value && (
                          <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FIELD 3: GUESTS & TRAVEL PARTY */}
            <div ref={guestRef} className="relative">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                <Users className="w-3 h-3 text-[#7A7167]" />
                <span>Travelers / Guests</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsGuestOpen(!isGuestOpen);
                  setIsServiceOpen(false);
                  setIsDateOpen(false);
                }}
                className={`w-full min-h-[52px] sm:min-h-[56px] px-3.5 py-2.5 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                  isGuestOpen
                    ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 bg-[#FAF7F2]/50"
                    : "border-[#E5DFD7] hover:border-[#1E1A17]/40 bg-[#FAF7F2]/30"
                }`}
              >
                <div className="min-w-0 pr-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#1E1A17] truncate block leading-tight">
                    {guestCount}
                  </span>
                  <span className="text-[11px] text-[#7A7167] block mt-0.5">
                    Party composition
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                    isGuestOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Guests Dropdown (Opens Upward) */}
              {isGuestOpen && (
                <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[280px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                    Select Group Composition
                  </div>
                  <div className="space-y-1">
                    {GUEST_OPTIONS.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setGuestCount(opt.label);
                          setIsGuestOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-[#1E1A17]">
                            {opt.label}
                          </div>
                          <div className="text-[10px] text-[#7A7167]">
                            {opt.subtitle}
                          </div>
                        </div>
                        {guestCount === opt.label && (
                          <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* -------------------------------------------------------------------
              TIER 2: DIRECT CONCIERGE & INSTANT QUOTE ACTION (Spacious & Roomy)
              ------------------------------------------------------------------- */}
          <div className="mt-3.5 pt-3.5 border-t border-[#F0EBE1]">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.1fr_auto] gap-2.5 sm:gap-3 items-center">
              {/* CONTACT INPUT 1: FULL NAME */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full min-h-[46px] sm:min-h-[50px] px-3.5 py-2 rounded-[12px] border border-[#E5DFD7] bg-[#FAF7F2]/40 text-xs sm:text-sm font-medium text-[#1E1A17] placeholder:text-[#9A9187] focus:border-[#1E1A17] focus:ring-1 focus:ring-[#1E1A17]/20 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* CONTACT INPUT 2: PHONE / WHATSAPP */}
              <div className="relative">
                <input
                  type="tel"
                  placeholder="WhatsApp / Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full min-h-[46px] sm:min-h-[50px] px-3.5 py-2 rounded-[12px] border border-[#E5DFD7] bg-[#FAF7F2]/40 text-xs sm:text-sm font-medium text-[#1E1A17] placeholder:text-[#9A9187] focus:border-[#1E1A17] focus:ring-1 focus:ring-[#1E1A17]/20 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* SUBMIT ENQUIRY BUTTON */}
              <button
                type="submit"
                className="w-full sm:w-auto min-h-[46px] sm:min-h-[50px] px-6 sm:px-8 rounded-[12px] bg-[#1E1A17] hover:bg-[#342C25] active:bg-[#12100E] text-white flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-200">Enquiry Sent!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-amber-300 stroke-[2.2] shrink-0" />
                    <span>Submit Enquiry</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Micro-Trust Indicator Inside Card */}
        {isSubmitted && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Thank you {customerName || "traveler"}! Our bespoke concierge
              specialist will WhatsApp your custom proposal within 15 minutes.
            </span>
          </div>
        )}
      </div>

      {/* =======================================================================
          BOTTOM CONCIERGE FOOTNOTE: Trust & Direct WhatsApp Link
          ======================================================================= */}
      <div className="mt-2.5 sm:mt-3 px-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left text-white/90 text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
        <div className="inline-flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="font-light tracking-wide">
            100% Tailor-made • Certified Visa & Hajj Experts • Instant Support
          </span>
        </div>

        <a
          href={`https://wa.me/919876543210?text=${encodeURIComponent(
            `Hi Flyora Travels, I would like to enquire about ${activeService.label} (${selectedItem}) for ${guestCount} around ${travelDate}.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 font-medium text-white hover:text-amber-200 underline underline-offset-4 transition-colors cursor-pointer"
        >
          <span>Prefer WhatsApp chat? Connect directly</span>
          <ArrowRight className="w-3 h-3 stroke-[2] transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  );
};

export default HeroSearchCard;
