"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface AboutApproachProps {
  data: AboutPageData["approach"];
}

export const AboutValues: React.FC<AboutApproachProps> = ({ data }) => {
  const [activeItem, setActiveItem] = useState<string>(
    data.items[0]?.id || "approach-1",
  );

  return (
    <section className="py-20 sm:py-28 lg:py-36 bg-white relative">
      <div className="container-standard">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-black/[0.06] text-[#6B6156] text-[10.5px] font-sans font-medium uppercase tracking-[0.2em] mb-4">
            <span className="text-[9px] text-[#463D34]">♥</span>
            <span>{data.eyebrow}</span>
            <span className="text-[9px] text-[#463D34]">♥</span>
          </div>

          <h2 className="font-serif text-[32px] sm:text-[44px] lg:text-[48px] font-normal tracking-tight text-[#1C1815] leading-[1.12]">
            {data.heading}
          </h2>
        </div>

        {/* 2-Column Layout matching Reference: Left Numbered Accordion, Right Portrait Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Numbered Items / Accordion */}
          <div className="lg:col-span-7 space-y-2.5">
            {data.items.map((item) => {
              const isOpen = activeItem === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl transition-all duration-300 overflow-hidden border ${
                    isOpen
                      ? "bg-[#181E24] text-white border-[#181E24] shadow-md"
                      : "bg-[#FAF7F2]/70 text-[#1C1815] border-black/[0.06] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveItem(isOpen ? "" : item.id)}
                    className="w-full py-4 sm:py-4.5 px-5 sm:px-6 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span
                        className={`font-mono text-xs tracking-wider shrink-0 ${
                          isOpen ? "text-amber-300" : "text-[#7A7167]"
                        }`}
                      >
                        /{item.number}
                      </span>
                      <span
                        className={`text-[15px] sm:text-[17px] ${
                          isOpen
                            ? "font-normal text-white"
                            : "font-normal text-[#1C1815]"
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-white" : "text-[#7A7167]"
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-0 text-[13.5px] sm:text-[14.5px] text-white/80 font-light leading-relaxed animate-in fade-in duration-200">
                      <p>{item.fullDesc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Serene Rounded Visual */}
          <div className="lg:col-span-5">
            <div className="relative h-[340px] sm:h-[400px] lg:h-[440px] w-full rounded-[28px] sm:rounded-[36px] overflow-hidden border border-black/[0.07] shadow-sm bg-[#EFE9DF]">
              <Image
                src={data.companionImage.src}
                alt={data.companionImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 text-white text-xs font-light tracking-wide bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                {data.companionImage.caption}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
