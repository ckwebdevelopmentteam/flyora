"use client";

import { useServicesCatalog } from "../lib/use-services-catalog";
import { resolveService } from "../lib/service-catalog";
import { serviceImage } from "../lib/service-visuals";
import type { ServiceSummary } from "@flyora/types";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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
  ShieldCheck,
  X,
  Search,
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
  activeServiceSlug?: DynamicServiceSlug;
  onServiceChange?: (slug: DynamicServiceSlug) => void;
  hideTopCards?: boolean;
  hideTripModeToggle?: boolean;
  fullWidth?: boolean;
  unavailable?: boolean;
}

export type DynamicServiceSlug =
  | "flight-booking"
  | "holiday-packages"
  | "hotel-booking"
  | "visa-assistance"
  | "umrah-hajj"
  | "train-booking"
  | "bus-booking"
  | "passport-assistance"
  | "travel-insurance"
  | (string & {});

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
    imageSrc: "/services/flight-booking.webp",
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
    imageSrc: "/services/custom-holidays.webp",
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
    imageSrc: "/services/hotel-booking.webp",
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
    imageSrc: "/services/train-booking.webp",
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
    imageSrc: "/services/bus-booking.webp",
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
    imageSrc: "/services/visa-assistance.webp",
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
    imageSrc: "/services/umrah-packages.webp",
    imagePosition: "object-[82%_45%]",
    icon: MosqueIcon,
    isDomesticApplicable: false,
    isInternationalApplicable: true,
  },
  {
    id: "passport-assistance",
    backendSlug: "passport-assistance",
    label: "Passport Assistance",
    subtitle: "Fast-Track Services",
    imageSrc: "/services/passport-service.webp",
    imagePosition: "object-center",
    icon: PassportIcon,
    isDomesticApplicable: false,
    isInternationalApplicable: true,
  },
  {
    id: "travel-insurance",
    backendSlug: "travel-insurance",
    label: "Travel Insurance",
    subtitle: "Medical & Luggage",
    imageSrc: "/services/travel-insurance.webp",
    imagePosition: "object-center",
    icon: ShieldCheck,
    isDomesticApplicable: true,
    isInternationalApplicable: true,
  },
];

const DEFAULT_HERO_SERVICES: ServiceSummary[] = [
  {
    id: "f321ad14-df06-47b3-904b-8b239bf95b58",
    name: "Flight Booking",
    slug: "flight-booking",
    isDomestic: true,
    isInternational: true,
    isActive: true,
    displayOrder: 1,
    minMarginPercent: 5,
    description: "Best fares & routes",
  },
  {
    id: "880a9c17-1bdd-42cf-bb3d-62242b9446ff",
    name: "Holiday Packages",
    slug: "holiday-packages",
    isDomestic: true,
    isInternational: true,
    isActive: true,
    displayOrder: 2,
    minMarginPercent: 12,
    description: "Tailored journeys",
  },
  {
    id: "7da65aaf-df81-4943-b260-e84f62f5eaba",
    name: "Hotel Booking",
    slug: "hotel-booking",
    isDomestic: true,
    isInternational: true,
    isActive: true,
    displayOrder: 3,
    minMarginPercent: 10,
    description: "Luxury stays & villas",
  },
  {
    id: "969ee59d-1b58-4f37-866e-46c2b3e88542",
    name: "Umrah & Hajj",
    slug: "umrah-hajj",
    isDomestic: false,
    isInternational: true,
    isActive: true,
    displayOrder: 4,
    minMarginPercent: 15,
    description: "Spiritual journeys",
  },
  {
    id: "97acd01b-ae30-4501-897e-8d953f65d20d",
    name: "Visa Assistance",
    slug: "visa-assistance",
    isDomestic: false,
    isInternational: true,
    isActive: true,
    displayOrder: 5,
    minMarginPercent: 20,
    description: "Hassle-free approvals",
  },
  {
    id: "9a58c680-4664-4255-a4a3-02edad8df08e",
    name: "Passport Assistance",
    slug: "escort-parking",
    isDomestic: false,
    isInternational: true,
    isActive: true,
    displayOrder: 6,
    minMarginPercent: 10,
    description: "Fast-Track Services",
  },
  {
    id: "0855e153-59d5-4464-a91c-e7b9f955e0a2",
    name: "Travel insurance",
    slug: "travel-insurance",
    isDomestic: true,
    isInternational: true,
    isActive: true,
    displayOrder: 7,
    minMarginPercent: 10,
    description: "Medical & Luggage",
  },
  {
    id: "02601693-e1d3-4d25-8e44-75b6c5e58b4b",
    name: "Bus & Train Booking",
    slug: "bus-booking",
    isDomestic: true,
    isInternational: false,
    isActive: true,
    displayOrder: 0,
    minMarginPercent: 10,
    description: "Comfort travel & fast rail",
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
  const parenMatch = label.match(/^(.*?)\s*\(([^)]+)\)$/);
  const rawSub = sub || "";
  // Clean out redundant parenthetical code in sub if it repeats the code
  const cleanSub = rawSub.replace(/\s*\([^)]*\)$/, "").trim();

  if (badge) {
    const title = parenMatch ? parenMatch[1].trim() : label;
    return {
      title,
      codeOrBadge: badge,
      isBadge: true,
      sub: cleanSub || undefined,
    };
  }

  // Check for "City (CODE)" or "Name (Details)" pattern: e.g. "Mumbai (BOM)", "Goa (Beaches & Heritage)"
  if (parenMatch) {
    const inside = parenMatch[2].trim();
    const isCode = inside.length <= 5 && /^[A-Z0-9]+$/i.test(inside);
    return {
      title: isCode ? parenMatch[1].trim() : label,
      codeOrBadge: isCode ? inside : undefined,
      isBadge: isCode,
      sub: isCode ? cleanSub || undefined : sub,
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
      const target = e.target as Node;
      if (fieldRef.current && !fieldRef.current.contains(target)) {
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

      {/* Popover Dropdown Menu: Clean Full-Width Options Grid / Mobile Bottom Sheet */}
      {isOpen && (
        <>
          {/* Mobile backdrop to dismiss cleanly and prevent navbar overlap confusion */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] sm:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          <div
            role="listbox"
            aria-label={label}
            className="fixed inset-x-0 bottom-0 z-[100] max-h-[82vh] rounded-t-[22px] bg-white p-4 pb-7 shadow-[0_-12px_40px_rgba(0,0,0,0.32)] flex flex-col sm:absolute sm:inset-auto sm:left-0 sm:right-0 sm:bottom-[calc(100%+8px)] sm:z-50 sm:w-full sm:max-h-[440px] sm:rounded-2xl sm:p-4 sm:border sm:border-neutral-200/90 sm:shadow-[0_16px_40px_rgba(0,0,0,0.14)] animate-dropdown-in"
          >
            {/* Mobile Drag Handle */}
            <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />

            {/* Header Row */}
            <div className="flex items-center justify-between pb-2.5 mb-2 sm:mb-3 border-b border-neutral-100 px-1 select-none shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-sans font-bold sm:font-semibold text-neutral-900 sm:text-neutral-800 uppercase tracking-wider shrink-0">
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
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 font-medium px-2 py-1 rounded-full sm:rounded-md bg-neutral-100 sm:bg-transparent hover:bg-neutral-200 sm:hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                >
                  <span className="hidden sm:inline">Close</span>
                  <X
                    className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-neutral-600 sm:text-neutral-500"
                    strokeWidth={2.2}
                  />
                </button>
              )}
            </div>

            {/* Mobile In-Sheet Search (Quick typeahead when sheet is open on phone) */}
            {isEditable && (
              <div className="sm:hidden mb-2.5 relative flex items-center bg-neutral-100/90 rounded-xl px-3 py-2 border border-neutral-200/60 shrink-0">
                <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
                <input
                  type="text"
                  aria-label={`Search ${label}`}
                  value={value}
                  onChange={(e) => onChangeText?.(e.target.value)}
                  placeholder={
                    placeholder || `Search ${label.toLowerCase()}...`
                  }
                  className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 placeholder:text-neutral-400 font-medium p-0 focus:ring-0"
                />
                {value && (
                  <button
                    type="button"
                    onClick={() => onChangeText?.("")}
                    className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Options List / Grid: 1-column readable layout on mobile, multi-column on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 max-h-[52vh] sm:max-h-[360px] overflow-y-auto overflow-x-hidden p-0.5 overscroll-contain">
              {displayedOptions.map((option) => {
                const isSelected =
                  value &&
                  (value.toLowerCase() === option.label.toLowerCase() ||
                    value
                      .toLowerCase()
                      .startsWith(option.label.toLowerCase()) ||
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
                    className={`group/opt relative min-h-[58px] sm:min-h-[82px] px-3.5 py-2.5 sm:p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none flex sm:flex-col justify-between sm:justify-center items-center sm:items-stretch gap-2.5 sm:gap-0 ${
                      isSelected
                        ? "bg-[#002f89]/5 border-[#002f89] ring-1 ring-[#002f89]/30 text-neutral-900"
                        : "bg-neutral-50/60 border-neutral-200/80 hover:bg-neutral-100/70 hover:border-neutral-300 text-neutral-700"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:justify-between w-full leading-tight">
                        <span className="text-[14px] sm:text-[14.5px] font-sans font-semibold text-neutral-900 truncate">
                          {parsed.title}
                        </span>

                        {/* Desktop badge & checkmark */}
                        <div className="hidden sm:flex items-center gap-1 shrink-0">
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
                        <span className="text-[11.5px] sm:text-[12px] font-sans text-neutral-500 font-normal leading-tight mt-0.5 sm:mt-1.5 block truncate">
                          {parsed.sub}
                        </span>
                      )}
                    </div>

                    {/* Mobile Right-side Badge & Selected Check */}
                    <div className="flex sm:hidden items-center gap-2 shrink-0">
                      {parsed.codeOrBadge && (
                        <span
                          className={`text-xs font-sans font-semibold px-2 py-1 rounded-md ${
                            isSelected
                              ? "bg-[#002f89] text-white"
                              : "bg-neutral-200/70 text-neutral-700"
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
                  </button>
                );
              })}
            </div>
          </div>
        </>
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
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
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

      {/* Popover / Mobile Bottom Sheet for Travelers & Members */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] sm:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-label={label}
            className="fixed inset-x-0 bottom-0 z-[100] max-h-[85vh] rounded-t-[22px] bg-white p-4 pb-7 shadow-[0_-12px_40px_rgba(0,0,0,0.32)] flex flex-col sm:absolute sm:inset-auto sm:left-0 sm:right-0 sm:bottom-[calc(100%+8px)] sm:z-50 sm:w-full sm:rounded-2xl sm:p-5 sm:border sm:border-neutral-200/90 sm:shadow-[0_16px_40px_rgba(0,0,0,0.14)] animate-dropdown-in"
          >
            {/* Mobile Drag Handle */}
            <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />

            {/* Header Row */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-neutral-100 px-1 select-none shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-sans font-bold sm:font-semibold text-neutral-900 sm:text-neutral-800 uppercase tracking-wider shrink-0">
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
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 font-medium px-2 py-1 rounded-full sm:rounded-md bg-neutral-100 sm:bg-transparent hover:bg-neutral-200 sm:hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
              >
                <span className="hidden sm:inline">Close</span>
                <X
                  className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-neutral-600 sm:text-neutral-500"
                  strokeWidth={2.2}
                />
              </button>
            </div>

            {/* 2 Focused Counter Cards: Members & Children */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto py-1 w-full">
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
                className="px-5 py-2 sm:py-1.5 rounded-xl sm:rounded-md bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </>
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
  defaultTripMode = "international",
  className = "",
  activeServiceSlug: propActiveServiceSlug,
  onServiceChange,
  hideTopCards = false,
  hideTripModeToggle = false,
  fullWidth = false,
  unavailable = false,
}) => {
  // 1. Trip Context State (Domestic vs International)
  const [tripMode, setTripMode] = useState<TripMode>(defaultTripMode);

  // 2. Active Service Tab (Controlled or Uncontrolled)
  const [internalActiveServiceSlug, setInternalActiveServiceSlug] =
    useState<DynamicServiceSlug>(propActiveServiceSlug || "flight-booking");

  useEffect(() => {
    if (propActiveServiceSlug) {
      setInternalActiveServiceSlug(propActiveServiceSlug);
    }
  }, [propActiveServiceSlug]);

  const activeServiceSlug = propActiveServiceSlug || internalActiveServiceSlug;

  const setActiveServiceSlug = useCallback(
    (slug: DynamicServiceSlug) => {
      setInternalActiveServiceSlug(slug);
      onServiceChange?.(slug);
    },
    [onServiceChange],
  );

  // 3. Selections: Origin & Destination
  const [selectedOrigin, setSelectedOrigin] = useState<string>("");
  const [selectedDestination, setSelectedDestination] = useState<string>("");

  // 4. Available Services from Backend API
  const {
    services: backendServices,
    loaded,
    error,
    retry,
  } = useServicesCatalog();
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
  const isSubmitted = false;
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollCardsLeft, setCanScrollCardsLeft] = useState(false);
  const [canScrollCardsRight, setCanScrollCardsRight] = useState(false);

  const effectiveServices =
    backendServices && backendServices.length > 0
      ? backendServices
      : DEFAULT_HERO_SERVICES;

  const visibleServices = useMemo(
    () =>
      filterServicesByTripMode(
        effectiveServices,
        tripMode,
        selectedDestination,
      ).map((service) => {
        const template = ALL_SERVICES_CATALOG.find((item) =>
          resolveService([service], item.backendSlug),
        );
        return {
          ...ALL_SERVICES_CATALOG[0],
          ...template,
          id: service.slug,
          backendSlug: service.slug,
          label: service.name,
          subtitle:
            service.description ||
            template?.subtitle ||
            "Tailored travel services",
          imageSrc:
            service.imageUrl ||
            template?.imageSrc ||
            serviceImage(service.slug),
        };
      }),
    [effectiveServices, tripMode, selectedDestination],
  );

  const hasMoreThanSeven = visibleServices.length > 7;

  useEffect(() => {
    if (hasMoreThanSeven) {
      setCanScrollCardsRight(true);
    }
  }, [hasMoreThanSeven]);

  const updateCardsScrollState = useCallback(() => {
    const el = cardsScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (scrollWidth > clientWidth) {
      setCanScrollCardsLeft(scrollLeft > 6);
      setCanScrollCardsRight(scrollLeft + clientWidth < scrollWidth - 6);
    } else {
      setCanScrollCardsLeft(scrollLeft > 6);
      setCanScrollCardsRight(hasMoreThanSeven);
    }
  }, [hasMoreThanSeven]);

  useEffect(() => {
    const el = cardsScrollRef.current;
    if (!el) return;
    updateCardsScrollState();
    el.addEventListener("scroll", updateCardsScrollState, { passive: true });
    window.addEventListener("resize", updateCardsScrollState, {
      passive: true,
    });
    return () => {
      el.removeEventListener("scroll", updateCardsScrollState);
      window.removeEventListener("resize", updateCardsScrollState);
    };
  }, [updateCardsScrollState, visibleServices]);

  const scrollCards = (direction: "left" | "right") => {
    const el = cardsScrollRef.current;
    if (!el) return;
    const distance = Math.max(180, Math.round(el.clientWidth * 0.7));
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const selectedBackendService = resolveService(
    effectiveServices,
    activeServiceSlug,
  );
  // Cascading update: if active service is no longer valid in current tripMode, fallback (uncontrolled only)
  useEffect(() => {
    if (propActiveServiceSlug || hideTopCards) return;
    const isCurrentValid = visibleServices.some(
      (s) => s.id === activeServiceSlug,
    );
    if (!isCurrentValid && visibleServices.length > 0) {
      setActiveServiceSlug(visibleServices[0].id);
    }
  }, [
    visibleServices,
    activeServiceSlug,
    propActiveServiceSlug,
    hideTopCards,
    setActiveServiceSlug,
  ]);

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
    if (!loaded || error || unavailable || !selectedBackendService) return;

    const serviceName = selectedBackendService.name;
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
      serviceId: selectedBackendService.id,
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
      onOpenEnquiry(selectedBackendService.id, prefill);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full ${fullWidth ? "max-w-none" : "max-w-[1360px] mx-auto"} select-none ${className}`}
    >
      {error && (
        <p role="alert" className="p-3 text-sm">
          Services could not load.{" "}
          <button
            type="button"
            onClick={() => void retry()}
            className="underline"
          >
            Try again
          </button>
        </p>
      )}
      {/* =======================================================================
          TOP BAR: MINIMAL TRIP CONTEXT TOGGLE (Clean, Subtle, No Excessive AI Badges)
          ======================================================================= */}
      {!hideTripModeToggle && (
        <div className="flex items-center justify-between gap-3 mb-3 px-1 md:px-0 antialiased">
          <div className="inline-flex items-center p-1 rounded-[14px] bg-black/80 backdrop-blur-sm border border-white/25 shadow-md">
            <button
              type="button"
              aria-label="International Travel"
              onClick={() => handleTripModeChange("international")}
              className={`flex items-center gap-2 px-4 sm:px-4.5 md:px-5 py-1.5 rounded-[10px] text-xs sm:text-[13px] md:text-sm font-sans transition-all duration-200 cursor-pointer ${
                tripMode === "international"
                  ? "bg-white text-neutral-900 shadow-sm font-semibold"
                  : "text-white hover:text-white font-medium hover:bg-white/10"
              }`}
            >
              <Globe2
                className={`w-4 h-4 shrink-0 ${
                  tripMode === "international" ? "text-[#002f89]" : "text-white"
                }`}
                strokeWidth={2.2}
              />
              <span className="tracking-normal">International</span>
              <span className="hidden sm:inline tracking-normal">
                &nbsp;Travel
              </span>
            </button>

            <button
              type="button"
              aria-label="Domestic Travel"
              onClick={() => handleTripModeChange("domestic")}
              className={`flex items-center gap-1.5 px-4 sm:px-4.5 md:px-5 py-1.5 rounded-[10px] text-xs sm:text-[13px] md:text-sm font-sans transition-all duration-200 cursor-pointer ${
                tripMode === "domestic"
                  ? "bg-white text-neutral-900 shadow-sm font-semibold"
                  : "text-white hover:text-white font-medium hover:bg-white/10"
              }`}
            >
              <span className="tracking-normal">Domestic</span>
              <span className="hidden sm:inline tracking-normal">
                &nbsp;Travel
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
          TOP SERVICE CARDS:
          - Automatically scales to fit up to 7 services in ONE SINGLE ROW on desktop:
            md:grid md:grid-flow-col md:auto-cols-fr
          - If more than 7 services are present, scrolls horizontally with
            left & right navigation arrow buttons
          - Height and card typography scale gracefully depending on count
          ======================================================================= */}
      {!hideTopCards && (
        <div className="relative mb-3.5 group/cardstrack">
          {/* Floating Left Navigation Button */}
          {hasMoreThanSeven && canScrollCardsLeft && (
            <button
              type="button"
              onClick={() => scrollCards("left")}
              aria-label="Scroll services left"
              className="absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ChevronLeft
                className="w-4 h-4 sm:w-5 sm:h-5"
                strokeWidth={2.5}
              />
            </button>
          )}

          <div
            ref={cardsScrollRef}
            className={`flex items-stretch gap-2 sm:gap-2.5 lg:gap-3 overflow-x-auto no-scrollbar scroll-smooth px-1 md:px-0 pt-3 pb-2.5 md:py-1 ${
              hasMoreThanSeven
                ? ""
                : "md:grid md:grid-flow-col md:auto-cols-fr md:overflow-visible"
            }`}
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
                  }}
                  className={`group relative shrink-0 ${
                    hasMoreThanSeven
                      ? "w-[145px] sm:w-[170px] md:w-[180px] lg:w-[190px]"
                      : "w-[145px] sm:w-[170px] md:w-auto md:min-w-0"
                  } min-h-[140px] sm:min-h-[155px] md:h-[180px] lg:h-[190px] rounded-[14px] transition-all duration-300 ease-out cursor-pointer text-left select-none p-3 sm:p-3.5 md:p-4 flex flex-col justify-between overflow-hidden ${
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
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" />
                  </div>

                  {/* Bottom Row: Simple, Balanced Typography */}
                  <div className="relative z-10 w-full mt-auto">
                    <h4 className="text-[12.5px] sm:text-[13.5px] md:text-[14px] lg:text-[15px] font-bold text-white leading-snug drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.85)] line-clamp-2">
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

          {/* Floating Right Navigation Button */}
          {hasMoreThanSeven && canScrollCardsRight && (
            <button
              type="button"
              onClick={() => scrollCards("right")}
              aria-label="Scroll services right"
              className="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ChevronRight
                className="w-4 h-4 sm:w-5 sm:h-5"
                strokeWidth={2.5}
              />
            </button>
          )}
        </div>
      )}

      {/* =======================================================================
          MAIN ADAPTIVE SEARCH BAR:
          - Clean, minimal, and spacious booking form
          - Small outline icons (no circular badge backgrounds)
          - Natural case labels with proper typography hierarchy
          - Perfectly aligned 4 fields + Request a Quote button
          ======================================================================= */}
      <div className="relative z-40 w-full bg-[#FAF8F5]/98 sm:backdrop-blur-md text-[#1E1A17] rounded-[14px] p-2.5 sm:px-6 sm:py-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-white/80 transition-all duration-300">
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

            {/* 8. PASSPORT ASSISTANCE FIELDS */}
            {(activeServiceSlug === "passport-assistance" ||
              activeServiceSlug === "escort-parking") && (
              <>
                <ConciergePillField
                  icon={PassportIcon}
                  label={
                    serviceTypeDefinition.primaryTypeLabel || "Service Scheme"
                  }
                  value={selectedPrimaryType}
                  isOpen={openDropdown === "passport-cat"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "passport-cat" ? null : "passport-cat",
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
                    "Application Urgency"
                  }
                  value={selectedSecondaryType}
                  isOpen={openDropdown === "passport-urgency"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "passport-urgency"
                        ? null
                        : "passport-urgency",
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
                  label="Target Date"
                  value={selectedDatePeriod}
                  isOpen={openDropdown === "passport-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "passport-date" ? null : "passport-date",
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
                  label="Applicants"
                  adults={adultsCount}
                  childrenCount={kidsCount}
                  isOpen={openDropdown === "passport-count"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "passport-count"
                        ? null
                        : "passport-count",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  onChangeAdults={(val) => setAdultsCount(val)}
                  onChangeChildren={(val) => setKidsCount(val)}
                />
              </>
            )}

            {/* 9. TRAVEL INSURANCE FIELDS */}
            {activeServiceSlug === "travel-insurance" && (
              <>
                <ConciergePillField
                  icon={ShieldCheck}
                  label={
                    serviceTypeDefinition.primaryTypeLabel ||
                    "Destination Coverage"
                  }
                  value={selectedPrimaryType}
                  isOpen={openDropdown === "insurance-region"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "insurance-region"
                        ? null
                        : "insurance-region",
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
                    "Policy Plan Tier"
                  }
                  value={selectedSecondaryType}
                  isOpen={openDropdown === "insurance-plan"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "insurance-plan"
                        ? null
                        : "insurance-plan",
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
                  label="Trip Duration"
                  value={selectedDatePeriod}
                  isOpen={openDropdown === "insurance-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "insurance-date"
                        ? null
                        : "insurance-date",
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
                  isOpen={openDropdown === "insurance-count"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "insurance-count"
                        ? null
                        : "insurance-count",
                    )
                  }
                  onClose={() => setOpenDropdown(null)}
                  onChangeAdults={(val) => setAdultsCount(val)}
                  onChangeChildren={(val) => setKidsCount(val)}
                />
              </>
            )}

            {/* 10. UNIVERSAL FALLBACK FOR OTHER DYNAMIC SERVICES */}
            {![
              "flight-booking",
              "holiday-packages",
              "hotel-booking",
              "train-booking",
              "bus-booking",
              "visa-assistance",
              "umrah-hajj",
              "passport-assistance",
              "escort-parking",
              "travel-insurance",
            ].includes(activeServiceSlug) && (
              <>
                <ConciergePillField
                  icon={MapPin}
                  label="Destination or City"
                  value={selectedDestination}
                  isOpen={openDropdown === "fallback-dest"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "fallback-dest" ? null : "fallback-dest",
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
                  isOpen={openDropdown === "fallback-primary"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "fallback-primary"
                        ? null
                        : "fallback-primary",
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
                  label="Target Date"
                  value={selectedDatePeriod}
                  isOpen={openDropdown === "fallback-date"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "fallback-date" ? null : "fallback-date",
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
                  isOpen={openDropdown === "fallback-count"}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === "fallback-count"
                        ? null
                        : "fallback-count",
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
            disabled={
              !loaded || error || unavailable || !selectedBackendService
            }
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
