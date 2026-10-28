"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface AboutCTAProps {
  data: AboutPageData["pricingAndCta"];
  onOpenEnquiry?: (serviceId?: string) => void;
}

export const AboutCTA: React.FC<AboutCTAProps> = ({ data, onOpenEnquiry }) => {
  const [billingPeriod, setBillingPeriod] = useState<"standard" | "vip">(
    "standard",
  );

  return (
    <section className="py-20 sm:py-28 lg:py-36 bg-[#FDFCFB] relative">
      <div className="container-standard">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-black/[0.06] text-[#6B6156] text-[10.5px] font-sans font-medium uppercase tracking-[0.2em] mb-4">
            <span className="text-[9px] text-[#463D34]">♥</span>
            <span>{data.eyebrow}</span>
            <span className="text-[9px] text-[#463D34]">♥</span>
          </div>

          <h2 className="font-serif text-[34px] sm:text-[44px] font-normal tracking-tight text-[#1C1815]">
            {data.heading}
          </h2>

          <p className="mt-3 text-[15px] sm:text-[16px] text-[#5C534A] font-light leading-relaxed">
            {data.description}
          </p>

          {/* Minimal Toggle matching reference pill selector */}
          <div className="mt-6 inline-flex items-center p-1 rounded-full bg-[#FAF7F2] border border-black/[0.06]">
            <button
              type="button"
              onClick={() => setBillingPeriod("standard")}
              className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition cursor-pointer ${
                billingPeriod === "standard"
                  ? "bg-white text-[#1C1815] shadow-2xs"
                  : "text-[#7A7167] hover:text-black"
              }`}
            >
              Custom Journeys
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("vip")}
              className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition cursor-pointer ${
                billingPeriod === "vip"
                  ? "bg-[#1C1815] text-white shadow-2xs"
                  : "text-[#7A7167] hover:text-black"
              }`}
            >
              VIP Concierge
            </button>
          </div>
        </div>

        {/* 3 Transparent Planning Cards matching reference: First Step / Most Popular / Ongoing Care */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {data.tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-[28px] p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 border ${
                tier.isPopular
                  ? "bg-[#181E24] text-white border-[#181E24] shadow-xl md:-translate-y-2"
                  : "bg-white text-[#1C1815] border-black/[0.07] shadow-xs hover:shadow-md"
              }`}
            >
              <div>
                {/* Badge */}
                {tier.badge && (
                  <div className="inline-block mb-4">
                    <span
                      className={`text-[10px] font-sans font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
                        tier.isPopular
                          ? "bg-amber-300 text-[#1C1815]"
                          : "bg-[#FAF7F2] text-[#6B6156] border border-black/[0.06]"
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                )}

                <h3
                  className={`font-serif text-[24px] font-normal ${
                    tier.isPopular ? "text-white" : "text-[#1C1815]"
                  }`}
                >
                  {tier.title}
                </h3>

                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    tier.isPopular ? "text-white/80" : "text-[#7A7167]"
                  }`}
                >
                  {tier.subtitle}
                </p>

                {/* Price Display */}
                <div className="mt-6 pb-6 border-b border-black/[0.08] dark:border-white/10">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-3xl font-light font-serif tracking-tight ${
                        tier.isPopular ? "text-white" : "text-[#1C1815]"
                      }`}
                    >
                      {tier.priceEstimate}
                    </span>
                    <span
                      className={`text-xs ${
                        tier.isPopular ? "text-white/60" : "text-[#8C8276]"
                      }`}
                    >
                      / {tier.unit}
                    </span>
                  </div>
                </div>

                {/* Highlights List */}
                <ul className="mt-6 space-y-3">
                  {tier.highlights.map((highlight, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2.5 text-xs font-light"
                    >
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 ${
                          tier.isPopular ? "text-amber-300" : "text-[#463D34]"
                        }`}
                      />
                      <span
                        className={
                          tier.isPopular ? "text-white/90" : "text-[#4A423B]"
                        }
                      >
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Action Button */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => onOpenEnquiry && onOpenEnquiry(tier.title)}
                  className={`w-full group py-3 px-5 rounded-full text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition cursor-pointer ${
                    tier.isPopular
                      ? "bg-white text-[#1C1815] hover:bg-stone-100"
                      : "bg-[#1C1815] text-white hover:bg-[#352E27]"
                  }`}
                >
                  <span>Select {tier.title.split(" ")[0]}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Closing Action Links (Signature Black Tomato Hot Pink & Secondary Link) */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-4 text-center">
          <button
            type="button"
            onClick={() =>
              onOpenEnquiry && onOpenEnquiry("Custom Travel Inquiry")
            }
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#EC1C54] hover:bg-[#d6174a] text-white text-xs font-spartan font-bold uppercase tracking-[0.18em] shadow-[0_10px_25px_-5px_rgba(236,28,84,0.4)] transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>ENQUIRE NOW</span>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </span>
          </button>

          <Link
            href={data.closingCta.href}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-stone-50 border border-black/15 text-[#1C1815] text-xs font-spartan font-bold uppercase tracking-[0.16em] shadow-xs transition cursor-pointer"
          >
            <span>{data.closingCta.label}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
