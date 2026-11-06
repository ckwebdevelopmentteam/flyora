import { describe, it, expect } from "vitest";
import {
  isDomesticPackage,
  BUDGET_LABELS,
  DURATION_LABELS,
  INITIAL_FILTERS,
} from "./types";
import type { PackageSummary } from "@flyora/types";

describe("Tours filtering & helpers", () => {
  const samplePackages: PackageSummary[] = [
    {
      id: "pkg-1",
      serviceId: "srv-1",
      serviceName: "Holiday Packages",
      title: "Bali Island Escape",
      slug: "bali-island-escape",
      durationDays: 5,
      durationNights: 4,
      destination: "Bali, Indonesia",
      startingPrice: 48000,
      coverImageUrl: "/destinations/bali.jpg",
      isFeatured: true,
      isPublished: true,
      createdAt: "2026-10-27T19:52:14.014Z",
    },
    {
      id: "pkg-2",
      serviceId: "srv-1",
      serviceName: "Holiday Packages",
      title: "6D/5N Dal Lake Houseboat & Snowy Gulmarg Mist",
      slug: "6d5n-dal-lake-houseboat",
      durationDays: 6,
      durationNights: 5,
      destination: "Srinagar, Gulmarg & Pahalgam, Kashmir",
      startingPrice: 26500,
      coverImageUrl: "/destinations/kashmir.jpg",
      isFeatured: false,
      isPublished: true,
      createdAt: "2026-11-06T10:21:11.033Z",
    },
    {
      id: "pkg-3",
      serviceId: "srv-1",
      serviceName: "Holiday Packages",
      title: "5D/4N Dubai Marina & Desert Luxury",
      slug: "dubai-uae",
      durationDays: 5,
      durationNights: 4,
      destination: "Dubai , Uae",
      startingPrice: 54999,
      coverImageUrl: "/destinations/dubai.jpg",
      isFeatured: false,
      isPublished: true,
      createdAt: "2026-11-06T10:03:56.238Z",
    },
  ];

  it("accurately classifies domestic vs international destinations", () => {
    expect(isDomesticPackage(samplePackages[0])).toBe(false); // Bali -> International
    expect(isDomesticPackage(samplePackages[1])).toBe(true); // Kashmir -> Domestic
    expect(isDomesticPackage(samplePackages[2])).toBe(false); // Dubai -> International
  });

  it("provides correct budget labels", () => {
    expect(BUDGET_LABELS.under30k).toBe("Under ₹30,000");
    expect(BUDGET_LABELS["30k-50k"]).toBe("₹30,000 – ₹50,000");
    expect(BUDGET_LABELS["50k-100k"]).toBe("₹50,000 – ₹1,00,000");
    expect(BUDGET_LABELS.above100k).toBe("Above ₹1,00,000");
  });

  it("provides correct duration labels", () => {
    expect(DURATION_LABELS.short).toBe("1 – 3 Days");
    expect(DURATION_LABELS.medium).toBe("4 – 5 Days");
    expect(DURATION_LABELS.long).toBe("6+ Days");
  });

  it("initializes with default filters", () => {
    expect(INITIAL_FILTERS.categoryTab).toBe("all");
    expect(INITIAL_FILTERS.searchQuery).toBe("");
    expect(INITIAL_FILTERS.selectedDestinations).toEqual([]);
    expect(INITIAL_FILTERS.durationCategory).toBe("all");
    expect(INITIAL_FILTERS.budgetRange).toBe("all");
    expect(INITIAL_FILTERS.sortBy).toBe("recommended");
  });
});
