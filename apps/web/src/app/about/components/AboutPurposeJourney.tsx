"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Team, {
  InstagramIcon,
  LinkedinIcon,
  DribbbleIcon,
} from "@/components/ui/team-02";
import type { AboutPageData } from "../aboutData";

import { AboutWhatWeOffer } from "./AboutWhatWeOffer";

interface AboutPurposeJourneyProps {
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

const computeDarkStage = (
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

  if (progress <= lagTransitionEnd) {
    const t = (progress - holdEnd) / (lagTransitionEnd - holdEnd);
    return {
      opacity: 1 - t * 0.45,
      filter: `saturate(${1 - t * 0.65}) brightness(${1 - t * 0.25})`,
      transform: `translateY(${-t * 14}px)`,
      pointerEvents: "none",
    };
  }

  if (progress <= lagEnd) {
    return {
      opacity: 0.55,
      filter: "saturate(0.35) brightness(0.75)",
      transform: "translateY(-14px)",
      pointerEvents: "none",
    };
  }

  if (progress <= exitEnd) {
    const t = (progress - lagEnd) / (exitEnd - lagEnd);
    return {
      opacity: Math.max(0, 0.55 * (1 - t)),
      filter: "saturate(0.35) brightness(0.75)",
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

export const AboutPurposeJourney: React.FC<AboutPurposeJourneyProps> = ({
  curators,
  onOpenEnquiry,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
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

  // Carefully calibrated 2-scroll rhythm with half-shadow color-less lag hold:
  // - Scene 1 ("OUR PURPOSE"): holds 0 to 0.12, 1st scroll lags (dim/desaturate) to 0.25, 2nd scroll exits to 0.32
  // - Scene 2 ("WHAT WE OFFER"): enters 0.24, holds 0.31 to 0.44, 1st scroll lags to 0.57, 2nd scroll exits to 0.64
  // - Scene 3 ("MEET OUR TEAM"): enters 0.57, holds 0.64 to 0.78, 1st scroll lags to 0.85, white curtain rises from 0.85 to 1.0!
  const purposeStage = computeDarkStage(progress, 0, 0, 0.12, 0.18, 0.25, 0.32);
  const offerStage = computeDarkStage(
    progress,
    0.24,
    0.31,
    0.44,
    0.5,
    0.57,
    0.64,
  );
  const teamStage = computeDarkStage(
    progress,
    0.57,
    0.64,
    0.78,
    0.84,
    0.9,
    1.0,
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[780vh] bg-[#2A2733]"
      aria-label="Our Purpose and Approach"
    >
      <div className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden bg-[#2A2733] text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/about/ourpurposebg.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-[#171420]/40" aria-hidden="true" />

        {/* The textured field stays continuous while the three scroll stages change. */}
        <div
          className="absolute inset-0 opacity-70"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 14%, rgba(255,255,255,.06) 0 1px, transparent 1.5px), radial-gradient(circle at 76% 64%, rgba(255,255,255,.035) 0 1px, transparent 1.5px), linear-gradient(115deg, rgba(255,255,255,.025), transparent 45%, rgba(0,0,0,.14))",
            backgroundSize: "7px 7px, 11px 11px, 100% 100%",
          }}
        />

        <svg
          className="absolute bottom-0 left-0 h-[42%] w-full opacity-20 pointer-events-none"
          viewBox="0 0 1920 420"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {[0, 24, 48, 72, 96, 120].map((offset) => (
            <path
              key={offset}
              d={
                "M-40 " +
                (274 + offset) +
                "C220 " +
                (220 + offset) +
                " 370 " +
                (380 + offset) +
                " 650 " +
                (314 + offset) +
                "C940 " +
                (246 + offset) +
                " 1090 " +
                (318 + offset) +
                " 1320 " +
                (208 + offset) +
                "C1530 " +
                (112 + offset) +
                " 1740 " +
                (194 + offset) +
                " 1980 " +
                (108 + offset)
              }
              stroke="#9A8EAF"
              strokeWidth="3"
            />
          ))}
        </svg>

        {/* Scene 1: OUR PURPOSE Heading */}
        <div
          className="absolute inset-0 flex items-center justify-center px-6 text-center transition-[opacity,transform,filter] duration-300 ease-out"
          style={{
            opacity: purposeStage.opacity,
            filter: purposeStage.filter,
            transform: purposeStage.transform,
            pointerEvents: purposeStage.pointerEvents,
          }}
          aria-hidden={purposeStage.opacity < 0.05}
        >
          <div className="max-w-4xl">
            <p className="font-heading text-[56px] font-bold leading-none tracking-[0.015em] text-[#5BC3A6] sm:text-[84px] lg:text-[112px]">
              OUR PURPOSE
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-heading text-[31px] font-bold uppercase leading-[1.12] tracking-[0.1em] sm:text-[44px] lg:text-[58px]">
              To turn every journey into a remarkable travel experience
            </h2>
          </div>
        </div>

        {/* Scene 2: What We Offer with Variable Text Proximity */}
        <AboutWhatWeOffer
          opacity={offerStage.opacity}
          filter={offerStage.filter}
          transform={offerStage.transform}
          pointerEvents={offerStage.pointerEvents}
          progress={progress}
        />

        {/* Scene 3: MEET OUR TEAM on the Grape Background */}
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
              isDark={true}
              badge="Curators"
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
      </div>
    </section>
  );
};
