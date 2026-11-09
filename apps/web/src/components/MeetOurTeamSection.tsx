"use client";

import React from "react";
import {
  InstagramIcon,
  LinkedinIcon,
  DribbbleIcon,
} from "@/components/ui/team-02";
import { ABOUT_DATA } from "@/app/about/aboutData";

export interface MeetOurTeamSectionProps {
  onOpenEnquiry?: (serviceId?: string) => void;
}

export function MeetOurTeamSection({ onOpenEnquiry }: MeetOurTeamSectionProps) {
  const curators = ABOUT_DATA.curators.items;

  return (
    <section
      id="our-team"
      className="relative w-full overflow-hidden border-t border-black/[0.06] border-b border-black/[0.06] bg-white pt-12 sm:pt-16 lg:pt-20 pb-28 sm:pb-32 lg:pb-36"
      aria-label="Meet Our Team"
    >
      <span id="meet-our-team" className="sr-only" aria-hidden="true" />
      <span id="meet-our-team-section" className="sr-only" aria-hidden="true" />

      {/* =========================================================================
          BACKGROUND DECORATIVE LAYERS (Synced Pure White Topside & Bottom Waves + Globe)
          ========================================================================= */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Bottom-Left Smooth Curved Blue Wave Sweep */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-[160px] sm:w-[220px] md:w-[280px] lg:w-[340px] xl:w-[400px] h-[80px] sm:h-[110px] md:h-[140px] lg:h-[170px] xl:h-[190px] select-none overflow-hidden leading-none z-0">
          <svg
            viewBox="0 0 400 190"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full block"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="teamWaveLeftGrad"
                x1="100%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#002f89" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#001c54" stopOpacity="1" />
              </linearGradient>
              <linearGradient
                id="teamWaveLeftSoft"
                x1="100%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Layer 1: Soft sky halo wave curve */}
            <path
              d="M 430 190 C 300 180, 130 115, 0 35 L 0 190 Z"
              fill="url(#teamWaveLeftSoft)"
            />
            {/* Layer 2: Main vibrant Flyora logo blue wave curve */}
            <path
              d="M 380 190 C 260 188, 105 138, 0 65 L 0 190 Z"
              fill="url(#teamWaveLeftGrad)"
            />
          </svg>
        </div>

        {/* Centered Globe Dome with Flight Route Arcs & 3 Location Pins (Cleaned & Perfect) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center select-none overflow-hidden leading-none z-0">
          <picture className="block w-full max-w-[580px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-[740px] mx-auto px-4 sm:px-0">
            <source
              srcSet="/home/team-globe-center-blue.webp?v=2"
              type="image/webp"
            />
            <img
              src="/home/team-globe-center-blue.png?v=2"
              alt=""
              className="w-full h-auto max-h-[80px] sm:max-h-[90px] md:max-h-[100px] object-contain object-bottom pointer-events-none select-none block mx-auto"
              loading="eager"
            />
          </picture>
        </div>

        {/* Bottom-Right Smooth Curved Blue Wave Sweep */}
        <div className="pointer-events-none absolute bottom-0 right-0 w-[160px] sm:w-[220px] md:w-[280px] lg:w-[340px] xl:w-[400px] h-[80px] sm:h-[110px] md:h-[140px] lg:h-[170px] xl:h-[190px] select-none overflow-hidden leading-none z-0">
          <svg
            viewBox="0 0 400 190"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full block"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="teamWaveRightGrad"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#002f89" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#001c54" stopOpacity="1" />
              </linearGradient>
              <linearGradient
                id="teamWaveRightSoft"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Layer 1: Soft sky halo wave curve */}
            <path
              d="M -30 190 C 100 180, 270 115, 400 35 L 400 190 Z"
              fill="url(#teamWaveRightSoft)"
            />
            {/* Layer 2: Main vibrant Flyora logo blue wave curve */}
            <path
              d="M 20 190 C 140 188, 295 138, 400 65 L 400 190 Z"
              fill="url(#teamWaveRightGrad)"
            />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTENT: HEADER & 4 TEAM CARDS (Copied from About Page)
          ========================================================================= */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-10 sm:mb-12 lg:mb-14">
          {/* Eyebrow with flanking blue lines */}
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <div className="w-8 sm:w-12 h-[1.5px] bg-[#002f89]" />
            <span className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.22em] text-[#002f89]">
              THE PEOPLE BEHIND FLYORA
            </span>
            <div className="w-8 sm:w-12 h-[1.5px] bg-[#002f89]" />
          </div>

          {/* Heading with "Meet" in black and "Our Team" in Flyora blue */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#111827] mb-3">
            Meet <span className="text-[#002f89]">Our Team</span>
          </h2>

          {/* Description Subtitle */}
          <p className="text-sm sm:text-base text-[#4b5563] max-w-2xl mx-auto font-normal leading-relaxed">
            Care from the team who listens well, shaping bespoke journeys
            tailored to your personal pace and passion.
          </p>
        </div>

        {/* 4 Portrait Cards Grid matching About Page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
          {curators.map((curator) => (
            <div
              key={curator.id}
              onClick={() =>
                onOpenEnquiry?.(`Consultation with ${curator.name}`)
              }
              className="group flex flex-col items-start cursor-pointer text-left transition-all duration-300"
            >
              {/* Rounded Portrait Frame matching About Page */}
              <div className="relative w-full h-64 sm:h-72 lg:h-[280px] xl:h-[300px] overflow-hidden rounded-2xl bg-neutral-100 border border-black/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.06)] group-hover:shadow-[0_16px_36px_rgba(0,47,137,0.14)] transition-all duration-300">
                <img
                  src={curator.image}
                  alt={curator.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Dark Hover Overlay with Social Icons from About Page */}
                <div className="absolute inset-0 bg-gray-950/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4 sm:p-5">
                  <div className="flex gap-2">
                    <span
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-white text-[#1C1815] rounded-full hover:bg-blue-50 hover:text-[#002f89] transition-colors duration-200 shadow-md"
                      title="Instagram"
                    >
                      <InstagramIcon size={16} />
                    </span>
                    <span
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-white text-[#1C1815] rounded-full hover:bg-blue-50 hover:text-[#002f89] transition-colors duration-200 shadow-md"
                      title="LinkedIn"
                    >
                      <LinkedinIcon size={16} />
                    </span>
                    <span
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-white text-[#1C1815] rounded-full hover:bg-blue-50 hover:text-[#002f89] transition-colors duration-200 shadow-md"
                      title="Dribbble"
                    >
                      <DribbbleIcon size={16} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Name & Role from About Page */}
              <div className="flex flex-col gap-0.5 mt-4 w-full">
                <h3 className="text-lg sm:text-xl font-bold text-[#111827] group-hover:text-[#002f89] transition-colors duration-200">
                  {curator.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#6b7280] font-normal">
                  {curator.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
