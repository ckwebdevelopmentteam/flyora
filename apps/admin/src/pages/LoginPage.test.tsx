// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { login } from "../lib/apiClient";
vi.mock("../lib/apiClient", () => ({ login: vi.fn() }));
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);
it("uses labels, password manager autocomplete and a show-password control", () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  expect(
    screen.getByLabelText("Email address").getAttribute("autocomplete"),
  ).toBe("username");
  const password = screen.getByLabelText("Password", { exact: true });
  expect(password.getAttribute("autocomplete")).toBe("current-password");
  fireEvent.click(screen.getByRole("button", { name: "Show password" }));
  expect(password.getAttribute("type")).toBe("text");
});
it("shows a safe error for rejected credentials without exposing server details", async () => {
  vi.mocked(login).mockRejectedValue(
    Object.assign(new Error("PRIVATE_AUTH_TRACE"), { statusCode: 401 }),
  );
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: "staff@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), {
    target: { value: "a-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toContain("Check your email and password");
  expect(alert.textContent).not.toContain("PRIVATE_AUTH_TRACE");
});
