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
      className={`relative w-full min-h-[84vh] lg:min-h-[86vh] overflow-hidden flex flex-col justify-start ${className}`}
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

        {/* Domestic Background */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
            activeCategory === "Domestic" ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('/showcase/domestic-bg.jpg')` }}
        />

        {/* White overlay effect setup to soften the background image and make cards pop */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1.5px] pointer-events-none" />

        {/* Luminous soft white highlight behind the cards */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-2/3 h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.15)_50%,transparent_80%)] pointer-events-none" />

        {/* Left side contrast gradient ensuring typography and buttons are crystal clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent pointer-events-none" />
      </div>

      {/* Main Showcase Content with 105px padding on both sides and 10px padding bottom */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-start px-6 sm:px-10 lg:px-[105px] pt-8 lg:pt-6 pb-[10px]">
        {/* Top-Right Category Switcher matching reference UI */}
        <div className="w-full flex justify-end items-center mb-4 lg:mb-3 shrink-0">
          <div className="inline-flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => handleCategoryChange("International")}
              className={`cursor-pointer transition-all duration-200 ${
                activeCategory === "International"
                  ? "bg-white text-black px-4 py-1.5 rounded-[2px] font-medium shadow-sm"
                  : "text-white/80 hover:text-white px-3 py-1.5 font-medium"
              }`}
            >
              International Destination
            </button>
            <span className="text-white/40 text-xs sm:text-sm select-none">
              |
            </span>
            <button
              type="button"
              onClick={() => handleCategoryChange("Domestic")}
              className={`cursor-pointer transition-all duration-200 ${
                activeCategory === "Domestic"
                  ? "bg-white text-black px-4 py-1.5 rounded-[2px] font-medium shadow-sm"
                  : "text-white/80 hover:text-white px-3 py-1.5 font-medium"
              }`}
            >
              Domestic Destination
            </button>
          </div>
        </div>

        {/* Main Content Columns */}
        <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16">
          {/* =================================================================
              LEFT COLUMN: Active Destination Details
              ================================================================= */}
          <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 flex flex-col justify-center text-left">
            {/* Category / Location Eyebrow */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase tracking-[0.2em] font-mono text-white/70">
                {current.category} Tour
              </span>
              <span className="text-white/40">•</span>
              <span className="text-sm sm:text-base text-white/90 font-medium tracking-wide">
                {current.location}
              </span>
            </div>

            {/* Main Heading Title */}
            <h2
              key={`title-${current.id}`}
              className="font-serif text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-normal text-white tracking-tight leading-[1.12] mb-4.5 transition-all duration-300 drop-shadow-sm"
            >
              {current.title}
            </h2>

            {/* Description Text */}
            <p
              key={`desc-${current.id}`}
              className="text-sm sm:text-base text-white/80 leading-relaxed mb-8 max-w-lg font-light transition-all duration-300 drop-shadow-sm"
            >
              {current.description}
            </p>

            {/* Editorial Button */}
            <div>
              <button
                type="button"
                onClick={() =>
                  onOpenEnquiry
                    ? onOpenEnquiry(`${current.location}: ${current.title}`)
                    : undefined
                }
                className="inline-flex items-center px-6 py-2.5 border-l border-r border-white/60 hover:border-white text-white font-normal text-sm sm:text-base transition-all cursor-pointer group bg-transparent hover:bg-white/10"
              >
                <span className="tracking-wide group-hover:tracking-wider transition-all duration-200">
                  Explore the destination
                </span>
              </button>
            </div>
          </div>

          {/* =================================================================
              RIGHT COLUMN: TiltCascadeCarousel (Taller portrait cards)
              ================================================================= */}
          <div className="w-full lg:flex-1 h-full min-h-[530px] sm:min-h-[570px] lg:min-h-[590px] flex items-center justify-center min-w-0">
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
                  className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-xs sm:text-sm font-medium tracking-wide transition-all group py-1 px-3 rounded-full hover:bg-white/10 select-none cursor-pointer"
                >
                  <span className="hover:underline underline-offset-4">
                    View all destinations
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
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
