// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServiceOrderModal } from "./ServiceOrderModal";
import { apiClient, ApiError } from "../../lib/apiClient";
vi.mock("../../lib/apiClient", () => ({
  apiClient: { put: vi.fn() },
  ApiError: class extends Error {
    constructor(
      message: string,
      public statusCode: number,
    ) {
      super(message);
    }
  },
}));
const services = [
  {
    id: "holiday",
    name: "Holidays",
    slug: "holidays",
    minMarginPercent: 12,
    isActive: true,
    _count: { coordinators: 1, packages: 2, leads: 3 },
  },
  {
    id: "visa",
    name: "Visas",
    slug: "visas",
    minMarginPercent: 10,
    isActive: false,
    _count: { coordinators: 1, packages: 0, leads: 0 },
  },
];
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);
function show() {
  const onClose = vi.fn();
  const onSaved = vi.fn(async () => {});
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ServiceOrderModal
        services={services}
        onClose={onClose}
        onSaved={onSaved}
      />
    </QueryClientProvider>,
  );
  return { onClose, onSaved };
}
it("keeps moves local until Save order and includes paused services in the persisted order", async () => {
  const { onSaved } = show();
  expect(
    (screen.getByRole("button", { name: "Save order" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Move Visas up" }));
  expect(apiClient.put).not.toHaveBeenCalled();
  expect(screen.getAllByRole("listitem").map((row) => row.textContent)).toEqual(
    [expect.stringContaining("Visas"), expect.stringContaining("Holidays")],
  );
  vi.mocked(apiClient.put).mockResolvedValue({ success: true });
  fireEvent.click(screen.getByRole("button", { name: "Save order" }));
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  expect(apiClient.put).toHaveBeenCalledWith("/services/order", {
    serviceIds: ["visa", "holiday"],
    expectedServiceIds: ["holiday", "visa"],
  });
});
it("Cancel does not save a changed order", () => {
  const { onClose } = show();
  fireEvent.click(screen.getByRole("button", { name: "Move Holidays down" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(apiClient.put).not.toHaveBeenCalled();
});
it("blocks stale saves and provides a safe way to reload after another admin changes the list", async () => {
  const { onClose } = show();
  fireEvent.click(screen.getByRole("button", { name: "Move Visas up" }));
  vi.mocked(apiClient.put).mockRejectedValue(
    new ApiError("Provider details", 409),
  );
  fireEvent.click(screen.getByRole("button", { name: "Save order" }));
  expect((await screen.findByRole("alert")).textContent).toContain(
    "service list has changed",
  );
  expect(screen.queryByText("Provider details")).toBeNull();
  expect(
    (screen.getByRole("button", { name: "Save order" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Reload services" }));
  expect(onClose).toHaveBeenCalledOnce();
});
