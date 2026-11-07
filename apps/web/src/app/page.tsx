"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/HeroSection";
import { EnquiryModal, type EnquiryPrefill } from "../components/EnquiryModal";
import { BecomeAdvisorModal } from "../components/BecomeAdvisorModal";
import CarouselCards from "@/components/ui/carousel-cards";
import { DestinationsShowcase } from "../components/DestinationsShowcase";
import { CloudMarquee } from "../components/CloudMarquee";
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

// Section 1: Featured Destinations matching reference design (Lisbon, Tulum, Swiss Alps, Dubai, Maldives)
const FEATURED_DESTINATIONS = [
  {
    id: "dest-lisbon",
    name: "Lisbon",
    country: "Portugal",
    image: "/destinations/card-lisbon.jpg",
  },
  {
    id: "dest-tulum",
    name: "Tulum",
    country: "Mexico",
    image: "/destinations/card-tulum.jpg",
  },
  {
    id: "dest-swiss",
    name: "Swiss Alps",
    country: "Switzerland",
    image: "/destinations/card-swiss.jpg",
  },
  {
    id: "dest-dubai",
    name: "Dubai",
    country: "UAE",
    image: "/destinations/card-dubai.jpg",
  },
  {
    id: "dest-maldives",
    name: "Maldives",
    country: "Maldives Islands",
    image: "/destinations/card-maldives.jpg",
  },
  {
    id: "dest-bali",
    name: "Bali",
    country: "Indonesia",
    image: "/destinations/card-bali.jpg",
  },
  {
    id: "dest-rome",
    name: "Rome",
    country: "Italy",
    image: "/destinations/card-rome.jpg",
  },
  {
    id: "dest-kyoto",
    name: "Kyoto",
    country: "Japan",
    image: "/destinations/card-kyoto.jpg",
  },
];

// Section 9: Frequently Asked Questions (5 questions)
const FAQS = [
  {
    question: "What is typically included in a Flyora holiday package?",
    answer:
      "Flyora: Our packages generally cover premium handpicked accommodations, daily breakfast, private or scheduled airport transfers, guided sightseeing, and selected curated activities as specified in your itinerary.",
  },
  {
    question: "Can I customize an itinerary to suit my personal preferences?",
    answer:
      "Flyora: Yes, all Flyora itineraries can be completely tailored. You can adjust durations, select preferred hotel tiers, add private tours, or combine multiple destinations according to your schedule.",
  },
  {
    question: "Are flights and visa assistance included in the package cost?",
    answer:
      "Flyora: International flights and visa assistance can be packaged together or booked separately depending on your preference. All inclusions and exclusions are clearly itemized prior to booking.",
  },
  {
    question: "What is the booking process and payment schedule?",
    answer:
      "Flyora: After reviewing and approving your personalized proposal, a standard deposit confirms your reservation. The remaining balance is completed closer to your departure date via flexible milestones.",
  },
  {
    question: "What kind of support is provided during my journey?",
    answer:
      "Flyora: You receive 24/7 dedicated travel support via phone and WhatsApp throughout your trip, ensuring prompt assistance with itinerary questions, airport coordination, or unexpected needs.",
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
  const [initialTripMode, setInitialTripMode] = useState<
    "domestic" | "international"
  >("domestic");
  const [enquiryPrefill, setEnquiryPrefill] = useState<
    EnquiryPrefill | undefined
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
        ? target.getBoundingClientRect().top + window.scrollY
        : window.innerHeight;
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("mode");
      if (m === "domestic" || m === "international") {
        setInitialTripMode(m);
      }
    }
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (carouselTrackRef.current) {
      const containerWidth = carouselTrackRef.current.clientWidth;
      const scrollAmount =
        direction === "left" ? -(containerWidth * 0.75) : containerWidth * 0.75;
      carouselTrackRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  const openEnquiry = (destination?: string, prefill?: EnquiryPrefill) => {
    setSelectedDestination(destination);
    setEnquiryPrefill(prefill);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleGlobalEnquiry = () => openEnquiry();
    window.addEventListener("flyora:open-enquiry", handleGlobalEnquiry);
    return () =>
      window.removeEventListener("flyora:open-enquiry", handleGlobalEnquiry);
  }, []);

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
        defaultTripMode={initialTripMode}
        primaryCtaLabel="Start Planning"
        onPrimaryCtaClick={() => openEnquiry()}
        onOpenEnquiry={(service, prefill) => openEnquiry(service, prefill)}
        secondaryCtaLabel="See Our Journeys"
        onSecondaryCtaClick={() => {
          if (lenisRef.current) {
            const target = destinationsRef.current;
            const targetY = target
              ? target.getBoundingClientRect().top + window.scrollY
              : window.innerHeight;
            lenisRef.current.scrollTo(targetY, { duration: 1.2 });
          } else if (destinationsRef.current) {
            destinationsRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      {/* ---------------------------------------------------------------------
          STACKING CONTENT SHEET:
          Has z-20 and stacks smoothly on top of the sticky fixed hero as you scroll.
          --------------------------------------------------------------------- */}
      <div className="relative z-20 w-full">
        <CloudMarquee />

        {/* ===================================================================
            SECTION 1: FEATURED DESTINATIONS (Matching Attachment Reference)
            =================================================================== */}
        <section
          id="destinations"
          ref={destinationsRef}
          className="relative z-10 pt-6 sm:pt-8 lg:pt-10 pb-16 sm:pb-20 lg:pb-24 overflow-hidden scroll-mt-0"
        >
          {/* Top gradient matching exact cloud white, transitioning softly into Featured Destinations sky blue */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,#ffffff_0%,#F2F7FC_20%,#F8FBFE_80%,#ffffff_100%)]" />
          <div
            className="absolute bottom-0 inset-x-0 h-36 sm:h-48 lg:h-56 pointer-events-none opacity-100 bg-cover bg-bottom bg-no-repeat"
            style={{
              backgroundImage: `url('/destinations/mountains-bg.svg?v=minimal-travel')`,
            }}
          />

          <div className="relative z-10 w-full px-6 sm:px-10 lg:px-[105px]">
            {/* Header: Left title + Right description & navigation arrows */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-12 mb-8 sm:mb-10 lg:mb-12">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-2.5 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#2C4875]">
                    FEATURED DESTINATIONS
                  </span>
                  <span className="w-10 sm:w-14 h-px bg-[#B0C4DE]" />
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#0A192F] tracking-tight leading-[1.12]">
                  Explore Our <br />
                  Featured Destinations
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 lg:gap-8">
                <div className="hidden lg:block w-px h-12 bg-neutral-300/80 shrink-0" />
                <p className="text-xs sm:text-[13.5px] text-[#4A5568] max-w-[340px] leading-relaxed">
                  Handpicked international destinations, curated for
                  unforgettable journeys and cultural experiences.
                </p>

                {/* Carousel navigation buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleScroll("left")}
                    disabled={!canScrollLeft}
                    aria-label="Previous destination"
                    className={`w-10 h-10 rounded-md border flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      canScrollLeft
                        ? "bg-[#0A2540] text-white border-[#0A2540] hover:bg-[#071C30]"
                        : "bg-white text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScroll("right")}
                    disabled={!canScrollRight}
                    aria-label="Next destination"
                    className={`w-10 h-10 rounded-md border flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      canScrollRight
                        ? "bg-[#0A2540] text-white border-[#0A2540] hover:bg-[#071C30] shadow-sm"
                        : "bg-white text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Destination Cards Track */}
            <div
              ref={carouselTrackRef}
              onScroll={checkScroll}
              className="flex gap-4 sm:gap-4.5 lg:gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-4 pt-1 px-1 -mx-1 snap-x snap-mandatory"
            >
              {FEATURED_DESTINATIONS.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => openEnquiry(`${dest.name}, ${dest.country}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Explore ${dest.name}, ${dest.country}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openEnquiry(`${dest.name}, ${dest.country}`);
                    }
                  }}
                  className="group relative flex-none w-[72vw] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-12px)] lg:w-[calc(20%-16px)] aspect-[3/4.4] rounded-md overflow-hidden cursor-pointer select-none snap-start shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition-all duration-400 transform hover:-translate-y-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2540]"
                >
                  {/* Crisp High-Definition Destination Card Image */}
                  <img
                    src={dest.image}
                    alt={`${dest.name}, ${dest.country}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 pointer-events-none select-none"
                  />

                  {/* Cinematic gradient scrim at bottom for text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                  {/* Soft interactive card border ring */}
                  <div className="absolute inset-0 rounded-md ring-1 ring-black/10 group-hover:ring-white/40 transition-all duration-300 pointer-events-none" />

                  {/* Card Content Footer: Location Info + Real Interactive Action Button */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-2.5 z-10 pointer-events-none">
                    {/* Left: Location Pin + Destination Name + Country */}
                    <div className="flex items-start gap-2 max-w-[calc(100%-44px)]">
                      <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold text-sm sm:text-base lg:text-[17px] leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] truncate">
                          {dest.name}
                        </span>
                        <span className="text-white/85 text-[11px] sm:text-xs font-normal leading-tight mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] truncate">
                          {dest.country}
                        </span>
                      </div>
                    </div>

                    {/* Right: Interactive Action Button with standard rounded-md */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-white/60 bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0 transition-all duration-300 group-hover:bg-white group-hover:text-[#0A2540] group-hover:border-white group-hover:scale-110 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                      <ArrowUpRight className="w-4 h-4 stroke-[2.2] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explore All Destinations Button with standard rounded-md */}
            <div className="flex justify-center items-center mt-10 sm:mt-12">
              <Link
                href="/tours"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-md border border-neutral-300 bg-white/95 backdrop-blur-md text-[#0A2540] hover:text-black hover:bg-white hover:border-neutral-400 font-medium text-xs sm:text-sm tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
              >
                <span>Explore All Destinations</span>
                <ArrowRight className="w-4 h-4 stroke-[2] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
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
            title="What Travelers Say\nAbout Flyora."
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
                      <span className="text-base sm:text-lg font-semibold text-[#1E1A17] tracking-tight">
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
                        <div className="px-6 sm:px-8 pb-6 pt-1 text-sm sm:text-base text-[#5C534A] leading-relaxed">
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
        onClose={() => {
          setIsModalOpen(false);
          setEnquiryPrefill(undefined);
        }}
        packageTitle={selectedDestination}
        prefill={enquiryPrefill}
      />
      <BecomeAdvisorModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
      />
    </div>
  );
}
