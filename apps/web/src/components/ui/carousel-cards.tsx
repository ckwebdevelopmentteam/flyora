"use client";

import {
  loadPackages,
  loadShowcase,
  resolveService,
} from "../../lib/service-catalog";
import { useServicesCatalog } from "../../lib/use-services-catalog";
import type { PackageSummary, ShowcaseData } from "@flyora/types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useState, useEffect, useCallback } from "react";

export interface PackageCardItem {
  id: string;
  title: string;
  image: string;
  unoptimized?: boolean;
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
  onEnquire?: (id: string) => void;
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
    bgColor: "#232f3e",
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
    bgColor: "#2a394a",
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
    bgColor: "#2e3b48",
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
    bgColor: "#20282e",
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
    bgColor: "#1c2a20",
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
    bgColor: "#22313b",
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
    bgColor: "#1a2c38",
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
    bgColor: "#1d3238",
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

// Helper to convert hex or rgb/rgba to rgba for smooth themed color gradient fade
function toRgba(color: string, alpha: number): string {
  if (!color) return `rgba(24, 29, 36, ${alpha})`;
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
  }
  const cleanHex = color.replace("#", "").trim();
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

// Smart luxury contextual default matching the package destination
function getSmartFallbackBg(item: {
  location?: string;
  title?: string;
}): string {
  const text = `${item.location || ""} ${item.title || ""}`.toLowerCase();
  if (
    /beach|island|ocean|sea|coast|bali|maldives|phuket|goa|water|marine/.test(
      text,
    )
  ) {
    return "#142634"; // Oceanic deep slate
  }
  if (
    /snow|mountain|alps|kashmir|gulmarg|srinagar|ladakh|switzerland|himalaya|manali|hill/.test(
      text,
    )
  ) {
    return "#1d2530"; // Alpine slate blue
  }
  if (/desert|dubai|abu dhabi|safari|egypt|dune|gold/.test(text)) {
    return "#261e19"; // Desert twilight espresso
  }
  if (
    /forest|jungle|rainforest|kaziranga|wildlife|nature|kerala|munnar|wayanad/.test(
      text,
    )
  ) {
    return "#17261d"; // Deep pine emerald
  }
  if (
    /city|singapore|malaysia|kuala lumpur|bangkok|vietnam|tokyo|urban/.test(
      text,
    )
  ) {
    return "#1b222c"; // Modern urban graphite
  }
  return "#181d24"; // Sleek dark charcoal slate
}

// Dynamically extract the dominant boundary color from the bottom of an image
function extractImageBottomColor(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!src || typeof window === "undefined") {
      resolve(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        if (!naturalW || !naturalH) {
          resolve(null);
          return;
        }

        // Sample the bottom 25% where the image seamlessly merges with card background
        const sampleH = Math.max(1, Math.floor(naturalH * 0.25));
        const startY = naturalH - sampleH;

        canvas.width = 16;
        canvas.height = 16;
        ctx.drawImage(img, 0, startY, naturalW, sampleH, 0, 0, 16, 16);

        const imgData = ctx.getImageData(0, 0, 16, 16).data;
        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const a = imgData[i + 3];
          if (a > 128) {
            r += imgData[i];
            g += imgData[i + 1];
            b += imgData[i + 2];
            count++;
          }
        }

        if (count === 0) {
          resolve(null);
          return;
        }

        const avgR = r / count;
        const avgG = g / count;
        const avgB = b / count;

        // Darken tone to guarantee excellent WCAG contrast (> 4.5:1) for white text and chips
        const lum = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
        const factor =
          lum > 0.22 ? Math.min(0.72, 0.2 / Math.max(lum, 0.05)) : 0.88;

        const finalR = Math.max(14, Math.min(220, Math.round(avgR * factor)));
        const finalG = Math.max(14, Math.min(220, Math.round(avgG * factor)));
        const finalB = Math.max(18, Math.min(220, Math.round(avgB * factor)));

        resolve(`rgb(${finalR}, ${finalG}, ${finalB})`);
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = src;
  });
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
  const originalPrice = packageItem.originalPrice ?? packageItem.price;
  const formattedPrice = `₹${packageItem.price.toLocaleString("en-IN")}/-`;
  const formattedOriginalPrice = `₹${originalPrice.toLocaleString("en-IN")}/-`;

  const [extractedBg, setExtractedBg] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    if (packageItem.image) {
      extractImageBottomColor(packageItem.image).then((color) => {
        if (!canceled && color) {
          setExtractedBg(color);
        }
      });
    }
    return () => {
      canceled = true;
    };
  }, [packageItem.image]);

  const cardBg =
    extractedBg ||
    (packageItem.bgColor && packageItem.bgColor !== "#4a4c1f"
      ? packageItem.bgColor
      : getSmartFallbackBg(packageItem));

  return (
    <div
      className="group relative flex h-[350px] sm:h-[395px] w-full flex-col overflow-hidden rounded-[14px] shadow-md transition-all duration-300 hover:shadow-xl transform-gpu hover:-translate-y-1"
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
          unoptimized={packageItem.unoptimized}
        />
        {/* Soft themed color gradient spreading seamlessly upward over the title */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "105px",
            background: `linear-gradient(to top, ${toRgba(cardBg, 1)} 0%, ${toRgba(cardBg, 0.92)} 35%, ${toRgba(cardBg, 0.45)} 70%, transparent 100%)`,
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
            {originalPrice > packageItem.price && (
              <span className="text-white/70 text-[11.5px] sm:text-xs line-through leading-tight">
                {formattedOriginalPrice}
              </span>
            )}
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
  onEnquire,
}: PackageGridSectionProps) => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollContainer.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainer.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, items]);

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
              disabled={!canScrollLeft}
              className={`group relative overflow-hidden w-11 h-10 sm:w-12 sm:h-11 p-0 m-0 border rounded-md grid place-items-center transition-all duration-300 active:scale-95 shadow-2xs ${
                canScrollLeft
                  ? "border-neutral-300/90 hover:border-transparent bg-white text-neutral-500 hover:text-white cursor-pointer"
                  : "border-neutral-200 bg-white/70 text-neutral-300 cursor-not-allowed opacity-40"
              }`}
              onClick={handleScrollLeft}
              aria-label={`Scroll left in ${title}`}
            >
              {canScrollLeft && (
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
              disabled={!canScrollRight}
              className={`group relative overflow-hidden w-11 h-10 sm:w-12 sm:h-11 p-0 m-0 border rounded-md grid place-items-center transition-all duration-300 active:scale-95 shadow-2xs ${
                canScrollRight
                  ? "border-neutral-300/90 hover:border-transparent bg-white text-neutral-500 hover:text-white cursor-pointer"
                  : "border-neutral-200 bg-white/70 text-neutral-300 cursor-not-allowed opacity-40"
              }`}
              onClick={handleScrollRight}
              aria-label={`Scroll right in ${title}`}
            >
              {canScrollRight && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                />
              )}
              <span className="relative z-10 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
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
                className="block rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002f89] focus-visible:ring-offset-2"
                href={item.href || "/tours"}
                aria-label={`View itinerary for ${item.title}`}
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
  onEnquire,
}: {
  className?: string;
  onEnquire?: (pkg: PackageSummary) => void;
}) {
  const {
    services,
    loaded,
    error: servicesError,
    retry: retryServices,
  } = useServicesCatalog();
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [showcase, setShowcase] = useState<ShowcaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(15000);
    const combined = AbortSignal.any([controller.signal, timeoutSignal]);

    Promise.allSettled([loadPackages(combined), loadShowcase(combined)])
      .then(([pkgsResult, showcaseResult]) => {
        if (controller.signal.aborted) return;
        if (pkgsResult.status === "fulfilled") {
          setPackages(pkgsResult.value);
        } else {
          setError(true);
        }
        if (showcaseResult.status === "fulfilled" && showcaseResult.value) {
          setShowcase(showcaseResult.value);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  const holiday = resolveService(services, "holiday-packages");
  const current = packages.filter(
    (pkg) => pkg.isPublished && (!holiday?.id || pkg.serviceId === holiday.id),
  );
  const mapItem = (pkg: PackageSummary): PackageCardItem => ({
    id: pkg.id,
    title: pkg.title,
    image: pkg.coverImageUrl,
    unoptimized: true,
    location: pkg.destination,
    duration: `${pkg.durationDays}D & ${pkg.durationNights}N`,
    price: pkg.startingPrice,
    href: `/tours/${pkg.slug}`,
  });
  const enquire = onEnquire
    ? (id: string) => {
        const pkg =
          showcase?.popular.find((p) => p.id === id) ||
          showcase?.featured.find((p) => p.id === id) ||
          current.find((p) => p.id === id);
        if (pkg) onEnquire(pkg);
      }
    : undefined;

  const popularItems = showcase
    ? showcase.popular.map(mapItem)
    : current.map(mapItem);

  const popularTitle =
    showcase?.config?.popularTitle || holiday?.name || "Holiday packages";
  const popularEyebrow =
    showcase?.config?.popularEyebrow || "PLAN YOUR NEXT TRIP";

  const featuredItems = showcase
    ? showcase.featured.map(mapItem)
    : current.filter((pkg) => pkg.isFeatured).map(mapItem);

  const featuredTitle = showcase?.config?.featuredTitle || "Featured packages";
  const featuredEyebrow =
    showcase?.config?.featuredEyebrow || "FLYORA CURATED JOURNEYS";

  return (
    <section
      id="holiday-packages"
      className={`w-full bg-white text-[#1E1A17] py-12 sm:py-16 lg:py-20 scroll-mt-24 ${className}`}
    >
      {error || servicesError ? (
        <p role="alert" className="px-6">
          Packages could not load.{" "}
          <button
            type="button"
            onClick={() => {
              void retryServices();
              setError(false);
              setLoading(true);
              setAttempt((n) => n + 1);
            }}
            className="underline"
          >
            Try again
          </button>
        </p>
      ) : loading || !loaded ? (
        <p role="status" className="px-6">
          Loading packages…
        </p>
      ) : !popularItems.length && !featuredItems.length ? (
        <p className="px-6">New holiday packages are coming soon.</p>
      ) : (
        <div className="w-full space-y-8">
          {popularItems.length > 0 &&
            showcase?.config?.popularActive !== false && (
              <PackageCarouselSection
                items={popularItems}
                title={popularTitle}
                eyebrow={popularEyebrow}
                viewAllHref="/tours"
                onEnquire={enquire}
              />
            )}
          {featuredItems.length > 0 &&
            showcase?.config?.featuredActive !== false && (
              <PackageCarouselSection
                items={featuredItems}
                title={featuredTitle}
                eyebrow={featuredEyebrow}
                viewAllHref="/tours"
                onEnquire={enquire}
              />
            )}
        </div>
      )}
    </section>
  );
}
export { CarouselCards };
