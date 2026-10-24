"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  Palmtree,
  Ship,
  Palette,
  Users,
  Heart,
  SlidersHorizontal,
  Shuffle,
  ArrowRight,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";
import { EnquiryModal } from "./EnquiryModal";

interface CardItem {
  id: string;
  type: "guide" | "advisor_text" | "advisor_avatar" | "destination_badge";
  title: string;
  serifTitle?: string;
  subtitle?: string;
  categories: string[];
  imageUrl?: string;
  avatarUrl?: string;
  badgeText?: string;
  authorBadge?: string;
  aspectRatio?: string;
}

const INITIAL_CARDS: CardItem[] = [
  {
    id: "china",
    type: "guide",
    title: "Definitive Guide: China",
    serifTitle: "Definitive Guide: China",
    categories: ["culture", "family"],
    imageUrl:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80",
    badgeText: "FLYORA",
  },
  {
    id: "garry-olivia",
    type: "advisor_text",
    title: "Garry x Olivia",
    subtitle: "Group Travel, Luxury Travel, +4 more",
    categories: ["family", "honeymoons"],
  },
  {
    id: "indonesia",
    type: "guide",
    title: "Definitive Guide: Indonesia",
    serifTitle: "Definitive Guide: Indonesia",
    categories: ["beaches", "honeymoons"],
    imageUrl:
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
    badgeText: "FLYORA",
  },
  {
    id: "italy",
    type: "destination_badge",
    title: "Cinque Terre & Amalfi Coast",
    badgeText: "ITALY",
    categories: ["culture", "honeymoons"],
    imageUrl:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "brazil",
    type: "guide",
    title: "Definitive Guide: Brazil",
    serifTitle: "Definitive Guide: Brazil",
    categories: ["beaches", "culture"],
    imageUrl:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80",
    badgeText: "FLYORA",
  },
  {
    id: "chile",
    type: "guide",
    title: "Definitive Guide: Chile",
    serifTitle: "Definitive Guide: Chile",
    categories: ["cruises", "family"],
    imageUrl:
      "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=800&q=80",
    badgeText: "FLYORA",
  },
  {
    id: "stephanie-bloom",
    type: "advisor_avatar",
    title: "Stephanie Bloom",
    subtitle: "Luxury Travel, London, +4",
    categories: ["honeymoons", "cruises"],
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "aspen",
    type: "guide",
    title: "The Ultimate Guide to Spas in Aspen",
    serifTitle: "The Ultimate Guide to Spas in Aspen",
    authorBadge: "NATALIE KURTZMAN",
    categories: ["honeymoons", "culture"],
    imageUrl:
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80",
  },
];

export const ExploreView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cards, setCards] = useState<CardItem[]>(INITIAL_CARDS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedDestinationTitle, setSelectedDestinationTitle] = useState<
    string | undefined
  >(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick filters definition matching the screenshot
  const categories = [
    { id: "beaches", label: "Beaches", icon: Palmtree },
    { id: "cruises", label: "Cruises", icon: Ship },
    { id: "culture", label: "Arts & Culture", icon: Palette },
    { id: "family", label: "Family", icon: Users },
    { id: "honeymoons", label: "Honeymoons", icon: Heart },
  ];

  // Filtering logic
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesCategory =
        !selectedCategory || card.categories.includes(selectedCategory);
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesText =
        card.title.toLowerCase().includes(query) ||
        (card.subtitle && card.subtitle.toLowerCase().includes(query)) ||
        (card.badgeText && card.badgeText.toLowerCase().includes(query)) ||
        (card.authorBadge && card.authorBadge.toLowerCase().includes(query));

      return matchesCategory && matchesText;
    });
  }, [cards, selectedCategory, searchQuery]);

  // Shuffle handler
  const handleShuffle = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleCardClick = (title: string) => {
    setSelectedDestinationTitle(title);
    setIsMatchModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F3EC] text-zinc-900 selection:bg-[#463d34] selection:text-white pb-28">
      {/* 1. Explore Floating Navbar (Pixel-perfect matching screenshot) */}
      <header className="sticky top-6 sm:top-8 z-40 px-4 sm:px-8 w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.05)] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Left: Brand Logo & EXPLORE Label (Clean gap, matching screenshot) */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link
              href="/"
              className="flex items-center group transition-opacity hover:opacity-85"
            >
              <span className="font-serif text-[22px] sm:text-[24px] tracking-[0.2em] font-normal uppercase text-[#1C1815]">
                FLYORA
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[11.5px] font-sans font-semibold uppercase tracking-[0.14em] text-[#38312B] select-none">
              EXPLORE
            </span>
          </div>

          {/* Center: Search Input Bar */}
          <div className="flex-1 max-w-xl mx-1 sm:mx-3">
            <div className="relative bg-[#F8F3EC] hover:bg-[#F3ECE3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#463d34]/20 border border-[#EFE8DF] rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2.5 transition-all">
              <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0 stroke-[2]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Discover destinations, advisors, and more"
                aria-label="Discover destinations, advisors, and more"
                className="w-full bg-transparent text-xs sm:text-[13px] text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: GET MATCHED Button & Hamburger Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedDestinationTitle(undefined);
                setIsMatchModalOpen(true);
              }}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-md bg-[#463d34] hover:bg-[#38312a] active:bg-[#2b2520] text-white text-[11px] sm:text-[11.5px] font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-200 shadow-xs cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <span className="hidden sm:inline">GET MATCHED</span>
              <span className="sm:hidden">MATCH</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="p-2 rounded-lg text-[#38312B] hover:text-black hover:bg-zinc-100 transition"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[1.75]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[1.75]" />
              )}
            </button>
          </div>
        </div>

        {/* Slide-out Menu (when hamburger is clicked) */}
        {mobileMenuOpen && (
          <div className="mt-2 bg-white rounded-2xl border border-black/[0.06] shadow-xl p-5 animate-in slide-in-from-top-2 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Menu Navigation
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-medium uppercase tracking-wider text-zinc-700">
              <Link
                href="/"
                className="p-2.5 rounded-lg hover:bg-zinc-50 hover:text-black transition"
              >
                Home
              </Link>
              <Link
                href="/explore"
                className="p-2.5 rounded-lg bg-zinc-100 text-black font-semibold transition"
              >
                Explore Destinations
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsMatchModalOpen(true);
                }}
                className="text-left p-2.5 rounded-lg hover:bg-zinc-50 hover:text-black transition"
              >
                Find an Advisor
              </button>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg hover:bg-zinc-50 text-zinc-500 transition"
              >
                Staff Portal ↗
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. Sub-Navbar Filter Bar (Pills Row) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Category Filter Pills */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Magnifying glass button (resets search/clears category filter) */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery("");
              }}
              title="Show all destinations"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition cursor-pointer shadow-2xs ${
                !selectedCategory && !searchQuery
                  ? "bg-[#463d34] text-white border-[#463d34]"
                  : "bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200/90"
              }`}
            >
              <Search className="w-3.5 h-3.5 stroke-[2]" />
            </button>

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : cat.id)
                  }
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap ${
                    isSelected
                      ? "bg-[#463d34] text-white border-[#463d34] shadow-xs"
                      : "bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200/90"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Pills (Filter count & Shuffle) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200/90 shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Filter ({filterCount})</span>
            </button>

            <button
              onClick={handleShuffle}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200/90 shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Shuffle className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Editorial Masonry Grid (4 Columns on Desktop matching screenshot) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        {filteredCards.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-zinc-200/80 p-8">
            <p className="text-base font-serif font-medium text-zinc-800 mb-2">
              No results found for &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-xs text-zinc-500 mb-4">
              Try searching for &quot;China&quot;, &quot;Indonesia&quot;,
              &quot;Italy&quot;, &quot;Brazil&quot;, &quot;Chile&quot;, or
              &quot;Aspen&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#463d34] text-white text-xs font-medium uppercase tracking-wider"
            >
              Clear Search &amp; Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-start">
            {/* Column 1 */}
            <div className="flex flex-col gap-4 sm:gap-5">
              {filteredCards
                .filter((_, i) => i % 4 === 0)
                .map((card) => (
                  <CardRender
                    key={card.id}
                    card={card}
                    onSelect={handleCardClick}
                  />
                ))}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4 sm:gap-5">
              {filteredCards
                .filter((_, i) => i % 4 === 1)
                .map((card) => (
                  <CardRender
                    key={card.id}
                    card={card}
                    onSelect={handleCardClick}
                  />
                ))}
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4 sm:gap-5">
              {filteredCards
                .filter((_, i) => i % 4 === 2)
                .map((card) => (
                  <CardRender
                    key={card.id}
                    card={card}
                    onSelect={handleCardClick}
                  />
                ))}
            </div>

            {/* Column 4 */}
            <div className="flex flex-col gap-4 sm:gap-5">
              {filteredCards
                .filter((_, i) => i % 4 === 3)
                .map((card) => (
                  <CardRender
                    key={card.id}
                    card={card}
                    onSelect={handleCardClick}
                  />
                ))}
            </div>
          </div>
        )}
      </main>

      {/* 4. Bottom Floating Action Pill: "Get matched →" */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => {
            setSelectedDestinationTitle(undefined);
            setIsMatchModalOpen(true);
          }}
          className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full border border-black/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-xl text-xs font-medium text-zinc-900 hover:bg-white active:scale-95 transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span>Get matched</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 5. Filter Modal */}
      {isFilterModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFilterModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-serif text-lg font-medium text-zinc-900">
                Filter Destinations &amp; Guides
              </h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-zinc-700">
              <p className="font-semibold uppercase tracking-wider text-zinc-500 text-[10px]">
                Travel Style
              </p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="filter-cat"
                      checked={selectedCategory === c.id}
                      onChange={() => {
                        setSelectedCategory(c.id);
                        setFilterCount(1);
                      }}
                      className="text-[#463d34] focus:ring-[#463d34]"
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setFilterCount(0);
                  setIsFilterModalOpen(false);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-800 underline"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#463d34] text-white text-xs font-semibold uppercase tracking-wider"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Advisor Match & Enquiry Modal */}
      <EnquiryModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        packageTitle={selectedDestinationTitle}
      />
    </div>
  );
};

/* Component to render each of the 4 card types with authentic luxury styling */
const CardRender: React.FC<{
  card: CardItem;
  onSelect: (title: string) => void;
}> = ({ card, onSelect }) => {
  // 1. Editorial Text Advisor Card (e.g. Garry x Olivia)
  if (card.type === "advisor_text") {
    return (
      <div
        onClick={() => onSelect(card.title)}
        className="w-full bg-[#ECE5DC] rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group min-h-[200px]"
      >
        <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-zinc-500 font-medium mb-3 select-none">
          GARRY • OLIVIA
        </span>
        <h4 className="font-serif text-lg sm:text-xl font-normal text-zinc-900 group-hover:text-black mb-1.5 transition-colors">
          {card.title}
        </h4>
        <p className="text-xs text-zinc-600 leading-relaxed font-sans">
          {card.subtitle}
        </p>
      </div>
    );
  }

  // 2. Advisor Portrait Card (e.g. Stephanie Bloom)
  if (card.type === "advisor_avatar") {
    return (
      <div
        onClick={() => onSelect(card.title)}
        className="w-full bg-[#ECE5DC] rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group min-h-[220px]"
      >
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white shadow-sm mb-3.5 group-hover:scale-105 transition-transform duration-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.avatarUrl}
            alt={card.title}
            className="w-full h-full object-cover"
          />
        </div>
        <h4 className="font-serif text-base sm:text-lg font-normal text-zinc-900 group-hover:text-black mb-1 transition-colors">
          {card.title}
        </h4>
        <p className="text-xs text-zinc-600 leading-relaxed font-sans">
          {card.subtitle}
        </p>
      </div>
    );
  }

  // 3. Destination Badge Card (e.g. Italy)
  if (card.type === "destination_badge") {
    return (
      <div
        onClick={() => onSelect(card.title)}
        className="relative w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group min-h-[260px] sm:min-h-[280px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.imageUrl}
          alt={card.title}
          className="w-full h-full min-h-[260px] sm:min-h-[280px] object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-sans font-semibold tracking-wider uppercase border border-white/20">
            <MapPin className="w-3 h-3 text-white fill-white" />
            <span>{card.badgeText}</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Standard Definitive Guide Card (China, Indonesia, Brazil, Chile, Aspen)
  return (
    <div
      onClick={() => onSelect(card.title)}
      className="relative w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group min-h-[260px] sm:min-h-[290px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.imageUrl}
        alt={card.title}
        className="w-full h-full min-h-[260px] sm:min-h-[290px] object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
        {/* Badge: Either Brand (F FLYORA) or Author (e.g. Natalie Kurtzman) */}
        {card.authorBadge ? (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/80 text-white flex items-center justify-center text-[10px] font-bold">
              ✦
            </span>
            <span className="text-[10px] font-sans uppercase tracking-widest font-semibold text-white/90">
              {card.authorBadge}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[9px] font-bold">
              F
            </span>
            <span className="text-[10px] font-sans uppercase tracking-widest font-semibold text-white/90">
              {card.badgeText || "FLYORA"}
            </span>
          </div>
        )}

        <h3 className="font-serif italic text-base sm:text-lg font-normal text-white leading-snug drop-shadow-xs">
          {card.serifTitle || card.title}
        </h3>
      </div>
    </div>
  );
};
