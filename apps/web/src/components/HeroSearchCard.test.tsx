import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroSearchCard } from "./HeroSearchCard";

describe("HeroSearchCard Dynamic Cascading System", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        async () =>
          new Response(
            JSON.stringify({
              data: [
                {
                  id: "srv-flight",
                  name: "Flight Booking",
                  slug: "flight-booking",
                },
                {
                  id: "srv-holidays",
                  name: "Holiday Packages",
                  slug: "holiday-packages",
                },
                {
                  id: "srv-hotel",
                  name: "Hotel Booking",
                  slug: "hotel-booking",
                },
                {
                  id: "srv-visa",
                  name: "Visa Assistance",
                  slug: "visa-assistance",
                },
                { id: "srv-umrah", name: "Umrah & Hajj", slug: "umrah-hajj" },
                {
                  id: "srv-train",
                  name: "Train Booking",
                  slug: "train-booking",
                },
                { id: "srv-bus", name: "Bus Booking", slug: "bus-booking" },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders trip mode toggle with Domestic and International options", () => {
    render(<HeroSearchCard />);
    expect(
      screen.getByRole("button", { name: /Domestic Travel/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /International Travel/i }),
    ).toBeTruthy();
  });

  it("switches to Domestic Travel and displays domestic services while excluding Visa Assistance", async () => {
    render(<HeroSearchCard />);
    const domesticBtn = screen.getByRole("button", {
      name: /Domestic Travel/i,
    });
    fireEvent.click(domesticBtn);

    // Domestic services should be present
    expect(
      await screen.findByRole("button", { name: /Train Booking/i }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /Bus Booking/i })).toBeTruthy();

    // International-only services must NOT be shown for domestic trips
    expect(
      screen.queryByRole("button", { name: /Visa Assistance/i }),
    ).toBeNull();
  });

  it("switches to International Travel and displays Visa Assistance while excluding domestic ground transport", async () => {
    render(<HeroSearchCard />);
    const intlBtn = screen.getByRole("button", {
      name: /International Travel/i,
    });
    fireEvent.click(intlBtn);

    // Visa Assistance should be present for international trips
    expect(
      await screen.findByRole("button", { name: /Visa Assistance/i }),
    ).toBeTruthy();

    // Domestic Trains and Buses must NOT be shown for cross-border international trips
    expect(screen.queryByRole("button", { name: /Train Booking/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Bus Booking/i })).toBeNull();
  });

  it("cascades service selection and updates primary and secondary service types", async () => {
    render(<HeroSearchCard />);
    // Select Flight Booking
    const flightBtn = await screen.findByRole("button", {
      name: /Flight Booking/i,
    });
    fireEvent.click(flightBtn);

    // Flight displays trip types
    expect(screen.getByText("Trip Type")).toBeTruthy();
    expect(screen.getByText("Round-trip")).toBeTruthy();
    expect(screen.getByText("Cabin Class")).toBeTruthy();

    // Switch to Hotel & Resorts
    const hotelBtn = screen.getByRole("button", { name: /Hotel & Resorts/i });
    fireEvent.click(hotelBtn);

    // Hotel displays accommodation tier and room config
    expect(screen.getByText("Accommodation Tier")).toBeTruthy();
    expect(screen.getByText("Room Configuration")).toBeTruthy();
  });

  it("allows selecting options in the booking form dropdowns", async () => {
    render(<HeroSearchCard />);
    const tripTypeBtn = screen.getByText("Round-trip");
    fireEvent.click(tripTypeBtn);

    const oneWayOption = screen.getByRole("button", { name: /One-way/i });
    fireEvent.click(oneWayOption);

    expect(screen.getByText("One-way")).toBeTruthy();
  });

  it("calls onOpenEnquiry with rich summary and prefill data when Request a Quote is clicked", async () => {
    const handleEnquiry = vi.fn();
    render(<HeroSearchCard onOpenEnquiry={handleEnquiry} />);

    const quoteBtn = screen.getByRole("button", { name: /Request a Quote/i });
    fireEvent.click(quoteBtn);

    expect(handleEnquiry).toHaveBeenCalled();
    const [summary, prefill] = handleEnquiry.mock.calls[0];

    expect(summary).toContain("Flight Booking");
    expect(prefill).toMatchObject({
      serviceName: "Flight Booking",
      destination: expect.any(String),
      adults: expect.any(Number),
    });
  });

  it("shows 'Where do you want to go?' placeholder initially in destination", () => {
    render(<HeroSearchCard />);
    const destInput = screen.getByLabelText("Flying to");
    expect(destInput).toBeTruthy();
    expect(destInput.getAttribute("placeholder")).toBe(
      "Where do you want to go?",
    );
    expect((destInput as HTMLInputElement).value).toBe("");
  });

  it("removes Experience Style from Custom Holidays, presenting only 3 clean fields", async () => {
    render(<HeroSearchCard />);
    const holidayBtn = await screen.findByRole("button", {
      name: /Custom Holidays/i,
    });
    fireEvent.click(holidayBtn);

    // Should have Destination, Travel period, and Travelers
    expect(screen.getByLabelText("Destination")).toBeTruthy();
    expect(screen.getByText("Travel period")).toBeTruthy();
    expect(screen.getByText("Travelers")).toBeTruthy();

    // Must NOT have Experience Style
    expect(screen.queryByText(/Experience Style/i)).toBeNull();

    // Destination should display the placeholder initially
    const destInput = screen.getByLabelText("Destination");
    expect(destInput.getAttribute("placeholder")).toBe(
      "Where do you want to go?",
    );
    expect((destInput as HTMLInputElement).value).toBe("");
  });

  it("allows user to type destination freely as they wish", async () => {
    render(<HeroSearchCard />);
    const destInput = screen.getByLabelText("Flying to");
    fireEvent.change(destInput, { target: { value: "Shimla & Manali" } });
    expect((destInput as HTMLInputElement).value).toBe("Shimla & Manali");
  });

  it("enables dynamic typing with placeholders and live filtering in flight booking", async () => {
    render(<HeroSearchCard />);
    const fromInput = screen.getByLabelText("Flying from");
    expect(fromInput.getAttribute("placeholder")).toBe(
      "Where are you flying from?",
    );
    expect((fromInput as HTMLInputElement).value).toBe("");

    // Open dropdown
    const toggleBtn = screen.getByRole("button", {
      name: /Toggle Flying from options/i,
    });
    fireEvent.click(toggleBtn);

    // Type "del" in Flying from
    fireEvent.change(fromInput, { target: { value: "del" } });

    // Should dynamically show New Delhi match
    expect(await screen.findByText(/New Delhi/i)).toBeTruthy();

    // Type a custom flight origin
    fireEvent.change(fromInput, { target: { value: "San Francisco" } });
    const matches = await screen.findAllByText(/San Francisco/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("only asks how many members and children (below 11 years) in Travelers picker", async () => {
    render(<HeroSearchCard />);
    const holidayBtn = await screen.findByRole("button", {
      name: /Custom Holidays/i,
    });
    fireEvent.click(holidayBtn);

    // Open Travelers dropdown
    const travelersToggle = screen.getByRole("button", {
      name: /Toggle Travelers options/i,
    });
    fireEvent.click(travelersToggle);

    // Should display Members and Children (Below 11 years)
    expect(screen.getByText("Members")).toBeTruthy();
    expect(screen.getByText("Children")).toBeTruthy();
    expect(
      screen.getAllByText(/Below 11 years/i).length,
    ).toBeGreaterThanOrEqual(1);

    // Increment children
    const incChildBtn = screen.getByRole("button", {
      name: /Increase children/i,
    });
    fireEvent.click(incChildBtn);

    // Value should reflect 2 Members, 1 Child (below 11y)
    expect(screen.getByText(/2 Members, 1 Child \(below 11y\)/i)).toBeTruthy();
  });

  it("replaces train name / Train Category with Travel Date in Train Booking", async () => {
    render(<HeroSearchCard />);
    const trainBtn = await screen.findByRole("button", {
      name: /Train Booking/i,
    });
    fireEvent.click(trainBtn);

    // Should have From station, To station, Travel Date, and Travel Class
    expect(screen.getByLabelText("From station")).toBeTruthy();
    expect(screen.getByLabelText("To station")).toBeTruthy();
    expect(screen.getByText("Travel Date")).toBeTruthy();
    expect(screen.getByText("Travel Class")).toBeTruthy();

    // Must NOT have Train Category or train name fields
    expect(screen.queryByText("Train Category")).toBeNull();
    expect(screen.queryByText(/Vande Bharat/i)).toBeNull();
  });
});
