"use client";
import { useServicesCatalog } from "../../lib/use-services-catalog";
import { resolveService } from "../../lib/service-catalog";
import { serviceImage } from "../../lib/service-visuals";
import type { PackageSummary, ServiceSummary } from "@flyora/types";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import {
  EnquiryModal,
  type EnquiryPrefill,
} from "../../components/EnquiryModal";
import { HeroSearchCard } from "@/components/HeroSearchCard";
import CarouselCards from "@/components/ui/carousel-cards";
import InteractiveImageBentoGallery, {
  type ImageItem,
} from "@/components/ui/bento-gallery";
import BentoGridShowcase from "@/components/ui/bento-product-features";
import Timeline, { type TimelineEntry } from "@/components/ui/timeline";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft,
  Search,
  MapPin,
  Star,
  XCircle,
  X,
} from "lucide-react";
import {
  POPULAR_VISA_COUNTRIES,
  type PopularVisaCountry,
} from "@/lib/visaCountriesData";

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

interface ServiceHeroConfig {
  id: string;
  serviceId: string;
  name: string;
  subtitle: string;
  badge: string;
  heroHeadline: string;
  heroSubheadline: string;
  imageSrc: string;
  cardImageSrc: string;
  imagePosition?: string;
  cardImagePosition?: string;
  icon: React.ComponentType<{ className?: string }>;
  scrollCue: string;
}

const SERVICE_TEMPLATES: ServiceHeroConfig[] = [
  {
    id: "custom-holidays",
    serviceId: "holiday-packages",
    name: "Custom Holidays",
    subtitle: "International & Local",
    badge: "Tailored Luxury",
    heroHeadline: "Bespoke Luxury Holiday Planning",
    heroSubheadline:
      "Private luxury itineraries, 5-star villas, and hand-curated experiences worldwide.",
    imageSrc: "/services/custom-holidays.webp",
    cardImageSrc: "/services/custom-holidays.webp",
    imagePosition: "object-[72%_50%]",
    cardImagePosition: "object-[72%_50%]",
    icon: VacationPlaneIcon,
    scrollCue: "Explore Handpicked Holiday Tours & Curated Pickups",
  },
  {
    id: "visa-assistance",
    serviceId: "visa-assistance",
    name: "Visa Assistance",
    subtitle: "Hassle-free Process",
    badge: "Fast-Track",
    heroHeadline: "Hassle-Free Global Visa Approvals",
    heroSubheadline:
      "Express appointment booking, document audit, and 99.2% approval success for 100+ countries.",
    imageSrc: "/services/visa-assistance.webp",
    cardImageSrc: "/services/visa-assistance.webp",
    imagePosition: "object-[30%_55%]",
    cardImagePosition: "object-[30%_55%]",
    icon: PassportIcon,
    scrollCue: "Explore 10 Popular Visa Countries & Document Dossier",
  },
  {
    id: "flight-booking",
    serviceId: "flight-booking",
    name: "Flight Booking",
    subtitle: "Best Fares",
    badge: "Best Fares",
    heroHeadline: "Commercial & Business Air Ticketing",
    heroSubheadline:
      "Access unpublished corporate partner fares, flexible routing, and 24/7 flight rebooking.",
    imageSrc: "/services/flight-booking.webp",
    cardImageSrc: "/services/flight-booking.webp",
    imagePosition: "object-[65%_45%]",
    cardImagePosition: "object-[65%_45%]",
    icon: Plane,
    scrollCue: "Explore Verified Flight Routes & Issuance Concierge",
  },
  {
    id: "hotel-booking",
    serviceId: "hotel-booking",
    name: "Hotel Booking",
    subtitle: "Luxury Stays & Villas",
    badge: "5-Star Partner",
    heroHeadline: "Exclusive Luxury Resorts, Villas & Palaces",
    heroSubheadline:
      "Direct wholesale allocations, VIP room upgrades, complimentary breakfast, and flexible cancellation at 5,000+ premium properties worldwide.",
    imageSrc: "/services/hotel-booking.webp",
    cardImageSrc: "/services/hotel-booking.webp",
    imagePosition: "object-[50%_50%]",
    cardImagePosition: "object-[50%_50%]",
    icon: Building2,
    scrollCue: "Explore Handpicked 5-Star Suites & Partner Properties",
  },
  {
    id: "bus-booking",
    serviceId: "bus-booking",
    name: "Bus & Train Booking",
    subtitle: "Comfort Travel & Fast Rail",
    badge: "Scenic & Express",
    heroHeadline: "Confirmed Rail Berths & Luxury Highway Coaches",
    heroSubheadline:
      "Guaranteed train PNR confirmations, Tatkal priority allocation, and multi-axle AC sleeper buses across 1,000+ national routes.",
    imageSrc: "/services/train-booking.webp",
    cardImageSrc: "/services/train-booking.webp",
    imagePosition: "object-[70%_55%]",
    cardImagePosition: "object-[70%_55%]",
    icon: Train,
    scrollCue:
      "Explore Confirmed Rail Berths, Volvo Schedules & Ground Transit",
  },
  {
    id: "umrah-hajj",
    serviceId: "umrah-hajj",
    name: "Umrah & Hajj",
    subtitle: "Sacred Pilgrimages",
    badge: "Spiritual Journey",
    heroHeadline: "Sacred & Blessed Umrah & Hajj Pilgrimages",
    heroSubheadline:
      "Pilgrimage packages, visa, flights, and direct hotel arrangements steps from the Holy Haram courtyard in Makkah and Madinah.",
    imageSrc: "/services/umrah-packages.webp",
    cardImageSrc: "/services/umrah-packages.webp",
    imagePosition: "object-[82%_45%]",
    cardImagePosition: "object-[82%_45%]",
    icon: MosqueIcon,
    scrollCue: "Explore Sacred Umrah & Hajj Tiers, Hotels & Ziyarat",
  },
  {
    id: "passport-assistance",
    serviceId: "escort-parking",
    name: "Passport Assistance",
    subtitle: "Hassle-Free Verification",
    badge: "Tatkal & Standard",
    heroHeadline: "Express Passport Application & Verification Concierge",
    heroSubheadline:
      "Complete assistance for fresh passport applications, renewals, minor passports, and Tatkal express appointments with zero paperwork rejections.",
    imageSrc: "/services/passport-service.webp",
    cardImageSrc: "/services/passport-service.webp",
    imagePosition: "object-[50%_50%]",
    cardImagePosition: "object-[50%_50%]",
    icon: PassportIcon,
    scrollCue: "Explore Passport Application Steps & Document Checklist",
  },
  {
    id: "travel-insurance",
    serviceId: "travel-insurance",
    name: "Travel Insurance",
    subtitle: "Worldwide Cashless Cover",
    badge: "IRDAI Approved",
    heroHeadline: "Comprehensive Global Cashless Travel Insurance",
    heroSubheadline:
      "Instant embassy-approved travel insurance covers for medical emergencies, flight cancellations, baggage loss, and passport protection up to $500,000.",
    imageSrc: "/services/travel-insurance.webp",
    cardImageSrc: "/services/travel-insurance.webp",
    imagePosition: "object-[50%_50%]",
    cardImagePosition: "object-[50%_50%]",
    icon: ShieldCheck,
    scrollCue: "Explore Cashless Hospital Networks & Policy Coverages",
  },
];

const DEFAULT_SERVICES: ServiceSummary[] = [
  {
    id: "02601693-e1d3-4d25-8e44-75b6c5e58b4b",
    name: "Bus & Train Booking",
    slug: "bus-booking",
    isDomestic: true,
    isInternational: false,
    isActive: true,
    displayOrder: 0,
    minMarginPercent: 10,
    description: "Domestic train and bus ticket booking",
  },
  {
    id: "f321ad14-df06-47b3-904b-8b239bf95b58",
    name: "Flight Booking",
    slug: "flight-booking",
    isDomestic: true,
    isInternational: true,
    isActive: true,
    displayOrder: 1,
    minMarginPercent: 5,
    description: "Domestic and international airline tickets and group fares.",
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
    description: "Customized domestic and international holiday tour packages.",
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
    description: "Worldwide luxury and budget hotel reservations.",
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
    description:
      "Pilgrimage packages, visa, flights, and direct hotel arrangements in Makkah and Madinah.",
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
    description:
      "Tourist and business visa documentation and application processing.",
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
    description: "All passport work assistance",
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
    description: "Comprehensive travel insurance covers",
  },
];

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

const TOP_PICKUP_BENTO_ITEMS: ImageItem[] = [
  {
    id: "pickup-1",
    title: "Villa Aquarium",
    desc: "Luxury waterfront estate with 2 curated tours & private lagoon.",
    url: "/gallery/villa-aquarium.jpg",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    id: "pickup-2",
    title: "La Cabane",
    desc: "Secluded beachside sanctuary with bespoke concierge service.",
    url: "/gallery/la-cabane.jpg",
    span: "md:row-span-1",
  },
  {
    id: "pickup-3",
    title: "Azure Overwater Bungalow",
    desc: "Direct ocean lagoon access with 3 all-inclusive luxury tours.",
    url: "/gallery/azure.jpg",
    span: "md:row-span-1",
  },
  {
    id: "pickup-4",
    title: "Serene Alpine Chalet",
    desc: "Pristine mountain snowscapes with fireside alpine tranquility.",
    url: "/gallery/serene.jpg",
    span: "md:row-span-2",
  },
  {
    id: "pickup-5",
    title: "Verdant Jungle Sanctuary",
    desc: "Immersive rainforest eco-haven with private canopy views.",
    url: "/gallery/verdant.jpg",
    span: "md:row-span-1",
  },
  {
    id: "pickup-6",
    title: "Solitude Atoll",
    desc: "Exclusive private island bliss in the turquoise Maldives.",
    url: "/destinations/maldives_hd.jpg",
    span: "md:col-span-2 md:row-span-1",
  },
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

const UMRAH_GALLERY_PHOTOS = [
  {
    src: "/services/umrah-packages.webp",
    alt: "Holy Kaaba & Grand Mosque Courtyard",
    label: "Makkah Al-Mukarramah",
  },
  {
    src: "/services/madinah-mosque.jpg",
    alt: "Prophet's Mosque & Green Dome",
    label: "Madinah Al-Munawwarah",
  },
  {
    src: "/services/hotel-suite-luxury.jpg",
    alt: "5-Star Courtyard Facing Executive Suite",
    label: "5-Star Haram Suite",
  },
  {
    src: "/services/makkah-clocktower.jpg",
    alt: "Makkah Clock Tower & Royal Clock",
    label: "Abraj Al-Bait",
  },
];

const HAJJ_GALLERY_PHOTOS = [
  {
    src: "/services/hajj-packages.webp",
    alt: "Mount Arafat & Jabal al-Rahmah",
    label: "Plain of Arafat",
  },
  {
    src: "/packages/hajj.jpg",
    alt: "Air-Conditioned Mina Camps",
    label: "Deluxe Mina Tents",
  },
  {
    src: "/packages/makkah.jpg",
    alt: "Holy Kaaba Tawaf al-Ifadah",
    label: "Tawaf Al-Ifadah",
  },
  {
    src: "/services/madinah-mosque.jpg",
    alt: "Madinah Ziyarat & Rawdah",
    label: "Madinah Ziyarat",
  },
];

type PilgrimageTierKey = "executive" | "deluxe" | "vip";

interface PilgrimageTierInfo {
  name: string;
  price: string;
  priceUsd: string;
  perPerson: string;
  makkahHotel: string;
  madinahHotel: string;
  distance: string;
  transit: string;
  guide: string;
  duration: string;
}

const UMRAH_TIER_DATA: Record<PilgrimageTierKey, PilgrimageTierInfo> = {
  executive: {
    name: "Deluxe Walking Distance",
    price: "Custom Quote",
    priceUsd: "Best Rates",
    perPerson: "Tailored to travel month & room tier",
    makkahHotel: "5-Star Courtyard Hotel (Short Walking Distance)",
    madinahHotel: "5-Star Central Hotel (Direct Rawdah Steps)",
    distance: "Direct walk to Holy Haram courtyard",
    transit: "Haramain High-Speed Bullet Train",
    guide: "Bilingual Scholar Guidance Included",
    duration: "10 to 15 Days Flexible",
  },
  deluxe: {
    name: "Economy Group Batch",
    price: "Custom Quote",
    priceUsd: "Best Rates",
    perPerson: "Fixed departures with shuttle access",
    makkahHotel: "3–4 Star Hotel with 24/7 Dedicated Haram Shuttle",
    madinahHotel: "Comfortable Central Hotel (Walking Access)",
    distance: "24/7 Complimentary AC Haram Shuttle",
    transit: "Air-Conditioned Luxury Coach Fleet",
    guide: "Group Leader & Muallim Support",
    duration: "14 to 15 Days Fixed Departures",
  },
  vip: {
    name: "VIP Haram View Suite",
    price: "Custom Quote",
    priceUsd: "Best Rates",
    perPerson: "Private family & executive departures",
    makkahHotel: "Clock Tower / Direct Kaaba View Suite",
    madinahHotel: "5-Star Luxury Front-Row Presidential Suite",
    distance: "Direct Private Elevator Access to Haram",
    transit: "Private GMC Yukon / VIP Chauffeur",
    guide: "Private Dedicated Scholar & Concierge",
    duration: "Customized Itinerary Length",
  },
};

const HAJJ_TIER_DATA: Record<PilgrimageTierKey, PilgrimageTierInfo> = {
  executive: {
    name: "Deluxe Non-Shifting",
    price: "Official Quota",
    priceUsd: "Ministry Rates",
    perPerson: "Ministry-Approved Category A Allocation",
    makkahHotel: "Continuous 5-Star Hotel Stay (No Shifting)",
    madinahHotel: "Central Markaziyah Accommodations",
    distance: "Zone A Air-Conditioned Mina Camps",
    transit: "Mashair Sacred Train & VIP GMC",
    guide: "Accompanied by Senior Islamic Scholars",
    duration: "18 to 22 Days",
  },
  deluxe: {
    name: "Standard Shifting Batch",
    price: "Official Quota",
    priceUsd: "Ministry Rates",
    perPerson: "Accredited Private Operator Partner",
    makkahHotel: "Azizia Building + Central Makkah Stay",
    madinahHotel: "Comfortable Markaziyah Hotel",
    distance: "Zone B Air-Conditioned Mina Tents",
    transit: "Dedicated AC Luxury Coach Fleet",
    guide: "Bilingual Scholar Guides & Group Muallim",
    duration: "24 to 28 Days",
  },
  vip: {
    name: "VIP Private European Camp",
    price: "Official Quota",
    priceUsd: "Ministry Rates",
    perPerson: "Premium European Camp Allocation",
    makkahHotel: "Clock Tower / Front-Row Kaaba View Suite",
    madinahHotel: "5-Star Front-Row Luxury Hotel",
    distance: "Zone A+ Closest Mina Camps to Jamarat",
    transit: "VIP Private Mashair & Executive Chauffeur",
    guide: "Dedicated Personal Scholar & Concierge",
    duration: "14 to 18 Days",
  },
};

const UMRAH_TIMELINE_DATA: TimelineEntry[] = [
  {
    title: "Step 01",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            Arrival &amp; VIP Transit
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Arrival in Jeddah &amp; VIP Transfer to Makkah
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Greeted at King Abdulaziz International Airport (JED) by Flyora&apos;s
          representative right at baggage claim. Escorted private transfer to
          your 5-star hotel steps from the King Abdulaziz Haram Gate. Your
          luggage is handled directly to your room so you can prepare
          comfortably for Ihram.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Private Chauffeur
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            5-Star Courtyard Hotel
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Welcome Zamzam Refreshment
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Step 02",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            Sacred First Umrah Rites
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Guided First Umrah Tawaf &amp; Sa&apos;i
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Accompanied by our experienced resident scholar for your sacred Umrah
          rites—including pre-departure Ihram briefing, step-by-step Tawaf
          supplications, and Sa&apos;i at Safa &amp; Marwa with elderly-friendly
          pacing.
        </p>
        <div className="relative w-full max-w-xl h-48 sm:h-56 rounded-[14px] overflow-hidden border border-black/[0.08] shadow-xs mt-3">
          <Image
            src="/services/makkah-clocktower.jpg"
            alt="Holy Haram Courtyard & Kaaba"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-[6px] bg-black/60 backdrop-blur-md text-xs text-white/95 font-medium border border-white/20">
            Walking distance to the Holy Kaaba &amp; Grand Mosque
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Resident Scholar Guidance
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Sunnah-Compliant Duas
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Step 03",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            Historical Makkah Ziyarat
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Historical Makkah Ziyarat &amp; Sacred Sites
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Private air-conditioned exploration of Cave Hira (Jabal al-Nour), Cave
          Thawr, Mount Arafat (Jabal al-Rahmah), Muzdalifah, and the Mina tent
          valley with certified historical commentary from our scholar.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            AC Private Transport
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Scholar Commentary
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            In time for Haram Dhuhr Prayers
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Step 04",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            High-Speed Rail Transit
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Haramain High-Speed Bullet Train to Madinah
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Seamless 2-hour transit in VIP Business Class through the desert at
          300 km/h, arriving directly at your luxury hotel overlooking the
          Prophet&apos;s Mosque courtyard.
        </p>
        <div className="relative w-full max-w-xl h-48 sm:h-56 rounded-[14px] overflow-hidden border border-black/[0.08] shadow-xs mt-3">
          <Image
            src="/services/vip-transit.jpg"
            alt="Haramain VIP Bullet Train"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-[6px] bg-black/60 backdrop-blur-md text-xs text-white/95 font-medium border border-white/20">
            Haramain High-Speed VIP Business Class Transit
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            300 km/h VIP Business Class
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Station Luggage Concierge
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Step 05",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            Riyadh ul-Jannah Noble Garden
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Rawdah Sharif Appointment &amp; Madinah Ziyarat
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Pre-booked official Nusuk permits for Riyadh ul-Jannah (The Noble
          Garden). Guided visits to Masjid Quba, Mount Uhud martyrs cemetery,
          and Masjid al-Qiblatayn.
        </p>
        <div className="relative w-full max-w-xl h-48 sm:h-56 rounded-[14px] overflow-hidden border border-black/[0.08] shadow-xs mt-3">
          <Image
            src="/services/madinah-mosque.jpg"
            alt="Prophet's Mosque in Madinah"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-[6px] bg-black/60 backdrop-blur-md text-xs text-white/95 font-medium border border-white/20">
            Al-Masjid an-Nabawi Courtyard in Madinah Al-Munawwarah
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            100% Guaranteed Nusuk Slot
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Masjid Quba Guided Prayer
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Step 06",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            Farewell &amp; Departure
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Farewell Prayers &amp; Zamzam Handover
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Final farewell prayers at the Prophet&apos;s Mosque. Handover of
          certified, airline-approved 5-liter Zamzam canister and escorted
          private transfer to the airport.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Certified 5L Zamzam Canister
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Escorted Airport Chauffeur
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Dedicated Baggage Assistance
          </span>
        </div>
      </div>
    ),
  },
];

const HAJJ_TIMELINE_DATA: TimelineEntry[] = [
  {
    title: "Stage 01",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            Arrival &amp; Spiritual Orientation
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Arrival, Welcome &amp; Spiritual Orientation
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Arrival at Jeddah/Madinah, hotel check-in, orientation seminars with
          scholarly guides on Hajj rituals, and group preparation for the Day of
          Tarwiyah.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            5-Star Hotel Stay
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Scholar Seminars
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Stage 02",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            Day of Tarwiyah · Departure to Mina
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Day of Tarwiyah · Departure to Mina
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Don the sacred Ihram. Transfer to the deluxe European air-conditioned
          Mina camps. Perform Dhuhr, Asr, Maghrib, Isha, and Fajr prayers in
          devotion.
        </p>
        <div className="relative w-full max-w-xl h-48 sm:h-56 rounded-[14px] overflow-hidden border border-black/[0.08] shadow-xs mt-3">
          <Image
            src="/packages/hajj.jpg"
            alt="Mina Camps & Mashair"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-[6px] bg-black/60 backdrop-blur-md text-xs text-white/95 font-medium border border-white/20">
            Zone A Deluxe Air-Conditioned Mina Camps
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            European Air-Conditioned Tents
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            3-Course Hot Buffet
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Stage 03",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            The Pinnacle of Hajj · Arafat &amp; Muzdalifah
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            The Blessed Day of Arafat &amp; Muzdalifah
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Stand on the plain of Arafat from Dhuhr to Sunset for Wuqoof and dua.
          At sunset, proceed peacefully via Mashair metro train to Muzdalifah
          for open-sky rest and pebble collection.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Wuqoof on Jabal al-Rahmah
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Mashair Metro Train Transit
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Stage 04",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            Yawm an-Nahr · Rami, Qurbani &amp; Halq
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Yawm an-Nahr · Rami, Qurbani &amp; Halq
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Perform Rami at Jamarat al-Aqaba, complete the animal sacrifice
          (Qurbani), shave or trim hair (Halq/Taqseer), and exit first Ihram
          before returning to Makkah hotel.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Scholar-Escorted Jamarat Stoning
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Non-Shifting Makkah Room Access
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Stage 05",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            Days of Tashreeq in Mina
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Days of Tashreeq in Mina &amp; Tawaf al-Ifadah
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          Stoning of the three Jamarat daily, spiritual reflections, and
          performing Tawaf al-Ifadah and Sa&apos;i at the Holy Kaaba in Makkah.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Tawaf al-Ifadah Completion
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Ongoing Scholar Support
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Stage 06",
    content: (
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-[6px] bg-[#E8EEFB] text-[#002f89] text-xs font-bold tracking-normal mb-2.5">
            Madinah Al-Munawwarah &amp; Farewell
          </span>
          <h4 className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
            Madinah Al-Munawwarah &amp; Farewell
          </h4>
        </div>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
          High-speed rail journey to Madinah for prayers at the Prophet&apos;s
          Mosque, Rawdah Sharif visits, and heartfelt departure with 5L Zamzam.
        </p>
        <div className="relative w-full max-w-xl h-48 sm:h-56 rounded-[14px] overflow-hidden border border-black/[0.08] shadow-xs mt-3">
          <Image
            src="/services/madinah-mosque.jpg"
            alt="Prophet's Mosque in Madinah"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-[6px] bg-black/60 backdrop-blur-md text-xs text-white/95 font-medium border border-white/20">
            The Prophet&apos;s Mosque in Madinah Al-Munawwarah
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            Guaranteed Rawdah Slot
          </span>
          <span className="text-xs bg-[#FAF8F5] text-stone-800 border border-black/[0.08] px-3 py-1.5 rounded-[8px] font-medium flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
            5L Sealed Zamzam Canister
          </span>
        </div>
      </div>
    ),
  },
];

const PILGRIMAGE_PARTNER_GUARANTEES = [
  {
    title: "Ministry-Accredited Operators Only",
    desc: "We exclusively connect pilgrims to officially licensed Saudi Ministry of Hajj & Umrah authorized tour partners for authentic visas and verified lodging.",
  },
  {
    title: "Official Nusuk & Rawdah Slot Assistance",
    desc: "Complete pre-trip guidance on Saudi Tourist/Umrah visas, medical coverage, and appointment scheduling for praying inside the sacred Rawdah Sharif.",
  },
  {
    title: "Transparent Group & Private Batches",
    desc: "Clear departure schedules with flexible sharing tiers (Double, Triple, Quad) or private family suites, backed by transparent pricing.",
  },
  {
    title: "Dedicated Pre-Departure & Local Support",
    desc: "Pre-travel preparation briefing, experienced scholarly guidance on the manasik, luggage coordination, and 24/7 dedicated support desk.",
  },
];

const HAJJ_PARTNER_GUARANTEES = [
  {
    title: "Official Nusuk Hajj Advisory",
    desc: "Step-by-step guidance navigating the official Nusuk Hajj platform, profile approvals, documentation checks, and quota timeline adherence.",
  },
  {
    title: "Ministry-Licensed Category Allocations",
    desc: "Direct coordination with accredited Category A & B private organizers providing confirmed air-conditioned Mina camps and Mashair transit.",
  },
  {
    title: "Scholarly Pre-Hajj Orientation",
    desc: "In-depth seminars and educational materials covering each day of the Manasik so every pilgrim embarks with full confidence and tranquility.",
  },
  {
    title: "Dedicated Ground Muallim Assistance",
    desc: "Experienced group leaders and multilingual scholars accompanying groups across Mina, Arafat, Muzdalifah, and the Jamarat.",
  },
];

const PILGRIMAGE_INCLUSIONS = [
  "5-Star walking-distance hotel steps from Haram courtyard",
  "Authorized Saudi Tourist / Umrah eVisa & medical insurance",
  "Haramain High-Speed Bullet Train VIP Business Class tickets",
  "Comprehensive historical Ziyarat in Makkah & Madinah",
  "Guaranteed Rawdah Sharif Nusuk booking slot",
  "Daily international buffet breakfast in hotel",
  "Complimentary sealed 5L airline-approved Zamzam canister",
  "24/7 dedicated Flyora ground coordinator & resident scholar",
];

const PILGRIMAGE_EXCLUSIONS = [
  "International flight tickets (add-on packages available)",
  "Personal laundry, phone calls & hotel room service",
  "Individual Qurbani / animal sacrifice (optional add-on)",
  "Lunch & dinner outside scheduled package meals",
];

const PILGRIMAGE_REVIEWS = [
  {
    name: "Dr. Tariq & Farida Mansoor",
    location: "London, United Kingdom",
    stars: 5,
    date: "Travelled Oct 2026",
    package: "Executive 5-Star Umrah",
    text: "The 50-meter proximity to the Haram made all the difference for my elderly mother. The scholar was patient, knowledgeable, and the Haramain bullet train was seamless. Every promise was kept flawlessly.",
  },
  {
    name: "Ahmed & Sabiha Qureshi",
    location: "Dubai, United Arab Emirates",
    stars: 5,
    date: "Travelled Sep 2026",
    package: "Custom VIP Family Umrah",
    text: "From our private Jeddah pickup to our guaranteed Rawdah appointment, Flyora handled every detail with genuine 5-star hospitality. The Kaaba view room was unforgettable.",
  },
];

export default function ServicesPage() {
  const { services, loaded, error, retry } = useServicesCatalog();
  const catalogServices =
    services && services.length > 0 ? services : DEFAULT_SERVICES;
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [groundTransitTab, setGroundTransitTab] = useState<"train" | "bus">(
    "train",
  );
  const [pilgrimageTab, setPilgrimageTab] = useState<"umrah" | "hajj">("umrah");
  const HERO_SERVICES = useMemo(() => {
    return SERVICE_TEMPLATES.map((template) => {
      const backendService = resolveService(
        catalogServices,
        template.serviceId,
      );
      return {
        ...template,
        id: template.id,
        slug: backendService?.slug || template.id,
        serviceId: backendService?.id || template.id,
        name: template.name,
        heroHeadline: template.heroHeadline,
        heroSubheadline:
          backendService?.description ||
          template.heroSubheadline ||
          "Tell us your travel plans.",
        imageSrc: template.imageSrc,
        cardImageSrc: template.cardImageSrc,
      };
    });
  }, [catalogServices]);
  const selected = resolveService(
    catalogServices,
    selectedSlug || HERO_SERVICES[activeServiceIndex]?.slug,
  );
  const unavailable = !!selectedSlug && !selected;
  const [prevIndex, setPrevIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const activeService = HERO_SERVICES[activeServiceIndex] || {
    ...SERVICE_TEMPLATES[0],
    slug: "",
    serviceId: "",
  };
  const hubData =
    SERVICE_HUB_DATA[activeService.id] || SERVICE_HUB_DATA["custom-holidays"];

  // Motion parallax refs for coastal stats banner & Creed banner
  const statsSectionRef = useRef<HTMLDivElement>(null);
  const parallaxImageRef = useRef<HTMLDivElement>(null);
  const creedSectionRef = useRef<HTMLDivElement>(null);
  const creedImageRef = useRef<HTMLDivElement>(null);

  // Popular visa destinations carousel refs & search state
  const visaCarouselRef = useRef<HTMLDivElement>(null);
  const [canScrollVisaLeft, setCanScrollVisaLeft] = useState(false);
  const [canScrollVisaRight, setCanScrollVisaRight] = useState(true);
  const [visaSearchQuery, setVisaSearchQuery] = useState("");
  const [visaSelectedRegion, setVisaSelectedRegion] = useState("All");

  const checkVisaScroll = () => {
    if (visaCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = visaCarouselRef.current;
      setCanScrollVisaLeft(scrollLeft > 10);
      setCanScrollVisaRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const handleVisaScroll = (direction: "left" | "right") => {
    if (visaCarouselRef.current) {
      const scrollAmount = visaCarouselRef.current.clientWidth * 0.75;
      visaCarouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const filteredVisaCountries = POPULAR_VISA_COUNTRIES.filter((country) => {
    const query = visaSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      country.name.toLowerCase().includes(query) ||
      country.popularFor.toLowerCase().includes(query) ||
      country.visaType.toLowerCase().includes(query) ||
      country.region.toLowerCase().includes(query);
    const matchesRegion =
      visaSelectedRegion === "All" || country.region === visaSelectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Hero service cards horizontal scroll container ref for mobile
  const heroCardsScrollRef = useRef<HTMLDivElement>(null);

  const handleSelectService = (idx: number) => {
    if (idx === activeServiceIndex) return;
    setSlideDirection(idx > activeServiceIndex ? "next" : "prev");
    setPrevIndex(activeServiceIndex);
    setActiveServiceIndex(idx);
    setSelectedSlug(HERO_SERVICES[idx].slug);

    // Smoothly center the selected card into view on mobile
    if (heroCardsScrollRef.current) {
      const cardEl = heroCardsScrollRef.current.children[idx] as
        HTMLElement | undefined;
      if (cardEl) {
        const container = heroCardsScrollRef.current;
        const scrollLeft =
          cardEl.offsetLeft -
          container.clientWidth / 2 +
          cardEl.clientWidth / 2;
        if (typeof container.scrollTo === "function") {
          container.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: "smooth",
          });
        } else {
          container.scrollLeft = Math.max(0, scrollLeft);
        }
      }
    }

    // Keep URL hash in sync with user's selection without causing page jump or reload
    if (typeof window !== "undefined") {
      const targetHash = `#${HERO_SERVICES[idx].slug}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, "", targetHash);
      }
    }
  };

  // Concierge search bar ref
  const conciergeBarRef = useRef<HTMLDivElement>(null);

  // Interactive state for Umrah & Hajj reference showcase
  const [umrahTierSelect, setUmrahTierSelect] =
    useState<PilgrimageTierKey>("executive");
  const [umrahActivePhoto, setUmrahActivePhoto] = useState(0);

  const [hajjTierSelect, setHajjTierSelect] =
    useState<PilgrimageTierKey>("executive");
  const [hajjActivePhoto, setHajjActivePhoto] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalPackage, setModalPackage] = useState<PackageSummary>();
  const [modalServiceId, setModalServiceId] = useState<string | undefined>(
    undefined,
  );
  const [modalPrefill, setModalPrefill] = useState<EnquiryPrefill | undefined>(
    undefined,
  );

  useEffect(() => {
    const handleGlobal = () => {
      setModalPackage(undefined);
      setModalPrefill(undefined);
      setModalServiceId(undefined);
      setModalOpen(true);
    };
    window.addEventListener("flyora:open-enquiry", handleGlobal);
    return () =>
      window.removeEventListener("flyora:open-enquiry", handleGlobal);
  }, []);

  // Listen to hash changes on initial mount and external navigation (back/forward or navbar links)
  useEffect(() => {
    const syncFromHash = (shouldScroll = false) => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      setSelectedSlug(hash);
      const targetIdx = HERO_SERVICES.findIndex(
        (service) =>
          service.slug === hash ||
          service.id === hash ||
          service.serviceId === hash,
      );
      if (targetIdx !== -1) {
        setActiveServiceIndex(targetIdx);
      }
      if (shouldScroll)
        document
          .getElementById("service-details-hub")
          ?.scrollIntoView({ behavior: "smooth" });
    };

    // Run once on initial page load if hash is present
    if (typeof window !== "undefined" && window.location.hash) {
      syncFromHash(false);
    }

    // Listen to external hash changes (e.g. from navbar anchor clicks or browser back/forward)
    const onHashChange = () => syncFromHash(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [HERO_SERVICES]);

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

  const handleCardEnquiry = (value?: string, prefill?: EnquiryPrefill) => {
    const requested = prefill?.serviceId || prefill?.serviceName || value;
    const service =
      resolveService(services, requested) ||
      (value?.includes(":") || value?.includes("(")
        ? resolveService(
            services,
            value
              .split(/[:(]/)[0]
              .trim()
              .replace("Visa Application", "Visa Assistance"),
          )
        : undefined);
    if (error || !loaded || (requested && !service)) return;
    setModalPackage(undefined);
    setModalPrefill(
      service
        ? {
            ...prefill,
            serviceId: service.id,
            serviceName: service.name,
            notes:
              prefill?.notes ||
              (value && /[:(]/.test(value) ? value : undefined),
            summaryLabel:
              prefill?.summaryLabel ||
              (value && /[:(]/.test(value) ? value : undefined),
          }
        : prefill,
    );
    setModalServiceId(service?.id);
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
        {unavailable && (
          <p role="alert" className="pt-28 px-6">
            This service is unavailable. Choose another service below.
          </p>
        )}
        {/* 2. FULL-WIDTH HERO SECTION WITH DYNAMIC BACKGROUND & 8 HERO SERVICE CARDS */}
        <section className="relative z-40 w-full min-h-[660px] sm:min-h-[700px] lg:min-h-[720px] lg:h-[75vh] lg:max-h-[780px] flex flex-col justify-between overflow-hidden -mt-20 pt-28 sm:pt-32 lg:pt-34 xl:pt-36 pb-0">
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
          <div className="relative z-30 w-full px-6 sm:px-10 lg:px-[105px] flex-1 flex flex-col justify-center">
            {/* Main Hero Headline - staggered entrance 1 */}
            <div
              key={`headline-wrap-${activeService.id}`}
              className="overflow-hidden"
            >
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-serif font-medium text-white tracking-tight leading-[1.14] max-w-4xl"
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
                className="mt-2 sm:mt-2.5 text-xs sm:text-sm md:text-base font-sans text-white/85 max-w-2xl leading-relaxed"
                style={{
                  animation:
                    "heroTextDescIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.38s both",
                }}
              >
                {activeService.heroSubheadline}
              </p>
            </div>

            {/* 7 HERO SERVICE CARDS (Matching Homepage Hero Design, rounded-md) */}
            <div className="relative mt-5 sm:mt-6 mb-3 sm:mb-4">
              <div
                ref={heroCardsScrollRef}
                className="flex lg:grid lg:grid-cols-8 items-stretch gap-2 sm:gap-2.5 lg:gap-2.5 xl:gap-3 overflow-x-auto lg:overflow-visible no-scrollbar scroll-smooth px-1.5 lg:px-0 pt-3.5 sm:pt-4 pb-2.5 lg:pt-2 lg:pb-2"
              >
                {HERO_SERVICES.map((s, idx) => {
                  const isActive = idx === activeServiceIndex;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectService(idx)}
                      aria-pressed={isActive}
                      aria-label={`Select ${s.name}`}
                      className={`group relative shrink-0 w-[136px] sm:w-[148px] lg:w-auto h-[155px] sm:h-[168px] lg:h-[178px] rounded-[14px] transition-all duration-300 ease-out cursor-pointer text-left select-none p-3.5 sm:p-4 flex flex-col justify-end bg-neutral-950 ${
                        isActive
                          ? "-translate-y-1 sm:-translate-y-1.5 scale-[1.02] z-20 shadow-[0_14px_32px_rgba(0,0,0,0.55)] ring-2 ring-white"
                          : "hover:-translate-y-1 sm:hover:-translate-y-1.5 hover:scale-[1.01] hover:z-30 opacity-90 hover:opacity-100 ring-1 ring-white/20"
                      }`}
                    >
                      {/* Inner clipped canvas with service image (object-cover zoomed) */}
                      <div className="absolute inset-0 rounded-[14px] overflow-hidden pointer-events-none">
                        <img
                          src={s.cardImageSrc}
                          alt=""
                          className={`absolute inset-0 w-full h-full object-cover ${s.cardImagePosition || "object-center"} scale-[1.08] transition-transform duration-500 ease-out group-hover:scale-[1.16]`}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                      </div>

                      {/* Clean card border highlight (crisp, zero blurry white fog) */}
                      <div
                        className={`absolute inset-0 rounded-[14px] transition-all duration-300 pointer-events-none z-20 ${
                          isActive
                            ? "border border-white/25"
                            : "border border-white/10 group-hover:border-white/25"
                        }`}
                      />

                      {/* Bottom Row: Typography */}
                      <div className="relative z-30 w-full">
                        <div className="text-[13.5px] sm:text-[14px] lg:text-[14.5px] font-bold text-white leading-tight drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.95)] whitespace-normal break-words">
                          {s.name}
                        </div>
                        <div className="text-[11px] sm:text-[11.5px] lg:text-[12px] font-medium text-white/95 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] whitespace-normal break-words mt-0.5 sm:mt-1">
                          {s.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Carousel Indicator Dots (Matching Image 2) */}
              <div className="flex lg:hidden items-center justify-center gap-1.5 mt-2">
                {HERO_SERVICES.map((s, idx) => (
                  <button
                    key={`hero-dot-${s.id}`}
                    type="button"
                    onClick={() => handleSelectService(idx)}
                    aria-label={`Go to ${s.name}`}
                    className={`transition-all duration-300 rounded-full h-1.5 cursor-pointer ${
                      idx === activeServiceIndex
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* HERO ADAPTIVE SEARCH BAR (Unified with Homepage HeroSearchCard, standard rounded-md buttons) */}
            <div ref={conciergeBarRef} className="w-full mt-1 sm:mt-2">
              <HeroSearchCard
                key={activeService.slug}
                defaultTripMode={
                  activeService.slug === "visa-assistance" ||
                  activeService.slug === "umrah-hajj"
                    ? "international"
                    : "domestic"
                }
                activeServiceSlug={activeService.slug}
                onServiceChange={(slug) => {
                  const mappedIdx = HERO_SERVICES.findIndex(
                    (service) => service.slug === slug,
                  );
                  if (mappedIdx !== -1) handleSelectService(mappedIdx);
                }}
                hideTopCards={true}
                hideTripModeToggle={true}
                fullWidth={true}
                unavailable={unavailable}
                onOpenEnquiry={(serviceOrDest, prefill) =>
                  handleCardEnquiry(serviceOrDest, prefill)
                }
              />
            </div>
          </div>

          {/* LUXURY EDITORIAL SCROLL INDICATOR (Mouse above, text below with equal top/bottom gaps) */}
          <div className="relative z-10 w-full px-6 sm:px-10 lg:px-[105px] py-6 sm:py-7 lg:py-8 flex flex-col items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("service-details-hub");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group flex flex-col items-center gap-2 sm:gap-2.5 cursor-pointer select-none transition-all duration-300"
              aria-label={`Scroll to ${activeService.scrollCue}`}
            >
              {/* 1. MOUSE ICON ABOVE */}
              <div className="w-[20px] h-[32px] sm:w-[22px] sm:h-[34px] rounded-full border-[1.5px] border-white/65 group-hover:border-white transition-all duration-300 flex justify-center pt-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:translate-y-0.5">
                <div className="w-[2.5px] h-[6px] rounded-full bg-white animate-mouse-scroll" />
              </div>

              {/* 2. TEXT BELOW (Semi-bold to highlight) */}
              <span className="text-[10px] sm:text-[11px] lg:text-[11.5px] font-sans font-semibold tracking-[0.2em] uppercase text-white/95 group-hover:text-white transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] text-center px-4 max-w-[360px] sm:max-w-none">
                {activeService.scrollCue}
              </span>
            </button>
          </div>
        </section>

        {/* Scroll Target Anchor for Option B */}
        <div
          id="service-details-hub"
          className="scroll-mt-20 sm:scroll-mt-24"
        />

        {/* =========================================================================
            3. DYNAMIC SERVICE-SPECIFIC SECTIONS
            Dynamically rendered based on activeService.id from Hero selection:
            - Custom Holidays: Top Pickups For You (Bento Gallery) + Featured Destinations Carousel
            - Visa Assistance: Popular Visa Countries (10 Cards + Search) + What Documents You Should Keep (BentoGridShowcase)
            - Flight / Train / Bus: Structured Transport Booking Desk
            - Umrah / Hajj: Dedicated Sacred Pilgrimage Desk
            ========================================================================= */}

        {/* -------------------------------------------------------------------------
            CASE 1: CUSTOM HOLIDAYS (Top Pickups Bento Gallery + Featured Destinations)
            ------------------------------------------------------------------------- */}
        {activeService.id === "custom-holidays" && (
          <div id="holidays-dynamic-hub" className="w-full bg-[#FDFCFB]">
            {/* 1. Top Pickups For You Interactive Bento Gallery */}
            <InteractiveImageBentoGallery
              imageItems={TOP_PICKUP_BENTO_ITEMS}
              title="Top Pickups For You"
              description="Plan your perfect vacation with Flyora. Choose among hand-curated, all-inclusive luxury offers! Drag to explore, click to expand."
              actionLabel="Explore All Holiday Tours"
              onActionClick={() => handleCardEnquiry("Holiday Packages")}
            />
          </div>
        )}

        {/* -------------------------------------------------------------------------
            CASE 2: VISA ASSISTANCE (Popular Countries Carousel + Search + Documents Bento UI)
            ------------------------------------------------------------------------- */}
        {activeService.id === "visa-assistance" && (
          <div id="visa-dynamic-hub" className="w-full bg-[#FDFCFB]">
            {/* SUB-SECTION 1: SEARCH & 10 POPULAR VISA COUNTRIES */}
            <section className="relative z-10 w-full pt-16 sm:pt-20 pb-16 sm:pb-20 overflow-hidden">
              <div className="w-full px-6 sm:px-10 lg:px-[105px]">
                {/* Header: Left Title + Search Bar + Right Arrows */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10 mb-8 sm:mb-10">
                  <div className="max-w-xl">
                    <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#002f89] block mb-2">
                      GLOBAL VISA ASSISTANCE
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#1C1815] tracking-tight leading-[1.14]">
                      Popular Countries We Provide Visas For
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2.5 max-w-lg leading-relaxed font-sans">
                      Express appointment booking, multi-point document audit,
                      and 99.2% approval success rate for 100+ embassies and
                      electronic visas.
                    </p>
                  </div>

                  {/* Search Bar + Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
                    {/* Country Search Bar */}
                    <div className="relative min-w-[260px] sm:min-w-[320px]">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={visaSearchQuery}
                        onChange={(e) => setVisaSearchQuery(e.target.value)}
                        placeholder="Search country (e.g. Schengen, UK, Dubai)..."
                        className="w-full pl-10 pr-8 py-2.5 rounded-md border border-neutral-300/90 bg-white text-xs sm:text-sm text-stone-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#002f89] focus:ring-1 focus:ring-[#002f89] transition-all shadow-2xs"
                      />
                      {visaSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setVisaSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs cursor-pointer p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleVisaScroll("left")}
                        disabled={!canScrollVisaLeft}
                        aria-label="Previous visa country"
                        className={`group relative overflow-hidden w-11 h-10 sm:w-12 sm:h-11 p-0 m-0 border rounded-md grid place-items-center transition-all duration-300 active:scale-95 shadow-2xs ${
                          canScrollVisaLeft
                            ? "border-neutral-300/90 hover:border-transparent bg-white text-neutral-500 hover:text-white cursor-pointer"
                            : "border-neutral-200 bg-white/70 text-neutral-300 cursor-not-allowed opacity-40"
                        }`}
                      >
                        {canScrollVisaLeft && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                          />
                        )}
                        <span className="relative z-10 flex items-center justify-center">
                          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVisaScroll("right")}
                        disabled={!canScrollVisaRight}
                        aria-label="Next visa country"
                        className={`group relative overflow-hidden w-11 h-10 sm:w-12 sm:h-11 p-0 m-0 border rounded-md grid place-items-center transition-all duration-300 active:scale-95 shadow-2xs ${
                          canScrollVisaRight
                            ? "border-neutral-300/90 hover:border-transparent bg-white text-neutral-500 hover:text-white cursor-pointer"
                            : "border-neutral-200 bg-white/70 text-neutral-300 cursor-not-allowed opacity-40"
                        }`}
                      >
                        {canScrollVisaRight && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                          />
                        )}
                        <span className="relative z-10 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Region Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
                  {[
                    "All",
                    "Europe",
                    "Middle East",
                    "Asia",
                    "Americas",
                    "Oceania",
                  ].map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setVisaSelectedRegion(region)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all shrink-0 cursor-pointer ${
                        visaSelectedRegion === region
                          ? "bg-[#002f89] text-white shadow-2xs font-semibold"
                          : "bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/60"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                  {filteredVisaCountries.length === 0 && (
                    <span className="text-xs text-stone-500 pl-2">
                      No countries found for "{visaSearchQuery}"
                    </span>
                  )}
                </div>

                {/* 10 Popular Visa Country Cards Track */}
                <div
                  ref={visaCarouselRef}
                  onScroll={checkVisaScroll}
                  className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-4 pt-1 px-1 -mx-1"
                >
                  {filteredVisaCountries.map((country) => (
                    <div
                      key={country.id}
                      onClick={() =>
                        handleCardEnquiry(`Visa Application: ${country.name}`, {
                          serviceId: "visa-assistance",
                          serviceName: "Visa Assistance",
                          destination: country.name,
                          travelDate: "",
                          tierOrClass: country.visaType,
                          summaryLabel: `${country.name} · ${country.visaType}`,
                        })
                      }
                      className="group relative flex-none w-[260px] sm:w-[280px] lg:w-[300px] h-[370px] sm:h-[390px] rounded-[8px] overflow-hidden cursor-pointer select-none shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border border-black/[0.08] flex flex-col justify-between"
                    >
                      {/* Background Image */}
                      <Image
                        src={country.image}
                        alt={country.name}
                        fill
                        sizes="(max-width: 768px) 260px, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Gentle Gradient Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />

                      {/* Top Badges */}
                      <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-[6px] bg-white/20 backdrop-blur-md text-[10.5px] font-mono font-bold uppercase tracking-wider text-white border border-white/20">
                          {country.region}
                        </span>
                        <span className="px-2 py-0.5 rounded-[6px] bg-emerald-500/90 text-[10.5px] font-sans font-bold text-white shadow-xs">
                          {country.approvalRate}
                        </span>
                      </div>

                      {/* Bottom Content */}
                      <div className="relative z-10 p-5 text-white">
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight mb-1">
                          {country.name}
                        </h3>
                        <p className="text-xs text-amber-200 font-sans font-medium mb-3">
                          {country.visaType}
                        </p>

                        <div className="space-y-1.5 text-xs text-stone-200/90 font-sans border-t border-white/15 pt-2.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Processing: {country.processingTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-300 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Popular: {country.popularFor}</span>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-2 flex items-center justify-between text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                          <span>Apply for Visa</span>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SUB-SECTION 2: WHAT DOCUMENTS YOU SHOULD KEEP (BentoGridShowcase) */}
            <section className="relative z-10 w-full pt-12 sm:pt-16 pb-20 sm:pb-24 border-t border-black/[0.06] bg-white overflow-hidden">
              <div className="w-full px-6 sm:px-10 lg:px-[105px]">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#002f89] block mb-2">
                    MANDATORY DOSSIER &amp; AUDIT CHECKLIST
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#1C1815] tracking-tight leading-[1.14]">
                    What Documents You Should Keep Ready
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 mt-3 font-sans leading-relaxed">
                    Embassies demand exact, verifiable documentation. Keep these
                    prerequisites ready before scheduling biometrics—our senior
                    visa officers audit every single page to ensure zero
                    rejection risk.
                  </p>
                </div>

                {/* BentoGridShowcase Layout */}
                <BentoGridShowcase
                  integration={
                    <Card className="relative h-full overflow-hidden flex flex-col justify-between border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-[#1C1815] text-white">
                      {/* Background image overlay */}
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/services/visa-assistance.webp"
                          alt="Passport vault"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover object-center opacity-25 brightness-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1815] via-[#1C1815]/90 to-[#1C1815]/60" />
                      </div>

                      <CardHeader className="relative z-10 p-6 sm:p-7">
                        <FileCheck2 className="w-7 h-7 text-amber-300 mb-4" />
                        <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-300/95 block mb-2">
                          Primary Vault · Step 1
                        </span>
                        <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                          Passport &amp; Identity Essentials
                        </CardTitle>
                        <CardDescription className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
                          The foundation of your visa dossier. Embassies reject
                          applications instantly if the passport fails validity
                          or integrity standards.
                        </CardDescription>

                        <div className="mt-6 space-y-3.5 text-xs sm:text-sm text-stone-200">
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>6+ Months Validity</strong> beyond
                              intended stay
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Minimum 2 Blank Pages</strong> consecutive
                              for sticker
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Previous Passports</strong> with travel
                              stamp history
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Government Photo ID</strong> &amp;
                              Residence Proof copy
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardFooter className="relative z-10 p-6 sm:p-7 pt-0 border-t border-white/10 mt-6">
                        <button
                          type="button"
                          onClick={() =>
                            handleCardEnquiry("Visa Assistance: Passport Audit")
                          }
                          className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
                        >
                          <span>Request Passport Pre-Audit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </CardFooter>
                    </Card>
                  }
                  trackers={
                    <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                      {/* Background Image with Frosted Glass Effect */}
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/services/bank-statements.jpg"
                          alt="Bank Statements & Financial Proof"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3.5">
                          <CreditCard className="w-6 h-6 text-[#002f89]" />
                          <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-[#002f89]">
                            Last 6 Months
                          </span>
                        </div>
                        <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                          Bank Statements &amp; Financial Proof
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                          Original bank statements with official branch stamp
                          &amp; signature. Demonstrates sufficient balance
                          meeting consulate minimum thresholds.
                        </CardDescription>
                      </div>
                      <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs sm:text-sm text-stone-700 font-sans font-medium">
                        <span>Salary Slips (3 Mos)</span>
                        <span className="font-semibold text-emerald-700">
                          ✓ Stamp Required
                        </span>
                      </div>
                    </Card>
                  }
                  statistic={
                    <Card className="relative h-full overflow-hidden border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-[#002f89] to-[#001c54] text-white flex flex-col justify-between p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-300 font-bold">
                          Flyora Approval Metric
                        </span>
                        <ShieldCheck className="w-6 h-6 text-emerald-300" />
                      </div>
                      <div className="my-2">
                        <span className="text-5xl sm:text-6xl font-serif font-extrabold tracking-tight text-white block">
                          99.2%
                        </span>
                        <span className="text-xs sm:text-sm text-white/90 font-sans font-medium mt-1 block">
                          Visa Approval Track Record
                        </span>
                      </div>
                      <p className="text-xs text-white/75 font-sans leading-relaxed">
                        12,400+ files pre-screened prior to submission with 0
                        documentation defects.
                      </p>
                    </Card>
                  }
                  focus={
                    <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                      {/* Background Image with Frosted Glass Effect */}
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/services/biometrics-appointment.jpg"
                          alt="Biometrics & Slot Appointment"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3.5">
                          <Clock className="w-6 h-6 text-amber-800" />
                          <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-amber-900">
                            Express Scheduling
                          </span>
                        </div>
                        <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                          Biometrics &amp; Slot Appointment
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                          Direct monitoring across VFS Global, BLS
                          International, and Consulates to secure early
                          biometric booking dates.
                        </CardDescription>
                      </div>
                      <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs sm:text-sm text-stone-700 font-sans font-medium">
                        <span>Appointment Vouchers</span>
                        <span className="font-semibold text-[#002f89]">
                          Early Slot Alerts
                        </span>
                      </div>
                    </Card>
                  }
                  productivity={
                    <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                      {/* Background Image with Frosted Glass Effect */}
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/services/flight-booking.webp"
                          alt="Flight Itinerary & Hotel Proofs"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3.5">
                          <Plane className="w-6 h-6 text-emerald-800" />
                          <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-emerald-900">
                            Verifiable PNR
                          </span>
                        </div>
                        <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                          Flight Itinerary &amp; Hotel Proofs
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                          Embassy-compliant confirmed round-trip dummy flight
                          itineraries and confirmed hotel reservations with no
                          financial ticket risks.
                        </CardDescription>
                      </div>
                      <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs text-stone-600 font-sans font-medium">
                        <span>Day-Wise Travel Plan</span>
                        <span className="font-semibold text-emerald-700">
                          ✓ 100% Embassy Valid
                        </span>
                      </div>
                    </Card>
                  }
                  shortcuts={
                    <Card className="h-full border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 p-6 sm:p-7">
                      <div className="max-w-md">
                        <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#002f89] block mb-2">
                          Mandatory Add-ons
                        </span>
                        <CardTitle className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
                          Travel Insurance, Photographs &amp; Employer NOC
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed font-sans">
                          Schengen &amp; worldwide embassies require $50,000+
                          medical insurance with COVID &amp; repatriation
                          coverage, exact 35×45mm photos, and approved company
                          NOCs.
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs sm:text-sm text-stone-600 font-sans font-medium">
                          <span>• 35×45mm White BG</span>
                          <span>• €30k / $50k Policy</span>
                          <span>• ITR-V Last 2 Yrs</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4 sm:gap-4.5 shrink-0 self-center">
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815] tracking-tight text-center">
                          Any doubts ?
                        </span>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 w-full sm:w-auto items-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleCardEnquiry(
                                "Visa Assistance: Full Dossier Review",
                              )
                            }
                            className="px-5 py-2.5 rounded-lg bg-[#002f89] hover:bg-[#00246b] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95 text-center whitespace-nowrap"
                          >
                            Request Audit
                          </button>
                          <a
                            href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20would%20like%20a%20checklist%20review%20for%20my%20visa%20documents."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Desk</span>
                          </a>
                        </div>
                      </div>
                    </Card>
                  }
                />
              </div>
            </section>
          </div>
        )}

        {/* -------------------------------------------------------------------------
            CASE 3A: FLIGHT BOOKING (Airline Ticketing & Route Assurance Bento Showcase)
            ------------------------------------------------------------------------- */}
        {activeService.id === "flight-booking" && (
          <div id="flight-dynamic-hub" className="w-full bg-white">
            <section className="relative z-10 w-full pt-14 sm:pt-18 pb-20 sm:pb-24 border-t border-black/[0.06] bg-white overflow-hidden">
              <div className="w-full px-6 sm:px-10 lg:px-[105px]">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#002f89] block mb-2">
                    AIRLINE TICKETING &amp; ROUTE ASSURANCE
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#1C1815] tracking-tight leading-[1.14]">
                    What You Need For Confirmed Flight Issuance
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 mt-3 font-sans leading-relaxed">
                    Avoid hidden baggage surcharges, rigid cancellation
                    penalties, and unconfirmed waitlists. Flyora’s global air
                    ticketing desk secures verified corporate PNRs and flexible
                    routing.
                  </p>
                </div>

                {/* BentoGridShowcase Layout */}
                <BentoGridShowcase
                  integration={
                    <Card className="relative h-full overflow-hidden flex flex-col justify-between border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-[#1C1815] text-white">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/services/flight-booking.webp"
                          alt="Flight Booking Vault"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover object-center opacity-30 brightness-85"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1815] via-[#1C1815]/90 to-[#1C1815]/60" />
                      </div>

                      <CardHeader className="relative z-10 p-6 sm:p-7">
                        <Plane className="w-7 h-7 text-amber-300 mb-4" />
                        <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-300/95 block mb-2">
                          Primary Route · GDS Lock
                        </span>
                        <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                          Direct Carrier &amp; PNR Allocation
                        </CardTitle>
                        <CardDescription className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
                          Unpublished corporate inventory across 500+ commercial
                          and business airlines worldwide with real-time seat
                          locks.
                        </CardDescription>

                        <div className="mt-6 space-y-3.5 text-xs sm:text-sm text-stone-200">
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Passport &amp; Legal Names</strong>{" "}
                              matching airline database record
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Frequent Flyer / Mileage</strong> tier
                              accrual pre-attached
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Flexible Rescheduling</strong> with zero
                              or low carrier fee locks
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>24/7 GDS Route Monitoring</strong> for
                              schedule and terminal alerts
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardFooter className="relative z-10 p-6 sm:p-7 pt-0 border-t border-white/10 mt-6">
                        <button
                          type="button"
                          onClick={() =>
                            handleCardEnquiry("Flight Booking: Route Fare Lock")
                          }
                          className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
                        >
                          <span>Request Flight Fare Audit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </CardFooter>
                    </Card>
                  }
                  trackers={
                    <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/services/flight-booking.webp"
                          alt="Baggage Allowances & Cabin Proof"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3.5">
                          <Compass className="w-6 h-6 text-[#002f89]" />
                          <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-[#002f89]">
                            Baggage Tier
                          </span>
                        </div>
                        <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                          Baggage Allowances &amp; Cabin Proof
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                          Up to 30kg–46kg checked baggage allowances confirmed
                          upfront with clear dimension standards and excess fee
                          waivers.
                        </CardDescription>
                      </div>
                      <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs sm:text-sm text-stone-700 font-sans font-medium">
                        <span>Extra Piece Option</span>
                        <span className="font-semibold text-emerald-700">
                          ✓ 0 Surcharge Guarantee
                        </span>
                      </div>
                    </Card>
                  }
                  statistic={
                    <Card className="relative h-full overflow-hidden border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-[#002f89] to-[#001c54] text-white flex flex-col justify-between p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-300 font-bold">
                          Flyora Airline Metric
                        </span>
                        <ShieldCheck className="w-6 h-6 text-emerald-300" />
                      </div>
                      <div className="my-2">
                        <span className="text-5xl sm:text-6xl font-serif font-extrabold tracking-tight text-white block">
                          100%
                        </span>
                        <span className="text-xs sm:text-sm text-white/90 font-sans font-medium mt-1 block">
                          Verified PNR Seat Confirmation
                        </span>
                      </div>
                      <p className="text-xs text-white/75 font-sans leading-relaxed">
                        Zero phantom bookings. Every ticket is issued directly
                        via official Amadeus &amp; Sabre airline GDS networks.
                      </p>
                    </Card>
                  }
                  focus={
                    <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/destinations/dubai_hd.jpg"
                          alt="Seat Allotment & Meal Preferences"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3.5">
                          <Clock className="w-6 h-6 text-amber-800" />
                          <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-amber-900">
                            Priority Check-in
                          </span>
                        </div>
                        <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                          Seat Allotment &amp; Meal Preferences
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                          Pre-reserved extra legroom seats, aisle/window lock,
                          and bespoke dietary or religious meal selections on
                          all sectors.
                        </CardDescription>
                      </div>
                      <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs sm:text-sm text-stone-700 font-sans font-medium">
                        <span>Boarding Pass Delivery</span>
                        <span className="font-semibold text-[#002f89]">
                          Real-time WhatsApp Alerts
                        </span>
                      </div>
                    </Card>
                  }
                  productivity={
                    <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/services/flight-booking.webp"
                          alt="Corporate & Best-Fare Lock"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3.5">
                          <CreditCard className="w-6 h-6 text-emerald-800" />
                          <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-emerald-900">
                            Price Match
                          </span>
                        </div>
                        <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                          Corporate &amp; Best-Fare Lock
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                          Hold confirmed fares for 24–48 hours without price
                          spikes while your itinerary or visa clearance is being
                          finalized.
                        </CardDescription>
                      </div>
                      <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs text-stone-600 font-sans font-medium">
                        <span>Fare Lock Validity</span>
                        <span className="font-semibold text-emerald-700">
                          ✓ Best Fare Guarantee
                        </span>
                      </div>
                    </Card>
                  }
                  shortcuts={
                    <Card className="h-full border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 p-6 sm:p-7">
                      <div className="max-w-md">
                        <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#002f89] block mb-2">
                          Complimentary Concierge
                        </span>
                        <CardTitle className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
                          Airport Lounge Access, Multi-City Halts &amp; Travel
                          Insurance
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed font-sans">
                          Seamless transit transfers, international layover
                          lounges, and full flight delay or baggage loss
                          compensation insurance policies.
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs sm:text-sm text-stone-600 font-sans font-medium">
                          <span>• Domestic &amp; Intl Lounges</span>
                          <span>• Free Date Change Options</span>
                          <span>• 24/7 Ticketing Support</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4 sm:gap-4.5 shrink-0 self-center">
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815] tracking-tight text-center">
                          Any doubts ?
                        </span>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 w-full sm:w-auto items-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleCardEnquiry(
                                "Flight Booking: Flight Route Fare",
                              )
                            }
                            className="px-5 py-2.5 rounded-lg bg-[#002f89] hover:bg-[#00246b] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95 text-center whitespace-nowrap"
                          >
                            Request Route Quote
                          </button>
                          <a
                            href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20would%20like%20to%20inquire%20about%20a%20flight%20ticket%20booking."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Desk</span>
                          </a>
                        </div>
                      </div>
                    </Card>
                  }
                />
              </div>
            </section>
          </div>
        )}

        {/* -------------------------------------------------------------------------
            CASE 3B: BUS & TRAIN BOOKING (Combined Ground Transit with Interactive Switcher)
            ------------------------------------------------------------------------- */}
        {(activeService.id === "bus-booking" ||
          activeService.id === "train-booking" ||
          activeService.slug === "bus-booking") && (
          <div id="ground-transit-dynamic-hub" className="w-full bg-white">
            <section className="relative z-10 w-full pt-14 sm:pt-18 pb-20 sm:pb-24 border-t border-black/[0.06] bg-white overflow-hidden">
              <div className="w-full px-6 sm:px-10 lg:px-[105px]">
                {/* Interactive Transit Mode Switcher */}
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#002f89] block mb-3">
                    GROUND TRANSIT &amp; HIGHWAY CONNECTIVITY
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#1C1815] tracking-tight leading-[1.14] mb-6">
                    Confirmed Rail Berths &amp; Luxury Highway Coaches
                  </h2>
                  <div className="inline-flex items-center p-1 rounded-full bg-stone-100 border border-black/[0.08] shadow-inner">
                    <button
                      type="button"
                      onClick={() => setGroundTransitTab("train")}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                        groundTransitTab === "train"
                          ? "bg-[#002f89] text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <Train className="w-4 h-4" />
                      <span>Indian Railways (IRCTC)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroundTransitTab("bus")}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                        groundTransitTab === "bus"
                          ? "bg-[#002f89] text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <Bus className="w-4 h-4" />
                      <span>Luxury Volvo Coaches</span>
                    </button>
                  </div>
                </div>

                {groundTransitTab === "train" ? (
                  <BentoGridShowcase
                    integration={
                      <Card className="relative h-full overflow-hidden flex flex-col justify-between border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-[#1C1815] text-white">
                        <div className="absolute inset-0 z-0">
                          <Image
                            src="/services/train-booking.webp"
                            alt="Train Booking Vault"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center opacity-30 brightness-85"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1815] via-[#1C1815]/90 to-[#1C1815]/60" />
                        </div>

                        <CardHeader className="relative z-10 p-6 sm:p-7">
                          <Train className="w-7 h-7 text-amber-300 mb-4" />
                          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-300/95 block mb-2">
                            Confirmed Berth · Priority
                          </span>
                          <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                            Coach Tier &amp; Berth Preferences
                          </CardTitle>
                          <CardDescription className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
                            Direct allocation across 1st AC, 2nd AC, 3rd AC,
                            Executive Chair Car, and luxury tourist train
                            services.
                          </CardDescription>

                          <div className="mt-6 space-y-3.5 text-xs sm:text-sm text-stone-200">
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Lower &amp; Window Berth</strong>{" "}
                                automatically prioritized for elders &amp;
                                families
                              </span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Group &amp; Family Seating</strong> in
                                the same coach compartment
                              </span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Tatkal &amp; Premium Tatkal</strong>{" "}
                                express booking assistance
                              </span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Instant PNR Status</strong> &amp; live
                                platform coach position links
                              </span>
                            </div>
                          </div>
                        </CardHeader>

                        <CardFooter className="relative z-10 p-6 sm:p-7 pt-0 border-t border-white/10 mt-6">
                          <button
                            type="button"
                            onClick={() =>
                              handleCardEnquiry(
                                "Train Booking: Berth Allocation",
                              )
                            }
                            className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
                          >
                            <span>Request Train Seat Audit</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </CardFooter>
                      </Card>
                    }
                    trackers={
                      <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                        <div className="absolute inset-0 z-0">
                          <Image
                            src="/destinations/switzerland_hd.jpg"
                            alt="Confirmed PNR & Charting Guarantee"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3.5">
                            <FileText className="w-6 h-6 text-[#002f89]" />
                            <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-[#002f89]">
                              Berth Status
                            </span>
                          </div>
                          <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                            Confirmed PNR &amp; Charting Guarantee
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                            Guaranteed confirmed status prior to final chart
                            preparation with automated RAC upgrade tracking and
                            zero waitlist drop risks.
                          </CardDescription>
                        </div>
                        <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs sm:text-sm text-stone-700 font-sans font-medium">
                          <span>Automated RAC Tracking</span>
                          <span className="font-semibold text-emerald-700">
                            ✓ 100% Berth Lock
                          </span>
                        </div>
                      </Card>
                    }
                    statistic={
                      <Card className="relative h-full overflow-hidden border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-[#002f89] to-[#001c54] text-white flex flex-col justify-between p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-300 font-bold">
                            Flyora Rail Metric
                          </span>
                          <ShieldCheck className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div className="my-2">
                          <span className="text-5xl sm:text-6xl font-serif font-extrabold tracking-tight text-white block">
                            98.6%
                          </span>
                          <span className="text-xs sm:text-sm text-white/90 font-sans font-medium mt-1 block">
                            Tatkal &amp; Berth Confirmation Rate
                          </span>
                        </div>
                        <p className="text-xs text-white/75 font-sans leading-relaxed">
                          Over 25,000+ confirmed berths secured on high-demand
                          peak holiday and festival express routes.
                        </p>
                      </Card>
                    }
                    focus={
                      <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                        <div className="absolute inset-0 z-0">
                          <Image
                            src="/services/train-booking.webp"
                            alt="Live Train GPS & Delay Alerts"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3.5">
                            <Clock className="w-6 h-6 text-amber-800" />
                            <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-amber-900">
                              Live Tracker
                            </span>
                          </div>
                          <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                            Live Train GPS &amp; Delay Alerts
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                            Real-time running status, platform arrival
                            forecasts, and live route delay notifications sent
                            directly to your phone.
                          </CardDescription>
                        </div>
                        <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs sm:text-sm text-stone-700 font-sans font-medium">
                          <span>Platform Updates</span>
                          <span className="font-semibold text-[#002f89]">
                            Automated WhatsApp Alerts
                          </span>
                        </div>
                      </Card>
                    }
                    productivity={
                      <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                        <div className="absolute inset-0 z-0">
                          <Image
                            src="/destinations/switzerland.jpg"
                            alt="Zero-Hassle Cancellation & Refunds"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3.5">
                            <CreditCard className="w-6 h-6 text-emerald-800" />
                            <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-emerald-900">
                              Instant Refund
                            </span>
                          </div>
                          <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                            Zero-Hassle Cancellation &amp; Refunds
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                            Speedy automated IRCTC cancellation processing with
                            direct bank transfer refunds in 24 hours and zero
                            hidden fees.
                          </CardDescription>
                        </div>
                        <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs text-stone-600 font-sans font-medium">
                          <span>Cancellation Desk</span>
                          <span className="font-semibold text-emerald-700">
                            ✓ Instant Processing
                          </span>
                        </div>
                      </Card>
                    }
                    shortcuts={
                      <Card className="h-full border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 p-6 sm:p-7">
                        <div className="max-w-md">
                          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#002f89] block mb-2">
                            Journey Perks
                          </span>
                          <CardTitle className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
                            Station Transfers, Onboard Meals &amp; Tourist
                            Circuit Passes
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed font-sans">
                            Pre-booked station cab pickups, hygienic hot meal
                            catering delivered directly to your berth, and
                            scenic tourist train bookings.
                          </CardDescription>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs sm:text-sm text-stone-600 font-sans font-medium">
                            <span>• Hot Meals to Seat</span>
                            <span>• Verified Station Porters</span>
                            <span>• Group Coach Bookings</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 sm:gap-4.5 shrink-0 self-center">
                          <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815] tracking-tight text-center">
                            Any doubts ?
                          </span>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 w-full sm:w-auto items-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleCardEnquiry(
                                  "Train Booking: Berth Confirmation",
                                )
                              }
                              className="px-5 py-2.5 rounded-lg bg-[#002f89] hover:bg-[#00246b] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95 text-center whitespace-nowrap"
                            >
                              Request Train Quote
                            </button>
                            <a
                              href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20would%20like%20to%20book%20a%20confirmed%20train%20ticket."
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp Desk</span>
                            </a>
                          </div>
                        </div>
                      </Card>
                    }
                  />
                ) : (
                  <BentoGridShowcase
                    integration={
                      <Card className="relative h-full overflow-hidden flex flex-col justify-between border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-[#1C1815] text-white">
                        <div className="absolute inset-0 z-0">
                          <Image
                            src="/services/bus-booking.webp"
                            alt="Bus Booking Vault"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center opacity-30 brightness-85"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1815] via-[#1C1815]/90 to-[#1C1815]/60" />
                        </div>

                        <CardHeader className="relative z-10 p-6 sm:p-7">
                          <Bus className="w-7 h-7 text-amber-300 mb-4" />
                          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-300/95 block mb-2">
                            Sleeper &amp; Volvo · Select
                          </span>
                          <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                            Fleet &amp; Seat Allocation
                          </CardTitle>
                          <CardDescription className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
                            Direct tie-ups with top verified private operators
                            and state luxury transport corporations for premier
                            highway journeys.
                          </CardDescription>

                          <div className="mt-6 space-y-3.5 text-xs sm:text-sm text-stone-200">
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Lower Deck Sleeper</strong> &amp; Single
                                Ladies Berth reserved safety
                              </span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Multi-Axle Volvo &amp; Scania</strong>{" "}
                                air-suspension smooth rides
                              </span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Clean Sanitized Blankets</strong>,
                                charging ports &amp; reading lights
                              </span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Prime City Boarding Lounges</strong>{" "}
                                with air-conditioned waiting facilities
                              </span>
                            </div>
                          </div>
                        </CardHeader>

                        <CardFooter className="relative z-10 p-6 sm:p-7 pt-0 border-t border-white/10 mt-6">
                          <button
                            type="button"
                            onClick={() =>
                              handleCardEnquiry(
                                "Bus Booking: Route & Berth Audit",
                              )
                            }
                            className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
                          >
                            <span>Request Bus Route Audit</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </CardFooter>
                      </Card>
                    }
                    trackers={
                      <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                        <div className="absolute inset-0 z-0">
                          <Image
                            src="/services/bus-booking.webp"
                            alt="Verified Operators & GPS Tracking"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3.5">
                            <ShieldCheck className="w-6 h-6 text-[#002f89]" />
                            <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-[#002f89]">
                              Safety First
                            </span>
                          </div>
                          <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                            Verified Operators &amp; GPS Tracking
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                            Every coach operator is pre-screened for commercial
                            fitness, speed governor compliance, and live GPS
                            broadcast.
                          </CardDescription>
                        </div>
                        <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs sm:text-sm text-stone-700 font-sans font-medium">
                          <span>Live Coach Location</span>
                          <span className="font-semibold text-emerald-700">
                            ✓ Shareable Tracking Link
                          </span>
                        </div>
                      </Card>
                    }
                    statistic={
                      <Card className="relative h-full overflow-hidden border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-[#002f89] to-[#001c54] text-white flex flex-col justify-between p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-300 font-bold">
                            Flyora Transit Metric
                          </span>
                          <ShieldCheck className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div className="my-2">
                          <span className="text-5xl sm:text-6xl font-serif font-extrabold tracking-tight text-white block">
                            99.4%
                          </span>
                          <span className="text-xs sm:text-sm text-white/90 font-sans font-medium mt-1 block">
                            On-Time Departure &amp; Arrival Record
                          </span>
                        </div>
                        <p className="text-xs text-white/75 font-sans leading-relaxed">
                          18,000+ passengers safely transported on overnight and
                          intercity highway express routes.
                        </p>
                      </Card>
                    }
                    focus={
                      <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                        <div className="absolute inset-0 z-0">
                          <Image
                            src="/gallery/verdant.jpg"
                            alt="City Boarding Point Assistance"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3.5">
                            <Clock className="w-6 h-6 text-amber-800" />
                            <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-amber-900">
                              Express Service
                            </span>
                          </div>
                          <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                            City Boarding Point Assistance
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                            Exact pickup coordinates, direct contact numbers of
                            the bus crew, and timely departure phone reminders.
                          </CardDescription>
                        </div>
                        <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs sm:text-sm text-stone-700 font-sans font-medium">
                          <span>Crew Contact Support</span>
                          <span className="font-semibold text-[#002f89]">
                            Direct Boarding Help
                          </span>
                        </div>
                      </Card>
                    }
                    productivity={
                      <Card className="group relative h-full overflow-hidden border border-white/80 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between p-6 rounded-[8px]">
                        <div className="absolute inset-0 z-0">
                          <Image
                            src="/services/bus-booking.webp"
                            alt="Easy Rescheduling & Instant Seat Lock"
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-center brightness-95 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-white/45 backdrop-blur-[6px]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/55 to-white/30" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3.5">
                            <CreditCard className="w-6 h-6 text-emerald-800" />
                            <span className="text-xs sm:text-sm font-sans font-semibold tracking-wide text-emerald-900">
                              Flexible Travel
                            </span>
                          </div>
                          <CardTitle className="text-base sm:text-lg font-serif font-bold text-[#1C1815] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                            Easy Rescheduling &amp; Seat Lock
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed font-sans font-medium">
                            Change your travel date up to 6 hours before
                            departure without losing your booking value or
                            incurring heavy penalties.
                          </CardDescription>
                        </div>
                        <div className="relative z-10 mt-4 pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs text-stone-600 font-sans font-medium">
                          <span>Reschedule Window</span>
                          <span className="font-semibold text-emerald-700">
                            ✓ Low Cancellation Fee
                          </span>
                        </div>
                      </Card>
                    }
                    shortcuts={
                      <Card className="h-full border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 p-6 sm:p-7">
                        <div className="max-w-md">
                          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#002f89] block mb-2">
                            Cabin Essentials
                          </span>
                          <CardTitle className="text-lg sm:text-xl font-serif font-bold text-[#1C1815]">
                            Hygienic Rest Stops, Extra Luggage Space &amp; 24/7
                            Road Desk
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed font-sans">
                            Pre-selected verified highway restaurants with clean
                            restrooms, dedicated boot luggage tags, and
                            emergency breakdown assistance.
                          </CardDescription>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs sm:text-sm text-stone-600 font-sans font-medium">
                            <span>• Clean Restroom Halts</span>
                            <span>• Free Luggage Tags</span>
                            <span>• Emergency Road Assist</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 sm:gap-4.5 shrink-0 self-center">
                          <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815] tracking-tight text-center">
                            Any doubts ?
                          </span>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 w-full sm:w-auto items-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleCardEnquiry(
                                  "Bus Booking: Seat Reservation",
                                )
                              }
                              className="px-5 py-2.5 rounded-lg bg-[#002f89] hover:bg-[#00246b] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95 text-center whitespace-nowrap"
                            >
                              Request Bus Quote
                            </button>
                            <a
                              href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20would%20like%20to%20book%20a%20luxury%20bus%20seat."
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp Desk</span>
                            </a>
                          </div>
                        </div>
                      </Card>
                    }
                  />
                )}
              </div>
            </section>
          </div>
        )}

        {/* -------------------------------------------------------------------------
            CASE 4: SACRED PILGRIMAGES (Combined Umrah & Hajj with Interactive Switcher)
            ------------------------------------------------------------------------- */}
        {(activeService.id === "umrah-hajj" ||
          activeService.id === "umrah-packages" ||
          activeService.id === "hajj-packages" ||
          activeService.slug === "umrah-hajj") && (
          <div id="pilgrimage-dynamic-hub" className="w-full bg-[#FDFCFB]">
            <section className="relative z-10 w-full pt-14 sm:pt-18 pb-20 sm:pb-24 border-t border-black/[0.06]">
              <div className="w-full px-6 sm:px-10 lg:px-[105px]">
                {/* Interactive Pilgrimage Switcher */}
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#002f89] block mb-3">
                    SACRED JOURNEYS &amp; BLESSED PILGRIMAGES
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#1C1815] tracking-tight leading-[1.14] mb-6">
                    Sacred Umrah &amp; Holy Hajj Pilgrimages
                  </h2>
                  <div className="inline-flex items-center p-1 rounded-full bg-stone-100 border border-black/[0.08] shadow-inner">
                    <button
                      type="button"
                      onClick={() => setPilgrimageTab("umrah")}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                        pilgrimageTab === "umrah"
                          ? "bg-[#002f89] text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <MosqueIcon className="w-4 h-4" />
                      <span>Sacred Umrah Packages</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPilgrimageTab("hajj")}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                        pilgrimageTab === "hajj"
                          ? "bg-[#002f89] text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <MosqueIcon className="w-4 h-4" />
                      <span>Holy Hajj Pilgrimage</span>
                    </button>
                  </div>
                </div>

                {pilgrimageTab === "umrah" ? (
                  <div className="w-full">
                    {/* Header Section */}
                    <div className="mb-10 sm:mb-12">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#002f89] mb-2.5">
                        <span>Sacred Pilgrimage</span>
                        <span>·</span>
                        <span>Executive 5-Star Suites</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-bold">
                          100% Guaranteed Rawdah Permit
                        </span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#1C1815] tracking-tight leading-[1.12]">
                        Executive 5-Star Umrah Pilgrimage Experience
                      </h2>
                      <p className="text-sm sm:text-base text-stone-600 mt-2.5 max-w-3xl font-sans leading-relaxed">
                        Complete peace of mind for you and your family.
                        Walking-distance 5-star Haram accommodations, VIP
                        Haramain bullet train, verified Nusuk permits, and
                        guided Ziyarat.
                      </p>
                    </div>

                    {/* 1. TOP SPLIT SHOWCASE: Left 4-Photo Gallery + Right Overview & Customizer */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-14 sm:mb-16 items-stretch">
                      {/* Left Column: Interactive 4-Photo Gallery */}
                      <div className="lg:col-span-7 flex flex-col h-full">
                        {/* Main Active Photo */}
                        <div className="relative w-full h-[360px] sm:h-[430px] lg:h-auto lg:flex-1 min-h-[360px] sm:min-h-[430px] rounded-[14px] overflow-hidden border border-black/[0.08] shadow-xs group bg-stone-900">
                          <Image
                            src={UMRAH_GALLERY_PHOTOS[umrahActivePhoto].src}
                            alt={UMRAH_GALLERY_PHOTOS[umrahActivePhoto].alt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 58vw"
                            priority
                            className="object-cover object-center transition-all duration-500 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                          {/* Photo Badge */}
                          <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-[14px] bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-300" />
                            <span>
                              {UMRAH_GALLERY_PHOTOS[umrahActivePhoto].label}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 z-10 text-white drop-shadow-md">
                            <p className="text-sm sm:text-base font-serif font-medium text-white/95">
                              {UMRAH_GALLERY_PHOTOS[umrahActivePhoto].alt}
                            </p>
                          </div>
                        </div>

                        {/* 4 Clickable Thumbnails */}
                        <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 mt-3 sm:mt-3.5 shrink-0">
                          {UMRAH_GALLERY_PHOTOS.map((photo, idx) => {
                            const isActive = idx === umrahActivePhoto;
                            return (
                              <button
                                key={photo.label}
                                type="button"
                                onClick={() => setUmrahActivePhoto(idx)}
                                className={`group relative h-[80px] sm:h-[95px] rounded-[14px] overflow-hidden border-2 transition-all cursor-pointer text-left ${
                                  isActive
                                    ? "border-[#002f89] ring-2 ring-[#002f89]/25 shadow-xs"
                                    : "border-black/[0.1] opacity-75 hover:opacity-100 hover:border-black/30"
                                }`}
                              >
                                <Image
                                  src={photo.src}
                                  alt={photo.alt}
                                  fill
                                  sizes="25vw"
                                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                <div className="absolute bottom-1 inset-x-1 text-center bg-black/65 backdrop-blur-xs text-[10px] text-white py-0.5 rounded-[6px] font-medium truncate px-1">
                                  {photo.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Column: Pricing, Specs & Package Tier Selector */}
                      <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-[14px] border border-black/[0.08] p-6 sm:p-7 shadow-xs">
                        <div>
                          {/* Price & Rating Bar */}
                          <div className="flex items-start justify-between gap-4 pb-5 border-b border-black/[0.06]">
                            <div>
                              <span className="text-xs text-stone-500 uppercase tracking-wider font-mono block">
                                Pricing &amp; Departures
                              </span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#002f89]">
                                  {UMRAH_TIER_DATA[umrahTierSelect].price}
                                </span>
                                <span className="text-xs text-stone-500 font-sans">
                                  {UMRAH_TIER_DATA[umrahTierSelect].perPerson}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs text-stone-500 uppercase tracking-wider font-mono block">
                                Pilgrim Rating
                              </span>
                              <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-[14px] bg-amber-50 text-amber-900 border border-amber-200/60 text-xs font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>4.9</span>
                                <span className="text-amber-700/80 font-normal">
                                  (450+ Reviews)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 4 Quick Spec Badges (2x2 Grid) */}
                          <div className="grid grid-cols-2 gap-3 py-5 border-b border-black/[0.06]">
                            <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-black/[0.04]">
                              <Clock className="w-4 h-4 text-[#002f89] shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-mono text-stone-400 block leading-none">
                                  Duration
                                </span>
                                <span className="text-xs font-semibold text-stone-800">
                                  {UMRAH_TIER_DATA[umrahTierSelect].duration}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-black/[0.04]">
                              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-mono text-stone-400 block leading-none">
                                  Haram Distance
                                </span>
                                <span className="text-xs font-semibold text-stone-800">
                                  {UMRAH_TIER_DATA[umrahTierSelect].distance}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-black/[0.04]">
                              <Train className="w-4 h-4 text-amber-700 shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-mono text-stone-400 block leading-none">
                                  Transit Mode
                                </span>
                                <span className="text-xs font-semibold text-stone-800">
                                  {UMRAH_TIER_DATA[umrahTierSelect].transit}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-black/[0.04]">
                              <UserCheck className="w-4 h-4 text-purple-700 shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-mono text-stone-400 block leading-none">
                                  Scholar Guide
                                </span>
                                <span className="text-xs font-semibold text-stone-800">
                                  {UMRAH_TIER_DATA[umrahTierSelect].guide}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Package Tier Selection Tabs */}
                          <div className="pt-5">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 block mb-2.5">
                              Select Comfort Tier
                            </span>
                            <div className="grid grid-cols-3 gap-2 p-1 rounded-[14px] bg-[#FAF8F5] border border-black/[0.06]">
                              {(
                                [
                                  "executive",
                                  "deluxe",
                                  "vip",
                                ] as PilgrimageTierKey[]
                              ).map((key) => {
                                const isSelected = umrahTierSelect === key;
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => setUmrahTierSelect(key)}
                                    className={`py-2 px-1 text-xs font-semibold rounded-[10px] transition-all cursor-pointer text-center ${
                                      isSelected
                                        ? "bg-[#002f89] text-white shadow-xs"
                                        : "text-stone-600 hover:text-stone-900 hover:bg-white/80"
                                    }`}
                                  >
                                    {UMRAH_TIER_DATA[key].name}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Selected Hotels Information */}
                            <div className="mt-4 p-3.5 rounded-[14px] bg-amber-50/60 border border-amber-200/50 space-y-1.5 text-xs text-amber-950">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-amber-900">
                                  Makkah Stay:
                                </span>
                                <span className="font-bold">
                                  {UMRAH_TIER_DATA[umrahTierSelect].makkahHotel}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-amber-900">
                                  Madinah Stay:
                                </span>
                                <span className="font-bold">
                                  {
                                    UMRAH_TIER_DATA[umrahTierSelect]
                                      .madinahHotel
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Booking Buttons */}
                        <div className="pt-6 mt-6 border-t border-black/[0.06] flex flex-col gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleCardEnquiry(
                                `Umrah Packages (${UMRAH_TIER_DATA[umrahTierSelect].name})`,
                              )
                            }
                            className="w-full py-3.5 px-6 rounded-[14px] bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_18px_rgba(0,47,137,0.35)] cursor-pointer active:scale-[0.99]"
                          >
                            <span>Request Available Batches &amp; Quote</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <a
                            href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20would%20like%20to%20inquire%20about%20Umrah%20packages%20and%20upcoming%20batches."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Consult Pilgrim Desk on WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* 2. LOWER SECTION: Left Narrative & Itinerary Timeline + Right Sticky Summary Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                      {/* Left Column (8 cols): Overview, Timeline, Inclusions, Reviews */}
                      <div className="lg:col-span-8 space-y-12">
                        {/* A. Spiritual Experience Overview */}
                        <div className="bg-white rounded-[8px] p-7 sm:p-8 border border-black/[0.08] shadow-xs">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002f89] block mb-2">
                            Sacred Pilgrimage Overview
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815] mb-3">
                            A Sunnah-Compliant, Tranquil Pilgrimage for You
                            &amp; Your Family
                          </h3>
                          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
                            Performing Umrah is a life-affirming spiritual
                            devotion. Flyora ensures your focus remains entirely
                            on your prayers and supplications by eliminating the
                            stress of distant commutes, complicated paperwork,
                            and language barriers.
                          </p>
                          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans mt-3">
                            Our accommodations are handpicked within 50 to 150
                            meters of the Holy Haram gates, allowing elderly
                            pilgrims and families to comfortably walk to every
                            congregation prayer with zero shuttle hassle.
                          </p>
                        </div>

                        {/* B. Your Sacred Journey: Vertical Timeline Itinerary (Aceternity Timeline) */}
                        <div className="bg-white rounded-[14px] border border-black/[0.08] shadow-xs overflow-visible">
                          <Timeline
                            title={
                              <div>
                                <span className="text-xs font-sans font-bold uppercase tracking-[0.16em] text-[#002f89] block mb-2">
                                  Spiritual Milestones
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815]">
                                  Sacred Umrah Journey
                                </h3>
                              </div>
                            }
                            description={
                              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-sans leading-relaxed">
                                A serene, sunnah-guided roadmap from arrival and
                                Kaaba Tawaf to the tranquil Haramain bullet
                                train and Madinah Al-Munawwarah.
                              </p>
                            }
                            data={UMRAH_TIMELINE_DATA}
                            className="bg-white"
                          />
                        </div>

                        {/* C. Partner Network & Concierge Guarantees */}
                        <div className="bg-white rounded-[14px] p-6 sm:p-8 border border-black/[0.08] shadow-xs">
                          <div className="mb-6">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002f89] block mb-1">
                              Concierge Standards &amp; Safety
                            </span>
                            <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1815]">
                              Our Partner Network Guarantees
                            </h4>
                            <p className="text-xs sm:text-sm text-stone-600 mt-1">
                              We vet and coordinate with officially licensed
                              Saudi Ministry operators to ensure your sacred
                              pilgrimage is conducted with complete integrity
                              and comfort.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            {PILGRIMAGE_PARTNER_GUARANTEES.map((item) => (
                              <div
                                key={item.title}
                                className="p-4 sm:p-5 rounded-[14px] bg-[#FAF8F5] border border-black/[0.06] flex flex-col justify-between space-y-2 hover:border-[#002f89]/30 transition-colors"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <h5 className="text-sm font-semibold text-stone-900 font-sans">
                                      {item.title}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-stone-600 leading-relaxed font-sans pl-6">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column (4 cols): Sticky Sidebar Action Card */}
                      <div className="lg:col-span-4">
                        <div className="sticky top-28 self-start bg-white rounded-[14px] p-6 sm:p-7 border border-black/[0.08] shadow-sm space-y-6">
                          <div>
                            <span className="inline-block px-2.5 py-1 rounded-[8px] bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
                              Verified Partner Batch
                            </span>
                            <h4 className="text-xl font-serif font-bold text-[#1C1815]">
                              {UMRAH_TIER_DATA[umrahTierSelect].name}
                            </h4>
                            <div className="mt-3">
                              <span className="text-xs text-stone-500 font-mono block">
                                Pricing &amp; Departures
                              </span>
                              <span className="text-2xl font-serif font-bold text-[#002f89]">
                                {UMRAH_TIER_DATA[umrahTierSelect].price}
                              </span>
                              <span className="text-xs text-stone-500 ml-1.5 font-sans block mt-0.5">
                                {UMRAH_TIER_DATA[umrahTierSelect].perPerson}
                              </span>
                            </div>
                          </div>

                          <div className="py-4 border-y border-black/[0.06] space-y-2.5 text-xs text-stone-700">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                {UMRAH_TIER_DATA[umrahTierSelect].distance}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                {UMRAH_TIER_DATA[umrahTierSelect].transit}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                Guaranteed Rawdah Nusuk Permit Assistance
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Bilingual Scholar Guidance Included</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleCardEnquiry(
                                  `Umrah Packages (${UMRAH_TIER_DATA[umrahTierSelect].name})`,
                                )
                              }
                              className="w-full py-3.5 px-5 rounded-[14px] bg-[#002f89] hover:bg-[#00246b] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <span>Request Batch Dates &amp; Quote</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <a
                              href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20would%20like%20to%20inquire%20about%20Umrah%20packages%20and%20upcoming%20batches."
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 px-4 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Consult Pilgrim Desk on WhatsApp</span>
                            </a>
                          </div>

                          <div className="pt-2 text-center text-[11px] text-stone-500 font-sans border-t border-black/[0.06]">
                            Official MoFA Authorized · 100% Price Lock Guarantee
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    {/* Header Section */}
                    <div className="mb-10 sm:mb-12">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#002f89] mb-2.5">
                        <span>The Fifth Pillar</span>
                        <span>·</span>
                        <span>Official Ministry Allocation</span>
                        <span>·</span>
                        <span className="text-amber-800 font-bold">
                          Zone A Deluxe European Camps
                        </span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#1C1815] tracking-tight leading-[1.12]">
                        Royal Non-Shifting Hajj Pilgrimage Allocation
                      </h2>
                      <p className="text-sm sm:text-base text-stone-600 mt-2.5 max-w-3xl font-sans leading-relaxed">
                        The sacred journey of a lifetime conducted with complete
                        serenity. Premium air-conditioned Mina camps, private
                        Mashair high-speed transit, and full scholarly guidance.
                      </p>
                    </div>

                    {/* 1. TOP SPLIT SHOWCASE: Left 4-Photo Gallery + Right Overview & Customizer */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-14 sm:mb-16 items-stretch">
                      {/* Left Column: Interactive 4-Photo Gallery */}
                      <div className="lg:col-span-7 flex flex-col h-full">
                        {/* Main Active Photo */}
                        <div className="relative w-full h-[360px] sm:h-[430px] lg:h-auto lg:flex-1 min-h-[360px] sm:min-h-[430px] rounded-[14px] overflow-hidden border border-black/[0.08] shadow-xs group bg-stone-900">
                          <Image
                            src={HAJJ_GALLERY_PHOTOS[hajjActivePhoto].src}
                            alt={HAJJ_GALLERY_PHOTOS[hajjActivePhoto].alt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 58vw"
                            priority
                            className="object-cover object-center transition-all duration-500 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                          {/* Photo Badge */}
                          <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-[14px] bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-300" />
                            <span>
                              {HAJJ_GALLERY_PHOTOS[hajjActivePhoto].label}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 z-10 text-white drop-shadow-md">
                            <p className="text-sm sm:text-base font-serif font-medium text-white/95">
                              {HAJJ_GALLERY_PHOTOS[hajjActivePhoto].alt}
                            </p>
                          </div>
                        </div>

                        {/* 4 Clickable Thumbnails */}
                        <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 mt-3 sm:mt-3.5 shrink-0">
                          {HAJJ_GALLERY_PHOTOS.map((photo, idx) => {
                            const isActive = idx === hajjActivePhoto;
                            return (
                              <button
                                key={photo.label}
                                type="button"
                                onClick={() => setHajjActivePhoto(idx)}
                                className={`group relative h-[80px] sm:h-[95px] rounded-[14px] overflow-hidden border-2 transition-all cursor-pointer text-left ${
                                  isActive
                                    ? "border-[#002f89] ring-2 ring-[#002f89]/25 shadow-xs"
                                    : "border-black/[0.1] opacity-75 hover:opacity-100 hover:border-black/30"
                                }`}
                              >
                                <Image
                                  src={photo.src}
                                  alt={photo.alt}
                                  fill
                                  sizes="25vw"
                                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                <div className="absolute bottom-1 inset-x-1 text-center bg-black/65 backdrop-blur-xs text-[10px] text-white py-0.5 rounded-[6px] font-medium truncate px-1">
                                  {photo.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Column: Pricing, Specs & Package Tier Selector */}
                      <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-[14px] border border-black/[0.08] p-6 sm:p-7 shadow-xs">
                        <div>
                          {/* Price & Rating Bar */}
                          <div className="flex items-start justify-between gap-4 pb-5 border-b border-black/[0.06]">
                            <div>
                              <span className="text-xs text-stone-500 uppercase tracking-wider font-mono block">
                                Allocation &amp; Departures
                              </span>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#002f89]">
                                  {HAJJ_TIER_DATA[hajjTierSelect].price}
                                </span>
                                <span className="text-xs text-stone-500 font-sans">
                                  {HAJJ_TIER_DATA[hajjTierSelect].perPerson}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs text-stone-500 uppercase tracking-wider font-mono block">
                                Portal Advisory
                              </span>
                              <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-[14px] bg-emerald-50 text-emerald-900 border border-emerald-200/60 text-xs font-bold">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Ministry Vetted</span>
                              </div>
                            </div>
                          </div>

                          {/* 4 Quick Spec Badges (2x2 Grid) */}
                          <div className="grid grid-cols-2 gap-3 py-5 border-b border-black/[0.06]">
                            <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-black/[0.04]">
                              <Clock className="w-4 h-4 text-[#002f89] shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-mono text-stone-400 block leading-none">
                                  Duration
                                </span>
                                <span className="text-xs font-semibold text-stone-800">
                                  {HAJJ_TIER_DATA[hajjTierSelect].duration}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-black/[0.04]">
                              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-mono text-stone-400 block leading-none">
                                  Camp Category
                                </span>
                                <span className="text-xs font-semibold text-stone-800">
                                  {HAJJ_TIER_DATA[hajjTierSelect].distance}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-black/[0.04]">
                              <Train className="w-4 h-4 text-amber-700 shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-mono text-stone-400 block leading-none">
                                  Transit Mode
                                </span>
                                <span className="text-xs font-semibold text-stone-800">
                                  {HAJJ_TIER_DATA[hajjTierSelect].transit}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-black/[0.04]">
                              <UserCheck className="w-4 h-4 text-purple-700 shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-mono text-stone-400 block leading-none">
                                  Scholarly Guidance
                                </span>
                                <span className="text-xs font-semibold text-stone-800">
                                  {HAJJ_TIER_DATA[hajjTierSelect].guide}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Package Tier Selection Tabs */}
                          <div className="pt-5">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 block mb-2.5">
                              Select Hajj Category
                            </span>
                            <div className="grid grid-cols-3 gap-2 p-1 rounded-[14px] bg-[#FAF8F5] border border-black/[0.06]">
                              {(
                                [
                                  "executive",
                                  "deluxe",
                                  "vip",
                                ] as PilgrimageTierKey[]
                              ).map((key) => {
                                const isSelected = hajjTierSelect === key;
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => setHajjTierSelect(key)}
                                    className={`py-2 px-1 text-xs font-semibold rounded-[10px] transition-all cursor-pointer text-center ${
                                      isSelected
                                        ? "bg-[#002f89] text-white shadow-xs"
                                        : "text-stone-600 hover:text-stone-900 hover:bg-white/80"
                                    }`}
                                  >
                                    {HAJJ_TIER_DATA[key].name}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Selected Hotels Information */}
                            <div className="mt-4 p-3.5 rounded-[14px] bg-amber-50/60 border border-amber-200/50 space-y-1.5 text-xs text-amber-950">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-amber-900">
                                  Makkah Stay:
                                </span>
                                <span className="font-bold">
                                  {HAJJ_TIER_DATA[hajjTierSelect].makkahHotel}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-amber-900">
                                  Madinah Stay:
                                </span>
                                <span className="font-bold">
                                  {HAJJ_TIER_DATA[hajjTierSelect].madinahHotel}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Booking Buttons */}
                        <div className="pt-6 mt-6 border-t border-black/[0.06] flex flex-col gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleCardEnquiry(
                                `Hajj Packages (${HAJJ_TIER_DATA[hajjTierSelect].name})`,
                              )
                            }
                            className="w-full py-3.5 px-6 rounded-[14px] bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_18px_rgba(0,47,137,0.35)] cursor-pointer active:scale-[0.99]"
                          >
                            <span>Request Hajj Guidance &amp; Allocation</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <a
                            href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20would%20like%20to%20inquire%20about%20the%20Hajj%20advisory%20desk."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Consult Hajj Advisory Desk on WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* 2. LOWER SECTION: Left Narrative & Itinerary Timeline + Right Sticky Summary Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                      {/* Left Column (8 cols): Overview, Timeline, Inclusions, Reviews */}
                      <div className="lg:col-span-8 space-y-12">
                        {/* A. Spiritual Experience Overview */}
                        <div className="bg-white rounded-[14px] p-7 sm:p-8 border border-black/[0.08] shadow-xs">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002f89] block mb-2">
                            Hajj Rituals Overview
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815] mb-3">
                            Fulfilling the Sacred Pillar with Dedicated Guidance
                          </h3>
                          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
                            Hajj is the spiritual pinnacle of a Muslim&apos;s
                            lifetime. Flyora acts as your trusted pilgrimage
                            advisory and liaison desk, connecting you with
                            verified, Saudi Ministry-accredited Hajj operators
                            for official Nusuk quota allocations, high-standard
                            camps, and scholar guidance.
                          </p>
                          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans mt-3">
                            We assist in comparing licensed packages, reviewing
                            camp proximity in Mina, arranging pre-departure
                            spiritual orientations, and navigating the digital
                            Nusuk portal with total transparency.
                          </p>
                        </div>

                        {/* B. Your Sacred Journey: Vertical Timeline Itinerary (Aceternity Timeline) */}
                        <div className="bg-white rounded-[14px] border border-black/[0.08] shadow-xs overflow-visible">
                          <Timeline
                            title={
                              <div>
                                <span className="text-xs font-sans font-bold uppercase tracking-[0.16em] text-[#002f89] block mb-2">
                                  Manasik Timeline
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815]">
                                  The Manasik al-Hajj Program
                                </h3>
                              </div>
                            }
                            description={
                              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-sans leading-relaxed">
                                Complete day-by-day ritual milestones supported
                                by dedicated Islamic scholars, European camps,
                                and VIP Mashair transit.
                              </p>
                            }
                            data={HAJJ_TIMELINE_DATA}
                            className="bg-white"
                          />
                        </div>

                        {/* C. Partner Network & Concierge Guarantees */}
                        <div className="bg-white rounded-[14px] p-6 sm:p-8 border border-black/[0.08] shadow-xs">
                          <div className="mb-6">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002f89] block mb-1">
                              Accredited Partner Network
                            </span>
                            <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1815]">
                              Our Hajj Advisory &amp; Liaison Guarantees
                            </h4>
                            <p className="text-xs sm:text-sm text-stone-600 mt-1">
                              We vet and connect pilgrims exclusively to
                              licensed Saudi Ministry of Hajj &amp; Umrah
                              operators with transparent allocations.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            {HAJJ_PARTNER_GUARANTEES.map((item) => (
                              <div
                                key={item.title}
                                className="p-4 sm:p-5 rounded-[14px] bg-[#FAF8F5] border border-black/[0.06] flex flex-col justify-between space-y-2 hover:border-[#002f89]/30 transition-colors"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <h5 className="text-sm font-semibold text-stone-900 font-sans">
                                      {item.title}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-stone-600 leading-relaxed font-sans pl-6">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column (4 cols): Sticky Sidebar Action Card */}
                      <div className="lg:col-span-4">
                        <div className="sticky top-28 self-start bg-white rounded-[14px] p-6 sm:p-7 border border-black/[0.08] shadow-sm space-y-6">
                          <div>
                            <span className="inline-block px-2.5 py-1 rounded-[8px] bg-amber-50 text-amber-900 border border-amber-200/60 text-xs font-semibold uppercase tracking-wider mb-2">
                              Hajj 1448H Allocation
                            </span>
                            <h4 className="text-xl font-serif font-bold text-[#1C1815]">
                              {HAJJ_TIER_DATA[hajjTierSelect].name}
                            </h4>
                            <div className="mt-3">
                              <span className="text-xs text-stone-500 font-mono block">
                                Allocation &amp; Departures
                              </span>
                              <span className="text-2xl font-serif font-bold text-[#002f89]">
                                {HAJJ_TIER_DATA[hajjTierSelect].price}
                              </span>
                              <span className="text-xs text-stone-500 ml-1.5 font-sans block mt-0.5">
                                {HAJJ_TIER_DATA[hajjTierSelect].perPerson}
                              </span>
                            </div>
                          </div>

                          <div className="py-4 border-y border-black/[0.06] space-y-2.5 text-xs text-stone-700">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                {HAJJ_TIER_DATA[hajjTierSelect].distance}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                {HAJJ_TIER_DATA[hajjTierSelect].transit}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Official Nusuk Platform Processing</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Full Mina &amp; Arafat Hot Catering</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleCardEnquiry(
                                  `Hajj Packages (${HAJJ_TIER_DATA[hajjTierSelect].name})`,
                                )
                              }
                              className="w-full py-3.5 px-5 rounded-[14px] bg-[#002f89] hover:bg-[#00246b] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <span>
                                Request Hajj Guidance &amp; Allocation
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <a
                              href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20would%20like%20information%20on%20Hajj%20packages%20and%20Nusuk%20guidance."
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 px-4 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Consult Hajj Advisory Desk</span>
                            </a>
                          </div>

                          <div className="pt-2 text-center text-[11px] text-stone-500 font-sans border-t border-black/[0.06]">
                            Direct Ministry Allocation · Full Protection
                            Guarantee
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* -------------------------------------------------------------------------
            CASE 5: HOTEL BOOKING (Luxury Resorts & Overwater Villas Showcase)
            ------------------------------------------------------------------------- */}
        {(activeService.id === "hotel-booking" ||
          activeService.slug === "hotel-booking") && (
          <div id="hotel-dynamic-hub" className="w-full bg-[#FDFCFB]">
            <section className="relative z-10 w-full pt-14 sm:pt-18 pb-20 sm:pb-24 border-t border-black/[0.06] bg-white overflow-hidden">
              <div className="w-full px-6 sm:px-10 lg:px-[105px]">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#002f89] block mb-2">
                    LUXURY RESORTS &amp; BOUTIQUE STAYS
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#1C1815] tracking-tight leading-[1.14]">
                    Luxury Hotel &amp; Resort Reservation Concierge
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 mt-3 font-sans leading-relaxed">
                    Access unpublished corporate rates, complimentary room
                    upgrades, verified 5-star properties, and 24/7 guest
                    concierge liaison.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Dark Card: Luxury Stays Vault */}
                  <Card className="relative h-full overflow-hidden flex flex-col justify-between border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-[#1C1815] text-white">
                    <div className="absolute inset-0 z-0">
                      <Image
                        src="/services/hotel-booking.webp"
                        alt="Luxury Hotel Suite"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center opacity-30 brightness-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1815] via-[#1C1815]/90 to-[#1C1815]/60" />
                    </div>

                    <CardHeader className="relative z-10 p-6 sm:p-7">
                      <Building2 className="w-7 h-7 text-amber-300 mb-4" />
                      <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-300/95 block mb-2">
                        5-Star Partner · Wholesale Lock
                      </span>
                      <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                        Luxury Suites &amp; Overwater Villas
                      </CardTitle>
                      <CardDescription className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
                        Exclusive partner allocations with luxury resort brands,
                        boutique beachfront estates, and iconic heritage
                        palaces.
                      </CardDescription>

                      <div className="mt-6 space-y-3.5 text-xs sm:text-sm text-stone-200">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Complimentary Breakfast</strong> &amp; early
                            check-in privileges
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Zero Booking Fees</strong> or surprise
                            checkout card surcharges
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>VIP Room Upgrades</strong> &amp;
                            personalized honeymoon amenities
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardFooter className="relative z-10 p-6 sm:p-7 pt-0 border-t border-white/10 mt-6">
                      <div className="flex items-center justify-between w-full text-xs text-stone-300">
                        <span>Wholesale Partner Rates</span>
                        <span className="font-mono text-amber-300 font-semibold">
                          5,000+ Verified Stays
                        </span>
                      </div>
                    </CardFooter>
                  </Card>

                  {/* Middle Card: Check-In Essentials & VIP Perks */}
                  <Card className="h-full border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-[#FDFCFB] flex flex-col justify-between">
                    <div>
                      <CardHeader className="p-6 sm:p-7 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#002f89]">
                            Hotel Dossier
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[11px] font-mono border-emerald-300 text-emerald-800 bg-emerald-50"
                          >
                            Best Price Guarantee
                          </Badge>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-serif font-bold text-[#1C1815]">
                          Check-In Essentials &amp; VIP Perks
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-600 mt-1">
                          Smooth check-in guidelines for international resorts
                          and domestic heritage stays.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 sm:p-7 pt-0 space-y-4 text-xs sm:text-sm">
                        <div className="p-3.5 rounded-lg bg-stone-50 border border-black/[0.04]">
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#002f89]" />
                            <span>Photo ID &amp; Incidental Card Hold</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Original passport (abroad) or Aadhaar/Voter ID
                            (domestic) plus credit card for standard refundable
                            incidental room hold.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-stone-50 border border-black/[0.04]">
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#002f89]" />
                            <span>Check-In &amp; Transfer Coordination</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Standard check-in is 2:00 PM / 3:00 PM. We
                            coordinate with the hotel GM for early arrival
                            luggage drop or early room access.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-stone-50 border border-black/[0.04]">
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span>Honeymoon &amp; Special Celebrations</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Inform our concierge 48 hours prior for
                            complimentary sparkling wine, floral bed decor, and
                            anniversary cakes.
                          </p>
                        </div>
                      </CardContent>
                    </div>
                  </Card>

                  {/* Right Card: 4-Step Process & Actions */}
                  <Card className="h-full border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                    <div>
                      <CardHeader className="p-6 sm:p-7 pb-4">
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#002f89] mb-1 block">
                          Transparent Concierge
                        </span>
                        <CardTitle className="text-xl sm:text-2xl font-serif font-bold text-[#1C1815]">
                          4-Step Hotel Booking Process
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-600 mt-1">
                          Personalized hotel shortlist to verified reservation
                          voucher in minutes.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 sm:p-7 pt-0 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            01
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Share Destination &amp; Stay Style
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              Tell us city, dates, guest count, and vibe
                              (beachfront villa, central 5★ suite).
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            02
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Receive Curated PDF Portfolio
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              Review handpicked properties with verified photos,
                              amenities, and VIP perks.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            03
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Instant Room &amp; Rate Lock
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              Confirm with zero markups, locked exchange rates,
                              and flexible cancellation terms.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            04
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Pre-Arrival Liaison &amp; VIP Check-in
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              We coordinate with hotel management to prepare
                              personalized welcome amenities.
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-6 sm:p-7 pt-4 border-t border-black/[0.06] bg-stone-50/60">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleCardEnquiry("Hotel Booking")}
                          className="flex-1 py-3 px-4 rounded-md bg-[#002f89] hover:bg-[#00246b] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <span>Request Hotel Quote</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                          href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20would%20like%20to%20book%20a%20luxury%20hotel%20or%20resort."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp Desk</span>
                        </a>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* -------------------------------------------------------------------------
            CASE 6: PASSPORT ASSISTANCE (PSK Appointments & Tatkal Express)
            ------------------------------------------------------------------------- */}
        {(activeService.id === "passport-assistance" ||
          activeService.id === "escort-parking" ||
          activeService.slug === "escort-parking" ||
          activeService.slug === "passport-assistance") && (
          <div id="passport-dynamic-hub" className="w-full bg-white">
            <section className="relative z-10 w-full pt-14 sm:pt-18 pb-20 sm:pb-24 border-t border-black/[0.06] bg-white overflow-hidden">
              <div className="w-full px-6 sm:px-10 lg:px-[105px]">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#002f89] block mb-2">
                    PASSPORT CONCIERGE &amp; TATKAL EXPRESS
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#1C1815] tracking-tight leading-[1.14]">
                    Hassle-Free Passport Services &amp; Tatkal Express
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 mt-3 font-sans leading-relaxed">
                    End-to-end guidance from online form submission to PSK /
                    Post Office appointment slot booking, meticulous document
                    verification, and police verification tracking.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Dark Card: Passport Service Vault */}
                  <Card className="relative h-full overflow-hidden flex flex-col justify-between border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-[#1C1815] text-white">
                    <div className="absolute inset-0 z-0">
                      <Image
                        src="/services/passport-service.webp"
                        alt="Passport Assistance Vault"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center opacity-30 brightness-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1815] via-[#1C1815]/90 to-[#1C1815]/60" />
                    </div>

                    <CardHeader className="relative z-10 p-6 sm:p-7">
                      <PassportIcon className="w-7 h-7 text-amber-300 mb-4" />
                      <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-300/95 block mb-2">
                        Government Authorized · Priority
                      </span>
                      <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                        Fresh, Renewal &amp; Tatkal Passport
                      </CardTitle>
                      <CardDescription className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
                        Complete documentation pre-audit ensuring zero rejection
                        visits at Passport Seva Kendra (PSK) &amp; Post Office
                        PSKs.
                      </CardDescription>

                      <div className="mt-6 space-y-3.5 text-xs sm:text-sm text-stone-200">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Express Tatkal Appointments</strong> secured
                            within 24–48 hours
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Annexure &amp; Affidavit Drafting</strong>{" "}
                            for name change, spouse add &amp; minor
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Police Verification Tracking</strong> with
                            Speed Post dispatch alerts
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardFooter className="relative z-10 p-6 sm:p-7 pt-0 border-t border-white/10 mt-6">
                      <div className="flex items-center justify-between w-full text-xs text-stone-300">
                        <span>Government Authorized Assistance</span>
                        <span className="font-mono text-amber-300 font-semibold">
                          15,000+ Delivered
                        </span>
                      </div>
                    </CardFooter>
                  </Card>

                  {/* Middle Card: Mandatory Documents Checklist */}
                  <Card className="h-full border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-[#FDFCFB] flex flex-col justify-between">
                    <div>
                      <CardHeader className="p-6 sm:p-7 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#002f89]">
                            Passport Checklist
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[11px] font-mono border-emerald-300 text-emerald-800 bg-emerald-50"
                          >
                            Zero Rejection Audit
                          </Badge>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-serif font-bold text-[#1C1815]">
                          Mandatory Verification Documents
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-600 mt-1">
                          Carry originals plus two self-attested photocopies to
                          your appointment.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 sm:p-7 pt-0 space-y-4 text-xs sm:text-sm">
                        <div className="p-3.5 rounded-lg bg-stone-50 border border-black/[0.04]">
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#002f89]" />
                            <span>Proof of Current Address (1+ Year)</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Aadhaar Card, updated bank passbook with photo &amp;
                            bank stamp, electricity bill, or registered rent
                            agreement.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-stone-50 border border-black/[0.04]">
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#002f89]" />
                            <span>Proof of Date of Birth (DOB)</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Municipal Birth Certificate, 10th Class passing
                            certificate/mark sheet, or PAN card showing full
                            DD/MM/YYYY.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-stone-50 border border-black/[0.04]">
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Previous Passport (Renewals / Re-issue)</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Original old passport with self-attested copies of
                            first 2 and last 2 pages. Police FIR/NCR copy
                            required if lost.
                          </p>
                        </div>
                      </CardContent>
                    </div>
                  </Card>

                  {/* Right Card: 4-Step Application Process */}
                  <Card className="h-full border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                    <div>
                      <CardHeader className="p-6 sm:p-7 pb-4">
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#002f89] mb-1 block">
                          Transparent Concierge
                        </span>
                        <CardTitle className="text-xl sm:text-2xl font-serif font-bold text-[#1C1815]">
                          4-Step Passport Assistance
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-600 mt-1">
                          From form filing to direct doorstep Speed Post
                          delivery.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 sm:p-7 pt-0 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            01
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Submit Basic Details via WhatsApp
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              Send photos of your Aadhaar, DOB proof, and old
                              passport for pre-screening.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            02
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Online Application &amp; Slot Booking
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              We file your government form and book your
                              appointment slot at your nearest PSK / Post
                              Office.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            03
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Appointment Dossier &amp; Briefing
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              Receive an arranged PDF document file with exact
                              sequence guidance for Counter A, B &amp; C.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            04
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Police Clearance &amp; Speed Post Tracking
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              We track your local police station report and
                              Speed Post tracking number to your door.
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-6 sm:p-7 pt-4 border-t border-black/[0.06] bg-stone-50/60">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleCardEnquiry("Passport Assistance")
                          }
                          className="flex-1 py-3 px-4 rounded-md bg-[#002f89] hover:bg-[#00246b] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <span>Request Passport Help</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                          href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20need%20assistance%20with%20passport%20application%20/%20renewal%20/%20Tatkal."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp Desk</span>
                        </a>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* -------------------------------------------------------------------------
            CASE 7: TRAVEL INSURANCE (Worldwide Cashless Medical & Baggage Protection)
            ------------------------------------------------------------------------- */}
        {(activeService.id === "travel-insurance" ||
          activeService.slug === "travel-insurance") && (
          <div id="insurance-dynamic-hub" className="w-full bg-[#FDFCFB]">
            <section className="relative z-10 w-full pt-14 sm:pt-18 pb-20 sm:pb-24 border-t border-black/[0.06] bg-white overflow-hidden">
              <div className="w-full px-6 sm:px-10 lg:px-[105px]">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#002f89] block mb-2">
                    GLOBAL TRAVEL INSURANCE &amp; MEDICAL COVER
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#1C1815] tracking-tight leading-[1.14]">
                    Worldwide Cashless Medical &amp; Baggage Protection
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 mt-3 font-sans leading-relaxed">
                    Instant embassy-approved travel insurance covers for
                    Schengen, USA, UK, and worldwide destinations with
                    zero-deductible hospitalization claims.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Dark Card: Insurance Vault */}
                  <Card className="relative h-full overflow-hidden flex flex-col justify-between border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-[#1C1815] text-white">
                    <div className="absolute inset-0 z-0">
                      <Image
                        src="/services/travel-insurance.webp"
                        alt="Travel Insurance Vault"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center opacity-30 brightness-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1815] via-[#1C1815]/90 to-[#1C1815]/60" />
                    </div>

                    <CardHeader className="relative z-10 p-6 sm:p-7">
                      <ShieldCheck className="w-7 h-7 text-amber-300 mb-4" />
                      <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-300/95 block mb-2">
                        Global Cashless · $500,000 Cover
                      </span>
                      <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                        Worldwide Cashless Hospitalization
                      </CardTitle>
                      <CardDescription className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
                        Accepted by 100% of European Schengen embassies and
                        international consulates with zero-deductible options.
                      </CardDescription>

                      <div className="mt-6 space-y-3.5 text-xs sm:text-sm text-stone-200">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>
                              $50,000 to $500,000 Emergency Medical
                            </strong>{" "}
                            cashless coverage
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>
                              Trip Cancellation &amp; Flight Delay
                            </strong>{" "}
                            financial compensation
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>
                              Loss of Checked Baggage &amp; Passport
                            </strong>{" "}
                            reimbursement
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardFooter className="relative z-10 p-6 sm:p-7 pt-0 border-t border-white/10 mt-6">
                      <div className="flex items-center justify-between w-full text-xs text-stone-300">
                        <span>IRDAI Regulated Partners</span>
                        <span className="font-mono text-amber-300 font-semibold">
                          10-Minute Digital PDF
                        </span>
                      </div>
                    </CardFooter>
                  </Card>

                  {/* Middle Card: Requirements & Coverage */}
                  <Card className="h-full border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-[#FDFCFB] flex flex-col justify-between">
                    <div>
                      <CardHeader className="p-6 sm:p-7 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#002f89]">
                            Insurance Checklist
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[11px] font-mono border-emerald-300 text-emerald-800 bg-emerald-50"
                          >
                            100% Embassy Approved
                          </Badge>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-serif font-bold text-[#1C1815]">
                          Policy Issuance Requirements
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-600 mt-1">
                          Instant digital issuance with zero physical paperwork
                          or medical test up to 70 years.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 sm:p-7 pt-0 space-y-4 text-xs sm:text-sm">
                        <div className="p-3.5 rounded-lg bg-stone-50 border border-black/[0.04]">
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#002f89]" />
                            <span>Passport Bio-Pages for All Travelers</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Exact names and dates of birth as per passport to
                            ensure cashless hospital admission without claim
                            disputes.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-stone-50 border border-black/[0.04]">
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                            <Plane className="w-4 h-4 text-[#002f89]" />
                            <span>Travel Itinerary &amp; Dates</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Departure and return flight dates. We recommend
                            adding 2 buffer days to your return date for
                            Schengen visa compliance.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-stone-50 border border-black/[0.04]">
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#002f89]" />
                            <span>Nominee Details &amp; Contact</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Nominee name, age, and relationship to primary
                            traveler (spouse, parent, or adult child).
                          </p>
                        </div>
                      </CardContent>
                    </div>
                  </Card>

                  {/* Right Card: 4-Step Process & CTA */}
                  <Card className="h-full border-black/[0.08] shadow-xs hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                    <div>
                      <CardHeader className="p-6 sm:p-7 pb-4">
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#002f89] mb-1 block">
                          Instant Issuance
                        </span>
                        <CardTitle className="text-xl sm:text-2xl font-serif font-bold text-[#1C1815]">
                          4-Step Insurance Issuance
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-stone-600 mt-1">
                          Receive your official policy schedule document on
                          WhatsApp &amp; Email in under 10 minutes.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 sm:p-7 pt-0 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            01
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Select Destination &amp; Duration
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              Choose Schengen, Worldwide (excl. US/Canada), or
                              Worldwide including US/Canada.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            02
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Compare Top Underwriters
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              Review quotes from Tata AIG, Care Health &amp;
                              ICICI Lombard with €30k / $500k cover options.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            03
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              Instant Online Policy Generation
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              Zero medical tests, instant digital verification,
                              and immediate policy number generation.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#002f89]/10 text-[#002f89] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            04
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900">
                              24/7 Global Cashless Claim Concierge
                            </div>
                            <div className="text-xs text-stone-600 mt-0.5">
                              Direct worldwide helpline numbers and WhatsApp
                              emergency assistance while travelling abroad.
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-6 sm:p-7 pt-4 border-t border-black/[0.06] bg-stone-50/60">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleCardEnquiry("Travel Insurance")}
                          className="flex-1 py-3 px-4 rounded-md bg-[#002f89] hover:bg-[#00246b] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <span>Get Insurance Quote</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                          href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20would%20like%20to%20get%20a%20quote%20for%20international%20travel%20insurance."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp Desk</span>
                        </a>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================================
            4. COASTAL PANORAMIC COUNTER STRIP WITH AIRPLANE ANIMATION
            Global Brand Trust Banner rendered for EVERY service directly above Popular & Trending Packages
            ========================================================================= */}
        <section className="relative w-full h-[210px] sm:h-[240px] lg:h-[270px] overflow-hidden flex items-center justify-center">
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
              className="object-cover object-center brightness-[0.88]"
            />
          </div>

          {/* Gentle, subtle dark overlay so the coastal island landscape stays bright and sunny while text pops */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-black/55 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/25 pointer-events-none" />

          {/* Decorative dashed flight curve line overlay with airplane animation (hidden on mobile for clean, uncluttered stats) */}
          <svg
            className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-[5]"
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
              strokeOpacity="0.65"
              className="animate-flight-dash"
            />

            {/* Flying Airplane with trailing banner and spinning front fan */}
            <g>
              <animateMotion dur="16s" repeatCount="indefinite" rotate="auto">
                <mpath href="#flightCurve" />
              </animateMotion>

              {/* Airplane Body & Banner */}
              <image
                href="/services/airplanenewnofan_clean.png"
                x="-118"
                y="-28"
                width="165"
                height="55"
              />

              {/* Spinning Front Fan / Propeller */}
              <g transform="translate(33.8, -3.0) scale(0.50)">
                <ellipse
                  cx="0"
                  cy="0"
                  rx="15"
                  ry="15"
                  fill="url(#propellerBlur)"
                />
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 0 0"
                    to="360 0 0"
                    dur="0.10s"
                    repeatCount="indefinite"
                  />
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

          {/* 4 Stats Grid: Standard section width and padding */}
          <div className="relative z-10 w-full px-6 sm:px-10 lg:px-[105px] grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 lg:gap-14 text-center">
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
        </section>

        {/* 5. POPULAR & TRENDING PACKAGES CAROUSEL */}
        <CarouselCards
          onEnquire={(pkg) => {
            setModalPackage(pkg);
            setModalPrefill({
              serviceId: pkg.serviceId,
              serviceName: pkg.serviceName,
              destination: pkg.destination,
            });
            setModalServiceId(pkg.serviceId);
            setModalOpen(true);
          }}
        />

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
              src="/services/custom-holidays.webp"
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

      {/* Enquiry Modal for Card CTAs */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalPrefill(undefined);
        }}
        defaultPackageId={modalPackage?.id}
        packageTitle={modalPackage?.title}
        defaultServiceId={modalServiceId}
        prefill={modalPrefill}
      />
    </div>
  );
}
