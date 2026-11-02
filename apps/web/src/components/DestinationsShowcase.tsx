"use client";

import React, { useState, useTransition } from "react";
import TiltCascadeCarousel, {
  type TiltCascadeItem,
} from "@/components/ui/tilt-cascade-carousel";

export interface ShowcaseDestination {
  id: string;
  category: "International" | "Domestic";
  location: string;
  title: string;
  description: string;
  src: string;
}

export const SHOWCASE_DESTINATIONS: ShowcaseDestination[] = [
  // International Destinations
  {
    id: "dest-cappadocia",
    category: "International",
    location: "Cappadocia, Türkiye",
    title: "Hot air balloon at sunrise.",
    description:
      "Drift peacefully above breathtaking landscapes as the first rays of sunlight paint the sky in vibrant shades of gold and orange. A sunrise hot air balloon ride offers unforgettable panoramic views and a truly magical start to your day.",
    src: "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "dest-amalfi",
    category: "International",
    location: "Positano, Amalfi Coast",
    title: "Pastel cliffs over azure waters.",
    description:
      "Wander fragrant lemon groves and cliffside Mediterranean balconies overlooking sun-drenched coastal waters, private yachts, and dramatic seaside vistas.",
    src: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "dest-kyoto",
    category: "International",
    location: "Kyoto & Arashiyama, Japan",
    title: "Lanterns in bamboo sanctuaries.",
    description:
      "Step into timeless tranquility among centuries-old wooden shrines, peaceful zen rock gardens, and private evening tea ceremonies steeped in ancient harmony.",
    src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "dest-swiss",
    category: "International",
    location: "Zermatt & Lucerne, Switzerland",
    title: "Glacier summits & scenic rail.",
    description:
      "Ascend through dramatic snow-capped alpine passes aboard world-renowned scenic railways, relaxing in five-star mountain chalets with panoramic Matterhorn views.",
    src: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop",
  },

  // Domestic Destinations
  {
    id: "dest-kashmir",
    category: "Domestic",
    location: "Srinagar & Gulmarg, Kashmir",
    title: "Shikara gliding on Dal Lake.",
    description:
      "Float through peaceful morning waters surrounded by snow-draped Himalayan peaks, floating lotus gardens, and historic cedar wood houseboats in the crown jewel of India.",
    src: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "dest-kerala",
    category: "Domestic",
    location: "Alleppey & Munnar, Kerala",
    title: "Emerald backwaters & mist hills.",
    description:
      "Cruise tranquil palm-fringed canals aboard private luxury houseboats before ascending into cool mist-wrapped tea hills for the quintessential soul-refreshing retreat.",
    src: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "dest-rajasthan",
    category: "Domestic",
    location: "Udaipur & Jodhpur, Rajasthan",
    title: "Royal palaces & golden dunes.",
    description:
      "Experience royal Rajasthani hospitality with private heritage havelis, lake-palace sunset dining, and starlit desert camps under Thar skies.",
    src: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "dest-goa",
    category: "Domestic",
    location: "Goa & Hampi, India",
    title: "Golden shores & stone heritage.",
    description:
      "Unwind along sun-kissed Arabian Sea beaches and explore the mystical monolithic boulder ruins and UNESCO world heritage temples of historic Vijayanagara.",
    src: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
  },
];

interface DestinationsShowcaseProps {
  onOpenEnquiry?: (destination?: string) => void;
  className?: string;
}

export function DestinationsShowcase({
  onOpenEnquiry,
  className = "",
}: DestinationsShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<
    "International" | "Domestic"
  >("International");
  const [activeIndex, setActiveIndex] = useState(0);
  const [, startTransition] = useTransition();

  const filteredDestinations = SHOWCASE_DESTINATIONS.filter(
    (d) => d.category === activeCategory,
  );

  const handleIndexChange = (index: number) => {
    startTransition(() => {
      setActiveIndex(index);
    });
  };

  const handleCategoryChange = (category: "International" | "Domestic") => {
    setActiveCategory(category);
    setActiveIndex(0);
  };

  const current = filteredDestinations[activeIndex] || filteredDestinations[0];

  const carouselItems: TiltCascadeItem[] = filteredDestinations.map((d) => ({
    title: d.location,
    caption: d.title,
    src: d.src,
    alt: `${d.location} - ${d.title}`,
  }));

  return (
    <section
      id="destination-packages"
      className={`relative w-full overflow-hidden flex flex-col justify-start ${className}`}
    >
      {/* Background Images Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* International Background */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
            activeCategory === "International" ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('/showcase/international-bg.jpg')` }}
        />

        {/* Domestic Background (with subtle additional darkening) */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
            activeCategory === "Domestic" ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('/showcase/domestic-bg.jpg')` }}
        >
          {/* Subtle extra darkening specifically for domestic image */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>

        {/* Exactly 10% overlay so original vibrant image colors shine through naturally */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      {/* Main Showcase Content with 105px padding on both sides and 10px padding bottom */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-[105px] flex flex-col justify-start pt-10 lg:pt-8 pb-[10px]">
        {/* Top-Right Category Switcher: 4 lines total (each button has 2 vertical lines: border-l & border-r) */}
        <div className="w-full flex justify-end items-center mb-5 lg:mb-4 shrink-0">
          <div className="inline-flex items-center gap-3 sm:gap-4 text-xs sm:text-sm tracking-wide">
            <button
              type="button"
              onClick={() => handleCategoryChange("International")}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 px-5 sm:px-6 py-2 sm:py-2.5 border-l border-r ${
                activeCategory === "International"
                  ? "bg-white text-black font-semibold shadow-sm border-white"
                  : "border-white/60 hover:border-transparent text-white/90 hover:text-white font-normal bg-black/10"
              }`}
            >
              {activeCategory !== "International" && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#463D34] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                />
              )}
              <span className="relative z-10 tracking-wide">
                International Destination
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange("Domestic")}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 px-5 sm:px-6 py-2 sm:py-2.5 border-l border-r ${
                activeCategory === "Domestic"
                  ? "bg-white text-black font-semibold shadow-sm border-white"
                  : "border-white/60 hover:border-transparent text-white/90 hover:text-white font-normal bg-black/10"
              }`}
            >
              {activeCategory !== "Domestic" && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#463D34] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                />
              )}
              <span className="relative z-10 tracking-wide">
                Domestic Destination
              </span>
            </button>
          </div>
        </div>

        {/* Main Content Columns */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16">
          {/* =================================================================
              LEFT COLUMN: Active Destination Details
              ================================================================= */}
          <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 flex flex-col justify-center text-left">
            {/* Category / Location Eyebrow */}
            <div className="flex items-center gap-2 mb-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
              <span className="text-xs uppercase tracking-[0.2em] font-mono text-white/90">
                {current.category} Tour
              </span>
              <span className="text-white/60">•</span>
              <span className="text-sm sm:text-base text-white font-medium tracking-wide">
                {current.location}
              </span>
            </div>

            {/* Main Heading Title */}
            <h2
              key={`title-${current.id}`}
              className="font-serif text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-normal text-white tracking-tight leading-[1.12] mb-4.5 transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
            >
              {current.title}
            </h2>

            {/* Description Text */}
            <p
              key={`desc-${current.id}`}
              className="text-sm sm:text-base text-white leading-relaxed mb-8 max-w-lg font-light transition-all duration-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]"
            >
              {current.description}
            </p>

            {/* Editorial Button with sliding brown background fill hover effect (100% Tailwind) */}
            <div>
              <button
                type="button"
                onClick={() =>
                  onOpenEnquiry
                    ? onOpenEnquiry(`${current.location}: ${current.title}`)
                    : undefined
                }
                className="group relative overflow-hidden inline-flex items-center px-6 py-2.5 border-l border-r border-white/70 hover:border-transparent text-white font-normal text-sm sm:text-base transition-all duration-300 cursor-pointer bg-black/15 backdrop-blur-[2px] shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#463D34] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                />
                <span className="relative z-10 tracking-wide group-hover:tracking-wider transition-all duration-200">
                  Explore the destination
                </span>
              </button>
            </div>
          </div>

          {/* =================================================================
              RIGHT COLUMN: TiltCascadeCarousel (Taller portrait cards)
              ================================================================= */}
          <div className="w-full lg:flex-1 h-[530px] sm:h-[570px] lg:h-[590px] flex items-center justify-center min-w-0">
            <TiltCascadeCarousel
              key={activeCategory}
              items={carouselItems}
              height="100%"
              slideSize="clamp(235px, 20vw, 295px)"
              aspectRatio="3/4"
              angle={18}
              drop={0.25}
              inactiveScale={0.72}
              radius={20}
              bounce={0.2}
              duration={0.75}
              loop={true}
              autoplay={0}
              titles={false}
              captions={false}
              controls={true}
              footerRight={
                <a
                  href="/tours"
                  className="group relative overflow-hidden inline-flex items-center px-6 py-2.5 border-l border-r border-white/70 hover:border-transparent text-white font-normal text-sm sm:text-base tracking-wide transition-all duration-300 cursor-pointer bg-black/15 backdrop-blur-[2px] select-none whitespace-nowrap shadow-sm"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[#463D34] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                  />
                  <span className="relative z-10 tracking-wide group-hover:tracking-wider transition-all duration-200">
                    View all destinations
                  </span>
                </a>
              }
              background="transparent"
              color="#ffffff"
              index={activeIndex}
              onIndexChange={handleIndexChange}
              onSelect={(item, i) =>
                onOpenEnquiry
                  ? onOpenEnquiry(
                      `${filteredDestinations[i]?.location || item.title}`,
                    )
                  : undefined
              }
              ariaLabel="International and Domestic Tour Packages Carousel"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
