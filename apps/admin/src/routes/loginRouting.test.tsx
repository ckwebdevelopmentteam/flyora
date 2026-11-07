// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { Outlet } from "react-router-dom";
import App from "../App";
import { loginDestination } from "./GuestRoute";
import { useAuthStore } from "../stores/authStore";
vi.mock("../lib/apiClient", () => ({
  initializeAuth: vi.fn(),
  apiClient: { get: vi.fn() },
}));
vi.mock("../pages/LoginPage", () => ({ LoginPage: () => <h1>Login form</h1> }));
vi.mock("../pages/DashboardPage", () => ({
  DashboardPage: () => <h1>Dashboard</h1>,
}));
vi.mock("../components/layout/AdminLayout", () => ({
  AdminLayout: () => <Outlet />,
}));
beforeEach(() => {
  window.history.replaceState(null, "", "/login");
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    sessionUnavailable: false,
  });
});
afterEach(cleanup);
it("redirects an authenticated visitor away from login", async () => {
  useAuthStore.setState({ isAuthenticated: true });
  render(<App />);
  expect(
    await screen.findByRole("heading", { name: "Dashboard" }),
  ).toBeTruthy();
  expect(window.location.pathname).toBe("/");
  expect(screen.queryByText("Login form")).toBeNull();
});
it("renders login for a visitor with no session", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "Login form" })).toBeTruthy();
  expect(window.location.pathname).toBe("/login");
});
it("waits for session restoration before redirecting, without flashing login", async () => {
  useAuthStore.setState({ isLoading: true });
  render(<App />);
  expect(screen.getByRole("status").textContent).toContain(
    "Checking your session",
  );
  expect(screen.queryByText("Login form")).toBeNull();
  expect(window.location.pathname).toBe("/login");
  act(() => useAuthStore.setState({ isLoading: false, isAuthenticated: true }));
  await screen.findByRole("heading", { name: "Dashboard" });
  expect(window.location.pathname).toBe("/");
  expect(screen.queryByText("Login form")).toBeNull();
});
it("shows verification failure instead of misclassifying the visitor as signed out", () => {
  useAuthStore.setState({ sessionUnavailable: true });
  render(<App />);
  expect(screen.getByRole("alert").textContent).toContain(
    "temporarily unavailable",
  );
  expect(screen.queryByText("Login form")).toBeNull();
  expect(window.location.pathname).toBe("/login");
});
it("returns to login when the active session is cleared", async () => {
  useAuthStore.setState({ isAuthenticated: true });
  render(<App />);
  await screen.findByRole("heading", { name: "Dashboard" });
  act(() => useAuthStore.getState().clearAuth());
  await screen.findByRole("heading", { name: "Login form" });
  expect(window.location.pathname).toBe("/login");
});
it("restores the login page after initialization confirms there is no session", async () => {
  useAuthStore.setState({ isLoading: true });
  render(<App />);
  act(() => useAuthStore.getState().clearAuth());
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "Login form" })).toBeTruthy(),
  );
  expect(window.location.pathname).toBe("/login");
});

it("preserves a protected-page return path and rejects login loops or external destinations", () => {
  expect(loginDestination({ from: { pathname: "/admin/leads" } })).toBe(
    "/admin/leads",
  );
  for (const pathname of [
    "/login",
    "/login?redirect=/login",
    "//example.test",
    "https://example.test",
    12,
  ])
    expect(loginDestination({ from: { pathname } })).toBe("/");
  expect(loginDestination(null)).toBe("/");
});
