import { apiClient } from "./apiClient";
import type {
  LeadDetailItem,
  LeadItem,
  LeadActivityItem,
  LeadStatus,
} from "@flyora/types";
import type { CreateLeadInput, LeadFilterInput } from "@flyora/validators";

export interface MyLeadsFilterParams {
  status?: string;
  search?: string;
}

export interface MasterLeadsData {
  leads: LeadItem[];
  total: number;
  page: number;
  limit: number;
}

export const leadsApi = {
  // =========================================================================
  // Developer 2: Coordinator Leads Workspace & Service Pool Actions
  // =========================================================================

  /**
   * Create a new lead manually (auto-assigned to the current staff member)
   */
  async createLead(payload: CreateLeadInput): Promise<LeadItem> {
    return apiClient.post<LeadItem>("/leads", payload);
  },

  /**
   * Fetch unassigned leads in the coordinator's service pool
   */
  async fetchPoolLeads(serviceId?: string): Promise<LeadItem[]> {
    const query = serviceId
      ? `?serviceId=${encodeURIComponent(serviceId)}`
      : "";
    const result = await apiClient.get<LeadItem[]>(`/leads/pool${query}`);
    if (!Array.isArray(result))
      throw new Error("We couldn't load the enquiries. Please try again.");
    return serviceId
      ? result.filter((lead) => lead.serviceId === serviceId)
      : result;
  },
  async fetchServiceEnquiries(serviceId?: string): Promise<LeadItem[]> {
    const result = await apiClient.get<LeadItem[]>(
      "/leads/pool?includeAssigned=true",
    );
    if (!Array.isArray(result))
      throw new Error("We couldn't load the enquiries.");
    return result
      .filter((lead) => !serviceId || lead.serviceId === serviceId)
      .sort(
        (a, b) =>
          Number(!!a.assignedToId) - Number(!!b.assignedToId) ||
          Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
  },
  async fetchMyLeads(params?: MyLeadsFilterParams): Promise<LeadItem[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "ALL")
      query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const result = await apiClient.get<LeadItem[]>(
      `/leads/my-leads${query.size ? `?${query}` : ""}`,
    );
    if (!Array.isArray(result))
      throw new Error("We couldn't load the enquiries. Please try again.");
    return result;
  },
  async takeLead(
    leadId: string,
  ): Promise<{ success: boolean; lead: LeadItem }> {
    const result = await apiClient.post<{ success: boolean; lead: LeadItem }>(
      `/leads/${encodeURIComponent(leadId)}/take`,
    );
    if (!result?.success || !result.lead?.id)
      throw new Error(
        "The enquiry wasn't assigned. Refresh the list and try again.",
      );
    return result;
  },
  async updateLeadStatus(
    leadId: string,
    status: LeadStatus,
  ): Promise<LeadItem> {
    return apiClient.patch<LeadItem>(
      `/leads/${encodeURIComponent(leadId)}/status`,
      { status },
    );
  },
  async addLeadNote(
    leadId: string,
    note: string,
    followUpDate?: string,
  ): Promise<LeadDetailItem> {
    return apiClient.post<LeadDetailItem>(
      `/leads/${encodeURIComponent(leadId)}/notes`,
      { note, followUpDate },
    );
  },
  async fetchLeadActivities(leadId: string): Promise<LeadActivityItem[]> {
    const result = await apiClient.get<LeadDetailItem>(
      `/leads/${encodeURIComponent(leadId)}`,
    );
    if (!Array.isArray(result?.activities))
      throw new Error("We couldn't load the activity. Please try again.");
    return result.activities;
  },

  // =========================================================================
  // Developer 3: Admin Master Lead Center & Reassignment Actions
  // =========================================================================

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
