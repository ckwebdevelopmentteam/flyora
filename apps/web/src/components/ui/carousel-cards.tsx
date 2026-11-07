"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";

export interface PackageCardItem {
  id: string;
  title: string;
  image: string;
  location: string;
  duration?: string;
  price: number;
  originalPrice?: number;
  bgColor?: string;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  date?: string;
  href?: string;
}

export interface PackageGridSectionProps {
  title: string;
  eyebrow?: string;
  items: PackageCardItem[];
  viewAllHref?: string;
}

// =============================================================================
// TRENDING PACKAGES DATA (exact reference items with verified high-res images)
// =============================================================================
export const trendingPackages: PackageCardItem[] = [
  {
    id: "trend-darjeeling",
    title: "Simply Darjeeling",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
    location: "Darjeeling (3)",
    duration: "4D & 3N",
    price: 28500,
    originalPrice: 31667,
    bgColor: "#4a4c1f",
    rating: 4.98,
    reviewCount: 142,
    badge: "Trending",
    href: "/tours",
  },
  {
    id: "trend-gangtok",
    title: "Gangtok and Darjeeling Special",
    image:
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=800&auto=format&fit=crop",
    location: "Darjeeling (2) → Gangtok (2)",
    duration: "5D & 4N",
    price: 28414,
    originalPrice: 31571,
    bgColor: "#617fae",
    rating: 4.97,
    reviewCount: 198,
    badge: "Trending",
    href: "/tours",
  },
  {
    id: "trend-himalayan",
    title: "The Himalayan Triangle",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    location: "Darjeeling (2) → Kalimpong (1) → Gangtok (2)",
    duration: "6D & 5N",
    price: 35357,
    originalPrice: 39286,
    bgColor: "#68747f",
    rating: 4.99,
    reviewCount: 165,
    badge: "Hot Pick",
    href: "/tours",
  },
  {
    id: "trend-shillong",
    title: "Simply Shillong Ex-Guwahati",
    image:
      "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=800&auto=format&fit=crop",
    location: "Shillong (2)",
    duration: "3D & 2N",
    price: 12214,
    originalPrice: 13571,
    bgColor: "#36342a",
    rating: 4.93,
    reviewCount: 210,
    badge: "Trending",
    href: "/tours",
  },
  {
    id: "trend-kaziranga",
    title: "Shillong and Kaziranga Special",
    image:
      "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=800&auto=format&fit=crop",
    location: "Shillong (3) → Kaziranga (2)",
    duration: "6D & 5N",
    price: 32143,
    originalPrice: 35714,
    bgColor: "#313719",
    rating: 4.96,
    reviewCount: 174,
    badge: "Wildlife",
    href: "/tours",
  },
  {
    id: "trend-kashmir",
    title: "Dal Lake Houseboats & Mountain Mist",
    image:
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=800&auto=format&fit=crop",
    location: "Srinagar (3) → Gulmarg (2)",
    duration: "6D & 5N",
    price: 26500,
    originalPrice: 30500,
    bgColor: "#3d4b52",
    rating: 4.96,
    reviewCount: 215,
    badge: "Trending",
    href: "/tours",
  },
];

// =============================================================================
// POPULAR PACKAGES DATA (Top International & Domestic Destinations from reference)
// =============================================================================
export const popularPackages: PackageCardItem[] = [
  {
    id: "pop-bali",
    title: "Ultimate Bali Flexi Departure",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop",
    location: "Kuta (4) → Jimbaran (3)",
    duration: "8D & 7N",
    price: 65999,
    originalPrice: 74000,
    bgColor: "#384e27",
    rating: 4.98,
    reviewCount: 184,
    badge: "Popular",
    href: "/tours?destination=Bali",
  },
  {
    id: "pop-vietnam",
    title: "Highlights of Vietnam",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop",
    location: "Hanoi (1) → Halong Bay Cruise (2)",
    duration: "6D & 5N",
    price: 44311,
    originalPrice: 49235,
    bgColor: "#2e4a36",
    rating: 4.97,
    reviewCount: 165,
    badge: "Popular",
    href: "/tours",
  },
  {
    id: "pop-malaysia",
    title: "Magical Malaysia",
    image:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800&auto=format&fit=crop",
    location: "Kuala Lumpur (3) → Genting (2)",
    duration: "5D & 4N",
    price: 26529,
    originalPrice: 29477,
    bgColor: "#4b657e",
    rating: 4.94,
    reviewCount: 142,
    badge: "Popular",
    href: "/tours",
  },
  {
    id: "pop-singapore",
    title: "Fascinating Singapore",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800&auto=format&fit=crop",
    location: "Singapore (4)",
    duration: "5D & 4N",
    price: 46111,
    originalPrice: 51234,
    bgColor: "#34506c",
    rating: 4.96,
    reviewCount: 220,
    badge: "Popular",
    href: "/tours",
  },
  {
    id: "pop-switzerland",
    title: "Glacier Express & Alpine Chalets",
    image: "/destinations/switzerland_hd.jpg",
    location: "Zermatt & Lucerne (6)",
    duration: "7D & 6N",
    price: 125000,
    originalPrice: 142000,
    bgColor: "#506173",
    rating: 4.97,
    reviewCount: 98,
    badge: "Popular",
    href: "/tours?destination=Switzerland",
  },
  {
    id: "pop-maldives",
    title: "Luxury Overwater Villa Retreat",
    image: "/destinations/maldives_hd.jpg",
    location: "North Malé Atoll (4)",
    duration: "5D & 4N",
    price: 64500,
    originalPrice: 72000,
    bgColor: "#2e5875",
    rating: 4.98,
    reviewCount: 184,
    badge: "Popular",
    href: "/tours?destination=Maldives",
  },
];

// Helper to convert hex to rgba for smooth themed color gradient fade
function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

// =============================================================================
// PACKAGE CARD COMPONENT (Dominant image with seamless color gradient)
// =============================================================================
export const PackageCard = ({
  packageItem,
}: {
  packageItem: PackageCardItem;
}) => {
  const durationText = packageItem.duration || packageItem.date || "4D & 3N";
  const locationText = packageItem.location;
  const originalPrice =
    packageItem.originalPrice || Math.round(packageItem.price * 1.15);
  const formattedPrice = `₹${packageItem.price.toLocaleString("en-IN")}/-`;
  const formattedOriginalPrice = `₹${originalPrice.toLocaleString("en-IN")}/-`;
  const cardBg = packageItem.bgColor || "#4a4c1f";

  return (
    <div
      className="group relative flex h-[350px] sm:h-[395px] w-full flex-col overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl transform-gpu hover:-translate-y-1"
      style={{ backgroundColor: cardBg }}
    >
      {/* Top Image Section - Seamless fade into card background without sharp border */}
      <div className="relative h-[235px] sm:h-[275px] w-full overflow-hidden">
        <Image
          alt={packageItem.title}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          fill
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 290px, 320px"
          src={packageItem.image}
        />
        {/* Soft themed color gradient spreading seamlessly upward over the title */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "105px",
            background: `linear-gradient(to top, ${hexToRgba(cardBg, 1)} 0%, ${hexToRgba(cardBg, 0.92)} 35%, ${hexToRgba(cardBg, 0.45)} 70%, transparent 100%)`,
          }}
        />

        {/* Title placed at the bottom-left inside the image over the soft color spread */}
        <div className="absolute bottom-2.5 left-4 right-4 z-10">
          <h3 className="font-bold text-base sm:text-[19px] text-white tracking-tight leading-snug drop-shadow-sm line-clamp-1">
            {packageItem.title}
          </h3>
        </div>
      </div>

      {/* Bottom Section - Compact & neat (~120px) in image-matched tone */}
      <div
        className="flex flex-1 flex-col justify-between px-4 py-3 text-white"
        style={{ backgroundColor: cardBg }}
      >
        {/* Row 1: Duration Chip + Location Text */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-black/45 text-white text-[11px] sm:text-xs font-semibold tracking-wide shrink-0 backdrop-blur-xs">
            {durationText}
          </span>
          <span className="text-white/95 text-xs sm:text-[13px] font-medium truncate">
            {locationText}
          </span>
        </div>

        {/* Row 2: Strikethrough & Final Price (Left) + View Details Button (Right) */}
        <div className="flex items-end justify-between pt-1">
          {/* Prices */}
          <div className="flex flex-col">
            <span className="text-white/70 text-[11.5px] sm:text-xs line-through leading-tight">
              {formattedOriginalPrice}
            </span>
            <span className="text-white font-bold text-lg sm:text-[20px] tracking-tight leading-tight mt-0.5">
              {formattedPrice}
            </span>
          </div>

          {/* View Details Action Button */}
          <span className="inline-flex items-center justify-center px-3 sm:px-3.5 py-1.5 rounded-md bg-white hover:bg-neutral-100 text-[#1C1815] text-[11px] sm:text-[13px] font-semibold shadow-xs transition-colors whitespace-nowrap">
            View Details
          </span>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PACKAGE GRID SECTION COMPONENT
// =============================================================================
export const PackageCarouselSection = ({
  title,
  eyebrow = "FLYORA CURATED JOURNEYS",
  items,
  viewAllHref = "/tours",
}: PackageGridSectionProps) => {
  const scrollContainer = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: -320,
        behavior: "smooth",
      });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full py-3 sm:py-6">
      <div className="w-full px-4 sm:px-10 lg:px-[105px]">
        {/* Section Header */}
        <div className="mb-4 sm:mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-1">
              {eyebrow}
            </span>
            <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-normal text-[#1E1A17] tracking-tight">
              {title}
            </h2>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="group relative overflow-hidden w-9 h-9 sm:w-10 sm:h-10 p-0 m-0 border border-neutral-300/90 hover:border-transparent bg-white text-[#1E1A17] hover:text-white rounded-md grid place-items-center cursor-pointer transition-all duration-300 active:scale-95 shadow-2xs"
              onClick={handleScrollLeft}
              aria-label={`Scroll left in ${title}`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
              />
              <span className="relative z-10 flex items-center justify-center">
                <ChevronLeft className="h-4 w-4 stroke-[2.4]" />
              </span>
            </button>
            <button
              type="button"
              className="group relative overflow-hidden w-9 h-9 sm:w-10 sm:h-10 p-0 m-0 border border-neutral-300/90 hover:border-transparent bg-white text-[#1E1A17] hover:text-white rounded-md grid place-items-center cursor-pointer transition-all duration-300 active:scale-95 shadow-2xs"
              onClick={handleScrollRight}
              aria-label={`Scroll right in ${title}`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
              />
              <span className="relative z-10 flex items-center justify-center">
                <ChevronRight className="h-4 w-4 stroke-[2.4]" />
              </span>
            </button>
            <Link
              className="ml-2 hidden sm:inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-[#002f89] hover:opacity-80 transition"
              href={viewAllHref}
            >
              Show all
            </Link>
          </div>
        </div>

        {/* Cards Carousel Track */}
        <div
          className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-4 sm:gap-5 overflow-x-auto px-1 pb-4 pt-1 no-scrollbar"
          ref={scrollContainer}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {items.map((item) => (
            <div
              className="w-[240px] sm:w-[280px] md:w-[305px] flex-none snap-start"
              key={item.id}
            >
              <Link
                className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002f89] focus-visible:ring-offset-2"
                href={item.href || "/tours"}
              >
                <PackageCard packageItem={item} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN CAROUSEL CARDS WRAPPER
// =============================================================================
export default function CarouselCards({
  className = "",
}: {
  className?: string;
}) {
  return (
    <section
      id="holiday-packages"
      className={`w-full bg-white text-[#1E1A17] py-12 sm:py-16 lg:py-20 border-t border-black/[0.06] scroll-mt-20 sm:scroll-mt-24 ${className}`}
    >
      <div className="w-full space-y-6 sm:space-y-8">
        <PackageCarouselSection
          items={trendingPackages}
          title="Trending Packages"
          eyebrow="TRENDING NOW"
          viewAllHref="/tours"
        />
        <PackageCarouselSection
          items={popularPackages}
          title="Popular Packages"
          eyebrow="MOST BOOKED"
          viewAllHref="/tours"
        />
      </div>
    </section>
  );
}

// Named export compatibility
export { CarouselCards };
