"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { HeroSearchCard } from "./HeroSearchCard";

export interface HeroSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  videoSrc?: string;
  posterSrc?: string;
  primaryCtaLabel?: string;
  onPrimaryCtaClick?: () => void;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  onSecondaryCtaClick?: () => void;
  secondaryCtaHref?: string;
  onExploreClick?: () => void;
  onOpenEnquiry?: (serviceOrDest?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  eyebrow = "Flyora Tours & Travels, Est. 2006",
  title = "It’s not where you go, but how you feel.",
  description = "Custom journeys across India and the world, built around you since 2006.",
  videoSrc = "/hero/hero-one.mp4",
  posterSrc,
  primaryCtaLabel = "Start Planning",
  onPrimaryCtaClick,
  primaryCtaHref,
  secondaryCtaLabel = "See Our Journeys",
  onSecondaryCtaClick,
  secondaryCtaHref = "#destinations",
  onOpenEnquiry,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(900);
  const userInteractedRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const vh = window.innerHeight || 900;
      setViewportHeight(vh);

      if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        const scrollDistance = Math.max(1, trackRef.current.offsetHeight - vh);
        const scrolled = Math.max(0, -rect.top);
        const p = Math.min(1, Math.max(0, scrolled / scrollDistance));
        setProgress(p);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    const onResize = () => {
      updateScroll();
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video is strictly muted for browser autoplay policy
    video.muted = true;
    video.defaultMuted = true;

    const tryPlay = () => {
      video.muted = true;
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Retry muted playback
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    };

    // Attempt playback immediately and on canplay
    tryPlay();
    video.addEventListener("canplay", tryPlay);

    // Fallback: resume on first user interaction if browser delayed autoplay
    const onUserInteraction = () => {
      if (video.paused) {
        tryPlay();
      }
    };
    const events = ["click", "touchstart", "touchend", "scroll", "pointerdown"];
    events.forEach((ev) =>
      window.addEventListener(ev, onUserInteraction, {
        capture: true,
        passive: true,
        once: true,
      }),
    );

    const onVolumeChange = () => {
      setIsMuted(video.muted);
    };
    video.addEventListener("volumechange", onVolumeChange);

    return () => {
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("volumechange", onVolumeChange);
      events.forEach((ev) =>
        window.removeEventListener(ev, onUserInteraction, { capture: true }),
      );
    };
  }, [videoSrc]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    userInteractedRef.current = true;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    if (!nextMuted) {
      video.play().catch(() => {});
    }
    setIsMuted(nextMuted);
  };

  const handlePrimaryClick = (e: React.MouseEvent) => {
    if (onPrimaryCtaClick) {
      e.preventDefault();
      onPrimaryCtaClick();
    }
  };

  const handleSecondaryClick = (e: React.MouseEvent) => {
    if (onSecondaryCtaClick) {
      e.preventDefault();
      onSecondaryCtaClick();
    } else if (secondaryCtaHref && secondaryCtaHref.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(secondaryCtaHref);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      ref={trackRef}
      className="sticky top-0 z-0 h-screen w-full text-white overflow-hidden"
    >
      {/* =========================================================================
          HERO MAIN VIEWPORT: Fixed Fullscreen Hero Viewport
          ========================================================================= */}
      <section className="relative z-0 flex h-full w-full items-center justify-center overflow-hidden bg-[#0a231f]">
        {/* Background Video & Scrim Overlays */}
        <div className="absolute inset-0 animate-hero-zoom overflow-hidden">
          <video
            ref={videoRef}
            key={videoSrc}
            poster={posterSrc || undefined}
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none select-none [&::-webkit-media-controls]:!hidden [&::-webkit-media-controls-start-playback-button]:!hidden [&::-webkit-media-controls-play-button]:!hidden [&::-webkit-media-controls-panel]:!hidden"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Clean contrast scrims: top for navbar, middle for text */}
          <div aria-hidden="true" className="absolute inset-0 bg-black/20" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/35 to-transparent"
          />
          {/* Gentle white atmospheric glow at the bottom so clouds emerge bright and clean */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-48 sm:h-72 bg-gradient-to-t from-white/35 via-white/15 to-transparent pointer-events-none"
          />
        </div>

        {/* Hero Content Container: softly drifts up and fades as user scrolls down */}
        <div
          style={{
            opacity: Math.max(0, 1 - progress * 2.8),
            transform: `translate3d(0, -${24 + progress * 140}px, 0)`,
          }}
          className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-10 flex flex-col items-center gap-1.5 sm:gap-2.5 text-center select-none will-change-transform"
        >
          {/* Eyebrow Tagline */}
          <span className="animate-hero-eyebrow font-heading text-xs sm:text-sm lg:text-base text-white/90 tracking-[0.14em] uppercase font-light drop-shadow-sm">
            {eyebrow}
          </span>

          {/* Main Editorial Heading */}
          <h1 className="animate-hero-heading font-heading max-md:text-[26px] max-md:leading-[1.15] sm:text-[34px] sm:leading-[1.1] md:max-xl:text-[42px] md:max-xl:leading-[1.1] xl:text-[50px] xl:leading-[1.1] text-white whitespace-pre-line max-w-4xl font-normal tracking-[-0.01em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)]">
            {title}
          </h1>

          {/* Subheading / Description */}
          <p className="animate-hero-description text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl text-white/90 font-light px-2 sm:px-4 drop-shadow-sm">
            {description}
          </p>

          {/* Luxury Search & Visa CTA Widget matching reference design */}
          <div className="animate-hero-cta w-full mt-2 sm:mt-3">
            <HeroSearchCard
              onOpenEnquiry={onOpenEnquiry || onPrimaryCtaClick}
              onExploreJourneys={onSecondaryCtaClick}
            />
          </div>
        </div>

        {/* Audio Mute / Unmute Button */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          aria-pressed={!isMuted}
          className={`absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-30 flex items-center justify-center text-white transition-all duration-300 hover:opacity-80 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 max-md:bottom-6 max-md:left-4 cursor-pointer p-2 rounded-full ${
            progress > 0.05 ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {isMuted ? (
            <VolumeX
              className="h-7 w-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              strokeWidth={1.25}
              aria-hidden="true"
            />
          ) : (
            <Volume2
              className="h-7 w-7 text-sky drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] animate-pulse"
              strokeWidth={1.25}
              aria-hidden="true"
            />
          )}
        </button>
      </section>
    </div>
  );
};

export default HeroSection;
