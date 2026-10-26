import { MemoryRouter } from "react-router-dom";
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MasterLeadsPage } from "./MasterLeadsPage";
import { apiClient } from "../../lib/apiClient";
vi.mock("../../lib/apiClient", () => ({ apiClient: { get: vi.fn() } }));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
it("distinguishes a failed lead query from an empty result and can retry", async () => {
  vi.mocked(apiClient.get).mockImplementation(async (url) => {
    if (url.startsWith("/leads/")) throw new Error("API unavailable");
    return [];
  });
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter>
        <MasterLeadsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    expect.stringContaining("We couldn't load enquiries"),
  );
  expect(screen.queryByText("No enquiries found")).toBeNull();
  vi.mocked(apiClient.get).mockResolvedValue({
    leads: [],
    total: 0,
    page: 1,
    limit: 15,
  });
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("No enquiries found")).toBeTruthy();
});

it("opens the stage selected from the dashboard chart", async () => {
  vi.mocked(apiClient.get).mockImplementation(async (url) =>
    url.startsWith("/leads/")
      ? { leads: [], total: 0, page: 1, limit: 15 }
      : [],
  );
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter initialEntries={["/admin/leads?status=QUOTED"]}>
        <MasterLeadsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  expect(await screen.findByText("No enquiries found")).toBeTruthy();
  expect(
    vi
      .mocked(apiClient.get)
      .mock.calls.some(
        ([url]) =>
          url.startsWith("/leads/") &&
          new URL(url, "http://test.local").searchParams.get("status") ===
            "QUOTED",
      ),
  ).toBe(true);
});
