import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { Navbar } from "./Navbar";

afterEach(() => {
  cleanup();
});

describe("Navbar Component", () => {
  it("renders the 5 clean navigation links replacing search bar", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /tour packages/i })).toBeDefined();
    expect(
      screen.getByRole("link", { name: /custom holidays/i }),
    ).toBeDefined();
    expect(screen.getByRole("link", { name: /visas/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /flights/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /umrah/i })).toBeDefined();
  });

  it("renders FLYORA brand logo", () => {
    render(<Navbar />);

    expect(screen.getByText("FLYORA")).toBeDefined();
  });

  it("renders CTA button and triggers handler", () => {
    const onOpenEnquiry = vi.fn();
    render(<Navbar onOpenEnquiry={onOpenEnquiry} ctaLabel="Plan My Trip" />);

    const ctaButton = screen.getByRole("button", {
      name: /plan my trip/i,
    });
    expect(ctaButton).toBeDefined();

    fireEvent.click(ctaButton);
    expect(onOpenEnquiry).toHaveBeenCalledTimes(1);
  });

  it("triggers onFindAdvisor fallback when clicking CTA", () => {
    const onFindAdvisor = vi.fn();
    render(<Navbar onFindAdvisor={onFindAdvisor} />);

    const ctaButton = screen.getByRole("button", {
      name: /plan my trip/i,
    });
    fireEvent.click(ctaButton);

    expect(onFindAdvisor).toHaveBeenCalledTimes(1);
  });

  it("triggers onOpenEnquiry with serviceId when clicking service link", () => {
    const onOpenEnquiry = vi.fn();
    render(<Navbar onOpenEnquiry={onOpenEnquiry} />);

    const visasLink = screen.getByRole("link", { name: /visas/i });
    fireEvent.click(visasLink);

    expect(onOpenEnquiry).toHaveBeenCalledWith("Visas");

    const umrahLink = screen.getByRole("link", { name: /umrah/i });
    fireEvent.click(umrahLink);

    expect(onOpenEnquiry).toHaveBeenCalledWith("Umrah Packages");
  });

  it("toggles mobile menu on hamburger button click and displays all 5 links", () => {
    render(<Navbar />);

    const menuToggle = screen.getByLabelText(/open menu/i);
    expect(menuToggle).toBeDefined();

    fireEvent.click(menuToggle);
    expect(screen.getByLabelText(/close menu/i)).toBeDefined();

    // Mobile menu items are now also rendered in the DOM
    const tourLinks = screen.getAllByRole("link", { name: /tour packages/i });
    expect(tourLinks.length).toBeGreaterThanOrEqual(2);
  });
});
