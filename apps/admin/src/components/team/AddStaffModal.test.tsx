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
import { AddStaffModal } from "./AddStaffModal";
import { apiClient } from "../../lib/apiClient";
vi.mock("../../lib/apiClient", () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));
const services = [
  { id: "flight", name: "Flight booking" },
  { id: "hotel", name: "Hotel booking" },
];
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(apiClient.get).mockResolvedValue(services);
});
afterEach(cleanup);
function show() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const close = vi.fn();
  render(
    <QueryClientProvider client={client}>
      <AddStaffModal isOpen onClose={close} />
    </QueryClientProvider>,
  );
  return close;
}
const next = () =>
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
const fillDetails = () => {
  for (const [name, value] of [
    ["Full name", "UI Test Staff"],
    ["Email address", "test@example.test"],
    ["Phone number", "+919876543210"],
    ["Password", "Strong-test-password"],
  ])
    fireEvent.change(screen.getByLabelText(name), { target: { value } });
};
it("validates account fields before allowing role selection", async () => {
  show();
  next();
  expect(await screen.findByText("Full name is required")).toBeTruthy();
  expect(screen.queryByLabelText("Role")).toBeNull();
  expect(apiClient.post).not.toHaveBeenCalled();
});
it("requires service selection for a coordinator and only creates after review", async () => {
  const close = show();
  fillDetails();
  next();
  await screen.findByLabelText("Role");
  next();
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Choose at least one",
  );
  fireEvent.click(screen.getByLabelText("Flight booking"));
  next();
  await screen.findByRole("button", { name: "Create account" });
  expect(screen.queryByDisplayValue("Strong-test-password")).toBeNull();
  expect(apiClient.post).not.toHaveBeenCalled();
  vi.mocked(apiClient.post).mockResolvedValue({ id: "new-staff" });
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(apiClient.post).toHaveBeenCalledWith(
    "/users",
    expect.objectContaining({
      email: "test@example.test",
      serviceIds: ["flight"],
      primaryServiceId: "flight",
    }),
  );
});
it("keeps entered account details when returning from the next step", async () => {
  show();
  fillDetails();
  next();
  await screen.findByLabelText("Role");
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(
    (screen.getByLabelText("Email address") as HTMLInputElement).value,
  ).toBe("test@example.test");
});
