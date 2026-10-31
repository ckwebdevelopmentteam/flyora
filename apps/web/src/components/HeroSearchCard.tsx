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
  ShieldCheck,
  CheckCircle2,
  Headphones,
} from "lucide-react";

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

interface ServiceItem {
  id: ServiceId;
  label: string;
  subtitle: string;
  cardImg: string;
  defaultOption: string;
  options: { name: string; subtitle?: string; flag?: string }[];
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: "hajj-packages",
    label: "Hajj Packages",
    subtitle: "Spiritual Journeys",
    cardImg: "/services/card-hajj.png",
    defaultOption: "Executive Non-Shifting (Mina A)",
    options: [
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
    ],
  },
  {
    id: "custom-holidays",
    label: "Custom Holidays",
    subtitle: "International & Local",
    cardImg: "/services/card-custom-holidays.png",
    defaultOption: "Switzerland & The Alps",
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
    ],
  },
  {
    id: "visa-assistance",
    label: "Visa Assistance",
    subtitle: "Hassle-free Process",
    cardImg: "/services/card-visa.png",
    defaultOption: "Schengen Europe Visa",
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
    ],
  },
  {
    id: "flight-booking",
    label: "Flight Booking",
    subtitle: "Best Fares",
    cardImg: "/services/card-flights.png",
    defaultOption: "International Round-Trip",
    options: [
      {
        name: "International Business / Economy",
        subtitle: "Emirates, Qatar, Singapore Airlines",
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
    subtitle: "Easy & Fast",
    cardImg: "/services/card-train.png",
    defaultOption: "Swiss Glacier Express & Eurail",
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
    subtitle: "Comfort Travel",
    cardImg: "/services/card-bus.png",
    defaultOption: "Intercity Multi-Axle Volvo",
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
];

const GUEST_OPTIONS = [
  "Couple (2 Adults)",
  "Solo Traveler (1 Adult)",
  "Family (2 Adults, 2 Kids)",
  "Small Group (3 – 5 Adults)",
  "Large Group (6+ Travelers)",
];

const DATE_PRESETS = [
  {
    label: "May - June 2027",
    subtitle: "Hajj Pilgrimage Months",
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

export const HeroSearchCard: React.FC<HeroSearchCardProps> = ({
  onOpenEnquiry,
  onExploreJourneys,
  className = "",
}) => {
  // Active Tab state (defaults to Hajj Packages)
  const [activeTab, setActiveTab] = useState<ServiceId>("hajj-packages");

  // Form Fields state
  const [selectedOption, setSelectedOption] = useState<string>(
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
  const cardsScrollRef = useRef<HTMLDivElement>(null);

  const activeService =
    SERVICES_DATA.find((s) => s.id === activeTab) || SERVICES_DATA[0];

  // Update selection when clicking a card
  const handleCardClick = (serviceId: ServiceId) => {
    setActiveTab(serviceId);
    const service = SERVICES_DATA.find((s) => s.id === serviceId);
    if (service) {
      setSelectedOption(service.defaultOption);
      if (serviceId === "hajj-packages") {
        setTravelDate("May - June 2027");
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

    const enquirySummary = `${activeService.label}: ${selectedOption} | Timeline: ${travelDate} | Travelers: ${guestCount}${
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
    <div className={`w-full max-w-[1100px] mx-auto select-none ${className}`}>
      {/* =======================================================================
          TOP SERVICE CARDS: 6 Cards Exactly Matching the Reference Image
          ======================================================================= */}
      <div className="relative mb-3 sm:mb-4">
        <div
          ref={cardsScrollRef}
          className="flex md:grid md:grid-cols-6 items-stretch gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1"
        >
          {SERVICES_DATA.map((service) => {
            const isActive = activeTab === service.id;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleCardClick(service.id)}
                aria-pressed={isActive}
                aria-label={`Select ${service.label}`}
                className={`group relative shrink-0 w-[152px] sm:w-[162px] md:w-auto rounded-[16px] sm:rounded-[18px] overflow-hidden transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-black/30 shadow-[0_8px_25px_rgba(245,158,11,0.35)] scale-[1.03]"
                    : "opacity-90 hover:opacity-100 hover:scale-[1.02] shadow-sm hover:shadow-md"
                }`}
              >
                <img
                  src={service.cardImg}
                  alt={service.label}
                  className="w-full h-[66px] sm:h-[74px] object-cover object-center rounded-[16px] sm:rounded-[18px] block"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* =======================================================================
          MAIN WHITE CONCIERGE CARD: 2-Tier Architecture matching Reference
          ======================================================================= */}
      <div className="relative bg-white text-[#1E1A17] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#EAE3D9] text-left transition-all duration-300">
        <form onSubmit={handleSubmit}>
          {/* -------------------------------------------------------------------
              ROW 1: THE 3 JOURNEY PARAMETER BOXES
              ------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-stretch">
            {/* FIELD 1: SELECTED SERVICE */}
            <div ref={serviceRef} className="relative">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3 h-3 text-[#7A7167]" />
                <span>Selected Service</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsServiceOpen(!isServiceOpen);
                  setIsDateOpen(false);
                  setIsGuestOpen(false);
                }}
                className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                  isServiceOpen
                    ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                    : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                }`}
              >
                <div className="min-w-0 pr-1">
                  <div className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                    {activeService.label}
                  </div>
                  <div className="text-[11px] text-[#7A7167] font-normal truncate mt-0.5">
                    {selectedOption}
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
                <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[360px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="p-2 border-b border-neutral-100 mb-1">
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-[#7A7167] absolute left-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search package tier, route, or city..."
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
                          setSelectedOption(opt.name);
                          setIsServiceOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-[10px] text-left flex items-start justify-between gap-2 hover:bg-[#FAF7F2] transition text-xs cursor-pointer ${
                          selectedOption === opt.name ? "bg-[#FAF7F2]" : ""
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
                        {selectedOption === opt.name && (
                          <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FIELD 2: TRAVEL DATE */}
            <div ref={dateRef} className="relative">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3 h-3 text-[#7A7167]" />
                <span>Travel Date</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsDateOpen(!isDateOpen);
                  setIsServiceOpen(false);
                  setIsGuestOpen(false);
                }}
                className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                  isDateOpen
                    ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                    : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                }`}
              >
                <span className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                  {travelDate}
                </span>
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

            {/* FIELD 3: TRAVELERS */}
            <div ref={guestRef} className="relative">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#7A7167] flex items-center gap-1.5 mb-1.5">
                <User className="w-3 h-3 text-[#7A7167]" />
                <span>Travelers</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsGuestOpen(!isGuestOpen);
                  setIsServiceOpen(false);
                  setIsDateOpen(false);
                }}
                className={`w-full min-h-[52px] sm:min-h-[56px] px-4 py-2 rounded-[14px] border text-left flex items-center justify-between gap-2 transition-all cursor-pointer bg-white ${
                  isGuestOpen
                    ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                    : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <User className="w-4 h-4 text-[#7A7167] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-[#1E1A17] truncate leading-tight">
                    {guestCount}
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
                    Select Party Size
                  </div>
                  <div className="space-y-1">
                    {GUEST_OPTIONS.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setGuestCount(opt);
                          setIsGuestOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs cursor-pointer"
                      >
                        <span className="font-medium text-[#1E1A17]">
                          {opt}
                        </span>
                        {guestCount === opt && (
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
              ROW 2: CONTACT DETAILS & GET BEST QUOTE BUTTON
              ------------------------------------------------------------------- */}
          <div className="mt-3.5 sm:mt-4 grid grid-cols-1 sm:grid-cols-[1fr_1.1fr_auto] gap-3 items-center">
            {/* INPUT 1: FULL NAME */}
            <div className="relative flex items-center min-h-[48px] sm:min-h-[52px] px-3.5 rounded-[14px] border border-[#E5DFD7] bg-white focus-within:border-[#1E1A17] focus-within:ring-1 focus-within:ring-[#1E1A17]/20 transition-all">
              <User className="w-4 h-4 text-[#9A9187] mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Your Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-[#1E1A17] placeholder:text-[#9A9187] focus:outline-none bg-transparent"
              />
            </div>

            {/* INPUT 2: PHONE / WHATSAPP */}
            <div className="relative flex items-center min-h-[48px] sm:min-h-[52px] px-3.5 rounded-[14px] border border-[#E5DFD7] bg-white focus-within:border-[#1E1A17] focus-within:ring-1 focus-within:ring-[#1E1A17]/20 transition-all">
              <MessageCircle className="w-4 h-4 text-[#9A9187] mr-2 shrink-0" />
              <input
                type="tel"
                placeholder="WhatsApp / Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-[#1E1A17] placeholder:text-[#9A9187] focus:outline-none bg-transparent"
              />
            </div>

            {/* BUTTON: GET BEST QUOTE → */}
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
                  <span>Get Best Quote</span>
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
              Thank you {customerName || "traveler"}! Our bespoke concierge
              specialist will send your quote via WhatsApp shortly.
            </span>
          </div>
        )}
      </div>

      {/* =======================================================================
          BOTTOM FOOTNOTE: Trust & Direct WhatsApp Link matching Mockup
          ======================================================================= */}
      <div className="mt-3 px-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-white/95 text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-[11.5px] sm:text-xs font-light tracking-wide">
          <div className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>100% Tailor-made</span>
          </div>
          <span className="text-white/40">|</span>
          <div className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Certified Visa & Hajj Experts</span>
          </div>
          <span className="text-white/40">|</span>
          <div className="inline-flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Instant Support</span>
          </div>
        </div>

        <a
          href={`https://wa.me/919876543210?text=${encodeURIComponent(
            `Hi Flyora Travels, I would like to enquire about ${activeService.label} (${selectedOption}) for ${guestCount} around ${travelDate}.`,
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
