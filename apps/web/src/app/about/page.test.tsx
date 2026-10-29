import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import AboutPage from "./page";

// Mock next/image to render standard img tag in tests
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  cleanup();
});

describe("About Us Page", () => {
  it("renders the full-width hero section with About Us pill, heading, and description", () => {
    render(<AboutPage />);

    expect(screen.getByText(/about us/i)).toBeDefined();
    expect(screen.getByText(/your journey, our passion/i)).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /the world is closer than you think/i,
      }),
    ).toBeDefined();
    expect(
      screen.getByText(/at flyora, we believe every journey opens the door/i),
    ).toBeDefined();

    // Dual CTAs
    const exploreLinks = screen.getAllByRole("link", {
      name: /explore destinations/i,
    });
    expect(exploreLinks.length).toBeGreaterThanOrEqual(2);
    expect(exploreLinks[0].getAttribute("href")).toBe("/tours");

    expect(
      screen.getByRole("link", { name: /discover flyora/i }),
    ).toBeDefined();
  });

  it("renders the Who We Are story section with 3 placeholder statistics", () => {
    render(<AboutPage />);

    expect(screen.getByText(/who we are/i)).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: /making every journey feel extraordinary/i,
      }),
    ).toBeDefined();

    // Check placeholder statistics
    expect(screen.getByText("25+")).toBeDefined();
    expect(screen.getByText(/destinations explored/i)).toBeDefined();
    expect(screen.getAllByText("1,200+").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/journeys planned/i)).toBeDefined();
    expect(screen.getByText("98%")).toBeDefined();
    expect(screen.getByText(/traveler satisfaction/i)).toBeDefined();
  });

  it("renders the centered transition statement section", () => {
    render(<AboutPage />);

    expect(screen.getByText(/a gentle place to begin/i)).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: /we create space for the moments/i,
      }),
    ).toBeDefined();
  });

  it("renders the curators team showcase with 4 advisor cards", () => {
    render(<AboutPage />);

    expect(screen.getByText(/meet our travel curators/i)).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: /care from the team who listens well/i,
      }),
    ).toBeDefined();

    expect(screen.getByText("Elena Vance")).toBeDefined();
    expect(screen.getByText("Marcus Reed")).toBeDefined();
    expect(screen.getByText("Aria Chen")).toBeDefined();
    expect(screen.getByText("Julian Ross")).toBeDefined();
  });

  it("renders the numbered approach accordion section", () => {
    render(<AboutPage />);

    expect(screen.getByText(/how we plan our journeys/i)).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: /we prioritize thoughtful pacing/i,
      }),
    ).toBeDefined();

    expect(screen.getByText(/choice and pacing come first/i)).toBeDefined();
    expect(
      screen.getByText(/thoughtful journeys & handcrafted details/i),
    ).toBeDefined();
  });

  it("renders the client testimonials section with quote cards", () => {
    render(<AboutPage />);

    expect(screen.getByText(/testimonials/i)).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: /words from our travelers/i,
      }),
    ).toBeDefined();

    expect(screen.getByText("Sophia Martinez")).toBeDefined();
    expect(screen.getByText("Olivia Brown")).toBeDefined();
    expect(screen.getByText("Emma Johnson")).toBeDefined();
  });

  it("renders the transparent planning tiers section", () => {
    render(<AboutPage />);

    expect(screen.getByText(/flexible journey options/i)).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: /simple and transparent planning/i,
      }),
    ).toBeDefined();

    expect(screen.getByText("Single Session Consultation")).toBeDefined();
    expect(screen.getByText("Bespoke Full Itinerary")).toBeDefined();
    expect(screen.getByText("Annual Travel Membership")).toBeDefined();
  });

  it("opens the enquiry modal when clicking 'Match With an Advisor'", () => {
    render(<AboutPage />);

    const advisorBtns = screen.getAllByRole("button", {
      name: /match with an advisor/i,
    });
    expect(advisorBtns.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(advisorBtns[0]);

    // Enquiry modal should open
    expect(screen.getByRole("dialog")).toBeDefined();
  });
});
