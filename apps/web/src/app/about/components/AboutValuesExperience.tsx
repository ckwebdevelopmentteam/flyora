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

const stageOpacity = (progress: number, start: number, end: number) =>
  clamp(Math.min((progress - start) / 0.1, (end - progress) / 0.1));

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

  // The white surface enters first. Only after it has reached the top and
  // scrolling continues does the existing mission scene reveal itself.
  const missionOpacity = clamp(
    Math.min((progress - 0.02) / 0.1, (0.38 - progress) / 0.1),
  );
  const partnersOpacity = stageOpacity(progress, 0.24, 0.64);
  // Let the Values title settle before introducing each card in turn.
  const valuesOpacity = clamp((progress - 0.64) / 0.1);
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
          className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center transition-[opacity,transform] duration-700 ease-out"
          style={{
            opacity: missionOpacity,
            transform: "translateY(" + (1 - missionOpacity) * 30 + "px)",
            pointerEvents: missionOpacity > 0.8 ? "auto" : "none",
          }}
          aria-hidden={missionOpacity < 0.05}
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
          className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto px-4 py-8 transition-[opacity,transform] duration-700 ease-out sm:px-8 lg:px-12"
          style={{
            opacity: partnersOpacity,
            transform: "translateY(" + (1 - partnersOpacity) * 34 + "px)",
            pointerEvents: partnersOpacity > 0.85 ? "auto" : "none",
          }}
          aria-hidden={partnersOpacity < 0.05}
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
          className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto px-4 py-8 transition-opacity duration-700 ease-out sm:px-8 lg:px-12"
          style={{
            opacity: valuesOpacity,
            pointerEvents: valuesOpacity > 0.95 ? "auto" : "none",
          }}
          aria-hidden={valuesOpacity < 0.05}
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
                  (progress - (0.8 + index * 0.07)) / 0.06,
                );

                return (
                  <article
                    key={value.title}
                    className="min-h-[275px] bg-[#463D34] p-7 text-[#F9F5EF] shadow-[0_18px_40px_rgba(70,61,52,0.18)] transition-[opacity,transform] duration-700 ease-out sm:p-8"
                    style={{
                      opacity: cardOpacity,
                      transform: "translateY(" + (1 - cardOpacity) * 42 + "px)",
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
