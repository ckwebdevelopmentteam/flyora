"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

export interface StraightCardItem {
  id: string;
  location: string;
  title: string;
  description: string;
  src: string;
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

// Spring step for silky-smooth motion
function springStep(
  x: number,
  v: number,
  target: number,
  omega: number,
  zeta: number,
  dt: number,
): [number, number] {
  const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
  const h = dt / steps;
  for (let k = 0; k < steps; k++) {
    v += (-omega * omega * (x - target) - 2 * zeta * omega * v) * h;
    x += v * h;
  }
  return [x, v];
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
    vel: 0,
    raf: 0,
    lastTime: 0,
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
    ? Math.min(300, Math.max(260, containerWidth - 40))
    : Math.min(360, Math.max(300, containerWidth * 0.44));
  const leadHeight = isMobile
    ? Math.round(leadWidth * 1.35)
    : Math.round(leadWidth * 1.41); // ~480px-510px
  const inactiveScale = 0.81;
  const trailingWidth = Math.round(leadWidth * inactiveScale);
  const gap = isMobile ? 12 : 16;

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

  // Animation frame loop
  const kick = useCallback(() => {
    const s = state.current;
    if (s.raf) return;

    const omega = (2 * Math.PI) / 0.65; // ~0.65s smooth duration
    const zeta = 0.93; // slight, pleasant organic bounce

    const frame = (now: number) => {
      const dt = Math.min((now - (s.lastTime || now)) / 1000, 1 / 20);
      s.lastTime = now;

      if (!s.isDragging) {
        [s.pos, s.vel] = springStep(s.pos, s.vel, s.target, omega, zeta, dt);
      }

      paint();

      const settled =
        !s.isDragging &&
        Math.abs(s.pos - s.target) < 1e-3 &&
        Math.abs(s.vel) < 1e-2;

      if (settled) {
        s.pos = s.target;
        s.vel = 0;
        paint();
        s.raf = 0;
        s.lastTime = 0;
        return;
      }

      s.raf = requestAnimationFrame(frame);
    };

    s.raf = requestAnimationFrame(frame);
  }, [paint]);

  // Set target and notify parent
  const setTarget = useCallback(
    (t: number) => {
      const s = state.current;
      s.target = t;
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
      s.vel = 0;
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
    s.vel = v;

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
              className="absolute bottom-0 left-0 overflow-hidden rounded-[8px] border border-white/25 shadow-2xl cursor-pointer group"
              style={{
                width: `${leadWidth}px`,
                height: `${leadHeight}px`,
                transformOrigin: "bottom left",
                willChange: "transform, opacity",
              }}
            >
              <img
                src={item.src}
                alt={`${item.location} - ${item.title}`}
                draggable={false}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Dark dimming overlay on trailing cards */}
              {!isLead && (
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none rounded-[8px]" />
              )}

              {/* Bottom Dark Gradient for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none rounded-[8px]" />

              {/* Location Caption at Bottom */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 pointer-events-none">
                <p className="text-white font-medium text-base sm:text-lg tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                  {item.location}
                </p>
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous destination"
            className="group relative overflow-hidden w-[52px] h-[48px] lg:w-[54px] lg:h-[50px] p-0 m-0 border border-white/40 hover:border-transparent bg-black/40 backdrop-blur-md rounded-[2px] text-white grid place-items-center cursor-pointer transition-all duration-300 active:scale-95 shadow-md"
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
            className="group relative overflow-hidden w-[52px] h-[48px] lg:w-[54px] lg:h-[50px] p-0 m-0 border border-white/40 hover:border-transparent bg-black/40 backdrop-blur-md rounded-[2px] text-white grid place-items-center cursor-pointer transition-all duration-300 active:scale-95 shadow-md"
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
