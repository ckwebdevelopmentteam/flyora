"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { TourHeader } from "../../components/tours/TourHeader";
import { TourFilterSidebar } from "../../components/tours/TourFilterSidebar";
import { TourCard } from "../../components/tours/TourCard";
import { MobileFilterDrawer } from "../../components/tours/MobileFilterDrawer";
import { EnquiryModal } from "../../components/EnquiryModal";
import { FloatingWhatsApp } from "../../components/FloatingWhatsApp";
import {
  INITIAL_FILTERS,
  type TourFilterState,
} from "../../components/tours/types";
import type { PackageSummary } from "@flyora/types";
import { Sparkles, Compass, RotateCcw, Loader2 } from "lucide-react";

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
  const [packages, setPackages] = useState<PackageSummary[]>(FALLBACK_PACKAGES);
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
          }
        }
      } catch (err) {
        console.warn("Using offline fallback tour packages:", err);
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

  // Update filter helper
  const handleFilterChange = (updated: Partial<TourFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  // Reset filter helper
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Open Enquiry modal with pre-selected package
  const handleCustomizePackage = (pkgId: string, pkgTitle: string) => {
    setEnquiryPackageId(pkgId);
    setEnquiryPackageTitle(pkgTitle);
    setIsEnquiryOpen(true);
  };

  // Filter and sort packages
  const filteredPackages = useMemo(() => {
    let result = [...packages];

    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.destination.toLowerCase().includes(q),
      );
    }

    // 2. Selected Destinations
    if (filters.selectedDestinations.length > 0) {
      result = result.filter((p) =>
        filters.selectedDestinations.some((d) =>
          p.destination.toLowerCase().includes(d.toLowerCase()),
        ),
      );
    }

    // 3. Duration Category
    if (filters.durationCategory !== "all") {
      result = result.filter((p) => {
        if (filters.durationCategory === "short") return p.durationDays <= 3;
        if (filters.durationCategory === "medium")
          return p.durationDays >= 4 && p.durationDays <= 5;
        if (filters.durationCategory === "long") return p.durationDays >= 6;
        return true;
      });
    }

    // 4. Budget Range
    if (filters.budgetRange !== "all") {
      result = result.filter((p) => {
        const price = Number(p.startingPrice || 0);
        if (filters.budgetRange === "under60k") return price < 60000;
        if (filters.budgetRange === "60k-100k")
          return price >= 60000 && price <= 100000;
        if (filters.budgetRange === "above100k") return price > 100000;
        return true;
      });
    }

    // 5. Sorting
    result.sort((a, b) => {
      const priceA = Number(a.startingPrice || 0);
      const priceB = Number(b.startingPrice || 0);
      if (filters.sortBy === "price-asc") return priceA - priceB;
      if (filters.sortBy === "price-desc") return priceB - priceA;
      if (filters.sortBy === "duration-asc")
        return a.durationDays - b.durationDays;
      return 0; // recommended
    });

    return result;
  }, [packages, filters]);

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-[#4A2E18] selection:text-white">
      {/* Navbar with Coffee Brown theme */}
      <Navbar
        activePath="/tours"
        onOpenEnquiry={() => {
          setEnquiryPackageId(undefined);
          setEnquiryPackageTitle(undefined);
          setIsEnquiryOpen(true);
        }}
      />

      {/* Main Page Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header with Title and Sorting */}
        <TourHeader
          totalResults={filteredPackages.length}
          sortBy={filters.sortBy}
          onSortChange={(sortBy) => handleFilterChange({ sortBy })}
          onOpenMobileFilter={() => setMobileFilterOpen(true)}
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
            {filteredPackages.length > 0 ? (
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
              /* Empty State */
              <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-[#F5EBE6] text-[#4A2E18] flex items-center justify-center mx-auto shadow-xs">
                  <Compass className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900">
                    No matching tour packages found
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    We could not find packages matching your current filter
                    criteria. Try resetting your filters or chatting with our
                    coordinator for a custom itinerary.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-white transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                  <button
                    onClick={() => {
                      setEnquiryPackageId(undefined);
                      setEnquiryPackageTitle(undefined);
                      setIsEnquiryOpen(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4A2E18] text-white text-xs font-semibold shadow-xs hover:bg-[#38200F] transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E6D5C7]" />
                    <span>Request Custom Trip</span>
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

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp />

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
}
