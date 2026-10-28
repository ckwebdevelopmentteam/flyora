"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface AboutCuratorsProps {
  data: AboutPageData["curators"];
  onOpenEnquiry?: () => void;
}

export const AboutCurators: React.FC<AboutCuratorsProps> = ({
  data,
  onOpenEnquiry,
}) => {
  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2] border-y border-black/[0.05]">
      <div className="container-standard">
        {/* Top Centered Pill Action matching reference */}
        <div className="flex justify-center mb-6">
          <Link
            href={data.topAction.href}
            className="group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white hover:bg-stone-50 border border-black/[0.08] text-[#2C241E] text-xs font-sans font-medium tracking-wide shadow-2xs transition-colors"
          >
            <span>{data.topAction.label}</span>
            <span className="w-5 h-5 rounded-full bg-[#1C1815] text-white flex items-center justify-center transition-transform group-hover:scale-105">
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-black/[0.06] text-[#6B6156] text-[10.5px] font-sans font-medium uppercase tracking-[0.2em] mb-4">
            <span className="text-[9px] text-[#463D34]">♥</span>
            <span>{data.eyebrow}</span>
            <span className="text-[9px] text-[#463D34]">♥</span>
          </div>

          <h2 className="font-serif text-[32px] sm:text-[42px] font-normal tracking-tight text-[#1C1815]">
            {data.heading}
          </h2>
        </div>

        {/* 4 Portrait Cards Grid matching Reference Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {data.items.map((curator) => (
            <div
              key={curator.id}
              className="flex flex-col items-center text-center group"
            >
              {/* Rounded Portrait Frame */}
              <div className="relative h-[290px] sm:h-[320px] w-full rounded-[28px] overflow-hidden border border-black/[0.07] bg-[#EFE9DF] shadow-xs group-hover:shadow-md transition-shadow duration-300">
                <Image
                  src={curator.image}
                  alt={curator.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Name & Role */}
              <h3 className="font-serif text-[21px] font-normal text-[#1C1815] mt-4">
                {curator.name}
              </h3>
              <p className="text-xs text-[#7A7167] mt-0.5">{curator.role}</p>

              {/* Specialties Pill Badges */}
              <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                {curator.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-sans uppercase tracking-wider text-[#6B6156] bg-white px-2.5 py-1 rounded-full border border-black/[0.06]"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Connect link */}
              <button
                type="button"
                onClick={() => onOpenEnquiry && onOpenEnquiry()}
                className="mt-3 text-[11px] font-medium text-[#463D34] hover:underline cursor-pointer"
              >
                Plan with {curator.name.split(" ")[0]} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
