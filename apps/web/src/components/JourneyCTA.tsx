"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function JourneyCTA({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="cta"
      className="relative py-12 sm:py-16 lg:py-20 text-white text-center px-4 sm:px-6 overflow-hidden scroll-mt-20 sm:scroll-mt-24"
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
        className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#002f89]/20 mix-blend-multiply pointer-events-none"
      />

      {/* Direct Content (no box placeholder) */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        {/* Eyebrow Badge */}
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-white/95 mb-3.5 sm:mb-4 shadow-sm select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          YOUR NEXT GETAWAY STARTS HERE
        </span>

        {/* Heading with Highlighted Text */}
        <h2
          id="journey-cta-title"
          className="font-serif text-2xl sm:text-4xl md:text-5xl font-normal mb-3 sm:mb-4 tracking-tight leading-[1.15] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
        >
          Find the{" "}
          <span className="italic font-serif bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent underline decoration-amber-300/40 underline-offset-4 sm:underline-offset-8 drop-shadow-sm font-normal">
            perfect travel advisor
          </span>{" "}
          for your next trip
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-white/90 max-w-xl mx-auto mb-6 sm:mb-8 font-light leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
          Connect with a handpicked specialist, unlock complimentary hotel
          perks, and travel with total peace of mind.
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onStart}
          className="group inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-white hover:bg-neutral-50 text-[#002f89] text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] shadow-[0_10px_28px_rgba(0,0,0,0.35)] hover:shadow-[0_14px_36px_rgba(0,47,137,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span>GET MATCHED</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-[#002f89]" />
        </button>
      </div>
    </section>
  );
}
