"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/HeroSection";
import { EnquiryModal } from "../components/EnquiryModal";
import { BecomeAdvisorModal } from "../components/BecomeAdvisorModal";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import CarouselCards from "@/components/ui/carousel-cards";
import { DestinationsShowcase } from "../components/DestinationsShowcase";
import InkOrbitTestimonials, {
  type InkTestimonial,
} from "@/components/ui/ink-orbit-testimonials";
import { JourneyCTA } from "../components/JourneyCTA";

// Verified Traveler Testimonials for InkOrbitTestimonials
const TRAVEL_TESTIMONIALS: InkTestimonial[] = [
  {
    quote:
      "Flyora matched us with Elena for our honeymoon in Amalfi. Not only was our room upgraded to a sea-facing terrace at Belmond, we received a handwritten note and champagne from the GM. Flawless from start to finish.",
    name: "Claire & Jonathan M.",
    role: "Traveled to Italy",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote:
      "I was skeptical that using an advisor wouldn't cost extra, but the price was the same as the hotel website—plus we had free daily breakfast and a $100 resort credit that paid for dinner. I will never book hotels alone again.",
    name: "David S.",
    role: "Traveled to Maui, Hawaii",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote:
      "Kenji planned our 10-day trip across Tokyo, Hakone, and Kyoto. The ryokan he reserved had private open-air hot spring baths and breathtaking kaiseki dinners. An unforgettable family adventure.",
    name: "The Harrison Family",
    role: "Traveled to Japan",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote:
      "Our safari in the Serengeti was seamless. Private game drives, luxury tented camps under open skies, and flawless bush flights. Flyora made our dream bucket-list trip completely effortless.",
    name: "Marcus & Priya T.",
    role: "Traveled to Tanzania",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote:
      "Fast-track visa support and 5-star Swiss chalet bookings. When our flight was delayed, their 24/7 concierge rearranged private transfers before we even landed. Truly exceptional care.",
    name: "Liyana R.",
    role: "Traveled to Switzerland",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote:
      "From overwater villas in Maldives to private catamarans in Greece, Flyora crafts every single detail with immense care. Highly recommended for discerning travelers.",
    name: "Aaron & Chloe K.",
    role: "Traveled to Maldives",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  },
];

// =============================================================================
// HOMEPAGE DATA STRUCTURES
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
    <div className="min-h-screen bg-[#F9F3EC] text-[#1E1B18] font-sans selection:bg-[#002f89] selection:text-white">
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
          Has z-20 and stacks on top of the sticky fixed hero as you scroll.
          The clouds are pulled up over the hero video with negative margin and a transparent
          backdrop so the video shows through, attached directly to the Featured Destinations!
          --------------------------------------------------------------------- */}
      <div className="relative z-20 w-full">
        {/* Floating animated clouds marquee attached to top of Featured Destinations (lowered profile) */}
        <div className="relative -mt-[50px] sm:-mt-[70px] md:-mt-[85px] lg:-mt-[100px] overflow-hidden leading-none text-[0px] pointer-events-none select-none z-20">
          <div className="animate-marquee flex w-max will-change-transform">
            {/* Set 1 */}
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[55px] sm:h-[75px] md:h-[90px] lg:h-[105px] w-auto -mr-[32px] sm:-mr-[42px] md:-mr-[52px] lg:-mr-[58px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-1.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[55px] sm:h-[75px] md:h-[90px] lg:h-[105px] w-auto -mr-[32px] sm:-mr-[42px] md:-mr-[52px] lg:-mr-[58px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-2.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[55px] sm:h-[75px] md:h-[90px] lg:h-[105px] w-auto -mr-[32px] sm:-mr-[42px] md:-mr-[52px] lg:-mr-[58px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-3.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[55px] sm:h-[75px] md:h-[90px] lg:h-[105px] w-auto -mr-[32px] sm:-mr-[42px] md:-mr-[52px] lg:-mr-[58px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-4.png"
            />
            {/* Set 2 (for seamless loop) */}
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[55px] sm:h-[75px] md:h-[90px] lg:h-[105px] w-auto -mr-[32px] sm:-mr-[42px] md:-mr-[52px] lg:-mr-[58px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-1.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[55px] sm:h-[75px] md:h-[90px] lg:h-[105px] w-auto -mr-[32px] sm:-mr-[42px] md:-mr-[52px] lg:-mr-[58px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-2.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[55px] sm:h-[75px] md:h-[90px] lg:h-[105px] w-auto -mr-[32px] sm:-mr-[42px] md:-mr-[52px] lg:-mr-[58px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              src="/cloude-frame/Frame@1.5x-3.png"
            />
            <img
              alt=""
              width={1580}
              height={440}
              className="block shrink-0 h-[55px] sm:h-[75px] md:h-[90px] lg:h-[105px] w-auto -mr-[32px] sm:-mr-[42px] md:-mr-[52px] lg:-mr-[58px] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
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
          <div className="w-full px-6 sm:px-10 lg:px-[105px]">
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

                {/* Navigation arrows matching destination sharp button style */}
                <div className="flex items-center gap-2.5 mt-4 sm:mt-5">
                  <button
                    type="button"
                    onClick={() => handleScroll("left")}
                    disabled={!canScrollLeft}
                    aria-label="Previous destination"
                    className="group relative overflow-hidden w-10 h-10 rounded-[2px] bg-[#FAF7F2] text-[#1E1A17] hover:text-white border border-black/[0.1] hover:border-transparent grid place-items-center transition-all duration-300 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                    />
                    <span className="relative z-10 flex items-center justify-center">
                      <ChevronLeft className="w-4 h-4 stroke-[2.4]" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScroll("right")}
                    disabled={!canScrollRight}
                    aria-label="Next destination"
                    className="group relative overflow-hidden w-10 h-10 rounded-[2px] bg-[#FAF7F2] text-[#1E1A17] hover:text-white border border-black/[0.1] hover:border-transparent grid place-items-center transition-all duration-300 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                    />
                    <span className="relative z-10 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 stroke-[2.4]" />
                    </span>
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
                  className="group relative flex-none w-[72vw] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-12px)] lg:w-[calc(20%-13px)] aspect-[1/2.5] rounded-[8px] overflow-hidden cursor-pointer select-none snap-start shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002f89]"
                >
                  {/* Destination Card Image */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-[8px] transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                  />

                  {/* Soft interactive hover gradient */}
                  <div className="absolute inset-0 rounded-[8px] bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

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
            SECTION 2: CAROUSEL EXPERIENCES
            =================================================================== */}
        <CarouselCards />

        {/* ===================================================================
            SECTION: DESTINATIONS SHOWCASE (International & Domestic Tour Packages)
            =================================================================== */}
        <DestinationsShowcase
          onOpenEnquiry={(destination) => openEnquiry(destination)}
        />

        {/* ===================================================================
            SECTION 7: TRAVELLER TESTIMONIALS (Ink Orbit Testimonials)
            =================================================================== */}
        <section
          id="testimonials"
          className="py-16 sm:py-24 border-t border-black/[0.06] bg-white relative z-10"
        >
          <InkOrbitTestimonials
            theme="light"
            tag="VERIFIED EXPERIENCES"
            title="What *Travelers* Say\nAbout Flyora."
            testimonials={TRAVEL_TESTIMONIALS}
            logos={[]}
          />
        </section>

        {/* ===================================================================
            SECTION 9: FREQUENTLY ASKED QUESTIONS (Interactive Accordion)
            =================================================================== */}
        <section
          id="faqs"
          className="py-16 sm:py-24 border-t border-black/[0.06] bg-white"
        >
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-3">
                EVERYTHING YOU NEED TO KNOW
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1E1A17] tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-6 sm:px-8 py-5 sm:py-5.5 text-left flex items-center justify-between gap-4 cursor-pointer select-none transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-semibold text-[#1E1A17] tracking-tight">
                        {faq.question}
                      </span>
                      <Plus
                        className={`w-5 h-5 text-[#1E1A17] shrink-0 transition-transform duration-300 stroke-[1.8] ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 sm:px-8 pb-6 pt-1 text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Still have a question? Contact Block */}
            <div className="mt-14 sm:mt-18 text-center flex flex-col items-center">
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E1A17] tracking-tight">
                Still have a question?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#7A7167] max-w-md leading-relaxed">
                Can&apos;t find the answer you&apos;re looking for? Reach out to
                our dedicated travel advisory team.
              </p>
              <button
                type="button"
                onClick={() => openEnquiry("General Question / FAQ Support")}
                className="mt-6 inline-flex items-center justify-center px-8 py-2.5 rounded-md border border-[#002f89] bg-[#002f89] hover:bg-[#00246b] text-xs sm:text-sm font-medium text-white transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
              >
                Contact
              </button>
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
