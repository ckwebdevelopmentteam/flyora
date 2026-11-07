// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { UserRole } from "@flyora/types";
import { useAuthStore } from "../../stores/authStore";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
function show(role: UserRole) {
  useAuthStore.setState({
    user: {
      id: "staff-1",
      fullName: "Test Staff",
      email: "staff@example.test",
      role,
      availability: "AVAILABLE",
      isActive: true,
      services: [],
      createdAt: "2026-10-26",
      updatedAt: "2026-10-26",
    },
  });
  render(
    <MemoryRouter>
      <Sidebar
        isOpen={false}
        onClose={vi.fn()}
        collapsed={false}
        onToggleCollapse={vi.fn()}
      />
      <Header />
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null });
});
it("keeps Content Managers focused on packages", () => {
  show("CONTENT_MANAGER");
  expect(screen.getByRole("link", { name: "Tour packages" })).toBeTruthy();
  expect(
    screen.queryByRole("link", { name: "Bookings & payments" }),
  ).toBeNull();
  expect(screen.queryByRole("link", { name: "My enquiries" })).toBeNull();
  expect(screen.queryByRole("button", { name: /Availability:/ })).toBeNull();
});
it("keeps Accounts focused on bookings and payments", () => {
  show("ACCOUNTS");
  expect(
    screen.getByRole("link", { name: "Bookings & payments" }),
  ).toBeTruthy();
  expect(screen.queryByRole("link", { name: "Tour packages" })).toBeNull();
  expect(
    screen.queryByRole("link", { name: "Available enquiries" }),
  ).toBeNull();
  expect(screen.queryByRole("link", { name: "Team" })).toBeNull();
});
it("gives Coordinators their sales workspace and availability control", () => {
  show("SERVICE_COORDINATOR");
  expect(screen.getAllByRole("link", { name: "Enquiries" })).toHaveLength(1);
  expect(
    screen.queryByRole("link", { name: "Available enquiries" }),
  ).toBeNull();
  expect(
    screen.getByRole("button", { name: "Availability: Available" }),
  ).toBeTruthy();
  expect(screen.queryByRole("link", { name: "All enquiries" })).toBeNull();
  expect(screen.queryByRole("link", { name: "Team" })).toBeNull();
});
it.each(["SUPER_ADMIN", "OPERATIONS_MANAGER"] as const)(
  "gives %s team oversight",
  (role) => {
    show(role);
    expect(screen.getAllByRole("link", { name: "Enquiries" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Team" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Bookings & payments" }),
    ).toBeTruthy();
  },
);
