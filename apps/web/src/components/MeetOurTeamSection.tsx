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
      className="relative w-full overflow-hidden border-t border-rose-100/70 border-b border-rose-100/50 pt-12 sm:pt-16 lg:pt-20 pb-28 sm:pb-32 lg:pb-36"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #FFF8F7 12%, #FFF4F3 40%, #FFF7F6 75%, #FFF5F6 100%)",
      }}
      aria-label="Meet Our Team"
    >
      <span id="meet-our-team" className="sr-only" aria-hidden="true" />
      <span id="meet-our-team-section" className="sr-only" aria-hidden="true" />

      {/* =========================================================================
          BACKGROUND DECORATIVE LAYERS (100% Preserved Exact Current BG)
          ========================================================================= */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        {/* 1. Large Top-Left Soft Blush/Coral Crescent Disk */}
        <div
          className="absolute -top-16 -left-28 sm:-top-24 sm:-left-36 lg:-top-32 lg:-left-44 w-[380px] h-[380px] sm:w-[540px] sm:h-[540px] lg:w-[680px] lg:h-[680px] rounded-full pointer-events-none opacity-80"
          style={{
            background:
              "radial-gradient(circle at 45% 45%, rgba(254,205,211,0.7) 0%, rgba(254,226,226,0.45) 45%, rgba(255,241,242,0.1) 75%, transparent 100%)",
            filter: "blur(20px)",
          }}
        />

        {/* 2. Top-Left Subtle Red Dot Grid Matrix (Next to Heading) */}
        <div
          className="absolute left-[5%] sm:left-[8%] lg:left-[11%] top-12 sm:top-16 w-24 sm:w-28 h-20 sm:h-24 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, #e11d48 1.4px, transparent 1.4px)",
            backgroundSize: "16px 16px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />

        {/* 3. Large Right-Edge Soft Blush/Coral Crescent Disk */}
        <div
          className="absolute top-6 -right-28 sm:top-10 sm:-right-36 lg:top-14 lg:-right-44 w-[380px] h-[520px] sm:w-[520px] sm:h-[680px] lg:w-[660px] lg:h-[800px] rounded-[50%_50%_55%_45%/45%_55%_45%_55%] pointer-events-none opacity-80"
          style={{
            background:
              "radial-gradient(circle at 75% 50%, rgba(254,205,211,0.65) 0%, rgba(254,226,226,0.4) 45%, rgba(255,241,242,0.08) 75%, transparent 100%)",
            filter: "blur(24px)",
          }}
        />

        {/* 4. Right Edge Subtle Red Dot Grid Matrix */}
        <div
          className="absolute right-[3%] sm:right-[5%] top-1/3 w-20 sm:w-24 h-32 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, #e11d48 1.3px, transparent 1.3px)",
            backgroundSize: "16px 16px",
            maskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 80%)",
          }}
        />

        {/* 5. Center Warm White Illumination */}
        <div
          className="absolute inset-x-[15%] top-6 bottom-24 rounded-full opacity-90 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.96) 0%, rgba(255,248,247,0.65) 60%, transparent 100%)",
          }}
        />

        {/* =======================================================================
            AUTHENTIC 3D WORLD MAP GLOBE DOME, FLIGHT ARCS, PINS & CORNER WAVES
            ======================================================================= */}
        {/* Bottom-Left Soft Blush Curved Wave Sweep */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-[120px] sm:w-[160px] md:w-[200px] select-none overflow-hidden leading-none z-0">
          <picture className="block w-full">
            <source srcSet="/home/team-wave-left.webp" type="image/webp" />
            <img
              src="/home/team-wave-left.png"
              alt=""
              className="w-full h-auto object-contain object-left-bottom pointer-events-none select-none block"
              loading="eager"
            />
          </picture>
        </div>

        {/* Centered Smaller Globe Dome with Flight Route Arcs & 3 Location Pins */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center select-none overflow-hidden leading-none z-0">
          <picture className="block w-full max-w-[580px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-[740px] mx-auto px-4 sm:px-0">
            <source srcSet="/home/team-globe-center.webp" type="image/webp" />
            <img
              src="/home/team-globe-center.png"
              alt=""
              className="w-full h-auto max-h-[80px] sm:max-h-[90px] md:max-h-[100px] object-contain object-bottom pointer-events-none select-none block mx-auto"
              loading="eager"
            />
          </picture>
        </div>

        {/* Bottom-Right Vibrant Curved Red Wave Sweep */}
        <div className="pointer-events-none absolute bottom-0 right-0 w-[140px] sm:w-[180px] md:w-[220px] select-none overflow-hidden leading-none z-0">
          <picture className="block w-full">
            <source srcSet="/home/team-wave-right.webp" type="image/webp" />
            <img
              src="/home/team-wave-right.png"
              alt=""
              className="w-full h-auto object-contain object-right-bottom pointer-events-none select-none block"
              loading="eager"
            />
          </picture>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTENT: HEADER & 4 TEAM CARDS (Copied from About Page)
          ========================================================================= */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-10 sm:mb-12 lg:mb-14">
          {/* Eyebrow with flanking red lines */}
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <div className="w-8 sm:w-12 h-[1.5px] bg-[#c5221f]" />
            <span className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.22em] text-[#c5221f]">
              THE PEOPLE BEHIND FLYORA
            </span>
            <div className="w-8 sm:w-12 h-[1.5px] bg-[#c5221f]" />
          </div>

          {/* Heading with "Meet" in black and "Our Team" in red */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#111827] mb-3">
            Meet <span className="text-[#c5221f]">Our Team</span>
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
              <div className="relative w-full h-64 sm:h-72 lg:h-[280px] xl:h-[300px] overflow-hidden rounded-2xl bg-neutral-100 border border-black/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.06)] group-hover:shadow-[0_16px_36px_rgba(225,29,72,0.12)] transition-all duration-300">
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
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-white text-[#1C1815] rounded-full hover:bg-rose-50 hover:text-[#e11d48] transition-colors duration-200 shadow-md"
                      title="Instagram"
                    >
                      <InstagramIcon size={16} />
                    </span>
                    <span
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-white text-[#1C1815] rounded-full hover:bg-rose-50 hover:text-[#e11d48] transition-colors duration-200 shadow-md"
                      title="LinkedIn"
                    >
                      <LinkedinIcon size={16} />
                    </span>
                    <span
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-white text-[#1C1815] rounded-full hover:bg-rose-50 hover:text-[#e11d48] transition-colors duration-200 shadow-md"
                      title="Dribbble"
                    >
                      <DribbbleIcon size={16} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Name & Role from About Page */}
              <div className="flex flex-col gap-0.5 mt-4 w-full">
                <h3 className="text-lg sm:text-xl font-bold text-[#111827] group-hover:text-[#c5221f] transition-colors duration-200">
                  {curator.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#6b7280] font-normal">
                  {curator.role}
                </p>

                {/* Specialties Pill Badges from About Page */}
                {curator.specialties && curator.specialties.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {curator.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-sans uppercase tracking-wider text-[#6B6156] bg-white/90 px-2.5 py-1 rounded-full border border-black/[0.06] shadow-2xs"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
