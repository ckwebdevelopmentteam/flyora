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
import styles from "../AboutExperience.module.css";

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
    <section
      ref={sectionRef}
      className={`relative h-[520vh] lg:h-[900vh] bg-[#F9F8F4] ${styles.stageSection}`}
    >
      <div
        className={`sticky top-0 h-[100svh] min-h-0 lg:min-h-[640px] overflow-hidden bg-[#F9F8F4] text-[#29231F] ${styles.stageSticky}`}
      >
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/about/whitebgourvalues.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Scene 1: OUR MISSION */}
        <div
          ref={missionStageRef}
          className={`absolute inset-0 z-10 flex items-center justify-center px-6 text-center transition-[opacity,transform,filter] duration-300 ease-out ${styles.stageScene}`}
          style={{
            opacity: missionStage.opacity,
            filter: missionStage.filter,
            transform: missionStage.transform,
            pointerEvents: missionStage.pointerEvents,
          }}
          aria-hidden={missionStage.opacity < 0.05}
        >
          <div className="max-w-5xl w-full">
            <h2
              className={`font-heading text-xl sm:text-3xl lg:text-[57px] font-bold uppercase leading-[1.25] tracking-[0.05em] text-[#29231F] ${styles.missionText}`}
            >
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

        {/* Scene 2: HOW WE PLAN OUR JOURNEYS */}
        <div
          className={`absolute inset-0 z-10 flex lg:grid lg:grid-cols-2 lg:grid-rows-1 items-center justify-center transition-[opacity,transform,filter] duration-300 ease-out ${styles.stageScene}`}
          style={{
            opacity: journeyStage.opacity,
            filter: journeyStage.filter,
            transform: journeyStage.transform,
            pointerEvents: journeyStage.pointerEvents,
          }}
          aria-hidden={journeyStage.opacity < 0.05}
        >
          {/* Desktop Left Column: Image with Lag Transform */}
          <div className="hidden lg:block relative h-full w-full overflow-hidden border-r border-black/10">
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
                sizes="50vw"
                className="object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Right Column & Mobile View: Content & Accordion */}
          <div
            className="flex min-h-0 w-full items-center justify-center px-4 py-4 sm:px-10 lg:px-[12%] transition-transform duration-300 ease-out my-auto"
            style={{
              transform: `translateY(${scene2TextLag}px)`,
              willChange: "transform",
            }}
          >
            <div className="w-full max-w-xl">
              {/* Mobile Landscape Photo Banner */}
              <div className="block lg:hidden relative w-full h-28 sm:h-36 rounded-[14px] overflow-hidden mb-3 shadow-xs">
                <Image
                  src="/about/flyora_about_travel_photo.png"
                  alt="Traveler on a mountain peak admiring the sunset over scenic coastal bays and islands"
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>

              <p className="mb-1 sm:mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#002f89] sm:text-[11px]">
                {approach.eyebrow}
              </p>
              <h2 className="font-serif text-xl sm:text-3xl lg:text-[44px] font-bold leading-[1.15] tracking-tight text-[#1C1815]">
                {approach.heading}
              </h2>

              <div className="mt-3 sm:mt-5 border-t border-black/10">
                {approach.items.map((item) => {
                  const isOpen = activeItem === item.id;

                  return (
                    <div key={item.id} className="border-b border-black/10">
                      <button
                        type="button"
                        onClick={() => setActiveItem(isOpen ? "" : item.id)}
                        className="flex w-full items-center justify-between gap-3 py-2 sm:py-3 text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-[11px] font-semibold tracking-[0.12em] text-[#B86A3B]">
                            /{item.number}
                          </span>
                          <span className="text-[13px] font-medium sm:text-[15px] text-[#1C1815]">
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
                        <p className="max-w-lg pb-3 text-xs leading-relaxed text-[#6B6156] sm:text-[14px]">
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

        {/* Scene 3: OUR VALUES */}
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center px-4 py-4 sm:px-8 lg:px-12 transition-[opacity,transform] duration-300 ease-out ${styles.stageScene}`}
          style={{
            opacity: valuesHeaderOpacity,
            pointerEvents: valuesHeaderOpacity > 0.8 ? "auto" : "none",
          }}
          aria-hidden={valuesHeaderOpacity < 0.05}
        >
          <div className="mx-auto w-full max-w-7xl my-auto">
            <p className="font-serif text-3xl sm:text-6xl lg:text-[96px] font-bold leading-none tracking-tight text-[#4FAF9F]">
              Our Values
            </p>
            <p className="mt-2 sm:mt-3 max-w-3xl text-xs sm:text-[16px] font-semibold uppercase leading-snug sm:leading-[1.45] tracking-[0.12em] sm:tracking-[0.15em] text-[#002f89]">
              The three principles that guide every Flyora journey, from the
              first idea to the journey home.
            </p>

            <div className="mt-4 sm:mt-8 flex md:grid md:grid-cols-3 gap-3.5 sm:gap-7 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {values.map((value, index) => {
                const cardOpacity = clamp(
                  (progress - (0.76 + index * 0.06)) / 0.06,
                );

                return (
                  <article
                    key={value.title}
                    className="w-[80vw] max-w-[320px] shrink-0 snap-center md:w-auto md:max-w-none min-h-[220px] sm:min-h-[275px] bg-[#002f89] p-5 sm:p-8 text-[#F9F5EF] rounded-[14px] shadow-[0_18px_40px_rgba(0,47,137,0.18)] transition-[opacity,transform] duration-300 ease-out flex flex-col justify-between"
                    style={{
                      opacity: cardOpacity,
                      transform: "translateY(" + (1 - cardOpacity) * 32 + "px)",
                    }}
                  >
                    <div>
                      <p
                        className="text-[11px] sm:text-[12px] font-bold tracking-[0.16em]"
                        style={{ color: value.accent }}
                      >
                        {value.prefix}
                      </p>
                      <h3
                        className="mt-1 font-heading text-2xl sm:text-[40px] lg:text-[48px] font-bold uppercase leading-none tracking-[0.04em]"
                        style={{ color: value.accent }}
                      >
                        {value.title}
                      </h3>
                      <p className="mt-3 sm:mt-5 text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-white">
                        {value.subtitle}
                      </p>
                      <p className="mt-2 sm:mt-3 text-xs sm:text-[14px] leading-relaxed text-[#F9F5EF]/80">
                        {value.body}
                      </p>
                    </div>
                    <p className="mt-3 sm:mt-5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D8B596]">
                      {cards[index]?.title}
                    </p>
                  </article>
                );
              })}
            </div>

            {/* Mobile swipe helper pill */}
            <div className="flex md:hidden items-center justify-center gap-1 mt-2 text-[10px] text-[#002f89]/60 uppercase tracking-widest font-mono">
              <span>← Swipe values →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
