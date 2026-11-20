import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { NavigationScrollHandler } from "./NavigationScrollHandler";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("NavigationScrollHandler", () => {
  beforeEach(() => {
    mockPathname = "/";
    vi.stubGlobal("scrollTo", vi.fn());
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb) => {
        cb(0);
        return 1;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  it("resets scroll position to top on initial mount and route change", () => {
    const { rerender } = render(<NavigationScrollHandler />);

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    // Simulate route navigation to /services
    mockPathname = "/services";
    rerender(<NavigationScrollHandler />);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  });
});
