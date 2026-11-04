"use client";

import React from "react";
import Image from "next/image";

export function JourneyCTA({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="our-team"
      className="relative w-full min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between overflow-hidden"
    >
      {/* -------------------------------------------------------------------
          TOP HALF (Pure White Background)
          ------------------------------------------------------------------- */}
      <div className="bg-white px-6 sm:px-10 lg:px-[105px] pt-8 sm:pt-10 lg:pt-12 pb-3 sm:pb-4 flex flex-col justify-end">
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

      {/* -------------------------------------------------------------------
          CENTER FEATURED IMAGE (Exact 50/50 Split Background Behind Image)
          Top half sits on White, Bottom half sits on our Brand Blue
          ------------------------------------------------------------------- */}
      <div className="relative w-full px-6 sm:px-10 lg:px-[105px]">
        {/* Background split: top 50% white, bottom 50% brand blue */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1/2 bg-white pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-[#002f89] pointer-events-none"
        />

        {/* Panoramic Curators Team Image */}
        <div className="relative z-10 w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[400px] xl:h-[430px] rounded-[16px] lg:rounded-[20px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
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

      {/* -------------------------------------------------------------------
          BOTTOM HALF (Our Signature Brand Blue #002f89)
          ------------------------------------------------------------------- */}
      <div className="bg-[#002f89] text-white px-6 sm:px-10 lg:px-[105px] pt-4 sm:pt-6 pb-8 sm:pb-10 lg:pb-12">
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

          {/* Col 4: Description & Plan My Trip CTA */}
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
