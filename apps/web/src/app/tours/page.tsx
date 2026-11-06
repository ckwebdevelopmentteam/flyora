"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { TourHeader } from "../../components/tours/TourHeader";
import { TourFilterSidebar } from "../../components/tours/TourFilterSidebar";
import { TourCard } from "../../components/tours/TourCard";
import { MobileFilterDrawer } from "../../components/tours/MobileFilterDrawer";
import { EnquiryModal } from "../../components/EnquiryModal";
import {
  INITIAL_FILTERS,
  type TourFilterState,
  type TourCategoryTab,
  BUDGET_LABELS,
  DURATION_LABELS,
  isDomesticPackage,
} from "../../components/tours/types";
import type { PackageSummary } from "@flyora/types";
import {
  Sparkles,
  Compass,
  RotateCcw,
  Loader2,
  X,
  MessageCircle,
} from "lucide-react";

// Fallback real packages with real generated images in case API is cold-starting
const FALLBACK_PACKAGES: PackageSummary[] = [
  {
    id: "37aba6d8-fee8-464f-8a20-46d2bd16229c",
    serviceId: "880a9c17-1bdd-42cf-bb3d-62242b9446ff",
    serviceName: "Holiday Packages",
    title: "5D/4N Dubai Family Luxury",
    slug: "5d-4n-dubai-family-luxury",
    durationDays: 5,
    durationNights: 4,
    destination: "Dubai, United Arab Emirates",
    startingPrice: 64999,
    coverImageUrl: "/destinations/dubai.jpg",
    isFeatured: true,
    isPublished: true,
    createdAt: "2026-10-22T10:49:12.982Z",
  },
  {
    id: "cf21dea8-85c6-4bf2-ba0e-02873140969a",
    serviceId: "880a9c17-1bdd-42cf-bb3d-62242b9446ff",
    serviceName: "Holiday Packages",
    title: "4D/3N Maldives Luxury Overwater Villa",
    slug: "4d-3n-maldives-overwater-escape",
    durationDays: 4,
    durationNights: 3,
    destination: "North Male Atoll, Maldives",
    startingPrice: 94999,
    coverImageUrl: "/destinations/maldives.jpg",
    isFeatured: true,
    isPublished: true,
    createdAt: "2026-10-24T10:31:30.585Z",
  },
  {
    id: "28615277-8bd2-4484-9a90-28eabce5a6ce",
    serviceId: "880a9c17-1bdd-42cf-bb3d-62242b9446ff",
    serviceName: "Holiday Packages",
    title: "6D/5N Bali Ubud Rainforest & Seminyak Beach",
    slug: "6d-5n-bali-ubud-seminyak-bliss",
    durationDays: 6,
    durationNights: 5,
    destination: "Bali (Ubud & Seminyak), Indonesia",
    startingPrice: 52999,
    coverImageUrl: "/destinations/bali.jpg",
    isFeatured: true,
    isPublished: true,
    createdAt: "2026-10-24T10:31:30.756Z",
  },
  {
    id: "fe9cebd1-8d8b-44f2-a731-639bd5ba6019",
    serviceId: "880a9c17-1bdd-42cf-bb3d-62242b9446ff",
    serviceName: "Holiday Packages",
    title: "7D/6N Scenic Switzerland & Alpine Express",
    slug: "7d-6n-swiss-alps-panoramic-dream",
    durationDays: 7,
    durationNights: 6,
    destination: "Zurich, Lucerne, Interlaken & Zermatt",
    startingPrice: 148999,
    coverImageUrl: "/destinations/switzerland.jpg",
    isFeatured: true,
    isPublished: true,
    createdAt: "2026-10-24T10:31:30.861Z",
  },
];

export default function ToursPage() {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TourFilterState>(INITIAL_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Enquiry Modal state
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryPackageId, setEnquiryPackageId] = useState<string | undefined>(
    undefined,
  );
  const [enquiryPackageTitle, setEnquiryPackageTitle] = useState<
    string | undefined
  >(undefined);

  // Listen for global enquiry events (e.g. from floating chat widget)
  useEffect(() => {
    const handleGlobalEnquiry = () => {
      setEnquiryPackageId(undefined);
      setEnquiryPackageTitle(undefined);
      setIsEnquiryOpen(true);
    };
    window.addEventListener("flyora:open-enquiry", handleGlobalEnquiry);
    return () =>
      window.removeEventListener("flyora:open-enquiry", handleGlobalEnquiry);
  }, []);

  // Fetch live packages from API
  useEffect(() => {
    async function loadPackages() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiUrl}/packages`);
        if (res.ok) {
          const json = await res.json();
          if (
            json.data &&
            Array.isArray(json.data.items) &&
            json.data.items.length > 0
          ) {
            setPackages(json.data.items);
            return;
          }
        }
        setPackages(FALLBACK_PACKAGES);
      } catch {
        // Fallback pre-bundled packages used cleanly when API is offline
        setPackages(FALLBACK_PACKAGES);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, []);

  // Extract unique available destinations for filter sidebar
  const availableDestinations = useMemo(() => {
    const list = new Set<string>();
    packages.forEach((p) => {
      const main = p.destination.split(",")[0]?.trim() || p.destination.trim();
      if (main) list.add(main);
    });
    return Array.from(list);
  }, [packages]);

  // Count packages by category (All, International, Domestic)
  const categoryCounts = useMemo(() => {
    let international = 0;
    let domestic = 0;
    packages.forEach((pkg) => {
      if (isDomesticPackage(pkg)) {
        domestic++;
      } else {
        international++;
      }
    });
    return { all: packages.length, international, domestic };
  }, [packages]);

  // Update filter helper
  const handleFilterChange = (updated: Partial<TourFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  // Reset filter helper
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const hasActiveFilters =
    filters.categoryTab !== "all" ||
    filters.searchQuery.trim() !== "" ||
    filters.selectedDestinations.length > 0 ||
    filters.durationCategory !== "all" ||
    filters.budgetRange !== "all";

  // Open Enquiry modal with pre-selected package
  const handleCustomizePackage = (pkgId: string, pkgTitle: string) => {
    setEnquiryPackageId(pkgId);
    setEnquiryPackageTitle(pkgTitle);
    setIsEnquiryOpen(true);
  };

  // Filter and sort packages
  const filteredPackages = useMemo(() => {
    let result = [...packages];

    // 1. Category Tab (All / International / Domestic)
    if (filters.categoryTab !== "all") {
      result = result.filter((p) => {
        const isDom = isDomesticPackage(p);
        return filters.categoryTab === "domestic" ? isDom : !isDom;
      });
    }

    // 2. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.destination.toLowerCase().includes(q),
      );
    }

    // 3. Selected Destinations
    if (filters.selectedDestinations.length > 0) {
      result = result.filter((p) =>
        filters.selectedDestinations.some((d) =>
          p.destination.toLowerCase().includes(d.toLowerCase()),
        ),
      );
    }

    // 4. Duration Category
    if (filters.durationCategory !== "all") {
      result = result.filter((p) => {
        if (filters.durationCategory === "short") return p.durationDays <= 3;
        if (filters.durationCategory === "medium")
          return p.durationDays >= 4 && p.durationDays <= 5;
        if (filters.durationCategory === "long") return p.durationDays >= 6;
        return true;
      });
    }

    // 5. Budget Range
    if (filters.budgetRange !== "all") {
      result = result.filter((p) => {
        const price = Number(p.startingPrice || 0);
        if (filters.budgetRange === "under30k") return price < 30000;
        if (filters.budgetRange === "30k-50k")
          return price >= 30000 && price <= 50000;
        if (filters.budgetRange === "50k-100k")
          return price >= 50000 && price <= 100000;
        if (filters.budgetRange === "above100k") return price > 100000;
        return true;
      });
    }

    // 6. Sorting
    result.sort((a, b) => {
      const priceA = Number(a.startingPrice || 0);
      const priceB = Number(b.startingPrice || 0);
      if (filters.sortBy === "price-asc") return priceA - priceB;
      if (filters.sortBy === "price-desc") return priceB - priceA;
      if (filters.sortBy === "duration-asc")
        return a.durationDays - b.durationDays;
      if (filters.sortBy === "duration-desc")
        return b.durationDays - a.durationDays;
      return 0; // recommended
    });

    return result;
  }, [packages, filters]);

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-[#002f89] selection:text-white">
      {/* Navbar with 5 Clean Links & Luxury Theme */}
      <Navbar
        activePath="/tours"
        onOpenEnquiry={(service) => {
          setEnquiryPackageId(undefined);
          setEnquiryPackageTitle(service ? `Enquiry: ${service}` : undefined);
          setIsEnquiryOpen(true);
        }}
      />

      {/* Main Page Canvas (Wider than Navbar like Homepage Image Section: 1440px) */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-18">
        {/* Header with Title and Sorting */}
        <TourHeader
          totalResults={filteredPackages.length}
          sortBy={filters.sortBy}
          onSortChange={(sortBy) => handleFilterChange({ sortBy })}
          categoryTab={filters.categoryTab}
          onCategoryChange={(categoryTab) =>
            handleFilterChange({ categoryTab })
          }
          categoryCounts={categoryCounts}
          onOpenMobileFilter={() => setMobileFilterOpen(true)}
          isLoading={loading}
        />

        {/* 2-Column Catalog Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Filter Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <TourFilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              availableDestinations={availableDestinations}
            />
          </div>

          {/* Right Tour Cards Grid */}
          <div className="lg:col-span-3">
            {/* Active Filter Chips with 1-click Clear */}
            {hasActiveFilters && (
              <div className="mb-6 p-3 sm:p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-stone-500 font-mono mr-1">
                  Active Filters:
                </span>

                {/* Category Pill */}
                {filters.categoryTab !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs text-stone-700 shadow-2xs">
                    <span className="text-stone-400">Category:</span>
                    <span className="font-semibold text-stone-900 capitalize">
                      {filters.categoryTab === "domestic"
                        ? "Domestic"
                        : "International"}
                    </span>
                    <button
                      onClick={() => handleFilterChange({ categoryTab: "all" })}
                      className="text-stone-400 hover:text-stone-700 p-0.5 ml-0.5 cursor-pointer"
                      title="Clear category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Search Pill */}
                {filters.searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs text-stone-700 shadow-2xs">
                    <span className="text-stone-400">Search:</span>
                    <span className="font-semibold text-stone-900">
                      "{filters.searchQuery}"
                    </span>
                    <button
                      onClick={() => handleFilterChange({ searchQuery: "" })}
                      className="text-stone-400 hover:text-stone-700 p-0.5 ml-0.5 cursor-pointer"
                      title="Clear search query"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Destination Pills */}
                {filters.selectedDestinations.map((dest) => (
                  <span
                    key={dest}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs text-stone-700 shadow-2xs"
                  >
                    <span className="text-stone-400">Destination:</span>
                    <span className="font-semibold text-stone-900">{dest}</span>
                    <button
                      onClick={() => {
                        const updated = filters.selectedDestinations.filter(
                          (d) => d !== dest,
                        );
                        handleFilterChange({ selectedDestinations: updated });
                      }}
                      className="text-stone-400 hover:text-stone-700 p-0.5 ml-0.5 cursor-pointer"
                      title={`Remove ${dest}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Duration Pill */}
                {filters.durationCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs text-stone-700 shadow-2xs">
                    <span className="text-stone-400">Duration:</span>
                    <span className="font-semibold text-stone-900">
                      {DURATION_LABELS[filters.durationCategory] ||
                        filters.durationCategory}
                    </span>
                    <button
                      onClick={() =>
                        handleFilterChange({ durationCategory: "all" })
                      }
                      className="text-stone-400 hover:text-stone-700 p-0.5 ml-0.5 cursor-pointer"
                      title="Clear duration filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Budget Pill */}
                {filters.budgetRange !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs text-stone-700 shadow-2xs">
                    <span className="text-stone-400">Budget:</span>
                    <span className="font-semibold text-stone-900">
                      {BUDGET_LABELS[filters.budgetRange] ||
                        filters.budgetRange}
                    </span>
                    <button
                      onClick={() => handleFilterChange({ budgetRange: "all" })}
                      className="text-stone-400 hover:text-stone-700 p-0.5 ml-0.5 cursor-pointer"
                      title="Clear budget filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Clear All */}
                <button
                  onClick={handleResetFilters}
                  className="sm:ml-auto text-xs text-[#002f89] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-[8px] border border-stone-200/80 bg-white overflow-hidden shadow-xs animate-pulse flex flex-col h-[520px]"
                  >
                    <div className="h-64 bg-stone-100" />
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="h-5 bg-stone-100 rounded-md w-3/4" />
                        <div className="h-3.5 bg-stone-100 rounded-md w-1/3" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3.5 bg-stone-100 rounded-md w-full" />
                        <div className="h-3.5 bg-stone-100 rounded-md w-2/3" />
                      </div>
                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div className="h-6 bg-stone-100 rounded-md w-24" />
                        <div className="h-9 bg-stone-100 rounded-xl w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {filteredPackages.map((pkg) => (
                  <TourCard
                    key={pkg.id}
                    pkg={pkg}
                    onCustomize={handleCustomizePackage}
                  />
                ))}
              </div>
            ) : (
              /* Luxury Concierge Empty State */
              <div className="bg-gradient-to-b from-stone-50 to-stone-100/50 border border-stone-200/90 rounded-2xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto my-6 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#002f89]/10 text-[#002f89] flex items-center justify-center mx-auto ring-4 ring-blue-50/80">
                  <Compass className="w-7 h-7 stroke-[1.8]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                    No tour packages match your filters
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                    We don’t have a standard package matching these exact
                    criteria right now, but{" "}
                    <strong>
                      Flyora crafts 100% bespoke private itineraries
                    </strong>{" "}
                    tailored to your dates, airline choices, luxury hotels, and
                    exact budget.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="https://wa.me/919876543210?text=Hi%20Flyora%20Concierge%2C%20I'm%20looking%20for%20a%20custom%20bespoke%20holiday%20itinerary%20tailored%20to%20my%20dates%20and%20budget.%20Can%20you%20help%3F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Concierge</span>
                  </a>
                  <button
                    onClick={() => {
                      setEnquiryPackageId(undefined);
                      setEnquiryPackageTitle(
                        "Custom Bespoke Holiday Itinerary",
                      );
                      setIsEnquiryOpen(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#002f89] hover:bg-[#00246b] text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    <span>Request Custom Trip</span>
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-white transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Slide-Up Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        availableDestinations={availableDestinations}
        totalResults={filteredPackages.length}
      />

      {/* Reusable Public Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        defaultPackageId={enquiryPackageId}
        packageTitle={enquiryPackageTitle}
      />

      {/* Luxury Footer */}
      <Footer
        onOpenEnquiry={(service) => {
          setEnquiryPackageId(undefined);
          setEnquiryPackageTitle(service ? `Enquiry: ${service}` : undefined);
          setIsEnquiryOpen(true);
        }}
      />
    </div>
  );
}
