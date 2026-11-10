"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
import { loadPackages } from "../../lib/service-catalog";
import { useSearchParams } from "next/navigation";
import type { PackageSummary } from "@flyora/types";
import {
  Sparkles,
  Compass,
  RotateCcw,
  Loader2,
  X,
  MessageCircle,
} from "lucide-react";

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

  // Listen for global enquiry events (e.g. from floating chat widget)
  useEffect(() => {
    const handleGlobalEnquiry = () => {
      setEnquiryServiceId(undefined);
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
    setFilterState({ key: filterKey, values: { ...filters, ...updated } });
  };

  // Reset filter helper
  const handleResetFilters = () => {
    setFilterState({ key: filterKey, values: INITIAL_FILTERS });
  };

  const hasActiveFilters =
    filters.categoryTab !== "all" ||
    filters.searchQuery.trim() !== "" ||
    filters.selectedDestinations.length > 0 ||
    filters.durationCategory !== "all" ||
    filters.budgetRange !== "all";

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

    // 1. Category Tab (All / International / Domestic)
    if (filters.categoryTab !== "all") {
      result = result.filter((p) => {
        const isDom = isDomesticPackage(p);
        return filters.categoryTab === "domestic" ? isDom : !isDom;
      });
    }

    // 2. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
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
            ) : !loading && !loadError ? (
              /* Empty State */
              <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#002f89] flex items-center justify-center mx-auto shadow-xs">
                  <Compass className="w-6 h-6 stroke-[1.8]" />
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
                      setEnquiryServiceId(undefined);
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
