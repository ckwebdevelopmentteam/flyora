import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LeadItem, UserProfile } from "@flyora/types";
import { apiClient } from "../../lib/apiClient";
import {
  eligibleCoordinators,
  filterCreatedDates,
  loadMasterLeads,
} from "./masterLeads";
vi.mock("../../lib/apiClient", () => ({ apiClient: { get: vi.fn() } }));
const lead = (id: string, createdAt = "2026-10-23T12:00:00"): LeadItem => ({
  id,
  serviceId: "s1",
  serviceName: "Holidays",
  customerId: "c1",
  customer: { id: "c1", fullName: "Test", phone: "9876543210" },
  status: "NEW",
  source: "WEBSITE_FORM",
  numberOfAdults: 1,
  numberOfKids: 0,
  createdAt,
  updatedAt: createdAt,
});
const user = (
  id: string,
  role: UserProfile["role"] = "SERVICE_COORDINATOR",
  serviceId = "s1",
  isActive = true,
): UserProfile => ({
  id,
  fullName: id,
  email: `${id}@example.test`,
  role,
  isActive,
  availability: "AVAILABLE",
  createdAt: "",
  updatedAt: "",
  services: [{ id, userId: id, serviceId, isPrimary: true }],
});
beforeEach(() => vi.resetAllMocks());
describe("master lead oversight", () => {
  it("only offers other active coordinators mapped to the lead service", () => {
    expect(
      eligibleCoordinators(
        [
          user("current"),
          user("eligible"),
          user("other", "SERVICE_COORDINATOR", "s2"),
          user("inactive", "SERVICE_COORDINATOR", "s1", false),
          user("admin", "SUPER_ADMIN"),
        ],
        { ...lead("1"), assignedToId: "current" },
      ).map((u) => u.id),
    ).toEqual(["eligible"]);
  });
  it("includes both local calendar endpoints and excludes invalid dates", () => {
    expect(
      filterCreatedDates(
        [
          lead("start", "2026-10-22T00:00:00"),
          lead("end", "2026-10-23T23:59:59"),
          lead("old", "2026-10-21T23:59:59"),
          lead("bad", "bad"),
        ],
        "2026-10-22",
        "2026-10-23",
      ).map((l) => l.id),
    ).toEqual(["start", "end"]);
  });
  it("passes server pagination and filters without a date range", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      leads: [],
      total: 0,
      page: 2,
      limit: 15,
    });
    const controller = new AbortController();
    await loadMasterLeads(
      { page: 2, limit: 15, search: "Ahmed" },
      "",
      "",
      controller.signal,
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      "/leads/all?page=2&limit=15&search=Ahmed",
      { signal: expect.any(AbortSignal) },
    );
    const requestSignal = vi.mocked(apiClient.get).mock.calls[0][1]?.signal;
    expect(requestSignal?.aborted).toBe(false);
    controller.abort();
    expect(requestSignal?.aborted).toBe(true);
  });
  it("date-filters all server pages before paginating", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        leads: Array.from({ length: 100 }, (_, i) =>
          lead(String(i), "2026-10-01T12:00:00"),
        ),
        total: 101,
      })
      .mockResolvedValueOnce({ leads: [lead("match")], total: 101 });
    const result = await loadMasterLeads(
      { page: 1, limit: 15 },
      "2026-10-23",
      "2026-10-23",
    );
    expect(result.leads.map((l) => l.id)).toEqual(["match"]);
    expect(result.total).toBe(1);
    expect(apiClient.get).toHaveBeenLastCalledWith(
      "/leads/all?page=2&limit=100",
      { signal: expect.any(AbortSignal) },
    );
  });
  it("rejects inverted ranges without a request", async () => {
    await expect(
      loadMasterLeads({}, "2026-10-24", "2026-10-23"),
    ).rejects.toThrow("Created from");
    expect(apiClient.get).not.toHaveBeenCalled();
  });
  it("never returns partial results when another page fails", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ leads: [lead("1")], total: 101 })
      .mockRejectedValueOnce(new Error("Offline"));
    await expect(loadMasterLeads({}, "2026-10-23", "")).rejects.toThrow(
      "Offline",
    );
  });
  it("asks for narrower filters before excessive date scanning", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ leads: [], total: 10001 });
    await expect(loadMasterLeads({}, "2026-10-23", "")).rejects.toThrow(
      "Narrow",
    );
  });
  it("detects changing results instead of claiming a complete date range", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ leads: [lead("1")], total: 101 })
      .mockResolvedValueOnce({ leads: [], total: 100 });
    await expect(loadMasterLeads({}, "2026-10-23", "")).rejects.toThrow(
      "changed",
    );
  });
});
