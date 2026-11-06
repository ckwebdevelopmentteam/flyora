"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export interface TimelineProps {
  data: TimelineEntry[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  hideHeader?: boolean;
  className?: string;
}

export const Timeline = ({
  data,
  title,
  description,
  hideHeader = false,
  className = "",
}: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const updateHeight = () => {
      if (ref.current) {
        setHeight(ref.current.getBoundingClientRect().height);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(ref.current);
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className={`w-full bg-white font-sans rounded-[8px] ${className}`}
      ref={containerRef}
    >
      {!hideHeader && (
        <div className="pt-7 sm:pt-8 px-6 sm:px-8 pb-4">
          {title ? (
            typeof title === "string" ? (
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815] tracking-tight">
                {title}
              </h2>
            ) : (
              title
            )
          ) : (
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1815] tracking-tight">
              Your Sacred Journey
            </h2>
          )}
          {description ? (
            typeof description === "string" ? (
              <p className="text-stone-600 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed mt-1 font-sans">
                {description}
              </p>
            ) : (
              description
            )
          ) : null}
        </div>
      )}

      <div ref={ref} className="relative w-full pb-16">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-20 lg:pt-24 md:gap-8 lg:gap-10"
          >
            {/* Sticky Milestone Marker Column */}
            <div className="sticky flex flex-col md:flex-row z-30 items-center top-36 sm:top-40 self-start shrink-0 md:w-36 lg:w-44">
              <div className="h-9 w-9 absolute left-3.5 md:left-3.5 rounded-full bg-white flex items-center justify-center shadow-xs border-2 border-[#002f89]">
                <div className="h-3 w-3 rounded-full bg-[#002f89]" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-16 lg:pl-18 md:text-2xl font-serif font-bold text-[#1C1815] whitespace-nowrap">
                {item.title}
              </h3>
            </div>

            {/* Milestone Narrative & Content */}
            <div className="relative pl-16 pr-4 sm:pr-6 md:pr-8 md:pl-4 w-full min-w-0">
              <h3 className="md:hidden block text-xl sm:text-2xl mb-3 text-left font-serif font-bold text-[#1C1815]">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        {/* Luminous Track & Animated Beam Line */}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute left-8 md:left-8 top-0 overflow-hidden w-[2px] bg-stone-200 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-[#002f89] via-[#2563eb] to-transparent from-[0%] via-[10%] rounded-full shadow-[0_0_8px_rgba(0,47,137,0.4)]"
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
