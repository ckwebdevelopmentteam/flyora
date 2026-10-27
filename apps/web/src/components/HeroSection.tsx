"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, ArrowRight } from "lucide-react";

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
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  eyebrow = "Flyora Tours & Travels, Est. 2006",
  title = "It’s not where you go, but how you feel.",
  description = "Custom journeys across India and the world, built around you since 2006.",
  videoSrc = "/hero/hero-one.mp4",
  posterSrc = "/hero/hero-poster.jpg",
  primaryCtaLabel = "Start Planning",
  onPrimaryCtaClick,
  primaryCtaHref,
  secondaryCtaLabel = "See Our Journeys",
  onSecondaryCtaClick,
  secondaryCtaHref = "#destinations",
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
      className="relative w-full min-h-[175vh] md:min-h-[185vh] text-white"
    >
      {/* =========================================================================
          HERO MAIN VIEWPORT: Sticky Pinned Viewport (Exact  Tours structure)
          The video stays fixed at top: 0 while scrolling through the hero track
          ========================================================================= */}
      <section className="sticky top-0 z-0 flex h-screen w-full items-center justify-center overflow-hidden bg-[#F9F3EC]">
        {/* Background Video & Scrim Overlays */}
        <div className="absolute inset-0 animate-hero-zoom overflow-hidden">
          <video
            ref={videoRef}
            key={videoSrc}
            poster={posterSrc}
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
            transform: `translate3d(0, -${progress * 140}px, 0)`,
          }}
          className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 pt-28 sm:pt-32 pb-24 sm:pb-32 flex flex-col items-center max-md:gap-4 gap-6 text-center select-none will-change-transform"
        >
          {/* Eyebrow Tagline */}
          <span className="animate-hero-eyebrow font-heading max-md:text-[13px] text-base lg:text-lg text-white/90 tracking-[0.14em] uppercase font-light drop-shadow-sm">
            {eyebrow}
          </span>

          {/* Main Editorial Heading */}
          <h1 className="animate-hero-heading font-heading max-md:text-[42px] max-md:leading-none md:max-xl:text-[46px] md:max-xl:leading-[1.1] xl:max-2xl:text-[58px] xl:max-2xl:leading-[1.1] min-[1500px]:text-[66px] text-white whitespace-pre-line max-md:max-w-[400px] max-w-4xl lg:max-2xl:max-w-[640px] font-normal tracking-[-0.01em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)]">
            {title}
          </h1>

          {/* Subheading / Description */}
          <p className="animate-hero-description max-md:text-[13px] max-md:leading-[1.4] text-sm sm:text-base md:text-[17px] leading-[1.5] max-md:max-w-[400px] max-w-3xl max-md:text-white/80 text-white/90 font-light max-md:px-4 drop-shadow-sm">
            {description}
          </p>

          {/* Dual Action CTAs: Matching exact design from attached image */}
          <div className="animate-hero-cta mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-6 w-full max-w-xl mx-auto">
            {primaryCtaHref ? (
              <a
                href={primaryCtaHref}
                onClick={handlePrimaryClick}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-[#08302B] font-heading font-semibold text-[13px] sm:text-[14px] uppercase tracking-[0.12em] px-7 sm:px-9 py-3.5 sm:py-4 rounded-[8px] sm:rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.14)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.22)] hover:bg-[#FAFCFB] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer whitespace-nowrap select-none"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2] transition-transform duration-200 group-hover:translate-x-1 shrink-0"
                  aria-hidden="true"
                />
              </a>
            ) : (
              <button
                type="button"
                onClick={handlePrimaryClick}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-[#08302B] font-heading font-semibold text-[13px] sm:text-[14px] uppercase tracking-[0.12em] px-7 sm:px-9 py-3.5 sm:py-4 rounded-[8px] sm:rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.14)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.22)] hover:bg-[#FAFCFB] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer whitespace-nowrap select-none"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2] transition-transform duration-200 group-hover:translate-x-1 shrink-0"
                  aria-hidden="true"
                />
              </button>
            )}

            {/* Vertical Divider Line between CTAs */}
            <div
              aria-hidden="true"
              className="hidden sm:block w-[1px] h-11 bg-white/70 shrink-0"
            />

            {secondaryCtaHref ? (
              <a
                href={secondaryCtaHref}
                onClick={handleSecondaryClick}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-[#08302B] font-heading font-semibold text-[13px] sm:text-[14px] uppercase tracking-[0.12em] px-7 sm:px-9 py-3.5 sm:py-4 rounded-[8px] sm:rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.14)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.22)] hover:bg-[#FAFCFB] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer whitespace-nowrap select-none"
              >
                <span>{secondaryCtaLabel}</span>
                <ArrowRight
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2] transition-transform duration-200 group-hover:translate-x-1 shrink-0"
                  aria-hidden="true"
                />
              </a>
            ) : (
              <button
                type="button"
                onClick={handleSecondaryClick}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-[#08302B] font-heading font-semibold text-[13px] sm:text-[14px] uppercase tracking-[0.12em] px-7 sm:px-9 py-3.5 sm:py-4 rounded-[8px] sm:rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.14)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.22)] hover:bg-[#FAFCFB] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer whitespace-nowrap select-none"
              >
                <span>{secondaryCtaLabel}</span>
                <ArrowRight
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2] transition-transform duration-200 group-hover:translate-x-1 shrink-0"
                  aria-hidden="true"
                />
              </button>
            )}
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

        {/* =========================================================================
            CLOUDE-FRAME CURTAIN:
            Starts at the bottom of the sticky hero viewport.
            As the user scrolls down, this cloud curtain sweeps UPWARDS across the hero
            video from bottom to top, revealing the next section below seamlessly!
            ========================================================================= */}
        <div
          style={{
            transform: `translate3d(0, calc(100vh - 120px - ${progress * (viewportHeight + 40)}px), 0)`,
          }}
          className="absolute inset-x-0 top-0 pointer-events-none select-none will-change-transform z-20"
          aria-hidden="true"
        >
          <div className="relative overflow-hidden leading-none text-[0px]">
            <div className="animate-marquee flex w-max will-change-transform">
              {/* Set 1 */}
              <img
                alt=""
                width={1580}
                height={440}
                className="block shrink-0 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] w-auto -mr-[70px] sm:-mr-[90px] md:-mr-[110px] lg:-mr-[120px] pointer-events-none"
                src="/cloude-frame/Frame@1.5x-1.png"
              />
              <img
                alt=""
                width={1580}
                height={440}
                className="block shrink-0 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] w-auto -mr-[70px] sm:-mr-[90px] md:-mr-[110px] lg:-mr-[120px] pointer-events-none"
                src="/cloude-frame/Frame@1.5x-2.png"
              />
              <img
                alt=""
                width={1580}
                height={440}
                className="block shrink-0 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] w-auto -mr-[70px] sm:-mr-[90px] md:-mr-[110px] lg:-mr-[120px] pointer-events-none"
                src="/cloude-frame/Frame@1.5x-3.png"
              />
              <img
                alt=""
                width={1580}
                height={440}
                className="block shrink-0 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] w-auto -mr-[70px] sm:-mr-[90px] md:-mr-[110px] lg:-mr-[120px] pointer-events-none"
                src="/cloude-frame/Frame@1.5x-4.png"
              />
              {/* Set 2 (for seamless loop) */}
              <img
                alt=""
                width={1580}
                height={440}
                className="block shrink-0 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] w-auto -mr-[70px] sm:-mr-[90px] md:-mr-[110px] lg:-mr-[120px] pointer-events-none"
                src="/cloude-frame/Frame@1.5x-1.png"
              />
              <img
                alt=""
                width={1580}
                height={440}
                className="block shrink-0 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] w-auto -mr-[70px] sm:-mr-[90px] md:-mr-[110px] lg:-mr-[120px] pointer-events-none"
                src="/cloude-frame/Frame@1.5x-2.png"
              />
              <img
                alt=""
                width={1580}
                height={440}
                className="block shrink-0 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] w-auto -mr-[70px] sm:-mr-[90px] md:-mr-[110px] lg:-mr-[120px] pointer-events-none"
                src="/cloude-frame/Frame@1.5x-3.png"
              />
              <img
                alt=""
                width={1580}
                height={440}
                className="block shrink-0 h-[140px] sm:h-[180px] md:h-[220px] lg:h-[240px] w-auto -mr-[70px] sm:-mr-[90px] md:-mr-[110px] lg:-mr-[120px] pointer-events-none"
                src="/cloude-frame/Frame@1.5x-4.png"
              />
            </div>

            {/* White luminous body enhancement for clouds */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.45)_45%,rgba(255,255,255,0.88)_70%,#ffffff_88%,#F9F3EC_100%)]" />
          </div>

          {/* Solid seamless background trailing below the clouds to cover the video as clouds ascend */}
          <div className="w-full h-[150vh] bg-[#F9F3EC]" />
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
