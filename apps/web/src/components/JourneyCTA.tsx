"use client";

import React from "react";
import Image from "next/image";

export function JourneyCTA({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="cta"
      className="relative py-12 sm:py-16 lg:py-20 text-white text-center px-4 sm:px-5 overflow-hidden scroll-mt-20 sm:scroll-mt-24"
      aria-labelledby="journey-cta-title"
    >
      {/* Background Scenic Image */}
      <Image
        src="/home/journey-cta-bg.jpg"
        alt="Luxury getaway destination"
        fill
        sizes="100vw"
        className="object-cover object-center pointer-events-none select-none"
        priority={false}
      />

      {/* Atmospheric Overlays for optimal text contrast and photo depth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#002f89]/20 mix-blend-multiply pointer-events-none"
      />

      {/* Exact plain content as on the original blue background */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-white/70 block mb-2 sm:mb-3">
          YOUR NEXT GETAWAY STARTS HERE
        </span>
        <h2
          id="journey-cta-title"
          className="font-serif text-2xl sm:text-3xl md:text-5xl font-normal mb-3 sm:mb-5 tracking-tight leading-[1.12]"
        >
          Find the perfect travel advisor for your next trip
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-white/80 max-w-xl mx-auto mb-6 sm:mb-8 font-light leading-relaxed">
          Connect with a handpicked specialist, unlock complimentary hotel
          perks, and travel with total peace of mind.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="px-7 sm:px-9 py-3 sm:py-4 rounded-md bg-white hover:bg-neutral-100 text-[#002f89] hover:text-[#00246b] text-xs font-semibold uppercase tracking-[0.14em] shadow-lg hover:shadow-xl transition motion-reduce:transition-none motion-reduce:transform-none active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          GET MATCHED
        </button>
      </div>
    </section>
  );
}
