import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { Navbar } from "./Navbar";

afterEach(() => {
  cleanup();
});

describe("Navbar Component", () => {
  it("renders Tour Packages link and Services dropdown button", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /tour packages/i })).toBeDefined();
    // Services is now a dropdown toggle button, not a link
    expect(screen.getByRole("button", { name: /services/i })).toBeDefined();
  });

  it("renders About and Contact links", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /about/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /contact/i })).toBeDefined();
  });

  it("renders FLYORA brand logo", () => {
    render(<Navbar />);

    expect(screen.getByText("FLYORA")).toBeDefined();
  });

  it("renders CTA button and triggers handler", () => {
    const onOpenEnquiry = vi.fn();
    render(<Navbar onOpenEnquiry={onOpenEnquiry} ctaLabel="Plan My Trip" />);

    // Get all "plan my trip" buttons — there's one in desktop and one in mobile drawer
    const ctaButtons = screen.getAllByRole("button", {
      name: /plan my trip/i,
    });
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(ctaButtons[0]);
    expect(onOpenEnquiry).toHaveBeenCalledTimes(1);
  });

  it("triggers onFindAdvisor fallback when clicking CTA", () => {
    const onFindAdvisor = vi.fn();
    render(<Navbar onFindAdvisor={onFindAdvisor} />);

    const ctaButton = screen.getAllByRole("button", {
      name: /plan my trip/i,
    })[0];
    fireEvent.click(ctaButton);

    expect(onFindAdvisor).toHaveBeenCalledTimes(1);
  });

  it("opens services dropdown and shows 4 cards on hover", () => {
    const onOpenEnquiry = vi.fn();
    render(<Navbar onOpenEnquiry={onOpenEnquiry} />);

    // Trigger hover on services
    const servicesTrigger = screen.getByTestId("services-trigger");
    fireEvent.mouseEnter(servicesTrigger);

    // All 4 service cards should now be visible
    expect(
      screen.getByRole("button", { name: /custom holidays/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /visa assistance/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /flight booking/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /umrah packages/i }),
    ).toBeDefined();
  });

  it("opens services dropdown and shows service items on click", () => {
    const onOpenEnquiry = vi.fn();
    render(<Navbar onOpenEnquiry={onOpenEnquiry} />);

    // Open the services dropdown
    const servicesButton = screen.getByRole("button", { name: /services/i });
    fireEvent.click(servicesButton);

    // Service items should now be visible as buttons
    expect(
      screen.getByRole("button", { name: /custom holidays/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /visa assistance/i }),
    ).toBeDefined();
  });

  it("triggers onOpenEnquiry when clicking a service item in dropdown", () => {
    const onOpenEnquiry = vi.fn();
    render(<Navbar onOpenEnquiry={onOpenEnquiry} />);

    // Open dropdown
    const servicesButton = screen.getByRole("button", { name: /services/i });
    fireEvent.click(servicesButton);

    // Click a service item
    const visaButton = screen.getByRole("button", { name: /visa assistance/i });
    fireEvent.click(visaButton);

    expect(onOpenEnquiry).toHaveBeenCalledWith("Visas");
  });

  it("toggles mobile menu on hamburger button click", () => {
    render(<Navbar />);

    const menuToggle = screen.getByLabelText(/open menu/i);
    expect(menuToggle).toBeDefined();

    fireEvent.click(menuToggle);
    expect(screen.getByLabelText(/close menu/i)).toBeDefined();

    // Tour Packages appears in both desktop and mobile
    const tourLinks = screen.getAllByRole("link", { name: /tour packages/i });
    expect(tourLinks.length).toBeGreaterThanOrEqual(2);
  });
});
