// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { PackagesListPage } from "./PackagesListPage";
import { packagesApi } from "../lib/packagesApi";
import { useAuthStore } from "../stores/authStore";
vi.mock("../lib/apiClient", () => ({
  apiClient: { get: vi.fn().mockResolvedValue([]) },
}));
vi.mock("../lib/packagesApi", () => ({
  packagesApi: {
    listPackages: vi.fn(),
    deletePackage: vi.fn(),
    getPackageBySlug: vi.fn(),
  },
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  useAuthStore.setState({ user: null });
});
it("requires explicit confirmation to delete a package and Cancel preserves it", async () => {
  useAuthStore.setState({
    user: { id: "admin", fullName: "Admin", role: "SUPER_ADMIN" } as any,
  });
  vi.mocked(packagesApi.listPackages).mockResolvedValue({
    items: [
      {
        id: "bali",
        title: "Bali Island Escape",
        slug: "bali",
        destination: "Bali",
        durationDays: 5,
        durationNights: 4,
        startingPrice: 48000,
        coverImageUrl: "https://photos.test/bali.jpg",
        serviceName: "Holidays",
        isPublished: true,
      },
    ],
    total: 1,
    page: 1,
    limit: 15,
    totalPages: 1,
  } as any);
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter>
        <PackagesListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  fireEvent.click(await screen.findByTitle("Delete package"));
  const dialog = screen.getByRole("dialog", { name: "Delete package?" });
  expect(within(dialog).getByText("Bali Island Escape")).toBeTruthy();
  expect(packagesApi.deletePackage).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(packagesApi.deletePackage).not.toHaveBeenCalled();
});
