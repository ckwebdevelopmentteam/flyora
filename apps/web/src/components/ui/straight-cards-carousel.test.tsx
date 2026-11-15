import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import {
  StraightCardsCarousel,
  type StraightCardItem,
} from "./straight-cards-carousel";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  mockPush.mockClear();
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();
});

const mockItems: StraightCardItem[] = [
  {
    id: "bali",
    location: "Bali, Indonesia",
    title: "Bali Island Escape",
    description: "Four nights in tropical paradise.",
    src: "https://photos.test/bali.jpg",
    duration: "5D & 4N",
    price: "₹48,000",
    slug: "bali-island-escape",
  },
  {
    id: "dubai",
    location: "Dubai, UAE",
    title: "Futuristic Dunes & Skyline",
    description: "Six nights in luxury Dubai.",
    src: "https://photos.test/dubai.jpg",
    duration: "7D & 6N",
    price: "₹55,000",
    slug: "dubai-luxury-escape",
  },
];

describe("StraightCardsCarousel Component", () => {
  it("renders destination cards with location, title, and duration", () => {
    render(<StraightCardsCarousel items={mockItems} activeIndex={0} />);

    expect(screen.getByText("Bali Island Escape")).toBeDefined();
    expect(screen.getByText("5D & 4N")).toBeDefined();
    expect(screen.getByText("₹48,000")).toBeDefined();
    expect(screen.getByText("Futuristic Dunes & Skyline")).toBeDefined();
    expect(screen.getByText("7D & 6N")).toBeDefined();
  });

  it("navigates to the tour detail page using router.push when clicking the active lead card", () => {
    render(<StraightCardsCarousel items={mockItems} activeIndex={0} />);

    const leadCard = screen.getByRole("button", {
      name: "View details for Bali Island Escape",
    });
    fireEvent.click(leadCard);

    expect(mockPush).toHaveBeenCalledWith("/tours/bali-island-escape");
  });

  it("calls onCardNavigate if provided when clicking the active lead card", () => {
    const handleNavigate = vi.fn();
    render(
      <StraightCardsCarousel
        items={mockItems}
        activeIndex={0}
        onCardNavigate={handleNavigate}
      />,
    );

    const leadCard = screen.getByRole("button", {
      name: "View details for Bali Island Escape",
    });
    fireEvent.click(leadCard);

    expect(handleNavigate).toHaveBeenCalledWith(mockItems[0], 0);
  });

  it("opens enquiry when clicking the Enquire button without triggering navigation", () => {
    const handleEnquire = vi.fn();

    render(
      <StraightCardsCarousel
        items={mockItems}
        activeIndex={0}
        onSelectLead={handleEnquire}
      />,
    );

    const enquireBtn = screen.getAllByText("Enquire")[0];
    fireEvent.click(enquireBtn);

    expect(handleEnquire).toHaveBeenCalledWith(mockItems[0], 0);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("changes active card when clicking a trailing card", () => {
    const handleIndexChange = vi.fn();

    render(
      <StraightCardsCarousel
        items={mockItems}
        activeIndex={0}
        onIndexChange={handleIndexChange}
      />,
    );

    const nextCard = screen.getByRole("button", {
      name: "View Futuristic Dunes & Skyline",
    });
    fireEvent.click(nextCard);

    expect(handleIndexChange).toHaveBeenCalledWith(1);
  });
});
