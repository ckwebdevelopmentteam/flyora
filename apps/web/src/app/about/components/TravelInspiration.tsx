"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass, MapPin } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface TravelInspirationProps {
  data: AboutPageData["inspiration"];
}

export const TravelInspiration: React.FC<TravelInspirationProps> = ({
  data,
}) => {
  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-[#FAF7F2] relative">
      <div className="container-standard">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 sm:pb-14">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.06] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#463D34]" />
              <span className="text-[10.5px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[#5C534A]">
                {data.eyebrow}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#463D34]" />
            </div>

            <h2 className="font-serif text-[32px] sm:text-[42px] lg:text-[46px] font-normal tracking-tight text-[#1C1815] leading-[1.12]">
              {data.heading}
            </h2>

            <p className="mt-3 text-[15px] sm:text-[16px] text-[#5C534A] font-light leading-relaxed">
              {data.supportingText}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-stone-100 border border-black/[0.1] text-xs font-sans font-medium uppercase tracking-[0.14em] text-[#38312B] transition-colors shadow-2xs group"
            >
              <Compass className="w-3.5 h-3.5 text-[#7A7167]" />
              <span>Browse Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Cinematic Wide Image Frame */}
        <div className="relative h-[340px] sm:h-[460px] lg:h-[560px] w-full rounded-[24px] sm:rounded-[36px] overflow-hidden border border-black/[0.08] shadow-[0_20px_50px_rgba(70,61,52,0.12)] bg-[#E6DFD5] group">
          <Image
            src={data.image.src}
            alt={data.image.alt}
            fill
            sizes="100vw"
            className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />

          {/* Floating Location Pill */}
          <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white shadow-sm">
            <MapPin className="w-4 h-4 text-amber-300" />
            <span className="text-xs sm:text-sm font-light tracking-wide">
              {data.image.locationTag}
            </span>
          </div>

          {/* Destination Highlights Pill Strip */}
          <div className="hidden sm:flex absolute bottom-8 right-8 items-center gap-2">
            {data.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[11px] font-sans uppercase tracking-wider text-white/90 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
