import type { LeadItem, UserProfile } from "@flyora/types";
import type { LeadFilterInput } from "@flyora/validators";
import { apiClient } from "../../lib/apiClient";
import type { MasterLeadsData } from "../../lib/leadsApi";

export function eligibleCoordinators(
  users: UserProfile[],
  lead: LeadItem,
): UserProfile[] {
  return users.filter(
    (user) =>
      user.isActive &&
      user.role === "SERVICE_COORDINATOR" &&
      user.id !== lead.assignedToId &&
      user.services?.some((mapping) => mapping.serviceId === lead.serviceId),
  );
}

export function filterCreatedDates(
  leads: LeadItem[],
  from: string,
  to: string,
): LeadItem[] {
  // Match the local calendar date displayed in the table, including both endpoints.
  return leads.filter((lead) => {
    const date = new Date(lead.createdAt);
    const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return (
      Number.isFinite(date.getTime()) &&
      (!from || day >= from) &&
      (!to || day <= to)
    );
  });
}

export async function loadMasterLeads(
  params: Partial<LeadFilterInput>,
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<MasterLeadsData> {
  if (from && to && from > to)
    throw new Error("Created from must be on or before Created to.");
  const getPage = (page: number, limit: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...params, page, limit }))
      if (value !== undefined && value !== "") query.set(key, String(value));
    return apiClient.get<MasterLeadsData>(`/leads/all?${query}`, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(30000)])
        : AbortSignal.timeout(30000),
    });
  };
  if (!from && !to) return getPage(params.page || 1, params.limit || 15);
  // The current API has no date filter. Read all matching pages before filtering,
  // never just the displayed page. A failed page fails the whole query.
  const first = await getPage(1, 100);
  if (first.total > 10000)
    throw new Error(
      "Narrow the service, coordinator, status or search filters before applying a date range.",
    );
  const unique = new Map(first.leads.map((lead) => [lead.id, lead]));
  for (let page = 2; page <= Math.ceil(first.total / 100); page++) {
    const result = await getPage(page, 100);
    if (result.total !== first.total)
      throw new Error(
        "Leads changed while loading. Refresh to apply the date range again.",
      );
    result.leads.forEach((lead) => unique.set(lead.id, lead));
  }
  if (unique.size !== first.total)
    throw new Error("Leads changed while loading. Please refresh.");
  const filtered = filterCreatedDates([...unique.values()], from, to);
  const page = params.page || 1;
  const limit = params.limit || 15;
  return {
    leads: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
    page,
    limit,
  };
}
