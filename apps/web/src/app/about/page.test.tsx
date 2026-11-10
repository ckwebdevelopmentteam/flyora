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
  it("renders the hero section with About Us heading and headline", () => {
    render(<AboutPage />);

    expect(screen.getAllByText(/about us/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /about us/i,
      }),
    ).toBeDefined();
    expect(screen.getByText(/premier travel & tourism agency/i)).toBeDefined();
  });

  it("renders editorial narrative story sections", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", { name: /built for total travel freedom/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: /end-to-end travel, visa & air mobility solutions/i,
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: /full-spectrum agency services: visas, flights & holidays/i,
      }),
    ).toBeDefined();
  });

  it("renders our purpose and core mission", () => {
    render(<AboutPage />);

    expect(screen.getByText("OUR PURPOSE")).toBeDefined();
    expect(
      screen.getByText(
        /to make global visas, flights, and travel seamless, reliable, and remarkable/i,
      ),
    ).toBeDefined();
  });

  it("renders curators team showcase with advisor cards", () => {
    render(<AboutPage />);

    expect(screen.getByText("Elena Vance")).toBeDefined();
    expect(screen.getByText("Marcus Reed")).toBeDefined();
    expect(screen.getByText("Aria Chen")).toBeDefined();
    expect(screen.getByText("Julian Ross")).toBeDefined();
  });

  it("renders the approach planning section", () => {
    render(<AboutPage />);

    expect(screen.getByText(/how we plan our journeys/i)).toBeDefined();
    expect(screen.getByText(/we prioritize thoughtful pacing/i)).toBeDefined();
  });

  it("opens the enquiry modal when clicking 'TALK TO OUR TRAVEL & VISA DESK'", () => {
    render(<AboutPage />);

    const deskBtn = screen.getByRole("button", {
      name: /talk to our travel & visa desk/i,
    });
    expect(deskBtn).toBeDefined();

    fireEvent.click(deskBtn);

    // Enquiry modal should open
    expect(screen.getByRole("dialog")).toBeDefined();
  });
});
