"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Coffee,
  Sparkle,
  CreditCard,
  Clock,
  Gift,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Star,
  MapPin,
  HeartHandshake,
  Compass,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { EnquiryModal } from "../components/EnquiryModal";
import { BecomeAdvisorModal } from "../components/BecomeAdvisorModal";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";

// Luxury carousel destinations matching Fora Travel / user screenshot
const CAROUSEL_DESTINATIONS = [
  {
    id: "rainforest",
    title: "Costa Rica Rainforest",
    category: "Eco-Luxury & Wellness",
    image:
      "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "beach-coast",
    title: "Amalfi Coastline",
    category: "Mediterranean Escape",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "classical-art",
    title: "Rome & Vatican Art",
    category: "Cultural Masterpieces",
    image:
      "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "vineyards",
    title: "Tuscany Hillside Estates",
    category: "Wine & Gastronomy",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "castle",
    title: "Bavarian Fairytale Castles",
    category: "Historic Architecture",
    image:
      "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "resort-pool",
    title: "Maui Palm Beach Resort",
    category: "Island Retreat",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cathedral-dome",
    title: "Vienna Baroque Palaces",
    category: "Grand Heritage",
    image:
      "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "kyoto",
    title: "Kyoto Bamboo Temples",
    category: "Zen Serenity",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "swiss-alps",
    title: "Zermatt Alpine Chalets",
    category: "Mountain Luxury",
    image:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "maldives",
    title: "Maldives Overwater Villas",
    category: "Pure Relaxation",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
  },
];

// Featured advisors matching the curated editorial style
const FEATURED_ADVISORS = [
  {
    name: "Elena Vance",
    location: "Rome & Florence",
    specialties: ["Amalfi Coast", "Tuscan Wine Estates", "Honeymoons"],
    rating: "5.0",
    trips: "140+ Trips Planned",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    quote:
      "I cultivate direct relationships with general managers across Italy so my travelers arrive as cherished guests.",
  },
  {
    name: "Kenji Takahashi",
    location: "Tokyo & Kyoto",
    specialties: ["Japanese Ryokans", "Culinary Experiences", "Art & Design"],
    rating: "5.0",
    trips: "115+ Trips Planned",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    quote:
      "From private tea ceremonies to Michelin counters, I unlock the quiet, authentic soul of Japan.",
  },
  {
    name: "Sophie Laurent",
    location: "Paris & Nice",
    specialties: ["French Riviera", "Alpine Ski Stays", "Boutique Hotels"],
    rating: "4.9",
    trips: "180+ Trips Planned",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    quote:
      "My passion is curating unexpected moments—sun-drenched private catamarans, secret bistro tables, and room upgrades.",
  },
  {
    name: "Marcus Thorne",
    location: "Cape Town & London",
    specialties: [
      "African Safaris",
      "Victoria Falls",
      "Luxury Wildlife Lodges",
    ],
    rating: "5.0",
    trips: "95+ Trips Planned",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    quote:
      "Tracking wildlife under open skies requires meticulous planning. Every camp is handpicked for safety and wonders.",
  },
];

// Frequently Asked Questions
const FAQS = [
  {
    question: "Does it cost extra to book with a Flyora travel advisor?",
    answer:
      "No! In the vast majority of cases, working with a Flyora advisor costs nothing extra. Our partner hotels and luxury brands compensate advisors directly, meaning you pay the standard best available public rate while enjoying complimentary VIP perks like daily breakfast, room upgrades, and resort credits.",
  },
  {
    question: "How does the advisor matching process work?",
    answer:
      "You complete a quick 2-minute questionnaire detailing your destination, dates, travel style, and budget. Our coordinator team then pairs you with a handpicked, certified Flyora advisor who has firsthand destination expertise and personal hotel relationships in your chosen location.",
  },
  {
    question: "What perks do I unlock when booking through an advisor?",
    answer:
      "Through our elite preferred partner affiliations (Four Seasons Preferred Partner, Belmond Bellini Club, Rosewood Elite, Marriott STARS, Aman, Hyatt Privé, etc.), our travelers receive complimentary daily breakfast for two, room upgrades upon arrival (subject to availability), $100+ resort or spa credits, and flexible early check-in/late check-out.",
  },
  {
    question:
      "Can I book with an advisor if I already know where I want to stay?",
    answer:
      "Absolutely! Simply share the property name and your target dates. Your advisor will book your reservation through our VIP partner desks to ensure all complimentary amenities and personalized welcome gifts are attached to your stay.",
  },
  {
    question:
      "Can Flyora advisors assist with flights, tours, and full itineraries?",
    answer:
      "Yes. In addition to hotel bookings, advisors curate complete end-to-end itineraries including private airport transfers, curated day tours, restaurant reservations, and comprehensive travel coordination.",
  },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<
    string | undefined
  >(undefined);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const openEnquiry = (destination?: string) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F9F3EC] text-[#1E1B18] font-sans selection:bg-[#463D34] selection:text-white pt-2 sm:pt-3">
      {/* Top Floating White Navigation Pill (Exact Fora Style) */}
      <Navbar
        alwaysShowSearch={true}
        onFindAdvisor={() => openEnquiry()}
        onBecomeAdvisor={() => setIsAdvisorModalOpen(true)}
      />

      {/* =========================================================================
          HERO SECTION: 100% exact match to user screenshot (media_1792827078067.png)
          "Find the perfect travel advisor for you"
          Warm canvas #F9F3EC, large elegant serif heading, centered GET MATCHED
          ========================================================================= */}
      <section className="pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 text-center max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-[42px] sm:text-6xl md:text-7xl lg:text-[76px] font-normal text-[#1E1A17] tracking-[-0.02em] leading-[1.06] max-w-4xl mx-auto">
          Find the perfect travel
          <br />
          advisor for you
        </h1>

        <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-[17px] text-[#554C43] max-w-xl mx-auto font-normal leading-relaxed">
          Match with a hand-picked travel advisor based on your travel needs and
          preferences.
        </p>

        {/* Centered Espresso GET MATCHED CTA */}
        <div className="mt-7 sm:mt-8 flex justify-center">
          <button
            onClick={() => openEnquiry()}
            className="px-8 sm:px-9 py-3.5 sm:py-4 rounded-sm bg-[#463D34] hover:bg-[#38312A] active:bg-[#2C2621] text-white text-xs sm:text-[12.5px] font-sans font-semibold uppercase tracking-[0.14em] shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            GET MATCHED
          </button>
        </div>
      </section>

      {/* =========================================================================
          DESTINATION PHOTOGRAPHY CAROUSEL STRIP:
          Exact matching visual cards from user screenshot with circular < and >
          ========================================================================= */}
      <section className="relative w-full max-w-[1400px] mx-auto px-2 sm:px-4 pb-16 sm:pb-24">
        {/* Floating Circular Navigation Arrows */}
        <button
          onClick={scrollLeft}
          aria-label="Previous destinations"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs border border-black/5"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <button
          onClick={scrollRight}
          aria-label="Next destinations"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs border border-black/5"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Horizontal Carousel Track */}
        <div
          ref={carouselRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto scroll-smooth py-2 px-4 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {CAROUSEL_DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              onClick={() => openEnquiry(dest.title)}
              className="group relative w-48 sm:w-60 md:w-64 aspect-4/3 sm:aspect-square shrink-0 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <img
                src={dest.image}
                alt={dest.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/80 block mb-0.5">
                  {dest.category}
                </span>
                <p className="text-xs sm:text-sm font-semibold tracking-tight leading-snug line-clamp-1">
                  {dest.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION: HOW IT WORKS (Trip Planning Made Effortless)
          ========================================================================= */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 border-t border-black/[0.06] bg-[#FAF7F2]"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-3">
              EFFORTLESS TRIP PLANNING
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1E1A17] tracking-tight leading-[1.12]">
              Planning your trip should feel as good as the getaway itself
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#5C534A] leading-relaxed">
              From initial daydreaming to your final champagne toast, here is
              how working with a Flyora travel advisor works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-black/[0.06] shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="text-2xl sm:text-3xl font-serif text-[#463D34] block mb-4 font-normal">
                  01
                </span>
                <h3 className="text-lg font-semibold text-[#1E1A17] mb-2 tracking-tight">
                  Tell us your travel vision
                </h3>
                <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                  Fill out our quick 2-minute matching form with your
                  destination, ideal dates, travel companions, and preferred
                  style—whether it’s an intimate anniversary, a family
                  expedition, or a solo sanctuary.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center gap-2 text-xs font-semibold text-[#463D34]">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Takes less than 2 minutes</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-black/[0.06] shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="text-2xl sm:text-3xl font-serif text-[#463D34] block mb-4 font-normal">
                  02
                </span>
                <h3 className="text-lg font-semibold text-[#1E1A17] mb-2 tracking-tight">
                  Get matched with your specialist
                </h3>
                <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                  We hand-pair you with an accredited Flyora advisor whose
                  destination expertise, personal taste, and direct hotel
                  relationships match your exact trip profile.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center gap-2 text-xs font-semibold text-[#463D34]">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>100% human, vetted coordinators</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-black/[0.06] shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="text-2xl sm:text-3xl font-serif text-[#463D34] block mb-4 font-normal">
                  03
                </span>
                <h3 className="text-lg font-semibold text-[#1E1A17] mb-2 tracking-tight">
                  Unlock VIP perks &amp; travel with ease
                </h3>
                <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                  Your advisor books preferred rates, secures complimentary room
                  upgrades, daily breakfast, and resort credits, remaining your
                  dedicated contact before and during travel.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center gap-2 text-xs font-semibold text-[#463D34]">
                <Gift className="w-4 h-4 text-rose-600" />
                <span>VIP amenities at no added cost</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 sm:mt-16">
            <button
              onClick={() => openEnquiry()}
              className="px-8 py-3.5 rounded-sm bg-[#463D34] hover:bg-[#38312A] text-white text-xs font-semibold uppercase tracking-[0.14em] shadow-xs hover:shadow-md transition cursor-pointer"
            >
              START YOUR MATCH
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: THE VIP PERKS YOU UNLOCK (Why Book With Flyora)
          ========================================================================= */}
      <section
        id="perks"
        className="py-16 sm:py-24 border-t border-black/[0.06] bg-[#F9F3EC]"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-3">
              PREFERRED HOTEL PARTNERSHIPS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1E1A17] tracking-tight leading-[1.12]">
              The Perks You Unlock
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#5C534A] leading-relaxed">
              When booking through a Flyora advisor, you receive VIP treatment
              at over 4,500 luxury hotels, resorts, and lodges worldwide.
            </p>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-7 border border-black/[0.06] shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-[#F6F0E7] text-[#463D34] flex items-center justify-center mb-5">
                <Sparkle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1A17] mb-2">
                Room Upgrades Upon Arrival
              </h3>
              <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                Enjoy priority complimentary room or suite upgrades based on
                availability upon check-in.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-7 border border-black/[0.06] shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-[#F6F0E7] text-[#463D34] flex items-center justify-center mb-5">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1A17] mb-2">
                Daily Breakfast For Two
              </h3>
              <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                Complimentary full hot gourmet breakfast every morning of your
                stay in the restaurant or via in-room dining.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-7 border border-black/[0.06] shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-[#F6F0E7] text-[#463D34] flex items-center justify-center mb-5">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1A17] mb-2">
                $100+ Hotel &amp; Resort Credit
              </h3>
              <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                Valuable credits per stay to apply towards signature dining, spa
                rituals, golf, or resort excursions.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-7 border border-black/[0.06] shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-[#F6F0E7] text-[#463D34] flex items-center justify-center mb-5">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1A17] mb-2">
                Early Check-in &amp; Late Check-out
              </h3>
              <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                Maximize every vacation hour with flexible arrival and late
                afternoon departure privileges.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-7 border border-black/[0.06] shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-[#F6F0E7] text-[#463D34] flex items-center justify-center mb-5">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1A17] mb-2">
                Custom Welcome Amenities
              </h3>
              <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                A personal greeting from the general manager, handwritten notes,
                fine wine, or artisanal treats in your room.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-7 border border-black/[0.06] shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-[#F6F0E7] text-[#463D34] flex items-center justify-center mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1A17] mb-2">
                Guaranteed Best Available Rates
              </h3>
              <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                You pay the standard public rate with zero booking markups,
                unlocking hundreds of dollars in added complimentary value.
              </p>
            </div>
          </div>

          {/* Partner Brands Strip */}
          <div className="mt-14 pt-10 border-t border-black/[0.06] text-center">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] mb-6">
              RECOGNIZED PREFERRED PARTNER NETWORK
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-serif tracking-[0.15em] text-[#554C43] uppercase">
              <span className="hover:text-black transition">
                Four Seasons Preferred Partner
              </span>
              <span>•</span>
              <span className="hover:text-black transition">
                Belmond Bellini Club
              </span>
              <span>•</span>
              <span className="hover:text-black transition">
                Rosewood Elite
              </span>
              <span>•</span>
              <span className="hover:text-black transition">
                Ritz-Carlton STARS
              </span>
              <span>•</span>
              <span className="hover:text-black transition">Aman Resorts</span>
              <span>•</span>
              <span className="hover:text-black transition">
                Mandarin Oriental Fan Club
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: FEATURED ADVISORS SPOTLIGHT
          ========================================================================= */}
      <section className="py-16 sm:py-24 border-t border-black/[0.06] bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-3">
                CERTIFIED TRAVEL CURATORS
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1E1A17] tracking-tight">
                Meet a few of our advisors
              </h2>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#463D34] hover:text-black transition"
            >
              <span>Explore All Advisors &amp; Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_ADVISORS.map((adv, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                    <img
                      src={adv.avatar}
                      alt={adv.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-semibold text-zinc-900 flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{adv.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#1E1A17] tracking-tight">
                    {adv.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[#7A7167] mb-3">
                    <MapPin className="w-3 h-3 text-[#463D34]" />
                    <span>{adv.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {adv.specialties.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F6F0E7] text-[#463D34]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-[#5C534A] italic leading-relaxed mb-4">
                    &ldquo;{adv.quote}&rdquo;
                  </p>
                </div>

                <button
                  onClick={() => openEnquiry(`Advisor Match: ${adv.name}`)}
                  className="w-full py-2.5 rounded-md bg-[#463D34] hover:bg-[#38312A] text-white text-[11px] font-semibold uppercase tracking-[0.12em] transition cursor-pointer"
                >
                  Match With {adv.name.split(" ")[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: TRAVELER TESTIMONIALS
          ========================================================================= */}
      <section className="py-16 sm:py-20 border-t border-black/[0.06] bg-[#F9F3EC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-3">
              VERIFIED EXPERIENCES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1E1A17] tracking-tight">
              What travelers say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.06] shadow-xs">
              <div className="flex text-amber-500 mb-3 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#463D34] leading-relaxed mb-6 italic">
                &ldquo;Flyora matched us with Elena for our honeymoon in Amalfi.
                Not only was our room upgraded to a sea-facing terrace at
                Belmond, we received a handwritten note and champagne from the
                GM. Flawless from start to finish.&rdquo;
              </p>
              <div className="border-t border-zinc-100 pt-3">
                <p className="text-xs font-semibold text-[#1E1A17]">
                  Claire &amp; Jonathan M.
                </p>
                <p className="text-[11px] text-[#7A7167]">Traveled to Italy</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.06] shadow-xs">
              <div className="flex text-amber-500 mb-3 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#463D34] leading-relaxed mb-6 italic">
                &ldquo;I was skeptical that using an advisor wouldn&apos;t cost
                extra, but the price was the same as the hotel website—plus we
                had free daily breakfast and a $100 resort credit that paid for
                dinner. I will never book hotels alone again.&rdquo;
              </p>
              <div className="border-t border-zinc-100 pt-3">
                <p className="text-xs font-semibold text-[#1E1A17]">David S.</p>
                <p className="text-[11px] text-[#7A7167]">
                  Traveled to Maui, Hawaii
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-black/[0.06] shadow-xs">
              <div className="flex text-amber-500 mb-3 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#463D34] leading-relaxed mb-6 italic">
                &ldquo;Kenji planned our 10-day trip across Tokyo, Hakone, and
                Kyoto. The ryokan he reserved had private open-air hot spring
                baths and breathtaking kaiseki dinners. An unforgettable family
                adventure.&rdquo;
              </p>
              <div className="border-t border-zinc-100 pt-3">
                <p className="text-xs font-semibold text-[#1E1A17]">
                  The Harrison Family
                </p>
                <p className="text-[11px] text-[#7A7167]">Traveled to Japan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: FREQUENTLY ASKED QUESTIONS (Interactive Accordion)
          ========================================================================= */}
      <section
        id="faqs"
        className="py-16 sm:py-24 border-t border-black/[0.06] bg-[#FAF7F2]"
      >
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-3">
              EVERYTHING YOU NEED TO KNOW
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1E1A17] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-black/[0.06] overflow-hidden transition shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50 transition"
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
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#5C534A] leading-relaxed border-t border-zinc-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: FINAL BOTTOM CTA BANNER
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#463D34] text-white text-center px-5">
        <div className="max-w-3xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/70 block mb-3">
            YOUR NEXT GETAWAY STARTS HERE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal mb-5 tracking-tight leading-[1.08]">
            Find the perfect travel advisor for your next trip
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Connect with a handpicked specialist, unlock complimentary hotel
            perks, and travel with total peace of mind.
          </p>
          <button
            onClick={() => openEnquiry()}
            className="px-9 py-4 rounded-sm bg-white hover:bg-[#FAF7F2] text-[#463D34] text-xs font-semibold uppercase tracking-[0.14em] shadow-lg hover:shadow-xl transition active:scale-[0.98] cursor-pointer"
          >
            GET MATCHED
          </button>
        </div>
      </section>

      {/* =========================================================================
          LUXURY EDITORIAL FOOTER
          ========================================================================= */}
      <footer className="border-t border-black/[0.06] py-12 bg-[#F5EFE8] text-[#5C534A] text-xs">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <span className="font-serif text-2xl font-normal tracking-[0.2em] text-[#1C1815] uppercase block mb-3">
                FLYORA
              </span>
              <p className="text-xs text-[#7A7167] max-w-sm leading-relaxed mb-4">
                Flyora is a modern luxury travel platform matching discerning
                travelers with handpicked travel curators worldwide. Unlock VIP
                upgrades and bespoke experiences.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#7A7167]">
                <Compass className="w-3.5 h-3.5 text-[#463D34]" />
                <span>Preferred Partner at 4,500+ luxury properties</span>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-black font-semibold mb-3">
                DISCOVER
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/explore" className="hover:text-black transition">
                    Explore Destinations
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => openEnquiry()}
                    className="hover:text-black transition cursor-pointer text-left"
                  >
                    Match with an Advisor
                  </button>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-black transition"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#perks" className="hover:text-black transition">
                    VIP Hotel Perks
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-black font-semibold mb-3">
                CAREERS &amp; PARTNERS
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setIsAdvisorModalOpen(true)}
                    className="hover:text-black transition cursor-pointer text-left font-medium text-[#463D34]"
                  >
                    Become a Flyora Advisor ↗
                  </button>
                </li>
                <li>
                  <a
                    href="http://localhost:3001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition"
                  >
                    Staff &amp; Operations Portal
                  </a>
                </li>
                <li>
                  <a href="#faqs" className="hover:text-black transition">
                    Advisor FAQs
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A7167]">
            <p>
              © {new Date().getFullYear()} Flyora Travels Inc. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="hover:text-black cursor-pointer">
                Privacy Policy
              </span>
              <span className="hover:text-black cursor-pointer">
                Terms of Service
              </span>
              <span className="hover:text-black cursor-pointer">
                Cookie Preferences
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Floating WhatsApp */}
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
