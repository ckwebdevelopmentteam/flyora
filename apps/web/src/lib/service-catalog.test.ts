import { afterEach, expect, it, vi } from "vitest";
import { loadPackages, resolveService } from "./service-catalog";
afterEach(() => vi.unstubAllGlobals());
it("resolves legacy service labels without silently choosing another service", () => {
  const services = [
    {
      id: "id",
      name: "Holiday Packages",
      slug: "holiday-packages",
      minMarginPercent: 10,
    },
  ];
  expect(resolveService(services, "Custom Holidays")?.id).toBe("id");
  expect(resolveService(services, "Flights")).toBeUndefined();
});
it("loads all catalogue pages, including an empty catalogue without fake fallback records", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ data: { items: [{ id: "one" }], totalPages: 2 } }),
      ),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ data: { items: [{ id: "two" }], totalPages: 2 } }),
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  expect(await loadPackages(new AbortController().signal)).toEqual([
    { id: "one" },
    { id: "two" },
  ]);
  expect(fetcher.mock.calls[1][0]).toContain("page=2");
  fetcher.mockResolvedValueOnce(
    new Response(JSON.stringify({ data: { items: [], totalPages: 0 } })),
  );
  expect(await loadPackages(new AbortController().signal)).toEqual([]);
});
