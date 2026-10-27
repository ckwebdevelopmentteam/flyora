"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface AboutTestimonialsProps {
  data: AboutPageData["testimonials"];
}

export const AboutTestimonials: React.FC<AboutTestimonialsProps> = ({
  data,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? data.items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === data.items.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2] border-t border-black/[0.05]">
      <div className="container-standard">
        {/* Section Header with Left Heading and Right Navigation Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-black/[0.06] text-[#6B6156] text-[10.5px] font-sans font-medium uppercase tracking-[0.2em] mb-3">
              <span className="text-[9px] text-[#463D34]">♥</span>
              <span>{data.eyebrow}</span>
              <span className="text-[9px] text-[#463D34]">♥</span>
            </div>

            <h2 className="font-serif text-[32px] sm:text-[42px] font-normal tracking-tight text-[#1C1815]">
              {data.heading}
            </h2>

            <p className="mt-2 text-xs sm:text-[13px] text-[#7A7167]">
              {data.subtitle}
            </p>
          </div>

          {/* Navigation Arrows matching reference: (←) (→) */}
          <div className="flex items-center gap-2 self-start sm:self-end">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="w-9 h-9 rounded-full bg-white hover:bg-stone-100 border border-black/[0.1] flex items-center justify-center text-[#1C1815] transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="w-9 h-9 rounded-full bg-[#1C1815] hover:bg-[#352E27] text-white flex items-center justify-center transition cursor-pointer shadow-2xs"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Testimonials Cards Grid matching reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[26px] p-7 sm:p-8 border border-black/[0.06] shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
            >
              <div>
                {/* Quotation mark & Category pill */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-serif text-3xl text-[#463D34] leading-none select-none">
                    “
                  </span>
                  <span className="text-[10px] font-sans uppercase tracking-wider text-[#6B6156] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-black/[0.05]">
                    {item.category}
                  </span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-[14px] text-[#4A423B] font-light leading-relaxed">
                  {item.quote}
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-8 pt-5 border-t border-black/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#1C1815]">
                    {item.author}
                  </h3>
                  <p className="text-[11px] text-[#7A7167]">
                    {item.role} · {item.location}
                  </p>
                </div>
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-black/[0.08] shrink-0">
                  <Image
                    src={item.avatar}
                    alt={item.author}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
