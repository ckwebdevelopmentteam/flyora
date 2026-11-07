// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leadsApi } from "./leadsApi";
import {
  quotesApi,
  type CreateQuotationPayload,
} from "../pages/quotes/quotesApi";

const client = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("./apiClient", () => ({ apiClient: client }));

const payload: CreateQuotationPayload = {
  leadId: "lead-1",
  validUntil: "2030-01-01",
  inclusions: [],
  exclusions: [],
  items: [
    {
      id: "item-1",
      type: "HOTEL",
      title: "Hotel",
      description: "Room",
      quantity: 2,
      supplierCost: 1000,
      sellingPrice: 1200,
    },
  ],
};
const failures: Array<[string, keyof typeof client, () => Promise<unknown>]> = [
  ["available enquiries", "get", () => leadsApi.fetchPoolLeads()],
  ["all service enquiries", "get", () => leadsApi.fetchServiceEnquiries()],
  ["my enquiries", "get", () => leadsApi.fetchMyLeads()],
  ["activity history", "get", () => leadsApi.fetchLeadActivities("lead-1")],
  ["claiming an enquiry", "post", () => leadsApi.takeLead("lead-1")],
  [
    "changing a stage",
    "patch",
    () => leadsApi.updateLeadStatus("lead-1", "CONTACTED"),
  ],
  [
    "saving a note",
    "post",
    () => leadsApi.addLeadNote("lead-1", "Call tomorrow"),
  ],
  [
    "loading quotations",
    "get",
    () => quotesApi.fetchQuotationsForLead("lead-1"),
  ],
  ["creating a quotation", "post", () => quotesApi.createQuotation(payload)],
  [
    "changing a quotation status",
    "patch",
    () => quotesApi.updateQuoteStatus("quote-1", "SENT"),
  ],
];

describe("Failed staff requests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });
  it.each(failures)(
    "never substitutes demo data or local success when %s fails",
    async (_, method, request) => {
      const cached = JSON.stringify([{ id: "old-demo", leadId: "lead-1" }]);
      localStorage.setItem("flyora_admin_quotes_v1", cached);
      const error = new Error("Connection unavailable");
      client[method].mockRejectedValueOnce(error);
      await expect(request()).rejects.toBe(error);
      expect(localStorage.getItem("flyora_admin_quotes_v1")).toBe(cached);
    },
  );
  it("rejects an incomplete quotation response instead of inventing a share link", async () => {
    client.post.mockResolvedValue({
      id: "quote-1",
      quoteNumber: "FLY-2030-0001",
    });
    await expect(quotesApi.createQuotation(payload)).rejects.toThrow();
  });
  it("rejects an invalid enquiry list instead of showing demo customers", async () => {
    client.get.mockResolvedValue({ unexpected: true });
    await expect(leadsApi.fetchPoolLeads()).rejects.toThrow();
    await expect(leadsApi.fetchMyLeads()).rejects.toThrow();
  });
});

it("shows only the selected service even if the pool API returns several services", async () => {
  client.get.mockResolvedValue([
    { id: "hotel-lead", serviceId: "hotel" },
    { id: "flight-lead", serviceId: "flight" },
  ]);
  expect(await leadsApi.fetchPoolLeads("flight")).toEqual([
    { id: "flight-lead", serviceId: "flight" },
  ]);
});

it("loads activity from the existing lead-detail endpoint", async () => {
  const activities = [
    { id: "note-1", action: "NOTE_ADDED", details: "Call tomorrow" },
  ];
  client.get.mockResolvedValue({ id: "lead-1", activities });
  expect(await leadsApi.fetchLeadActivities("lead-1")).toEqual(activities);
  expect(client.get).toHaveBeenLastCalledWith("/leads/lead-1");
});

it("lists unassigned service enquiries newest first, with taken enquiries below", async () => {
  client.get.mockResolvedValue([
    {
      id: "taken",
      serviceId: "visa",
      assignedToId: "other",
      createdAt: "2026-10-28",
    },
    {
      id: "older",
      serviceId: "visa",
      assignedToId: null,
      createdAt: "2026-10-26",
    },
    {
      id: "newest",
      serviceId: "visa",
      assignedToId: null,
      createdAt: "2026-10-27",
    },
    {
      id: "different-service",
      serviceId: "hotel",
      assignedToId: null,
      createdAt: "2026-10-28",
    },
  ]);
  expect(
    (await leadsApi.fetchServiceEnquiries("visa")).map((lead) => lead.id),
  ).toEqual(["newest", "older", "taken"]);
});
