import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ContactPage } from "./ContactPage";
vi.mock("next/image", () => ({
  default: ({
    fill,
    priority,
    preload,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
    preload?: boolean;
  }) => {
    void fill;
    void priority;
    void preload;
    // The test double bypasses Next's image loader in jsdom.
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            data: [
              {
                id: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
                name: "Holiday Packages",
                slug: "holiday-packages",
              },
            ],
          }),
        ),
    ),
  );
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Contact page", () => {
  it("uses shared navigation, the homepage CTA directly above the footer, and office directions", async () => {
    render(<ContactPage />);
    await screen.findByRole("radio", { name: "Holiday Packages" });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Let’s talkabout your trip.",
    );
    expect(
      screen.getByRole("link", { name: /^contact$/i }).getAttribute("href"),
    ).toBe("/contact");
    const footer = screen.getByRole("contentinfo");
    expect(footer.previousElementSibling?.getAttribute("aria-labelledby")).toBe(
      "journey-cta-title",
    );
    expect(screen.queryByAltText(/concept image/)).toBeNull();
    expect(
      screen
        .getByTitle("Google Maps — Kochi location preview")
        .getAttribute("loading"),
    ).toBe("lazy");
    expect(screen.queryByText("View map")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Get directions" }).getAttribute("href"),
    ).toContain("Kochi");
    expect(
      screen
        .getByRole("link", { name: "Chat on WhatsApp" })
        .getAttribute("href"),
    ).toContain("https://wa.me/");
    expect(
      screen
        .getByRole("link", { name: /Instagram \(opens/ })
        .getAttribute("rel"),
    ).toBe("noopener noreferrer");
    expect(
      screen
        .getByRole("link", { name: "Arrange a visit" })
        .getAttribute("href"),
    ).toContain("mailto:");
  });
  it("returns the shared CTA to the inline form and focuses the name field", async () => {
    render(<ContactPage />);
    await screen.findByRole("radio", { name: "Holiday Packages" });
    fireEvent.click(screen.getByRole("button", { name: "GET MATCHED" }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("Full name")),
    );
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
