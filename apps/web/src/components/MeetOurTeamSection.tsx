"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { ABOUT_DATA } from "@/app/about/aboutData";

export interface MeetOurTeamSectionProps {
  onOpenEnquiry?: (serviceId?: string) => void;
}

export function MeetOurTeamSection({ onOpenEnquiry }: MeetOurTeamSectionProps) {
  const curators = ABOUT_DATA.curators.items;

  return (
    <section
      id="our-team"
      className="relative w-full overflow-hidden border-t border-rose-100/70 border-b border-rose-100/50 pt-16 pb-36 sm:pt-20 sm:pb-44 lg:pt-24 lg:pb-52"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #FFF8F7 12%, #FFF4F3 40%, #FFF7F6 75%, #FFFFFF 100%)",
      }}
      aria-label="Meet Our Team"
    >
      <span id="meet-our-team" className="sr-only" aria-hidden="true" />

      {/* =========================================================================
          BACKGROUND DECORATIVE LAYERS (100% Exact Matching Screenshot)
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
          className="absolute left-[8%] sm:left-[12%] lg:left-[14%] top-16 sm:top-20 w-24 sm:w-28 h-20 sm:h-24 pointer-events-none opacity-40"
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
          className="absolute top-12 -right-28 sm:top-16 sm:-right-36 lg:top-20 lg:-right-44 w-[380px] h-[520px] sm:w-[520px] sm:h-[680px] lg:w-[660px] lg:h-[800px] rounded-[50%_50%_55%_45%/45%_55%_45%_55%] pointer-events-none opacity-80"
          style={{
            background:
              "radial-gradient(circle at 75% 50%, rgba(254,205,211,0.65) 0%, rgba(254,226,226,0.4) 45%, rgba(255,241,242,0.08) 75%, transparent 100%)",
            filter: "blur(24px)",
          }}
        />

        {/* 4. Right Edge Subtle Red Dot Grid Matrix */}
        <div
          className="absolute right-[4%] sm:right-[6%] top-1/3 w-20 sm:w-24 h-32 pointer-events-none opacity-30"
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
          className="absolute inset-x-[15%] top-8 bottom-36 rounded-full opacity-90 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.96) 0%, rgba(255,248,247,0.65) 60%, transparent 100%)",
          }}
        />

        {/* =======================================================================
            BOTTOM WORLD MAP DOME, DASHED FLIGHT PATH, 3 LOCATION PINS & WAVES
            ======================================================================= */}
        <div className="absolute inset-x-0 bottom-0 h-48 sm:h-56 lg:h-64 pointer-events-none overflow-hidden select-none">
          {/* Dotted World Map Dome SVG */}
          <div className="absolute inset-x-0 bottom-0 h-full w-full opacity-55">
            <img
              src="/home/world-map-dots.svg"
              alt=""
              className="w-full h-full object-cover object-bottom pointer-events-none"
            />
          </div>

          {/* SVG Overlay: Dashed Travel Arc, 3 Location Pins with Glowing Rings, Corner Waves */}
          <svg
            viewBox="0 0 1440 260"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Bottom Right Wave Gradient */}
              <linearGradient
                id="teamRedWaveGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.95" />
              </linearGradient>

              {/* Bottom Left Wave Gradient */}
              <linearGradient
                id="teamPinkWaveGrad"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#fecdd3" stopOpacity="0.45" />
              </linearGradient>

              {/* Location Pin Ground Glow */}
              <radialGradient id="pinGlow">
                <stop offset="0%" stopColor="#e11d48" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Bottom-Right Curved Organic Wave Shape */}
            <path
              d="M 1120 260 Q 1240 220 1300 160 Q 1360 120 1440 100 L 1440 260 Z"
              fill="url(#teamRedWaveGrad)"
            />

            {/* Bottom-Left Curved Organic Wave Shape */}
            <path
              d="M 0 160 Q 90 170 180 210 Q 250 240 320 260 L 0 260 Z"
              fill="url(#teamPinkWaveGrad)"
            />

            {/* Curved Dashed Red Flight / Travel Route Arc */}
            <path
              d="M 220 160 Q 720 30 1220 160"
              stroke="#e11d48"
              strokeWidth="1.75"
              strokeDasharray="5 5"
              opacity="0.85"
            />

            {/* Location Pin 1 (Left - beneath Card 1) */}
            <g transform="translate(380, 134)">
              {/* Elliptical Ground Glow Ripple */}
              <ellipse cx="0" cy="18" rx="24" ry="8" fill="url(#pinGlow)" />
              <ellipse
                cx="0"
                cy="18"
                rx="14"
                ry="5"
                fill="rgba(225,29,72,0.4)"
              />
              {/* Pin Marker */}
              <path
                d="M 0 16 C -6 6, -8 0, -8 -6 A 8 8 0 1 1 8 -6 C 8 0, 6 6, 0 16 Z"
                fill="#dc2626"
              />
              <circle cx="0" cy="-6" r="3" fill="#ffffff" />
            </g>

            {/* Location Pin 2 (Center - beneath Card 2 & 3) */}
            <g transform="translate(720, 50)">
              {/* Elliptical Ground Glow Ripple */}
              <ellipse cx="0" cy="18" rx="24" ry="8" fill="url(#pinGlow)" />
              <ellipse
                cx="0"
                cy="18"
                rx="14"
                ry="5"
                fill="rgba(225,29,72,0.4)"
              />
              {/* Pin Marker */}
              <path
                d="M 0 16 C -6 6, -8 0, -8 -6 A 8 8 0 1 1 8 -6 C 8 0, 6 6, 0 16 Z"
                fill="#dc2626"
              />
              <circle cx="0" cy="-6" r="3" fill="#ffffff" />
            </g>

            {/* Location Pin 3 (Right - beneath Card 4) */}
            <g transform="translate(1060, 134)">
              {/* Elliptical Ground Glow Ripple */}
              <ellipse cx="0" cy="18" rx="24" ry="8" fill="url(#pinGlow)" />
              <ellipse
                cx="0"
                cy="18"
                rx="14"
                ry="5"
                fill="rgba(225,29,72,0.4)"
              />
              {/* Pin Marker */}
              <path
                d="M 0 16 C -6 6, -8 0, -8 -6 A 8 8 0 1 1 8 -6 C 8 0, 6 6, 0 16 Z"
                fill="#dc2626"
              />
              <circle cx="0" cy="-6" r="3" fill="#ffffff" />
            </g>
          </svg>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTENT: HEADER & 4 TEAM CARDS (100% Exact Matching Screenshot)
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

        {/* 4 Team Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full">
          {curators.map((member) => (
            <div
              key={member.id}
              onClick={() =>
                onOpenEnquiry?.(`Consultation with ${member.name}`)
              }
              className="group bg-white rounded-3xl p-2.5 pb-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(225,29,72,0.12)] transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col border border-black/[0.04]"
            >
              {/* Member Photo */}
              <div className="relative w-full aspect-[4/4.3] sm:aspect-[4/4.5] overflow-hidden rounded-2xl bg-neutral-100">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Card Footer: Name, Role & Arrow Up-Right Pill Button */}
              <div className="pt-3.5 px-2 flex items-center justify-between gap-2.5">
                <div className="flex flex-col text-left min-w-0">
                  <h3 className="text-base sm:text-[17px] font-bold text-[#111827] truncate leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#6b7280] font-normal truncate mt-0.5">
                    {member.role}
                  </p>
                </div>

                {/* Circular Action Button with ArrowUpRight */}
                <div className="w-8 h-8 rounded-full bg-[#FFF1F2] border border-rose-100 flex items-center justify-center text-[#e11d48] shrink-0 group-hover:bg-[#e11d48] group-hover:text-white transition-all duration-200 shadow-2xs">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
