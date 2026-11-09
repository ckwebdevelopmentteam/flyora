"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StraightCardsCarousel } from "@/components/ui/straight-cards-carousel";

export interface ShowcaseDestination {
  id: string;
  category: "International" | "Domestic";
  location: string;
  title: string;
  description: string;
  src: string;
  duration: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviewCount: number;
}

export const SHOWCASE_DESTINATIONS: ShowcaseDestination[] = [
  // International Destinations
  {
    id: "dest-cappadocia",
    category: "International",
    location: "Cappadocia, Türkiye",
    title: "Hot air balloon at sunrise.",
    description:
      "Drift peacefully above breathtaking fairy chimneys as the first rays of sunlight paint the sky in vibrant shades of gold and orange.",
    src: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=800&auto=format&fit=crop",
    duration: "5D & 4N",
    price: "₹64,500",
    originalPrice: "₹72,000",
    rating: 4.98,
    reviewCount: 142,
  },
  {
    id: "dest-amalfi",
    category: "International",
    location: "Positano, Amalfi Coast",
    title: "Pastel cliffs over azure waters.",
    description:
      "Wander fragrant lemon groves and cliffside Mediterranean balconies overlooking sun-drenched coastal waters, private yachts, and dramatic seaside vistas.",
    src: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop",
    duration: "6D & 5N",
    price: "₹88,900",
    originalPrice: "₹98,500",
    rating: 4.96,
    reviewCount: 118,
  },
  {
    id: "dest-kyoto",
    category: "International",
    location: "Kyoto & Arashiyama, Japan",
    title: "Lanterns in bamboo sanctuaries.",
    description:
      "Step into timeless tranquility among centuries-old wooden shrines, peaceful zen rock gardens, and private evening tea ceremonies steeped in ancient harmony.",
    src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
    duration: "7D & 6N",
    price: "₹94,500",
    originalPrice: "₹1,05,000",
    rating: 4.99,
    reviewCount: 165,
  },
  {
    id: "dest-swiss",
    category: "International",
    location: "Zermatt & Lucerne, Switzerland",
    title: "Glacier summits & scenic rail.",
    description:
      "Ascend through dramatic snow-capped alpine passes aboard world-renowned scenic railways, relaxing in five-star mountain chalets with panoramic Matterhorn views.",
    src: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop",
    duration: "7D & 6N",
    price: "₹1,18,000",
    originalPrice: "₹1,32,000",
    rating: 4.97,
    reviewCount: 194,
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
    duration: "5D & 4N",
    price: "₹24,500",
    originalPrice: "₹28,000",
    rating: 4.98,
    reviewCount: 210,
  },
  {
    id: "dest-kerala",
    category: "Domestic",
    location: "Alleppey & Munnar, Kerala",
    title: "Emerald backwaters & mist hills.",
    description:
      "Cruise tranquil palm-fringed canals aboard private luxury houseboats before ascending into cool mist-wrapped tea hills for the quintessential soul-refreshing retreat.",
    src: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
    duration: "5D & 4N",
    price: "₹22,900",
    originalPrice: "₹26,500",
    rating: 4.95,
    reviewCount: 178,
  },
  {
    id: "dest-rajasthan",
    category: "Domestic",
    location: "Udaipur & Jodhpur, Rajasthan",
    title: "Royal palaces & golden dunes.",
    description:
      "Experience royal Rajasthani hospitality with private heritage havelis, lake-palace sunset dining, and starlit desert camps under Thar skies.",
    src: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop",
    duration: "6D & 5N",
    price: "₹26,800",
    originalPrice: "₹31,000",
    rating: 4.97,
    reviewCount: 185,
  },
  {
    id: "dest-goa",
    category: "Domestic",
    location: "Goa & Hampi, India",
    title: "Golden shores & stone heritage.",
    description:
      "Unwind along sun-kissed Arabian Sea beaches and explore the mystical monolithic boulder ruins and UNESCO world heritage temples of historic Vijayanagara.",
    src: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
    duration: "4D & 3N",
    price: "₹18,500",
    originalPrice: "₹21,500",
    rating: 4.92,
    reviewCount: 240,
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
  const [baseCategory, setBaseCategory] = useState<
    "International" | "Domestic"
  >("International");
  const [incomingCategory, setIncomingCategory] = useState<
    "International" | "Domestic" | null
  >(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Preload background images so textures are 100% ready in memory
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img1 = new window.Image();
      img1.src = "/home/heifiltower.png";
      const img2 = new window.Image();
      img2.src = "/showcase/domestic-bg.jpg";
    }
  }, []);

  const filteredDestinations = SHOWCASE_DESTINATIONS.filter(
    (d) => d.category === activeCategory,
  );

  const handleIndexChange = (index: number) => {
    setActiveIndex(index);
  };

  const handleCategoryChange = (category: "International" | "Domestic") => {
    if (category === activeCategory) return;
    setActiveCategory(category);
    setActiveIndex(0);
    setIncomingCategory(category);
  };

  const current = filteredDestinations[activeIndex] || filteredDestinations[0];

  const getBgUrl = (cat: "International" | "Domestic") =>
    cat === "International"
      ? "/home/heifiltower.png"
      : "/showcase/domestic-bg.jpg";

  return (
    <section
      id="destination-packages"
      className={`relative w-full overflow-hidden flex flex-col justify-start scroll-mt-24 min-h-[600px] sm:min-h-[680px] lg:min-h-[820px] xl:min-h-[880px] ${className}`}
    >
      {/* Background Images Layer: Base + Smooth Center Expansion with ZERO Blink */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        {/* Permanent Base Layer (Always 100% visible underneath, never blinks) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${getBgUrl(baseCategory)}')` }}
        >
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
        </div>

        {/* Incoming Layer: Expands outward from the center over the base layer */}
        {incomingCategory && (
          <motion.div
            key={incomingCategory}
            initial={{
              clipPath: "inset(50px round 16px)",
              scale: 0.98,
            }}
            animate={{
              clipPath: "inset(0px round 0px)",
              scale: 1,
            }}
            transition={{
              duration: 1.25,
              ease: [0.22, 1, 0.36, 1], // luxurious, smooth slow-motion expansion
            }}
            onAnimationComplete={() => {
              setBaseCategory(incomingCategory);
              setIncomingCategory(null);
            }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${getBgUrl(incomingCategory)}')` }}
          >
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
          </motion.div>
        )}
      </div>

      {/* Main Showcase Content with 105px horizontal padding: ALWAYS on top at z-20 */}
      <div className="relative z-20 w-full px-4 sm:px-10 lg:px-[105px] flex flex-col justify-start py-8 sm:py-12 lg:py-16">
        {/* Centered Section Header: Honeymoon & Romantic Getaways */}
        <div className="w-full flex flex-col items-center text-center mb-6 lg:mb-8">
          <div className="inline-flex items-center px-3.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 mb-3 sm:mb-3.5 shadow-xs">
            <span className="text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-[0.22em] text-white/95">
              HONEYMOON & ROMANTIC GETAWAYS
            </span>
          </div>
          <h2 className="font-sans font-bold text-2xl sm:text-4xl lg:text-[44px] xl:text-[48px] text-white tracking-tight leading-[1.14] mb-3.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
            Curated Romantic Escapes Designed for Two
          </h2>
          <p className="text-xs sm:text-base text-white/85 max-w-2xl font-light leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]">
            Handcrafted international and domestic journeys crafted for couples
            and newlyweds — private retreats, sunset horizons, and intimate
            memories to last a lifetime.
          </p>
        </div>

        {/* Category Switcher: Placed on the right side with 'Destinations' plural */}
        <div className="w-full flex justify-end items-center mb-6 lg:mb-7 shrink-0">
          <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base tracking-wide">
            <button
              type="button"
              onClick={() => handleCategoryChange("International")}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 px-3.5 sm:px-6 py-2 sm:py-2.5 border-l border-r text-xs sm:text-sm md:text-base ${
                activeCategory === "International"
                  ? "bg-white text-neutral-950 font-bold shadow-md border-white"
                  : "border-white/70 hover:border-transparent text-white font-medium bg-black/35 backdrop-blur-md"
              }`}
            >
              {activeCategory !== "International" && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                />
              )}
              <span className="relative z-10 tracking-wide whitespace-nowrap">
                International
                <span className="hidden sm:inline">&nbsp;Destinations</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange("Domestic")}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 px-3.5 sm:px-6 py-2 sm:py-2.5 border-l border-r text-xs sm:text-sm md:text-base ${
                activeCategory === "Domestic"
                  ? "bg-white text-neutral-950 font-bold shadow-md border-white"
                  : "border-white/70 hover:border-transparent text-white font-medium bg-black/35 backdrop-blur-md"
              }`}
            >
              {activeCategory !== "Domestic" && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                />
              )}
              <span className="relative z-10 tracking-wide whitespace-nowrap">
                Domestic
                <span className="hidden sm:inline">&nbsp;Destinations</span>
              </span>
            </button>
          </div>
        </div>

        {/* Main Content Columns */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16">
          {/* =================================================================
              LEFT COLUMN: Active Destination Details (Smooth Fade & Slide)
              ================================================================= */}
          <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 flex flex-col justify-center text-left">
            <div className="relative min-h-[220px] sm:min-h-[240px] flex flex-col justify-start">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={`dest-info-${current.id}`}
                  initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
                  transition={{
                    duration: 2.0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex flex-col"
                >
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
                  <h2 className="font-serif text-xl sm:text-3xl lg:text-[44px] xl:text-[48px] font-normal text-white tracking-tight leading-[1.12] mb-3 sm:mb-4.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                    {current.title}
                  </h2>

                  {/* Description Text */}
                  <p className="text-xs sm:text-base text-white leading-relaxed mb-4 sm:mb-8 max-w-lg font-light drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                    {current.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Editorial Button with sliding blue background fill hover effect (100% Tailwind) */}
            <div>
              <button
                type="button"
                onClick={() =>
                  onOpenEnquiry
                    ? onOpenEnquiry(`${current.location}: ${current.title}`)
                    : undefined
                }
                className="group relative overflow-hidden inline-flex items-center px-4 sm:px-6 py-2 sm:py-2.5 border-l border-r border-white/70 hover:border-transparent text-white font-normal text-xs sm:text-base transition-all duration-300 cursor-pointer bg-black/15 backdrop-blur-[2px] shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                />
                <span className="relative z-10 tracking-wide group-hover:tracking-wider transition-all duration-200">
                  Explore the destination
                </span>
              </button>
            </div>
          </div>

          {/* =================================================================
              RIGHT COLUMN: StraightCardsCarousel (Smooth 60fps Spring Slide)
              ================================================================= */}
          <div className="w-full lg:flex-1 min-w-0">
            <StraightCardsCarousel
              items={filteredDestinations}
              activeIndex={activeIndex}
              onIndexChange={handleIndexChange}
              onSelectLead={(item) =>
                onOpenEnquiry
                  ? onOpenEnquiry(`${item.location}: ${item.title}`)
                  : undefined
              }
              footerRight={
                <a
                  href="/tours"
                  className="group relative overflow-hidden inline-flex items-center justify-center h-10 sm:h-11 px-5 sm:px-6 border-l border-r border-white/70 hover:border-transparent text-white font-normal text-sm sm:text-base tracking-wide transition-all duration-300 cursor-pointer bg-black/15 backdrop-blur-[2px] select-none whitespace-nowrap shadow-sm"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[#002f89] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
                  />
                  <span className="relative z-10 tracking-wide group-hover:tracking-wider transition-all duration-200">
                    View all destinations
                  </span>
                </a>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
