"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface AboutValuesProps {
  data: AboutPageData["values"];
}

export const AboutValues: React.FC<AboutValuesProps> = ({ data }) => {
  const [activeAccordion, setActiveAccordion] = useState<string>(
    data.items[0]?.id || "value-1",
  );

  return (
    <section className="py-20 sm:py-28 lg:py-36 bg-[#FDFCFB] relative">
      <div className="container-standard">
        {/* Section Header: Minimalist Editorial Center */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-black/[0.06] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#463D34]" />
            <span className="text-[10.5px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[#5C534A]">
              {data.eyebrow}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#463D34]" />
          </div>

          <h2 className="font-serif text-[32px] sm:text-[44px] lg:text-[50px] font-normal tracking-tight text-[#1C1815] leading-[1.12]">
            {data.heading}
          </h2>

          <p className="mt-4 text-[15px] sm:text-[17px] text-[#5C534A] font-light leading-relaxed max-w-xl mx-auto">
            {data.supportingText}
          </p>
        </div>

        {/* 3 Editorial Value Cards with Restrained Typography and Dividers */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 md:grid-cols-3 border-y border-black/[0.08] divide-y md:divide-y-0 md:divide-x divide-black/[0.08]">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="py-10 sm:py-12 px-4 sm:px-8 lg:px-10 flex flex-col justify-between group hover:bg-[#FAF7F2]/50 transition-colors duration-300"
            >
              <div>
                <span className="font-mono text-xs sm:text-[13px] tracking-widest text-[#9C9286] font-medium block">
                  /{item.number}
                </span>

                <h3 className="font-serif text-[22px] sm:text-[24px] font-normal text-[#1C1815] mt-3 group-hover:text-[#463D34] transition-colors">
                  {item.title}
                </h3>

                <p className="mt-3 text-[14px] sm:text-[15px] text-[#5C534A] font-light leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.highlight && (
                <div className="mt-8 pt-4 border-t border-black/[0.04] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#463D34] shrink-0" />
                  <span className="text-[11.5px] font-medium tracking-wide text-[#463D34]">
                    {item.highlight}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reference-Inspired Editorial Focus: Interactive Value Accordion + Companion Image */}
        <div className="mt-16 sm:mt-20 pt-12 border-t border-black/[0.06]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Minimal Accordion (Inspired by the Reference's Clean Accordion) */}
            <div className="lg:col-span-7 space-y-3">
              {data.items.map((item) => {
                const isOpen = activeAccordion === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl transition-all duration-300 overflow-hidden border ${
                      isOpen
                        ? "bg-[#2A241F] text-white border-[#2A241F] shadow-md"
                        : "bg-white text-[#1C1815] border-black/[0.06] hover:border-black/[0.12]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(isOpen ? "" : item.id)}
                      className="w-full py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span
                          className={`font-mono text-xs tracking-wider shrink-0 ${
                            isOpen ? "text-amber-300" : "text-[#8C8276]"
                          }`}
                        >
                          /{item.number}
                        </span>
                        <span
                          className={`font-serif text-[17px] sm:text-[19px] ${
                            isOpen ? "font-normal text-white" : "text-[#1C1815]"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-white" : "text-[#8C8276]"
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-5 pt-0 text-[13.5px] sm:text-[14.5px] text-[#C9C2BA] font-light leading-relaxed animate-in fade-in duration-200">
                        <p>{item.description}</p>
                        {item.detail && (
                          <p className="mt-2 text-[12.5px] text-[#A69E94]">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Complementary Visual Image */}
            <div className="lg:col-span-5">
              <div className="relative h-[280px] sm:h-[340px] lg:h-[380px] w-full rounded-[24px] sm:rounded-[30px] overflow-hidden border border-black/[0.08] shadow-sm bg-[#EFE9DF]">
                <Image
                  src={data.companionImage.src}
                  alt={data.companionImage.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 text-white text-xs font-light tracking-wide bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                  {data.companionImage.caption}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
