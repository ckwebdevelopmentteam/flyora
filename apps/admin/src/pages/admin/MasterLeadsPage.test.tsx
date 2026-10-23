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
      <MasterLeadsPage />
    </QueryClientProvider>,
  );
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    expect.stringContaining("API unavailable"),
  );
  expect(screen.queryByText("No leads found")).toBeNull();
  vi.mocked(apiClient.get).mockResolvedValue({
    leads: [],
    total: 0,
    page: 1,
    limit: 15,
  });
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("No leads found")).toBeTruthy();
});
