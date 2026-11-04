"use client";

import React from "react";
import Image from "next/image";

export function JourneyCTA({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="cta"
      className="relative py-16 sm:py-24 lg:py-28 text-white text-center px-4 sm:px-6 overflow-hidden scroll-mt-20 sm:scroll-mt-24"
      aria-labelledby="journey-cta-title"
    >
      {/* Background Image */}
      <Image
        src="/home/journey-cta-bg.jpg"
        alt="Luxury getaway destination"
        fill
        sizes="100vw"
        className="object-cover object-center pointer-events-none select-none"
        priority={false}
      />

      {/* Atmospheric Scrim Overlays */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#002f89]/25 mix-blend-multiply pointer-events-none"
      />

      {/* Frosted Glassmorphism Card */}
      <div className="relative z-10 max-w-3xl mx-auto rounded-2xl sm:rounded-3xl bg-white/[0.12] backdrop-blur-md sm:backdrop-blur-xl border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.35)] p-7 sm:p-12 md:p-14">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-white/90 block mb-2 sm:mb-3 drop-shadow-sm">
          YOUR NEXT GETAWAY STARTS HERE
        </span>
        <h2
          id="journey-cta-title"
          className="font-serif text-2xl sm:text-3xl md:text-5xl font-normal mb-3 sm:mb-5 tracking-tight leading-[1.14] text-white drop-shadow-md"
        >
          Find the perfect travel advisor for your next trip
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-white/90 max-w-xl mx-auto mb-6 sm:mb-8 font-light leading-relaxed drop-shadow-sm">
          Connect with a handpicked specialist, unlock complimentary hotel
          perks, and travel with total peace of mind.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-md bg-white hover:bg-neutral-100 text-[#002f89] hover:text-[#00246b] text-xs sm:text-[13px] font-semibold uppercase tracking-[0.14em] shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition motion-reduce:transition-none active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          GET MATCHED
        </button>
      </div>
    </section>
  );
}
