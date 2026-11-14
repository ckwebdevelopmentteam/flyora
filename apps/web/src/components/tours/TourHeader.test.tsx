import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import { TourHeader } from "./TourHeader";

afterEach(() => {
  cleanup();
});

describe("TourHeader component", () => {
  it("renders category segment tabs with accurate counts", () => {
    const onCategoryChange = vi.fn();
    const onSortChange = vi.fn();

    render(
      <TourHeader
        totalResults={5}
        sortBy="recommended"
        onSortChange={onSortChange}
        categoryTab="all"
        onCategoryChange={onCategoryChange}
        categoryCounts={{ all: 5, international: 4, domestic: 1 }}
      />,
    );

    expect(screen.getByText("All Packages")).toBeDefined();
    expect(screen.getByText("International")).toBeDefined();
    expect(screen.getByText("Domestic (India)")).toBeDefined();
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("4")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();

    // Click on Domestic tab
    fireEvent.click(screen.getByText("Domestic (India)"));
    expect(onCategoryChange).toHaveBeenCalledWith("domestic");

    // Click on International tab
    fireEvent.click(screen.getByText("International"));
    expect(onCategoryChange).toHaveBeenCalledWith("international");
  });

  it("handles sorting change including new duration-desc option", () => {
    const onSortChange = vi.fn();

    render(
      <TourHeader
        totalResults={5}
        sortBy="recommended"
        onSortChange={onSortChange}
        categoryTab="all"
        onCategoryChange={vi.fn()}
        categoryCounts={{ all: 5, international: 4, domestic: 1 }}
      />,
    );

    const sortSelect = screen.getByRole("combobox") as HTMLSelectElement;
    expect(sortSelect.value).toBe("recommended");

    fireEvent.change(sortSelect, { target: { value: "duration-desc" } });
    expect(onSortChange).toHaveBeenCalledWith("duration-desc");
  });

  it("renders mobile search input and fires onSearchChange", () => {
    const onSearchChange = vi.fn();

    render(
      <TourHeader
        totalResults={5}
        sortBy="recommended"
        onSortChange={vi.fn()}
        categoryTab="all"
        onCategoryChange={vi.fn()}
        categoryCounts={{ all: 5, international: 4, domestic: 1 }}
        searchQuery=""
        onSearchChange={onSearchChange}
      />,
    );

    const searchInput = screen.getByRole("textbox", {
      name: /Search destination or package name/i,
    });
    expect(searchInput).toBeDefined();

    fireEvent.change(searchInput, { target: { value: "Dubai" } });
    expect(onSearchChange).toHaveBeenCalledWith("Dubai");
  });

  it("opens custom sort popover and selects an option", () => {
    const onSortChange = vi.fn();

    render(
      <TourHeader
        totalResults={5}
        sortBy="recommended"
        onSortChange={onSortChange}
        categoryTab="all"
        onCategoryChange={vi.fn()}
        categoryCounts={{ all: 5, international: 4, domestic: 1 }}
      />,
    );

    // Click on custom sort trigger button
    const triggerBtn = screen.getByRole("button", {
      name: /Sort by: Recommended/i,
    });
    expect(triggerBtn).toBeDefined();
    fireEvent.click(triggerBtn);

    // The custom listbox popover should now be visible
    const listbox = screen.getByRole("listbox", { name: /Sort options/i });
    expect(listbox).toBeDefined();

    // Click "Price: Low to High" option inside listbox
    const priceOption = within(listbox).getByText(/Price: Low to High/i);
    fireEvent.click(priceOption);

    expect(onSortChange).toHaveBeenCalledWith("price-asc");
  });
});
