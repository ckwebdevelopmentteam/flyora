import { cleanup, renderHook, waitFor, act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { refreshServices, useServicesCatalog } from "./use-services-catalog";
import { serviceImage } from "./service-visuals";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const service = {
  id: "one",
  name: "Flights",
  slug: "flight-booking",
  minMarginPercent: 10,
};
it("shares requests, reuses the warm list and refreshes it when the visitor returns", async () => {
  let finish!: (response: Response) => void;
  const fetcher = vi.fn(
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
  );
  vi.stubGlobal("fetch", fetcher);
  const first = refreshServices(true);
  expect(refreshServices(true)).toBe(first);
  finish(new Response(JSON.stringify({ data: [service] })));
  await first;
  const { result } = renderHook(useServicesCatalog);
  expect(result.current.services[0].name).toBe("Flights");
  await refreshServices();
  expect(fetcher).toHaveBeenCalledTimes(1);
  fetcher.mockImplementation(
    async () =>
      new Response(
        JSON.stringify({ data: [{ ...service, name: "Air tickets" }] }),
      ),
  );
  act(() => {
    window.dispatchEvent(new Event("focus"));
  });
  await waitFor(() =>
    expect(result.current.services[0].name).toBe("Air tickets"),
  );
  fetcher.mockImplementation(
    async () => new Response(JSON.stringify({ data: [] })),
  );
  await act(async () => {
    await refreshServices(true);
  });
  expect(result.current.services).toEqual([]);
});
it("uses a stable local default for a newly added service rather than random hydration changes", () => {
  expect(serviceImage("insurance")).toMatch(/^\/services\/.+\.webp$/);
  expect(serviceImage("insurance")).toBe(serviceImage("insurance"));
  expect(serviceImage("train-booking")).toBe("/services/train-booking.webp");
});
