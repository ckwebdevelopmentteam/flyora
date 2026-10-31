"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  Calendar,
  ChevronDown,
  Check,
  ArrowRight,
} from "lucide-react";

export interface HeroSearchCardProps {
  onOpenEnquiry?: (serviceOrDest?: string) => void;
  onExploreJourneys?: () => void;
  className?: string;
}

const DESTINATIONS = [
  {
    id: "dest-switzerland",
    name: "Switzerland & The Alps",
    flag: "🇨🇭",
    category: "Europe",
  },
  {
    id: "dest-bali",
    name: "Bali, Indonesia",
    flag: "🇮🇩",
    category: "Southeast Asia",
  },
  {
    id: "dest-dubai",
    name: "Dubai & Abu Dhabi, UAE",
    flag: "🇦🇪",
    category: "Middle East",
  },
  {
    id: "dest-hajj",
    name: "Saudi Arabia (Hajj & Umrah)",
    flag: "🇸🇦",
    category: "Pilgrimage",
  },
  {
    id: "dest-rome",
    name: "Rome & Vatican, Italy",
    flag: "🇮🇹",
    category: "Europe",
  },
  {
    id: "dest-kyoto",
    name: "Kyoto & Tokyo, Japan",
    flag: "🇯🇵",
    category: "Asia",
  },
  {
    id: "dest-lisbon",
    name: "Lisbon & Porto, Portugal",
    flag: "🇵🇹",
    category: "Europe",
  },
  {
    id: "dest-tulum",
    name: "Tulum & Riviera Maya, Mexico",
    flag: "🇲🇽",
    category: "Americas",
  },
  {
    id: "dest-maldives",
    name: "Maldives Islands",
    flag: "🇲🇻",
    category: "Islands",
  },
  {
    id: "dest-uk",
    name: "London & Edinburgh, UK",
    flag: "🇬🇧",
    category: "Europe",
  },
  {
    id: "dest-france",
    name: "Paris & French Riviera, France",
    flag: "🇫🇷",
    category: "Europe",
  },
];

const DATE_OPTIONS = [
  { month: "October", subtitle: "30 - Friday, 2026 (Today)" },
  { month: "November", subtitle: "Autumn Getaways, 2026" },
  { month: "December", subtitle: "Winter & New Year Holidays, 2026" },
  { month: "January", subtitle: "Fresh Start Journeys, 2027" },
  { month: "Spring Season", subtitle: "March – May, 2027" },
  { month: "Hajj Season", subtitle: "May – June, 2027" },
  { month: "Flexible Dates", subtitle: "Anytime in 2026 – 2027" },
];

type ServiceTab = "visa" | "packages" | "custom";

export const HeroSearchCard: React.FC<HeroSearchCardProps> = ({
  onOpenEnquiry,
  onExploreJourneys,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<ServiceTab>("visa");
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState({
    month: "October",
    subtitle: "30 - Friday, 2026",
  });

  const [isDestOpen, setIsDestOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const destDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        destDropdownRef.current &&
        !destDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDestOpen(false);
      }
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleActionClick = () => {
    const destinationText = selectedDestination || "International Destination";
    if (activeTab === "visa") {
      if (onOpenEnquiry) {
        onOpenEnquiry(
          `Visa Assistance for ${destinationText} (${selectedDate.month})`,
        );
      }
    } else if (activeTab === "packages") {
      if (onExploreJourneys) {
        onExploreJourneys();
      } else if (onOpenEnquiry) {
        onOpenEnquiry(
          `Holiday Package for ${destinationText} (${selectedDate.month})`,
        );
      }
    } else {
      if (onOpenEnquiry) {
        onOpenEnquiry(
          `Custom Journey to ${destinationText} (${selectedDate.month})`,
        );
      }
    }
  };

  const handleBookMeeting = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenEnquiry) {
      onOpenEnquiry("Consultation Meeting with Travel Specialist");
    }
  };

  const filteredDestinations = DESTINATIONS.filter((d) =>
    d.name.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <div className={`w-full max-w-[840px] mx-auto select-none ${className}`}>
      {/* =======================================================================
          MAIN WHITE HERO SEARCH CARD: Sleek & Compact
          ======================================================================= */}
      <div className="relative bg-white text-[#1E1A17] rounded-[20px] sm:rounded-[26px] md:rounded-[28px] px-3.5 py-3 sm:px-6 sm:py-4.5 md:px-7 md:py-5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.30)] border border-neutral-100/90 text-left transition-all duration-300">
        {/* Top Header: Title + Service Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2.5 sm:mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#1E1A17] tracking-tight leading-tight">
              {activeTab === "visa" && "Get Your Visa"}
              {activeTab === "packages" && "Find Holiday Packages"}
              {activeTab === "custom" && "Design Custom Journey"}
            </h2>
          </div>

          {/* Quick Service Switcher Tabs */}
          <div className="inline-flex items-center p-0.5 sm:p-1 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("visa")}
              className={`px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all cursor-pointer ${
                activeTab === "visa"
                  ? "bg-[#1E1A17] text-white shadow-xs"
                  : "text-[#6B6058] hover:text-[#1E1A17]"
              }`}
            >
              Visa Services
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("packages")}
              className={`px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all cursor-pointer ${
                activeTab === "packages"
                  ? "bg-[#1E1A17] text-white shadow-xs"
                  : "text-[#6B6058] hover:text-[#1E1A17]"
              }`}
            >
              Holidays
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all cursor-pointer ${
                activeTab === "custom"
                  ? "bg-[#1E1A17] text-white shadow-xs"
                  : "text-[#6B6058] hover:text-[#1E1A17]"
              }`}
            >
              Custom Tour
            </button>
          </div>
        </div>

        {/* Input Fields & Action Button Row: Compact & Streamlined */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_auto] gap-2 sm:gap-3 items-stretch">
          {/* FIELD 1: DESTINATION SELECTOR */}
          <div ref={destDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsDestOpen(!isDestOpen);
                setIsDateOpen(false);
              }}
              className={`w-full h-full min-h-[46px] sm:min-h-[52px] md:min-h-[56px] px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-[12px] sm:rounded-[16px] border text-left flex flex-col justify-center transition-all cursor-pointer bg-white ${
                isDestOpen
                  ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                  : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
              }`}
            >
              <span className="text-[10px] sm:text-[11px] text-[#7A7167] font-normal leading-tight block mb-0.5">
                Where are you going?
              </span>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    selectedDestination ? "text-[#1E1A17]" : "text-[#1E1A17]/85"
                  }`}
                >
                  {selectedDestination || "Select Destination"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                    isDestOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {/* Destination Popover Dropdown (Opens Upward to avoid clouds & ensure full visibility) */}
            {isDestOpen && (
              <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[320px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="p-2 border-b border-neutral-100 mb-1">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-[#7A7167] absolute left-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Type country or city..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-transparent focus:border-[#1E1A17]/30 focus:outline-none text-[#1E1A17]"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-0.5">
                  {filteredDestinations.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setSelectedDestination(d.name);
                        setIsDestOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs sm:text-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base shrink-0">{d.flag}</span>
                        <span className="font-medium text-[#1E1A17] truncate">
                          {d.name}
                        </span>
                      </div>
                      {selectedDestination === d.name && (
                        <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                      )}
                    </button>
                  ))}
                  {filteredDestinations.length === 0 && (
                    <div className="p-4 text-center text-xs text-[#7A7167]">
                      No destination found. You can type any country during
                      enquiry!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FIELD 2: DATE / MONTH SELECTOR */}
          <div ref={dateDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsDateOpen(!isDateOpen);
                setIsDestOpen(false);
              }}
              className={`w-full h-full min-h-[46px] sm:min-h-[52px] md:min-h-[56px] px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-[12px] sm:rounded-[16px] border text-left flex flex-col justify-center transition-all cursor-pointer bg-white ${
                isDateOpen
                  ? "border-[#1E1A17] ring-1 ring-[#1E1A17]/20 shadow-xs"
                  : "border-[#E5DFD7] hover:border-[#1E1A17]/40"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs sm:text-sm font-bold text-[#1E1A17] leading-tight truncate">
                  {selectedDate.month}
                </span>
                <Calendar className="w-3.5 h-3.5 text-[#7A7167] shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#7A7167] font-normal mt-0.5 truncate block">
                {selectedDate.subtitle}
              </span>
            </button>

            {/* Date Popover Dropdown (Opens Upward to avoid clouds & ensure full visibility) */}
            {isDateOpen && (
              <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full sm:w-[280px] bg-white rounded-[18px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#E5DFD7] animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-2 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[#7A7167] border-b border-neutral-100 mb-1">
                  Select Travel Timeline
                </div>
                <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-0.5">
                  {DATE_OPTIONS.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedDate(opt);
                        setIsDateOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between hover:bg-[#FAF7F2] transition text-xs sm:text-sm cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-[#1E1A17]">
                          {opt.month}
                        </div>
                        <div className="text-[11px] text-[#7A7167]">
                          {opt.subtitle}
                        </div>
                      </div>
                      {selectedDate.month === opt.month && (
                        <Check className="w-3.5 h-3.5 text-[#1E1A17] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTON: "Visa Types" / "Explore Trips" */}
          <button
            type="button"
            onClick={handleActionClick}
            className="w-full md:w-auto min-h-[42px] sm:min-h-[52px] md:min-h-[56px] px-4 sm:px-7 rounded-[12px] sm:rounded-[16px] bg-[#1E1A17] hover:bg-[#342C25] text-white flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm tracking-wide shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2] shrink-0" />
            <span>
              {activeTab === "visa" && "Visa Types"}
              {activeTab === "packages" && "Explore Trips"}
              {activeTab === "custom" && "Plan Journey"}
            </span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          BOTTOM EXTERNAL LINK: "Book a meeting with our travel Agent →"
          ======================================================================= */}
      <div className="mt-3 sm:mt-3.5 text-center">
        <button
          type="button"
          onClick={handleBookMeeting}
          className="group inline-flex items-center justify-center gap-1.5 text-white/95 hover:text-white font-medium text-xs sm:text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] tracking-wide transition-all cursor-pointer hover:underline underline-offset-4"
        >
          <span>Book a meeting with our travel Agent</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default HeroSearchCard;
