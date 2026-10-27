// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { UserRole } from "@flyora/types";
import { useAuthStore } from "../../stores/authStore";
import { Sidebar } from "./Sidebar";
function show(role: UserRole, path: string) {
  useAuthStore.setState({
    user: {
      id: "staff-1",
      fullName: "Test Staff",
      email: "staff@example.test",
      role,
      availability: "AVAILABLE",
      isActive: true,
      createdAt: "2026-10-26",
      updatedAt: "2026-10-26",
    },
  });
  render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar
        isOpen={true}
        collapsed={false}
        onClose={() => {}}
        onToggleCollapse={() => {}}
      />
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null });
});
it("gives admins oversight without a personal enquiry workspace", () => {
  show("SUPER_ADMIN", "/admin/leads");
  expect(
    screen.getByRole("link", { name: "Enquiries" }).getAttribute("href"),
  ).toBe("/admin/leads");
  expect(screen.queryByRole("link", { name: "Mine" })).toBeNull();
  expect(screen.queryByRole("link", { name: "All" })).toBeNull();
});
it("puts staff Mine and All in the sidebar with Mine selected by default", () => {
  show("SERVICE_COORDINATOR", "/leads");
  expect(
    screen.getByRole("link", { name: "Mine" }).getAttribute("aria-current"),
  ).toBe("page");
  fireEvent.click(screen.getByRole("link", { name: "All" }));
  expect(
    screen.getByRole("link", { name: "All" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(
    screen.getByRole("link", { name: "Mine" }).getAttribute("aria-current"),
  ).toBeNull();
  expect(screen.queryByRole("link", { name: "Tour packages" })).toBeNull();
});
