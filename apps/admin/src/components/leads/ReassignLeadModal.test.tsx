// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReassignLeadModal } from "./ReassignLeadModal";
import { apiClient } from "../../lib/apiClient";
import { leadsApi } from "../../lib/leadsApi";
import type { LeadItem, UserProfile } from "@flyora/types";
vi.mock("../../lib/apiClient", () => ({ apiClient: { get: vi.fn() } }));
vi.mock("../../lib/leadsApi", () => ({ leadsApi: { reassignLead: vi.fn() } }));
const lead: LeadItem = {
  id: "lead1",
  customerId: "c1",
  customer: { id: "c1", fullName: "Ahmed", phone: "9876543210" },
  serviceId: "s1",
  serviceName: "Holidays",
  status: "NEW",
  source: "WEBSITE_FORM",
  numberOfAdults: 1,
  numberOfKids: 0,
  createdAt: "",
  updatedAt: "",
};
const user: UserProfile = {
  id: "u1",
  fullName: "Eligible",
  email: "a@example.test",
  isActive: true,
  role: "SERVICE_COORDINATOR",
  availability: "AVAILABLE",
  createdAt: "",
  updatedAt: "",
  services: [{ id: "mapping", userId: "u1", serviceId: "s1", isPrimary: true }],
};
beforeEach(() => {
  vi.resetAllMocks();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(cleanup);
function setup() {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <ReassignLeadModal
        lead={lead}
        isOpen
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </QueryClientProvider>,
  );
  return { onClose, onSuccess };
}
it("loads service-mapped coordinators and blocks duplicate writes", async () => {
  vi.mocked(apiClient.get).mockResolvedValue([
    user,
    { ...user, id: "u2", fullName: "Other service", services: [] },
  ]);
  let resolve!: (value: unknown) => void;
  vi.mocked(leadsApi.reassignLead).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done as (value: unknown) => void;
      }),
  );
  const { onSuccess } = setup();
  await screen.findByRole("option", { name: /Eligible/ });
  expect(screen.queryByRole("option", { name: /Other service/ })).toBeNull();
  fireEvent.change(screen.getByLabelText("Assign To New Coordinator *"), {
    target: { value: "u1" },
  });
  const button = screen.getByRole("button", { name: "Confirm Transfer" });
  fireEvent.submit(button.closest("form")!);
  fireEvent.submit(button.closest("form")!);
  await waitFor(() =>
    expect(leadsApi.reassignLead).toHaveBeenCalledExactlyOnceWith(
      "lead1",
      "u1",
    ),
  );
  expect(screen.getByRole("button", { name: "Cancel" })).toHaveProperty(
    "disabled",
    true,
  );
  resolve({});
  await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
});
it("does not close or show success when reassignment fails", async () => {
  vi.mocked(apiClient.get).mockResolvedValue([user]);
  vi.mocked(leadsApi.reassignLead).mockRejectedValue(
    new Error("Transfer failed"),
  );
  const { onClose, onSuccess } = setup();
  await screen.findByRole("option", { name: /Eligible/ });
  fireEvent.change(screen.getByLabelText("Assign To New Coordinator *"), {
    target: { value: "u1" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Confirm Transfer" }).closest("form")!,
  );
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    "Transfer failed",
  );
  expect(onClose).not.toHaveBeenCalled();
  expect(onSuccess).not.toHaveBeenCalled();
});
it("shows a retryable user loading error without eligible options", async () => {
  vi.mocked(apiClient.get).mockRejectedValue(new Error("Offline"));
  setup();
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    expect.stringContaining("Could not load coordinators"),
  );
  expect(
    screen.getByRole("button", { name: "Confirm Transfer" }),
  ).toHaveProperty("disabled", true);
  vi.mocked(apiClient.get).mockResolvedValue([user]);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByRole("option", { name: /Eligible/ })).toBeTruthy();
});
