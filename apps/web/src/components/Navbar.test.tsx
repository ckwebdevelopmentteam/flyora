import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { Navbar } from "./Navbar";

afterEach(() => {
  cleanup();
});

describe("Navbar Component", () => {
  it("renders desktop navigation links with correct labels", () => {
    render(<Navbar />);

    expect(
      screen.getByRole("button", { name: /find an advisor/i }),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: /^explore$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /about/i })).toBeDefined();
  });

  it("renders FLYORA brand logo", () => {
    render(<Navbar />);

    expect(screen.getByText("FLYORA")).toBeDefined();
  });

  it("renders BECOME AN ADVISOR CTA button and triggers handler", () => {
    const onBecomeAdvisor = vi.fn();
    render(<Navbar onBecomeAdvisor={onBecomeAdvisor} />);

    const ctaButton = screen.getByRole("button", {
      name: /become an advisor/i,
    });
    expect(ctaButton).toBeDefined();

    fireEvent.click(ctaButton);
    expect(onBecomeAdvisor).toHaveBeenCalledTimes(1);
  });

  it("triggers onFindAdvisor when clicking FIND AN ADVISOR link", () => {
    const onFindAdvisor = vi.fn();
    render(<Navbar onFindAdvisor={onFindAdvisor} />);

    const findAdvisorBtn = screen.getByRole("button", {
      name: /find an advisor/i,
    });
    fireEvent.click(findAdvisorBtn);

    expect(onFindAdvisor).toHaveBeenCalledTimes(1);
  });

  it("switches to exact search navbar when clicking search or explore", () => {
    render(<Navbar />);

    const searchBtn = screen.getAllByLabelText(
      /search destinations and advisors/i,
    )[0];
    fireEvent.click(searchBtn);

    // Verify exact search navbar elements matching user screenshot
    expect(
      screen.getByPlaceholderText(/discover destinations, advisors, and more/i),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: /get matched/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /^explore$/i })).toBeDefined();

    // Close search
    const closeBtn = screen.getByLabelText(/close search/i);
    fireEvent.click(closeBtn);

    expect(
      screen.getByRole("button", { name: /find an advisor/i }),
    ).toBeDefined();
  });

  it("toggles mobile menu on hamburger button click", () => {
    render(<Navbar />);

    const menuToggle = screen.getByLabelText(/open menu/i);
    expect(menuToggle).toBeDefined();

    fireEvent.click(menuToggle);
    expect(screen.getByLabelText(/close menu/i)).toBeDefined();
  });
});
