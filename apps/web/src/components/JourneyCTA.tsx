"use client";

import React from "react";
import Image from "next/image";

export function JourneyCTA({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="our-team"
      className="relative w-full bg-[#002f89] overflow-hidden"
    >
      {/* ===================================================================
          TOP HALF: Pure Solid White Background
          =================================================================== */}
      <div className="w-full bg-white px-6 sm:px-10 lg:px-[105px] pt-8 sm:pt-10 lg:pt-12 pb-24 sm:pb-32 md:pb-36 lg:pb-44">
        <div className="max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2 sm:mb-2.5 select-none">
            WHO WE ARE · MEET OUR TRAVEL CURATORS
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[36px] xl:text-[40px] font-normal text-[#1E1A17] leading-[1.22] tracking-tight">
            Care from the team who listens well, shaping bespoke journeys
            tailored to your personal pace and passion.
          </h2>
        </div>
      </div>

      {/* ===================================================================
          BOTTOM HALF: Solid Brand Blue Background (#002f89)
          The panoramic image sits directly over the seam: 50% on white, 50% on blue.
          =================================================================== */}
      <div className="relative w-full bg-[#002f89] text-white px-6 sm:px-10 lg:px-[105px] pb-8 sm:pb-10 lg:pb-12">
        {/* Featured Panoramic Image Pulled Upward to straddle the seam */}
        <div className="relative -mt-20 sm:-mt-28 md:-mt-36 lg:-mt-40 mb-6 sm:mb-8 lg:mb-10 z-10">
          <div className="w-full aspect-[16/7] md:aspect-[21/9] lg:aspect-[2.6/1] rounded-[16px] lg:rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <Image
              src="/home/travel-team-curators.jpg"
              alt="Flyora travel curators team planning bespoke journeys"
              width={1920}
              height={740}
              className="w-full h-full object-cover object-center select-none pointer-events-none"
              priority={false}
            />
          </div>
        </div>

        {/* 4 Columns: 3 Stats + 1 Description & Plan My Trip CTA */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-start">
          {/* Stat 1 */}
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-xs sm:text-[13px] text-white/80 block font-sans">
              Journeys Crafted
            </span>
            <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
              1,200 +
            </div>
          </div>

          {/* Stat 2 */}
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-xs sm:text-[13px] text-white/80 block font-sans">
              Curated Destinations
            </span>
            <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
              50 +
            </div>
          </div>

          {/* Stat 3 */}
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-xs sm:text-[13px] text-white/80 block font-sans">
              Traveler Satisfaction
            </span>
            <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
              98 %
            </div>
          </div>

          {/* Col 4: Description & CTA */}
          <div className="col-span-2 lg:col-span-1 space-y-2.5">
            <p className="text-xs sm:text-[13px] text-white/85 leading-relaxed font-sans">
              Every itinerary is shaped by dedicated specialists who obsess over
              every detail — from handpicked luxury stays to seamless
              coordination.
            </p>
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#FFB088] hover:text-white transition-colors cursor-pointer group select-none"
            >
              <span>Plan My Trip</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                &gt;
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
