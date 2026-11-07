import { describe, it, expect } from "vitest";
import {
  detectTripMode,
  filterServicesByTripMode,
  getServiceTypeDefinition,
  getContextAwareSuggestions,
  POPULAR_ORIGINS,
  POPULAR_DESTINATIONS,
  type BackendServiceRecord,
} from "./dynamicServices";

describe("dynamicServices engine", () => {
  describe("detectTripMode", () => {
    it("detects domestic trips for Indian destinations", () => {
      expect(detectTripMode("Mumbai", "Goa (Beaches & Heritage)")).toBe(
        "domestic",
      );
      expect(detectTripMode("Delhi", "Kashmir (Srinagar & Gulmarg)")).toBe(
        "domestic",
      );
      expect(detectTripMode("Bengaluru", "Kerala (Munnar & Backwaters)")).toBe(
        "domestic",
      );
    });

    it("detects international trips for overseas destinations", () => {
      expect(detectTripMode("Mumbai", "Dubai & Abu Dhabi")).toBe(
        "international",
      );
      expect(detectTripMode("Delhi", "Switzerland & The Alps")).toBe(
        "international",
      );
      expect(detectTripMode("Bengaluru", "Bali & Ubud Sanctuary")).toBe(
        "international",
      );
      expect(detectTripMode("Mumbai", "Makkah & Madinah (Umrah/Hajj)")).toBe(
        "international",
      );
    });

    it("defaults to domestic when neither is provided", () => {
      expect(detectTripMode()).toBe("domestic");
    });
  });

  describe("filterServicesByTripMode", () => {
    const mockServices: BackendServiceRecord[] = [
      { id: "1", name: "Holiday Packages", slug: "holiday-packages" },
      { id: "2", name: "Visa Assistance", slug: "visa-assistance" },
      { id: "3", name: "Flight Booking", slug: "flight-booking" },
      { id: "4", name: "Umrah & Hajj", slug: "umrah-hajj" },
      { id: "5", name: "Hotel Booking", slug: "hotel-booking" },
      { id: "6", name: "Train Booking", slug: "train-booking" },
      { id: "7", name: "Bus Booking", slug: "bus-booking" },
    ];

    it("filters out Visa Assistance and Umrah & Hajj for domestic trips", () => {
      const filtered = filterServicesByTripMode(
        mockServices,
        "domestic",
        "Goa",
      );
      const slugs = filtered.map((s) => s.slug);

      expect(slugs).toContain("flight-booking");
      expect(slugs).toContain("hotel-booking");
      expect(slugs).toContain("holiday-packages");
      expect(slugs).toContain("train-booking");
      expect(slugs).toContain("bus-booking");

      // Strictly excluded from domestic
      expect(slugs).not.toContain("visa-assistance");
      expect(slugs).not.toContain("umrah-hajj");
    });

    it("filters out domestic ground transport (Train, Bus) for international trips", () => {
      const filtered = filterServicesByTripMode(
        mockServices,
        "international",
        "Switzerland",
      );
      const slugs = filtered.map((s) => s.slug);

      expect(slugs).toContain("flight-booking");
      expect(slugs).toContain("hotel-booking");
      expect(slugs).toContain("visa-assistance");
      expect(slugs).toContain("holiday-packages");

      // Strictly excluded from international
      expect(slugs).not.toContain("train-booking");
      expect(slugs).not.toContain("bus-booking");
    });

    it("includes Umrah & Hajj for Saudi Arabia / pilgrimage destinations", () => {
      const filtered = filterServicesByTripMode(
        mockServices,
        "international",
        "Makkah & Madinah (Umrah/Hajj)",
      );
      const slugs = filtered.map((s) => s.slug);

      expect(slugs).toContain("umrah-hajj");
      expect(slugs).toContain("visa-assistance");
      expect(slugs).toContain("flight-booking");
    });

    it("excludes Umrah & Hajj for non-pilgrimage international destinations", () => {
      const filtered = filterServicesByTripMode(
        mockServices,
        "international",
        "Switzerland & The Alps",
      );
      const slugs = filtered.map((s) => s.slug);

      expect(slugs).not.toContain("umrah-hajj");
    });
  });

  describe("getServiceTypeDefinition", () => {
    it("returns trip types and cabin classes for flights", () => {
      const def = getServiceTypeDefinition("flight-booking");
      expect(def.primaryTypeLabel).toBe("Trip Type");
      expect(def.primaryTypes.some((t) => t.id === "round-trip")).toBe(true);
      expect(def.secondaryTypeLabel).toBe("Cabin Class");
      expect(def.secondaryTypes?.some((t) => t.id === "business")).toBe(true);
    });

    it("returns accommodation tier and room config for hotels", () => {
      const def = getServiceTypeDefinition("hotel-booking");
      expect(def.primaryTypeLabel).toBe("Accommodation Tier");
      expect(def.primaryTypes.some((t) => t.id === "luxury-5star")).toBe(true);
      expect(def.secondaryTypeLabel).toBe("Room Configuration");
    });

    it("returns visa categories and entry preference for visas", () => {
      const def = getServiceTypeDefinition("visa-assistance");
      expect(def.primaryTypeLabel).toBe("Visa Category");
      expect(def.primaryTypes.some((t) => t.id === "tourist-visa")).toBe(true);
      expect(def.secondaryTypeLabel).toBe("Entry Preference");
    });

    it("returns booking quotas and travel classes for trains without train names", () => {
      const def = getServiceTypeDefinition("train-booking");
      expect(def.primaryTypeLabel).toBe("Booking Quota");
      expect(def.primaryTypes.some((t) => t.id === "general")).toBe(true);
      expect(def.secondaryTypes?.some((t) => t.id === "1a-ac")).toBe(true);
    });

    it("returns coach categories and seat preferences for buses", () => {
      const def = getServiceTypeDefinition("bus-booking");
      expect(def.primaryTypeLabel).toBe("Coach Category");
      expect(def.primaryTypes.some((t) => t.id === "volvo-sleeper")).toBe(true);
    });
  });

  describe("getContextAwareSuggestions", () => {
    it("suggests baggage and lounge for international flights", () => {
      const suggestions = getContextAwareSuggestions({
        tripMode: "international",
        serviceSlug: "flight-booking",
        destination: "Dubai",
        adults: 1,
      });

      const ids = suggestions.map((s) => s.id);
      expect(ids).toContain("intl-extra-baggage");
      expect(ids).toContain("intl-lounge");
    });

    it("suggests adjacent seating for families", () => {
      const suggestions = getContextAwareSuggestions({
        tripMode: "domestic",
        serviceSlug: "flight-booking",
        destination: "Goa",
        adults: 2,
        children: 2,
      });

      const ids = suggestions.map((s) => s.id);
      expect(ids).toContain("family-seating");
    });

    it("suggests overwater villa for Maldives / Bali hotels", () => {
      const suggestions = getContextAwareSuggestions({
        tripMode: "international",
        serviceSlug: "hotel-booking",
        destination: "Maldives Islands",
      });

      const ids = suggestions.map((s) => s.id);
      expect(ids).toContain("hotel-villa");
      expect(ids).toContain("hotel-halfboard");
    });

    it("suggests destination-specific experiences for holidays", () => {
      const swiss = getContextAwareSuggestions({
        tripMode: "international",
        serviceSlug: "holiday-packages",
        destination: "Switzerland & The Alps",
      });
      expect(swiss.some((s) => s.id === "exp-swiss-jungfrau")).toBe(true);

      const kashmir = getContextAwareSuggestions({
        tripMode: "domestic",
        serviceSlug: "holiday-packages",
        destination: "Kashmir (Srinagar & Gulmarg)",
      });
      expect(kashmir.some((s) => s.id === "exp-kashmir-gondola")).toBe(true);
    });
  });
});
