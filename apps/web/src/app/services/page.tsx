"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { EnquiryModal } from "../../components/EnquiryModal";
import { FloatingWhatsApp } from "../../components/FloatingWhatsApp";
import {
  Star,
  Globe,
  Plane,
  Train,
  Bus,
  Compass,
  Sparkles,
  Calendar,
  Users,
  Send,
  CheckCircle2,
  Play,
  ChevronDown,
  ArrowRight,
  Tag,
  MessageCircle,
  MapPin,
  Check,
} from "lucide-react";

interface ServiceHeroConfig {
  id: string;
  serviceId: string;
  name: string;
  badge: string;
  heroHeadline: string;
  heroSubheadline: string;
  imageSrc: string;
  icon: React.ReactNode;
}

const HERO_SERVICES: ServiceHeroConfig[] = [
  {
    id: "custom-holidays",
    serviceId: "Custom Holidays",
    name: "Custom Holidays",
    badge: "Tailored Luxury",
    heroHeadline: "Bespoke Luxury Holiday Planning",
    heroSubheadline:
      "Private luxury itineraries, 5-star villas, and hand-curated experiences worldwide.",
    imageSrc: "/services/custom-holidays.jpg",
    icon: <Star className="w-4 h-4 text-amber-400" />,
  },
  {
    id: "visa-assistance",
    serviceId: "Visas",
    name: "Visa Assistance",
    badge: "Fast-Track",
    heroHeadline: "Hassle-Free Global Visa Approvals",
    heroSubheadline:
      "Express appointment booking, document audit, and 99.2% approval success for 100+ countries.",
    imageSrc: "/services/visa-assistance.jpg",
    icon: <Globe className="w-4 h-4 text-blue-400" />,
  },
  {
    id: "flight-booking",
    serviceId: "Flights",
    name: "Flight Booking",
    badge: "Best Fares",
    heroHeadline: "Commercial & Business Air Ticketing",
    heroSubheadline:
      "Access unpublished corporate partner fares, flexible routing, and 24/7 flight rebooking.",
    imageSrc: "/services/flight-booking.jpg",
    icon: <Plane className="w-4 h-4 text-sky-400" />,
  },
  {
    id: "train-booking",
    serviceId: "Trains",
    name: "Train Booking",
    badge: "Scenic Rail",
    heroHeadline: "Confirmed Berths & Iconic Rail Journeys",
    heroSubheadline:
      "Express reservations, tatkal priority bookings, and panoramic luxury tourist rail tickets.",
    imageSrc: "/services/train-booking.jpg",
    icon: <Train className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: "bus-booking",
    serviceId: "Buses",
    name: "Bus Booking",
    badge: "Highway Comfort",
    heroHeadline: "Luxury Volvo & Sleeper Coach Travel",
    heroSubheadline:
      "Top-tier AC multi-axle coaches, verified city boarding lounges, and live GPS tracking links.",
    imageSrc: "/services/bus-booking.jpg",
    icon: <Bus className="w-4 h-4 text-orange-400" />,
  },
  {
    id: "umrah-packages",
    serviceId: "Umrah Packages",
    name: "Umrah Packages",
    badge: "Spiritual Journey",
    heroHeadline: "Sacred & Blessed Umrah Pilgrimages",
    heroSubheadline:
      "Hotels steps from the Holy Haram courtyard, Saudi e-visas & private AC vehicle transit.",
    imageSrc: "/services/umrah-packages.jpg",
    icon: <Compass className="w-4 h-4 text-teal-400" />,
  },
  {
    id: "hajj-packages",
    serviceId: "Hajj Packages",
    name: "Hajj Packages",
    badge: "The Holy Pillar",
    heroHeadline: "The Sacred Journey of a Lifetime",
    heroSubheadline:
      "Comprehensive guided pilgrimage with deluxe European air-conditioned Mina camps & guidance.",
    imageSrc: "/services/hajj-packages.jpg",
    icon: <Sparkles className="w-4 h-4 text-amber-300" />,
  },
];

// Promotional Offer Banners matching the reference image row 2
const DISCOUNTS_OFFERS = [
  {
    id: "offer-1",
    tag: "HOLIDAY SAVER",
    discount: "Up to 25% OFF",
    title: "Summer International Holidays",
    description: "Book 45 days in advance & get complimentary 5-star upgrades",
    code: "FLYHOLIDAY25",
    image: "/destinations/maldives.jpg",
    serviceId: "Custom Holidays",
  },
  {
    id: "offer-2",
    tag: "FAMILY VISA BUNDLE",
    discount: "Flat 20% OFF",
    title: "Schengen & Gulf Visa Processing",
    description: "Apply for 3 or more family members with zero processing fee",
    code: "FLYVISA20",
    image: "/services/visa-assistance.jpg",
    serviceId: "Visas",
  },
  {
    id: "offer-3",
    tag: "PILGRIM SPECIAL",
    discount: "Save $250 / Pilgrim",
    title: "Executive Umrah & Hajj Packages",
    description: "Complimentary Haram-facing room upgrade on group bookings",
    code: "PILGRIM250",
    image: "/services/umrah-packages.jpg",
    serviceId: "Umrah Packages",
  },
];

// Top Pickups Gallery matching user reference design
const TOP_PICKUPS = [
  {
    id: "pickup-1",
    title: "VILLA AQUARIUM",
    toursCount: "2 Tours",
    image: "/gallery/villa-aquarium.jpg",
    colSpan: "md:col-span-2",
    serviceId: "Custom Holidays",
  },
  {
    id: "pickup-2",
    title: "LA CABANE",
    toursCount: "1 Tour",
    image: "/gallery/la-cabane.jpg",
    colSpan: "md:col-span-1",
    serviceId: "Custom Holidays",
  },
  {
    id: "pickup-3",
    title: "AZURE",
    toursCount: "3 Tours",
    image: "/gallery/azure.jpg",
    colSpan: "md:col-span-1",
    serviceId: "Custom Holidays",
  },
  {
    id: "pickup-4",
    title: "SERENE",
    toursCount: "1 Tour",
    image: "/gallery/serene.jpg",
    colSpan: "md:col-span-1",
    serviceId: "Custom Holidays",
  },
  {
    id: "pickup-5",
    title: "VERDANT",
    toursCount: "2 Tours",
    image: "/gallery/verdant.jpg",
    colSpan: "md:col-span-1",
    serviceId: "Custom Holidays",
  },
];

const PICKUP_STATS = [
  { value: "12", label: "AMAZING DEALS" },
  { value: "670", label: "SOLD TOURS" },
  { value: "24", label: "NEW TOURS" },
  { value: "980", label: "HAPPY CUSTOMERS" },
];

// Popular Packages Cards matching the reference image grid
const POPULAR_PACKAGES = [
  {
    id: "pkg-1",
    serviceId: "Custom Holidays",
    title: "5D/4N Dubai Family Luxury Escape",
    destination: "Dubai, UAE",
    duration: "5 Days / 4 Nights",
    startingPrice: "$799",
    tag: "Featured",
    image: "/destinations/dubai.jpg",
    features: ["Burj Khalifa VIP", "Desert Safari BBQ", "Private Yacht"],
  },
  {
    id: "pkg-2",
    serviceId: "Custom Holidays",
    title: "4D/3N Maldives Overwater Villa Sanctuary",
    destination: "North Malé Atoll, Maldives",
    duration: "4 Days / 3 Nights",
    startingPrice: "$1,299",
    tag: "Best Seller",
    image: "/destinations/maldives.jpg",
    features: ["Private Plunge Pool", "Seaplane Transfer", "All-Inclusive"],
  },
  {
    id: "pkg-3",
    serviceId: "Custom Holidays",
    title: "6D/5N Bali Ubud Rainforest & Seminyak",
    destination: "Bali, Indonesia",
    duration: "6 Days / 5 Nights",
    startingPrice: "$649",
    tag: "Trending",
    image: "/destinations/bali.jpg",
    features: ["Jungle Swing", "Private Villa Pool", "Sunset Seafood"],
  },
  {
    id: "pkg-4",
    serviceId: "Visas",
    title: "Schengen & UK Fast-Track Tourist Visa",
    destination: "Europe & United Kingdom",
    duration: "Express 7-10 Days",
    startingPrice: "$180",
    tag: "99% Approval",
    image: "/services/visa-assistance.jpg",
    features: ["Document Audit", "Biometric Slot Booking", "Doorstep Pickup"],
  },
  {
    id: "pkg-5",
    serviceId: "Umrah Packages",
    title: "10D/9N Deluxe Makkah & Madinah Umrah",
    destination: "Saudi Arabia",
    duration: "10 Days / 9 Nights",
    startingPrice: "$1,450",
    tag: "Direct Flight",
    image: "/services/umrah-packages.jpg",
    features: ["Clock Tower Hotel", "Private AC Coach", "Ziyarat Guide"],
  },
  {
    id: "pkg-6",
    serviceId: "Trains",
    title: "Swiss Panoramic Glacier Express Tour",
    destination: "Zermatt to St. Moritz, Switzerland",
    duration: "3 Days Scenic Rail",
    startingPrice: "$520",
    tag: "Iconic Rail",
    image: "/services/train-booking.jpg",
    features: ["Panoramic Windows", "3-Course Dining", "Swiss Rail Pass"],
  },
];

const FAQS = [
  {
    question: "How do I submit my enquiry through this page?",
    answer:
      "Select your desired service tab in the top hero, choose your travel date, enter your name and phone number, and click 'Submit Enquiry'. Our travel coordinator receives your message instantly and replies with custom options via WhatsApp and email.",
  },
  {
    question: "Can Flyora handle urgent or emergency visa requests?",
    answer:
      "Yes. Our visa documentation desk operates express appointment channels and emergency filing options for travelers needing urgent approvals for Schengen, Dubai, UK, US, and Southeast Asian countries.",
  },
  {
    question:
      "Do you arrange complex multi-city flights and train connections?",
    answer:
      "Absolutely. We specialize in non-standard itineraries, open-jaw flight tickets, family group seating on high-speed rail, and coordinating airport transfers directly with hotel check-ins.",
  },
  {
    question: "What is included in the Umrah and Hajj packages?",
    answer:
      "Our holy pilgrimage packages provide full-board guidance including Saudi electronic visa issuance, 4-star/5-star accommodation walking distance from the Haram, private AC ground transit, historical Ziyarat tours, and daily spiritual guidance by experienced scholars.",
  },
  {
    question: "Is my payment and booking protected with Flyora?",
    answer:
      "Yes. Flyora is an authorized, licensed travel agency. We issue official airline PNRs, verified hotel confirmation vouchers, and clear transparent invoicing with round-the-clock on-ground emergency support.",
  },
];

export default function ServicesPage() {
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const activeService = HERO_SERVICES[activeServiceIndex];

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
    setSubmitted(false);

    // Keep URL hash in sync with user's selection without causing page jump or reload
    if (typeof window !== "undefined") {
      const targetHash = `#${HERO_SERVICES[idx].id}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, "", targetHash);
      }
    }
  };

  // Inline Hero Enquiry Bar state
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState("2 Adults, 0 Kids");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Enquiry Modal state for card buttons
  const [modalOpen, setModalOpen] = useState(false);
  const [modalServiceId, setModalServiceId] = useState<string | undefined>(
    undefined,
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      // If empty, open modal prefilled
      setModalServiceId(activeService.serviceId);
      setModalOpen(true);
      return;
    }

    setSubmitted(true);
    // WhatsApp direct fallback link for instant admin communication
    const message = encodeURIComponent(
      `Hello Flyora Team,\n\nI want to enquire about *${activeService.name}*.\nName: ${fullName}\nPhone: ${phone}\nDate: ${travelDate || "Flexible"}\nTravelers: ${travelers}`,
    );
    window.open(`https://wa.me/919876543210?text=${message}`, "_blank");
  };

  const handleCardEnquiry = (serviceId?: string) => {
    setModalServiceId(serviceId);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1C1815] selection:bg-[#463D34] selection:text-white">
      {/* 1. Flyora Floating Navbar */}
      <Navbar
        activePath="/services"
        onOpenEnquiry={handleCardEnquiry}
        ctaLabel="Plan My Trip"
      />

      <main>
        {/* 2. FULL-WIDTH HERO SECTION WITH DYNAMIC BACKGROUND & ENQUIRY BAR */}
        <section className="relative w-full min-h-[760px] sm:min-h-[800px] lg:h-[830px] lg:min-h-[830px] flex flex-col justify-between overflow-hidden -mt-20 pt-44 sm:pt-48 lg:pt-52 xl:pt-56 pb-12 sm:pb-16">
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
          <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
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

            {/* Service Selection Tabs (Above the white enquiry box, exactly like reference image) */}
            <div className="mt-8 sm:mt-10">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
                {HERO_SERVICES.map((s, idx) => {
                  const isActive = idx === activeServiceIndex;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectService(idx)}
                      className={`px-3.5 sm:px-4 py-2 rounded-t-xl text-xs sm:text-[13px] font-sans font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? "bg-white text-stone-900 shadow-md font-semibold"
                          : "bg-black/40 hover:bg-black/60 text-white/90 backdrop-blur-sm border-t border-x border-white/10"
                      }`}
                    >
                      <span>{s.icon}</span>
                      <span>{s.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* White Floating Enquiry Box (Embedded in Hero, matching reference image) */}
              <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-black/[0.08] p-4 sm:p-6 transition-all duration-300">
                {submitted ? (
                  <div className="py-6 sm:py-8 text-center space-y-3.5 animate-in fade-in duration-300">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1C1815] tracking-tight">
                      Enquiry Done!
                    </h3>
                    <p className="text-sm sm:text-base font-sans font-medium text-stone-800 max-w-lg mx-auto leading-relaxed">
                      Thank you,{" "}
                      <span className="font-bold text-stone-900">
                        {fullName || "Traveler"}
                      </span>
                      . Our dedicated coordinator for{" "}
                      <strong className="font-bold text-[#463D34]">
                        {activeService.name}
                      </strong>{" "}
                      will contact you via WhatsApp/phone shortly with
                      customized pricing.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-none border border-[#463D34] bg-white text-[#463D34] text-xs sm:text-sm font-sans font-semibold uppercase tracking-wider hover:bg-[#463D34] hover:text-white transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
                      >
                        Submit Another Enquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleHeroSubmit}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end"
                  >
                    {/* Field 1: Service Chosen */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-stone-400" />
                        Selected Service
                      </label>
                      <div className="w-full h-11 px-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-semibold text-stone-800 flex items-center justify-between">
                        <span className="truncate">{activeService.name}</span>
                        <span className="text-[10px] text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded">
                          {activeService.badge}
                        </span>
                      </div>
                    </div>

                    {/* Field 2: Travel Date */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        Expected Date
                      </label>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full h-11 px-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#463D34] focus:bg-white transition"
                      />
                    </div>

                    {/* Field 3: Travelers */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        Guests / Travelers
                      </label>
                      <select
                        value={travelers}
                        onChange={(e) => setTravelers(e.target.value)}
                        className="w-full h-11 px-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#463D34] focus:bg-white transition cursor-pointer"
                      >
                        <option value="1 Adult">Solo Traveler (1 Adult)</option>
                        <option value="2 Adults, 0 Kids">
                          Couple (2 Adults)
                        </option>
                        <option value="Family (2 Adults, 2 Kids)">
                          Family (2 Adults, 2 Kids)
                        </option>
                        <option value="Small Group (3-5 Adults)">
                          Small Group (3-5 Adults)
                        </option>
                        <option value="Large Group (6+ Persons)">
                          Large Group (6+ Persons)
                        </option>
                      </select>
                    </div>

                    {/* Field 4: Full Name & Phone */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-stone-400" />
                        Your Contact
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full h-11 px-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#463D34] focus:bg-white transition"
                        />
                        <input
                          type="tel"
                          placeholder="Phone / WhatsApp"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full h-11 px-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#463D34] focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Field 5: Submit Button */}
                    <div>
                      <button
                        type="submit"
                        className="w-full h-11 rounded-lg bg-[#463D34] hover:bg-[#352E27] active:bg-[#2B2520] text-white text-xs font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-md flex items-center justify-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-300" />
                        <span>Submit Enquiry</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. DISCOUNTS & OFFERS SECTION (Matching Reference Image Row 2) */}
        <section className="py-14 sm:py-20 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1C1815] tracking-tight">
              Exclusive Discounts &amp; Deals
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-2.5 max-w-2xl mx-auto leading-relaxed font-sans">
              Limited-time benefits and promotional upgrades curated for early
              bookers and family travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            {DISCOUNTS_OFFERS.map((offer) => (
              <div
                key={offer.id}
                className="relative rounded-2xl min-h-[320px] sm:min-h-[340px] p-6 sm:p-7 text-white shadow-xl overflow-hidden flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 border border-black/10"
              >
                {/* Background Image */}
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.72]"
                />

                {/* Dark Gradient Overlay for high text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/35 group-hover:via-black/50 transition-colors" />

                {/* Card Border Outline */}
                <div className="absolute inset-0 rounded-2xl border border-white/15 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-[10.5px] font-mono font-bold tracking-widest uppercase text-white shadow-xs">
                      {offer.tag}
                    </span>
                    <span className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-amber-300 drop-shadow-sm">
                      {offer.discount}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold leading-snug drop-shadow-sm">
                    {offer.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 mt-2.5 leading-relaxed drop-shadow-xs">
                    {offer.description}
                  </p>
                </div>

                <div className="relative z-10 pt-5 mt-4 border-t border-white/20 flex items-center justify-between">
                  <div className="text-xs font-mono bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white/90">
                    CODE:{" "}
                    <strong className="text-amber-300 font-bold">
                      {offer.code}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCardEnquiry(offer.serviceId)}
                    className="px-4 py-2 rounded-lg bg-white text-stone-900 text-xs sm:text-sm font-semibold hover:bg-amber-100 transition shadow-md cursor-pointer active:scale-95"
                  >
                    Claim Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. TOP PICKUPS FOR YOU GALLERY & COASTAL STATS STRIP */}
        <section className="relative bg-[#FAF7F2] pt-16 sm:pt-20 pb-0 overflow-hidden border-t border-black/[0.06]">
          {/* Subtle Sailboat Watermark on bottom left matching reference image */}
          <div className="absolute left-6 bottom-56 w-36 h-36 opacity-10 pointer-events-none select-none text-[#463D34]">
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

          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header: Top Pickups For You */}
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-[#1C1815]">
                Top Pickups{" "}
                <span className="text-[#463D34] italic font-serif">
                  For You
                </span>
              </h2>
              <p className="text-sm sm:text-base text-stone-600 mt-2.5 max-w-2xl mx-auto font-sans leading-relaxed">
                Plan your perfect vacation with Flyora. Choose among
                hand-curated, all-inclusive luxury offers!
              </p>
            </div>

            {/* 5-Card Gallery Grid (Row 1: 2 cols + 1 col, Row 2: 1 + 1 + 1) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {TOP_PICKUPS.map((pickup) => (
                <div
                  key={pickup.id}
                  onClick={() => handleCardEnquiry(pickup.serviceId)}
                  className={`relative ${pickup.colSpan} h-[260px] sm:h-[300px] lg:h-[340px] rounded-2xl overflow-hidden group shadow-sm hover:shadow-2xl border border-black/[0.08] hover:border-amber-400/40 transition-all duration-300 cursor-pointer`}
                >
                  {/* Background Image */}
                  <Image
                    src={pickup.image}
                    alt={pickup.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* High contrast gradient at bottom for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors" />

                  {/* Card Content Overlay */}
                  <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end text-white z-10">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-wider text-white drop-shadow-md">
                      {pickup.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-sans text-white/90 drop-shadow-sm group-hover:text-amber-300 transition-colors">
                      <span>{pickup.toursCount}</span>
                      <Play className="w-2.5 h-2.5 fill-current text-amber-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-8 sm:mt-10 mb-12 sm:mb-16 text-center">
              <button
                type="button"
                onClick={() => handleCardEnquiry("Custom Holidays")}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded border border-[#463D34] bg-white text-[#463D34] text-xs sm:text-sm font-sans font-semibold hover:bg-[#463D34] hover:text-white transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
              >
                View All
              </button>
            </div>
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

        {/* 5. POPULAR PACKAGES & SERVICES GRID (Matching Reference Image "Popular Travel Packages") */}
        <section className="py-14 sm:py-20 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1C1815] tracking-tight">
                Popular Services &amp; Packages
              </h2>
            </div>
            <p className="text-sm sm:text-base text-stone-600 max-w-md mt-2 sm:mt-0 font-sans leading-relaxed">
              Select any package below to inspect inclusions or request an
              instant tailored quote.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {POPULAR_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-2xl overflow-hidden bg-white border border-black/[0.07] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with Tag */}
                  <div className="relative h-52 sm:h-56 w-full overflow-hidden">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {pkg.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-200">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{pkg.destination}</span>
                      </div>
                      <p className="text-xs font-mono text-white/80 mt-0.5">
                        {pkg.duration}
                      </p>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 group-hover:text-[#463D34] transition leading-snug">
                      {pkg.title}
                    </h3>

                    {/* Features list */}
                    <div className="mt-3.5 space-y-1.5 pt-3 border-t border-black/[0.05]">
                      {pkg.features.map((feat) => (
                        <div
                          key={feat}
                          className="flex items-center gap-2 text-xs text-stone-600"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-black/[0.05]">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-stone-400 block">
                      Starting From
                    </span>
                    <span className="text-lg font-serif font-black text-stone-900">
                      {pkg.startingPrice}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCardEnquiry(pkg.serviceId)}
                    className="px-4 py-2 rounded-lg bg-[#463D34] hover:bg-[#352E27] active:bg-[#2B2520] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Enquire Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

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

        {/* 7. VERIFIED REVIEWS / TESTIMONIALS (Matching Reference Image "Hear From Travelers") */}
        <section className="py-14 sm:py-20 bg-stone-50 border-b border-black/[0.05]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1C1815] tracking-tight">
                Hear From Our Travelers
              </h2>
              <p className="text-sm sm:text-base text-stone-600 mt-2.5 max-w-2xl mx-auto font-sans leading-relaxed">
                Real stories from travelers who explored the world with Flyora.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  &ldquo;Flyora planned our 10-day honeymoon in Switzerland and
                  Paris. Every panoramic train, private lake transfer, and
                  boutique hotel was flawless. Unmatched attention to
                  detail!&rdquo;
                </p>
                <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-serif font-bold text-stone-900">
                      Rohan &amp; Priya Sen
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Custom Holidays Client
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    Verified Trip
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  &ldquo;I needed emergency Schengen visas for our family of
                  four within 12 days. Flyora expedited our appointments and
                  audited our files. All four visas arrived in 6 days!&rdquo;
                </p>
                <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-serif font-bold text-stone-900">
                      Dr. Tariq Mansoor
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Visa Assistance Client
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    Verified Trip
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  &ldquo;Performing Umrah with my elderly parents was our dream.
                  Flyora arranged a five-star hotel right in the Clock Tower
                  with wheelchair assistance and private AC transport. Blessed
                  journey.&rdquo;
                </p>
                <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-serif font-bold text-stone-900">
                      Fatima &amp; Zayan Khan
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Umrah Pilgrims
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    Verified Trip
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. GENERAL QUESTIONS (FAQ ACCORDION) */}
        <section className="py-14 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1C1815] tracking-tight">
              General Questions
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-2.5 max-w-2xl mx-auto font-sans leading-relaxed">
              Common questions on booking, documentation, and on-trip
              assistance.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-xl border border-black/[0.07] bg-white overflow-hidden shadow-2xs transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-stone-50/60 transition cursor-pointer"
                  >
                    <span className="text-sm font-serif font-semibold text-stone-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-[13px] text-stone-600 leading-relaxed border-t border-black/[0.04] bg-stone-50/30">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
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
        onClose={() => setModalOpen(false)}
        defaultServiceId={modalServiceId}
      />
    </div>
  );
}
