"use client";

import React from "react";
import {
  Globe,
  Sliders,
  Compass,
  ShieldCheck,
  FileCheck,
  Headphones,
  Users,
  Award,
  HeartHandshake,
  CheckCircle2,
  Plane,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface AboutWhatWeOfferProps {
  opacity?: number;
  progress?: number;
  filter?: string;
  transform?: string;
  pointerEvents?: "auto" | "none";
  isStatic?: boolean;
}

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badgeText: string;
  accent: string;
}

interface OfferTab {
  value: string;
  label: string;
  features: FeatureItem[];
}

const OFFER_TABS: OfferTab[] = [
  {
    value: "journeys",
    label: "Tours & Holidays",
    features: [
      {
        icon: Globe,
        title: "International & Domestic Tours",
        description:
          "Handpicked holiday packages covering top global escapes like Dubai, Bali, Europe, Thailand, and scenic domestic destinations.",
        badgeText: "100+ Destinations",
        accent: "#5BC3A6",
      },
      {
        icon: Sliders,
        title: "Customized Itineraries",
        description:
          "Bespoke holiday planning tailored to your exact pace, hotel preferences, private transfers, and unique style.",
        badgeText: "Bespoke Itineraries",
        accent: "#F08B4C",
      },
      {
        icon: Compass,
        title: "Signature Tourism & Stays",
        description:
          "Luxury resorts, overwater villas, scenic boutique stays, and curated excursions without generic templates.",
        badgeText: "Signature Curation",
        accent: "#7DB3D6",
      },
    ],
  },
  {
    value: "services",
    label: "Visas & Flights",
    features: [
      {
        icon: ShieldCheck,
        title: "Fast-Track Visa Assistance",
        description:
          "Complete visa filing, document audits, and express appointment booking for 100+ countries with 99.2% approval success.",
        badgeText: "100+ Countries",
        accent: "#5BC3A6",
      },
      {
        icon: Plane,
        title: "Global Flight Ticketing",
        description:
          "Commercial & corporate air ticketing with unpublished partner fares, optimal routing, and 24/7 flight rebooking support.",
        badgeText: "Best Airfares",
        accent: "#7DB3D6",
      },
      {
        icon: Headphones,
        title: "24/7 Travel & Concierge Desk",
        description:
          "Round-the-clock emergency support, flight schedule updates, and dedicated agency coordination from takeoff to return.",
        badgeText: "24/7 Dedicated",
        accent: "#E5B869",
      },
    ],
  },
  {
    value: "strength",
    label: "Why Flyora",
    features: [
      {
        icon: Users,
        title: "350+ Travel & Visa Specialists",
        description:
          "Our strength lies in our experienced visa officers, flight dispatchers, and holiday planners dedicated to your journey.",
        badgeText: "Certified Experts",
        accent: "#5BC3A6",
      },
      {
        icon: Award,
        title: "2 Million+ Satisfied Clients",
        description:
          "Trusted by over 2 million travelers across corporate delegations, family vacations, and sacred pilgrimages worldwide.",
        badgeText: "Proven Track Record",
        accent: "#F08B4C",
      },
      {
        icon: HeartHandshake,
        title: "Authorized Agency Trust",
        description:
          "Verified embassy documentation standards, accredited airline partners, and round-the-clock client advocacy.",
        badgeText: "Verified Trust",
        accent: "#E5B869",
      },
    ],
  },
];

export const AboutWhatWeOffer: React.FC<AboutWhatWeOfferProps> = ({
  opacity = 1,
  filter,
  transform,
  pointerEvents,
}) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-[opacity,transform,filter] duration-300 ease-out"
      style={{
        opacity,
        filter: filter || undefined,
        transform: transform || `translateY(${(0.5 - opacity) * 30}px)`,
        pointerEvents: pointerEvents || (opacity > 0.8 ? "auto" : "none"),
      }}
      aria-hidden={opacity < 0.05}
    >
      <div className="relative z-10 w-full max-w-5xl py-2 my-auto">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center">
          <p className="text-[10px] sm:text-xs font-spartan font-bold uppercase tracking-[0.25em] text-[#5BC3A6]">
            WHAT WE OFFER • COMPLETE AGENCY SOLUTIONS
          </p>

          <h2 className="mt-1.5 sm:mt-2.5 font-serif text-2xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-tight">
            End-to-End Solutions for Visas, Flights &amp; World Tours
          </h2>

          <p className="mt-1 sm:mt-2 max-w-2xl text-xs sm:text-[14.5px] text-white/80 font-sans font-light leading-relaxed line-clamp-2 sm:line-clamp-none">
            From expedited embassy visa approvals and best-fare air ticketing to
            bespoke holiday curation and round-the-clock advisory,{" "}
            <span className="font-semibold text-white">Flyora</span> is your
            dedicated full-service travel and tourism agency.
          </p>
        </div>

        {/* Tabbed Categories */}
        <Tabs defaultValue="journeys" className="mt-4 sm:mt-6 w-full">
          <TabsList className="h-auto flex-wrap gap-1 rounded-xl bg-white/10 p-1 border border-white/10 backdrop-blur-md">
            {OFFER_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg px-3.5 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-sm font-sans font-medium uppercase tracking-wider text-white/75 data-[state=active]:bg-white data-[state=active]:text-[#1C1815] data-[state=active]:shadow-md transition-all cursor-pointer border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 data-[state=active]:border-none data-[state=active]:ring-0"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {OFFER_TABS.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="mt-3.5 sm:mt-5 w-full focus-visible:outline-none"
            >
              <div className="flex md:grid md:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                {tab.features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={feature.title}
                      className="w-[78vw] max-w-[290px] shrink-0 snap-center md:w-auto md:max-w-none group relative flex flex-col justify-between rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 p-4 sm:p-5 transition-all duration-300 backdrop-blur-sm text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] min-h-[175px] sm:min-h-0"
                    >
                      <div>
                        {/* Top: Icon + Badge */}
                        <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                          <div
                            className={cn(
                              "flex size-9 sm:size-11 items-center justify-center rounded-lg border border-white/10 transition-transform group-hover:scale-105 duration-300",
                            )}
                            style={{
                              backgroundColor: `${feature.accent}18`,
                              color: feature.accent,
                            }}
                          >
                            <Icon className="size-4 sm:size-5" />
                          </div>

                          <span
                            className="text-[9.5px] sm:text-[11px] font-sans font-semibold tracking-wider uppercase px-2 sm:px-2.5 py-0.5 rounded-full border border-white/10"
                            style={{
                              backgroundColor: `${feature.accent}14`,
                              color: feature.accent,
                            }}
                          >
                            {feature.badgeText}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wide text-white group-hover:text-[#5BC3A6] transition-colors mb-1 sm:mb-1.5">
                          {feature.title}
                        </h3>

                        <p className="text-[12px] sm:text-[13px] leading-relaxed text-white/75 font-sans font-light line-clamp-3 sm:line-clamp-none">
                          {feature.description}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-xs text-white/50 group-hover:text-white/80 transition-colors">
                        <CheckCircle2
                          className="size-3 sm:size-3.5"
                          style={{ color: feature.accent }}
                        />
                        <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider">
                          Flyora Signature Service
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Mobile swipe helper pill */}
              <div className="flex md:hidden items-center justify-center gap-1 mt-1.5 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                <span>← Swipe to explore →</span>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
