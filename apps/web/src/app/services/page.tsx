"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import {
  EnquiryModal,
  type EnquiryPrefill,
} from "../../components/EnquiryModal";
import { FloatingWhatsApp } from "../../components/FloatingWhatsApp";
import CarouselCards from "@/components/ui/carousel-cards";
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
  Compass,
  CheckCircle2,
  Play,
  MessageCircle,
  FileText,
  ShieldCheck,
  Clock,
  Award,
  Building2,
  UserCheck,
  CreditCard,
  FileCheck2,
} from "lucide-react";

// Pixel-perfect SVG icons matching the reference design
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

interface OptionItem {
  label: string;
  sub?: string;
}

interface ServiceHeroConfig {
  id: string;
  serviceId: string;
  name: string;
  subtitle: string;
  badge: string;
  heroHeadline: string;
  heroSubheadline: string;
  imageSrc: string;
  imagePosition?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const HERO_SERVICES: ServiceHeroConfig[] = [
  {
    id: "custom-holidays",
    serviceId: "Holiday Packages",
    name: "Custom Holidays",
    subtitle: "International & Local",
    badge: "Tailored Luxury",
    heroHeadline: "Bespoke Luxury Holiday Planning",
    heroSubheadline:
      "Private luxury itineraries, 5-star villas, and hand-curated experiences worldwide.",
    imageSrc: "/services/custom-holidays.jpg",
    imagePosition: "object-[72%_50%]",
    icon: VacationPlaneIcon,
  },
  {
    id: "visa-assistance",
    serviceId: "Visa Assistance",
    name: "Visa Assistance",
    subtitle: "Hassle-free Process",
    badge: "Fast-Track",
    heroHeadline: "Hassle-Free Global Visa Approvals",
    heroSubheadline:
      "Express appointment booking, document audit, and 99.2% approval success for 100+ countries.",
    imageSrc: "/services/visa-assistance.jpg",
    imagePosition: "object-[30%_55%]",
    icon: PassportIcon,
  },
  {
    id: "flight-booking",
    serviceId: "Flight Booking",
    name: "Flight Booking",
    subtitle: "Best Fares",
    badge: "Best Fares",
    heroHeadline: "Commercial & Business Air Ticketing",
    heroSubheadline:
      "Access unpublished corporate partner fares, flexible routing, and 24/7 flight rebooking.",
    imageSrc: "/services/flight-booking.jpg",
    imagePosition: "object-[65%_45%]",
    icon: Plane,
  },
  {
    id: "train-booking",
    serviceId: "Train Booking",
    name: "Train Booking",
    subtitle: "Easy & Fast",
    badge: "Scenic Rail",
    heroHeadline: "Confirmed Berths & Iconic Rail Journeys",
    heroSubheadline:
      "Express reservations, tatkal priority bookings, and panoramic luxury tourist rail tickets.",
    imageSrc: "/services/train-booking.jpg",
    imagePosition: "object-[70%_55%]",
    icon: Train,
  },
  {
    id: "bus-booking",
    serviceId: "Bus Booking",
    name: "Bus Booking",
    subtitle: "Comfort Travel",
    badge: "Highway Comfort",
    heroHeadline: "Luxury Volvo & Sleeper Coach Travel",
    heroSubheadline:
      "Top-tier AC multi-axle coaches, verified city boarding lounges, and live GPS tracking links.",
    imageSrc: "/services/bus-booking.jpg",
    imagePosition: "object-[24%_65%]",
    icon: Bus,
  },
  {
    id: "umrah-packages",
    serviceId: "Umrah & Hajj",
    name: "Umrah Packages",
    subtitle: "Sacred Pilgrimages",
    badge: "Spiritual Journey",
    heroHeadline: "Sacred & Blessed Umrah Pilgrimages",
    heroSubheadline:
      "Hotels steps from the Holy Haram courtyard, Saudi e-visas & private AC vehicle transit.",
    imageSrc: "/services/umrah-packages.jpg",
    imagePosition: "object-[82%_45%]",
    icon: MosqueIcon,
  },
  {
    id: "hajj-packages",
    serviceId: "Umrah & Hajj",
    name: "Hajj Packages",
    subtitle: "Spiritual Journeys",
    badge: "The Holy Pillar",
    heroHeadline: "The Sacred Journey of a Lifetime",
    heroSubheadline:
      "Comprehensive guided pilgrimage with deluxe European air-conditioned Mina camps & guidance.",
    imageSrc: "/services/hajj-packages.jpg",
    imagePosition: "object-[50%_50%]",
    icon: MosqueIcon,
  },
];

// Curated concierge options for each of the 7 services
const HOLIDAY_DESTINATIONS: OptionItem[] = [
  { label: "Switzerland & The Alps", sub: "Scenic rail, chalets & peaks" },
  { label: "Maldives Overwater Sanctuary", sub: "Private villa & seaplane" },
  { label: "Bali Ubud & Seminyak", sub: "Rainforest villas & beaches" },
  { label: "Dubai Family Luxury", sub: "VIP Burj & desert safari" },
  { label: "Paris & French Riviera", sub: "Haute culture & coastal charm" },
  { label: "Kyoto & Tokyo, Japan", sub: "Ryokans, onsens & bullet train" },
];

const HOLIDAY_MONTHS: OptionItem[] = [
  { label: "Nov – Dec 2026", sub: "Winter holiday season" },
  { label: "Next 30 Days", sub: "Immediate departure" },
  { label: "Jan – Mar 2027", sub: "Early spring getaway" },
  { label: "Summer 2027", sub: "Peak summer vacations" },
  { label: "Flexible Dates", sub: "Best rates calendar" },
];

const HOLIDAY_TRAVELERS: OptionItem[] = [
  { label: "Couple (2 Adults)" },
  { label: "Solo Traveler (1 Adult)" },
  { label: "Family (2 Adults, 2 Children)" },
  { label: "Small Group (3–5 Adults)" },
  { label: "Large Group (6+ Persons)" },
];

const VISA_COUNTRIES: OptionItem[] = [
  {
    label: "Schengen Europe (29 Countries)",
    sub: "France, Italy, Swiss, Germany & more",
  },
  { label: "United Kingdom (UK)", sub: "Standard Visitor Visa 6 Months" },
  { label: "United States (US B1/B2)", sub: "Slot booking & DS-160 review" },
  { label: "Dubai & UAE Tourist", sub: "30 / 60 Days Express eVisa" },
  { label: "Saudi Arabia Tourist/Umrah", sub: "Multiple entry 1-year eVisa" },
  { label: "Singapore & Malaysia", sub: "Quick paper & eVisa filing" },
];

const VISA_DATES: OptionItem[] = [
  { label: "Within 30 Days", sub: "Urgent slot assistance" },
  { label: "Express 7–10 Days", sub: "Fast-track processing" },
  { label: "Next 30–60 Days", sub: "Standard advance filing" },
  { label: "Flexible Dates", sub: "Planning ahead" },
];

const VISA_APPLICANTS: OptionItem[] = [
  { label: "Single Applicant (1 Person)" },
  { label: "Couple (2 Applicants)" },
  { label: "Family (3–5 Persons)" },
  { label: "Corporate Delegation (5+ Persons)" },
];

const FLIGHT_ROUTES: OptionItem[] = [
  { label: "Mumbai (BOM) → Dubai (DXB)", sub: "Direct 3h 30m" },
  { label: "New Delhi (DEL) → London (LHR)", sub: "Direct 9h 15m" },
  { label: "Bengaluru (BLR) → Singapore (SIN)", sub: "Direct 4h 30m" },
  { label: "Mumbai (BOM) → Jeddah (JED)", sub: "Direct 5h 10m" },
  { label: "New Delhi (DEL) → Bangkok (BKK)", sub: "Direct 4h 15m" },
];

const FLIGHT_DATES: OptionItem[] = [
  { label: "Tomorrow", sub: "Immediate departure" },
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
  { label: "Family (2 Adults, 2 Kids)" },
];

const TRAIN_ROUTES: OptionItem[] = [
  { label: "New Delhi → Mumbai Central", sub: "Rajdhani / Tejas Express" },
  { label: "Mumbai → Madgaon, Goa", sub: "Vande Bharat / Konkan Kanya" },
  { label: "Kolkata → Varanasi Junction", sub: "Vande Bharat Express" },
  { label: "Bengaluru → Chennai Central", sub: "Shatabdi Express" },
  { label: "New Delhi → Jaipur Junction", sub: "Double Decker / Shatabdi" },
];

const TRAIN_DATES: OptionItem[] = [
  { label: "Tomorrow (Tatkal)", sub: "Confirmed quota booking" },
  { label: "This Weekend", sub: "Scenic route" },
  { label: "18 Nov 2026", sub: "General reservation" },
  { label: "Next 30 Days", sub: "Advance reservation window" },
];

const TRAIN_CLASSES: OptionItem[] = [
  { label: "1st AC (1A) Confirmed" },
  { label: "2nd AC (2A)" },
  { label: "3rd AC (3A)" },
  { label: "Executive Chair Car (EC)" },
  { label: "Sleeper Class (SL)" },
];

const BUS_ROUTES: OptionItem[] = [
  { label: "Bangalore → Goa (Panjim)", sub: "Overnight Multi-Axle Volvo" },
  { label: "Mumbai → Pune", sub: "Express AC Sleeper" },
  { label: "Delhi → Manali", sub: "Himachal Luxury Volvo" },
  { label: "Bangalore → Ooty", sub: "Scenic Nilgiri Sleeper" },
  { label: "Delhi → Jaipur", sub: "Express AC Coach" },
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

const UMRAH_TIERS: OptionItem[] = [
  {
    label: "Executive 5-Star (Courtyard Facing)",
    sub: "Steps from Haram courtyard",
  },
  {
    label: "Deluxe Makkah & Madinah (10D)",
    sub: "Clock tower & 5-star transit",
  },
  { label: "Ramadan Special Umrah", sub: "Last 10 days blessed package" },
  { label: "Economy Family Umrah", sub: "Comfortable hotel with shuttle" },
];

const UMRAH_SEASONS: OptionItem[] = [
  { label: "Next 30 Days", sub: "Immediate departure" },
  { label: "Nov – Dec 2026", sub: "Pleasant winter pilgrimage" },
  { label: "Ramadan 2027", sub: "Peak spiritual season" },
  { label: "Flexible Dates", sub: "Custom group dates" },
];

const UMRAH_PILGRIMS: OptionItem[] = [
  { label: "Couple (2 Adults)" },
  { label: "Solo Pilgrim (1 Adult)" },
  { label: "Family (2 Adults, 2 Kids)" },
  { label: "Group (10+ Pilgrims)" },
];

const HAJJ_TIERS: OptionItem[] = [
  { label: "Executive Non-Shifting (Mina A)", sub: "VIP AC European tents" },
  { label: "Deluxe Shifting (Mina & Azizia)", sub: "5-star luxury hotels" },
  { label: "Economy VIP Guided", sub: "Scholar led with full support" },
  { label: "Private Luxury Camp", sub: "Exclusive private VIP setup" },
];

const HAJJ_SEASONS: OptionItem[] = [
  { label: "May – Jun 2027", sub: "Hajj 1448H Official Season" },
  { label: "Advance Waitlist 2028", sub: "Early seat allocation" },
  { label: "Tentative Schedule", sub: "Custom quote inquiry" },
];

const HAJJ_PILGRIMS: OptionItem[] = [
  { label: "2 Adults" },
  { label: "1 Adult" },
  { label: "Family (4 Pilgrims)" },
  { label: "Group (6+ Pilgrims)" },
];

// Reusable concierge dropdown field using standard rounded-[8px]
interface ConciergePillFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  options: OptionItem[];
  onSelect: (val: string) => void;
  dropdownWidth?: string;
  className?: string;
}

const ConciergePillField: React.FC<ConciergePillFieldProps> = ({
  icon: IconComponent,
  label,
  value,
  isOpen,
  onToggle,
  options,
  onSelect,
  dropdownWidth = "w-72 sm:w-88",
  className = "flex-1 min-w-0",
}) => {
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 sm:gap-4 group cursor-pointer text-left focus:outline-none transition-transform duration-150 active:scale-[0.99] py-1.5 select-none px-2.5 sm:px-3.5 rounded-[8px] hover:bg-black/[0.03]"
      >
        {/* Soft Circular Icon Container */}
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F4F1EA] group-hover:bg-[#EAE5DC] flex items-center justify-center shrink-0 transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          <IconComponent className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#2C241E] stroke-[1.7]" />
        </div>

        {/* Text Block: Label on top, Value + Chevron below */}
        <div className="flex flex-col min-w-0 flex-1 pr-1">
          <span className="text-[12px] sm:text-[13px] text-[#78716A] font-medium leading-tight mb-1 select-none truncate">
            {label}
          </span>
          <div className="flex items-center justify-between gap-2 w-full">
            <span className="text-[15px] sm:text-[16px] lg:text-[17px] font-bold sm:font-semibold text-[#1C1917] tracking-tight leading-tight group-hover:text-[#002f89] transition-colors truncate">
              {value}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#78716A] group-hover:text-[#1C1917] shrink-0 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[#002f89]" : ""
              }`}
            />
          </div>
        </div>
      </button>

      {/* Upward luxury dropdown with standard rounded-[8px] */}
      {isOpen && (
        <div
          className={`absolute left-0 bottom-[calc(100%+12px)] z-50 ${dropdownWidth} bg-white rounded-[8px] p-2.5 shadow-[0_24px_55px_rgba(0,0,0,0.25),0_6px_20px_rgba(0,0,0,0.12)] border border-neutral-200/90 animate-in fade-in slide-in-from-bottom-2 duration-150 max-h-[320px] overflow-y-auto no-scrollbar`}
        >
          {options.map((opt, idx) => {
            const isSelected = value === opt.label;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(opt.label)}
                className={`w-full px-4 py-2.5 rounded-[6px] text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#F4F1EA] text-[#002f89] font-semibold"
                    : "hover:bg-neutral-50 text-neutral-800 font-normal"
                }`}
              >
                <div className="min-w-0 pr-1">
                  <div className="text-[14px] sm:text-[14.5px] truncate">
                    {opt.label}
                  </div>
                  {opt.sub && (
                    <div className="text-[12px] text-neutral-400 truncate mt-0.5">
                      {opt.sub}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-[#002f89] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Dynamic Requirements, Trust & Step-by-Step Coordination Hub for all 7 Services
interface ServiceHubDoc {
  title: string;
  badge: "Mandatory" | "Recommended" | "Conditional" | "Essential";
  badgeType: "rose" | "blue" | "amber" | "emerald";
  description: string;
  requirement: string;
  tip: string;
}

interface ServiceHubStep {
  step: string;
  duration: string;
  title: string;
  desc: string;
}

interface ServiceHubInclusion {
  title: string;
  desc: string;
}

interface ServiceHubItem {
  serviceId: string;
  name: string;
  badge: string;
  headline: string;
  subheadline: string;
  trustPillars: {
    stat: string;
    label: string;
    desc: string;
  }[];
  documents: ServiceHubDoc[];
  processSteps: ServiceHubStep[];
  inclusions: ServiceHubInclusion[];
  ctaHeadline: string;
  ctaSubheadline: string;
  ctaButtonText: string;
  whatsappMessage: string;
}

const SERVICE_HUB_DATA: Record<string, ServiceHubItem> = {
  "custom-holidays": {
    serviceId: "Holiday Packages",
    name: "Custom Holidays",
    badge: "Bespoke Luxury Planning",
    headline: "Tailor-Made Vacations Crafted Uniquely Around You",
    subheadline:
      "Zero cookie-cutter group tours. Private chauffeur-driven vehicles, hand-picked 5-star villas, insider experiences, and a dedicated 24/7 vacation curator from departure to return.",
    trustPillars: [
      {
        stat: "100%",
        label: "Custom Tailored",
        desc: "Every itinerary designed from scratch to match your pace, dietary preferences, and personal passions.",
      },
      {
        stat: "5-Star Only",
        label: "Vetted Luxury Stays",
        desc: "Private pool villas, boutique alpine chalets, and renowned international hotel suites.",
      },
      {
        stat: "15,000+",
        label: "Journeys Curated",
        desc: "Over a decade of seamless luxury holidays across Europe, Maldives, Bali, Japan, and Southeast Asia.",
      },
      {
        stat: "Private Driver",
        label: "Dedicated Ground Transit",
        desc: "Chauffeur-driven luxury Mercedes, BMW, or executive vans for all transfers and scenic day tours.",
      },
    ],
    documents: [
      {
        title: "Valid Passports for All Travelers",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Minimum 6 months validity from return date",
        requirement:
          "Clear scans of bio pages with multiple blank visa pages for all participating adults and children.",
        tip: "Notify our desk if any traveler holds a secondary passport or dual citizenship.",
      },
      {
        title: "Destination Tourist Visas",
        badge: "Essential",
        badgeType: "emerald",
        description: "Fully processed by Flyora Visa Desk",
        requirement:
          "Consular-approved entry permits for all countries included in your custom holiday itinerary.",
        tip: "Bundled directly into your holiday coordination so you don't have to visit external agents.",
      },
      {
        title: "Comprehensive Travel Insurance",
        badge: "Recommended",
        badgeType: "blue",
        description: "Medical, cancellation & luggage coverage",
        requirement:
          "Emergency medical cover, trip interruption protection, and adventure activity riders if applicable.",
        tip: "Included complimentary with all our premium executive holiday packages.",
      },
      {
        title: "Travel Preferences & Dietary Notes",
        badge: "Recommended",
        badgeType: "blue",
        description: "Personal style, special dates & dining",
        requirement:
          "Honeymoon / anniversary celebrations, vegetarian/Halal dining preferences, and preferred mobility pace.",
        tip: "Allows us to coordinate complimentary room upgrades and surprise anniversary amenities.",
      },
    ],
    processSteps: [
      {
        step: "01",
        duration: "15 Mins",
        title: "Trip Discovery & Wishlist Call",
        desc: "Share your dream destination, travel dates, preferred vibe (relaxing, romantic, adventure, cultural), and family dynamics.",
      },
      {
        step: "02",
        duration: "Within 24 Hours",
        title: "Interactive Custom Itinerary",
        desc: "Receive a day-by-day bespoke proposal featuring hand-picked resorts, private experiences, and transparent itemized pricing.",
      },
      {
        step: "03",
        duration: "Flexible",
        title: "Fine-Tune & Lock Pricing",
        desc: "Adjust dates, switch villa types, add private catamaran cruises, and approve final arrangements without pressure.",
      },
      {
        step: "04",
        duration: "Entire Trip",
        title: "VIP Execution & 24/7 Desk",
        desc: "Airport meet-and-greet, luxury vehicle transfers, skip-the-line passes, and instant WhatsApp concierge support throughout.",
      },
    ],
    inclusions: [
      {
        title: "Handpicked 5-Star Accommodations",
        desc: "Complimentary room upgrades, daily gourmet breakfast, and VIP welcome amenities at top luxury resorts.",
      },
      {
        title: "Private Chauffeur & Executive Transit",
        desc: "Dedicated vehicle for private airport transfers and scenic sightseeing trips at your own pace.",
      },
      {
        title: "Curated VIP Landmark Passes",
        desc: "Skip-the-line tickets for iconic sights, private museum guides, and unique local culinary tastings.",
      },
      {
        title: "Complete Visa & Insurance Handling",
        desc: "Hassle-free visa documentation review and comprehensive international travel medical protection.",
      },
      {
        title: "24/7 WhatsApp Travel Concierge",
        desc: "Direct channel to your personal trip coordinator for restaurant bookings, route changes, and real-time advice.",
      },
    ],
    ctaHeadline: "Design Your Dream Vacation",
    ctaSubheadline:
      "Tell us where you want to go. Our senior destination specialist will prepare a bespoke itinerary and reach out with tailored options within 15 minutes.",
    ctaButtonText: "Request Custom Holiday Itinerary",
    whatsappMessage:
      "Hello Flyora, I would like to plan a bespoke holiday package.",
  },
  "visa-assistance": {
    serviceId: "Visa Assistance",
    name: "Visa Assistance",
    badge: "99.2% Consular Approval",
    headline: "Fast-Track Visa Approvals & Document Verification",
    subheadline:
      "Consular-trained visa specialists audit your documentation, book express appointment slots, and coordinate end-to-end embassy submissions with 99.2% approval success.",
    trustPillars: [
      {
        stat: "99.2%",
        label: "Approval Success Rate",
        desc: "Rigorous pre-submission consular audit prevents common embassy rejection pitfalls.",
      },
      {
        stat: "48–72 Hrs",
        label: "Express Queue Access",
        desc: "Priority VFS, TLS & BLS appointment booking desks across major consulates.",
      },
      {
        stat: "50,000+",
        label: "Visas Dispatched",
        desc: "Successfully issued visas for Schengen, UK, USA, UAE, Singapore & 100+ countries.",
      },
      {
        stat: "100%",
        label: "Audit Accuracy",
        desc: "Zero document rejection guarantee with comprehensive cover letter drafting.",
      },
    ],
    documents: [
      {
        title: "Original Passport & Blank Pages",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Minimum 6 months validity from return date",
        requirement:
          "At least 2 contiguous blank visa pages, undamaged physical booklet, and clear scan of front/back biographical pages.",
        tip: "Ensure passport has no water damage, tears, or loose stitching.",
      },
      {
        title: "Biometric Studio Photographs",
        badge: "Mandatory",
        badgeType: "rose",
        description: "35mm × 45mm, white matte background",
        requirement:
          "Recent within 3 months, 80% face coverage, neutral facial expression, clear ears, no tinted eyewear or heavy headwear.",
        tip: "Share digital JPG with our desk; we resize and format to exact consular specifications.",
      },
      {
        title: "Bank Statements & Financial Proof",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Last 6 months verified statements",
        requirement:
          "Official bank seal and signature on all pages, healthy closing balance matching travel duration, plus recent 3 years ITR acknowledgement.",
        tip: "Avoid sudden large unexplainable cash deposits right before printing statements.",
      },
      {
        title: "Employment Letter / NOC",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Official company letterhead with seal",
        requirement:
          "Signed No Objection Certificate stating designation, salary, joining date, and approved leave window. Self-employed: GST & registration.",
        tip: "We provide compliant NOC templates tailored to your destination embassy.",
      },
    ],
    processSteps: [
      {
        step: "01",
        duration: "15 Mins",
        title: "Free Eligibility & Profile Audit",
        desc: "Submit your destination country and travel dates. Our senior visa officer evaluates your financial standing, travel history, and sends a customized document checklist.",
      },
      {
        step: "02",
        duration: "Within 24 Hours",
        title: "Document Review & Drafting",
        desc: "Send documents via WhatsApp or secure portal. We verify every file, draft consulate-compliant cover letters, day-by-day itineraries, and confirmed hotel vouchers.",
      },
      {
        step: "03",
        duration: "2–5 Working Days",
        title: "Appointment & Biometrics",
        desc: "We schedule priority VFS/TLS/BLS slots, provide mock interview preparation, and guide you through biometric submission at your nearest center.",
      },
      {
        step: "04",
        duration: "Embassy Timeline",
        title: "Stamped Visa Handover",
        desc: "Real-time tracking of passport movement from embassy to our desk. Receive your stamped visa and passport securely via courier or instant digital dispatch.",
      },
    ],
    inclusions: [
      {
        title: "Consulate-Compliant Cover Letter",
        desc: "Tailored formal statement articulating travel purpose, financial stability, and return commitment.",
      },
      {
        title: "Confirmed Flight & Hotel Vouchers",
        desc: "Legitimate airline PNR reservation and hotel booking vouchers accepted by Schengen and global embassies.",
      },
      {
        title: "Complimentary Medical Travel Insurance",
        desc: "Comprehensive policy with minimum €30,000 / $50,000 emergency medical and repatriation cover.",
      },
      {
        title: "Priority Slot Booking & Tracking",
        desc: "Fast-track appointment scheduling with continuous WhatsApp status alerts on application milestones.",
      },
      {
        title: "Personal Visa Officer Support",
        desc: "Dedicated single point of contact available via call and WhatsApp throughout the process.",
      },
    ],
    ctaHeadline: "Start Your Visa Application with Flyora",
    ctaSubheadline:
      "Submit your destination and details below. Our visa coordinator will review your profile, send a personalized document checklist, and call or message you on WhatsApp within 15 minutes.",
    ctaButtonText: "Request Visa Eligibility Check",
    whatsappMessage:
      "Hello Flyora, I would like to check my visa eligibility and requirements.",
  },
  "flight-booking": {
    serviceId: "Flight Booking",
    name: "Flight Booking",
    badge: "Unpublished Corporate Fares",
    headline: "Commercial & Business Class Air Ticketing with Offline Rates",
    subheadline:
      "Access wholesale corporate fares, flexible ticket hold windows, 24/7 emergency rebooking desks, and zero convenience fee transparency across 500+ global airlines.",
    trustPillars: [
      {
        stat: "IATA Member",
        label: "Official GDS Inventory",
        desc: "Direct ticketing access through Amadeus & Sabre GDS systems for instant confirmed seat issuance.",
      },
      {
        stat: "Up to 25% Off",
        label: "Corporate Wholesale Fares",
        desc: "Access unpublished offline fare buckets and consortium discounts unavailable on standard OTAs.",
      },
      {
        stat: "48-Hour Hold",
        label: "Price Lock Guarantee",
        desc: "Lock attractive flight fares up to 48 hours without immediate payment while finalizing plans.",
      },
      {
        stat: "24/7 Human Desk",
        label: "Flight Reschedule Helpline",
        desc: "Zero automated bot frustrations; real ticketing experts handle cancellations, seat shifts & refunds.",
      },
    ],
    documents: [
      {
        title: "Government Photo ID / Passport",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Valid for all departing passengers",
        requirement:
          "Passport for international routes (valid 6+ months); Aadhaar, PAN or Driving License for domestic travel.",
        tip: "Name on reservation must match ID proof down to the exact letter to avoid airline penalties.",
      },
      {
        title: "Destination / Transit Visa",
        badge: "Mandatory",
        badgeType: "rose",
        description: "For international & multi-leg flights",
        requirement:
          "Valid entry visa or electronic travel authorization (ETA/ESTA) for destination and any intermediate layover hubs.",
        tip: "Our flight desk cross-checks transit visa rules before issuing connecting tickets.",
      },
      {
        title: "Frequent Flyer / Loyalty Numbers",
        badge: "Recommended",
        badgeType: "blue",
        description: "Star Alliance, OneWorld & SkyTeam",
        requirement:
          "Airline membership number to earn miles, tier points, and access priority check-in/lounge privileges.",
        tip: "Provide numbers during enquiry; we link them directly into your airline PNR.",
      },
      {
        title: "Special Service Requests (SSR)",
        badge: "Conditional",
        badgeType: "amber",
        description: "Wheelchair, dietary meal & extra baggage",
        requirement:
          "Advance notification for wheelchair ramp assistance, diabetic/Halal/infant meals, or pre-purchased baggage.",
        tip: "Pre-booking extra baggage through our desk saves up to 40% over airport counter rates.",
      },
    ],
    processSteps: [
      {
        step: "01",
        duration: "Instant",
        title: "Submit Route & Preferred Class",
        desc: "Tell us departure/arrival airports, travel dates, preferred flight times, cabin class (Economy/Business), and luggage needs.",
      },
      {
        step: "02",
        duration: "10 Mins",
        title: "Fare Comparison & 48h Hold",
        desc: "We scan GDS inventory, identify unpublished wholesale rates, and temporarily hold the best flight option at locked pricing.",
      },
      {
        step: "03",
        duration: "Same Day",
        title: "Seat Selection & Meal Locking",
        desc: "Choose preferred window/aisle seats, verify baggage allowance, and confirm passenger details with zero hidden booking surcharges.",
      },
      {
        step: "04",
        duration: "Departure Day",
        title: "Web Check-In & Gate Alerts",
        desc: "Our desk completes automated web check-in, delivers e-boarding passes to WhatsApp, and monitors flight delays in real time.",
      },
    ],
    inclusions: [
      {
        title: "Unpublished Offline & Corporate Fares",
        desc: "Special negotiated airline fares offering superior savings compared to retail online travel portals.",
      },
      {
        title: "Complimentary Web Check-In Assistance",
        desc: "Automated advance check-in and seat assignment delivered straight to your WhatsApp.",
      },
      {
        title: "Pre-Purchased Extra Luggage Discounts",
        desc: "Save up to 40% by booking additional 15kg/23kg baggage allowances prior to departure.",
      },
      {
        title: "Transparent Pricing with Zero Hidden Fees",
        desc: "No unexpected payment gateway fees, processing markups, or convenience surcharges.",
      },
      {
        title: "24/7 Dedicated Rebooking & Refund Desk",
        desc: "Direct human coordinator available around the clock for missed connections, flight delays, or rescheduling.",
      },
    ],
    ctaHeadline: "Find the Best Airfare & Route",
    ctaSubheadline:
      "Need domestic or international flight tickets? Submit your route and date details. Our ticketing specialist will find unpublished fares and contact you via WhatsApp or phone within 15 minutes.",
    ctaButtonText: "Request Flight Fare Quote",
    whatsappMessage:
      "Hello Flyora, I would like to get a quote for flight tickets.",
  },
  "train-booking": {
    serviceId: "Train Booking",
    name: "Train Booking",
    badge: "IRCTC Authorized Partner",
    headline: "Confirmed Berths & Iconic Indian Rail Journeys",
    subheadline:
      "Authorized railway reservations with Tatkal priority strategy, premium First AC & 2A berth allocations, instant WhatsApp PNR alerts, and zero-hassle cancellation support.",
    trustPillars: [
      {
        stat: "IRCTC Partner",
        label: "Direct Rail Authorization",
        desc: "Legitimate agent portal access for rapid, compliant, and confirmed passenger ticket issuance.",
      },
      {
        stat: "Tatkal Desk",
        label: "Peak Date Priority Strategy",
        desc: "Optimized opening-minute execution for emergency and last-minute holiday travel dates.",
      },
      {
        stat: "98.7%",
        label: "Confirmed Berth Success",
        desc: "High success rate securing confirmed First AC, 2nd AC, and Executive Chair Car seats.",
      },
      {
        stat: "Real-Time PNR",
        label: "Live WhatsApp Tracking",
        desc: "Instant notifications regarding chart preparation, coach position, and platform numbers.",
      },
    ],
    documents: [
      {
        title: "Government Photo Identification",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Required for every passenger during travel",
        requirement:
          "Aadhaar Card, Voter ID, Driving License, or Passport matching the exact passenger name on the reservation.",
        tip: "Digital Aadhaar on DigiLocker or m-Aadhaar is legally accepted by Indian Railways.",
      },
      {
        title: "Accurate Passenger Details & Age",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Full names as per official government ID",
        requirement:
          "Exact age, gender, and berth preference (Lower berth, Upper berth, Side Lower, or Side Upper).",
        tip: "Lower berths are automatically prioritized for senior citizens and pregnant travelers.",
      },
      {
        title: "Senior Citizen / Concession Proof",
        badge: "Conditional",
        badgeType: "amber",
        description: "For travelers claiming concessions",
        requirement:
          "Documentary age proof for eligible passenger quotas and medical concession certificates where applicable.",
        tip: "Carry original physical proof during train journey to avoid TTE penalties.",
      },
      {
        title: "Active Mobile Number",
        badge: "Mandatory",
        badgeType: "rose",
        description: "For receiving real-time IRCTC SMS",
        requirement:
          "Mobile number capable of receiving SMS updates, chart preparation alerts, and QR code ticket delivery.",
        tip: "We link your WhatsApp directly so you get platform updates 4 hours before departure.",
      },
    ],
    processSteps: [
      {
        step: "01",
        duration: "Instant",
        title: "Submit Route & Class Preference",
        desc: "Tell us origin station, destination station, date of travel, and preferred coach class (1A, 2A, 3A, or CC).",
      },
      {
        step: "02",
        duration: "10 Mins",
        title: "Quota & Availability Check",
        desc: "Our rail desk checks general quota, premium tatkal, senior citizen quota, and alternative station combinations.",
      },
      {
        step: "03",
        duration: "Fast-Track",
        title: "Confirmed Booking & PNR Creation",
        desc: "Ticket reserved through official channel with preferred lower/side berths secured and confirmed PNR generated.",
      },
      {
        step: "04",
        duration: "Journey Day",
        title: "WhatsApp E-Ticket & Live Charting",
        desc: "Receive formatted E-ticket with QR code on WhatsApp, along with live chart preparation and platform updates.",
      },
    ],
    inclusions: [
      {
        title: "Authorized IRCTC Confirmed Ticketing",
        desc: "Genuine ticketing via official railway partner system ensuring complete travel peace of mind.",
      },
      {
        title: "Tatkal & Emergency Priority Execution",
        desc: "Dedicated high-speed booking team handling critical 10:00 AM (AC) & 11:00 AM (Non-AC) Tatkal windows.",
      },
      {
        title: "Lower Berth Priority Allocation",
        desc: "Systematic preference matching for elderly passengers, families, and solo female travelers.",
      },
      {
        title: "Live PNR & Platform Alerts on WhatsApp",
        desc: "Real-time updates on chart finalization, coach positioning on platform, and train running status.",
      },
      {
        title: "Instant Cancellation & Refund Handling",
        desc: "Quick processing of ticket cancellations with transparent IRCTC refund credit directly to your account.",
      },
    ],
    ctaHeadline: "Reserve Confirmed Train Berths",
    ctaSubheadline:
      "Need confirmed rail tickets or Tatkal assistance? Submit your travel stations and dates below. Our rail desk will check availability and message you options on WhatsApp within 15 minutes.",
    ctaButtonText: "Request Train Booking Quote",
    whatsappMessage:
      "Hello Flyora, I would like to check train seat availability and book confirmed berths.",
  },
  "bus-booking": {
    serviceId: "Bus Booking",
    name: "Bus Booking",
    badge: "Premium Volvo & Sleeper",
    headline: "Luxury Multi-Axle Volvo & AC Sleeper Coach Travel",
    subheadline:
      "Premier intercity highway travel with verified sanitized coaches, private lounge boarding points, live GPS tracking links, and instant paperless m-tickets on WhatsApp.",
    trustPillars: [
      {
        stat: "Volvo & Scania",
        label: "Multi-Axle Fleet",
        desc: "Top-tier air-suspension coaches providing ultra-smooth highway journeys and spacious berths.",
      },
      {
        stat: "Verified Lounges",
        label: "Safe Boarding Points",
        desc: "Private, well-lit operator lounges with clean restrooms, seating, and tea/coffee facilities.",
      },
      {
        stat: "Live GPS Link",
        label: "Real-Time Tracking",
        desc: "Live vehicle location link shareable with family members to monitor journey progress.",
      },
      {
        stat: "100% Paperless",
        label: "Instant WhatsApp M-Ticket",
        desc: "Digital boarding pass sent straight to your phone with conductor phone number and boarding map.",
      },
    ],
    documents: [
      {
        title: "Government Photo ID Proof",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Required at coach boarding gate",
        requirement:
          "Aadhaar Card, Driver's License, Voter ID, or College/Corporate ID matching the passenger name.",
        tip: "Digital copy on smartphone is completely acceptable for boarding.",
      },
      {
        title: "Active Mobile Phone Number",
        badge: "Mandatory",
        badgeType: "rose",
        description: "To receive live bus GPS tracking",
        requirement:
          "Working phone number to receive boarding point directions, driver/conductor contact, and delay alerts.",
        tip: "Conductor calls passengers 15 minutes prior to pickup to confirm arrival.",
      },
      {
        title: "Seat & Berth Preference",
        badge: "Recommended",
        badgeType: "blue",
        description: "Lower deck vs Upper sleeper berth",
        requirement:
          "Specify single sleeper (for solo travelers), double sleeper (couples), or front row seats for minimal motion.",
        tip: "Lower berths offer smoother ride comfort on ghat and hilly highway sections.",
      },
      {
        title: "Special Cargo / Excess Luggage Note",
        badge: "Conditional",
        badgeType: "amber",
        description: "For extra boxes or commercial parcels",
        requirement:
          "Advance notification if traveling with oversized cartons, bicycles, or commercial luggage beyond 20kg.",
        tip: "We coordinate with operator in advance to guarantee cargo bay space.",
      },
    ],
    processSteps: [
      {
        step: "01",
        duration: "Instant",
        title: "Select Route & Time Window",
        desc: "Tell us departure city, destination city, preferred night or morning departure, and boarding pickup landmark.",
      },
      {
        step: "02",
        duration: "10 Mins",
        title: "Coach & Berth Selection",
        desc: "We compare top-rated Volvo, Scania, and BharatBenz coaches, reserving comfortable lower berths or women-only rows.",
      },
      {
        step: "03",
        duration: "Instant",
        title: "Confirmed M-Ticket Issuance",
        desc: "Confirmed ticket issued with seat numbers, vehicle registration number, and Google Maps boarding location link.",
      },
      {
        step: "04",
        duration: "Travel Evening",
        title: "Live GPS & Conductor Details",
        desc: "Receive live bus tracking link and driver/conductor direct phone number 1 hour prior to departure.",
      },
    ],
    inclusions: [
      {
        title: "Sanitized Premium Air-Conditioned Sleeper",
        desc: "Clean sanitized bedsheets, fresh blanket, ergonomic pillow, and personal reading light.",
      },
      {
        title: "Individual USB & AC Power Outlets",
        desc: "Fast-charging ports at every sleeper berth and semi-sleeper recliner seat.",
      },
      {
        title: "Verified Safe Boarding Lounges",
        desc: "Exclusive access to private operator waiting lounges with security and clean restrooms.",
      },
      {
        title: "Live GPS Journey Sharing Link",
        desc: "Real-time location link that can be shared with family members for complete journey safety.",
      },
      {
        title: "24/7 Route Coordinator Helpline",
        desc: "Direct hotline for boarding guidance, highway assistance, and emergency delay updates.",
      },
    ],
    ctaHeadline: "Book Comfortable Highway Travel",
    ctaSubheadline:
      "Planning an intercity trip? Submit your pickup and drop cities below. Our bus desk will reserve premium sleeper seats and share instant details on WhatsApp within 15 minutes.",
    ctaButtonText: "Request Bus Booking Quote",
    whatsappMessage:
      "Hello Flyora, I would like to book a luxury AC sleeper bus ticket.",
  },
  "umrah-packages": {
    serviceId: "Umrah & Hajj",
    name: "Umrah Packages",
    badge: "MoHU Approved Partner",
    headline: "Sacred & Blessed Umrah Pilgrimages with Courtyard Proximity",
    subheadline:
      "Ministry-certified Umrah arrangements with luxury hotels steps from the Holy Haram, instant Saudi e-visas, private AC transfers, and guided spiritual ziyarah.",
    trustPillars: [
      {
        stat: "MoHU Certified",
        label: "Official Saudi License",
        desc: "Authorized direct Nusuk partner ensuring 100% genuine Tasreeh and visa authorization.",
      },
      {
        stat: "50–150m",
        label: "Walking to Holy Courtyard",
        desc: "Premium Clock Tower and courtyard-facing 5-star hotels with private prayer hall access.",
      },
      {
        stat: "12,500+",
        label: "Pilgrims Coordinated",
        desc: "Flawless group and custom family pilgrimages with senior bilingual scholars.",
      },
      {
        stat: "24/7 Ground Team",
        label: "Makkah & Madinah Help",
        desc: "Dedicated on-ground operations desk stationed at Jeddah Airport, Makkah, and Madinah.",
      },
    ],
    documents: [
      {
        title: "Original National Passport",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Minimum 6 months validity from departure",
        requirement:
          "Machine-readable passport with minimum 2 blank pages, crisp biographical page scan, and no damage.",
        tip: "Passport must match the traveler name on your national ID.",
      },
      {
        title: "Saudi Tourist / Umrah eVisa",
        badge: "Essential",
        badgeType: "emerald",
        description: "Issued by our licensed visa desk",
        requirement:
          "Full e-visa processed within 24–48 hours directly linked to the official Nusuk portal, including mandatory health insurance.",
        tip: "Handled 100% by Flyora alongside your package confirmation.",
      },
      {
        title: "Vaccination & Medical Records",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Meningitis ACWY & health certificate",
        requirement:
          "Meningococcal vaccine administered at least 10 days before departure, plus routine seasonal influenza vaccine certificate.",
        tip: "Keep both printed certificate and digital QR code readily accessible at airport.",
      },
      {
        title: "Mahram & Relationship Proof",
        badge: "Conditional",
        badgeType: "amber",
        description: "Required for specific pilgrim groups",
        requirement:
          "Government marriage certificate or birth certificate for family groups and minors traveling with guardians.",
        tip: "Women above 45 can travel without Mahram in organized group pilgrimages.",
      },
    ],
    processSteps: [
      {
        step: "01",
        duration: "15 Mins",
        title: "Select Pilgrim Tier & Season",
        desc: "Choose your preferred dates, hotel proximity (Clock Tower vs courtyard), room occupancy (double/triple/quad), and flight departure city.",
      },
      {
        step: "02",
        duration: "Within 24 Hours",
        title: "Customized Proposal & Lock",
        desc: "Our Umrah coordinator provides transparent package pricing with confirmed hotel allocations, airline seats, and ground transit options.",
      },
      {
        step: "03",
        duration: "24–48 Hours",
        title: "Saudi eVisa & Nusuk Booking",
        desc: "We issue your Saudi electronic visa, lock Rawdah permits on Nusuk, and generate confirmed hotel check-in vouchers.",
      },
      {
        step: "04",
        duration: "Pilgrimage Care",
        title: "Airport Meet & Guided Rituals",
        desc: "Warm reception at Jeddah or Madinah airport, private VIP AC transfer, check-in escort, and scholar-guided Umrah and historical Ziyarah tours.",
      },
    ],
    inclusions: [
      {
        title: "Walking-Distance Haram Accommodations",
        desc: "Guaranteed 5-star or premium 4-star hotels situated 50 to 150 meters from the Holy Haram courtyards.",
      },
      {
        title: "Express Saudi Umrah/Tourist eVisa",
        desc: "Fast-track electronic visa issuance with comprehensive Kingdom-wide medical insurance.",
      },
      {
        title: "Private VIP Ground Transportation",
        desc: "Chauffeur-driven luxury GMC Yukon or modern air-conditioned multi-axle coaches between Jeddah, Makkah, and Madinah.",
      },
      {
        title: "Guided Historical Ziyarat Tours",
        desc: "Curated visits to Jabal Al-Noor, Cave of Hira, Mount Arafat, Mina, Muzdalifah, Masjid Quba, and Mount Uhud.",
      },
      {
        title: "Complimentary 5L Zamzam Water",
        desc: "Officially packaged factory-sealed Zamzam water can per pilgrim (airline luggage rules permitting).",
      },
    ],
    ctaHeadline: "Plan Your Sacred Umrah Pilgrimage",
    ctaSubheadline:
      "Tell us your preferred departure month, number of pilgrims, and room sharing preferences. Our dedicated Umrah coordinator will contact you with full package options and hotel proximity details.",
    ctaButtonText: "Request Umrah Package Consultation",
    whatsappMessage:
      "Hello Flyora, I would like to enquire about Umrah package pricing and hotel options.",
  },
  "hajj-packages": {
    serviceId: "Umrah & Hajj",
    name: "Hajj Packages",
    badge: "Nusuk Hajj Synergy",
    headline: "The Holy Pillar: Guided, Dignified & Fully Supported Hajj",
    subheadline:
      "Comprehensive pilgrimage packages with luxury European non-shifting Mina camps, direct high-speed train transit, and dedicated resident scholars guiding every sacred rite.",
    trustPillars: [
      {
        stat: "Category-A",
        label: "Mina Zone 1 Camps",
        desc: "Air-conditioned gypsum-board European tents with private buffet dining and clean sanitation.",
      },
      {
        stat: "High-Speed",
        label: "Haramain Rail Transit",
        desc: "Skip grueling multi-hour desert traffic with express bullet train transfers between holy sites.",
      },
      {
        stat: "Non-Shifting",
        label: "Permanent Hotel Stays",
        desc: "Retain your comfortable 5-star hotel room throughout the 5 days of Hajj without shifting luggage.",
      },
      {
        stat: "100% Guided",
        label: "Senior Resident Muallim",
        desc: "Step-by-step spiritual direction through every ritual from Tawaf to Mina, Arafat, and Jamarat.",
      },
    ],
    documents: [
      {
        title: "National Passport (6+ Months)",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Valid for at least 6 months after Hajj",
        requirement:
          "Undamaged passport with at least 3 blank pages, accurate biographical details, and verified machine-readable code.",
        tip: "Check expiry date well in advance; renewal takes time during peak seasons.",
      },
      {
        title: "Official Nusuk Hajj Profile",
        badge: "Essential",
        badgeType: "emerald",
        description: "Verified profile on Saudi Nusuk platform",
        requirement:
          "Completed pilgrim account with uploaded biometrics, verified photo, and approved category reservation token.",
        tip: "Our team assists with your Nusuk profile setup and package locking free of charge.",
      },
      {
        title: "Medical Fitness Certificate",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Authorized government hospital clearance",
        requirement:
          "Official certification of physical and mental capability to perform Hajj rites, free of severe chronic illnesses.",
        tip: "Carry mandatory medication with doctor's prescription in original packaging.",
      },
      {
        title: "Mandatory Vaccination Card",
        badge: "Mandatory",
        badgeType: "rose",
        description: "Meningitis & seasonal flu certificates",
        requirement:
          "Meningococcal vaccine administered at least 10 days prior, verified COVID-19 booster doses, and Yellow Fever if applicable.",
        tip: "Ensure vaccination details are digitally registered on the official health portal.",
      },
    ],
    processSteps: [
      {
        step: "01",
        duration: "6–12 Mo Prior",
        title: "Nusuk Readiness & Pre-Registration",
        desc: "Create and verify your Nusuk pilgrim account, upload required credentials, and select your preferred package category (Executive Non-Shifting or Shifting).",
      },
      {
        step: "02",
        duration: "3 Months Prior",
        title: "Document & Health Screening",
        desc: "Complete mandatory medical assessments, receive consular-approved vaccinations, and verify payment tokens on the official portal.",
      },
      {
        step: "03",
        duration: "30 Days Prior",
        title: "Camp & Train Ticket Allocation",
        desc: "Receive confirmed Mina Zone tent numbers, Haramain train passes, direct flight tickets, and attend our comprehensive Hajj orientation workshop.",
      },
      {
        step: "04",
        duration: "Dhul-Hijjah",
        title: "The 5 Days of Sacred Rites",
        desc: "Full scholar guidance from Day of Tarwiyah, Waqoof-e-Arafat, Muzdalifah night, Ramy al-Jamarat, to Tawaf Al-Ifadah and farewell Tawaf.",
      },
    ],
    inclusions: [
      {
        title: "Non-Shifting 5-Star Accommodations",
        desc: "Continuous stay at premier Makkah & Madinah hotels steps away from the Grand Mosque.",
      },
      {
        title: "Deluxe European Air-Cooled Mina Tents",
        desc: "Spacious partitioned luxury camps equipped with sofa beds, personal lockers, and air conditioning.",
      },
      {
        title: "VIP High-Speed Haramain Train Access",
        desc: "Comfortable rail transit between Makkah, Madinah, and Jeddah bypassing desert highway jams.",
      },
      {
        title: "Full Board Gourmet Catering",
        desc: "3 daily freshly prepared open buffet meals, unlimited cold beverages, tea, coffee, and fruit snacks.",
      },
      {
        title: "Resident Doctors & Scholars",
        desc: "24/7 dedicated medical doctor on-site in Mina and senior scholars answering theological questions.",
      },
    ],
    ctaHeadline: "Inquire for Upcoming Hajj Departures",
    ctaSubheadline:
      "Hajj quotas and category allotments require advance preparation. Speak directly with our senior Hajj coordinator for package allocations and Nusuk profile assistance.",
    ctaButtonText: "Request Hajj Consultation",
    whatsappMessage:
      "Hello Flyora, I would like to inquire about Hajj package tiers and Nusuk registration.",
  },
};

const PICKUP_STATS = [
  { value: "12", label: "AMAZING DEALS" },
  { value: "670", label: "SOLD TOURS" },
  { value: "24", label: "NEW TOURS" },
  { value: "980", label: "HAPPY CUSTOMERS" },
];

const parseTravelerCounts = (
  text: string,
): { adults: number; children: number } => {
  let adults = 1;
  let children = 0;

  const adultMatch = text.match(/(\d+)\s*Adult/i);
  const childMatch = text.match(/(\d+)\s*(?:Children|Kids|Child)/i);

  if (adultMatch) {
    adults = parseInt(adultMatch[1], 10);
  } else if (/couple/i.test(text)) {
    adults = 2;
  } else if (/solo|single/i.test(text)) {
    adults = 1;
  } else {
    const generalMatch = text.match(/(\d+)/);
    if (generalMatch) {
      adults = parseInt(generalMatch[1], 10);
    }
  }

  if (childMatch) {
    children = parseInt(childMatch[1], 10);
  }

  return { adults, children };
};

export default function ServicesPage() {
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const activeService = HERO_SERVICES[activeServiceIndex];
  const hubData =
    SERVICE_HUB_DATA[activeService.id] || SERVICE_HUB_DATA["custom-holidays"];

  // Motion parallax refs for coastal stats banner & Creed banner
  const statsSectionRef = useRef<HTMLDivElement>(null);
  const parallaxImageRef = useRef<HTMLDivElement>(null);
  const creedSectionRef = useRef<HTMLDivElement>(null);
  const creedImageRef = useRef<HTMLDivElement>(null);

  const handleSelectService = (idx: number) => {
    if (idx === activeServiceIndex) return;
    setSlideDirection(idx > activeServiceIndex ? "next" : "prev");
    setPrevIndex(activeServiceIndex);
    setActiveServiceIndex(idx);
    setOpenDropdown(null);

    // Keep URL hash in sync with user's selection without causing page jump or reload
    if (typeof window !== "undefined") {
      const targetHash = `#${HERO_SERVICES[idx].id}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, "", targetHash);
      }
    }
  };

  // Concierge search bar state
  const conciergeBarRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Service-specific field states
  const [holidayDest, setHolidayDest] = useState("Switzerland & The Alps");
  const [holidayMonth, setHolidayMonth] = useState("Nov – Dec 2026");
  const [holidayTravelers, setHolidayTravelers] = useState("Couple (2 Adults)");

  const [visaCountry, setVisaCountry] = useState(
    "Schengen Europe (29 Countries)",
  );
  const [visaDate, setVisaDate] = useState("Within 30 Days");
  const [visaApplicants, setVisaApplicants] = useState(
    "Single Applicant (1 Person)",
  );

  const [flightRoute, setFlightRoute] = useState("Mumbai (BOM) → Dubai (DXB)");
  const [flightDate, setFlightDate] = useState("15 Nov 2026");
  const [flightClass, setFlightClass] = useState("2 Adults, Economy");

  const [trainRoute, setTrainRoute] = useState("New Delhi → Mumbai Central");
  const [trainDate, setTrainDate] = useState("18 Nov 2026");
  const [trainClass, setTrainClass] = useState("2nd AC (2A)");

  const [busRoute, setBusRoute] = useState("Bangalore → Goa (Panjim)");
  const [busDate, setBusDate] = useState("This Weekend");
  const [busSeats, setBusSeats] = useState("2 Sleeper Berths (Volvo AC)");

  const [umrahTier, setUmrahTier] = useState(
    "Executive 5-Star (Courtyard Facing)",
  );
  const [umrahSeason, setUmrahSeason] = useState("Next 30 Days");
  const [umrahPilgrims, setUmrahPilgrims] = useState("Couple (2 Adults)");

  const [hajjTier, setHajjTier] = useState("Executive Non-Shifting (Mina A)");
  const [hajjSeason, setHajjSeason] = useState("May – Jun 2027");
  const [hajjPilgrims, setHajjPilgrims] = useState("2 Adults");

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        conciergeBarRef.current &&
        !conciergeBarRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalServiceId, setModalServiceId] = useState<string | undefined>(
    undefined,
  );
  const [modalPrefill, setModalPrefill] = useState<EnquiryPrefill | undefined>(
    undefined,
  );

  const handleRequestQuote = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3500);

    let destination = "";
    let travelDate = "";
    let tierOrClass = "";
    let rawTravelers = "";

    if (activeService.id === "custom-holidays") {
      destination = holidayDest;
      travelDate = holidayMonth;
      rawTravelers = holidayTravelers;
    } else if (activeService.id === "visa-assistance") {
      destination = visaCountry;
      travelDate = visaDate;
      rawTravelers = visaApplicants;
    } else if (activeService.id === "flight-booking") {
      destination = flightRoute;
      travelDate = flightDate;
      tierOrClass = flightClass.includes("Business")
        ? "Business Class"
        : "Economy Class";
      rawTravelers = flightClass;
    } else if (activeService.id === "train-booking") {
      destination = trainRoute;
      travelDate = trainDate;
      tierOrClass = trainClass;
      rawTravelers = "2 Adults";
    } else if (activeService.id === "bus-booking") {
      destination = busRoute;
      travelDate = busDate;
      tierOrClass = busSeats;
      rawTravelers = busSeats;
    } else if (activeService.id === "umrah-packages") {
      destination = umrahTier;
      travelDate = umrahSeason;
      tierOrClass = umrahTier;
      rawTravelers = umrahPilgrims;
    } else if (activeService.id === "hajj-packages") {
      destination = hajjTier;
      travelDate = hajjSeason;
      tierOrClass = hajjTier;
      rawTravelers = hajjPilgrims;
    }

    const counts = parseTravelerCounts(rawTravelers);
    const summaryParts = [
      activeService.name,
      destination,
      travelDate,
      tierOrClass,
      rawTravelers,
    ].filter(Boolean);

    const prefill: EnquiryPrefill = {
      serviceId: activeService.serviceId,
      serviceName: activeService.name,
      destination,
      travelDate,
      tierOrClass,
      adults: counts.adults,
      children: counts.children,
      summaryLabel: summaryParts.slice(1).join(" · "),
    };

    setModalPrefill(prefill);
    setModalServiceId(activeService.serviceId);
    setModalOpen(true);
  };

  // Listen to hash changes on initial mount and external navigation (back/forward or navbar links)
  useEffect(() => {
    const syncFromHash = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const index = HERO_SERVICES.findIndex((s) => s.id === hash);
      if (index !== -1) {
        setActiveServiceIndex((curr) => {
          if (curr !== index) {
            setSlideDirection(index > curr ? "next" : "prev");
            setPrevIndex(curr);
            return index;
          }
          return curr;
        });
      }
    };

    // Run once on initial page load
    syncFromHash();

    // Listen to external hash changes (e.g. from navbar anchor clicks or browser back/forward)
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Motion effect: Parallax scroll for the coastal counter strip image
  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;

      // Parallax 1: Coastal counter strip
      if (statsSectionRef.current && parallaxImageRef.current) {
        const rect = statsSectionRef.current.getBoundingClientRect();
        if (rect.bottom >= -120 && rect.top <= windowHeight + 120) {
          const totalDistance = windowHeight + rect.height;
          const currentProgress = (windowHeight - rect.top) / totalDistance;
          const clampedProgress = Math.max(0, Math.min(1, currentProgress));
          const yOffset = (clampedProgress - 0.5) * 90;
          parallaxImageRef.current.style.transform = `translate3d(0, ${yOffset}px, 0) scale(1.18)`;
        }
      }

      // Parallax 2: Flyora Creed quote banner
      if (creedSectionRef.current && creedImageRef.current) {
        const cRect = creedSectionRef.current.getBoundingClientRect();
        if (cRect.bottom >= -150 && cRect.top <= windowHeight + 150) {
          const totalDistance = windowHeight + cRect.height;
          const currentProgress = (windowHeight - cRect.top) / totalDistance;
          const clampedProgress = Math.max(0, Math.min(1, currentProgress));
          const yOffset = (clampedProgress - 0.5) * 110;
          creedImageRef.current.style.transform = `translate3d(0, ${yOffset}px, 0) scale(1.18)`;
        }
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleCardEnquiry = (serviceId?: string, prefill?: EnquiryPrefill) => {
    setModalPrefill(prefill);
    setModalServiceId(serviceId);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1C1815] selection:bg-[#002f89] selection:text-white">
      {/* 1. Flyora Floating Navbar */}
      <Navbar
        activePath="/services"
        onOpenEnquiry={handleCardEnquiry}
        ctaLabel="Plan My Trip"
      />

      <main>
        {/* 2. FULL-WIDTH HERO SECTION WITH DYNAMIC BACKGROUND & 7 HERO SERVICE CARDS */}
        <section className="relative w-full min-h-[840px] sm:min-h-[880px] lg:min-h-[920px] flex flex-col justify-between overflow-hidden -mt-20 pt-36 sm:pt-40 lg:pt-44 xl:pt-48 pb-12 sm:pb-16">
          {/* Dynamic Full-Width Background Sliding Images */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {HERO_SERVICES.map((s, idx) => {
              const isActive = idx === activeServiceIndex;
              const isPrev = idx === prevIndex;

              let transformStyle = "";
              let opacityStyle = 0;
              let zIndex = 0;

              if (isActive) {
                opacityStyle = 1;
                zIndex = 10;
                transformStyle = "translate3d(0, 0, 0) scale(1)";
              } else if (isPrev) {
                opacityStyle = 0;
                zIndex = 5;
                transformStyle =
                  slideDirection === "next"
                    ? "translate3d(-10%, 0, 0) scale(1.05)"
                    : "translate3d(10%, 0, 0) scale(1.05)";
              } else {
                opacityStyle = 0;
                zIndex = 0;
                transformStyle =
                  idx > activeServiceIndex
                    ? "translate3d(14%, 0, 0) scale(1.05)"
                    : "translate3d(-14%, 0, 0) scale(1.05)";
              }

              return (
                <div
                  key={s.id}
                  className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                  style={{
                    opacity: opacityStyle,
                    zIndex: zIndex,
                    transform: transformStyle,
                    pointerEvents: "none",
                  }}
                >
                  <Image
                    src={s.imageSrc}
                    alt={s.name}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover brightness-[0.78]"
                  />
                </div>
              );
            })}
            {/* Rich gradient overlay for crystal clear contrast */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-black/35 pointer-events-none" />
          </div>

          {/* Hero Content Container */}
          <div className="relative z-10 w-full px-6 sm:px-10 lg:px-[105px] flex-1 flex flex-col justify-center">
            {/* Main Hero Headline - staggered entrance 1 */}
            <div
              key={`headline-wrap-${activeService.id}`}
              className="overflow-hidden"
            >
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white tracking-tight leading-[1.12] max-w-4xl"
                style={{
                  animation:
                    "heroTextHeadingIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both",
                }}
              >
                {activeService.heroHeadline}
              </h1>
            </div>

            {/* Subheadline Description - staggered entrance 2 */}
            <div
              key={`subheadline-wrap-${activeService.id}`}
              className="overflow-hidden"
            >
              <p
                className="mt-3 text-sm sm:text-base md:text-lg font-sans text-white/85 max-w-2xl leading-relaxed"
                style={{
                  animation:
                    "heroTextDescIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.38s both",
                }}
              >
                {activeService.heroSubheadline}
              </p>
            </div>

            {/* 7 HERO SERVICE CARDS (Matching Homepage Hero Design, rounded-[8px]) */}
            <div className="relative mt-8 sm:mt-10 mb-3.5">
              <div className="flex lg:grid lg:grid-cols-7 items-stretch gap-2.5 sm:gap-3 lg:gap-3.5 xl:gap-4 overflow-x-auto lg:overflow-visible no-scrollbar scroll-smooth px-1 lg:px-0 pt-3 pb-3">
                {HERO_SERVICES.map((s, idx) => {
                  const IconComp = s.icon;
                  const isActive = idx === activeServiceIndex;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectService(idx)}
                      aria-pressed={isActive}
                      aria-label={`Select ${s.name}`}
                      className={`group relative shrink-0 w-[160px] sm:w-[175px] lg:w-auto h-[165px] sm:h-[180px] lg:h-[195px] rounded-[8px] transition-all duration-300 ease-out cursor-pointer text-left select-none p-3.5 sm:p-4.5 flex flex-col justify-between bg-neutral-950 ${
                        isActive
                          ? "-translate-y-1.5 scale-[1.02] z-20 shadow-[0_16px_36px_rgba(0,0,0,0.5)]"
                          : "hover:-translate-y-1.5 hover:scale-[1.01] hover:z-30 opacity-90 hover:opacity-100"
                      }`}
                    >
                      {/* Inner clipped canvas with service photo & scrims */}
                      <div className="absolute inset-0 rounded-[8px] overflow-hidden pointer-events-none">
                        <img
                          src={s.imageSrc}
                          alt=""
                          className={`absolute inset-0 w-full h-full object-cover ${s.imagePosition || "object-center"} scale-[1.05] transition-transform duration-500 ease-out group-hover:scale-[1.12]`}
                        />
                        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      </div>

                      {/* Outer border ring with standard rounded-[8px] */}
                      <div
                        className={`absolute inset-0 rounded-[8px] transition-all duration-300 pointer-events-none z-20 ${
                          isActive
                            ? "border-2 border-white ring-2 ring-white/60 shadow-[0_0_24px_rgba(255,255,255,0.55)]"
                            : "border border-white/20 group-hover:border-white group-hover:ring-1 group-hover:ring-white/40 group-hover:shadow-[0_0_18px_rgba(255,255,255,0.4)]"
                        }`}
                      />

                      {/* Top Row: Icon */}
                      <div className="relative z-30 flex items-center justify-start w-full">
                        <div className="text-white drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.95)] transition-transform duration-200 group-hover:scale-110">
                          <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                      </div>

                      {/* Bottom Row: Typography */}
                      <div className="relative z-30 w-full mt-auto">
                        <div className="text-[13.5px] sm:text-[14.5px] lg:text-[15.5px] font-bold text-white leading-tight drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.95)] whitespace-normal break-words">
                          {s.name}
                        </div>
                        <div className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] font-medium text-white/95 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] whitespace-normal break-words mt-1">
                          {s.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONCIERGE SEARCH BAR (rounded-[8px] & Blue Action Button) */}
            <div
              ref={conciergeBarRef}
              className="relative z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md text-[#1E1A17] rounded-[8px] p-3 sm:px-7 sm:py-4 lg:px-8 lg:py-4.5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-white/80 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-2">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 divide-y sm:divide-y-0 divide-[#E5E0D5]/50 min-w-0">
                  {/* CASE 1: CUSTOM HOLIDAYS */}
                  {activeService.id === "custom-holidays" && (
                    <>
                      <ConciergePillField
                        icon={Compass}
                        label="Destination"
                        value={holidayDest}
                        isOpen={openDropdown === "holiday-dest"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "holiday-dest"
                              ? null
                              : "holiday-dest",
                          )
                        }
                        options={HOLIDAY_DESTINATIONS}
                        onSelect={(val) => {
                          setHolidayDest(val);
                          setOpenDropdown(null);
                        }}
                        dropdownWidth="w-72 sm:w-80"
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={CalendarDays}
                        label="Travel Period"
                        value={holidayMonth}
                        isOpen={openDropdown === "holiday-month"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "holiday-month"
                              ? null
                              : "holiday-month",
                          )
                        }
                        options={HOLIDAY_MONTHS}
                        onSelect={(val) => {
                          setHolidayMonth(val);
                          setOpenDropdown(null);
                        }}
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
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

                  {/* CASE 2: VISA ASSISTANCE */}
                  {activeService.id === "visa-assistance" && (
                    <>
                      <ConciergePillField
                        icon={PassportIcon}
                        label="Visa Country"
                        value={visaCountry}
                        isOpen={openDropdown === "visa-country"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "visa-country"
                              ? null
                              : "visa-country",
                          )
                        }
                        options={VISA_COUNTRIES}
                        onSelect={(val) => {
                          setVisaCountry(val);
                          setOpenDropdown(null);
                        }}
                        dropdownWidth="w-72 sm:w-88"
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={CalendarDays}
                        label="Expected Timeline"
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
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
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

                  {/* CASE 3: FLIGHT BOOKING */}
                  {activeService.id === "flight-booking" && (
                    <>
                      <ConciergePillField
                        icon={PlaneTakeoff}
                        label="Flying Route"
                        value={flightRoute}
                        isOpen={openDropdown === "flight-route"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "flight-route"
                              ? null
                              : "flight-route",
                          )
                        }
                        options={FLIGHT_ROUTES}
                        onSelect={(val) => {
                          setFlightRoute(val);
                          setOpenDropdown(null);
                        }}
                        dropdownWidth="w-72 sm:w-88"
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={CalendarDays}
                        label="Departure Date"
                        value={flightDate}
                        isOpen={openDropdown === "flight-date"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "flight-date"
                              ? null
                              : "flight-date",
                          )
                        }
                        options={FLIGHT_DATES}
                        onSelect={(val) => {
                          setFlightDate(val);
                          setOpenDropdown(null);
                        }}
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={Users}
                        label="Passengers & Class"
                        value={flightClass}
                        isOpen={openDropdown === "flight-class"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "flight-class"
                              ? null
                              : "flight-class",
                          )
                        }
                        options={FLIGHT_CLASSES}
                        onSelect={(val) => {
                          setFlightClass(val);
                          setOpenDropdown(null);
                        }}
                      />
                    </>
                  )}

                  {/* CASE 4: TRAIN BOOKING */}
                  {activeService.id === "train-booking" && (
                    <>
                      <ConciergePillField
                        icon={Train}
                        label="Train Route"
                        value={trainRoute}
                        isOpen={openDropdown === "train-route"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "train-route"
                              ? null
                              : "train-route",
                          )
                        }
                        options={TRAIN_ROUTES}
                        onSelect={(val) => {
                          setTrainRoute(val);
                          setOpenDropdown(null);
                        }}
                        dropdownWidth="w-72 sm:w-88"
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={CalendarDays}
                        label="Travel Date"
                        value={trainDate}
                        isOpen={openDropdown === "train-date"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "train-date" ? null : "train-date",
                          )
                        }
                        options={TRAIN_DATES}
                        onSelect={(val) => {
                          setTrainDate(val);
                          setOpenDropdown(null);
                        }}
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={Users}
                        label="Travel Class"
                        value={trainClass}
                        isOpen={openDropdown === "train-class"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "train-class"
                              ? null
                              : "train-class",
                          )
                        }
                        options={TRAIN_CLASSES}
                        onSelect={(val) => {
                          setTrainClass(val);
                          setOpenDropdown(null);
                        }}
                      />
                    </>
                  )}

                  {/* CASE 5: BUS BOOKING */}
                  {activeService.id === "bus-booking" && (
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
                        options={BUS_ROUTES}
                        onSelect={(val) => {
                          setBusRoute(val);
                          setOpenDropdown(null);
                        }}
                        dropdownWidth="w-72 sm:w-88"
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={CalendarDays}
                        label="Travel Date"
                        value={busDate}
                        isOpen={openDropdown === "bus-date"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "bus-date" ? null : "bus-date",
                          )
                        }
                        options={BUS_DATES}
                        onSelect={(val) => {
                          setBusDate(val);
                          setOpenDropdown(null);
                        }}
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={Users}
                        label="Seat Preference"
                        value={busSeats}
                        isOpen={openDropdown === "bus-seats"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "bus-seats" ? null : "bus-seats",
                          )
                        }
                        options={BUS_SEATS}
                        onSelect={(val) => {
                          setBusSeats(val);
                          setOpenDropdown(null);
                        }}
                      />
                    </>
                  )}

                  {/* CASE 6: UMRAH PACKAGES */}
                  {activeService.id === "umrah-packages" && (
                    <>
                      <ConciergePillField
                        icon={MosqueIcon}
                        label="Package Tier"
                        value={umrahTier}
                        isOpen={openDropdown === "umrah-tier"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "umrah-tier" ? null : "umrah-tier",
                          )
                        }
                        options={UMRAH_TIERS}
                        onSelect={(val) => {
                          setUmrahTier(val);
                          setOpenDropdown(null);
                        }}
                        dropdownWidth="w-72 sm:w-88"
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={CalendarDays}
                        label="Travel Period"
                        value={umrahSeason}
                        isOpen={openDropdown === "umrah-season"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "umrah-season"
                              ? null
                              : "umrah-season",
                          )
                        }
                        options={UMRAH_SEASONS}
                        onSelect={(val) => {
                          setUmrahSeason(val);
                          setOpenDropdown(null);
                        }}
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={Users}
                        label="Pilgrims"
                        value={umrahPilgrims}
                        isOpen={openDropdown === "umrah-pilgrims"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "umrah-pilgrims"
                              ? null
                              : "umrah-pilgrims",
                          )
                        }
                        options={UMRAH_PILGRIMS}
                        onSelect={(val) => {
                          setUmrahPilgrims(val);
                          setOpenDropdown(null);
                        }}
                      />
                    </>
                  )}

                  {/* CASE 7: HAJJ PACKAGES */}
                  {activeService.id === "hajj-packages" && (
                    <>
                      <ConciergePillField
                        icon={MosqueIcon}
                        label="Package Tier"
                        value={hajjTier}
                        isOpen={openDropdown === "hajj-tier"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "hajj-tier" ? null : "hajj-tier",
                          )
                        }
                        options={HAJJ_TIERS}
                        onSelect={(val) => {
                          setHajjTier(val);
                          setOpenDropdown(null);
                        }}
                        dropdownWidth="w-72 sm:w-88"
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={CalendarDays}
                        label="Travel Period"
                        value={hajjSeason}
                        isOpen={openDropdown === "hajj-season"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "hajj-season"
                              ? null
                              : "hajj-season",
                          )
                        }
                        options={HAJJ_SEASONS}
                        onSelect={(val) => {
                          setHajjSeason(val);
                          setOpenDropdown(null);
                        }}
                      />
                      <div className="h-10 w-px bg-[#E5E0D5] mx-2 sm:mx-3.5 lg:mx-4.5 shrink-0 hidden sm:block" />
                      <ConciergePillField
                        icon={Users}
                        label="Pilgrims"
                        value={hajjPilgrims}
                        isOpen={openDropdown === "hajj-pilgrims"}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === "hajj-pilgrims"
                              ? null
                              : "hajj-pilgrims",
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
                </div>

                {/* Blue Brand Action Button */}
                <button
                  type="button"
                  onClick={handleRequestQuote}
                  className="w-full lg:w-auto h-[52px] sm:h-[56px] px-8 sm:px-10 rounded-[8px] bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white font-semibold text-[15.5px] sm:text-[16px] flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_18px_rgba(0,47,137,0.4)] hover:shadow-[0_6px_24px_rgba(0,47,137,0.55)] cursor-pointer whitespace-nowrap shrink-0 lg:ml-4 select-none active:scale-[0.98]"
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
        </section>

        {/* 3. DYNAMIC SERVICE EXPERIENCE & REQUIREMENTS HUB */}
        <section
          id="service-requirements-hub"
          className="w-full bg-[#FAF8F5]/80 py-16 sm:py-20 lg:py-24 border-b border-black/[0.06] relative"
        >
          <div className="w-full px-6 sm:px-10 lg:px-[105px]">
            {/* Hub Header & Title */}
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#002f89]/10 text-[#002f89] text-[11.5px] font-mono font-bold uppercase tracking-wider mb-3">
                <FileCheck2 className="w-3.5 h-3.5" />
                Service Requirements &amp; Coordination Desk
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1C1815] tracking-tight">
                Everything You Need to Know Before You Travel
              </h2>
              <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed font-sans">
                Explore verified document requirements, step-by-step timelines,
                and our offline concierge workflow for each service. All
                requests receive 1-on-1 human coordination through our admin
                desk.
              </p>
            </div>

            {/* Interactive 7-Service Switcher Pill Tabs (Responsive horizontal bar) */}
            <div className="mb-10 sm:mb-12">
              <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none select-none">
                {HERO_SERVICES.map((srv, idx) => {
                  const SrvIcon = srv.icon;
                  const isActive = idx === activeServiceIndex;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => handleSelectService(idx)}
                      className={`inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-[8px] text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-[#002f89] text-white shadow-md shadow-[#002f89]/25 border border-[#002f89]"
                          : "bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 border border-black/[0.08]"
                      }`}
                    >
                      <SrvIcon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-[#002f89]"
                        }`}
                      />
                      <span>{srv.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Service Showcase Card */}
            <div className="bg-white rounded-[8px] border border-black/[0.08] shadow-xs p-6 sm:p-8 lg:p-10 mb-8 sm:mb-10">
              {/* Active Service Title Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/[0.06]">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[8px] bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                    {hubData.badge}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815] tracking-tight">
                    {hubData.headline}
                  </h3>
                  <p className="text-sm text-stone-600 mt-1.5 max-w-2xl leading-relaxed">
                    {hubData.subheadline}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCardEnquiry(hubData.serviceId)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer select-none active:scale-95"
                  >
                    <span>Request Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Block 1: Trust Proof & Authority Credentials (4 Cards) */}
              <div className="mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {hubData.trustPillars.map((pillar, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] p-5 rounded-[8px] border border-black/[0.06] transition-all hover:border-[#002f89]/30 hover:shadow-2xs"
                    >
                      <span className="text-2xl sm:text-3xl font-serif font-bold text-[#002f89] tracking-tight block">
                        {pillar.stat}
                      </span>
                      <span className="text-sm font-bold text-stone-900 mt-1 block">
                        {pillar.label}
                      </span>
                      <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Block 2: Document & Eligibility Checklist */}
              <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-black/[0.06]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
                      Customer Document &amp; Eligibility Checklist
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1">
                      Gather these prerequisites. Our offline verification desk
                      reviews and validates every file prior to official
                      submission.
                    </p>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    Updated for 2026 Regulations
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {hubData.documents.map((doc, dIdx) => {
                    const badgeClasses =
                      doc.badgeType === "rose"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : doc.badgeType === "emerald"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : doc.badgeType === "amber"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-blue-50 text-blue-800 border-blue-200";

                    return (
                      <div
                        key={dIdx}
                        className="bg-white p-5 rounded-[8px] border border-black/[0.08] shadow-2xs hover:border-[#002f89]/30 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h5 className="text-sm sm:text-[15px] font-bold text-stone-900 leading-snug">
                              {doc.title}
                            </h5>
                            <span
                              className={`shrink-0 px-2.5 py-0.5 rounded-[8px] text-[10.5px] font-mono font-bold uppercase tracking-wider border ${badgeClasses}`}
                            >
                              {doc.badge}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[#002f89] block mb-2">
                            {doc.description}
                          </span>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {doc.requirement}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-start gap-2 bg-stone-50/70 p-2.5 rounded-[8px]">
                          <FileCheck2 className="w-3.5 h-3.5 text-[#002f89] shrink-0 mt-0.5" />
                          <p className="text-[11.5px] text-stone-600 leading-snug">
                            <strong className="text-stone-800">Note:</strong>{" "}
                            {doc.tip}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Block 3: Step-by-Step Workflow & Timelines */}
              <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-black/[0.06]">
                <div className="mb-6">
                  <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
                    Step-by-Step Coordination &amp; Turnaround Timelines
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Transparent milestone progression from your initial enquiry
                    to confirmed delivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {hubData.processSteps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-white p-5 rounded-[8px] border border-black/[0.08] shadow-2xs hover:border-[#002f89]/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="w-8 h-8 rounded-[8px] bg-[#002f89] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                            {step.step}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-stone-100 text-stone-700 text-[11px] font-mono font-semibold border border-stone-200/80">
                            <Clock className="w-3 h-3 text-stone-500" />
                            {step.duration}
                          </span>
                        </div>
                        <h5 className="text-sm sm:text-[15px] font-bold text-stone-900 leading-snug">
                          {step.title}
                        </h5>
                        <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Block 4: Inclusions & Enquiry Hub (Split 7 / 5 Grid) */}
              <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-black/[0.06]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
                  {/* Left Column: What Flyora Brings */}
                  <div className="lg:col-span-7 bg-[#FAF8F5]/80 p-6 sm:p-7 rounded-[8px] border border-black/[0.06] flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#002f89] block mb-1">
                        Flyora Quality Inclusions
                      </span>
                      <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1815]">
                        What Flyora Manages for You
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-600 mt-1 mb-5">
                        Every request is handled 1-on-1 by senior coordinators
                        with full logistics support.
                      </p>

                      <div className="space-y-3.5">
                        {hubData.inclusions.map((inc, iIdx) => (
                          <div key={iIdx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-xs sm:text-sm font-bold text-stone-900 block leading-snug">
                                {inc.title}
                              </strong>
                              <span className="text-xs text-stone-600 leading-relaxed block mt-0.5">
                                {inc.desc}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs text-stone-500 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#002f89]" />
                      <span>
                        All bookings processed directly via official partner
                        portals &amp; licensed desks.
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Enquiry Action Card (No direct checkout, pure lead routing) */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-[#002f89] to-[#001c54] text-white p-6 sm:p-7 rounded-[8px] shadow-md flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-[8px] bg-white/15 border border-white/20 text-[10.5px] font-mono uppercase tracking-wider text-amber-200 mb-3">
                        Manual Concierge Desk
                      </span>
                      <h4 className="text-2xl font-serif font-bold leading-tight">
                        {hubData.ctaHeadline}
                      </h4>
                      <p className="text-xs sm:text-sm text-white/85 mt-2.5 leading-relaxed font-sans">
                        {hubData.ctaSubheadline}
                      </p>
                    </div>

                    <div className="mt-6 space-y-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleCardEnquiry(hubData.serviceId, {
                            serviceId: hubData.serviceId,
                            serviceName: hubData.name,
                            destination: "",
                            travelDate: "",
                            tierOrClass: "",
                            summaryLabel: `${hubData.name} · Specialist Inquiry`,
                          })
                        }
                        className="w-full py-3.5 px-5 rounded-[8px] bg-white hover:bg-amber-100 text-stone-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <span>{hubData.ctaButtonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <a
                        href={`https://wa.me/919876543210?text=${encodeURIComponent(
                          hubData.whatsappMessage,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-5 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat Directly on WhatsApp</span>
                      </a>

                      <div className="pt-3 border-t border-white/15 text-[11px] text-white/75 flex items-center justify-between">
                        <span>✓ Zero upfront payment</span>
                        <span>✓ 15-min human response</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. COASTAL STATS STRIP WITH PARALLAX MOTION */}
        <section className="relative bg-[#FDFCFB] overflow-hidden">
          {/* Subtle Sailboat Watermark on bottom left matching reference image */}
          <div className="absolute left-6 bottom-16 w-36 h-36 opacity-10 pointer-events-none select-none text-[#002f89]">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <path
                d="M10 75 Q50 90 90 75 L78 85 Q50 95 22 85 Z"
                fill="currentColor"
                opacity="0.3"
              />
              <line x1="50" y1="20" x2="50" y2="75" strokeWidth="3" />
              <path
                d="M50 25 L82 70 L50 70 Z"
                fill="currentColor"
                opacity="0.2"
              />
              <path
                d="M46 32 L20 70 L46 70 Z"
                fill="currentColor"
                opacity="0.15"
              />
            </svg>
          </div>

          {/* Coastal Panoramic Counter Strip with Parallax Motion & Full Width Spacing */}
          <div
            ref={statsSectionRef}
            className="relative w-full h-[210px] sm:h-[240px] lg:h-[270px] overflow-hidden flex items-center justify-center"
          >
            {/* Panoramic Background Image with Dynamic Parallax Motion */}
            <div
              ref={parallaxImageRef}
              className="absolute -top-[20%] -bottom-[20%] inset-x-0 h-[140%] w-full will-change-transform"
              style={{
                transform: "translate3d(0, 0px, 0) scale(1.18)",
              }}
            >
              <Image
                src="/gallery/stats-coastal-bg.jpg"
                alt="Coastal travel statistics"
                fill
                sizes="100vw"
                className="object-cover object-center brightness-[0.82]"
              />
            </div>

            {/* Rich espresso/black gradient tint overlay (eliminates cold blue cast) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1C1815]/80 via-[#1C1815]/55 to-[#1C1815]/80 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

            {/* Decorative dashed flight curve line overlay with airplane animation */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
              preserveAspectRatio="none"
              viewBox="0 0 1360 220"
            >
              <defs>
                <path
                  id="flightCurve"
                  d="M -160 160 Q 340 30 680 120 T 1520 80"
                />
                <radialGradient id="propellerBlur" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.45" />
                  <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.32" />
                  <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Yellow dotted flight line */}
              <path
                d="M -160 160 Q 340 30 680 120 T 1520 80"
                fill="none"
                stroke="#FDE68A"
                strokeWidth="1.75"
                strokeDasharray="6 6"
                strokeOpacity="0.55"
                className="animate-flight-dash"
              />

              {/* Flying Airplane with trailing banner and spinning front fan */}
              <g>
                <animateMotion dur="16s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#flightCurve" />
                </animateMotion>

                {/* Airplane Body & Banner (Pristine no-fan image) */}
                <image
                  href="/services/airplanenewnofan_clean.png"
                  x="-118"
                  y="-28"
                  width="165"
                  height="55"
                />

                {/* Spinning Front Fan / Propeller (Adjusted to slightly smaller, balanced scale) */}
                <g transform="translate(33.8, -3.0) scale(0.50)">
                  {/* Shimmering Circular Wind Blur Disk */}
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="15"
                    ry="15"
                    fill="url(#propellerBlur)"
                  />

                  {/* Fast Rotating Fan Blades & Speed Streaks */}
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 0 0"
                      to="360 0 0"
                      dur="0.10s"
                      repeatCount="indefinite"
                    />

                    {/* 3 Aerodynamic Blades */}
                    <path
                      d="M 0 0 C -2.5 -5 -3 -10 0 -15 C 3 -10 2.5 -5 0 0 Z"
                      fill="rgba(255, 255, 255, 0.95)"
                      stroke="#1C1815"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M 0 0 C -2.5 -5 -3 -10 0 -15 C 3 -10 2.5 -5 0 0 Z"
                      fill="rgba(255, 255, 255, 0.95)"
                      stroke="#1C1815"
                      strokeWidth="1.3"
                      transform="rotate(120)"
                    />
                    <path
                      d="M 0 0 C -2.5 -5 -3 -10 0 -15 C 3 -10 2.5 -5 0 0 Z"
                      fill="rgba(255, 255, 255, 0.95)"
                      stroke="#1C1815"
                      strokeWidth="1.3"
                      transform="rotate(240)"
                    />

                    {/* Air Speed Wind Rings */}
                    <circle
                      r="14"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.8)"
                      strokeWidth="1.4"
                      strokeDasharray="4 6"
                    />
                    <circle
                      r="10.5"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.55)"
                      strokeWidth="1.1"
                      strokeDasharray="5 5"
                    />
                  </g>

                  {/* Front Nose Hub Cone in Center */}
                  <circle
                    cx="0"
                    cy="0"
                    r="3.8"
                    fill="#F59E0B"
                    stroke="#1C1815"
                    strokeWidth="1.3"
                  />
                  <circle cx="-1" cy="-1" r="1.4" fill="#FEF08A" />
                </g>
              </g>
            </svg>

            {/* 4 Stats Grid: Same width as other sections (max-w-[1360px]) with 4 equal gaps */}
            <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 lg:gap-14 text-center">
              {PICKUP_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center w-full px-2"
                >
                  <span
                    className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-105"
                    style={{
                      WebkitTextStroke: "2px rgba(255, 255, 255, 0.95)",
                      color: "transparent",
                    }}
                  >
                    {stat.value}
                  </span>
                  <span className="mt-2 text-xs sm:text-sm lg:text-[15px] font-sans font-bold uppercase tracking-[0.18em] text-amber-100/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. POPULAR & TRENDING PACKAGES CAROUSEL */}
        <CarouselCards />

        {/* 6. MID-PAGE CINEMATIC QUOTE BANNER WITH PARALLAX MOTION EFFECT */}
        <section
          ref={creedSectionRef}
          className="relative w-full py-24 sm:py-32 lg:py-36 overflow-hidden flex items-center justify-center"
        >
          {/* Parallax Background Image with Scroll Motion */}
          <div
            ref={creedImageRef}
            className="absolute -top-[20%] -bottom-[20%] inset-x-0 h-[140%] w-full will-change-transform"
            style={{
              transform: "translate3d(0, 0px, 0) scale(1.18)",
            }}
          >
            <Image
              src="/services/custom-holidays.jpg"
              alt="Luxury Overwater Bungalow Retreat"
              fill
              sizes="100vw"
              className="object-cover object-center brightness-[0.58]"
            />
          </div>

          {/* Cinematic dark gradient overlays for rich contrast and text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/75 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight drop-shadow-md">
              &ldquo;Travel isn&rsquo;t a luxury, it&rsquo;s a way of
              life!&rdquo;
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed drop-shadow-sm font-sans">
              Explore the globe with tailored itineraries, verified visas, and
              first-class care on every departure.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handleCardEnquiry("Custom Holidays")}
                className="px-7 py-3.5 rounded-xl bg-white text-stone-900 text-xs sm:text-sm font-sans font-semibold uppercase tracking-wider hover:bg-[#FAF7F2] transition-all duration-200 shadow-xl cursor-pointer active:scale-95"
              >
                Plan Your Vacation
              </button>
              <a
                href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20am%20ready%20to%20plan%20my%20trip."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-sans font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xl active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp />

      {/* Enquiry Modal for Card CTAs */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalPrefill(undefined);
        }}
        defaultServiceId={modalServiceId}
        prefill={modalPrefill}
      />
    </div>
  );
}
