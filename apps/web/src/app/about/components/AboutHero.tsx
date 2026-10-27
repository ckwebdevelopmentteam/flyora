"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass, Sparkles, MapPin } from "lucide-react";
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
    <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-28">
      {/* Soft atmospheric ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#EFEAE2]/60 via-[#F7F4EE]/40 to-transparent rounded-full blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="container-standard">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center order-2 lg:order-1">
            {/* Minimal Eyebrow Badge inspired by reference */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/90 border border-black/[0.07] shadow-2xs mb-5 sm:mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#463D34]" />
              <span className="text-[10.5px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[#5C534A]">
                {data.eyebrow}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#463D34]" />
            </div>

            {/* Editorial Serif Heading */}
            <h1 className="font-serif text-[38px] sm:text-[50px] lg:text-[58px] xl:text-[66px] font-normal tracking-[-0.015em] text-[#1C1815] leading-[1.08] sm:leading-[1.06]">
              {data.heading}
            </h1>

            {/* Supporting Editorial Paragraph */}
            <p className="mt-5 sm:mt-6 text-[15px] sm:text-[17px] text-[#5C534A] font-light leading-relaxed max-w-xl">
              {data.description}
            </p>

            {/* Dual Action Buttons */}
            <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href={data.primaryCta.href}
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#463D34] hover:bg-[#352E27] active:bg-[#2B2520] text-white text-[12px] sm:text-[13px] font-sans font-medium uppercase tracking-[0.14em] transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer group"
              >
                <span>{data.primaryCta.label}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <a
                href={data.secondaryCta.href}
                onClick={handleScrollToStory}
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/80 hover:bg-white border border-black/[0.12] hover:border-[#463D34] text-[#38312B] hover:text-[#1C1815] text-[12px] sm:text-[13px] font-sans font-medium uppercase tracking-[0.14em] transition-all duration-200 cursor-pointer shadow-2xs"
              >
                <Compass className="w-4 h-4 text-[#7A7167]" />
                <span>{data.secondaryCta.label}</span>
              </a>
            </div>

            {/* Discerning Traveler Social Proof Strip */}
            <div className="mt-10 sm:mt-12 pt-7 border-t border-black/[0.06] flex items-center gap-4">
              <div className="flex -space-x-2.5 overflow-hidden">
                {data.socialProof.avatars.map((avatar, idx) => (
                  <div
                    key={idx}
                    className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white overflow-hidden shadow-2xs"
                  >
                    <Image
                      src={avatar}
                      alt={`Discerning traveler ${idx + 1}`}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs sm:text-[13px] text-[#6B6156] leading-tight">
                <span className="font-semibold text-[#1C1815]">
                  {data.socialProof.count}
                </span>{" "}
                {data.socialProof.label}
              </div>
            </div>
          </div>

          {/* Right Column: Immersive Travel Visual */}
          <div className="lg:col-span-6 xl:col-span-6 order-1 lg:order-2">
            <div className="relative group">
              {/* Outer decorative halo */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#E6DFD5] to-transparent rounded-[32px] sm:rounded-[44px] -z-10 opacity-70 blur-xs" />

              {/* Main Image Frame with Smooth Rounded Curvature */}
              <div className="relative h-[380px] sm:h-[480px] lg:h-[560px] xl:h-[600px] w-full rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] overflow-hidden border border-black/[0.08] shadow-[0_20px_60px_-15px_rgba(70,61,52,0.16)] bg-[#F5EFEB]">
                <Image
                  src={data.image.src}
                  alt={data.image.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />

                {/* Subtle vignette gradient for caption readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                {/* Editorial Location Stamp */}
                {data.image.caption && (
                  <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-xs">
                    <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="text-xs font-light tracking-wide">
                      {data.image.caption}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
