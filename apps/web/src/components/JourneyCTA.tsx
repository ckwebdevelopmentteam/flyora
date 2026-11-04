"use client";

import React from "react";
import Image from "next/image";

export function JourneyCTA({ onStart }: { onStart: () => void }) {
  return (
    <section id="our-team" className="relative w-full overflow-hidden">
      {/* -------------------------------------------------------------------
          TOP SECTION (Light Background)
          ------------------------------------------------------------------- */}
      <div className="bg-white pt-14 sm:pt-20 lg:pt-24 pb-24 sm:pb-36 md:pb-44 lg:pb-52 px-6 sm:px-10 lg:px-[105px]">
        <div className="max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-3 select-none">
            WHO WE ARE · MEET OUR TRAVEL CURATORS
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal text-[#1E1A17] leading-[1.22] tracking-tight">
            Care from the team who listens well, shaping bespoke journeys
            tailored to your personal pace and passion.
          </h2>
        </div>
      </div>

      {/* -------------------------------------------------------------------
          BOTTOM SECTION (Our Signature Dark Background #1E1A17)
          With the featured image pulled upward to straddle the two halves
          ------------------------------------------------------------------- */}
      <div className="relative bg-[#1E1A17] text-white px-6 sm:px-10 lg:px-[105px] pb-16 sm:pb-20 lg:pb-24">
        {/* Straddling Featured Panoramic Image */}
        <div className="relative -mt-20 sm:-mt-28 md:-mt-36 lg:-mt-44 mb-10 sm:mb-14 lg:mb-16 z-10">
          <div className="w-full aspect-[16/7] md:aspect-[21/9] rounded-[8px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <Image
              src="/home/travel-team-curators.jpg"
              alt="Flyora travel curators team planning bespoke journeys"
              width={1920}
              height={820}
              className="w-full h-full object-cover object-center select-none pointer-events-none"
              priority={false}
            />
          </div>
        </div>

        {/* 4 Columns Row: 3 Stats + 1 Description with Plan My Trip CTA */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
          {/* Stat 1 */}
          <div className="space-y-1.5 sm:space-y-2">
            <span className="text-xs sm:text-sm text-white/70 block font-sans">
              Journeys Crafted
            </span>
            <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
              1,200 +
            </div>
          </div>

          {/* Stat 2 */}
          <div className="space-y-1.5 sm:space-y-2">
            <span className="text-xs sm:text-sm text-white/70 block font-sans">
              Global Destinations
            </span>
            <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
              50 +
            </div>
          </div>

          {/* Stat 3 */}
          <div className="space-y-1.5 sm:space-y-2">
            <span className="text-xs sm:text-sm text-white/70 block font-sans">
              Traveler Satisfaction
            </span>
            <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
              98 %
            </div>
          </div>

          {/* Col 4: Description & CTA */}
          <div className="col-span-2 lg:col-span-1 space-y-3">
            <p className="text-xs sm:text-[13px] text-white/75 leading-relaxed font-sans">
              Every itinerary is shaped by dedicated specialists who obsess over
              every detail — from handpicked luxury stays to seamless
              coordination.
            </p>
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#E58A60] hover:text-[#FFA07A] transition-colors cursor-pointer group select-none"
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
