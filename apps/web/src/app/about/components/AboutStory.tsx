"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles, UserCheck } from "lucide-react";
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
      className="py-16 sm:py-24 lg:py-32 bg-[#FAF7F2] border-y border-black/[0.05] relative scroll-mt-24"
    >
      <div className="container-standard">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left Column: Story, Philosophy & Compact Statistics */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center">
            {/* Minimal Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white border border-black/[0.06] shadow-2xs mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#463D34]" />
              <span className="text-[10.5px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[#5C534A]">
                {data.eyebrow}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#463D34]" />
            </div>

            {/* Editorial Heading */}
            <h2 className="font-serif text-[32px] sm:text-[42px] lg:text-[48px] font-normal tracking-[-0.015em] text-[#1C1815] leading-[1.12]">
              {data.heading}
            </h2>

            {/* Story Paragraphs */}
            <div className="mt-6 space-y-4 text-[15px] sm:text-[16px] text-[#5C534A] font-light leading-relaxed">
              {data.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Compact Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onOpenEnquiry && onOpenEnquiry("Custom Holidays")
                }
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#463D34] hover:bg-[#352E27] active:bg-[#2B2520] text-white text-[11.5px] sm:text-[12px] font-sans font-medium uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer shadow-xs group"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{data.primaryCta.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <Link
                href={data.secondaryCta.href}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white hover:bg-[#F2ECE4] border border-black/[0.1] text-[#38312B] text-[11.5px] sm:text-[12px] font-sans font-medium uppercase tracking-[0.12em] transition-all duration-200 shadow-2xs"
              >
                <span>{data.secondaryCta.label}</span>
              </Link>
            </div>

            {/* 3 Compact Statistics with Elegant Dividers */}
            <div className="mt-12 sm:mt-14 pt-8 border-t border-black/[0.08]">
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                {data.stats.map((stat, idx) => (
                  <div
                    key={stat.id}
                    className={`flex flex-col ${
                      idx !== 0
                        ? "pl-3 sm:pl-6 border-l border-black/[0.08]"
                        : ""
                    }`}
                  >
                    <span className="font-serif text-[28px] sm:text-[38px] lg:text-[42px] font-light text-[#1C1815] leading-none tracking-tight">
                      {stat.value}
                    </span>
                    <span className="mt-2 text-[11px] sm:text-xs text-[#7A7167] font-sans uppercase tracking-wider line-clamp-2">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Developer / Client Content Note */}
              <p className="mt-4 text-[10px] text-[#A69E94] font-mono tracking-wider uppercase">
                * Illustrative preliminary metrics — customizable in
                aboutData.ts
              </p>
            </div>
          </div>

          {/* Right Column: Travel Consultant Photo with Smooth Curvature */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="relative group">
              {/* Backing accent frame */}
              <div className="absolute -inset-2 bg-[#EFE9DF] rounded-[32px] sm:rounded-[40px] -z-10 transition-transform group-hover:scale-[1.01]" />

              <div className="relative h-[420px] sm:h-[500px] lg:h-[560px] w-full rounded-[26px] sm:rounded-[34px] overflow-hidden border border-black/[0.06] shadow-[0_20px_50px_rgba(70,61,52,0.1)] bg-[#F5EFEB]">
                <Image
                  src={data.image.src}
                  alt={data.image.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Editorial Caption Tag */}
                {data.image.caption && (
                  <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] text-[#2C241E] shadow-2xs">
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
