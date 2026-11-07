"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DestinationSlide {
  id: string;
  title: string;
  desc: string;
  image: string;
  copyright: string;
}

export const FEATURED_DESTINATIONS_DATA: DestinationSlide[] = [
  {
    id: "swiss",
    title: "Swiss Alps, Switzerland",
    desc: "Dramatic snow-draped alpine peaks, glistening mountain lakes, and world-class chalet retreats nestled amidst the iconic beauty of the European Alps.",
    image: "/destinations/switzerland_hd.jpg",
    copyright: "Flyora Curated",
  },
  {
    id: "kyoto",
    title: "Kyoto, Japan",
    desc: "Tranquil Arashiyama bamboo groves, historic golden pavilions, and timeless tea ceremonies embodying centuries of authentic Japanese culture.",
    image: "/destinations/kyoto_hd.jpg",
    copyright: "Flyora Curated",
  },
  {
    id: "tulum",
    title: "Tulum, Mexico",
    desc: "Sun-drenched Mayan ruins perched atop coastal cliffs, secluded crystal cenotes, and bohemian beachfront luxury along the Caribbean Sea.",
    image: "/destinations/tulum_hd.jpg",
    copyright: "Flyora Curated",
  },
  {
    id: "maldives",
    title: "Maldives Islands",
    desc: "Private overwater villas floating on crystal turquoise lagoons, vibrant coral reefs, and pristine white-sand shores designed for total serenity.",
    image: "/destinations/maldives_hd.jpg",
    copyright: "Flyora Curated",
  },
  {
    id: "rome",
    title: "Rome, Italy",
    desc: "The timeless grandeur of the Colosseum, sunlit Renaissance piazzas, and world-renowned Italian culinary art in the heart of the Eternal City.",
    image: "/destinations/rome_hd.jpg",
    copyright: "Flyora Curated",
  },
  {
    id: "bali",
    title: "Bali, Indonesia",
    desc: "Emerald tiered rice terraces in Ubud, sacred cliffside sea temples in Uluwatu, and holistic sanctuary retreats in a tropical paradise.",
    image: "/destinations/bali_hd.jpg",
    copyright: "Flyora Curated",
  },
  {
    id: "dubai",
    title: "Dubai, UAE",
    desc: "Futuristic desert architectural wonders, Michelin-starred skyline dining, and opulent luxury retreats nestled amidst golden Arabian dunes.",
    image: "/destinations/dubai_hd.jpg",
    copyright: "Flyora Curated",
  },
  {
    id: "lisbon",
    title: "Lisbon, Portugal",
    desc: "Pastel-hued hills overlooking the Tagus River, historic vintage trams navigating Alfama, and vibrant coastal viewpoints rich in maritime heritage.",
    image: "/destinations/lisbon_hd.jpg",
    copyright: "Flyora Curated",
  },
];

export const SCANDINAVIA_DESTINATIONS = FEATURED_DESTINATIONS_DATA;

interface ExploreScandinaviaShowcaseProps {
  onOpenEnquiry?: (destination: string) => void;
}

export default function ExploreScandinaviaShowcase({
  onOpenEnquiry,
}: ExploreScandinaviaShowcaseProps) {
  const TOTAL = FEATURED_DESTINATIONS_DATA.length;
  // Middle set starts at index TOTAL. Default active index is slide 0 (Swiss Alps)
  const INITIAL_INDEX = TOTAL + 0;
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [hoveredCopyright, setHoveredCopyright] = useState<number | null>(null);

  // Sizing tuned for decreased card width matching reference proportions
  const [dimensions, setDimensions] = useState({
    activeWidth: 410,
    inactiveWidth: 310,
    activePhotoHeight: 520,
    inactivePhotoHeight: 460,
    inactiveTopOffset: 20,
    cardGap: 36,
    buttonOffset: 64,
  });

  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isDragging = useRef(false);

  const updateDimensions = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    if (w < 640) {
      setDimensions({
        activeWidth: Math.min(290, Math.max(240, w - 100)),
        inactiveWidth: Math.min(200, Math.max(160, w - 190)),
        activePhotoHeight: 340,
        inactivePhotoHeight: 280,
        inactiveTopOffset: 12,
        cardGap: 14,
        buttonOffset: 20,
      });
    } else if (w < 1024) {
      setDimensions({
        activeWidth: 360,
        inactiveWidth: 270,
        activePhotoHeight: 450,
        inactivePhotoHeight: 390,
        inactiveTopOffset: 16,
        cardGap: 24,
        buttonOffset: 50,
      });
    } else {
      setDimensions({
        activeWidth: 410,
        inactiveWidth: 310,
        activePhotoHeight: 520,
        inactivePhotoHeight: 460,
        inactiveTopOffset: 20,
        cardGap: 36,
        buttonOffset: 64,
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  // Seamless wrap-around when reaching boundaries
  const handleTransitionEnd = () => {
    if (currentIndex >= TOTAL * 2) {
      setIsTransitioning(false);
      setCurrentIndex((idx) => idx - TOTAL);
    } else if (currentIndex < TOTAL) {
      setIsTransitioning(false);
      setCurrentIndex((idx) => idx + TOTAL);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  const handlePrev = () => {
    setIsTransitioning(true);
    setCurrentIndex((idx) => idx - 1);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((idx) => idx + 1);
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (touchDeltaX.current > 40) {
      handlePrev();
    } else if (touchDeltaX.current < -40) {
      handleNext();
    }
  };

  // 3 complete cycles = 21 items total
  const allSlides = Array.from({ length: TOTAL * 3 }, (_, i) => {
    const rawIdx = i % TOTAL;
    return {
      index: i,
      rawIdx,
      ...SCANDINAVIA_DESTINATIONS[rawIdx],
    };
  });

  const {
    activeWidth,
    inactiveWidth,
    activePhotoHeight,
    inactivePhotoHeight,
    inactiveTopOffset,
    cardGap,
    buttonOffset,
  } = dimensions;

  // Exact centered track calculation
  const slideWidths = allSlides.map((s) =>
    s.index === currentIndex ? activeWidth : inactiveWidth,
  );

  let activeCenterFromTrackLeft = 0;
  for (let i = 0; i < currentIndex; i++) {
    activeCenterFromTrackLeft += slideWidths[i] + cardGap;
  }
  activeCenterFromTrackLeft += activeWidth / 2;

  return (
    <div
      className="relative w-full pt-1 pb-14 sm:pt-2 sm:pb-16 lg:pt-2 lg:pb-20 overflow-hidden select-none bg-white"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header (Top-Left matching site starting column, font, and styling used in other sections) */}
      <div className="relative z-10 w-full px-4 sm:px-10 lg:px-[105px] mb-6 sm:mb-9 lg:mb-10">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A7167] block mb-1 sm:mb-1.5">
          FEATURED DESTINATIONS
        </span>
        <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-normal text-[#1E1A17] tracking-tight">
          Explore Featured Destinations
        </h2>
      </div>

      {/* Cards Carousel Viewport with Navigation Arrow Buttons flanking the Selected Center Card */}
      <div className="relative z-10 w-full overflow-hidden py-2 sm:py-3 pb-8">
        {/* Left Arrow Button matching Popular Packages section arrow mark and hover effect */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous destination"
          style={{
            left: `calc(50% - ${activeWidth / 2 + buttonOffset}px)`,
            top: `${activePhotoHeight + 85}px`,
          }}
          className="group relative overflow-hidden absolute -translate-x-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 p-0 m-0 border border-neutral-300/90 hover:border-transparent bg-white text-[#1E1A17] hover:text-white rounded-md grid place-items-center transition-all duration-300 cursor-pointer shadow-md active:scale-95"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
          />
          <span className="relative z-10 flex items-center justify-center">
            <ChevronLeft className="h-4 w-4 stroke-[2.4]" />
          </span>
        </button>

        {/* Right Arrow Button matching Popular Packages section arrow mark and hover effect */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next destination"
          style={{
            left: `calc(50% + ${activeWidth / 2 + buttonOffset}px)`,
            top: `${activePhotoHeight + 85}px`,
          }}
          className="group relative overflow-hidden absolute -translate-x-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 p-0 m-0 border border-neutral-300/90 hover:border-transparent bg-white text-[#1E1A17] hover:text-white rounded-md grid place-items-center transition-all duration-300 cursor-pointer shadow-md active:scale-95"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
          />
          <span className="relative z-10 flex items-center justify-center">
            <ChevronRight className="h-4 w-4 stroke-[2.4]" />
          </span>
        </button>

        {/* Sliding Track */}
        <div
          className="flex items-start"
          style={{
            transform: `translate3d(calc(50% - ${activeCenterFromTrackLeft}px), 0, 0)`,
            transition: isTransitioning
              ? "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
            gap: `${cardGap}px`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {allSlides.map((slide) => {
            const isActive = slide.index === currentIndex;
            const currentCardWidth = isActive ? activeWidth : inactiveWidth;

            return (
              <div
                key={`slide-${slide.index}`}
                style={{
                  width: `${currentCardWidth}px`,
                  transition: isTransitioning
                    ? "width 500ms cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                }}
                className="shrink-0 flex flex-col"
              >
                {isActive ? (
                  /* =========================================================
                     ACTIVE SELECTED CARD (Elevated white card + photo + text box)
                     ========================================================= */
                  <div className="w-full bg-white shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-none overflow-hidden transition-all duration-500">
                    {/* Tall Photo with dual-layer framed effect */}
                    <div
                      style={{
                        height: `${activePhotoHeight}px`,
                        transition: isTransitioning
                          ? "height 500ms cubic-bezier(0.22, 1, 0.36, 1)"
                          : "none",
                      }}
                      className="relative w-full overflow-hidden p-3 sm:p-3.5 bg-white"
                    >
                      {/* Vignetted frame background */}
                      <div
                        className="absolute inset-0 bg-cover bg-center filter brightness-75 scale-110"
                        style={{ backgroundImage: `url('${slide.image}')` }}
                      />
                      {/* Crisp inner photo */}
                      <div
                        className="relative w-full h-full bg-cover bg-center shadow-xs"
                        style={{ backgroundImage: `url('${slide.image}')` }}
                      />

                      {/* Expandable Copyright Pill */}
                      <div
                        onMouseEnter={() => setHoveredCopyright(slide.index)}
                        onMouseLeave={() => setHoveredCopyright(null)}
                        className="absolute top-4 left-4 z-20 flex items-center bg-black/60 backdrop-blur-xs text-white rounded-full px-2.5 py-1 text-[11.5px] cursor-pointer transition-all duration-300 shadow-sm"
                      >
                        <span className="font-montaga font-normal">©</span>
                        <span
                          className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
                            hoveredCopyright === slide.index
                              ? "max-w-[160px] ml-1.5 opacity-100"
                              : "max-w-0 opacity-0"
                          }`}
                        >
                          {slide.copyright}
                        </span>
                      </div>
                    </div>

                    {/* Content Box beneath photo */}
                    <div className="p-4 sm:p-5 lg:p-6 bg-white animate-in fade-in duration-300">
                      <h3 className="font-montaga text-lg sm:text-xl lg:text-[23px] text-[#2D540E] font-normal leading-snug">
                        {slide.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] lg:text-[13.5px] text-[#3D3A36] leading-relaxed mt-1.5 sm:mt-2 mb-3 sm:mb-4 font-normal max-w-[370px]">
                        {slide.desc}
                      </p>

                      {/* Action Link: "Find out more ──>" */}
                      <button
                        type="button"
                        onClick={() =>
                          onOpenEnquiry ? onOpenEnquiry(slide.title) : undefined
                        }
                        className="inline-flex items-center gap-2 group/btn cursor-pointer text-[#2D540E] hover:text-[#1e3b09] select-none text-left"
                      >
                        <span className="text-xs sm:text-[13.5px] font-normal tracking-wide">
                          Find out more
                        </span>
                        <svg
                          viewBox="0 0 52 8"
                          className="w-7 h-2.5 fill-current transition-all duration-300 group-hover/btn:translate-x-2 group-hover/btn:w-9"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M49.793,3.182l-2.328,-2.328c-0.196,-0.196 -0.196,-0.512 -0,-0.708c0.195,-0.195 0.511,-0.195 0.707,0l3.182,3.182c0.195,0.196 0.195,0.512 -0,0.708l-3.182,3.182c-0.196,0.195 -0.512,0.195 -0.707,-0c-0.196,-0.196 -0.196,-0.512 -0,-0.708l2.328,-2.328l-49.793,-0l0,-1l49.793,-0Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* =========================================================
                     INACTIVE FLANKING CARDS (Smaller, photo-only)
                     ========================================================= */
                  <div
                    onClick={() => {
                      setIsTransitioning(true);
                      setCurrentIndex(slide.index);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${slide.title}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsTransitioning(true);
                        setCurrentIndex(slide.index);
                      }
                    }}
                    style={{
                      height: `${inactivePhotoHeight}px`,
                      marginTop: `${inactiveTopOffset}px`,
                      transition: isTransitioning
                        ? "height 500ms cubic-bezier(0.22, 1, 0.36, 1), margin-top 500ms cubic-bezier(0.22, 1, 0.36, 1)"
                        : "none",
                    }}
                    className="w-full relative cursor-pointer transition-shadow duration-300 overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.14)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.2)] group/card"
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 pointer-events-none select-none"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover/card:bg-transparent transition-colors duration-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
