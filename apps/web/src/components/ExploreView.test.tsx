import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { ExploreView } from "./ExploreView";

afterEach(() => {
  cleanup();
});

describe("ExploreView Component", () => {
  it("renders explore navbar with logo, search bar, and get matched button", () => {
    render(<ExploreView />);

    expect(screen.getAllByText("FLYORA").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("EXPLORE")).toBeDefined();
    expect(
      screen.getByPlaceholderText(/discover destinations, advisors, and more/i),
    ).toBeDefined();
    expect(
      screen.getAllByRole("button", { name: /get matched/i }).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders all category filter pills and action buttons", () => {
    render(<ExploreView />);

    expect(screen.getByRole("button", { name: /beaches/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /cruises/i })).toBeDefined();
    expect(
      screen.getByRole("button", { name: /arts & culture/i }),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: /family/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /honeymoons/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /filter \(0\)/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /shuffle/i })).toBeDefined();
  });

  it("renders the 8 editorial cards and bottom floating pill", () => {
    render(<ExploreView />);

    expect(screen.getByText(/definitive guide: china/i)).toBeDefined();
    expect(screen.getByText(/garry x olivia/i)).toBeDefined();
    expect(screen.getByText(/definitive guide: indonesia/i)).toBeDefined();
    expect(screen.getByText(/italy/i)).toBeDefined();
    expect(screen.getByText(/definitive guide: brazil/i)).toBeDefined();
    expect(screen.getByText(/definitive guide: chile/i)).toBeDefined();
    expect(screen.getByText(/stephanie bloom/i)).toBeDefined();
    expect(
      screen.getByText(/the ultimate guide to spas in aspen/i),
    ).toBeDefined();

    // Floating pill at bottom and top navbar button
    expect(screen.getAllByRole("button", { name: /get matched/i }).length).toBe(
      2,
    );
  });

  it("filters cards dynamically when searching in the input", () => {
    render(<ExploreView />);

    const searchInput = screen.getByPlaceholderText(
      /discover destinations, advisors, and more/i,
    );
    fireEvent.change(searchInput, { target: { value: "Indonesia" } });

    expect(screen.getByText(/definitive guide: indonesia/i)).toBeDefined();
    expect(screen.queryByText(/definitive guide: china/i)).toBeNull();
  });

  it("filters cards when selecting a category pill", () => {
    render(<ExploreView />);

    const beachesPill = screen.getByRole("button", { name: /beaches/i });
    fireEvent.click(beachesPill);

    expect(screen.getByText(/definitive guide: indonesia/i)).toBeDefined();
    expect(screen.getByText(/definitive guide: brazil/i)).toBeDefined();
    expect(screen.queryByText(/definitive guide: chile/i)).toBeNull();
  });
});
