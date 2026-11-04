"use client";

import React from "react";
import Image from "next/image";

export function JourneyCTA({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="our-team"
      className="relative w-full min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between overflow-hidden bg-[#002f89]"
    >
      {/* ===================================================================
          1. TOP HALF: Pure Solid White Background
          Takes flex-1 to fill all space from the top of the section down to
          the top edge of the featured image.
          =================================================================== */}
      <div className="flex-1 w-full bg-white px-6 sm:px-10 lg:px-[105px] pt-12 sm:pt-14 lg:pt-16 pb-3 sm:pb-4 flex flex-col justify-end">
        <div className="w-full">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-2 sm:mb-2.5 select-none">
            WHO WE ARE · MEET OUR TRAVEL CURATORS
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-normal text-[#1E1A17] leading-[1.25] tracking-tight w-full">
            Care from the team who listens well, shaping bespoke journeys
            <br className="hidden md:inline" /> tailored to your personal pace
            and passion.
          </h2>
        </div>
      </div>

      {/* ===================================================================
          2. CENTER IMAGE: Exact 50/50 Split Background Behind Image
          Top half sits on White, Bottom half sits on Brand Blue #002f89.
          -top-2 and -bottom-2 with calc(50%+8px) overlap completely eliminates
          any subpixel rendering gap or line leak.
          =================================================================== */}
      <div className="relative w-full px-6 sm:px-10 lg:px-[105px] shrink-0">
        {/* Seamless 50/50 background split behind image */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-2 h-[calc(50%+8px)] bg-white pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-2 h-[calc(50%+8px)] bg-[#002f89] pointer-events-none"
        />

        {/* Featured Panoramic Image: same height as before, rounded-[8px] */}
        <div className="relative z-10 w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[400px] xl:h-[430px] rounded-[8px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <Image
            src="/home/travel-team-curators.jpg"
            alt="Flyora travel curators team planning bespoke journeys"
            fill
            sizes="(max-width: 1024px) 100vw, 1360px"
            className="object-cover object-center select-none pointer-events-none"
            priority={false}
          />
        </div>
      </div>

      {/* ===================================================================
          3. BOTTOM HALF: Brand Blue Background (#002f89)
          Takes flex-1 to fill all space from the bottom edge of the image
          down to the bottom of the section.
          =================================================================== */}
      <div className="flex-1 w-full bg-[#002f89] text-white px-6 sm:px-10 lg:px-[105px] pt-4 sm:pt-5 lg:pt-6 pb-6 sm:pb-8 lg:pb-10 flex flex-col justify-start">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-start w-full">
          {/* Stat 1 */}
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-sm sm:text-[15px] text-white/90 block font-sans font-normal tracking-wide">
              Journeys Crafted
            </span>
            <div className="font-serif text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-light text-white tracking-tight leading-none mt-1 sm:mt-1.5">
              1,200 +
            </div>
          </div>

          {/* Stat 2 */}
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-sm sm:text-[15px] text-white/90 block font-sans font-normal tracking-wide">
              Curated Destinations
            </span>
            <div className="font-serif text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-light text-white tracking-tight leading-none mt-1 sm:mt-1.5">
              50 +
            </div>
          </div>

          {/* Stat 3 */}
          <div className="space-y-1 sm:space-y-1.5">
            <span className="text-sm sm:text-[15px] text-white/90 block font-sans font-normal tracking-wide">
              Traveler Satisfaction
            </span>
            <div className="font-serif text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-light text-white tracking-tight leading-none mt-1 sm:mt-1.5">
              98 %
            </div>
          </div>

          {/* Col 4: Description & Plan My Trip Button */}
          <div className="col-span-2 lg:col-span-1 space-y-2.5">
            <p className="text-sm sm:text-[14.5px] lg:text-[15px] text-white/90 leading-relaxed font-sans">
              Every itinerary is shaped by dedicated specialists who obsess over
              every detail — from handpicked luxury stays to seamless
              coordination.
            </p>
            <button
              type="button"
              onClick={onStart}
              className="mt-1 px-5 py-2.5 rounded-md bg-white hover:bg-neutral-100 active:bg-neutral-200 text-[#002f89] text-[11.5px] sm:text-[12px] font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-xs whitespace-nowrap inline-flex items-center justify-center"
            >
              <span>Plan My Trip</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
