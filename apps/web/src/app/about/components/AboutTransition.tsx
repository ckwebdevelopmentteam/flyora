"use client";

import React from "react";
import type { AboutPageData } from "../aboutData";

interface AboutTransitionProps {
  data: AboutPageData["transitionStatement"];
}

export const AboutTransition: React.FC<AboutTransitionProps> = ({ data }) => {
  return (
    <section className="py-20 sm:py-28 bg-[#FDFCFB] text-center border-t border-black/[0.04]">
      <div className="container-standard">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow with Hearts matching reference: ♥ A GENTLE PLACE TO BEGIN ♥ */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-black/[0.06] text-[#6B6156] text-[11px] font-sans font-medium uppercase tracking-[0.2em] mb-6">
            <span className="text-[9px] text-[#463D34]">♥</span>
            <span>{data.eyebrow}</span>
            <span className="text-[9px] text-[#463D34]">♥</span>
          </div>

          {/* Large Two-Tone Editorial Serif Heading */}
          <h2 className="font-serif text-[34px] sm:text-[46px] lg:text-[54px] font-normal tracking-[-0.015em] text-[#1C1815] leading-[1.14]">
            {data.headingPart1}{" "}
            <span className="text-[#8C8276] font-light">
              {data.headingPart2}
            </span>
          </h2>

          {/* Supporting paragraph */}
          <p className="mt-5 text-[15px] sm:text-[17px] text-[#5C534A] font-light leading-relaxed max-w-xl mx-auto">
            {data.description}
          </p>
        </div>
      </div>
    </section>
  );
};
