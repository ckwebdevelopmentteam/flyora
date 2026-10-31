"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  Image as ImageIcon,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Clock,
  MapPin,
  Compass,
  Heart,
  Users,
  Palmtree,
  Sparkles,
  Mountain,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/HeroSection";
import { EnquiryModal } from "../components/EnquiryModal";
import { BecomeAdvisorModal } from "../components/BecomeAdvisorModal";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import { PopularHolidayPackages } from "../components/PopularHolidayPackages";
import { JourneyCTA } from "../components/JourneyCTA";

// =============================================================================
// PLACEHOLDER DATA STRUCTURES FOR HOMEPAGE SECTIONS
// =============================================================================

// Section 1: Featured Destinations matching reference design
const FEATURED_DESTINATIONS = [
  {
    id: "dest-bali",
    name: "Bali, Indonesia",
    image: "/destinations/bali_hd.jpg",
  },
  {
    id: "dest-rome",
    name: "Rome, Italy",
    image: "/destinations/rome_hd.jpg",
  },
  {
    id: "dest-kyoto",
    name: "Kyoto, Japan",
    image: "/destinations/kyoto_hd.jpg",
  },
  {
    id: "dest-lisbon",
    name: "Lisbon, Portugal",
    image: "/destinations/lisbon_hd.jpg",
  },
  {
    id: "dest-tulum",
    name: "Tulum, Mexico",
    image: "/destinations/tulum_hd.jpg",
  },
  {
    id: "dest-switzerland",
    name: "Switzerland & The Alps",
    image: "/destinations/switzerland_hd.jpg",
  },
  {
    id: "dest-dubai",
    name: "Dubai, UAE",
    image: "/destinations/dubai_hd.jpg",
  },
  {
    id: "dest-maldives",
    name: "Maldives Islands",
    image: "/destinations/maldives_hd.jpg",
  },
];

// Section 2: Popular Holiday Packages (3 items)
const POPULAR_PACKAGES = [
  {
    id: "pkg-swiss-alps",
    name: "Swiss Alpine Wonders",
    destination: "Switzerland",
    duration: "7 Days / 6 Nights",
    pricePlaceholder: "From $1,850 per person",
    overview:
      "Scenic rail passes, private Lucerne cruises, and mountain peak excursions.",
  },
  {
    id: "pkg-bali-island",
    name: "Bali Island Sanctuary",
    destination: "Indonesia",
    duration: "6 Days / 5 Nights",
    pricePlaceholder: "From $1,250 per person",
    overview:
      "Ubud jungle villas, beachfront relaxation, and guided cultural tours.",
  },
  {
    id: "pkg-dubai-emirates",
    name: "Emirates City & Desert Tour",
    destination: "United Arab Emirates",
    duration: "5 Days / 4 Nights",
    pricePlaceholder: "From $1,450 per person",
    overview:
      "Five-star luxury accommodation, private desert safari, and skyline dinners.",
  },
];

// Section 3: Explore by Travel Style (6 categories)
const TRAVEL_STYLES = [
  {
    id: "style-honeymoon",
    title: "Honeymoon Holidays",
    icon: Heart,
    note: "Romantic escapes & private villas",
  },
  {
    id: "style-family",
    title: "Family Holidays",
    icon: Users,
    note: "Tailored for all generations",
  },
  {
    id: "style-adventure",
    title: "Adventure Trips",
    icon: Mountain,
    note: "Trekking, safaris & expeditions",
  },
  {
    id: "style-beach",
    title: "Beach Holidays",
    icon: Palmtree,
    note: "Coastal retreats & island leisure",
  },
  {
    id: "style-group",
    title: "Group Tours",
    icon: Compass,
    note: "Curated itineraries & shared journeys",
  },
  {
    id: "style-luxury",
    title: "Luxury Holidays",
    icon: Sparkles,
    note: "Five-star stays & bespoke VIP perks",
  },
];

// Section 4: Why Choose Flyora (4 blocks)
const WHY_CHOOSE_FLYORA = [
  {
    id: "why-planning",
    title: "Personalised Travel Planning",
    description:
      "Bespoke itineraries built entirely around your preferred pace, schedule, and holiday wishlist.",
    icon: CalendarCheck,
  },
  {
    id: "why-guidance",
    title: "Expert Travel Guidance",
    description:
      "Firsthand destination expertise and curated advice from seasoned travel coordinators.",
    icon: Compass,
  },
  {
    id: "why-transparent",
    title: "Transparent Package Details",
    description:
      "Clear itemized inclusions, upfront costs, and zero hidden charges for worry-free planning.",
    icon: ShieldCheck,
  },
  {
    id: "why-support",
    title: "Dedicated Travel Support",
    description:
      "Round-the-clock coordinator assistance via phone and WhatsApp before, during, and after your trip.",
    icon: Headphones,
  },
];

// Section 5: Signature Experiences (1 large feature + 2 smaller experiences)
const SIGNATURE_FEATURE = {
  title: "Private Helicopter Alpine Tour & Glacier Landing",
  description:
    "Experience panoramic aerial vistas above iconic alpine summits followed by an exclusive private landing and tasting amidst pristine snowfields.",
};

const SIGNATURE_SMALLER = [
  {
    id: "sig-yacht",
    title: "Exclusive Sunset Yacht Charter",
    description:
      "Cruise tranquil coastal waters accompanied by a private chef, bespoke dinner menu, and golden hour views.",
  },
  {
    id: "sig-cultural",
    title: "Private Cultural Heritage Masterclass",
    description:
      "Immerse yourself in authentic traditions with local master artisans, private museum entries, and historian guides.",
  },
];

// Section 6: How It Works (3 numbered steps)
const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Tell Us Your Travel Plans",
    description:
      "Share your destination wishlist, travel dates, companion details, and preferred style with our team.",
  },
  {
    step: "02",
    title: "Explore Your Options",
    description:
      "Review customized itinerary proposals, handpicked accommodation options, and transparent price estimates.",
  },
  {
    step: "03",
    title: "Prepare for Your Journey",
    description:
      "Finalize your booking, receive complete travel dossiers, and travel with dedicated 24/7 coordinator support.",
  },
];

// Section 7: Traveller Testimonials (3 items)
const TESTIMONIALS = [
  {
    id: "test-1",
    quote:
      "Placeholder Review: 'Our family vacation was planned to absolute perfection. Every hotel, driver, and private excursion ran smoothly without any hassle.'",
    customerName: "Placeholder: David & Sarah M.",
    destination: "Switzerland & Italy Tour",
  },
  {
    id: "test-2",
    quote:
      "Placeholder Review: 'The attention to detail and personal hotel upgrades made our honeymoon unforgettable. Exceptional coordinator support from start to finish.'",
    customerName: "Placeholder: Priya & Rohan K.",
    destination: "Bali Luxury Escape",
  },
  {
    id: "test-3",
    quote:
      "Placeholder Review: 'Transparent costs, responsive communication, and wonderful local guides. Flyora made international travel completely stress-free.'",
    customerName: "Placeholder: Alexander T.",
    destination: "Dubai & Abu Dhabi Holiday",
  },
];

// Section 8: Travel Inspiration (3 articles)
const INSPIRATION_ARTICLES = [
  {
    id: "art-1",
    title: "10 Essential Tips for Planning an International Holiday",
    description:
      "From seasonal packing essentials to flight booking timelines, learn how to prepare for effortless international journeys.",
    readTime: "5 min read",
  },
  {
    id: "art-2",
    title: "Discovering Secluded Coastal Havens in 2026",
    description:
      "Step off the beaten path to explore quiet shores, tranquil fishing villages, and charming seaside boutique stays.",
    readTime: "4 min read",
  },
  {
    id: "art-3",
    title: "Curating a Balanced Multi-Generation Family Trip",
    description:
      "How to craft itineraries that satisfy curious children, active parents, and grandparents seeking comfort.",
    readTime: "6 min read",
  },
];

// Section 9: Frequently Asked Questions (5 questions)
const FAQS = [
  {
    question: "What is typically included in a Flyora holiday package?",
    answer:
      "Placeholder: Our packages generally cover premium handpicked accommodations, daily breakfast, private or scheduled airport transfers, guided sightseeing, and selected curated activities as specified in your itinerary.",
  },
  {
    question: "Can I customize an itinerary to suit my personal preferences?",
    answer:
      "Placeholder: Yes, all Flyora itineraries can be completely tailored. You can adjust durations, select preferred hotel tiers, add private tours, or combine multiple destinations according to your schedule.",
  },
  {
    question: "Are flights and visa assistance included in the package cost?",
    answer:
      "Placeholder: International flights and visa assistance can be packaged together or booked separately depending on your preference. All inclusions and exclusions are clearly itemized prior to booking.",
  },
  {
    question: "What is the booking process and payment schedule?",
    answer:
      "Placeholder: After reviewing and approving your personalized proposal, a standard deposit confirms your reservation. The remaining balance is completed closer to your departure date via flexible milestones.",
  },
  {
    question: "What kind of support is provided during my journey?",
    answer:
      "Placeholder: You receive 24/7 dedicated travel support via phone and WhatsApp throughout your trip, ensuring prompt assistance with itinerary questions, airport coordination, or unexpected needs.",
  },
];

// =============================================================================
// REUSABLE MINIMAL IMAGE PLACEHOLDER
// =============================================================================
function ImagePlaceholder({
  label = "Image Placeholder",
  aspect = "aspect-4/3",
  className = "",
}: {
  label?: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full ${aspect} bg-stone-200/90 border border-stone-300/80 rounded-md flex flex-col items-center justify-center text-stone-500 select-none p-4 text-center ${className}`}
      aria-label={label}
    >
      <ImageIcon className="w-6 h-6 text-stone-400 mb-1.5" />
      <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
        {label}
      </span>
    </div>
  );
}

// =============================================================================
// MAIN HOMEPAGE COMPONENT
// =============================================================================
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<
    string | undefined
  >(undefined);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const destinationsRef = useRef<HTMLDivElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Initialize Lenis Smooth Scrolling and 1-viewport-height auto-scroll/snap
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    let isSnapping = false;
    let touchStartY = 0;

    const snapToDestinations = () => {
      if (isSnapping) return;
      isSnapping = true;
      const target = destinationsRef.current;
      const targetY = target
        ? target.getBoundingClientRect().top + window.scrollY - 100
        : window.innerHeight * 0.9;
      lenis.scrollTo(targetY, {
        duration: 1.2,
        onComplete: () => {
          setTimeout(() => {
            isSnapping = false;
          }, 150);
        },
      });
    };

    const snapToHero = () => {
      if (isSnapping) return;
      isSnapping = true;
      lenis.scrollTo(0, {
        duration: 1.2,
        onComplete: () => {
          setTimeout(() => {
            isSnapping = false;
          }, 150);
        },
      });
    };

    const handleWheel = (e: WheelEvent) => {
      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;

      // When near top of hero and scrolling down slightly, auto-scroll 1 viewport height
      if (scrollY < vh * 0.45 && e.deltaY > 4) {
        e.preventDefault();
        snapToDestinations();
      }
      // When at or near top of destinations section and scrolling up, auto-scroll back to hero
      else if (scrollY >= vh * 0.55 && scrollY <= vh * 1.15 && e.deltaY < -4) {
        e.preventDefault();
        snapToHero();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY; // positive = swipe up = scroll down

      if (scrollY < vh * 0.45 && deltaY > 12) {
        if (e.cancelable) e.preventDefault();
        snapToDestinations();
      } else if (scrollY >= vh * 0.55 && scrollY <= vh * 1.15 && deltaY < -12) {
        if (e.cancelable) e.preventDefault();
        snapToHero();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;

      if (
        scrollY < vh * 0.45 &&
        (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ")
      ) {
        e.preventDefault();
        snapToDestinations();
      } else if (
        scrollY >= vh * 0.55 &&
        scrollY <= vh * 1.15 &&
        (e.key === "ArrowUp" || e.key === "PageUp")
      ) {
        e.preventDefault();
        snapToHero();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const checkScroll = () => {
    if (carouselTrackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselTrackRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (carouselTrackRef.current) {
      const containerWidth = carouselTrackRef.current.clientWidth;
      const scrollAmount =
        containerWidth < 640 ? containerWidth * 0.8 : containerWidth * 0.5;
      carouselTrackRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const openEnquiry = (destination?: string) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F9F3EC] text-[#1E1B18] font-sans selection:bg-[#463D34] selection:text-white">
      {/* ---------------------------------------------------------------------
          NAVBAR: Preserved exactly as existing
          --------------------------------------------------------------------- */}
      <Navbar
        isFixed={true}
        onOpenEnquiry={(service) => openEnquiry(service)}
        onFindAdvisor={() => openEnquiry()}
        onBecomeAdvisor={() => setIsAdvisorModalOpen(true)}
      />

      {/* ---------------------------------------------------------------------
          HERO SECTION: Preserved exactly as existing
          --------------------------------------------------------------------- */}
      <HeroSection
        videoSrc="/hero/hero-one.mp4?v=new"
        eyebrow="Flyora Tours & Travels, Est. 2006"
        title={"It’s not where you go,\nbut how you feel."}
        description="Custom journeys across India and the world, built around you since 2006."
        primaryCtaLabel="Start Planning"
        onPrimaryCtaClick={() => openEnquiry()}
        onOpenEnquiry={(service) => openEnquiry(service)}
        secondaryCtaLabel="See Our Journeys"
        onSecondaryCtaClick={() => {
          if (lenisRef.current) {
            const target = destinationsRef.current;
            const targetY = target
              ? target.getBoundingClientRect().top + window.scrollY - 100
              : window.innerHeight * 0.9;
            lenisRef.current.scrollTo(targetY, { duration: 1.2 });
          } else if (destinationsRef.current) {
            destinationsRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      {/* ---------------------------------------------------------------------
          STACKING CONTENT SHEET:
          Has z-10 and stacks on top of the sticky fixed hero as you scroll.
          The clouds are pulled up over the hero video with negative margin and a transparent
          backdrop so the video shows through, attached directly to the Featured Destinations!
          --------------------------------------------------------------------- */}
      <div className="relative z-10 w-full">
        {/* Floating animated clouds marquee attached to top of Featured Destinations */}
        <div className="relative -mt-[80px] sm:-mt-[110px] md:-mt-[135px] lg:-mt-[155px] overflow-hidden leading-none text-[0px] pointer-events-none select-none z-20">
          <div className="animate-marquee flex w-max will-change-transform">
            {/* Set 1 */}
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[90px] sm:h-[120px] md:h-[145px] lg:h-[165px] w-auto -mr-[50px] sm:-mr-[65px] md:-mr-[80px] lg:-mr-[88px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-1.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[90px] sm:h-[120px] md:h-[145px] lg:h-[165px] w-auto -mr-[50px] sm:-mr-[65px] md:-mr-[80px] lg:-mr-[88px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-2.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[90px] sm:h-[120px] md:h-[145px] lg:h-[165px] w-auto -mr-[50px] sm:-mr-[65px] md:-mr-[80px] lg:-mr-[88px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-3.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[90px] sm:h-[120px] md:h-[145px] lg:h-[165px] w-auto -mr-[50px] sm:-mr-[65px] md:-mr-[80px] lg:-mr-[88px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-4.png"
            />
            {/* Set 2 (for seamless loop) */}
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[90px] sm:h-[120px] md:h-[145px] lg:h-[165px] w-auto -mr-[50px] sm:-mr-[65px] md:-mr-[80px] lg:-mr-[88px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-1.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[90px] sm:h-[120px] md:h-[145px] lg:h-[165px] w-auto -mr-[50px] sm:-mr-[65px] md:-mr-[80px] lg:-mr-[88px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-2.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[90px] sm:h-[120px] md:h-[145px] lg:h-[165px] w-auto -mr-[50px] sm:-mr-[65px] md:-mr-[80px] lg:-mr-[88px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-3.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[90px] sm:h-[120px] md:h-[145px] lg:h-[165px] w-auto -mr-[50px] sm:-mr-[65px] md:-mr-[80px] lg:-mr-[88px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-4.png"
            />
          </div>

          {/* Luminous gradient: completely transparent at top so hero video shines through, fading down to pure white */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0.25)_55%,rgba(255,255,255,0.85)_82%,#ffffff_100%)]" />
        </div>

        {/* ===================================================================
            SECTION 1: FEATURED DESTINATIONS (Matching Reference Design)
            =================================================================== */}
        <section
          id="destinations"
          ref={destinationsRef}
          className="relative z-10 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-24 bg-white border-b border-black/[0.06] scroll-mt-20 sm:scroll-mt-24"
        >
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
            {/* Header: Left title + Right description & navigation arrows */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 lg:gap-12 mb-6 sm:mb-10 lg:mb-12">
              <div className="max-w-xl">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2 sm:mb-2.5">
                  FEATURED DESTINATIONS
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#1E1A17] tracking-tight leading-[1.12]">
                  Explore <br className="hidden sm:inline" />
                  Destinations
                </h2>
              </div>

              <div className="max-w-md flex flex-col items-start pt-0.5 sm:pt-1">
                <p className="text-xs sm:text-sm md:text-base text-[#5C534A] leading-relaxed">
                  Discover handpicked international destinations crafted for
                  unforgettable journeys and cultural immersion.
                </p>

                {/* Navigation arrows matching the reference image */}
                <div className="flex items-center gap-2.5 mt-4 sm:mt-5">
                  <button
                    type="button"
                    onClick={() => handleScroll("left")}
                    disabled={!canScrollLeft}
                    aria-label="Previous destination"
                    className="w-10 h-10 rounded-full bg-[#FAF7F2] hover:bg-[#463D34] text-[#1E1A17] hover:text-white border border-black/[0.08] hover:border-[#463D34] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScroll("right")}
                    disabled={!canScrollRight}
                    aria-label="Next destination"
                    className="w-10 h-10 rounded-full bg-[#FAF7F2] hover:bg-[#463D34] text-[#1E1A17] hover:text-white border border-black/[0.08] hover:border-[#463D34] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Destination Cards Track */}
            <div
              ref={carouselTrackRef}
              onScroll={checkScroll}
              className="flex gap-3.5 sm:gap-4 lg:gap-4 xl:gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-3 pt-1 px-1 -mx-1 snap-x snap-mandatory"
            >
              {FEATURED_DESTINATIONS.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => openEnquiry(dest.name)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Explore ${dest.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openEnquiry(dest.name);
                    }
                  }}
                  className="group relative flex-none w-[72vw] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-12px)] lg:w-[calc(20%-13px)] aspect-[1/2.5] rounded-[20px] lg:rounded-[22px] overflow-hidden cursor-pointer select-none snap-start shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#463D34]"
                >
                  {/* Destination Card Image */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-[20px] lg:rounded-[22px] transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                  />

                  {/* Soft interactive hover gradient */}
                  <div className="absolute inset-0 rounded-[20px] lg:rounded-[22px] bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Center frosted glass badge */}
                  <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none">
                    <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg text-white font-medium text-xs sm:text-sm tracking-wide text-center">
                      {dest.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 2: POPULAR HOLIDAY PACKAGES
            =================================================================== */}
        <PopularHolidayPackages
          onOpenEnquiry={(pkgName) => openEnquiry(pkgName)}
        />

        {/* ===================================================================
            SECTION 3: EXPLORE BY TRAVEL STYLE
            =================================================================== */}
        <section
          id="travel-styles"
          className="py-12 sm:py-16 lg:py-24 border-t border-black/[0.06] bg-white scroll-mt-20 sm:scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2">
                CATEGORIES
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#1E1A17] tracking-tight">
                Find Your Kind of Holiday
              </h2>
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-[#5C534A] leading-relaxed">
                Whether seeking romance, family moments, or wild adventures,
                discover journeys tailored around your travel style.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
              {TRAVEL_STYLES.map((style) => {
                const IconComponent = style.icon;
                return (
                  <div
                    key={style.id}
                    onClick={() => openEnquiry(style.title)}
                    className="bg-white rounded-xl border border-stone-200/80 p-5 flex flex-col items-center text-center justify-center hover:border-stone-400 transition cursor-pointer shadow-xs group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center text-[#463D34] mb-3 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#1E1A17] mb-1">
                      {style.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 leading-tight">
                      {style.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 4: WHY CHOOSE FLYORA
            =================================================================== */}
        <section
          id="why-choose"
          className="py-12 sm:py-16 lg:py-24 border-t border-black/[0.06] bg-[#FAF7F2] scroll-mt-20 sm:scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2">
                THE FLYORA DIFFERENCE
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#1E1A17] tracking-tight">
                Why Travel with Flyora?
              </h2>
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-[#5C534A] leading-relaxed">
                Experience personalized care, honest expertise, and seamless
                service from our dedicated travel consultants.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WHY_CHOOSE_FLYORA.map((block) => {
                const IconComponent = block.icon;
                return (
                  <div
                    key={block.id}
                    className="bg-white rounded-xl border border-stone-200/80 p-6 flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-[#463D34] mb-4">
                        <IconComponent className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <h3 className="text-base font-semibold text-[#1E1A17] mb-2">
                        {block.title}
                      </h3>
                      <p className="text-xs text-[#5C534A] leading-relaxed">
                        {block.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 5: SIGNATURE EXPERIENCES
            =================================================================== */}
        <section
          id="experiences"
          className="py-12 sm:py-16 lg:py-24 border-t border-black/[0.06] bg-white scroll-mt-20 sm:scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2">
                CURATED MOMENTS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#1E1A17] tracking-tight">
                Discover Extraordinary Experiences
              </h2>
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-[#5C534A] leading-relaxed">
                Unique moments and curated activities that turn a holiday into a
                lifetime memory.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* One Large Feature Placeholder */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200/80 p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <ImagePlaceholder
                    label="Signature Feature Placeholder (Large)"
                    aspect="aspect-16/9"
                    className="mb-5"
                  />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A7167] block mb-1">
                    FEATURED SIGNATURE EXPERIENCE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#1E1A17] mb-2.5">
                    {SIGNATURE_FEATURE.title}
                  </h3>
                  <p className="text-sm text-[#5C534A] leading-relaxed">
                    {SIGNATURE_FEATURE.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500">
                    Bespoke Itinerary Inclusion
                  </span>
                  <button
                    type="button"
                    onClick={() => openEnquiry(SIGNATURE_FEATURE.title)}
                    className="px-4 py-2 bg-[#463D34] hover:bg-[#38312A] text-white text-xs font-semibold rounded-md transition cursor-pointer"
                  >
                    Enquire Experience
                  </button>
                </div>
              </div>

              {/* Two Smaller Experience Placeholders */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {SIGNATURE_SMALLER.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white rounded-xl border border-stone-200/80 p-5 flex flex-col justify-between flex-1 shadow-xs"
                  >
                    <div>
                      <ImagePlaceholder
                        label={`${exp.title} Placeholder`}
                        aspect="aspect-16/10"
                        className="mb-3.5"
                      />
                      <h3 className="text-base font-semibold text-[#1E1A17] mb-1.5">
                        {exp.title}
                      </h3>
                      <p className="text-xs text-[#5C534A] leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => openEnquiry(exp.title)}
                        className="text-[#463D34] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Learn More</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 6: HOW IT WORKS
            =================================================================== */}
        <section
          id="how-it-works"
          className="py-12 sm:py-16 lg:py-24 border-t border-black/[0.06] bg-[#FAF7F2] scroll-mt-20 sm:scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2">
                TRIP PLANNING PROCESS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#1E1A17] tracking-tight">
                Your Journey Starts Here
              </h2>
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-[#5C534A] leading-relaxed">
                A simple, seamless three-step process from your first travel
                idea to departure day.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {HOW_IT_WORKS_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="bg-white rounded-xl border border-stone-200/80 p-6 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <span className="text-3xl font-serif text-[#463D34] font-normal block mb-4">
                      {step.step}
                    </span>
                    <h3 className="text-lg font-semibold text-[#1E1A17] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-6 border-t border-stone-100 flex items-center gap-2 text-xs font-semibold text-[#463D34]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dedicated Coordinator Assistance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 7: TRAVELLER TESTIMONIALS
            =================================================================== */}
        <section
          id="testimonials"
          className="py-12 sm:py-16 lg:py-24 border-t border-black/[0.06] bg-white scroll-mt-20 sm:scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2">
                CLIENT REVIEWS (PLACEHOLDER)
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#1E1A17] tracking-tight">
                Stories from Our Travellers
              </h2>
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-[#5C534A] leading-relaxed">
                Read experiences and feedback from travellers who explored the
                world with Flyora.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-xl border border-stone-200/80 p-6 flex flex-col justify-between shadow-xs"
                >
                  <p className="text-xs sm:text-sm text-[#5C534A] italic leading-relaxed mb-6">
                    {t.quote}
                  </p>
                  <div className="pt-4 border-t border-stone-100">
                    <span className="text-xs font-semibold text-[#1E1A17] block">
                      {t.customerName}
                    </span>
                    <span className="text-[11px] text-[#7A7167] block mt-0.5">
                      {t.destination}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 8: TRAVEL INSPIRATION
            =================================================================== */}
        <section
          id="inspiration"
          className="py-12 sm:py-16 lg:py-24 border-t border-black/[0.06] bg-[#FAF7F2] scroll-mt-20 sm:scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2">
                ARTICLES &amp; GUIDES
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#1E1A17] tracking-tight">
                Travel Inspiration
              </h2>
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-[#5C534A] leading-relaxed">
                Handy travel guides, destination highlights, and expert advice
                to inspire your next adventure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {INSPIRATION_ARTICLES.map((art) => (
                <div
                  key={art.id}
                  className="bg-white rounded-xl border border-stone-200/80 p-5 flex flex-col justify-between shadow-xs hover:border-stone-400 transition"
                >
                  <div>
                    <ImagePlaceholder
                      label={`${art.title} Placeholder`}
                      aspect="aspect-16/10"
                      className="mb-4"
                    />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A7167] block mb-1">
                      {art.readTime}
                    </span>
                    <h3 className="text-base font-semibold text-[#1E1A17] mb-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#5C534A] leading-relaxed">
                      {art.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() =>
                        openEnquiry("Travel Inspiration: " + art.title)
                      }
                      className="text-xs font-semibold text-[#463D34] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 9: FREQUENTLY ASKED QUESTIONS
            =================================================================== */}
        <section
          id="faqs"
          className="py-12 sm:py-16 lg:py-24 border-t border-black/[0.06] bg-white scroll-mt-20 sm:scroll-mt-24"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 lg:mb-16">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2">
                HAVE QUESTIONS?
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#1E1A17] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-[#5C534A] leading-relaxed">
                Clear answers regarding holiday packages, customization, and
                travel support.
              </p>
            </div>

            <div className="space-y-3.5">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/60 transition"
                    >
                      <span className="text-sm sm:text-base font-semibold text-[#1E1A17]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#7A7167] shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-black" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5C534A] leading-relaxed border-t border-stone-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 10: FINAL BOTTOM CTA BANNER
            =================================================================== */}
        <JourneyCTA onStart={() => openEnquiry()} />

        {/* ---------------------------------------------------------------------
              FOOTER: Preserved editorial footer
              --------------------------------------------------------------------- */}
        <Footer
          onOpenEnquiry={(service) => openEnquiry(service)}
          onBecomeAdvisor={() => setIsAdvisorModalOpen(true)}
        />
      </div>

      {/* ---------------------------------------------------------------------
            MODALS: Preserved from existing layout
            --------------------------------------------------------------------- */}
      <EnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageTitle={selectedDestination}
      />
      <BecomeAdvisorModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
      />
      <FloatingWhatsApp onOpenEnquiry={() => openEnquiry()} />
    </div>
  );
}
