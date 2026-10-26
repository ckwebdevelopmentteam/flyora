// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { UserRole } from "@flyora/types";
import { useAuthStore } from "../../stores/authStore";
import { EnquiryNavigation } from "./EnquiryNavigation";
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
      <EnquiryNavigation />
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null });
});
it("keeps all enquiry views under one consistent navigation for managers", () => {
  show("SUPER_ADMIN", "/admin/leads");
  const nav = screen.getByRole("navigation", { name: "Enquiry views" });
  expect(within(nav).getAllByRole("link")).toHaveLength(3);
  expect(
    within(nav).getByRole("link", { name: "All" }).getAttribute("aria-current"),
  ).toBe("page");
  fireEvent.click(within(nav).getByRole("link", { name: "Mine" }));
  expect(
    within(nav)
      .getByRole("link", { name: "Mine" })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(
    within(nav).getByRole("link", { name: "All" }).getAttribute("aria-current"),
  ).toBeNull();
  fireEvent.click(within(nav).getByRole("link", { name: "Available" }));
  expect(
    within(nav)
      .getByRole("link", { name: "Available" })
      .getAttribute("aria-current"),
  ).toBe("page");
});
it("offers only personal and available enquiries to coordinators and preserves deep links", () => {
  show("SERVICE_COORDINATOR", "/leads?tab=pool");
  expect(screen.queryByRole("link", { name: "All" })).toBeNull();
  expect(
    screen
      .getByRole("link", { name: "Available" })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(screen.getByRole("link", { name: "Mine" }).getAttribute("href")).toBe(
    "/leads?tab=my-leads",
  );
});
