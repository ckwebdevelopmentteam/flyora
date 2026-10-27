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
});

afterEach(() => {
  cleanup();
});

describe("About Us Page", () => {
  it("renders the hero section with eyebrow, heading, and description", () => {
    render(<AboutPage />);

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

    // Explore Destinations CTA is present in hero and closing CTA
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

  it("renders What Guides Us values section with 3 core principles", () => {
    render(<AboutPage />);

    expect(screen.getByText(/what guides us/i)).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: /more than a destination\. an experience\./i,
      }),
    ).toBeDefined();

    // Values appear in the editorial columns and accordion
    expect(
      screen.getAllByText(/thoughtful journeys/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/meaningful experiences/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/simpler planning/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders the travel inspiration image section", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", {
        name: /every destination has a story\./i,
      }),
    ).toBeDefined();
    expect(
      screen.getByText(
        /find inspiration in the places, people, and experiences/i,
      ),
    ).toBeDefined();
    expect(screen.getByText(/oeschinensee, swiss alps/i)).toBeDefined();
  });

  it("renders the closing CTA section linking to destinations", () => {
    render(<AboutPage />);

    expect(screen.getByText(/your next adventure/i)).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: /your next story starts here\./i,
      }),
    ).toBeDefined();
    expect(
      screen.getByText(/discover a new destination and start imagining/i),
    ).toBeDefined();
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
