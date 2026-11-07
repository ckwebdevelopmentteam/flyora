"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

export interface StraightCardItem {
  id: string;
  location: string;
  title: string;
  description: string;
  src: string;
  duration?: string;
  price?: string | number;
  originalPrice?: string | number;
  rating?: number;
  reviewCount?: number;
}

export interface StraightCardsCarouselProps {
  items: StraightCardItem[];
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  onSelectLead?: (item: StraightCardItem, index: number) => void;
  className?: string;
  footerRight?: React.ReactNode;
}

export function wrapIndex(i: number, n: number): number {
  if (n <= 0) return 0;
  return ((i % n) + n) % n;
}

export function targetFor(i: number, target: number, n: number): number {
  if (n <= 0) return 0;
  const here = Math.round(target);
  let d = i - wrapIndex(here, n);
  d -= n * Math.round(d / n);
  return here + d;
}

export function computeOffset(i: number, pos: number, n: number): number {
  if (n <= 1) return 0;
  let d = (i - pos) % n;
  while (d < -1) d += n;
  while (d >= n - 1) d -= n;
  return d;
}

// Luxurious, silky smooth slow-motion easing curve (starts soft, glides in slow motion, settles gracefully)
function easeSlowMotion(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function StraightCardsCarousel({
  items,
  activeIndex = 0,
  onIndexChange,
  onSelectLead,
  className = "",
  footerRight,
}: StraightCardsCarouselProps) {
  const n = items.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [active, setActive] = useState(activeIndex);
  const [containerWidth, setContainerWidth] = useState(700);

  // Animation state in a ref to avoid re-renders during 60fps raf
  const state = useRef({
    pos: activeIndex,
    target: activeIndex,
    fromPos: activeIndex,
    toPos: activeIndex,
    startTime: 0,
    duration: 2000, // Exactly 2.0s (2000ms) cinematic slow-motion lag
    raf: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartPos: 0,
    hasDragged: false,
    dragSamples: [] as { t: number; x: number }[],
    clickBlock: false,
  });

  // Calculate card sizing based on container width
  const isMobile = containerWidth < 640;
  const leadWidth = isMobile
    ? Math.min(260, Math.max(210, containerWidth - 48))
    : Math.min(360, Math.max(300, containerWidth * 0.44));
  const leadHeight = isMobile
    ? Math.round(leadWidth * 1.35)
    : Math.round(leadWidth * 1.41); // ~480px-510px
  const inactiveScale = 0.81;
  const trailingWidth = Math.round(leadWidth * inactiveScale);
  const gap = isMobile ? 10 : 16;

  // Layout function for position of card relative to current pos
  const getLayout = useCallback(
    (i: number, pos: number) => {
      if (n <= 0) return { x: 0, scale: 1, opacity: 1, zIndex: 10 };
      const d = computeOffset(i, pos, n);

      let x = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = 10;

      if (d >= 0) {
        if (d <= 1) {
          // Transition from Lead (d=0) to Trailing 1 (d=1)
          x = d * (leadWidth + gap);
          scale = 1 - d * (1 - inactiveScale);
          opacity = 1;
          zIndex = Math.round(50 - d * 20);
        } else {
          // Subsequent trailing cards
          x = leadWidth + gap + (d - 1) * (trailingWidth + gap);
          scale = inactiveScale;
          // Fade out smoothly if off right edge
          const isOff = x > containerWidth + 60;
          opacity = isOff ? 0 : 1;
          zIndex = Math.max(1, Math.round(30 - d));
        }
      } else {
        // d < 0: Exiting smoothly to the left
        x = d * (leadWidth + gap);
        scale = 1 + d * (1 - inactiveScale) * 0.3;
        opacity = Math.max(0, 1 + d * 1.4);
        zIndex = Math.round(50 + d * 10);
      }

      return { x, scale, opacity, zIndex };
    },
    [n, leadWidth, trailingWidth, gap, inactiveScale, containerWidth],
  );

  // Paint function: writes styles directly to DOM for 60fps performance
  const paint = useCallback(() => {
    const s = state.current;
    for (let i = 0; i < n; i++) {
      const el = slideRefs.current[i];
      if (!el) continue;
      const layout = getLayout(i, s.pos);
      el.style.transform = `translate3d(${layout.x.toFixed(2)}px, 0, 0) scale(${layout.scale.toFixed(4)})`;
      el.style.opacity = `${layout.opacity.toFixed(3)}`;
      el.style.zIndex = `${layout.zIndex}`;
      el.style.visibility = layout.opacity <= 0.005 ? "hidden" : "";
    }
  }, [n, getLayout]);

  // Animation frame loop using smooth slow-motion easing
  const kick = useCallback(() => {
    const s = state.current;
    if (s.raf) cancelAnimationFrame(s.raf);

    const frame = (now: number) => {
      if (s.isDragging) return;

      const elapsed = now - (s.startTime || now);
      const progress = Math.min(elapsed / s.duration, 1);
      const eased = easeSlowMotion(progress);

      s.pos = s.fromPos + (s.toPos - s.fromPos) * eased;
      paint();

      if (progress < 1) {
        s.raf = requestAnimationFrame(frame);
      } else {
        s.pos = s.toPos;
        paint();
        s.raf = 0;
      }
    };

    s.raf = requestAnimationFrame(frame);
  }, [paint]);

  // Set target and notify parent
  const setTarget = useCallback(
    (t: number) => {
      const s = state.current;
      s.fromPos = s.pos;
      s.toPos = t;
      s.target = t;
      s.startTime = performance.now();
      const newActive = wrapIndex(Math.round(t), n);
      setActive(newActive);
      onIndexChange?.(newActive);
      kick();
    },
    [n, onIndexChange, kick],
  );

  const step = useCallback(
    (by: number) => {
      setTarget(Math.round(state.current.target) + by);
    },
    [setTarget],
  );

  const goTo = useCallback(
    (i: number) => {
      setTarget(targetFor(i, state.current.target, n));
    },
    [n, setTarget],
  );

  // Sync with external activeIndex prop
  useEffect(() => {
    if (activeIndex != null && n > 0) {
      const currentActive = wrapIndex(Math.round(state.current.target), n);
      if (currentActive !== activeIndex) {
        goTo(activeIndex);
      }
    }
  }, [activeIndex, n, goTo]);

  // When items change (e.g. category switch), reset slide position cleanly without remounting
  const prevItemsRef = useRef(items);
  useEffect(() => {
    if (prevItemsRef.current !== items) {
      prevItemsRef.current = items;
      state.current.pos = activeIndex || 0;
      state.current.fromPos = activeIndex || 0;
      state.current.toPos = activeIndex || 0;
      state.current.target = activeIndex || 0;
      setActive(activeIndex || 0);
      paint();
    }
  }, [items, activeIndex, paint]);

  // Measure container width
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      setContainerWidth(el.offsetWidth || 700);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Repaint on sizing changes
  useEffect(() => {
    paint();
  }, [paint, containerWidth]);

  // Cleanup RAF
  useEffect(() => {
    return () => {
      if (state.current.raf) {
        cancelAnimationFrame(state.current.raf);
      }
    };
  }, []);

  // Pointer / Touch gestures for smooth dragging
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || n <= 1) return;
    if ((e.target as Element).closest("[data-carousel-controls]")) return;

    const s = state.current;
    s.isDragging = true;
    s.dragStartX = e.clientX;
    s.dragStartPos = s.pos;
    s.hasDragged = false;
    s.dragSamples = [{ t: e.timeStamp, x: e.clientX }];
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.isDragging) return;

    const dx = e.clientX - s.dragStartX;
    if (!s.hasDragged) {
      if (Math.abs(dx) < 6) return;
      s.hasDragged = true;
      s.dragStartX = e.clientX;
      s.dragStartPos = s.pos;
      stageRef.current?.setPointerCapture(e.pointerId);
    }

    const slideUnit = leadWidth + gap;
    s.pos = s.dragStartPos - (e.clientX - s.dragStartX) / slideUnit;
    s.dragSamples.push({ t: e.timeStamp, x: e.clientX });
    if (s.dragSamples.length > 5) s.dragSamples.shift();

    const newActive = wrapIndex(Math.round(s.pos), n);
    if (newActive !== active) {
      setActive(newActive);
      onIndexChange?.(newActive);
    }

    kick();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.isDragging) return;
    s.isDragging = false;

    if (!s.hasDragged) return;

    s.clickBlock = true;
    window.setTimeout(() => {
      s.clickBlock = false;
    }, 50);

    const first = s.dragSamples[0];
    const last = s.dragSamples[s.dragSamples.length - 1];
    const ms = Math.max(last.t - first.t, 1);
    const slideUnit = leadWidth + gap;
    const v = (-(last.x - first.x) / ms / slideUnit) * 1000;
    const releaseT = Math.round(s.pos + v * 0.15);
    setTarget(releaseT);
  };

  return (
    <div
      className={`w-full flex flex-col justify-end min-w-0 select-none ${className}`}
    >
      {/* Cards Stage: Height matches lead card */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative w-full overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
        style={{ height: `${leadHeight}px` }}
      >
        {items.map((item, i) => {
          const isLead = i === active;
          return (
            <div
              key={item.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              onClick={() => {
                if (state.current.clickBlock) return;
                if (isLead) {
                  onSelectLead?.(item, i);
                } else {
                  goTo(i);
                }
              }}
              className="absolute bottom-0 left-0 overflow-hidden rounded-2xl border border-white/25 shadow-2xl cursor-pointer group"
              style={{
                width: `${leadWidth}px`,
                height: `${leadHeight}px`,
                transformOrigin: "bottom left",
                willChange: "transform, opacity",
              }}
            >
              {/* Vibrant Original Image: No dark dimming, natural colors */}
              <img
                src={item.src}
                alt={`${item.location} - ${item.title}`}
                draggable={false}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gentle non-hovered gradient at the bottom solely for location text legibility */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none rounded-2xl transition-opacity duration-300 group-hover:opacity-0" />

              {/* Smooth full-card dark gradient that fades in on hover to highlight details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/15 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />

              {/* Location & Interactive Details Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 flex flex-col justify-end pointer-events-none">
                {/* Default State: Location Caption (slides smoothly up and fades out on hover) */}
                <div className="transition-all duration-300 ease-out group-hover:opacity-0 group-hover:-translate-y-3">
                  <p className="text-white font-medium text-base sm:text-lg tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                    {item.location}
                  </p>
                </div>

                {/* Hover State: Details Panel (slides smoothly up from below on hover, slides down on unhover) */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col gap-2.5 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none group-hover:pointer-events-auto">
                  {/* Top Row: Duration Badge */}
                  {item.duration && (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide border border-white/25">
                        {item.duration}
                      </span>
                    </div>
                  )}

                  {/* Location & Short Description */}
                  <div>
                    <h4 className="text-white font-bold text-base sm:text-[17px] tracking-tight leading-snug drop-shadow-sm">
                      {item.location}
                    </h4>
                    <p className="text-white/85 text-xs sm:text-[12.5px] line-clamp-2 mt-1 leading-relaxed">
                      {item.description || item.title}
                    </p>
                  </div>

                  {/* Rate / Price & View Details Action */}
                  <div className="flex items-end justify-between pt-1.5 border-t border-white/20 mt-0.5">
                    <div className="flex flex-col">
                      {item.originalPrice && (
                        <span className="text-white/60 text-[11px] line-through leading-tight">
                          {item.originalPrice}
                        </span>
                      )}
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-white font-bold text-base sm:text-lg tracking-tight leading-tight">
                          {item.price || "₹48,500"}
                        </span>
                        <span className="text-white/70 text-[10.5px]">
                          / person
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-white hover:bg-neutral-100 text-[#002f89] text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap">
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls Row: Sharp Arrow Buttons on Left, View all destinations on Right */}
      <div
        data-carousel-controls=""
        className="mt-5 sm:mt-6 flex items-center justify-between gap-4 w-full z-20"
      >
        {/* Sharp Arrow Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous destination"
            className="group relative overflow-hidden w-[42px] h-[38px] sm:w-[52px] sm:h-[48px] lg:w-[54px] lg:h-[50px] p-0 m-0 border border-white/40 hover:border-transparent bg-black/40 backdrop-blur-md rounded-md text-white grid place-items-center cursor-pointer transition-all duration-300 active:scale-95 shadow-md"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
            />
            <span className="relative z-10 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next destination"
            className="group relative overflow-hidden w-[42px] h-[38px] sm:w-[52px] sm:h-[48px] lg:w-[54px] lg:h-[50px] p-0 m-0 border border-white/40 hover:border-transparent bg-black/40 backdrop-blur-md rounded-md text-white grid place-items-center cursor-pointer transition-all duration-300 active:scale-95 shadow-md"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
            />
            <span className="relative z-10 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
          </button>
        </div>

        {/* View all destinations button */}
        {footerRight}
      </div>
    </div>
  );
}
