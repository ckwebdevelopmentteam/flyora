"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { PackageSummary } from "@flyora/types";
import { loadPackages } from "../lib/service-catalog";
import { motion, AnimatePresence } from "motion/react";
import { StraightCardsCarousel } from "@/components/ui/straight-cards-carousel";

interface ShowcaseDestination {
  id: string;
  category: "International" | "Domestic";
  location: string;
  title: string;
  description: string;
  src: string;
  duration: string;
  price: string;
  slug: string;
}

interface DestinationsShowcaseProps {
  onOpenEnquiry?: (pkg: PackageSummary) => void;
  className?: string;
}

export function DestinationsShowcase({
  onOpenEnquiry,
  className = "",
}: DestinationsShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<
    "International" | "Domestic"
  >("International");
  const [baseCategory, setBaseCategory] = useState<
    "International" | "Domestic"
  >("International");
  const [incomingCategory, setIncomingCategory] = useState<
    "International" | "Domestic" | null
  >(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loadPackages(
      AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
    )
      .then((items) => {
        if (!controller.signal.aborted) setPackages(items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  // Preload background images so textures are 100% ready in memory
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img1 = new window.Image();
      img1.src = "/home/heifiltower.png";
      const img2 = new window.Image();
      img2.src = "/showcase/domestic-bg.jpg";
    }
  }, []);

  const filteredDestinations = useMemo<ShowcaseDestination[]>(
    () =>
      packages
        .filter(
          (pkg) =>
            pkg.isPublished &&
            pkg.destinationType ===
              (activeCategory === "Domestic" ? "DOMESTIC" : "INTERNATIONAL"),
        )
        .map((pkg) => ({
          id: pkg.id,
          category: activeCategory,
          location: pkg.destination,
          title: pkg.title,
          description:
            pkg.overview || `${pkg.durationDays} days in ${pkg.destination}.`,
          src: pkg.coverImageUrl,
          duration: `${pkg.durationDays}D & ${pkg.durationNights}N`,
          price: new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(pkg.startingPrice),
          slug: pkg.slug,
        })),
    [packages, activeCategory],
  );
  const safeIndex = Math.min(
    activeIndex,
    Math.max(0, filteredDestinations.length - 1),
  );
  const enquire = (id: string) => {
    const pkg = packages.find((p) => p.id === id);
    if (pkg) onOpenEnquiry?.(pkg);
  };

  const handleIndexChange = (index: number) => {
    setActiveIndex(index);
  };

  const handleCategoryChange = (category: "International" | "Domestic") => {
    if (category === activeCategory) return;
    setActiveCategory(category);
    setActiveIndex(0);
    setIncomingCategory(category);
  };

  const current = filteredDestinations[safeIndex];

  const getBgUrl = (cat: "International" | "Domestic") =>
    cat === "International"
      ? "/home/heifiltower.png"
      : "/showcase/domestic-bg.jpg";

  return (
    <section
      id="destination-packages"
      className={`relative w-full overflow-hidden flex flex-col justify-start scroll-mt-24 min-h-[600px] sm:min-h-[680px] lg:min-h-[820px] xl:min-h-[880px] ${className}`}
    >
      {/* Background Images Layer: Base + Smooth Center Expansion with ZERO Blink */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        {/* Permanent Base Layer (Always 100% visible underneath, never blinks) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${getBgUrl(baseCategory)}')` }}
        >
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
        </div>

        {/* Incoming Layer: Expands outward from the center over the base layer */}
        {incomingCategory && (
          <motion.div
            key={incomingCategory}
            initial={{
              clipPath: "inset(50px round 16px)",
              scale: 0.98,
            }}
            animate={{
              clipPath: "inset(0px round 0px)",
              scale: 1,
            }}
            transition={{
              duration: 1.25,
              ease: [0.22, 1, 0.36, 1], // luxurious, smooth slow-motion expansion
            }}
            onAnimationComplete={() => {
              setBaseCategory(incomingCategory);
              setIncomingCategory(null);
            }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${getBgUrl(incomingCategory)}')` }}
          >
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
          </motion.div>
        )}
      </div>

      {/* Main Showcase Content with 105px horizontal padding: ALWAYS on top at z-20 */}
      <div className="relative z-20 w-full px-4 sm:px-10 lg:px-[105px] flex flex-col justify-start py-8 sm:py-12 lg:py-16">
        {/* Centered Section Header: Honeymoon & Romantic Getaways */}
        <div className="w-full flex flex-col items-center text-center mb-6 lg:mb-8">
          <div className="inline-flex items-center px-3.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 mb-3 sm:mb-3.5 shadow-xs">
            <span className="text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-[0.22em] text-white/95">
              EXPLORE OUR DESTINATIONS
            </span>
          </div>
          <h2 className="font-sans font-bold text-2xl sm:text-4xl lg:text-[44px] xl:text-[48px] text-white tracking-tight leading-[1.14] mb-3.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
            Discover your next destination
          </h2>
          <p className="text-xs sm:text-base text-white/85 max-w-2xl font-light leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]">
            International escapes and journeys closer to home, planned around
            you.
          </p>
        </div>

        {/* Top-Right Category Switcher: 4 lines total (each button has 2 vertical lines: border-l & border-r) */}
        <div className="w-full flex justify-end items-center mb-5 lg:mb-4 shrink-0">
          <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base tracking-wide">
            <button
              type="button"
              aria-pressed={activeCategory === "International"}
              onClick={() => handleCategoryChange("International")}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 px-3.5 sm:px-6 py-2 sm:py-2.5 border-l border-r text-xs sm:text-sm md:text-base ${
                activeCategory === "International"
                  ? "bg-white text-black font-semibold shadow-sm border-white"
                  : "border-white/60 hover:border-transparent text-white/90 hover:text-white font-normal bg-black/10"
              }`}
            >
              {activeCategory !== "International" && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                />
              )}
              <span className="relative z-10 tracking-wide">
                International Destination
              </span>
            </button>
            <button
              type="button"
              aria-pressed={activeCategory === "Domestic"}
              onClick={() => handleCategoryChange("Domestic")}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 px-3.5 sm:px-6 py-2 sm:py-2.5 border-l border-r text-xs sm:text-sm md:text-base ${
                activeCategory === "Domestic"
                  ? "bg-white text-black font-semibold shadow-sm border-white"
                  : "border-white/60 hover:border-transparent text-white/90 hover:text-white font-normal bg-black/10"
              }`}
            >
              {activeCategory !== "Domestic" && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                />
              )}
              <span className="relative z-10 tracking-wide">
                Domestic Destination
              </span>
            </button>
          </div>
        </div>

        {/* Main Content Columns */}
        {loading ? (
          <p role="status" className="py-24 text-white">
            Loading destinations…
          </p>
        ) : error ? (
          <div role="alert" className="py-24 text-white">
            We couldn’t load our destinations.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => {
                setError(false);
                setLoading(true);
                setAttempt((n) => n + 1);
              }}
            >
              Try again
            </button>
          </div>
        ) : !current ? (
          <div className="py-24 text-white">
            <h2 className="font-serif text-3xl">
              {activeCategory} destinations
            </h2>
            <p role="status" className="mt-3">
              New {activeCategory.toLowerCase()} trips are coming soon.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16">
            {/* =================================================================
              LEFT COLUMN: Active Destination Details (Smooth Fade & Slide)
              ================================================================= */}
            <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 flex flex-col justify-center text-left">
              <div className="relative min-h-[220px] sm:min-h-[240px] flex flex-col justify-start">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`dest-info-${current.id}`}
                    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
                    transition={{
                      duration: 2.0,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex flex-col"
                  >
                    {/* Category / Location Eyebrow */}
                    <div className="flex items-center gap-2 mb-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                      <span className="text-xs uppercase tracking-[0.2em] font-mono text-white/90">
                        {current.category} Tour
                      </span>
                      <span className="text-white/60">•</span>
                      <span className="text-sm sm:text-base text-white font-medium tracking-wide">
                        {current.location}
                      </span>
                    </div>

                    {/* Main Heading Title */}
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-normal text-white tracking-tight leading-[1.12] mb-4.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                      {current.title}
                    </h2>

                    {/* Description Text */}
                    <p className="text-sm sm:text-base text-white leading-relaxed mb-8 max-w-lg font-light drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                      {current.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Editorial Button with sliding blue background fill hover effect (100% Tailwind) */}
              <div>
                <Link
                  href={`/tours/${current.slug}`}
                  className="group relative overflow-hidden inline-flex items-center px-6 py-2.5 border-l border-r border-white/70 hover:border-transparent text-white font-normal text-sm sm:text-base transition-all duration-300 cursor-pointer bg-black/15 backdrop-blur-[2px] shadow-sm"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                  />
                  <span className="relative z-10 tracking-wide group-hover:tracking-wider transition-all duration-200">
                    Explore the destination
                  </span>
                </Link>
              </div>
            </div>

            {/* =================================================================
              RIGHT COLUMN: StraightCardsCarousel (Smooth 60fps Spring Slide)
              ================================================================= */}
            <div className="w-full lg:flex-1 min-w-0">
              <StraightCardsCarousel
                key={activeCategory}
                items={filteredDestinations}
                activeIndex={safeIndex}
                onIndexChange={handleIndexChange}
                onSelectLead={(item) => enquire(item.id)}
                footerRight={
                  <a
                    href="/tours"
                    className="group relative overflow-hidden inline-flex items-center px-6 py-2.5 border-l border-r border-white/70 hover:border-transparent text-white font-normal text-sm sm:text-base tracking-wide transition-all duration-300 cursor-pointer bg-black/15 backdrop-blur-[2px] select-none whitespace-nowrap shadow-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                    />
                    <span className="relative z-10 tracking-wide group-hover:tracking-wider transition-all duration-200">
                      View all destinations
                    </span>
                  </a>
                }
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
