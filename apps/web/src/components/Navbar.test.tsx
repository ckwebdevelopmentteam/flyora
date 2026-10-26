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

  it("opens services dropdown and shows service cards linking to /services on hover", () => {
    render(<Navbar />);

    // Trigger hover on services
    const servicesTrigger = screen.getByTestId("services-trigger");
    fireEvent.mouseEnter(servicesTrigger);

    // Initial page cards should be rendered as links to dedicated sections
    const holidayLink = screen.getByRole("link", { name: /custom holidays/i });
    expect(holidayLink).toBeDefined();
    expect(holidayLink.getAttribute("href")).toBe("/services#custom-holidays");

    const visaLink = screen.getByRole("link", { name: /visa assistance/i });
    expect(visaLink).toBeDefined();
    expect(visaLink.getAttribute("href")).toBe("/services#visa-assistance");

    const flightLink = screen.getByRole("link", { name: /flight booking/i });
    expect(flightLink).toBeDefined();
    expect(flightLink.getAttribute("href")).toBe("/services#flight-booking");

    const trainLink = screen.getByRole("link", { name: /train booking/i });
    expect(trainLink).toBeDefined();
    expect(trainLink.getAttribute("href")).toBe("/services#train-booking");
  });

  it("navigates slides using arrows and dots in services mega modal", () => {
    render(<Navbar />);

    // Open dropdown
    const servicesTrigger = screen.getByTestId("services-trigger");
    fireEvent.mouseEnter(servicesTrigger);

    const prevArrow = screen.getByTestId("services-prev-arrow");
    const nextArrow = screen.getByTestId("services-next-arrow");
    const dot0 = screen.getByTestId("services-dot-0");
    const dot1 = screen.getByTestId("services-dot-1");

    // Initially on page 0: prev arrow is disabled
    expect(prevArrow.getAttribute("disabled")).not.toBeNull();
    expect(nextArrow.getAttribute("disabled")).toBeNull();

    // Click next arrow to move to page 1
    fireEvent.click(nextArrow);

    // On page 1: next arrow is disabled, prev arrow enabled
    expect(nextArrow.getAttribute("disabled")).not.toBeNull();
    expect(prevArrow.getAttribute("disabled")).toBeNull();

    // Cards in second slide should be present as links
    const busLink = screen.getByRole("link", { name: /bus booking/i });
    expect(busLink).toBeDefined();
    expect(busLink.getAttribute("href")).toBe("/services#bus-booking");

    const umrahLink = screen.getByRole("link", { name: /umrah packages/i });
    expect(umrahLink).toBeDefined();
    expect(umrahLink.getAttribute("href")).toBe("/services#umrah-packages");

    const hajjLink = screen.getByRole("link", { name: /hajj packages/i });
    expect(hajjLink).toBeDefined();
    expect(hajjLink.getAttribute("href")).toBe("/services#hajj-packages");

    // Click dot 0 to go back to page 0
    fireEvent.click(dot0);
    expect(prevArrow.getAttribute("disabled")).not.toBeNull();
    expect(nextArrow.getAttribute("disabled")).toBeNull();

    // Click dot 1 to go to page 1
    fireEvent.click(dot1);
    expect(nextArrow.getAttribute("disabled")).not.toBeNull();
  });

  it("closes dropdown when clicking a service link", () => {
    render(<Navbar />);

    // Open dropdown
    const servicesButton = screen.getByRole("button", { name: /services/i });
    fireEvent.click(servicesButton);

    const visaLink = screen.getByRole("link", { name: /visa assistance/i });
    expect(visaLink).toBeDefined();
    fireEvent.click(visaLink);

    // Dropdown closes after link is clicked
    expect(screen.queryByTestId("services-prev-arrow")).toBeNull();
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
