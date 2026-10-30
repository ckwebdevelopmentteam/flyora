"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
import { loadPackages } from "../../lib/service-catalog";
import { useSearchParams } from "next/navigation";
import type { PackageSummary } from "@flyora/types";
import { Sparkles, Compass, RotateCcw } from "lucide-react";

export default function ToursPage() {
  return (
    <Suspense
      fallback={
        <p className="p-8" role="status">
          Loading packages…
        </p>
      }
    >
      <ToursRoute />
    </Suspense>
  );
}
function ToursRoute() {
  const params = useSearchParams();
  return (
    <ToursCatalog
      filterKey={params.toString()}
      initialDestination={params.get("destination") || ""}
      initialSearch={params.get("q") || ""}
    />
  );
}
function ToursCatalog({
  filterKey,
  initialDestination,
  initialSearch,
}: {
  filterKey: string;
  initialDestination: string;
  initialSearch: string;
}) {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [enquiryServiceId, setEnquiryServiceId] = useState<string>();
  const initialFilters = {
    ...INITIAL_FILTERS,
    searchQuery: initialSearch,
    selectedDestinations: initialDestination ? [initialDestination] : [],
  };
  const [filterState, setFilterState] = useState<{
    key: string;
    values: TourFilterState;
  }>({ key: filterKey, values: initialFilters });
  const filters =
    filterState.key === filterKey ? filterState.values : initialFilters;
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Enquiry Modal state
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryPackageId, setEnquiryPackageId] = useState<string | undefined>(
    undefined,
  );
  const [enquiryPackageTitle, setEnquiryPackageTitle] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const controller = new AbortController();
    loadPackages(
      AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
    )
      .then((items) => {
        if (!controller.signal.aborted) setPackages(items);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPackages([]);
          setLoadError("We couldn’t load our packages. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

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
    setFilterState({ key: filterKey, values: { ...filters, ...updated } });
  };

  // Reset filter helper
  const handleResetFilters = () => {
    setFilterState({ key: filterKey, values: INITIAL_FILTERS });
  };

  // Open Enquiry modal with pre-selected package
  const handleCustomizePackage = (pkgId: string, pkgTitle: string) => {
    setEnquiryServiceId(packages.find((p) => p.id === pkgId)?.serviceId);
    setEnquiryPackageId(pkgId);
    setEnquiryPackageTitle(pkgTitle);
    setIsEnquiryOpen(true);
  };

  // Filter and sort packages
  const filteredPackages = useMemo(() => {
    let result = [...packages];

    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
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
      {/* Navbar with 5 Clean Links & Luxury Theme */}
      <Navbar
        activePath="/tours"
        onOpenEnquiry={(service) => {
          setEnquiryServiceId(service);
          setEnquiryPackageId(undefined);
          setEnquiryPackageTitle(service ? `Enquiry: ${service}` : undefined);
          setIsEnquiryOpen(true);
        }}
      />

      {/* Main Page Canvas (Wider than Navbar like Homepage Image Section: 1440px) */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-18">
        {loading && <p role="status">Loading packages…</p>}
        {loadError && (
          <div role="alert">
            {loadError}{" "}
            <button
              onClick={() => {
                setLoading(true);
                setLoadError("");
                setAttempt((n) => n + 1);
              }}
            >
              Try again
            </button>
          </div>
        )}
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
            ) : !loading && !loadError ? (
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
                      setEnquiryServiceId(undefined);
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
            ) : null}
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
        defaultServiceId={enquiryServiceId}
        defaultPackageId={enquiryPackageId}
        packageTitle={enquiryPackageTitle}
      />

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp />

      {/* Luxury Footer */}
      <Footer
        onOpenEnquiry={(service) => {
          setEnquiryServiceId(service);
          setEnquiryPackageId(undefined);
          setEnquiryPackageTitle(service ? `Enquiry: ${service}` : undefined);
          setIsEnquiryOpen(true);
        }}
      />
    </div>
  );
}
