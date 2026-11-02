"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Team, {
  type TeamMember,
  InstagramIcon,
  LinkedinIcon,
  DribbbleIcon,
} from "@/components/ui/team-02";
import {
  useRobotoFlex,
  ProximityLetters,
} from "@/components/ui/variable-text-proximity";
import type { AboutPageData } from "../aboutData";

interface AboutValuesExperienceProps {
  approach: AboutPageData["approach"];
  curators: AboutPageData["curators"];
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
  // - Scene 2 ("MEET OUR TEAM"): enters 0.33, holds 0.41 to 0.55, 1st scroll lags to 0.69, 2nd scroll exits to 0.76
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
  const teamStage = computeLightStage(
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

        <div
          className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto px-4 py-8 transition-[opacity,transform,filter] duration-300 ease-out sm:px-8 lg:px-12"
          style={{
            opacity: teamStage.opacity,
            filter: teamStage.filter,
            transform: teamStage.transform,
            pointerEvents: teamStage.pointerEvents,
          }}
          aria-hidden={teamStage.opacity < 0.05}
        >
          <div className="mx-auto w-full max-w-7xl my-auto">
            <Team
              badge="Team"
              title="Meet Our Team"
              description="Our team is committed to redefining digital experiences through innovative web solutions while fostering a diverse and collaborative environment."
              members={curators.items.map((curator) => ({
                name: curator.name,
                role: curator.role,
                image: curator.image,
                socials: [
                  {
                    icon: <InstagramIcon size={16} />,
                    link: "#",
                  },
                  {
                    icon: <DribbbleIcon size={16} />,
                    link: "#",
                  },
                  {
                    icon: <LinkedinIcon size={16} />,
                    link: "#",
                  },
                ],
              }))}
              containerClassName="py-2 sm:py-4 lg:py-6"
              onMemberClick={(member) =>
                onOpenEnquiry
                  ? onOpenEnquiry(`Consultation with ${member.name}`)
                  : undefined
              }
            />
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
            <p className="mt-3 max-w-3xl text-[14px] font-semibold uppercase leading-[1.45] tracking-[0.15em] text-[#463D34] sm:text-[16px]">
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
                    className="min-h-[275px] bg-[#463D34] p-7 text-[#F9F5EF] shadow-[0_18px_40px_rgba(70,61,52,0.18)] transition-[opacity,transform] duration-300 ease-out sm:p-8"
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
