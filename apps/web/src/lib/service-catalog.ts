import type { PackageSummary, ServiceSummary } from "@flyora/types";

const aliases: Record<string, string> = {
  "custom-holidays": "holiday-packages",
  holidays: "holiday-packages",
  visas: "visa-assistance",
  flights: "flight-booking",
  trains: "train-booking",
  buses: "bus-booking",
  "umrah-packages": "umrah-hajj",
  "hajj-packages": "umrah-hajj",
};
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export function resolveService(services: ServiceSummary[], value?: string) {
  if (!value) return undefined;
  const slug = slugify(value);
  return (
    services.find(
      (s) => s.id === value || s.slug === slug || slugify(s.name) === slug,
    ) ?? services.find((s) => s.slug === aliases[slug])
  );
}
export const publicApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
export async function loadServices(
  signal: AbortSignal,
): Promise<ServiceSummary[]> {
  const res = await fetch(`${publicApiUrl()}/services`, {
    signal,
    cache: "no-store",
  });
  const body = await res.json();
  if (
    !res.ok ||
    !Array.isArray(body.data) ||
    !body.data.every(
      (s: ServiceSummary) =>
        s &&
        typeof s.id === "string" &&
        typeof s.name === "string" &&
        typeof s.slug === "string",
    )
  )
    throw new Error("Services are unavailable. Please try again.");
  return body.data;
}
export async function loadPackages(
  signal: AbortSignal,
): Promise<PackageSummary[]> {
  const items: PackageSummary[] = [];
  // The API caps each page at 50. Fetch every page so admin additions are not silently omitted.
  let pages = 1;
  for (let page = 1; page <= pages; page++) {
    const res = await fetch(
      `${publicApiUrl()}/packages?limit=50&page=${page}`,
      { signal, cache: "no-store" },
    );
    const body = await res.json();
    if (
      !res.ok ||
      !Array.isArray(body.data?.items) ||
      !Number.isInteger(body.data.totalPages) ||
      body.data.totalPages < 0
    )
      throw new Error("Packages are unavailable. Please try again.");
    pages = body.data.totalPages;
    items.push(...body.data.items);
  }
  return items;
}
