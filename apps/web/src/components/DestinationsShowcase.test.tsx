import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DestinationsShowcase } from "./DestinationsShowcase";
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock("@/components/ui/straight-cards-carousel", () => ({
  StraightCardsCarousel: ({
    items,
    onSelectLead,
  }: {
    items: { id: string; title: string; price: string }[];
    onSelectLead: (item: unknown) => void;
  }) => (
    <div>
      {items.map((item) => (
        <button key={item.id} onClick={() => onSelectLead(item)}>
          {item.title} {item.price}
        </button>
      ))}
    </div>
  ),
}));
const intl = {
  id: "bali",
  serviceId: "holidays",
  serviceName: "Holiday Packages",
  title: "Bali Island Escape",
  slug: "bali-island-escape",
  destination: "Bali, Indonesia",
  destinationType: "INTERNATIONAL",
  durationDays: 5,
  durationNights: 4,
  startingPrice: 48000,
  coverImageUrl: "https://photos.test/bali.jpg",
  overview: "A quiet week in Bali.",
  isPublished: true,
};
const domestic = {
  ...intl,
  id: "kerala",
  title: "Kerala backwaters",
  slug: "kerala-backwaters",
  destination: "Alleppey, India",
  destinationType: "DOMESTIC",
};
const response = (items: unknown[]) =>
  new Response(JSON.stringify({ data: { items, totalPages: 1 } }));
beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("shows database packages in the correct category and sends the exact package to enquiry", async () => {
  vi.mocked(fetch).mockResolvedValue(
    response([
      intl,
      domestic,
      { ...intl, id: "draft", title: "Draft trip", isPublished: false },
      {
        ...intl,
        id: "unclassified",
        title: "Unclassified",
        destinationType: null,
      },
    ]),
  );
  const enquire = vi.fn();
  render(<DestinationsShowcase onOpenEnquiry={enquire} />);
  expect(
    await screen.findByRole("heading", { name: intl.title }),
  ).toBeDefined();
  expect(screen.queryByRole("heading", { name: domestic.title })).toBeNull();
  expect(screen.queryByText("Draft trip")).toBeNull();
  expect(screen.queryByText("Unclassified")).toBeNull();
  expect(
    screen
      .getByRole("link", { name: "Explore the destination" })
      .getAttribute("href"),
  ).toBe("/tours/bali-island-escape");
  fireEvent.click(
    screen.getByRole("button", { name: /Bali Island Escape ₹48,000/ }),
  );
  expect(enquire).toHaveBeenCalledWith(intl);
  fireEvent.click(screen.getByRole("button", { name: "Domestic Destination" }));
  expect(screen.getByRole("heading", { name: domestic.title })).toBeDefined();
  expect(screen.queryByRole("heading", { name: intl.title })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Kerala backwaters/ }));
  expect(enquire).toHaveBeenLastCalledWith(domestic);
});
it("handles an empty category without inventing destination cards", async () => {
  vi.mocked(fetch).mockResolvedValue(response([intl]));
  render(<DestinationsShowcase />);
  await screen.findByRole("heading", { name: intl.title });
  fireEvent.click(screen.getByRole("button", { name: "Domestic Destination" }));
  expect(screen.getByRole("status").textContent).toContain(
    "New domestic trips are coming soon",
  );
  expect(
    screen.queryByRole("link", { name: "Explore the destination" }),
  ).toBeNull();
});
it("shows a safe error and retries a failed catalogue request", async () => {
  vi.mocked(fetch)
    .mockResolvedValueOnce(new Response("{}", { status: 503 }))
    .mockImplementation(async () => response([intl]));
  render(<DestinationsShowcase />);
  expect((await screen.findByRole("alert")).textContent).toContain(
    "couldn’t load",
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("heading", { name: intl.title }),
  ).toBeDefined();
});
