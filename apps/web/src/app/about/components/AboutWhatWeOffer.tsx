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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface AboutWhatWeOfferProps {
  opacity: number;
  progress: number;
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
    label: "Curated Journeys",
    features: [
      {
        icon: Globe,
        title: "International Tour Packages",
        description:
          "Explore the world's best attractions like Dubai, Malaysia, Singapore, Thailand, Bali, and beyond.",
        badgeText: "100+ Destinations",
        accent: "#5BC3A6",
      },
      {
        icon: Sliders,
        title: "Customisation of Journey",
        description:
          "We always put you first. We help you customise tour packages according to your exact preferences.",
        badgeText: "Bespoke Itineraries",
        accent: "#F08B4C",
      },
      {
        icon: Compass,
        title: "Dream Destinations",
        description:
          "Tailor-made discovery shaped around how you want to feel, leaving nothing to generic templates.",
        badgeText: "Signature Curation",
        accent: "#7DB3D6",
      },
    ],
  },
  {
    value: "services",
    label: "Visa & Services",
    features: [
      {
        icon: ShieldCheck,
        title: "Visa Services",
        description:
          "Complete visa assistance and document support for over 100 countries, including UK, USA, Schengen, and more.",
        badgeText: "100+ Countries",
        accent: "#5BC3A6",
      },
      {
        icon: FileCheck,
        title: "Seamless Documentation",
        description:
          "Fast-track verification, compliance checks, and guided appointment coordination without the friction.",
        badgeText: "Hassle-Free",
        accent: "#7DB3D6",
      },
      {
        icon: Headphones,
        title: "24/7 Global Concierge",
        description:
          "Round-the-clock advisory, airport guidance, and dedicated support from start to journey's end.",
        badgeText: "Always Here",
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
        title: "350+ Travel Professionals",
        description:
          "Our strength lies in our team of 350+ wanderlust professionals, ensuring your travel is seamless and memorable.",
        badgeText: "Expert Curators",
        accent: "#5BC3A6",
      },
      {
        icon: Award,
        title: "2 Million+ Customers",
        description:
          "Our customers are our biggest strength. We have proudly served over 2 million travelers across 1,000+ international trips.",
        badgeText: "1,000+ Journeys",
        accent: "#F08B4C",
      },
      {
        icon: HeartHandshake,
        title: "Trusted Excellence",
        description:
          "Award-winning service benchmarks and verified global networks across five continents.",
        badgeText: "Verified Trust",
        accent: "#E5B869",
      },
    ],
  },
];

export const AboutWhatWeOffer: React.FC<AboutWhatWeOfferProps> = ({
  opacity,
}) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-[opacity,transform] duration-700 ease-out"
      style={{
        opacity,
        transform: `translateY(${(0.5 - opacity) * 30}px)`,
        pointerEvents: opacity > 0.8 ? "auto" : "none",
      }}
      aria-hidden={opacity < 0.05}
    >
      <div className="relative z-10 w-full max-w-5xl max-h-[92svh] overflow-y-auto scrollbar-none py-2 sm:py-4">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center">
          <p className="text-xs sm:text-[13px] font-spartan font-bold uppercase tracking-[0.25em] text-[#5BC3A6]">
            WHAT WE OFFER
          </p>

          <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-tight">
            Everything You Need for Remarkable Journeys
          </h2>

          <p className="mt-2 max-w-2xl text-[14px] sm:text-[15.5px] text-white/80 font-sans font-light leading-relaxed">
            The next time you plan a trip or need assistance with visa
            applications,{" "}
            <span className="font-semibold text-white">Flyora</span> is here for
            you. Let us fly together to your dream destinations.
          </p>
        </div>

        {/* Tabbed Categories */}
        <Tabs defaultValue="journeys" className="mt-6 sm:mt-8 w-full">
          <TabsList className="h-auto flex-wrap gap-1 rounded-xl bg-white/10 p-1 border border-white/10 backdrop-blur-md">
            {OFFER_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg px-4 sm:px-5 py-2 text-xs sm:text-sm font-sans font-medium uppercase tracking-wider text-white/75 data-[state=active]:bg-white data-[state=active]:text-[#1C1815] data-[state=active]:shadow-md transition-all cursor-pointer border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 data-[state=active]:border-none data-[state=active]:ring-0"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {OFFER_TABS.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="mt-5 sm:mt-6 w-full focus-visible:outline-none"
            >
              <div className="grid gap-3.5 sm:gap-4 md:grid-cols-3">
                {tab.features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={feature.title}
                      className="group relative flex flex-col justify-between rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 p-5 sm:p-6 transition-all duration-300 backdrop-blur-sm text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
                    >
                      <div>
                        {/* Top: Icon + Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={cn(
                              "flex size-11 items-center justify-center rounded-lg border border-white/10 transition-transform group-hover:scale-105 duration-300",
                            )}
                            style={{
                              backgroundColor: `${feature.accent}18`,
                              color: feature.accent,
                            }}
                          >
                            <Icon className="size-5" />
                          </div>

                          <span
                            className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-white/10"
                            style={{
                              backgroundColor: `${feature.accent}14`,
                              color: feature.accent,
                            }}
                          >
                            {feature.badgeText}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-heading text-base sm:text-lg font-bold uppercase tracking-wide text-white group-hover:text-[#5BC3A6] transition-colors mb-2">
                          {feature.title}
                        </h3>

                        <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-white/75 font-sans font-light">
                          {feature.description}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-white/50 group-hover:text-white/80 transition-colors">
                        <CheckCircle2
                          className="size-3.5"
                          style={{ color: feature.accent }}
                        />
                        <span className="font-sans text-[11px] uppercase tracking-wider">
                          Flyora Signature Service
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
