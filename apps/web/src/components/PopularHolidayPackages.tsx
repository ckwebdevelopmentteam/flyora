"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin } from "lucide-react";

// =============================================================================
// PACKAGE DATA
// =============================================================================
export interface PackageItem {
  number: string;
  country: string;
  name: string;
  duration: string;
  shortDuration: string;
  description: string;
  price: string;
  photoLabel: string;
  imageSrc?: string;
  tintGradient: string;
  href?: string;
}

export const POPULAR_PACKAGES: PackageItem[] = [
  {
    number: "01",
    country: "Switzerland",
    name: "Swiss Alpine Wonders",
    duration: "7 Days / 6 Nights",
    shortDuration: "7 Days",
    description:
      "Scenic rail passes, private Lucerne cruises, and mountain peak excursions.",
    price: "$1,850",
    photoLabel: "SWISS ALPINE WONDERS PHOTO",
    imageSrc: "/packages/swiss.jpg",
    tintGradient: "linear-gradient(160deg, #E4E8EC 0%, #CDD5DC 100%)",
    href: "/tours?destination=Switzerland",
  },
  {
    number: "02",
    country: "Indonesia",
    name: "Bali Island Sanctuary",
    duration: "6 Days / 5 Nights",
    shortDuration: "6 Days",
    description:
      "Ubud jungle villas, beachfront relaxation, and guided cultural tours.",
    price: "$1,250",
    photoLabel: "BALI ISLAND SANCTUARY PHOTO",
    imageSrc: "/packages/bali.jpg",
    tintGradient: "linear-gradient(160deg, #E3E8DC 0%, #CBD5C1 100%)",
    href: "/tours?destination=Bali",
  },
  {
    number: "03",
    country: "United Arab Emirates",
    name: "Emirates City & Desert Tour",
    duration: "5 Days / 4 Nights",
    shortDuration: "5 Days",
    description:
      "Five-star luxury accommodation, private desert safari, and skyline dinners.",
    price: "$1,450",
    photoLabel: "EMIRATES CITY & DESERT TOUR PHOTO",
    imageSrc: "/packages/uae.jpg",
    tintGradient: "linear-gradient(160deg, #EDE2D0 0%, #DCC8A9 100%)",
    href: "/tours?destination=Dubai",
  },
  {
    number: "04",
    country: "Saudi Arabia",
    name: "Hajj Sacred Pilgrimage",
    duration: "14 Days / 13 Nights",
    shortDuration: "14 Days",
    description:
      "Five-star Makkah & Madinah stays, VIP transfers, and dedicated spiritual guide support.",
    price: "$4,850",
    photoLabel: "HAJJ SACRED PILGRIMAGE PHOTO",
    imageSrc: "/packages/makkah.jpg",
    tintGradient: "linear-gradient(160deg, #EAE5D8 0%, #D4C7B0 100%)",
    href: "/tours?destination=Saudi+Arabia",
  },
];

export interface PopularHolidayPackagesProps {
  onOpenEnquiry?: (packageName?: string) => void;
}

export const PopularHolidayPackages: React.FC<PopularHolidayPackagesProps> = ({
  onOpenEnquiry,
}) => {
  return (
    <section
      id="packages"
      className="w-full bg-[#FAF7F2] text-[#1E1A17] py-12 sm:py-16 lg:py-24 border-t border-black/[0.06] scroll-mt-20 sm:scroll-mt-24"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-wrap gap-y-8 sm:gap-y-12 gap-x-10 lg:gap-x-14 xl:gap-x-16 items-start">
        {/* =================================================================
            LEFT INFO COLUMN (Sticky on desktop, full-width below 980px)
            ================================================================= */}
        <aside className="w-full min-[980px]:w-auto min-[980px]:flex-[1_1_280px] xl:min-[1200px]:flex-[1_1_320px] min-[980px]:max-w-[380px] static min-[980px]:sticky min-[980px]:top-[120px] self-start">
          {/* Section Eyebrow (Consistent with entire website) */}
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2 sm:mb-2.5">
            CURATED TRAVEL PACKAGES
          </span>

          {/* Section Heading (Consistent with entire website) */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#1E1A17] tracking-tight leading-[1.12]">
            Popular <br className="hidden sm:inline" />
            Holiday Packages
          </h2>

          {/* Section Description (Consistent with entire website) */}
          <p className="mt-2.5 sm:mt-3.5 text-xs sm:text-sm md:text-base text-[#5C534A] leading-relaxed">
            Browse our most popular holiday packages designed for comfort,
            luxury, and seamless itineraries.
          </p>

          {/* Index List */}
          <div className="mt-6 sm:mt-8 border-t border-black/[0.08]">
            {POPULAR_PACKAGES.map((pkg) => (
              <div
                key={pkg.number}
                className="py-2.5 sm:py-3 border-b border-black/[0.06] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                  <span className="text-xs font-mono text-[#7A7167] shrink-0">
                    {pkg.number}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#1E1A17] truncate">
                    {pkg.country}
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-[#7A7167] font-medium shrink-0">
                  {pkg.shortDuration}
                </span>
              </div>
            ))}
          </div>

          {/* "View all packages" Link */}
          <div className="mt-5 sm:mt-6">
            <Link
              href="/tours"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#463D34] hover:text-[#1E1A17] transition"
            >
              <span>View all packages</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </aside>

        {/* =================================================================
            RIGHT CARDS COLUMN (Stacked cards with unified website typography)
            ================================================================= */}
        <div className="flex-[2_1_480px] xl:min-[1200px]:flex-[2_1_640px] min-w-0 w-full flex flex-col gap-5 sm:gap-6">
          {POPULAR_PACKAGES.map((pkg) => (
            <article
              key={pkg.number}
              className="group flex flex-col sm:flex-row gap-4 sm:gap-7 bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs hover:border-stone-300 hover:shadow-md transition-all duration-300"
            >
              {/* Card Image Area */}
              <div
                className="sm:w-[260px] md:w-[280px] lg:w-[300px] shrink-0 h-[190px] sm:h-auto min-h-[190px] sm:min-h-[220px] relative rounded-xl sm:rounded-2xl overflow-hidden select-none"
                style={{
                  background: pkg.tintGradient,
                }}
              >
                {/* 8K Natural Photography */}
                {pkg.imageSrc ? (
                  <>
                    <Image
                      src={pkg.imageSrc}
                      alt={pkg.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-cover rounded-xl sm:rounded-2xl transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                      priority={pkg.number === "01"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25 pointer-events-none rounded-xl sm:rounded-2xl" />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 px-4 h-full text-[#7A7167]">
                    <MapPin className="w-6 h-6 stroke-[1.5]" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.14em]">
                      {pkg.photoLabel}
                    </span>
                  </div>
                )}

                {/* Number Badge (top-left) */}
                <div className="absolute top-3 left-3 z-10 text-[11px] font-mono font-semibold text-[#1E1A17] bg-white/90 backdrop-blur-md rounded-full px-2.5 py-1 shadow-xs border border-black/5">
                  {pkg.number}
                </div>

                {/* Duration Pill (bottom-left) */}
                <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 text-xs font-medium text-[#1E1A17] bg-white/95 backdrop-blur-md rounded-full px-3 py-1 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-[#7A7167]" />
                  <span>{pkg.duration}</span>
                </div>
              </div>

              {/* Card Content Area */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 sm:py-1">
                <div>
                  {/* Destination Row */}
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.16em] text-[#7A7167]">
                    <MapPin className="w-3.5 h-3.5 text-[#7A7167]" />
                    <span>{pkg.country}</span>
                  </div>

                  {/* Package Title */}
                  <h3 className="font-serif mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-[26px] font-normal text-[#1E1A17] tracking-tight leading-tight">
                    {pkg.name}
                  </h3>

                  {/* Package Description (Unified with site descriptions) */}
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#5C534A] leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                {/* Bottom Bar: Estimated Price & CTA Button */}
                <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A7167] block">
                      ESTIMATED PRICE
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xs text-[#7A7167]">From</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#1E1A17] font-sans tracking-tight">
                        {pkg.price}
                      </span>
                      <span className="text-xs text-[#7A7167]">per person</span>
                    </div>
                  </div>

                  {/* View Package Button */}
                  <button
                    type="button"
                    onClick={() => onOpenEnquiry && onOpenEnquiry(pkg.name)}
                    className="inline-flex items-center gap-2 bg-[#463D34] hover:bg-[#38312A] text-white text-xs font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>View Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularHolidayPackages;
