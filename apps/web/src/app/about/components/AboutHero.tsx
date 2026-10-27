"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface AboutHeroProps {
  data: AboutPageData["hero"];
}

export const AboutHero: React.FC<AboutHeroProps> = ({ data }) => {
  const handleScrollToStory = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("our-story");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Big Full-Width Hero Container with Smooth Bottom Curvature */}
      <div className="relative w-full min-h-[640px] sm:min-h-[720px] lg:min-h-[800px] flex items-center pb-24 sm:pb-32 pt-8 sm:pt-12">
        {/* Full-Width Background Travel Image (Airplane above golden clouds, no people) */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={data.image.src}
            alt={data.image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] select-none scale-100"
          />
        </div>

        {/* Sophisticated Editorial Vignette & Gradient Overlays */}
        {/* Left directional tint for high typography contrast */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#171412]/90 via-[#171412]/60 to-[#171412]/20 -z-10"
          aria-hidden="true"
        />
        {/* Top subtle fade to harmonize with navbar */}
        <div
          className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent -z-10"
          aria-hidden="true"
        />
        {/* Bottom soft cloud fade transitioning into the pure white canvas */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 sm:h-52 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB]/90 to-transparent -z-10"
          aria-hidden="true"
        />

        {/* Container with Standard Max-Width & Padding */}
        <div className="container-standard relative z-10 w-full">
          <div className="max-w-2xl lg:max-w-3xl">
            {/* Minimal Pill Eyebrow with Hearts matching the reference: ♥ ABOUT US · YOUR JOURNEY, OUR PASSION ♥ */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white/95 text-[11px] sm:text-[11.5px] font-sans font-medium uppercase tracking-[0.18em] shadow-sm mb-6 sm:mb-7">
              <span className="text-[10px] text-amber-200">♥</span>
              <span>{data.eyebrow}</span>
              <span className="text-[10px] text-amber-200">♥</span>
            </div>

            {/* Breathtaking Editorial Heading */}
            <h1 className="font-serif text-[42px] sm:text-[58px] lg:text-[70px] xl:text-[78px] font-normal tracking-[-0.015em] text-white leading-[1.06] drop-shadow-xs">
              {data.heading}
            </h1>

            {/* Supporting Description */}
            <p className="mt-5 sm:mt-6 text-[16px] sm:text-[18px] lg:text-[19px] text-white/90 font-light leading-relaxed max-w-xl">
              {data.description}
            </p>

            {/* Dual Pill CTA Buttons matching Reference (Solid with Circle Arrow Badge + Frosted Outline) */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <Link
                href={data.primaryCta.href}
                className="group inline-flex items-center gap-2.5 pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2.5 sm:py-3 rounded-full bg-white hover:bg-stone-100 active:bg-stone-200 text-[#1C1815] text-[12px] sm:text-[13px] font-sans font-medium tracking-wide shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>{data.primaryCta.label}</span>
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1C1815] text-white flex items-center justify-center transition-transform group-hover:scale-105">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>

              <a
                href={data.secondaryCta.href}
                onClick={handleScrollToStory}
                className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/35 backdrop-blur-md text-white text-[12px] sm:text-[13px] font-sans font-medium tracking-wide transition-all duration-200 cursor-pointer"
              >
                <span>{data.secondaryCta.label}</span>
              </a>
            </div>

            {/* Social Proof Strip with 4 Avatars */}
            <div className="mt-10 sm:mt-12 flex items-center gap-3 sm:gap-4">
              <div className="flex -space-x-2.5 overflow-hidden">
                {data.socialProof.avatars.map((avatar, idx) => (
                  <div
                    key={idx}
                    className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white/80 overflow-hidden shadow-sm"
                  >
                    <Image
                      src={avatar}
                      alt={`Traveler ${idx + 1}`}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs sm:text-[13px] text-white/85 font-light leading-snug">
                Join{" "}
                <span className="font-semibold text-white">
                  {data.socialProof.count}
                </span>{" "}
                {data.socialProof.label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
