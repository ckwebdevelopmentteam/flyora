import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import { Navbar } from "./Navbar";
import { useServicesCatalog } from "../lib/use-services-catalog";
vi.mock("../lib/use-services-catalog", () => ({ useServicesCatalog: vi.fn() }));
const services = [
  "Flight Booking",
  "Holiday Packages",
  "Hotel Booking",
  "Umrah & Hajj",
  "Visa Assistance",
  "Travel Insurance",
  "Cruise Holidays",
  "Rail Journeys",
  "City Tours",
].map((name, i) => ({
  id: String(i),
  name,
  description: `Description of ${name}`,
  slug:
    [
      "flight-booking",
      "holiday-packages",
      "hotel-booking",
      "umrah-hajj",
      "visa-assistance",
    ][i] || name.toLowerCase().replaceAll(" ", "-"),
  minMarginPercent: 10,
}));
beforeEach(() => {
  window.history.replaceState(null, "", "/");
  vi.mocked(useServicesCatalog).mockReturnValue({
    services,
    loaded: true,
    error: false,
    retry: async () => {},
  });
});
afterEach(cleanup);
describe("database-driven service navigation", () => {
  it("keeps the primary navigation and CTA", () => {
    const action = vi.fn();
    render(<Navbar onOpenEnquiry={action} />);
    expect(
      screen.getByRole("link", { name: "Contact" }).getAttribute("href"),
    ).toBe("/contact");
    fireEvent.click(screen.getByRole("button", { name: /plan my trip/i }));
    expect(action).toHaveBeenCalledOnce();
  });
  it("lists live services only, with local images and canonical links", () => {
    render(<Navbar />);
    fireEvent.mouseEnter(screen.getByTestId("services-trigger"));
    expect(
      screen
        .getByRole("link", { name: /holiday packages/i })
        .getAttribute("href"),
    ).toBe("/services#holiday-packages");
    expect(
      screen.queryByRole("link", { name: /bus booking|train booking/i }),
    ).toBeNull();
    expect(screen.getByText("1 – 4 of 9")).toBeDefined();
  });
  it("paginates beyond seven services and shows the correct final count", () => {
    render(<Navbar />);
    fireEvent.mouseEnter(screen.getByTestId("services-trigger"));
    const next = screen.getByRole("button", { name: "Next services" });
    fireEvent.click(next);
    expect(
      screen.getByRole("link", { name: /Travel Insurance/i }),
    ).toBeDefined();
    fireEvent.click(next);
    expect(screen.getByText("9 – 9 of 9")).toBeDefined();
    expect(screen.getByRole("link", { name: /City Tours/i })).toBeDefined();
    expect((next as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Service page 1" }));
    expect(screen.getByRole("link", { name: /Flight Booking/i })).toBeDefined();
  });
  it("announces same-page selection, updates the fragment and closes the menu", () => {
    window.history.replaceState(null, "", "/services");
    const selected = vi.fn();
    window.addEventListener("hashchange", selected);
    render(<Navbar activePath="/services" />);
    fireEvent.mouseEnter(screen.getByTestId("services-trigger"));
    fireEvent.click(screen.getByRole("link", { name: /Holiday Packages/i }));
    expect(window.location.hash).toBe("#holiday-packages");
    expect(selected).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("link", { name: /Holiday Packages/i }),
    ).toBeNull();
    window.removeEventListener("hashchange", selected);
  });
  it("supports mobile navigation using the same live list", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText(/open menu/i));
    fireEvent.click(screen.getByRole("button", { name: /Services \(9\)/i }));
    expect(screen.getByRole("link", { name: /Rail Journeys/i })).toBeDefined();
  });
  it("shows a retry without inventing services on an API error", () => {
    const retry = vi.fn();
    vi.mocked(useServicesCatalog).mockReturnValue({
      services: [],
      loaded: true,
      error: true,
      retry,
    });
    render(<Navbar />);
    fireEvent.mouseEnter(screen.getByTestId("services-trigger"));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.queryByRole("link", { name: /Train Booking/i })).toBeNull();
  });
});
