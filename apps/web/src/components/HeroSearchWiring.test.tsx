import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HeroSearchCard } from "./HeroSearchCard";
import { useServicesCatalog } from "../lib/use-services-catalog";
vi.mock("../lib/use-services-catalog", () => ({ useServicesCatalog: vi.fn() }));
afterEach(cleanup);
const flight = {
  id: "flight-id",
  name: "Flight Booking",
  slug: "flight-booking",
  minMarginPercent: 0,
};
it("does not invent services that the admin has not enabled", () => {
  vi.mocked(useServicesCatalog).mockReturnValue({
    services: [flight],
    loaded: true,
    error: false,
    retry: vi.fn(),
  });
  render(<HeroSearchCard />);
  expect(screen.getByRole("button", { name: /Flight Booking/ })).toBeTruthy();
  expect(
    screen.queryByRole("button", {
      name: /Bus Booking|Train Booking|Holiday Packages/,
    }),
  ).toBeNull();
});
it("supports an admin-added service and passes its exact ID to the enquiry", () => {
  const custom = {
    ...flight,
    id: "custom-id",
    name: "Travel insurance",
    slug: "travel-insurance",
  };
  vi.mocked(useServicesCatalog).mockReturnValue({
    services: [custom],
    loaded: true,
    error: false,
    retry: vi.fn(),
  });
  const open = vi.fn();
  render(<HeroSearchCard onOpenEnquiry={open} />);
  fireEvent.click(screen.getByRole("button", { name: /Travel insurance/ }));
  fireEvent.click(screen.getByRole("button", { name: "Request a Quote" }));
  expect(open).toHaveBeenCalledWith(
    custom.id,
    expect.objectContaining({ serviceId: custom.id, serviceName: custom.name }),
  );
});
it("does not claim an enquiry was submitted when the service catalogue fails", () => {
  vi.mocked(useServicesCatalog).mockReturnValue({
    services: [],
    loaded: true,
    error: true,
    retry: vi.fn(),
  });
  const open = vi.fn();
  render(<HeroSearchCard onOpenEnquiry={open} />);
  const button = screen.getByRole("button", {
    name: "Request a Quote",
  }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  fireEvent.click(button);
  expect(open).not.toHaveBeenCalled();
  expect(screen.queryByText("Quote Requested")).toBeNull();
});
