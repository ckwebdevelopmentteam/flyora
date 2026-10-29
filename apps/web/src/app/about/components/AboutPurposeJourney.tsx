"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { AboutPageData } from "../aboutData";

interface AboutPurposeJourneyProps {
  data: AboutPageData["approach"];
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export const AboutPurposeJourney: React.FC<AboutPurposeJourneyProps> = ({
  data,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeItem, setActiveItem] = useState(data.items[0]?.id ?? "");

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

  // Carefully timed scroll-lag narrative sequence across 560vh:
  // - Scene 1 ("OUR PURPOSE"): holds from 0 to 0.18, crossfades out to 0.24 (~110vh scroll time)
  // - Scene 2 (Wonder & Connection): holds from 0.24 to 0.44, crossfades out to 0.48 (~120vh scroll time)
  // - Scene 3 ("HOW WE PLAN OUR JOURNEYS"): fades in 0.46 -> 0.52, HOLDS FULLY VISIBLE & INTERACTIVE from 0.52 to 0.78 (~120vh clean scroll time)
  // - White Curtain Handoff: The white section begins entering from the bottom at ~0.78 and smoothly rises over Scene 3 until 1.0!
  const purposeOpacity = clamp((0.24 - progress) / 0.08);
  const impactOpacity = clamp(
    Math.min((progress - 0.2) / 0.06, (0.48 - progress) / 0.06),
  );
  const journeyOpacity = clamp((progress - 0.46) / 0.06);

  // Subtle parallax lag transforms
  const scene3ImageLag = (progress - 0.64) * -35;
  const scene3TextLag = (progress - 0.64) * -15;

  return (
    <section
      ref={sectionRef}
      className="relative h-[560vh] bg-[#2A2733]"
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
          className="absolute inset-0 flex items-center justify-center px-6 text-center transition-[opacity,transform] duration-700 ease-out"
          style={{
            opacity: purposeOpacity,
            transform: "translateY(" + progress * -42 + "px)",
            pointerEvents: purposeOpacity > 0.8 ? "auto" : "none",
          }}
          aria-hidden={purposeOpacity < 0.05}
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

        {/* Scene 2: Wonder, Connection, Stories Statement */}
        <div
          className="absolute inset-0 flex items-center justify-center px-6 text-center transition-[opacity,transform] duration-700 ease-out"
          style={{
            opacity: impactOpacity,
            transform: "translateY(" + (0.5 - impactOpacity) * 30 + "px)",
            pointerEvents: impactOpacity > 0.8 ? "auto" : "none",
          }}
          aria-hidden={impactOpacity < 0.05}
        >
          <h2 className="max-w-5xl font-heading text-[31px] font-bold uppercase leading-[1.14] tracking-[0.075em] sm:text-[43px] lg:text-[57px]">
            We create journeys that leave you with more{" "}
            <span className="text-[#F08B4C]">wonder</span>, more{" "}
            <span className="text-[#5BC3A6]">connection</span>, and more stories
            worth carrying home.
          </h2>
        </div>

        {/* Scene 3: HOW WE PLAN OUR JOURNEYS (Matching exact UI from screenshot, with dedicated hold scroll time & lag effect) */}
        <div
          className="absolute inset-0 grid grid-rows-[42%_58%] transition-opacity duration-700 ease-out lg:grid-cols-2 lg:grid-rows-1"
          style={{
            opacity: journeyOpacity,
            pointerEvents:
              journeyOpacity > 0.9 && progress < 0.86 ? "auto" : "none",
          }}
          aria-hidden={journeyOpacity < 0.05}
        >
          <div className="relative overflow-hidden">
            <div
              className="relative w-full h-full transition-transform duration-300 ease-out"
              style={{
                transform: `scale(1.08) translateY(${scene3ImageLag}px)`,
                willChange: "transform",
              }}
            >
              <Image
                src={data.companionImage.src}
                alt={data.companionImage.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              {/* Atmospheric Vignette & Seamless Right Edge Blend into #2A2733 */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#14111d]/70 via-transparent to-[#14111d]/30 pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#2A2733] via-[#2A2733]/50 to-transparent pointer-events-none hidden lg:block"
                aria-hidden="true"
              />
            </div>

            {/* Subtle Editorial Watermark Overlay */}
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-10 max-w-xs pointer-events-none">
              <span className="inline-block text-[10px] font-sans font-semibold tracking-[0.25em] text-[#5BC3A6] uppercase mb-1 drop-shadow-sm">
                UNHURRIED LUXURY
              </span>
              <p className="font-heading text-xs sm:text-sm text-white/90 uppercase tracking-wider font-medium drop-shadow-sm">
                {data.companionImage.caption}
              </p>
            </div>
          </div>

          <div
            className="flex min-h-0 items-center overflow-y-auto px-6 py-8 sm:px-10 lg:px-[12%] transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${scene3TextLag}px)`,
              willChange: "transform",
            }}
          >
            <div className="w-full max-w-xl">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#5BC3A6] sm:text-[11px]">
                {data.eyebrow}
              </p>
              <h2 className="font-heading text-[27px] font-bold uppercase leading-[1.12] tracking-[0.045em] sm:text-[35px] lg:text-[42px]">
                {data.heading}
              </h2>

              <div className="mt-6 border-t border-white/20">
                {data.items.map((item) => {
                  const isOpen = activeItem === item.id;

                  return (
                    <div key={item.id} className="border-b border-white/20">
                      <button
                        type="button"
                        onClick={() => setActiveItem(isOpen ? "" : item.id)}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold tracking-[0.12em] text-[#F08B4C]">
                            /{item.number}
                          </span>
                          <span className="text-[14px] font-medium sm:text-[15px]">
                            {item.title}
                          </span>
                        </span>
                        <ChevronDown
                          className={
                            "h-4 w-4 shrink-0 transition-transform duration-300 " +
                            (isOpen ? "rotate-180" : "")
                          }
                        />
                      </button>
                      {isOpen && (
                        <p className="max-w-lg pb-4 text-[13px] leading-relaxed text-white/75 sm:text-[14px]">
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
      </div>
    </section>
  );
};
