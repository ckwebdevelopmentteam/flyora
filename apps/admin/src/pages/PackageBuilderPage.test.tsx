// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PackageBuilderPage } from "./PackageBuilderPage";
import { packagesApi } from "../lib/packagesApi";
import { apiClient } from "../lib/apiClient";
vi.mock("../lib/packagesApi", () => ({
  packagesApi: {
    getPackageBySlug: vi.fn(),
    createPackage: vi.fn(),
    updatePackage: vi.fn(),
  },
}));
vi.mock("../lib/apiClient", () => ({ apiClient: { get: vi.fn() } }));
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useParams: () => ({ slug: "kerala" }),
  useNavigate: () => vi.fn(),
}));
const serviceId = "d9f3e000-8bca-4cd9-986d-277d4ecf8031";
const pkg = {
  id: "package",
  serviceId,
  serviceName: "Holidays",
  title: "Kerala backwaters",
  slug: "kerala",
  destination: "Alleppey, India",
  destinationType: "DOMESTIC" as const,
  durationDays: 3,
  durationNights: 2,
  startingPrice: 25000,
  coverImageUrl: "https://photos.test/kerala.jpg",
  galleryImageUrls: [],
  overview: "A calm stay in the backwaters.",
  itinerary: [
    {
      day: 1,
      title: "Arrival",
      description: "Check in to your accommodation.",
    },
  ],
  inclusions: [],
  exclusions: [],
  keywords: [],
  isPublished: true,
  isFeatured: false,
  createdAt: "2026-11-06T00:00:00Z",
  updatedAt: "2026-11-06T00:00:00Z",
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(apiClient.get).mockResolvedValue([
    { id: serviceId, name: "Holidays" },
  ]);
  vi.mocked(packagesApi.getPackageBySlug).mockResolvedValue(pkg);
  vi.mocked(packagesApi.updatePackage).mockResolvedValue(pkg);
});
afterEach(cleanup);
function show() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <PackageBuilderPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}
it("loads the saved destination type and persists a category change", async () => {
  show();
  await screen.findByDisplayValue(pkg.title);
  expect(
    (screen.getByLabelText(/Destination type/) as HTMLSelectElement).value,
  ).toBe("DOMESTIC");
  fireEvent.change(screen.getByLabelText(/Destination type/), {
    target: { value: "INTERNATIONAL" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Update Package" }));
  await waitFor(() =>
    expect(packagesApi.updatePackage).toHaveBeenCalledWith(
      pkg.id,
      expect.objectContaining({ destinationType: "INTERNATIONAL" }),
    ),
  );
});
it("requires an explicit classification for a legacy package", async () => {
  vi.mocked(packagesApi.getPackageBySlug).mockResolvedValue({
    ...pkg,
    destinationType: null,
  });
  show();
  await screen.findByDisplayValue(pkg.title);
  expect(
    (screen.getByLabelText(/Destination type/) as HTMLSelectElement).value,
  ).toBe("");
  fireEvent.click(screen.getByRole("button", { name: "Update Package" }));
  expect(
    await screen.findByText("Choose Domestic or International"),
  ).toBeDefined();
  expect(packagesApi.updatePackage).not.toHaveBeenCalled();
});
