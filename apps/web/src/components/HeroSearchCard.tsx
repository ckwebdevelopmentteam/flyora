"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  CalendarDays,
  Users,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Plane,
  Train,
  Bus,
  PlaneTakeoff,
  MapPin,
  Compass,
  CheckCircle2,
  Hotel,
  Layers,
  Globe2,
  X,
} from "lucide-react";
import {
  type TripMode,
  POPULAR_ORIGINS,
  POPULAR_DESTINATIONS,
  filterServicesByTripMode,
  getServiceTypeDefinition,
} from "../lib/dynamicServices";
import type { EnquiryPrefill } from "./EnquiryModal";

// Clean outline SVG icons matching luxury commercial travel sites
const PassportIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
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
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
  </svg>
);

const MosqueIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3c-1.5 1.5-2 3-2 5h4c0-2-.5-3.5-2-5z" />
    <path d="M4 10h16v11H4z" />
    <path d="M9 21v-5a3 3 0 0 1 6 0v5" />
    <path d="M2 13h2v8H2z" />
    <path d="M20 13h2v8h-2z" />
  </svg>
);

export interface HeroSearchCardProps {
  onOpenEnquiry?: (serviceOrDest?: string, prefill?: EnquiryPrefill) => void;
  onExploreJourneys?: () => void;
  defaultTripMode?: TripMode;
  className?: string;
}

export type DynamicServiceSlug =
  | "flight-booking"
  | "holiday-packages"
  | "hotel-booking"
  | "visa-assistance"
  | "umrah-hajj"
  | "train-booking"
  | "bus-booking";

interface ServiceMetadata {
  id: DynamicServiceSlug;
  backendSlug: string;
  label: string;
  subtitle: string;
  imageSrc: string;
  imagePosition?: string;
  icon: React.ComponentType<{ className?: string }>;
  isDomesticApplicable: boolean;
  isInternationalApplicable: boolean;
}

// 5 core services for domestic travel + international alternates
const ALL_SERVICES_CATALOG: ServiceMetadata[] = [
  {
    id: "flight-booking",
    backendSlug: "flight-booking",
    label: "Flight Booking",
    subtitle: "Best fares & routes",
    imageSrc: "/services/flight-booking.jpg",
    imagePosition: "object-[65%_45%]",
    icon: Plane,
    isDomesticApplicable: true,
    isInternationalApplicable: true,
  },
  {
    id: "holiday-packages",
    backendSlug: "holiday-packages",
    label: "Custom Holidays",
    subtitle: "Tailored journeys",
    imageSrc: "/services/custom-holidays.jpg",
    imagePosition: "object-[72%_50%]",
    icon: VacationPlaneIcon,
    isDomesticApplicable: true,
    isInternationalApplicable: true,
  },
  {
    id: "hotel-booking",
    backendSlug: "hotel-booking",
    label: "Hotel & Resorts",
    subtitle: "Luxury stays & villas",
    imageSrc: "/destinations/card-maldives.jpg",
    imagePosition: "object-center",
    icon: Hotel,
    isDomesticApplicable: true,
    isInternationalApplicable: true,
  },
  {
    id: "train-booking",
    backendSlug: "train-booking",
    label: "Train Booking",
    subtitle: "Express & scenic rail",
    imageSrc: "/services/train-booking.jpg",
    imagePosition: "object-[70%_55%]",
    icon: Train,
    isDomesticApplicable: true,
    isInternationalApplicable: false,
  },
  {
    id: "bus-booking",
    backendSlug: "bus-booking",
    label: "Bus Booking",
    subtitle: "Volvo sleeper comfort",
    imageSrc: "/services/bus-booking.jpg",
    imagePosition: "object-[24%_65%]",
    icon: Bus,
    isDomesticApplicable: true,
    isInternationalApplicable: false,
  },
  {
    id: "visa-assistance",
    backendSlug: "visa-assistance",
    label: "Visa Assistance",
    subtitle: "Hassle-free approvals",
    imageSrc: "/services/visa-assistance.jpg",
    imagePosition: "object-[30%_55%]",
    icon: PassportIcon,
    isDomesticApplicable: false,
    isInternationalApplicable: true,
  },
  {
    id: "umrah-hajj",
    backendSlug: "umrah-hajj",
    label: "Umrah & Hajj",
    subtitle: "Spiritual journeys",
    imageSrc: "/services/umrah-packages.jpg",
    imagePosition: "object-[82%_45%]",
    icon: MosqueIcon,
    isDomesticApplicable: false,
    isInternationalApplicable: true,
  },
];

interface OptionDropdownItem {
  id?: string;
  label: string;
  sub?: string;
  badge?: string;
}

export interface ParsedOption {
  title: string;
  codeOrBadge?: string;
  isBadge?: boolean;
  sub?: string;
}

export function parseOptionLabel(
  label: string,
  sub?: string,
  badge?: string,
): ParsedOption {
  if (badge) {
    return {
      title: label,
      codeOrBadge: badge,
      isBadge: true,
      sub,
    };
  }

  // Check for "City (CODE)" or "Name (Details)" pattern: e.g. "Mumbai (BOM)", "Goa (Beaches & Heritage)"
  const parenMatch = label.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    const rawSub = sub || "";
    // Clean out redundant parenthetical code in sub if it repeats the code
    const cleanSub = rawSub.replace(/\s*\([^)]*\)$/, "").trim();
    return {
      title: parenMatch[1].trim(),
      codeOrBadge: parenMatch[2].trim(),
      isBadge: false,
      sub: cleanSub || undefined,
    };
  }

  return {
    title: label,
    sub,
  };
}

// ---------------------------------------------------------------------------
// MINIMAL LUXURY FIELD COMPONENT (Clean Horizontal Floating Options Panel)
// ---------------------------------------------------------------------------

interface ConciergePillFieldProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
  options: OptionDropdownItem[];
  onSelect: (val: string, item?: OptionDropdownItem) => void;
  onChangeText?: (val: string) => void;
  isEditable?: boolean;
  placeholder?: string;
  align?: "left" | "right";
  dropdownWidth?: string;
  className?: string;
}

const ConciergePillField: React.FC<ConciergePillFieldProps> = ({
  icon: IconComponent,
  label,
  value,
  isOpen,
  onToggle,
  onClose,
  options,
  onSelect,
  onChangeText,
  isEditable = false,
  placeholder,
  className = "flex-1 min-w-0",
}) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (fieldRef.current && !fieldRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Dynamically filter options based on user typing (dynamic typing / typeahead)
  const displayedOptions = useMemo(() => {
    if (!isEditable || !value || !value.trim()) {
      return options;
    }

    const query = value.trim().toLowerCase();

    // Find matching items across title, airport code/badge, and subtitle
    const matches = options.filter((opt) => {
      const parsed = parseOptionLabel(opt.label, opt.sub, opt.badge);
      const titleMatch = parsed.title.toLowerCase().includes(query);
      const codeMatch = parsed.codeOrBadge?.toLowerCase().includes(query);
      const subMatch = parsed.sub?.toLowerCase().includes(query);
      const rawLabelMatch = opt.label.toLowerCase().includes(query);
      return titleMatch || codeMatch || subMatch || rawLabelMatch;
    });

    // Check if the typed value is an exact match for one of the options
    const hasExactMatch = options.some((opt) => {
      const parsed = parseOptionLabel(opt.label, opt.sub, opt.badge);
      return (
        parsed.title.toLowerCase() === query ||
        parsed.codeOrBadge?.toLowerCase() === query ||
        opt.label.toLowerCase() === query
      );
    });

    // If the user typed a custom destination/origin that is not an exact match,
    // dynamically prepend a "Custom" suggestion card so they can select it
    if (!hasExactMatch && query.length >= 1) {
      const customItem: OptionDropdownItem = {
        id: `custom-choice-${query}`,
        label: value.trim(),
        sub: `Use "${value.trim()}" as custom location`,
        badge: "Custom",
      };
      return matches.length > 0
        ? [customItem, ...matches]
        : [customItem, ...options];
    }

    return matches.length > 0 ? matches : options;
  }, [options, isEditable, value]);

  return (
    <div ref={fieldRef} className={`group ${className}`}>
      <div
        onClick={() => {
          if (!isOpen) onToggle();
          if (isEditable && inputRef.current) {
            inputRef.current.focus();
          }
        }}
        className={`w-full flex items-center justify-between text-left py-2 px-3 sm:px-3.5 rounded-xl transition-all duration-150 cursor-pointer ${
          isOpen
            ? "bg-white text-neutral-900 ring-1 ring-neutral-300/80 shadow-xs"
            : "hover:bg-neutral-100/70 active:bg-neutral-200/50"
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <IconComponent
            className={`w-4 h-4 transition-colors shrink-0 ${
              isOpen
                ? "text-neutral-800"
                : "text-neutral-400 group-hover:text-neutral-700"
            }`}
            strokeWidth={1.8}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] sm:text-[11.5px] font-sans text-neutral-500 font-normal leading-none mb-1 truncate select-none">
              {label}
            </span>
            {isEditable ? (
              <div className="flex items-center w-full">
                <input
                  ref={inputRef}
                  type="text"
                  aria-label={label}
                  value={value}
                  onChange={(e) => {
                    onChangeText?.(e.target.value);
                    if (!isOpen) onToggle();
                  }}
                  onFocus={(e) => {
                    e.target.select();
                    if (!isOpen) onToggle();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOpen) onToggle();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (value.trim()) {
                        onSelect(value.trim());
                      }
                      onClose?.();
                    }
                  }}
                  placeholder={placeholder || "Where do you want to go?"}
                  className="w-full bg-transparent border-none outline-none p-0 focus:ring-0 text-[13.5px] sm:text-[14px] font-sans font-medium text-neutral-900 tracking-tight truncate leading-tight placeholder:text-neutral-400 placeholder:font-normal cursor-text"
                />
                {value && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeText?.("");
                      inputRef.current?.focus();
                    }}
                    title="Clear input"
                    aria-label={`Clear ${label}`}
                    className="p-0.5 text-neutral-300 hover:text-neutral-600 transition-colors ml-1 shrink-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <span
                className={`text-[13.5px] sm:text-[14px] font-sans font-medium tracking-tight truncate leading-tight select-none ${
                  !value ? "text-neutral-400 font-normal" : "text-neutral-900"
                }`}
              >
                {value || placeholder || "Where do you want to go?"}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={`Toggle ${label} options`}
          className="p-1 -mr-1 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-neutral-800" : ""
            }`}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* Popover Dropdown Menu: Clean Full-Width Options Grid (Shows on Top) */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 bottom-[calc(100%+8px)] z-50 w-full bg-white border border-neutral-200/90 rounded-2xl p-3 sm:p-4 shadow-[0_16px_40px_rgba(0,0,0,0.14)] animate-dropdown-in"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-neutral-100 px-1 select-none">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-sans font-semibold text-neutral-800 uppercase tracking-wider shrink-0">
                {label}
              </span>
              <span className="text-[11.5px] font-sans text-neutral-400 truncate">
                {isEditable && value.trim()
                  ? `• Matching "${value.trim()}"`
                  : "• Select a place or type as you wish"}
              </span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                title="Close"
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 font-medium px-2 py-0.5 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
              >
                <span>Close</span>
                <X
                  className="w-3.5 h-3.5 text-neutral-500 hover:text-neutral-800"
                  strokeWidth={2.2}
                />
              </button>
            )}
          </div>

          {/* Options Grid: Multi-column, Increased Height, NO sliding sideways, Dynamically Filtered */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 max-h-[420px] overflow-y-auto overflow-x-hidden p-0.5">
            {displayedOptions.map((option) => {
              const isSelected =
                value &&
                (value.toLowerCase() === option.label.toLowerCase() ||
                  value.toLowerCase().startsWith(option.label.toLowerCase()) ||
                  option.label.toLowerCase().startsWith(value.toLowerCase()));

              const parsed = parseOptionLabel(
                option.label,
                option.sub,
                option.badge,
              );

              return (
                <button
                  key={option.id || option.label}
                  type="button"
                  onClick={() => {
                    onSelect(option.label, option);
                    onClose?.();
                  }}
                  className={`group/opt relative min-h-[76px] sm:min-h-[82px] p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none flex flex-col justify-center ${
                    isSelected
                      ? "bg-[#002f89]/5 border-[#002f89] ring-1 ring-[#002f89]/30 text-neutral-900"
                      : "bg-neutral-50/50 border-neutral-200/80 hover:bg-neutral-100/70 hover:border-neutral-300 text-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 w-full leading-tight">
                    <span className="text-[14px] sm:text-[14.5px] font-sans font-semibold text-neutral-900 truncate">
                      {parsed.title}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {parsed.codeOrBadge && (
                        <span
                          className={`text-[11px] font-sans leading-none px-2 py-0.5 rounded-md ${
                            parsed.isBadge
                              ? "bg-neutral-200/80 text-neutral-700 font-medium"
                              : "bg-neutral-200/50 text-neutral-600 font-normal"
                          }`}
                        >
                          {parsed.codeOrBadge}
                        </span>
                      )}
                      {isSelected && (
                        <Check
                          className="w-4 h-4 text-[#002f89] shrink-0"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>

                  {parsed.sub && (
                    <span className="text-[11.5px] sm:text-[12px] font-sans text-neutral-500 font-normal leading-tight mt-1.5 truncate">
                      {parsed.sub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// MEMBERS & CHILDREN (BELOW 11 YEARS) PICKER COMPONENT
// ---------------------------------------------------------------------------

interface TravelersPickerProps {
  label?: string;
  adults: number;
  childrenCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChangeAdults: (val: number) => void;
  onChangeChildren: (val: number) => void;
  align?: "left" | "right";
  className?: string;
}

const TravelersPicker: React.FC<TravelersPickerProps> = ({
  label = "Travelers",
  adults,
  childrenCount,
  isOpen,
  onToggle,
  onClose,
  onChangeAdults,
  onChangeChildren,
  className = "flex-1 min-w-0",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const displayValue =
    childrenCount > 0
      ? `${adults} ${adults === 1 ? "Member" : "Members"}, ${childrenCount} ${
          childrenCount === 1 ? "Child" : "Children"
        } (below 11y)`
      : `${adults} ${adults === 1 ? "Member" : "Members"}`;

  return (
    <div ref={containerRef} className={`group ${className}`}>
      <div
        onClick={onToggle}
        className={`w-full flex items-center justify-between text-left py-2 px-3 sm:px-3.5 rounded-xl transition-all duration-150 cursor-pointer ${
          isOpen
            ? "bg-white text-neutral-900 ring-1 ring-neutral-300/80 shadow-xs"
            : "hover:bg-neutral-100/70 active:bg-neutral-200/50"
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <Users
            className={`w-4 h-4 transition-colors shrink-0 ${
              isOpen
                ? "text-neutral-800"
                : "text-neutral-400 group-hover:text-neutral-700"
            }`}
            strokeWidth={1.8}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] sm:text-[11.5px] font-sans text-neutral-500 font-normal leading-none mb-1 truncate select-none">
              {label}
            </span>
            <span className="text-[13.5px] sm:text-[14px] font-sans font-medium text-neutral-900 tracking-tight truncate leading-tight select-none">
              {displayValue}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={`Toggle ${label} options`}
          className="p-1 -mr-1 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-neutral-800" : ""
            }`}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* Popover Panel: Only ask how much members and children (below 11 years) (Shows on Top) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-0 right-0 bottom-[calc(100%+8px)] z-50 w-full bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.14)] animate-dropdown-in"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-neutral-100 px-1 select-none">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-sans font-semibold text-neutral-800 uppercase tracking-wider shrink-0">
                {label}
              </span>
              <span className="text-[11.5px] font-sans text-neutral-400 truncate">
                • Specify number of members & children (below 11 years)
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 font-medium px-2 py-0.5 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
            >
              <span>Close</span>
              <X
                className="w-3.5 h-3.5 text-neutral-500 hover:text-neutral-800"
                strokeWidth={2.2}
              />
            </button>
          </div>

          {/* 2 Focused Counter Cards: Members & Children */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto py-1">
            {/* 1. Members Counter */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/60 hover:bg-neutral-50 transition-colors select-none">
              <div className="pr-3">
                <div className="text-[14px] sm:text-[14.5px] font-sans font-semibold text-neutral-900 leading-tight">
                  Members
                </div>
                <div className="text-[11.5px] font-sans text-neutral-500 mt-0.5">
                  Adults & teens (12+ years)
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={adults <= 1}
                  onClick={() => onChangeAdults(Math.max(1, adults - 1))}
                  aria-label="Decrease members"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-lg font-medium transition-all shadow-xs cursor-pointer select-none"
                >
                  −
                </button>
                <span className="w-7 sm:w-8 text-center text-[15px] sm:text-[16px] font-sans font-bold text-neutral-900 select-none">
                  {adults}
                </span>
                <button
                  type="button"
                  disabled={adults >= 30}
                  onClick={() => onChangeAdults(Math.min(30, adults + 1))}
                  aria-label="Increase members"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-lg font-medium transition-all shadow-xs cursor-pointer select-none"
                >
                  +
                </button>
              </div>
            </div>

            {/* 2. Children Counter (Below 11 years) */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/60 hover:bg-neutral-50 transition-colors select-none">
              <div className="pr-3">
                <div className="text-[14px] sm:text-[14.5px] font-sans font-semibold text-neutral-900 leading-tight">
                  Children
                </div>
                <div className="text-[11.5px] font-sans text-[#002f89] font-medium mt-0.5">
                  Below 11 years
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={childrenCount <= 0}
                  onClick={() =>
                    onChangeChildren(Math.max(0, childrenCount - 1))
                  }
                  aria-label="Decrease children"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-lg font-medium transition-all shadow-xs cursor-pointer select-none"
                >
                  −
                </button>
                <span className="w-7 sm:w-8 text-center text-[15px] sm:text-[16px] font-sans font-bold text-neutral-900 select-none">
                  {childrenCount}
                </span>
                <button
                  type="button"
                  disabled={childrenCount >= 15}
                  onClick={() =>
                    onChangeChildren(Math.min(15, childrenCount + 1))
                  }
                  aria-label="Increase children"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-lg font-medium transition-all shadow-xs cursor-pointer select-none"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100 px-1">
            <span className="text-xs font-sans text-neutral-500">
              Total:{" "}
              <strong className="text-neutral-900 font-semibold">
                {adults + childrenCount}{" "}
                {adults + childrenCount === 1 ? "Traveler" : "Travelers"}
              </strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-md bg-[#002f89] hover:bg-[#00246b] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// MAIN HERO SEARCH CARD COMPONENT
// ---------------------------------------------------------------------------

export const HeroSearchCard: React.FC<HeroSearchCardProps> = ({
  onOpenEnquiry,
  onExploreJourneys,
  defaultTripMode = "domestic",
  className = "",
}) => {
  // 1. Trip Context State (Domestic vs International)
  const [tripMode, setTripMode] = useState<TripMode>(defaultTripMode);

  // 2. Active Service Tab
  const [activeServiceSlug, setActiveServiceSlug] =
    useState<DynamicServiceSlug>("flight-booking");

  // 3. Selections: Origin & Destination
  const [selectedOrigin, setSelectedOrigin] = useState<string>("");
  const [selectedDestination, setSelectedDestination] = useState<string>("");

  // 4. Available Services from Backend API
  const [backendServices, setBackendServices] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);

  // 5. Dynamic Service Types (Primary & Secondary)
  const [selectedPrimaryType, setSelectedPrimaryType] =
    useState<string>("Round-trip");
  const [selectedSecondaryType, setSelectedSecondaryType] =
    useState<string>("Economy Class");

  // 6. Travel Timeline & Travellers
  const [selectedDatePeriod, setSelectedDatePeriod] =
    useState<string>("This Weekend");
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [kidsCount, setKidsCount] = useState<number>(0);

  // 7. UI Dropdown and Submission State
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsScrollRef = useRef<HTMLDivElement>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  // Fetch real backend services on mount
  useEffect(() => {
    let isCancelled = false;
    async function fetchBackendServices() {
      try {
        const res = await fetch(`${apiUrl}/services`, {
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length && !isCancelled) {
            setBackendServices(json.data);
          }
        }
      } catch {
        // Backend unavailable or offline; fallback catalog handles cleanly
      }
    }
    void fetchBackendServices();
    return () => {
      isCancelled = true;
    };
  }, [apiUrl]);

  // Determine applicable services based on backend data and tripMode
  const visibleServices = useMemo(() => {
    const defaultList = ALL_SERVICES_CATALOG.filter((srv) =>
      tripMode === "domestic"
        ? srv.isDomesticApplicable
        : srv.isInternationalApplicable,
    );

    if (backendServices.length > 0) {
      const filteredBackend = filterServicesByTripMode(
        backendServices,
        tripMode,
        selectedDestination,
      );

      const mapped = ALL_SERVICES_CATALOG.filter((catalogItem) => {
        return filteredBackend.some(
          (b) =>
            b.slug
              .toLowerCase()
              .includes(catalogItem.backendSlug.toLowerCase()) ||
            b.name.toLowerCase().includes(catalogItem.label.toLowerCase()),
        );
      });

      // Merge backend-mapped services with standard core catalog services so that essential offerings
      // (such as Train Booking in domestic travel) remain present even if not yet configured in backend DB
      const merged = [...mapped];
      defaultList.forEach((defSrv) => {
        if (!merged.some((m) => m.id === defSrv.id)) {
          merged.push(defSrv);
        }
      });

      // Maintain catalog order and display up to 5 services
      return ALL_SERVICES_CATALOG.filter((cat) =>
        merged.some((m) => m.id === cat.id),
      ).slice(0, 5);
    }

    return defaultList.slice(0, 5);
  }, [backendServices, tripMode, selectedDestination]);

  // Cascading update: if active service is no longer valid in current tripMode, fallback
  useEffect(() => {
    const isCurrentValid = visibleServices.some(
      (s) => s.id === activeServiceSlug,
    );
    if (!isCurrentValid && visibleServices.length > 0) {
      setActiveServiceSlug(visibleServices[0].id);
    }
  }, [visibleServices, activeServiceSlug]);

  // Current service type definitions
  const serviceTypeDefinition = useMemo(() => {
    return getServiceTypeDefinition(activeServiceSlug);
  }, [activeServiceSlug]);

  // Sync primary & secondary types when service changes
  useEffect(() => {
    const def = getServiceTypeDefinition(activeServiceSlug);
    if (def.primaryTypes && def.primaryTypes.length > 0) {
      setSelectedPrimaryType(def.primaryTypes[0].label);
    }
    if (def.secondaryTypes && def.secondaryTypes.length > 0) {
      setSelectedSecondaryType(def.secondaryTypes[0].label);
    }
  }, [activeServiceSlug]);

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

  // Handle switching trip mode (Domestic vs International)
  const handleTripModeChange = (mode: TripMode) => {
    if (mode === tripMode) return;
    setTripMode(mode);
    setOpenDropdown(null);
    setSelectedDestination("");
    setSelectedOrigin("");

    if (mode === "domestic") {
      if (
        activeServiceSlug === "visa-assistance" ||
        activeServiceSlug === "umrah-hajj"
      ) {
        setActiveServiceSlug("flight-booking");
      }
    } else {
      if (
        activeServiceSlug === "train-booking" ||
        activeServiceSlug === "bus-booking"
      ) {
        setActiveServiceSlug("flight-booking");
      }
    }
  };

  const prevDefaultModeRef = useRef(defaultTripMode);
  useEffect(() => {
    if (defaultTripMode && defaultTripMode !== prevDefaultModeRef.current) {
      prevDefaultModeRef.current = defaultTripMode;
      handleTripModeChange(defaultTripMode);
    }
  }, [defaultTripMode]);

  // Options for Dropdowns
  const originOptions: OptionDropdownItem[] = useMemo(() => {
    const filtered = POPULAR_ORIGINS.filter((o) =>
      tripMode === "domestic" ? o.isDomestic : true,
    );
    return filtered.map((o) => ({
      id: o.code,
      label: `${o.name} (${o.code})`,
      sub: o.sub,
    }));
  }, [tripMode]);

  const destinationOptions: OptionDropdownItem[] = useMemo(() => {
    const filtered = POPULAR_DESTINATIONS.filter((d) =>
      tripMode === "domestic" ? d.isDomestic : !d.isDomestic,
    );
    return filtered.map((d) => ({
      id: d.id,
      label: d.name,
      sub: d.country,
    }));
  }, [tripMode]);

  // Comprehensive Flight Origins (Airports + Cities)
  const flightOriginOptions: OptionDropdownItem[] = useMemo(() => {
    const list: OptionDropdownItem[] = [];
    const seen = new Set<string>();

    const hubs = POPULAR_ORIGINS.filter((o) =>
      tripMode === "domestic" ? o.isDomestic : true,
    );
    for (const h of hubs) {
      list.push({
        id: `hub-${h.code}`,
        label: `${h.name} (${h.code})`,
        sub: h.sub || `${h.city}, ${h.country}`,
        badge: h.code,
      });
      seen.add(h.name.toLowerCase());
      seen.add(h.code.toLowerCase());
    }

    const intlHubs = POPULAR_ORIGINS.filter((o) => !o.isDomestic);
    for (const h of intlHubs) {
      if (!seen.has(h.name.toLowerCase()) && !seen.has(h.code.toLowerCase())) {
        list.push({
          id: `hub-${h.code}`,
          label: `${h.name} (${h.code})`,
          sub: h.sub || `${h.city}, ${h.country}`,
          badge: h.code,
        });
        seen.add(h.name.toLowerCase());
      }
    }

    return list;
  }, [tripMode]);

  // Comprehensive Flight Destinations (Destinations + Airport Hubs)
  const flightDestinationOptions: OptionDropdownItem[] = useMemo(() => {
    const list: OptionDropdownItem[] = [];
    const seen = new Set<string>();

    // 1. Destination places from catalog
    const dests = POPULAR_DESTINATIONS.filter((d) =>
      tripMode === "domestic" ? d.isDomestic : !d.isDomestic,
    );
    for (const d of dests) {
      list.push({
        id: d.id,
        label: d.name,
        sub: d.country,
        badge: d.isDomestic ? "Domestic" : "Intl",
      });
      seen.add(d.name.toLowerCase());
    }

    // 2. Airport hubs as destinations (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, etc.)
    const hubs = POPULAR_ORIGINS.filter((o) =>
      tripMode === "domestic" ? o.isDomestic : true,
    );
    for (const h of hubs) {
      const parsedLabel = `${h.name} (${h.code})`;
      if (
        !seen.has(h.name.toLowerCase()) &&
        !seen.has(parsedLabel.toLowerCase())
      ) {
        list.push({
          id: `flyto-${h.code}`,
          label: parsedLabel,
          sub: h.sub || `${h.city}, ${h.country}`,
          badge: h.code,
        });
        seen.add(h.name.toLowerCase());
      }
    }

    // 3. International hubs as destinations
    const intlHubs = POPULAR_ORIGINS.filter((o) => !o.isDomestic);
    for (const h of intlHubs) {
      const parsedLabel = `${h.name} (${h.code})`;
      if (
        !seen.has(h.name.toLowerCase()) &&
        !seen.has(parsedLabel.toLowerCase())
      ) {
        list.push({
          id: `flyto-intl-${h.code}`,
          label: parsedLabel,
          sub: h.sub || `${h.city}, ${h.country}`,
          badge: h.code,
        });
        seen.add(h.name.toLowerCase());
      }
    }

    return list;
  }, [tripMode]);

  const dateOptions: OptionDropdownItem[] = [
    { label: "Tomorrow", sub: "Urgent departure / immediate booking" },
    { label: "This Weekend", sub: "Quick getaway" },
    { label: "Next 15–30 Days", sub: "Planned travel window" },
    { label: "Next 2–3 Months", sub: "Advance booking & best fares" },
    { label: "Flexible Dates", sub: "Customizable date range" },
  ];

  const travellerOptions: OptionDropdownItem[] = [
    { label: "1 Adult", sub: "Solo traveller" },
    { label: "2 Adults", sub: "Couple / Dual travellers" },
    { label: "Family (2 Adults, 1 Child)", sub: "Family package" },
    { label: "Family (2 Adults, 2 Children)", sub: "Spacious family setup" },
    { label: "Small Group (4–6 Adults)", sub: "Shared tour / private vehicle" },
    { label: "Large Group (7+ Travellers)", sub: "Bespoke chartered group" },
  ];

  // Request Quote Handler passing rich prefill into existing flow
  const handleRequestQuote = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    const selectedServiceMeta = ALL_SERVICES_CATALOG.find(
      (s) => s.id === activeServiceSlug,
    );
    const serviceName = selectedServiceMeta?.label || "Travel Enquiry";
    const originDisplay = selectedOrigin.trim() || "Mumbai (BOM)";
    const destinationDisplay =
      selectedDestination.trim() || "All Destinations / Open";

    const summaryParts = [
      `[${tripMode.toUpperCase()}] ${serviceName}`,
      `From: ${originDisplay}`,
      `To: ${destinationDisplay}`,
      selectedPrimaryType ? `Type: ${selectedPrimaryType}` : "",
      selectedSecondaryType ? `Tier/Class: ${selectedSecondaryType}` : "",
      `Date: ${selectedDatePeriod}`,
      `Party: ${adultsCount} Adult(s)${kidsCount > 0 ? `, ${kidsCount} Child(ren)` : ""}`,
    ].filter(Boolean);

    const fullSummary = summaryParts.join(" | ");

    const prefill: EnquiryPrefill = {
      serviceName,
      destination: destinationDisplay,
      origin: originDisplay,
      travelDate: selectedDatePeriod,
      adults: adultsCount,
      children: kidsCount,
      tierOrClass: `${selectedPrimaryType}${selectedSecondaryType ? ` • ${selectedSecondaryType}` : ""}`,
      summaryLabel: fullSummary,
    };

    if (onOpenEnquiry) {
      onOpenEnquiry(fullSummary, prefill);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[1360px] mx-auto select-none ${className}`}
    >
      {/* =======================================================================
          TOP BAR: MINIMAL TRIP CONTEXT TOGGLE (Clean, Subtle, No Excessive AI Badges)
          ======================================================================= */}
      <div className="flex items-center justify-between gap-3 mb-3 px-1 sm:px-2">
        <div className="inline-flex items-center p-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 shadow-md">
          <button
            type="button"
            onClick={() => handleTripModeChange("domestic")}
            className={`flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-4 md:px-5 py-1.5 rounded-full text-xs sm:text-xs md:text-[13px] font-sans transition-all duration-200 cursor-pointer ${
              tripMode === "domestic"
                ? "bg-white text-neutral-950 shadow-xs font-bold"
                : "text-white/90 hover:text-white font-medium hover:bg-white/10"
            }`}
          >
            <span>Domestic</span>
            <span className="hidden sm:inline">&nbsp;Travel</span>
          </button>

          <button
            type="button"
            onClick={() => handleTripModeChange("international")}
            className={`flex items-center gap-1.5 sm:gap-1.5 px-3.5 sm:px-4 md:px-5 py-1.5 rounded-full text-xs sm:text-xs md:text-[13px] font-sans transition-all duration-200 cursor-pointer ${
              tripMode === "international"
                ? "bg-white text-neutral-950 shadow-xs font-bold"
                : "text-white/90 hover:text-white font-medium hover:bg-white/10"
            }`}
          >
            <Globe2
              className={`w-3.5 h-3.5 shrink-0 ${
                tripMode === "international"
                  ? "text-[#002f89]"
                  : "text-white/90"
              }`}
              strokeWidth={2}
            />
            <span>International</span>
            <span className="hidden sm:inline">&nbsp;Travel</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          TOP SERVICE CARDS:
          - RESTORED PREVIOUS DIMENSIONS: min-h-[165px] md:h-[195px] lg:h-[205px]
          - 5 equal columns spanning full width
          - Natural photography with subtle gradient scrim
          - Small outline icon at top-left, clean title and subtitle at bottom
          - No excessive badges, pills, or artificial glow effects
          ======================================================================= */}
      <div className="relative mb-3.5">
        <div
          ref={cardsScrollRef}
          className="flex md:grid md:grid-cols-5 items-stretch gap-2.5 sm:gap-3.5 lg:gap-4 overflow-x-auto md:overflow-visible no-scrollbar scroll-smooth px-1 md:px-0 py-1"
        >
          {visibleServices.map((service) => {
            const IconComponent = service.icon;
            const isActive = activeServiceSlug === service.id;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  setActiveServiceSlug(service.id);
                  setOpenDropdown(null);
                  setIsSubmitted(false);
                }}
                className={`group relative shrink-0 w-[155px] sm:w-[190px] md:w-auto min-h-[140px] sm:min-h-[165px] md:h-[195px] lg:h-[205px] rounded-[18px] sm:rounded-[22px] md:rounded-[26px] transition-all duration-300 ease-out cursor-pointer text-left select-none p-3 sm:p-4 md:p-5 flex flex-col justify-between overflow-hidden ${
                  isActive
                    ? "ring-2 ring-white shadow-[0_12px_28px_rgba(0,0,0,0.35)] -translate-y-1 scale-[1.02]"
                    : "ring-1 ring-white/25 hover:ring-white/70 hover:-translate-y-0.5 opacity-90 hover:opacity-100"
                }`}
              >
                {/* Natural Photographic Background & Contrast Scrim */}
                <img
                  src={service.imageSrc}
                  alt=""
                  className={`absolute inset-0 w-full h-full object-cover ${
                    service.imagePosition || "object-center"
                  } scale-[1.04] transition-transform duration-500 ease-out group-hover:scale-[1.1] pointer-events-none`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 pointer-events-none" />

                {/* Top Row: Small, Consistent Outline Icon (No Boxy Container) */}
                <div className="relative z-10 flex items-center justify-start w-full">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" />
                </div>

                {/* Bottom Row: Simple, Balanced Typography */}
                <div className="relative z-10 w-full mt-auto">
                  <h4 className="text-[13px] sm:text-[15px] md:text-[16px] font-bold text-white leading-tight drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.85)]">
                    {service.label}
                  </h4>
                  <p className="text-white/80 text-[10px] sm:text-xs font-normal mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] truncate">
                    {service.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =======================================================================
          MAIN ADAPTIVE SEARCH BAR:
          - Clean, minimal, and spacious booking form
          - Small outline icons (no circular badge backgrounds)
          - Natural case labels with proper typography hierarchy
          - Perfectly aligned 4 fields + Request a Quote button
          ======================================================================= */}
      <div className="relative z-40 w-full bg-[#FAF8F5]/98 backdrop-blur-md text-[#1E1A17] rounded-[24px] sm:rounded-[28px] p-2.5 sm:px-6 sm:py-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-white/80 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
          {/* Active Service Fields Group */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 divide-y sm:divide-y-0 divide-neutral-200/60 min-w-0">
            {/* 1. FLIGHT BOOKING FIELDS (Dynamic Typing Enabled) */}
            {activeServiceSlug === "flight-booking" && (
              <>
                <ConciergePillField
                  icon={PlaneTakeoff}
                  label="Flying from"
                  value={selectedOrigin}
                  isOpen={openDropdown === "flight-from"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "flight-from" ? null : "flight-from",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={flightOriginOptions}
                  onSelect={(val) => {
                    setSelectedOrigin(val);
                    setOpenDropdown(null);
                  }}
                  isEditable={true}
                  onChangeText={(val) => setSelectedOrigin(val)}
                  placeholder="Where are you flying from?"
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Plane}
                  label="Flying to"
                  value={selectedDestination}
                  isOpen={openDropdown === "flight-to"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "flight-to" ? null : "flight-to",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={flightDestinationOptions}
                  onSelect={(val) => {
                    setSelectedDestination(val);
                    setOpenDropdown(null);
                  }}
                  isEditable={true}
                  onChangeText={(val) => setSelectedDestination(val)}
                  placeholder="Where do you want to go?"
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Layers}
                  label={serviceTypeDefinition.primaryTypeLabel}
                  value={selectedPrimaryType}
                  isOpen={openDropdown === "flight-trip-type"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "flight-trip-type"
                        ? null
                        : "flight-trip-type",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.primaryTypes}
                  onSelect={(val) => {
                    setSelectedPrimaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Users}
                  label={
                    serviceTypeDefinition.secondaryTypeLabel || "Cabin Class"
                  }
                  value={selectedSecondaryType}
                  isOpen={openDropdown === "flight-cabin"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "flight-cabin" ? null : "flight-cabin",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.secondaryTypes || []}
                  onSelect={(val) => {
                    setSelectedSecondaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
              </>
            )}

            {/* 2. CUSTOM HOLIDAYS FIELDS */}
            {activeServiceSlug === "holiday-packages" && (
              <>
                <ConciergePillField
                  icon={Compass}
                  label="Destination"
                  value={selectedDestination}
                  isOpen={openDropdown === "holiday-dest"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "holiday-dest" ? null : "holiday-dest",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={destinationOptions}
                  onSelect={(val) => {
                    setSelectedDestination(val);
                    setOpenDropdown(null);
                  }}
                  isEditable={true}
                  onChangeText={(val) => setSelectedDestination(val)}
                  placeholder="Where do you want to go?"
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={CalendarDays}
                  label="Travel period"
                  value={selectedDatePeriod}
                  isOpen={openDropdown === "holiday-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "holiday-date" ? null : "holiday-date",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={dateOptions}
                  onSelect={(val) => {
                    setSelectedDatePeriod(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <TravelersPicker
                  label="Travelers"
                  adults={adultsCount}
                  childrenCount={kidsCount}
                  isOpen={openDropdown === "holiday-travellers"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "holiday-travellers"
                        ? null
                        : "holiday-travellers",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  onChangeAdults={(val) => setAdultsCount(val)}
                  onChangeChildren={(val) => setKidsCount(val)}
                />
              </>
            )}

            {/* 3. HOTEL & RESORTS FIELDS */}
            {activeServiceSlug === "hotel-booking" && (
              <>
                <ConciergePillField
                  icon={MapPin}
                  label="Destination or city"
                  value={selectedDestination}
                  isOpen={openDropdown === "hotel-dest"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "hotel-dest" ? null : "hotel-dest",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={destinationOptions}
                  onSelect={(val) => {
                    setSelectedDestination(val);
                    setOpenDropdown(null);
                  }}
                  isEditable={true}
                  onChangeText={(val) => setSelectedDestination(val)}
                  placeholder="Where do you want to go?"
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Hotel}
                  label={serviceTypeDefinition.primaryTypeLabel}
                  value={selectedPrimaryType}
                  isOpen={openDropdown === "hotel-tier"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "hotel-tier" ? null : "hotel-tier",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.primaryTypes}
                  onSelect={(val) => {
                    setSelectedPrimaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Layers}
                  label={
                    serviceTypeDefinition.secondaryTypeLabel ||
                    "Room configuration"
                  }
                  value={selectedSecondaryType}
                  isOpen={openDropdown === "hotel-room"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "hotel-room" ? null : "hotel-room",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.secondaryTypes || []}
                  onSelect={(val) => {
                    setSelectedSecondaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={CalendarDays}
                  label="Dates"
                  value={selectedDatePeriod}
                  isOpen={openDropdown === "hotel-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "hotel-date" ? null : "hotel-date",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={dateOptions}
                  onSelect={(val) => {
                    setSelectedDatePeriod(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
              </>
            )}

            {/* 4. TRAIN BOOKING FIELDS (Domestic) */}
            {activeServiceSlug === "train-booking" && (
              <>
                <ConciergePillField
                  icon={Train}
                  label="From station"
                  value={selectedOrigin}
                  isOpen={openDropdown === "train-from"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "train-from" ? null : "train-from",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={originOptions}
                  onSelect={(val) => {
                    setSelectedOrigin(val);
                    setOpenDropdown(null);
                  }}
                  isEditable={true}
                  onChangeText={(val) => setSelectedOrigin(val)}
                  placeholder="Where are you boarding from?"
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Train}
                  label="To station"
                  value={selectedDestination}
                  isOpen={openDropdown === "train-to"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "train-to" ? null : "train-to",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={destinationOptions}
                  onSelect={(val) => {
                    setSelectedDestination(val);
                    setOpenDropdown(null);
                  }}
                  isEditable={true}
                  onChangeText={(val) => setSelectedDestination(val)}
                  placeholder="Where do you want to go?"
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={CalendarDays}
                  label="Travel Date"
                  value={selectedDatePeriod}
                  isOpen={openDropdown === "train-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "train-date" ? null : "train-date",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={dateOptions}
                  onSelect={(val) => {
                    setSelectedDatePeriod(val);
                    setOpenDropdown(null);
                  }}
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Users}
                  label={
                    serviceTypeDefinition.secondaryTypeLabel || "Travel Class"
                  }
                  value={selectedSecondaryType}
                  isOpen={openDropdown === "train-class"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "train-class" ? null : "train-class",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.secondaryTypes || []}
                  onSelect={(val) => {
                    setSelectedSecondaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
              </>
            )}

            {/* 5. BUS BOOKING FIELDS (Domestic) */}
            {activeServiceSlug === "bus-booking" && (
              <>
                <ConciergePillField
                  icon={Bus}
                  label="From city"
                  value={selectedOrigin}
                  isOpen={openDropdown === "bus-from"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "bus-from" ? null : "bus-from",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={originOptions}
                  onSelect={(val) => {
                    setSelectedOrigin(val);
                    setOpenDropdown(null);
                  }}
                  isEditable={true}
                  onChangeText={(val) => setSelectedOrigin(val)}
                  placeholder="Where are you departing from?"
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Bus}
                  label="To city"
                  value={selectedDestination}
                  isOpen={openDropdown === "bus-to"}
                  onToggle={() =>
                    setOpenDropdown(openDropdown === "bus-to" ? null : "bus-to")
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={destinationOptions}
                  onSelect={(val) => {
                    setSelectedDestination(val);
                    setOpenDropdown(null);
                  }}
                  isEditable={true}
                  onChangeText={(val) => setSelectedDestination(val)}
                  placeholder="Where do you want to go?"
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Layers}
                  label={serviceTypeDefinition.primaryTypeLabel}
                  value={selectedPrimaryType}
                  isOpen={openDropdown === "bus-cat"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "bus-cat" ? null : "bus-cat",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.primaryTypes}
                  onSelect={(val) => {
                    setSelectedPrimaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Users}
                  label={
                    serviceTypeDefinition.secondaryTypeLabel ||
                    "Seat preference"
                  }
                  value={selectedSecondaryType}
                  isOpen={openDropdown === "bus-berth"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "bus-berth" ? null : "bus-berth",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.secondaryTypes || []}
                  onSelect={(val) => {
                    setSelectedSecondaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
              </>
            )}

            {/* 6. VISA ASSISTANCE FIELDS (International alternate) */}
            {activeServiceSlug === "visa-assistance" && (
              <>
                <ConciergePillField
                  icon={PassportIcon}
                  label="Destination country"
                  value={selectedDestination}
                  isOpen={openDropdown === "visa-dest"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "visa-dest" ? null : "visa-dest",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={destinationOptions}
                  onSelect={(val) => {
                    setSelectedDestination(val);
                    setOpenDropdown(null);
                  }}
                  isEditable={true}
                  onChangeText={(val) => setSelectedDestination(val)}
                  placeholder="Where do you want to go?"
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Layers}
                  label={serviceTypeDefinition.primaryTypeLabel}
                  value={selectedPrimaryType}
                  isOpen={openDropdown === "visa-cat"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "visa-cat" ? null : "visa-cat",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.primaryTypes}
                  onSelect={(val) => {
                    setSelectedPrimaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={CalendarDays}
                  label="Timeline"
                  value={selectedDatePeriod}
                  isOpen={openDropdown === "visa-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "visa-date" ? null : "visa-date",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={dateOptions}
                  onSelect={(val) => {
                    setSelectedDatePeriod(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Users}
                  label={serviceTypeDefinition.secondaryTypeLabel || "Entry"}
                  value={selectedSecondaryType}
                  isOpen={openDropdown === "visa-entry"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "visa-entry" ? null : "visa-entry",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.secondaryTypes || []}
                  onSelect={(val) => {
                    setSelectedSecondaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
              </>
            )}

            {/* 7. UMRAH & HAJJ FIELDS (International alternate) */}
            {activeServiceSlug === "umrah-hajj" && (
              <>
                <ConciergePillField
                  icon={MosqueIcon}
                  label={serviceTypeDefinition.primaryTypeLabel}
                  value={selectedPrimaryType}
                  isOpen={openDropdown === "pilgrim-cat"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "pilgrim-cat" ? null : "pilgrim-cat",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.primaryTypes}
                  onSelect={(val) => {
                    setSelectedPrimaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={Layers}
                  label={
                    serviceTypeDefinition.secondaryTypeLabel || "Room sharing"
                  }
                  value={selectedSecondaryType}
                  isOpen={openDropdown === "pilgrim-room"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "pilgrim-room" ? null : "pilgrim-room",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={serviceTypeDefinition.secondaryTypes || []}
                  onSelect={(val) => {
                    setSelectedSecondaryType(val);
                    setOpenDropdown(null);
                  }}
                  align="left"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <ConciergePillField
                  icon={CalendarDays}
                  label="Season"
                  value={selectedDatePeriod}
                  isOpen={openDropdown === "pilgrim-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "pilgrim-date" ? null : "pilgrim-date",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  options={dateOptions}
                  onSelect={(val) => {
                    setSelectedDatePeriod(val);
                    setOpenDropdown(null);
                  }}
                  align="right"
                />
                <div className="h-8 w-px bg-neutral-200/80 mx-2 hidden sm:block shrink-0" />
                <TravelersPicker
                  label="Pilgrims"
                  adults={adultsCount}
                  childrenCount={kidsCount}
                  isOpen={openDropdown === "pilgrim-count"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "pilgrim-count" ? null : "pilgrim-count",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  onChangeAdults={(val) => setAdultsCount(val)}
                  onChangeChildren={(val) => setKidsCount(val)}
                />
              </>
            )}
          </div>

          {/* Prominent, clean Request a Quote Button (Navbar Royal Blue, exact rounded-md corner radius as navbar Plan My Trip) */}
          <button
            type="button"
            onClick={handleRequestQuote}
            className="w-full sm:w-auto h-[44px] sm:h-[48px] lg:h-[50px] px-5 sm:px-7 lg:px-8 rounded-md bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white font-medium text-[13px] sm:text-[14px] lg:text-[14.5px] flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(0,47,137,0.25)] hover:shadow-[0_6px_20px_rgba(0,47,137,0.35)] cursor-pointer whitespace-nowrap shrink-0 sm:ml-3 select-none"
          >
            {isSubmitted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Quote Requested</span>
              </>
            ) : (
              <>
                <span>Request a Quote</span>
                <ArrowRight
                  className="w-4 h-4 text-white shrink-0"
                  strokeWidth={2}
                />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSearchCard;
