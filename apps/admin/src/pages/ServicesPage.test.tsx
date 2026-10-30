// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServicesPage } from "./ServicesPage";
import { apiClient, ApiError } from "../lib/apiClient";
vi.mock("../lib/apiClient", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  ApiError: class extends Error {
    constructor(
      message: string,
      public statusCode: number,
    ) {
      super(message);
    }
  },
}));
const service = {
  id: "holiday",
  name: "Holiday Packages",
  slug: "holiday-packages",
  description: "Tailored trips",
  minMarginPercent: 12,
  isActive: true,
  _count: { coordinators: 2, packages: 2, leads: 3 },
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(apiClient.get).mockResolvedValue([service]);
});
afterEach(cleanup);
function show() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ServicesPage />
    </QueryClientProvider>,
  );
  return client;
}
it("creates a service with validated fields and refreshes service assignment choices", async () => {
  const client = show();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  await screen.findByText("Holiday Packages");
  fireEvent.click(screen.getByRole("button", { name: "Add service" }));
  expect(screen.queryByLabelText(/quote margin/i)).toBeNull();
  fireEvent.change(screen.getByLabelText("Service name"), {
    target: { value: "Rail journeys" },
  });
  fireEvent.change(screen.getByLabelText("Short description"), {
    target: { value: "Scenic train trips" },
  });
  vi.mocked(apiClient.post).mockResolvedValue({ id: "rail" });
  fireEvent.click(screen.getByRole("button", { name: "Save service" }));
  await screen.findByText("Service saved.");
  expect(apiClient.post).toHaveBeenCalledWith("/services", {
    name: "Rail journeys",
    description: "Scenic train trips",
    isActive: true,
  });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ["services"] });
});
it("pauses a service without deleting it or its existing assignments", async () => {
  show();
  fireEvent.click(
    await screen.findByRole("button", { name: "Edit Holiday Packages" }),
  );
  fireEvent.click(screen.getByLabelText("Active on the website"));
  expect(
    screen.getByText(/Existing enquiries and team assignments are kept/),
  ).toBeDefined();
  vi.mocked(apiClient.patch).mockResolvedValue({});
  fireEvent.click(screen.getByRole("button", { name: "Save service" }));
  await waitFor(() =>
    expect(apiClient.patch).toHaveBeenCalledWith(
      "/services/holiday",
      expect.objectContaining({ isActive: false }),
    ),
  );
});
it("shows a useful duplicate-name message and keeps entered values", async () => {
  show();
  await screen.findByText("Holiday Packages");
  fireEvent.click(screen.getByRole("button", { name: "Add service" }));
  fireEvent.change(screen.getByLabelText("Service name"), {
    target: { value: "Holiday Packages" },
  });
  vi.mocked(apiClient.post).mockRejectedValue(
    new ApiError("Database details must not leak", 409),
  );
  fireEvent.click(screen.getByRole("button", { name: "Save service" }));
  expect((await screen.findByRole("alert")).textContent).toContain(
    "already exists",
  );
  expect(screen.getByDisplayValue("Holiday Packages")).toBeDefined();
  expect(screen.queryByText("Database details must not leak")).toBeNull();
});
