"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface AboutHeroProps {
  data: AboutPageData["hero"];
  onOpenEnquiry?: (serviceId?: string) => void;
}

export const AboutHero: React.FC<AboutHeroProps> = ({
  data,
  onOpenEnquiry,
}) => {
  const handleScrollToStory = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("our-story");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* =========================================================================
          SECTION 1: THE SIGNATURE BLACK TOMATO DEEP SLATE-BLUE HEADER BANNER
          ========================================================================= */}
      <div className="relative w-full bg-[#144A72] text-white pt-20 sm:pt-28 lg:pt-36 pb-36 sm:pb-48 lg:pb-64 overflow-hidden">
        {/* Subtle Topographical Elevation Contour Lines SVG Background */}
        <div
          className="absolute inset-0 pointer-events-none select-none opacity-25"
          aria-hidden="true"
        >
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 1440 600"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-50 120C280 60 550 220 920 140C1220 70 1420 180 1550 120"
              stroke="#5BC3A6"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <path
              d="M-50 180C300 110 580 270 960 190C1260 120 1450 230 1550 170"
              stroke="#5BC3A6"
              strokeWidth="1.5"
            />
            <path
              d="M-50 240C320 160 610 320 1000 240C1300 170 1480 280 1550 220"
              stroke="white"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
            <path
              d="M-50 300C340 210 640 370 1040 290C1340 220 1510 330 1550 270"
              stroke="white"
              strokeWidth="1.2"
              strokeOpacity="0.3"
            />
            <path
              d="M-50 360C360 260 670 420 1080 340C1380 270 1530 380 1550 320"
              stroke="#5BC3A6"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
            <path
              d="M-50 420C380 310 700 470 1120 390C1420 320 1550 430 1550 370"
              stroke="white"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />
            <path
              d="M-50 480C400 360 730 520 1160 440C1460 370 1570 480 1550 420"
              stroke="#5BC3A6"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
          </svg>
        </div>

        {/* Ambient Radial Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#0F3958]/50 via-transparent to-[#0A263B]/60 pointer-events-none"
          aria-hidden="true"
        />

        {/* Header Grid Content matching Screenshot */}
        <div className="container-standard relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Top Left: Gigantic Mint-Green Display Typography */}
            <div className="lg:col-span-6 xl:col-span-5">
              <span className="block font-spartan font-extrabold text-[58px] sm:text-[84px] lg:text-[104px] xl:text-[118px] text-[#5BC3A6] leading-[0.95] tracking-tight uppercase select-none">
                ABOUT US
              </span>
            </div>

            {/* Top Right: Tagline Eyebrow + Bold White Condensed Heading */}
            <div className="lg:col-span-6 xl:col-span-7 lg:pt-2">
              <div className="text-[#5BC3A6] text-xs sm:text-[13px] font-spartan font-bold tracking-[0.25em] uppercase mb-3">
                YOUR JOURNEY, OUR PASSION
              </div>

              {/* Exact Headline from Screenshot */}
              <h2 className="font-spartan font-extrabold text-2xl sm:text-3xl lg:text-[42px] xl:text-[46px] text-white tracking-tight leading-[1.1] uppercase">
                AWARD-WINNING CREATORS OF REMARKABLE TRAVEL EXPERIENCES
              </h2>

              {/* Accessible H1 & Core Value for Search / Tests */}
              <h1 className="text-white/80 text-sm sm:text-base font-light leading-relaxed mt-4 max-w-xl">
                {data.heading} {data.description}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: THE SIGNATURE OVERLAPPING PHOTO & "WHAT WE'RE ABOUT" SECTION
          ========================================================================= */}
      <div className="relative w-full bg-white pt-0 pb-16 sm:pb-24 lg:pb-28">
        <div className="container-standard relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">
            {/* Left Column: Overlapping Vertical Mountain Card breaking through the Blue Canvas */}
            <div className="lg:col-span-6 xl:col-span-5 -mt-28 sm:-mt-36 lg:-mt-52">
              <div className="relative w-full max-w-[480px] mx-auto lg:mx-0 aspect-[3/4] rounded-sm overflow-hidden shadow-[0_25px_60px_-15px_rgba(20,74,114,0.4)] border-2 border-white/80 bg-[#0E3553] group">
                <Image
                  src={data.image.src || "/about/mountain-hero.jpg"}
                  alt={
                    data.image.alt ||
                    "Award-winning creators of remarkable travel experiences"
                  }
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Subtle dark gradient overlay at bottom of photo */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                {/* Caption badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90 text-xs font-spartan tracking-wider uppercase">
                  <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    Remarkable Horizons
                  </span>
                  <span className="text-[11px] text-[#5BC3A6] font-bold">
                    Flyora Bespoke
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: "WHAT WE'RE ABOUT" Exact Copy from Screenshot */}
            <div className="lg:col-span-6 xl:col-span-7 pt-4 sm:pt-6 lg:pt-8">
              {/* Eyebrow */}
              <div className="text-xs sm:text-[13px] font-spartan font-bold tracking-[0.25em] text-[#111111] uppercase mb-3">
                WHAT WE&apos;RE ABOUT
              </div>

              {/* Exact Bold Condensed Heading from Screenshot */}
              <h2 className="font-spartan font-extrabold text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] text-[#111111] leading-[1.06] tracking-tight uppercase">
                WE&apos;RE A TEAM OF PEOPLE IN THE KNOW ABOUT TRAVEL
              </h2>

              {/* Exact Mission Statement from Screenshot */}
              <p className="mt-6 text-base sm:text-lg lg:text-[19px] text-[#222222] font-normal leading-relaxed">
                And we&apos;re on a mission to create remarkable experiences
                that thoughtfully connect our clients to the world and inspire
                them to explore it with curiosity, humility and a sense of
                wonder.
              </p>

              {/* Supporting narrative */}
              <div className="mt-4 space-y-3 text-[14.5px] sm:text-[15.5px] text-[#555555] font-light leading-relaxed">
                <p>
                  Discovering the world should feel inspiring, deeply personal,
                  and effortless. We sweep aside off-the-shelf templates to
                  shape each expedition around how you want to feel.
                </p>
                <p>
                  Whether it&apos;s private aviation charters across remote
                  alpine ranges, secluded coastal retreats, or rare after-hours
                  cultural access, our curators engineer seamless door-to-door
                  discovery.
                </p>
              </div>

              {/* Dual Action Buttons featuring Black Tomato Signature Hot Pink Button */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 sm:gap-4">
                {/* Hot Pink "ENQUIRE NOW" Button */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenEnquiry
                      ? onOpenEnquiry("Custom Travel Inquiry")
                      : undefined
                  }
                  className="group inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#EC1C54] hover:bg-[#d6174a] active:bg-[#b8123e] text-white text-xs sm:text-[13px] font-spartan font-bold uppercase tracking-[0.18em] shadow-[0_10px_25px_-5px_rgba(236,28,84,0.4)] hover:shadow-[0_14px_30px_-5px_rgba(236,28,84,0.55)] transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>ENQUIRE NOW</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </button>

                {/* Match with Advisor Button */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenEnquiry ? onOpenEnquiry("Travel Advisor") : undefined
                  }
                  className="inline-flex items-center justify-center px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-white hover:bg-stone-50 active:bg-stone-100 border border-black/20 text-[#111111] text-xs sm:text-[12.5px] font-spartan font-bold uppercase tracking-[0.16em] transition-all duration-200 cursor-pointer shadow-2xs"
                >
                  <span>Match With an Advisor</span>
                </button>

                {/* Text Links for Navigation */}
                <Link
                  href={data.primaryCta.href}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-spartan font-bold text-[#144A72] hover:text-[#EC1C54] uppercase tracking-wider underline underline-offset-4 ml-1 transition-colors"
                >
                  <span>{data.primaryCta.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={data.secondaryCta.href}
                  onClick={handleScrollToStory}
                  className="inline-flex items-center text-xs sm:text-[13px] font-spartan font-bold text-[#777777] hover:text-[#111111] uppercase tracking-wider ml-2 transition-colors"
                >
                  {data.secondaryCta.label}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
