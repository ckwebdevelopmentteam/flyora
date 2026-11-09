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
      className="relative w-full overflow-hidden border-t border-black/[0.06] border-b border-black/[0.06] bg-white py-14 sm:py-18 lg:py-24"
      aria-label="Meet Our Team"
    >
      <span id="meet-our-team" className="sr-only" aria-hidden="true" />
      <span id="meet-our-team-section" className="sr-only" aria-hidden="true" />

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
