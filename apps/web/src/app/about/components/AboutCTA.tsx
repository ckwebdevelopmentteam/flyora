"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface AboutCTAProps {
  data: AboutPageData["cta"];
  onOpenEnquiry?: () => void;
}

export const AboutCTA: React.FC<AboutCTAProps> = ({ data, onOpenEnquiry }) => {
  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-[#FDFCFB] relative overflow-hidden">
      <div className="container-standard">
        {/* Subtle, restrained card frame with soft champagne backdrop */}
        <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#F7F2EC] border border-black/[0.06] p-8 sm:p-14 lg:p-20 text-center shadow-xs overflow-hidden">
          {/* Subtle ambient light rings */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-white/80 to-transparent rounded-full blur-2xl -z-10"
            aria-hidden="true"
          />

          <div className="max-w-2xl mx-auto flex flex-col items-center">
            {/* Minimal Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-black/[0.06] shadow-2xs mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#463D34]" />
              <span className="text-[10.5px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[#5C534A]">
                {data.eyebrow}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#463D34]" />
            </div>

            {/* Serif Heading */}
            <h2 className="font-serif text-[34px] sm:text-[46px] lg:text-[54px] font-normal tracking-tight text-[#1C1815] leading-[1.12]">
              {data.heading}
            </h2>

            {/* Supporting Description */}
            <p className="mt-4 sm:mt-5 text-[15px] sm:text-[17px] text-[#5C534A] font-light leading-relaxed max-w-xl">
              {data.description}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href={data.primaryCta.href}
                className="inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#463D34] hover:bg-[#352E27] active:bg-[#2B2520] text-white text-[12px] sm:text-[13px] font-sans font-medium uppercase tracking-[0.14em] transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer group"
              >
                <span>{data.primaryCta.label}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <button
                type="button"
                onClick={() => onOpenEnquiry && onOpenEnquiry()}
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-white hover:bg-[#EFEAE2] border border-black/[0.1] text-[#38312B] text-[12px] sm:text-[13px] font-sans font-medium uppercase tracking-[0.14em] transition-all duration-200 cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-[#7A7167]" />
                <span>{data.secondaryCta.label}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
