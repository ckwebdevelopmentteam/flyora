import { apiClient } from "./apiClient";
import type { LeadDetailItem, LeadItem } from "@flyora/types";
import type { LeadFilterInput } from "@flyora/validators";

export interface MasterLeadsData {
  leads: LeadItem[];
  total: number;
  page: number;
  limit: number;
}

export const leadsApi = {
  /**
   * Fetch all leads across all services (Admin Master Lead Control Center)
   */
  async getAllLeads(
    params: Partial<LeadFilterInput> = {},
  ): Promise<MasterLeadsData> {
    const query = new URLSearchParams();

    if (params.serviceId) query.set("serviceId", params.serviceId);
    if (params.status) query.set("status", params.status);
    if (params.assignedToId) query.set("assignedToId", params.assignedToId);
    if (params.unassignedOnly)
      query.set("unassignedOnly", params.unassignedOnly);
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    const endpoint = `/leads/all${qs ? `?${qs}` : ""}`;
    const response = await apiClient.get<MasterLeadsData>(endpoint);
    return response;
  },

  /**
   * Fetch single lead with full audit activity history
   */
  async getLeadById(leadId: string): Promise<LeadDetailItem> {
    const response = await apiClient.get<LeadDetailItem>(`/leads/${leadId}`);
    return response;
  },

  /**
   * Reassign a lead to another coordinator (Admin only)
   */
  async reassignLead(
    leadId: string,
    assignedToId: string,
  ): Promise<LeadDetailItem> {
    const response = await apiClient.patch<LeadDetailItem>(
      `/leads/${leadId}/reassign`,
      { assignedToId },
    );
    return response;
  },
};
