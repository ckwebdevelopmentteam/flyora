"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Cormorant_Garamond, Poppins, Space_Mono } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// =============================================================================
// PACKAGE DATA (Edit packages in this array)
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
      className="w-full bg-[#FAF7F2] text-[#2E2723] pt-[120px] pb-[128px] px-6 sm:px-8 lg:px-12 border-t border-black/[0.06]"
      style={{
        backgroundColor: "#FAF7F2",
      }}
    >
      <div className="max-w-[1344px] mx-auto flex flex-wrap gap-y-[72px] gap-x-10 lg:gap-x-14 xl:gap-x-[64px] items-start">
        {/* =================================================================
            LEFT INFO COLUMN (Sticky desktop, full-width below 980px)
            ================================================================= */}
        <aside className="w-full min-[980px]:w-auto min-[980px]:flex-[1_1_280px] xl:min-[1200px]:flex-[1_1_340px] min-[980px]:max-w-[420px] static min-[980px]:sticky min-[980px]:top-[120px] self-start">
          {/* Eyebrow Row */}
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="w-[44px] h-[1px] bg-[#6B6058] shrink-0"
            />
            <span
              className={`${spaceMono.className} text-[14px] uppercase text-[#6B6058] tracking-[0.24em] font-normal`}
            >
              CURATED TRAVEL PACKAGES
            </span>
          </div>

          {/* Heading h2: exactly 3 lines ("Popular" / "Holiday" / "Packages") */}
          <h2
            className={`${cormorant.className} mt-7 text-[56px] min-[980px]:text-[72px] xl:min-[1200px]:text-[88px] font-medium text-[#2E2723] leading-[0.96] tracking-[-0.015em]`}
          >
            Popular
            <br />
            Holiday
            <br />
            Packages
          </h2>

          {/* Description Paragraph */}
          <p
            className={`${poppins.className} mt-8 text-[19px] text-[#5E544C] leading-[1.75] font-normal`}
          >
            Browse our most popular holiday packages designed for comfort,
            luxury, and seamless itineraries.
          </p>

          {/* Index List */}
          <div className="mt-10 border-t border-[#DDD3C7]">
            {POPULAR_PACKAGES.map((pkg) => (
              <div
                key={pkg.number}
                className="py-4 border-b border-[#DDD3C7] flex items-center justify-between"
              >
                {/* Left: number + country name */}
                <div className="flex items-baseline gap-4 min-w-0 pr-2">
                  <span
                    className={`${spaceMono.className} text-[14px] text-[#6B6058] font-normal shrink-0`}
                  >
                    {pkg.number}
                  </span>
                  <span
                    className={`${cormorant.className} text-[26px] font-medium text-[#2E2723] leading-none`}
                  >
                    {pkg.country}
                  </span>
                </div>

                {/* Right: duration text */}
                <span
                  className={`${poppins.className} text-[15px] text-[#6B6058] font-normal shrink-0`}
                >
                  {pkg.shortDuration}
                </span>
              </div>
            ))}
          </div>

          {/* "View all packages" Link */}
          <div className="mt-9">
            <Link
              href="/tours"
              className={`group inline-flex items-center gap-3 text-[17px] font-medium text-[#2E2723] border-b border-[#2E2723] pb-1.5 transition-all duration-250 hover:gap-5 focus-visible:outline-3 focus-visible:outline-[#3F352F] focus-visible:outline-offset-3 ${poppins.className}`}
            >
              <span>View all packages</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2E2723"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0 transition-transform duration-250"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </aside>

        {/* =================================================================
            RIGHT CARDS COLUMN (Three horizontal cards stacked vertically)
            ================================================================= */}
        <div className="flex-[2_1_480px] xl:min-[1200px]:flex-[2_1_640px] min-w-0 w-full flex flex-col gap-7">
          {POPULAR_PACKAGES.map((pkg) => (
            <article
              key={pkg.number}
              className="group flex flex-wrap gap-y-2 gap-x-9 bg-white border border-[#EAE3D9] rounded-[36px] p-5 shadow-[0_24px_50px_-36px_rgba(63,53,47,0.3)] hover:-translate-y-1.5 hover:shadow-[0_36px_70px_-34px_rgba(63,53,47,0.38)] transition-all duration-450 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            >
              {/* CARD IMAGE AREA (Left Half) */}
              <div
                className="flex-[1_1_280px] min-h-[340px] relative rounded-[24px] overflow-hidden flex flex-col items-center justify-center text-center select-none"
                style={{
                  background: pkg.tintGradient,
                }}
              >
                {/* 8K Natural Photography Background */}
                {pkg.imageSrc ? (
                  <>
                    <Image
                      src={pkg.imageSrc}
                      alt={pkg.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
                      className="object-cover rounded-[24px] transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                      priority={pkg.number === "01"}
                    />
                    {/* Atmospheric soft overlay for pristine badge and pill contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/25 pointer-events-none rounded-[24px]" />
                  </>
                ) : (
                  /* Fallback Centered Image Icon & Photo Label */
                  <div className="flex flex-col items-center justify-center gap-3.5 px-4 text-[#6B6058]">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B6058"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span
                      className={`${spaceMono.className} text-[12px] uppercase tracking-[0.16em] text-center text-[#6B6058] leading-tight`}
                    >
                      {pkg.photoLabel}
                    </span>
                  </div>
                )}

                {/* Number Badge (top-left) */}
                <div
                  className={`absolute top-[18px] left-[18px] z-10 ${cormorant.className} text-[28px] font-semibold text-[#2E2723] leading-none bg-white/90 rounded-full px-4 pt-2 pb-1.5 shadow-sm backdrop-blur-xs`}
                >
                  {pkg.number}
                </div>

                {/* Duration Pill (bottom-left) */}
                <div
                  className={`absolute bottom-[18px] left-[18px] z-10 inline-flex items-center gap-2 ${poppins.className} text-[15px] font-medium text-[#2E2723] bg-white/95 rounded-full px-4 py-2.5 backdrop-blur-xs shadow-md`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2E2723"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{pkg.duration}</span>
                </div>
              </div>

              {/* CARD CONTENT (Right Half) */}
              <div className="flex-[1.3_1_320px] min-w-0 flex flex-col justify-between gap-7 pt-3.5 pr-4 pb-2.5 pl-1">
                {/* Top Block */}
                <div>
                  {/* Country Row */}
                  <div className="inline-flex items-center gap-2 text-[#5E544C]">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#5E544C"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span
                      className={`${poppins.className} text-[15px] font-medium text-[#5E544C]`}
                    >
                      {pkg.country}
                    </span>
                  </div>

                  {/* Name h3 */}
                  <h3
                    className={`${cormorant.className} mt-3.5 text-[40px] sm:text-[50px] font-medium text-[#2E2723] leading-[1.02] tracking-[-0.01em]`}
                  >
                    {pkg.name}
                  </h3>

                  {/* Description */}
                  <p
                    className={`${poppins.className} mt-4.5 text-[17px] sm:text-[18px] text-[#5E544C] leading-[1.7] font-normal`}
                  >
                    {pkg.description}
                  </p>
                </div>

                {/* Bottom Block */}
                <div className="pt-6 border-t border-[#EAE3D9] flex flex-wrap items-end justify-between gap-5">
                  {/* Estimated Price */}
                  <div>
                    <span
                      className={`${spaceMono.className} text-[12px] uppercase tracking-[0.18em] text-[#6B6058] block`}
                    >
                      ESTIMATED PRICE
                    </span>
                    <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                      <span
                        className={`${poppins.className} text-[16px] text-[#5E544C]`}
                      >
                        From
                      </span>
                      <span
                        className={`${cormorant.className} text-[46px] font-semibold text-[#2E2723] leading-none`}
                      >
                        {pkg.price}
                      </span>
                      <span
                        className={`${poppins.className} text-[16px] text-[#5E544C]`}
                      >
                        per person
                      </span>
                    </div>
                  </div>

                  {/* View Package Button */}
                  <button
                    type="button"
                    onClick={() => onOpenEnquiry && onOpenEnquiry(pkg.name)}
                    className={`group inline-flex items-center gap-2.5 hover:gap-4 bg-[#3F352F] hover:bg-[#2F2722] text-white text-[16px] font-medium px-7 py-4 rounded-full transition-all duration-250 focus-visible:outline-3 focus-visible:outline-[#3F352F] focus-visible:outline-offset-3 cursor-pointer select-none ${poppins.className}`}
                  >
                    <span>View Package</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="shrink-0 transition-transform duration-250"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
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
