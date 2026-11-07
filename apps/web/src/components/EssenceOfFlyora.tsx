"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

/**
 * All copy and content for the About section.
 */
export const ABOUT_SECTION_DATA = {
  collage: {
    mainPhoto: {
      src: "/images/about/hero-planner.jpg",
      alt: "Flyora travel planner curating personalized destination itinerary",
    },
    itineraryCard: {
      tag: "WHAT WE DO",
      duration: "SINCE 2014",
      destination: "FLYORA TOURS",
      days: [
        { num: "01", text: "Holiday packages, India and abroad" },
        { num: "02", text: "Flight tickets and hotel stays" },
        { num: "03", text: "Visa and travel support" },
      ],
      handwrittenNote: "Tell us where. We'll do the rest!",
    },
    polaroid: {
      src: "/images/about/flyora-team.jpg",
      alt: "The Flyora travel planning team collaborating on custom journeys",
      caption: "Connect with Flyora",
    },
    stamp: {
      topText: "FLYORA TOURS & TRAVELS LLP",
      bottomText: "TRUSTED TRAVEL PARTNER",
      sinceLabel: "SINCE",
      year: "2014",
      ariaLabel:
        "Flyora Tours & Travels LLP - Trusted Travel Partner Since 2014",
    },
  },
  heroText: {
    headlinePrefix: "We plan your trip like a friend who's",
    headlineAccent: "been there.",
    headlineSuffix: "",
    paragraphs: [
      "Flyora is a travel company that plans holidays for real people. We put together tour packages, flight tickets and hotel stays, in India and all over the world, built around you.",
      "No confusing booking sites. No guesswork. You talk to one real person who plans your whole trip, and who picks up the phone until you're back home safe.",
    ],
    statRow: {
      number: "10",
      plus: "+",
      description:
        "years of helping families, couples and friends travel across India and the world.",
    },
    ctaPrimary: {
      label: "Plan my trip",
    },
    ctaSecondary: {
      label: "Meet the people planning your trip",
      href: "/about",
      avatars: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      ],
    },
  },
};

export interface EssenceOfFlyoraProps {
  onOpenEnquiry?: (serviceId?: string) => void;
}

export function EssenceOfFlyora({ onOpenEnquiry }: EssenceOfFlyoraProps) {
  const d = ABOUT_SECTION_DATA;

  return (
    <section
      id="essence-of-flyora"
      aria-label="About Flyora"
      className="relative w-full bg-[var(--about-bg,#ffffff)] text-[var(--about-navy,#0A192F)] pt-[88px] pb-[96px] px-6 sm:px-10 lg:px-[105px] selection:bg-[var(--about-accent,#002f89)] selection:text-white"
      style={{
        ["--about-bg" as string]: "#ffffff",
        ["--about-navy" as string]: "#0A192F",
        ["--about-body" as string]: "#4A5568",
        ["--about-muted" as string]: "#6A788A",
        ["--about-accent" as string]: "#002f89",
        ["--about-border" as string]: "#E2E8F0",
        ["--about-card" as string]: "#ffffff",
      }}
    >
      {/* Anchor helper for #about so both #about and #essence-of-flyora work */}
      <span id="about" className="sr-only" aria-hidden="true" />

      {/* Scoped CSS for Grid Areas, Motions & Custom Typography */}
      <style>{`
        /* CSS Grid Areas for small screens vs desktop */
        .about-editorial-grid {
          display: grid;
          grid-template-areas:
            "headline"
            "collage"
            "text";
          row-gap: 32px;
        }

        @media (min-width: 640px) {
          .about-editorial-grid {
            row-gap: 40px;
          }
        }

        @media (min-width: 1024px) {
          .about-editorial-grid {
            grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
            column-gap: 88px;
            row-gap: 0;
            grid-template-areas:
              "collage   headline"
              "collage   text";
            align-items: center;
          }
        }

        .about-grid-headline {
          grid-area: headline;
        }

        .about-grid-collage {
          grid-area: collage;
        }

        .about-grid-text {
          grid-area: text;
        }

        /* Collage Motion Stagger */
        @keyframes collageFadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .collage-item-1 {
          animation: collageFadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 0ms;
        }
        .collage-item-2 {
          animation: collageFadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 80ms;
        }
        .collage-item-3 {
          animation: collageFadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 160ms;
        }
        .collage-item-4 {
          animation: collageFadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 240ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .collage-item-1,
          .collage-item-2,
          .collage-item-3,
          .collage-item-4 {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Container aligned with other homepage sections (px-6 sm:px-10 lg:px-[105px]) */}
      <div className="w-full">
        <div className="about-editorial-grid">
          {/* =================================================================
              1. HEADLINE (h2):
              56px, line-height 1.04, letter-spacing -0.02em, weight 400
              Below 640px: 38px
              Bracketed words are italic in the accent color
              ================================================================= */}
          <div className="about-grid-headline lg:self-end">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#1E1A17] tracking-tight leading-[1.12]">
              {d.heroText.headlinePrefix}{" "}
              <span className="italic text-[#002f89] font-normal">
                {d.heroText.headlineAccent}
              </span>
              {d.heroText.headlineSuffix ? ` ${d.heroText.headlineSuffix}` : ""}
            </h2>
          </div>

          {/* =================================================================
              3. COLLAGE (Left Column on Desktop):
              position: relative, aspect-ratio 1 / 1.1 (1 / 1.4 below 640px)
              flex: 6, max-width: 620px
              Children placed with percentages
              ================================================================= */}
          <div className="about-grid-collage w-full max-w-[620px] mx-auto lg:mx-0">
            <div className="relative w-full aspect-[1/1.4] sm:aspect-[1/1.2] lg:aspect-[1/1.1]">
              {/* a) Main Photo: left 0, top 0, width 68% (72% on mobile), aspect-ratio 4/5, radius 4px */}
              <div className="collage-item-1 absolute left-0 top-0 w-[72%] sm:w-[68%] aspect-[4/5] rounded-[4px] overflow-hidden bg-neutral-100 border border-[var(--about-border)] z-10">
                <img
                  src={d.collage.mainPhoto.src}
                  alt={d.collage.mainPhoto.alt}
                  className="w-full h-full object-cover select-none"
                  loading="eager"
                />
              </div>

              {/* b) Itinerary card: right 0, top 5%, width 44% (56% on mobile), rotate(2.5deg), white, 1px border, radius 3px */}
              <div className="collage-item-2 absolute right-0 top-[5%] w-[56%] sm:w-[44%] rotate-[2.5deg] bg-white border border-[var(--about-border)] rounded-[3px] shadow-[0_22px_30px_-22px_rgba(10,25,47,0.45)] z-20 p-3.5 sm:p-[18px_16px_16px]">
                {/* Top row: WHAT WE DO & SINCE 2014, matching site mono eyebrows */}
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-[#7A7167] font-medium mb-1.5">
                  <span>{d.collage.itineraryCard.tag}</span>
                  <span>{d.collage.itineraryCard.duration}</span>
                </div>

                {/* Destination / Title: FLYORA TOURS matching site heading font */}
                <div className="font-serif text-lg sm:text-xl font-medium text-[#1E1A17] tracking-tight leading-tight mb-2.5 sm:mb-3">
                  {d.collage.itineraryCard.destination}
                </div>

                {/* Three rows with accent numerals, hairline between rows and last one dashed */}
                <div className="space-y-1.5 sm:space-y-2 border-t border-black/[0.08] pt-2 text-[12px] sm:text-[12.5px]">
                  {d.collage.itineraryCard.days.map((day, idx) => {
                    const isLast =
                      idx === d.collage.itineraryCard.days.length - 1;
                    return (
                      <div
                        key={day.num}
                        className={`flex items-baseline gap-2 ${
                          idx > 0
                            ? isLast
                              ? "border-t border-dashed border-black/[0.1] pt-1.5 sm:pt-2"
                              : "border-t border-black/[0.08] pt-1.5 sm:pt-2"
                            : ""
                        }`}
                      >
                        <span className="text-[#002f89] font-serif font-semibold text-xs sm:text-sm shrink-0">
                          {day.num}
                        </span>
                        <span className="text-[#5C534A] text-xs sm:text-[13px] leading-snug whitespace-nowrap">
                          {day.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Handwritten note at 21px, rotate(-2deg), in dark ink-blue */}
                <div className="font-handwritten text-[18px] sm:text-[21px] text-[#1E3A8A] -rotate-[2deg] mt-2.5 sm:mt-3 leading-tight pl-0.5 select-none">
                  {d.collage.itineraryCard.handwrittenNote}
                </div>
              </div>

              {/* c) Polaroid: right 0, bottom 0, width 46% (54% on mobile), rotate(-3deg), white frame padding 8px 8px 36px, image 5/4 */}
              <div className="collage-item-3 absolute right-0 bottom-0 w-[54%] sm:w-[46%] -rotate-[3deg] bg-white border border-[var(--about-border)] rounded-[2px] shadow-[0_16px_36px_-12px_rgba(10,25,47,0.3)] z-30 p-2 pb-8 sm:pb-9">
                {/* Tape strip: 60x20px, rgba(226,196,140,.72), rotate(4deg) top-center */}
                <div
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-[60px] h-[20px] bg-[rgba(226,196,140,0.72)] rotate-[4deg] pointer-events-none z-10 shadow-2xs"
                  aria-hidden="true"
                />

                {/* Image 5/4 */}
                <div className="w-full aspect-[5/4] overflow-hidden rounded-[1px] bg-neutral-100">
                  <img
                    src={d.collage.polaroid.src}
                    alt={d.collage.polaroid.alt}
                    className="w-full h-full object-cover select-none"
                    loading="lazy"
                  />
                </div>

                {/* Handwritten caption bottom-left */}
                <div className="absolute bottom-2 left-2.5 font-handwritten text-[14px] sm:text-[16px] text-neutral-800 leading-none select-none">
                  {d.collage.polaroid.caption}
                </div>
              </div>

              {/* d) Seal: overlapping bottom-left of photo, ~150px wide on desktop, 110px on mobile */}
              <div className="collage-item-4 absolute -left-2 sm:left-[2%] top-[60%] sm:top-[66%] lg:top-[68%] w-[110px] sm:w-[135px] lg:w-[150px] aspect-square select-none z-40 drop-shadow-[0_10px_25px_rgba(10,25,47,0.18)]">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full text-[var(--about-accent,#002f89)]"
                  role="img"
                  aria-label={d.collage.stamp.ariaLabel}
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <defs>
                    {/* Top arc: clockwise for readable curved header */}
                    <path
                      id="sealTopPath"
                      d="M 26.5,100 A 73.5,73.5 0 0,1 173.5,100"
                      fill="none"
                    />
                    {/* Bottom arc: counter-clockwise so bottom text stands upright */}
                    <path
                      id="sealBottomPath"
                      d="M 34.5,100 A 65.5,65.5 0 0,0 165.5,100"
                      fill="none"
                    />

                    {/* 5-point star */}
                    <polygon
                      id="sealStar"
                      points="0,-3.5 1.08,-1.1 3.5,-1.1 1.54,0.34 2.3,2.75 0,1.25 -2.3,2.75 -1.54,0.34 -3.5,-1.1 -1.08,-1.1"
                      fill="currentColor"
                    />
                    {/* Mini star for center rule */}
                    <polygon
                      id="miniStar"
                      points="0,-2.5 0.77,-0.78 2.5,-0.78 1.1,0.24 1.64,1.96 0,0.89 -1.64,1.96 -1.1,0.24 -2.5,-0.78 -0.77,-0.78"
                      fill="currentColor"
                    />
                  </defs>

                  <g transform="rotate(-9 100 100)">
                    {/* 0. Solid white backing circle so seal is 100% visible and pops over photo */}
                    <circle cx="100" cy="100" r="95" fill="#ffffff" />

                    {/* 1. Outer thick ring */}
                    <circle
                      cx="100"
                      cy="100"
                      r="94"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.2"
                    />

                    {/* 2. Dotted line running all the way around between the two rings */}
                    <circle
                      cx="100"
                      cy="100"
                      r="88.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeDasharray="1.8 3.2"
                      strokeLinecap="round"
                    />

                    {/* 3. Thin inner ring of outer border */}
                    <circle
                      cx="100"
                      cy="100"
                      r="83"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />

                    {/* 4. Innermost ring enclosing center */}
                    <circle
                      cx="100"
                      cy="100"
                      r="55"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />

                    {/* 5. Top Curve Text: FLYORA TOURS & TRAVELS LLP */}
                    <text
                      fill="currentColor"
                      className="font-sans font-extrabold"
                      fontSize="8.2"
                      letterSpacing="1.6"
                    >
                      <textPath
                        href="#sealTopPath"
                        xlinkHref="#sealTopPath"
                        startOffset="50%"
                        textAnchor="middle"
                      >
                        {d.collage.stamp.topText}
                      </textPath>
                    </text>

                    {/* 6. Bottom Curve Text: TRUSTED TRAVEL PARTNER */}
                    <text
                      fill="currentColor"
                      className="font-sans font-extrabold"
                      fontSize="8.2"
                      letterSpacing="1.8"
                    >
                      <textPath
                        href="#sealBottomPath"
                        xlinkHref="#sealBottomPath"
                        startOffset="50%"
                        textAnchor="middle"
                      >
                        {d.collage.stamp.bottomText}
                      </textPath>
                    </text>

                    {/* 7. Separator stars at 9 o'clock and 3 o'clock */}
                    <g transform="translate(27, 100)">
                      <use href="#sealStar" xlinkHref="#sealStar" />
                    </g>
                    <g transform="translate(173, 100)">
                      <use href="#sealStar" xlinkHref="#sealStar" />
                    </g>

                    {/* CENTER OF THE SEAL */}
                    {/* Wing symbol from logo at top-center */}
                    <g
                      transform="translate(87.5, 53) scale(0.05)"
                      fill="currentColor"
                    >
                      <path d="M 0,2 C 16,110 98,340 288,495 C 330,440 430,300 498,218 C 390,224 210,170 0,2 Z" />
                      <path d="M 52,510 L 280,510 C 235,465 195,435 154,411 Z" />
                    </g>

                    {/* Thin line with small star above SINCE */}
                    <line
                      x1="67"
                      y1="83"
                      x2="93"
                      y2="83"
                      stroke="currentColor"
                      strokeWidth="0.8"
                    />
                    <g transform="translate(100, 83)">
                      <use href="#miniStar" xlinkHref="#miniStar" />
                    </g>
                    <line
                      x1="107"
                      y1="83"
                      x2="133"
                      y2="83"
                      stroke="currentColor"
                      strokeWidth="0.8"
                    />

                    {/* Under it, in serif font: SINCE */}
                    <text
                      x="100"
                      y="97"
                      textAnchor="middle"
                      fill="currentColor"
                      className="font-display-serif font-medium"
                      fontSize="9.2"
                      letterSpacing="2.2"
                    >
                      {d.collage.stamp.sinceLabel}
                    </text>

                    {/* Under that, large, in serif font: 2014 */}
                    <text
                      x="100"
                      y="119"
                      textAnchor="middle"
                      fill="currentColor"
                      className="font-display-serif font-normal"
                      fontSize="22.5"
                      letterSpacing="-0.5"
                    >
                      {d.collage.stamp.year}
                    </text>

                    {/* Thin line with small star below 2014, closing the center */}
                    <line
                      x1="67"
                      y1="127"
                      x2="93"
                      y2="127"
                      stroke="currentColor"
                      strokeWidth="0.8"
                    />
                    <g transform="translate(100, 127)">
                      <use href="#miniStar" xlinkHref="#miniStar" />
                    </g>
                    <line
                      x1="107"
                      y1="127"
                      x2="133"
                      y2="127"
                      stroke="currentColor"
                      strokeWidth="0.8"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* =================================================================
              4. PARAGRAPH + CTAs (Right Column on Desktop):
              18px / 1.7, max-width 60ch, 28px below h2
              CTA row 36px below, gap 20px 28px
              Primary button: navy bg, light text, radius 4px, height 52px, 0 24px, 16px weight 500
              Secondary link: 3 overlapping 34px avatars, underlined text
              ================================================================= */}
          <div className="about-grid-text lg:self-start lg:mt-7">
            {/* Supporting Paragraphs */}
            <div className="space-y-3.5 text-sm sm:text-base md:text-[17px] leading-relaxed text-[#5C534A] max-w-[60ch]">
              {d.heroText.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* In-line STAT ROW with Button moved horizontally next to 10 years */}
            <div className="my-7 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                  <div className="font-serif text-5xl sm:text-6xl font-normal leading-none tracking-tight text-[#1E1A17] shrink-0">
                    {d.heroText.statRow.number}
                    <span className="text-[#002f89] font-normal">
                      {d.heroText.statRow.plus}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-[#5C534A] leading-relaxed max-w-[260px]">
                    {d.heroText.statRow.description}
                  </p>
                </div>

                {/* Primary Button: moved horizontally next to 10 years, matching navbar button color (#002f89) & rounded-md */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenEnquiry
                      ? onOpenEnquiry(d.heroText.ctaPrimary.label)
                      : undefined
                  }
                  className="w-full sm:w-auto shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 rounded-md bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white text-xs sm:text-[12.5px] font-sans font-semibold uppercase tracking-[0.12em] inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002f89] focus-visible:ring-offset-2"
                >
                  <span>{d.heroText.ctaPrimary.label}</span>
                  <ArrowRight
                    className="w-4 h-4 stroke-[2]"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
