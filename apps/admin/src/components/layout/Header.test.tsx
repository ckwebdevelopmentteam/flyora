// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "./Header";
import { useAuthStore } from "../../stores/authStore";
import { logout } from "../../lib/apiClient";
vi.mock("../../lib/apiClient", () => ({
  logout: vi.fn(),
  apiClient: { patch: vi.fn() },
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  useAuthStore.setState({ user: null });
});
it("requires confirmation before signing out and allows cancellation", async () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
  expect(logout).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Stay signed in" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Sign out",
    }),
  );
  await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
});
