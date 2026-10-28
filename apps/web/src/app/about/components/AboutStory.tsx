"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface AboutStoryProps {
  data: AboutPageData["story"];
  onOpenEnquiry?: (serviceId?: string) => void;
}

export const AboutStory: React.FC<AboutStoryProps> = ({
  data,
  onOpenEnquiry,
}) => {
  return (
    <section
      id="our-story"
      className="py-20 sm:py-28 lg:py-36 bg-white relative scroll-mt-20"
    >
      <div className="container-standard">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left Column: Who We Are Editorial Story */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center">
            {/* Minimal Eyebrow with Hearts matching the reference: ♥ WHO WE ARE ♥ */}
            <div className="inline-flex items-center gap-1.5 self-start px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-black/[0.06] text-[#6B6156] text-[11px] font-sans font-medium uppercase tracking-[0.2em] mb-5">
              <span className="text-[9px] text-[#463D34]">♥</span>
              <span>{data.eyebrow}</span>
              <span className="text-[9px] text-[#463D34]">♥</span>
            </div>

            {/* Editorial Heading */}
            <h2 className="font-serif text-[34px] sm:text-[44px] lg:text-[50px] font-normal tracking-[-0.015em] text-[#1C1815] leading-[1.12]">
              {data.heading}
            </h2>

            {/* Story Paragraphs */}
            <div className="mt-6 space-y-4 text-[15px] sm:text-[16.5px] text-[#5C534A] font-light leading-relaxed">
              {data.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Dual Action Buttons matching Reference (Meet Flyora ↗ & Schedule Now ↗) */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-3.5">
              <button
                type="button"
                onClick={() =>
                  onOpenEnquiry && onOpenEnquiry("Custom Holidays")
                }
                className="group inline-flex items-center gap-2 pl-5 pr-2 py-2 rounded-full bg-[#1C1815] hover:bg-[#352E27] active:bg-[#110E0C] text-white text-[12px] font-sans font-medium tracking-wide transition-all duration-200 cursor-pointer shadow-xs"
              >
                <span>{data.primaryCta.label}</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:scale-105">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                </span>
              </button>

              <Link
                href={data.secondaryCta.href}
                className="group inline-flex items-center gap-2 pl-5 pr-2 py-2 rounded-full bg-white hover:bg-[#FAF7F2] border border-black/[0.12] text-[#2C241E] text-[12px] font-sans font-medium tracking-wide transition-all duration-200 shadow-2xs"
              >
                <span>{data.secondaryCta.label}</span>
                <span className="w-6 h-6 rounded-full bg-black/[0.06] flex items-center justify-center transition-transform group-hover:scale-105">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#2C241E]" />
                </span>
              </Link>
            </div>

            {/* Compact Statistics matching the reference's exact 3-column layout */}
            <div className="mt-12 sm:mt-16 pt-8 border-t border-black/[0.06]">
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                {data.stats.map((stat) => (
                  <div key={stat.id} className="flex flex-col">
                    <span className="font-serif text-[32px] sm:text-[40px] lg:text-[46px] font-light text-[#1C1815] leading-none tracking-tight">
                      {stat.value}
                    </span>
                    <span className="mt-2 text-xs sm:text-[13px] text-[#7A7167] font-sans leading-tight">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Floating Rounded Card matching the Reference */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="relative group">
              {/* Floating heavy rounded container */}
              <div className="relative h-[420px] sm:h-[500px] lg:h-[580px] w-full rounded-[32px] sm:rounded-[42px] overflow-hidden border border-black/[0.06] shadow-[0_20px_50px_-10px_rgba(70,61,52,0.12)] bg-[#F5EFEB]">
                <Image
                  src={data.image.src}
                  alt={data.image.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

                {/* Editorial Caption Tag */}
                {data.image.caption && (
                  <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-black/[0.06] text-[#2C241E] shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-xs font-medium tracking-wide">
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
