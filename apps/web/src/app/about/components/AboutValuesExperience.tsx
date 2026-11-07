"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
  useRobotoFlex,
  ProximityLetters,
} from "@/components/ui/variable-text-proximity";
import type { AboutPageData } from "../aboutData";

interface AboutValuesExperienceProps {
  approach: AboutPageData["approach"];
  curators?: AboutPageData["curators"];
  onOpenEnquiry?: (serviceId?: string) => void;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

interface StageState {
  opacity: number;
  filter: string;
  transform: string;
  pointerEvents: "auto" | "none";
}

const computeLightStage = (
  progress: number,
  enterStart: number,
  enterEnd: number,
  holdEnd: number,
  lagTransitionEnd: number,
  lagEnd: number,
  exitEnd: number,
): StageState => {
  if (progress < enterStart) {
    return {
      opacity: 0,
      filter: "none",
      transform: "translateY(28px)",
      pointerEvents: "none",
    };
  }

  if (progress < enterEnd) {
    const t =
      enterEnd > enterStart
        ? (progress - enterStart) / (enterEnd - enterStart)
        : 1;
    return {
      opacity: t,
      filter: "none",
      transform: `translateY(${(1 - t) * 28}px)`,
      pointerEvents: t > 0.8 ? "auto" : "none",
    };
  }

  if (progress <= holdEnd) {
    return {
      opacity: 1,
      filter: "none",
      transform: "translateY(0px)",
      pointerEvents: "auto",
    };
  }

  // First scroll: Lag state ("not gone full half shodow colour less")
  if (progress <= lagTransitionEnd) {
    const t = (progress - holdEnd) / (lagTransitionEnd - holdEnd);
    return {
      opacity: 1 - t * 0.45,
      filter: `grayscale(${t * 0.45}) brightness(${1 - t * 0.18}) contrast(${1 - t * 0.1})`,
      transform: `translateY(${-t * 14}px)`,
      pointerEvents: "none",
    };
  }

  // Lag hold: Stays visible for comfortable scroll before next section
  if (progress <= lagEnd) {
    return {
      opacity: 0.55,
      filter: "grayscale(0.45) brightness(0.82) contrast(0.9)",
      transform: "translateY(-14px)",
      pointerEvents: "none",
    };
  }

  // Second scroll: Exiting as next section enters
  if (progress <= exitEnd) {
    const t = (progress - lagEnd) / (exitEnd - lagEnd);
    return {
      opacity: Math.max(0, 0.55 * (1 - t)),
      filter: "grayscale(0.45) brightness(0.82) contrast(0.9)",
      transform: `translateY(${-14 - t * 24}px)`,
      pointerEvents: "none",
    };
  }

  return {
    opacity: 0,
    filter: "none",
    transform: "translateY(-38px)",
    pointerEvents: "none",
  };
};

export const AboutValuesExperience: React.FC<AboutValuesExperienceProps> = ({
  approach,
  curators,
  onOpenEnquiry,
}) => {
  useRobotoFlex();
  const sectionRef = useRef<HTMLElement>(null);
  const missionStageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeItem, setActiveItem] = useState(approach.items[0]?.id ?? "");

  useEffect(() => {
    let frameId = 0;

    const updateProgress = () => {
      const section = sectionRef.current;
      if (!section) return;

      const bounds = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      setProgress(clamp(-bounds.top / travel));
    };

    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Carefully calibrated 2-scroll rhythm with lag hold:
  // - Scene 1 ("OUR MISSION"): enters 0.0 to 0.04, holds 0.04 to 0.18, 1st scroll lags to 0.33, 2nd scroll exits to 0.40
  // - Scene 2 ("HOW WE PLAN OUR JOURNEYS"): enters 0.33, holds 0.41 to 0.55, 1st scroll lags to 0.69, 2nd scroll exits to 0.76
  // - Scene 3 ("OUR VALUES"): enters 0.70, header settles, then 3 cards stagger in from 0.76 to 0.94 and hold stable!
  const missionStage = computeLightStage(
    progress,
    0,
    0.04,
    0.18,
    0.25,
    0.33,
    0.4,
  );
  const journeyStage = computeLightStage(
    progress,
    0.33,
    0.41,
    0.55,
    0.62,
    0.69,
    0.76,
  );
  const valuesHeaderOpacity = clamp((progress - 0.7) / 0.07);
  const cards = approach.items.slice(0, 3);

  // Subtle parallax lag transforms for Scene 2
  const scene2ImageLag = (progress - 0.48) * -35;
  const scene2TextLag = (progress - 0.48) * -15;

  const values = [
    {
      prefix: "BE",
      title: "CURIOUS",
      subtitle: "The world is always worth discovering",
      body: "We listen closely, ask better questions, and design journeys around what will make your time away feel truly your own.",
      accent: "#B86A3B",
    },
    {
      prefix: "BE",
      title: "THOUGHTFUL",
      subtitle: "Every detail has a purpose",
      body: "From the first conversation to the final journey home, we take care of the details that make travel feel effortless.",
      accent: "#D8B596",
    },
    {
      prefix: "BE",
      title: "PRESENT",
      subtitle: "Make room for the moments that matter",
      body: "We create the structure, then leave space for connection, surprise, and memories that stay with you long after you return.",
      accent: "#E6D8CA",
    },
  ];

  return (
    <section ref={sectionRef} className="relative h-[900vh] bg-[#F9F8F4]">
      <div className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden bg-[#F9F8F4] text-[#29231F]">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/about/whitebgourvalues.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div
          ref={missionStageRef}
          className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center transition-[opacity,transform,filter] duration-300 ease-out"
          style={{
            opacity: missionStage.opacity,
            filter: missionStage.filter,
            transform: missionStage.transform,
            pointerEvents: missionStage.pointerEvents,
          }}
          aria-hidden={missionStage.opacity < 0.05}
        >
          <div className="max-w-5xl w-full">
            <h2 className="font-heading text-[30px] font-bold uppercase leading-[1.18] tracking-[0.07em] sm:text-[43px] lg:text-[57px] text-[#29231F]">
              <ProximityLetters
                label="OUR MISSION IS TO CREATE REMARKABLE JOURNEYS THAT THOUGHTFULLY CONNECT OUR TRAVELERS TO THE WORLD, INSPIRING THEM TO EXPLORE WITH CURIOSITY, CONFIDENCE AND WONDER."
                fromFontVariationSettings="'wght' 400, 'opsz' 14, 'slnt' 0"
                toFontVariationSettings="'wght' 900, 'opsz' 48, 'slnt' 0"
                containerRef={missionStageRef}
                radius={130}
                falloff="gaussian"
                wordColors={{
                  THOUGHTFULLY: "#4FAF9F",
                  CURIOSITY: "#B86A3B",
                  CONFIDENCE: "#397FB0",
                }}
                style={{
                  fontFamily:
                    '"Roboto Flex", ui-sans-serif, system-ui, sans-serif',
                }}
              />
            </h2>
          </div>
        </div>

        {/* Scene 2: HOW WE PLAN OUR JOURNEYS (On the white/light background) */}
        <div
          className="absolute inset-0 z-10 grid grid-rows-[42%_58%] transition-[opacity,transform,filter] duration-300 ease-out lg:grid-cols-2 lg:grid-rows-1"
          style={{
            opacity: journeyStage.opacity,
            filter: journeyStage.filter,
            transform: journeyStage.transform,
            pointerEvents: journeyStage.pointerEvents,
          }}
          aria-hidden={journeyStage.opacity < 0.05}
        >
          <div className="relative overflow-hidden">
            <div
              className="relative w-full h-full transition-transform duration-300 ease-out"
              style={{
                transform: `scale(1.08) translateY(${scene2ImageLag}px)`,
                willChange: "transform",
              }}
            >
              <Image
                src="/about/flyora_about_travel_photo.png"
                alt="Traveler on a mountain peak admiring the sunset over scenic coastal bays and islands"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              {/* Soft atmospheric gradient blending into #F9F8F4 on white background */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#F9F8F4] via-[#F9F8F4]/50 to-transparent pointer-events-none hidden lg:block"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F9F8F4] to-transparent pointer-events-none lg:hidden"
                aria-hidden="true"
              />
            </div>
          </div>

          <div
            className="flex min-h-0 items-center overflow-y-auto px-6 py-8 sm:px-10 lg:px-[12%] transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${scene2TextLag}px)`,
              willChange: "transform",
            }}
          >
            <div className="w-full max-w-xl">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#002f89] sm:text-[11px]">
                {approach.eyebrow}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.15] tracking-tight text-[#1C1815]">
                {approach.heading}
              </h2>

              <div className="mt-6 border-t border-black/10">
                {approach.items.map((item) => {
                  const isOpen = activeItem === item.id;

                  return (
                    <div key={item.id} className="border-b border-black/10">
                      <button
                        type="button"
                        onClick={() => setActiveItem(isOpen ? "" : item.id)}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold tracking-[0.12em] text-[#B86A3B]">
                            /{item.number}
                          </span>
                          <span className="text-[14px] font-medium sm:text-[15px] text-[#1C1815]">
                            {item.title}
                          </span>
                        </span>
                        <ChevronDown
                          className={
                            "h-4 w-4 shrink-0 text-stone-500 transition-transform duration-300 " +
                            (isOpen ? "rotate-180" : "")
                          }
                        />
                      </button>
                      {isOpen && (
                        <p className="max-w-lg pb-4 text-[13px] leading-relaxed text-[#6B6156] sm:text-[14px]">
                          {item.fullDesc}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto px-4 py-8 transition-[opacity,transform] duration-300 ease-out sm:px-8 lg:px-12"
          style={{
            opacity: valuesHeaderOpacity,
            pointerEvents: valuesHeaderOpacity > 0.8 ? "auto" : "none",
          }}
          aria-hidden={valuesHeaderOpacity < 0.05}
        >
          <div className="mx-auto w-full max-w-7xl my-auto">
            <p className="font-serif text-[52px] font-bold leading-none tracking-tight text-[#4FAF9F] sm:text-[76px] lg:text-[96px]">
              Our Values
            </p>
            <p className="mt-3 max-w-3xl text-[14px] font-semibold uppercase leading-[1.45] tracking-[0.15em] text-[#002f89] sm:text-[16px]">
              The three principles that guide every Flyora journey, from the
              first idea to the journey home.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3 lg:mt-10 lg:gap-7">
              {values.map((value, index) => {
                const cardOpacity = clamp(
                  (progress - (0.76 + index * 0.06)) / 0.06,
                );

                return (
                  <article
                    key={value.title}
                    className="min-h-[275px] bg-[#002f89] p-7 text-[#F9F5EF] shadow-[0_18px_40px_rgba(0,47,137,0.18)] transition-[opacity,transform] duration-300 ease-out sm:p-8"
                    style={{
                      opacity: cardOpacity,
                      transform: "translateY(" + (1 - cardOpacity) * 32 + "px)",
                    }}
                  >
                    <p
                      className="text-[12px] font-bold tracking-[0.16em]"
                      style={{ color: value.accent }}
                    >
                      {value.prefix}
                    </p>
                    <h3
                      className="mt-1 font-heading text-[40px] font-bold uppercase leading-none tracking-[0.04em] sm:text-[48px]"
                      style={{ color: value.accent }}
                    >
                      {value.title}
                    </h3>
                    <p className="mt-5 text-[13px] font-bold uppercase tracking-[0.12em] text-white">
                      {value.subtitle}
                    </p>
                    <p className="mt-3 text-[14px] leading-relaxed text-[#F9F5EF]/80">
                      {value.body}
                    </p>
                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D8B596]">
                      {cards[index]?.title}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
