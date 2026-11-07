import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import Team from "./team-02";

beforeEach(() => {
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

describe("Team Component (team-02)", () => {
  it("renders default team members, badge, and title", () => {
    render(<Team />);
    expect(screen.getByText("Team")).toBeDefined();
    expect(screen.getByText("Meet our team")).toBeDefined();
    expect(screen.getByText("Martha Finley")).toBeDefined();
    expect(screen.getByText("Creative Director")).toBeDefined();
    expect(screen.getByText("Floyd Miles")).toBeDefined();
    expect(screen.getByText("Glenna Snyder")).toBeDefined();
    expect(screen.getByText("Albert Flores")).toBeDefined();
  });

  it("renders custom team members when passed", () => {
    const customMembers = [
      {
        name: "Elena Vance",
        role: "Senior Travel Curator",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      },
    ];

    render(
      <Team
        badge="Curators"
        title="Meet our travel curators"
        members={customMembers}
      />,
    );

    expect(screen.getByText("Curators")).toBeDefined();
    expect(screen.getByText("Meet our travel curators")).toBeDefined();
    expect(screen.getByText("Elena Vance")).toBeDefined();
    expect(screen.getByText("Senior Travel Curator")).toBeDefined();
  });
});
