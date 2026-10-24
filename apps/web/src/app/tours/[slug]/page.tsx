"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Plane,
  Building2,
  Car,
  Utensils,
  CheckCircle2,
  XCircle,
  MessageCircle,
  ArrowLeft,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  Calendar,
  Users,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { EnquiryModal } from "../../../components/EnquiryModal";
import { FloatingWhatsApp } from "../../../components/FloatingWhatsApp";
import type { PackageDetails } from "@flyora/types";

// Fallback package database dictionary
const FALLBACK_DETAILS: Record<string, Partial<PackageDetails>> = {
  "5d-4n-dubai-family-luxury": {
    id: "37aba6d8-fee8-464f-8a20-46d2bd16229c",
    title: "5D/4N Dubai Family Luxury",
    slug: "5d-4n-dubai-family-luxury",
    durationDays: 5,
    durationNights: 4,
    destination: "Dubai, United Arab Emirates",
    startingPrice: 64999,
    coverImageUrl: "/destinations/dubai.jpg",
    galleryImageUrls: ["/destinations/dubai.jpg"],
    overview:
      "Experience the ultimate 5-day luxury Dubai vacation with private chauffeur transfers, VIP Burj Khalifa 124th floor access, red dune 4x4 desert safari with five-star Arabian BBQ dinner, and a luxury waterfront hotel stay in Dubai Marina.",
    itinerary: [
      {
        day: 1,
        title: "VIP Airport Meet & Marina Dhow Cruise Dinner",
        description:
          "Private chauffeur pickup from Dubai International Airport (DXB). Check-in to your 5-star marina hotel. In the evening, board a luxury glass-enclosed dhow cruise for an international buffet dinner with live saxophone and illuminated skyline views.",
        stay: "Radisson Blu Waterfront 5*",
        meals: "Dinner",
      },
      {
        day: 2,
        title: "Dubai City Tour & Burj Khalifa At The Top VIP",
        description:
          "Morning guided exploration of historic Al Fahidi Fort, gold souk, and modern landmarks including Dubai Frame. In the late afternoon, enjoy skip-the-line VIP access to the Burj Khalifa 124th and 125th floor observation decks for a breathtaking sunset.",
        stay: "Radisson Blu Waterfront 5*",
        meals: "Breakfast",
      },
      {
        day: 3,
        title: "Red Dune Desert Safari, Sandboarding & BBQ Night",
        description:
          "Afternoon pickup in a private luxury Land Cruiser. Experience thrilling 4x4 dune bashing across Lahbab red dunes, camel riding, sandboarding, and an authentic Bedouin campsite BBQ buffet with belly dancing and Tanoura show.",
        stay: "Radisson Blu Waterfront 5*",
        meals: "Breakfast, Dinner",
      },
      {
        day: 4,
        title: "Aquaventure Waterpark & Dubai Mall Fountain Spectacle",
        description:
          "Full-day thrilling access to Atlantis Aquaventure Waterpark and Lost Chambers Aquarium on Palm Jumeirah. Evening leisure shopping at Dubai Mall with front-row views of the dancing fountain show.",
        stay: "Radisson Blu Waterfront 5*",
        meals: "Breakfast",
      },
      {
        day: 5,
        title: "Souk Madinat Jumeirah & Chauffeur Airport Drop-off",
        description:
          "Enjoy a leisurely breakfast and souvenir shopping at the Venetian-style Souk Madinat Jumeirah. Your private chauffeur transfers you to DXB airport for your return flight.",
        meals: "Breakfast",
      },
    ],
    inclusions: [
      "Return International Flights (Emirates / FlyDubai)",
      "4 Nights in 5-Star Waterfront Hotel",
      "Daily International Buffet Breakfast",
      "Private Airport & Sightseeing Chauffeur Transfers",
      "Burj Khalifa 124th Floor VIP Sunset Tickets",
      "Red Dune 4x4 Desert Safari with Barbecue Dinner",
      "Dubai Marina Luxury Dhow Cruise with Dinner",
      "UAE Tourist Visa Assistance & Insurance",
    ],
    exclusions: [
      "Tourism Dirham Fee (payable at hotel, ~AED 20/night)",
      "Personal Shopping & Expenses",
      "Optional Helicopter Tour",
    ],
  },
  "4d-3n-maldives-overwater-escape": {
    id: "cf21dea8-85c6-4bf2-ba0e-02873140969a",
    title: "4D/3N Maldives Luxury Overwater Villa",
    slug: "4d-3n-maldives-overwater-escape",
    durationDays: 4,
    durationNights: 3,
    destination: "North Male Atoll, Maldives",
    startingPrice: 94999,
    coverImageUrl: "/destinations/maldives.jpg",
    galleryImageUrls: ["/destinations/maldives.jpg"],
    overview:
      "Escape to an iconic private overwater villa suspended over turquoise Maldivian waters. Features private sundeck, glass floor viewing panel, direct lagoon stairs, all-inclusive gourmet dining, and a sunset dolphin cruise.",
    itinerary: [
      {
        day: 1,
        title: "Speedboat Arrival & Overwater Villa Welcome",
        description:
          "Scenic 25-minute luxury speedboat transfer across turquoise atolls to your private island resort. Chilled champagne welcome, villa orientation, and evening cocktail on the wooden boardwalk.",
        stay: "Centara Grand Island Resort 5*",
        meals: "Dinner",
      },
      {
        day: 2,
        title: "House Reef Snorkeling & Marine Safari",
        description:
          "Morning guided snorkeling tour along the house reef to observe sea turtles, rays, and tropical reef fish. Afternoon leisure at the overwater infinity pool with unlimited drinks.",
        stay: "Centara Grand Island Resort 5*",
        meals: "Breakfast, Lunch, Dinner",
      },
      {
        day: 3,
        title: "Sunset Dolphin Safari & Candlelit Beach Barbecue",
        description:
          "Board a traditional wooden Dhoni boat into the open atoll to watch playful spinner dolphins leaping against the setting sun. Later, savor a 4-course seafood dinner served on the beach.",
        stay: "Centara Grand Island Resort 5*",
        meals: "Breakfast, Lunch, Dinner",
      },
      {
        day: 4,
        title: "Glass-Bottom Kayaking & Departure Transfer",
        description:
          "Enjoy a morning paddleboard or glass-bottom kayak session before speedboat transfer back to Velana International Airport in Male.",
        meals: "Breakfast",
      },
    ],
    inclusions: [
      "Return International Flights",
      "3 Nights in Luxury Overwater Pool Villa",
      "All-Inclusive Dining (All Meals, Snacks & Premium Beverages)",
      "Roundtrip Speedboat Airport Transfers",
      "Sunset Wild Dolphin Boat Safari",
      "Complimentary Snorkeling Equipment & Kayaks",
      "Maldives Green Tax & Visa on Arrival Support",
    ],
    exclusions: [
      "Motorized Jet-Ski & Scuba Diving Courses",
      "Spa Treatments & Massages",
    ],
  },
  "6d-5n-bali-ubud-seminyak-bliss": {
    id: "28615277-8bd2-4484-9a90-28eabce5a6ce",
    title: "6D/5N Bali Ubud Rainforest & Seminyak Beach",
    slug: "6d-5n-bali-ubud-seminyak-bliss",
    durationDays: 6,
    durationNights: 5,
    destination: "Bali (Ubud & Seminyak), Indonesia",
    startingPrice: 52999,
    coverImageUrl: "/destinations/bali.jpg",
    galleryImageUrls: ["/destinations/bali.jpg"],
    overview:
      "The quintessential Indonesian escape combining 3 nights in a secluded Ubud private pool villa surrounded by rainforest rice terraces, and 2 nights in high-end Seminyak beachfront luxury.",
    itinerary: [
      {
        day: 1,
        title: "Denpasar Arrival & Private Ubud Villa Check-in",
        description:
          "Welcome to the Island of the Gods. Private chauffeur greets you with frangipani flower garlands and transfers you to your private pool villa nestled in the lush Ubud river valley.",
        stay: "Kamandalu Ubud 5*",
        meals: "Dinner",
      },
      {
        day: 2,
        title: "Tegalalang Rice Terraces, Bali Swing & Monkey Forest",
        description:
          "Walk through UNESCO emerald rice terraces, soar high on the famous jungle swing, and visit the sacred monkeys at Ubud Sanctuary. Afternoon organic tea tasting at a coffee plantation.",
        stay: "Kamandalu Ubud 5*",
        meals: "Breakfast, Lunch",
      },
      {
        day: 3,
        title: "Kintamani Volcano & Tirta Empul Holy Springs",
        description:
          "Panoramic breakfast with unobstructed views of active Mount Batur volcano and crater lake. Visit the holy water temple of Tirta Empul for traditional Balinese blessings.",
        stay: "Kamandalu Ubud 5*",
        meals: "Breakfast",
      },
      {
        day: 4,
        title: "Transfer to Seminyak & Sunset Kecak Fire Dance at Uluwatu",
        description:
          "Check in to your beachfront Seminyak resort. Later, drive to Uluwatu clifftop temple to witness the dramatic Kecak fire dance against a fiery Indian Ocean sunset.",
        stay: "The Seminyak Beach Resort 5*",
        meals: "Breakfast, Dinner",
      },
      {
        day: 5,
        title: "Nusa Penida Island Fast-Boat Day Trip",
        description:
          "Speedboat cruise to Nusa Penida island. Visit the famous T-Rex shaped Kelingking Beach, Broken Beach, and natural infinity pool at Angel Billabong.",
        stay: "The Seminyak Beach Resort 5*",
        meals: "Breakfast, Lunch",
      },
      {
        day: 6,
        title: "Seminyak Beach Club & Airport Transfer",
        description:
          "Relax at Potato Head Beach Club or shop boutique handicrafts along Seminyak strip before private transfer to Denpasar Airport.",
        meals: "Breakfast",
      },
    ],
    inclusions: [
      "Return Flights (Singapore Airlines / Malaysia Airlines)",
      "3 Nights in Ubud Private Pool Villa 5*",
      "2 Nights in Seminyak 5-Star Beach Resort",
      "Daily Gourmet Breakfast & Select Lunch/Dinners",
      "Private Chauffeur & English Speaking Guide throughout",
      "Nusa Penida Fast Boat Island Tickets",
      "All Sightseeing Entrance Tickets & Bali Swing",
    ],
    exclusions: [
      "Indonesia Visa on Arrival ($35 USD)",
      "Personal Expenses & Souvenirs",
    ],
  },
  "7d-6n-swiss-alps-panoramic-dream": {
    id: "fe9cebd1-8d8b-44f2-a731-639bd5ba6019",
    title: "7D/6N Scenic Switzerland & Alpine Express",
    slug: "7d-6n-swiss-alps-panoramic-dream",
    durationDays: 7,
    durationNights: 6,
    destination: "Zurich, Lucerne, Interlaken & Zermatt",
    startingPrice: 148999,
    coverImageUrl: "/destinations/switzerland.jpg",
    galleryImageUrls: ["/destinations/switzerland.jpg"],
    overview:
      "A once-in-a-lifetime Swiss rail adventure featuring 1st Class Swiss Travel Pass, Mount Titlis revolving cable car, Jungfraujoch Top of Europe, and the iconic Matterhorn in Zermatt.",
    itinerary: [
      {
        day: 1,
        title: "Zurich Airport Arrival & First-Class Train to Lucerne",
        description:
          "Arrive in Zurich. Board the scenic Swiss Federal Railway to Lucerne with your 1st Class Swiss Pass. Evening cruise on Lake Lucerne with views of Mount Pilatus.",
        stay: "Hotel Schweizerhof Lucerne 5*",
        meals: "Dinner",
      },
      {
        day: 2,
        title: "Mount Titlis Rotair Cable Car & Ice Glacier Cave",
        description:
          "Ascend to 3,020 meters via the Rotair rotating cable car. Walk across Europe highest suspension cliff bridge and explore prehistoric glacier ice caves.",
        stay: "Hotel Schweizerhof Lucerne 5*",
        meals: "Breakfast",
      },
      {
        day: 3,
        title: "GoldenPass Panoramic Train to Interlaken",
        description:
          "Scenic rail journey along sparkling alpine lakes and waterfalls to Interlaken, nestled between Lake Thun and Lake Brienz.",
        stay: "Victoria-Jungfrau Grand Hotel 5*",
        meals: "Breakfast",
      },
      {
        day: 4,
        title: "Jungfraujoch - Top of Europe at 3,454m",
        description:
          "Historic cogwheel train journey through the Eiger mountain to the highest railway station in Europe. Experience the Sphinx Observatory and Ice Palace.",
        stay: "Victoria-Jungfrau Grand Hotel 5*",
        meals: "Breakfast",
      },
      {
        day: 5,
        title: "Scenic Rail to Zermatt & The Iconic Matterhorn",
        description:
          "Travel to the world-famous car-free village of Zermatt. Enjoy pristine mountain air and direct views of the majestic Matterhorn peak from your private balcony.",
        stay: "Mont Cervin Palace Zermatt 5*",
        meals: "Breakfast, Dinner",
      },
      {
        day: 6,
        title: "Gornergrat Cogwheel Mountain Railway",
        description:
          "Ascend to 3,089m on the Gornergrat open-air railway for 360-degree panoramic views of 29 peaks exceeding 4,000 meters. Afternoon traditional Swiss cheese fondue tasting.",
        stay: "Mont Cervin Palace Zermatt 5*",
        meals: "Breakfast, Dinner",
      },
      {
        day: 7,
        title: "First-Class Rail Transfer to Zurich & Departure",
        description:
          "Relaxed morning breakfast in Zermatt before boarding the scenic express rail connection directly into Zurich Airport for your international return flight.",
        meals: "Breakfast",
      },
    ],
    inclusions: [
      "Return Flights (Swiss International Air Lines / Emirates)",
      "7-Day Swiss Travel Pass (1st Class Unlimited Trains, Boats & Buses)",
      "6 Nights in 5-Star Boutique Swiss Hotels",
      "Daily Swiss Breakfast Buffets & 3 Gourmet Dinners",
      "Mount Titlis Rotair & Suspension Bridge Pass",
      "Jungfraujoch Top of Europe Mountain Rail Ticket",
      "Gornergrat Matterhorn Railway Ticket",
      "Schengen Visa Documentation Concierge Assistance",
    ],
    exclusions: [
      "City Tourist Taxes (CHF 4/day)",
      "Optional Tandem Paragliding in Interlaken",
    ],
  },
};

export default function TourDetailPage() {
  const [slug, setSlug] = useState<string>("");
  const [pkg, setPkg] = useState<Partial<PackageDetails> | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDays, setOpenDays] = useState<Record<number, boolean>>({
    1: true,
  });
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  useEffect(() => {
    // Extract slug from URL pathname
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/");
      const currentSlug = parts[parts.length - 1] || "";
      setSlug(currentSlug);

      // Check fallback or fetch from API
      async function loadDetails() {
        try {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
          const res = await fetch(`${apiUrl}/packages/${currentSlug}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              setPkg(json.data);
              return;
            }
          }
        } catch {
          // Ignore, fallback handles it
        }

        // Use fallback if API is not reached
        const fallback =
          FALLBACK_DETAILS[currentSlug] ||
          FALLBACK_DETAILS["5d-4n-dubai-family-luxury"];
        setPkg(fallback);
        setLoading(false);
      }
      loadDetails();
    }
  }, []);

  const toggleDay = (dayNum: number) => {
    setOpenDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const expandAllDays = () => {
    if (!pkg?.itinerary) return;
    const all: Record<number, boolean> = {};
    pkg.itinerary.forEach((item) => {
      all[item.day] = true;
    });
    setOpenDays(all);
  };

  const collapseAllDays = () => {
    setOpenDays({});
  };

  if (!pkg) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-stone-900">
          Loading Tour Itinerary...
        </h2>
      </div>
    );
  }

  const formattedPrice = Number(pkg.startingPrice || 0).toLocaleString("en-IN");
  const whatsappText = encodeURIComponent(
    `Hi Flyora Travels, I'm reviewing the "${pkg.title}" package on your website. I want to customize this trip and get an official quotation.`,
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-[#4A2E18] selection:text-white">
      {/* Navbar */}
      <Navbar
        activePath="/tours"
        onOpenEnquiry={() => setIsEnquiryOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Back Link & Breadcrumb */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-200/80">
          <Link
            href="/tours"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A2E18] hover:text-[#38200F] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tours</span>
          </Link>

          <span className="text-xs font-mono text-stone-400">
            Package Ref: {pkg.slug}
          </span>
        </div>

        {/* Hero Banner Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Columns: Photos & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Cover Image */}
            <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden bg-stone-100 shadow-md">
              <img
                src={pkg.coverImageUrl || "/destinations/dubai.jpg"}
                alt={pkg.title || "Tour Cover"}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="bg-white/95 backdrop-blur-md text-stone-900 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4A2E18]" />
                  <span>{pkg.destination}</span>
                </span>

                <span className="bg-[#4A2E18] text-white text-xs font-mono font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                  {pkg.durationNights} Nights / {pkg.durationDays} Days
                </span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="bg-emerald-500/90 text-white font-mono text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full">
                  100% Customized Available
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-xs">
                  {pkg.title}
                </h1>
              </div>
            </div>

            {/* Quick Trip Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 border border-stone-200/90 rounded-2xl p-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-[#4A2E18] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-mono uppercase">
                    Duration
                  </p>
                  <p className="text-xs font-bold text-stone-900">
                    {pkg.durationDays} Days / {pkg.durationNights} N
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-[#4A2E18] shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-mono uppercase">
                    Hotel Stay
                  </p>
                  <p className="text-xs font-bold text-stone-900">
                    5-Star Luxury
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-[#4A2E18] shrink-0">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-mono uppercase">
                    Airfare
                  </p>
                  <p className="text-xs font-bold text-stone-900">
                    Return Flights
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-[#4A2E18] shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-mono uppercase">
                    Transfers
                  </p>
                  <p className="text-xs font-bold text-stone-900">
                    Private Chauffeur
                  </p>
                </div>
              </div>
            </div>

            {/* Overview Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                Trip Overview
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                {pkg.overview}
              </p>
            </div>

            {/* Day-by-Day Expandable Itinerary */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                    Day-by-Day Itinerary
                  </h2>
                  <p className="text-xs text-stone-500">
                    Detailed daily plan designed by destination specialists
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#4A2E18]">
                  <button
                    onClick={expandAllDays}
                    className="hover:underline py-1 px-2"
                  >
                    Expand All
                  </button>
                  <span>•</span>
                  <button
                    onClick={collapseAllDays}
                    className="hover:underline py-1 px-2 text-stone-500"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Itinerary Accordion List */}
              <div className="space-y-3">
                {pkg.itinerary?.map((item) => {
                  const isOpen = !!openDays[item.day];
                  return (
                    <div
                      key={item.day}
                      className="border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs transition"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleDay(item.day)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-stone-50/70 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-[#4A2E18] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
                            Day {item.day}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-stone-900">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-500">
                              {item.stay && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-[#4A2E18]" />
                                  <span>{item.stay}</span>
                                </span>
                              )}
                              {item.meals && (
                                <span className="flex items-center gap-1">
                                  <Utensils className="w-3 h-3 text-[#4A2E18]" />
                                  <span>{item.meals}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-1 rounded-full text-stone-400">
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 border-t border-stone-100 bg-stone-50/30 leading-relaxed">
                          {item.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inclusions & Exclusions Grid */}
            <div className="pt-6 border-t border-stone-100 space-y-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                What&apos;s Included &amp; Excluded
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inclusions Card */}
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Inclusions (Confirmed)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-700">
                    {pkg.inclusions?.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclusions Card */}
                <div className="bg-rose-50/30 border border-rose-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider font-mono">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Exclusions</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-600">
                    {pkg.exclusions?.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Column: Sticky Booking Widget (Coffee Brown) */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border-2 border-[#4A2E18]/20 rounded-3xl p-6 shadow-xl space-y-6">
              {/* Pricing Header */}
              <div className="space-y-1 pb-5 border-b border-stone-100">
                <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
                  All-Inclusive Package Price
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-stone-900 tracking-tight">
                    ₹{formattedPrice}
                  </span>
                  <span className="text-xs text-stone-500">/ traveler</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Transparent Price • Zero Booking Fees</span>
                </p>
              </div>

              {/* Action Buttons in Coffee Brown & Emerald */}
              <div className="space-y-3">
                {/* Primary Button in Coffee Brown */}
                <button
                  onClick={() => setIsEnquiryOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#4A2E18] hover:bg-[#38200F] active:scale-98 text-white text-xs sm:text-sm font-semibold text-center shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#E6D5C7]" />
                  <span>Customize &amp; Book Trip</span>
                </button>

                {/* Direct WhatsApp CTA */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl border-2 border-emerald-500 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70 active:scale-98 text-xs sm:text-sm font-semibold text-center transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Direct Travel Coordinator Promise */}
              <div className="pt-4 border-t border-stone-100 space-y-3 text-xs text-stone-600">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#4A2E18] shrink-0" />
                  <span>1-on-1 Assigned Travel Coordinator</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#4A2E18] shrink-0" />
                  <span>Flexible Dates &amp; Instant Fare Locks</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-[#4A2E18] shrink-0" />
                  <span>Official GST Invoices &amp; Offline Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reusable Public Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        defaultPackageId={pkg.id}
        packageTitle={pkg.title}
      />

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp />

      {/* Footer */}
      <Footer />
    </div>
  );
}
