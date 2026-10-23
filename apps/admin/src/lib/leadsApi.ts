import { apiClient, ApiError } from "./apiClient";
import type {
  LeadDetailItem,
  LeadItem,
  LeadActivityItem,
  LeadStatus,
} from "@flyora/types";
import type { LeadFilterInput } from "@flyora/validators";
import { mockLeadStore } from "../pages/leads/mockLeadsData";
import { useAuthStore } from "../stores/authStore";

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
   * Fetch unassigned leads in the coordinator's service pool
   */
  async fetchPoolLeads(serviceId?: string): Promise<LeadItem[]> {
    try {
      const query = serviceId
        ? `?serviceId=${encodeURIComponent(serviceId)}`
        : "";
      const res = await apiClient.get<LeadItem[]>(`/leads/pool${query}`);
      return Array.isArray(res) ? res : mockLeadStore.getPoolLeads(serviceId);
    } catch {
      // Graceful fallback to mock store while backend is developing
      return mockLeadStore.getPoolLeads(serviceId);
    }
  },

  /**
   * Fetch leads claimed by current coordinator with optional stage & text filters
   */
  async fetchMyLeads(params?: MyLeadsFilterParams): Promise<LeadItem[]> {
    try {
      const q = new URLSearchParams();
      if (params?.status && params.status !== "ALL")
        q.set("status", params.status);
      if (params?.search) q.set("search", params.search);
      const qs = q.toString();
      const res = await apiClient.get<LeadItem[]>(
        `/leads/my-leads${qs ? `?${qs}` : ""}`,
      );
      return Array.isArray(res)
        ? res
        : mockLeadStore.getMyLeads(params?.status, params?.search);
    } catch {
      // Graceful fallback to mock store while backend is developing
      return mockLeadStore.getMyLeads(params?.status, params?.search);
    }
  },

  /**
   * Atomically claim an unassigned lead from the service pool
   * Handles 409 Conflict if claimed by another coordinator
   */
  async takeLead(
    leadId: string,
  ): Promise<{ success: boolean; lead: LeadItem }> {
    const currentUser = useAuthStore.getState().user || {
      id: "coordinator-current",
      fullName: "Coordinator",
    };

    try {
      const res = await apiClient.post<{ success: boolean; lead: LeadItem }>(
        `/leads/${encodeURIComponent(leadId)}/take`,
      );
      return res;
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 409) {
        throw new ApiError(
          "This lead has already been claimed by another coordinator.",
          409,
        );
      }
      // Fallback to mock store
      const mockResult = mockLeadStore.claimLead(leadId, currentUser);
      if (!mockResult.success) {
        throw new ApiError(
          mockResult.error ||
            "This lead has already been claimed by another coordinator.",
          409,
        );
      }
      return { success: true, lead: mockResult.lead! };
    }
  },

  /**
   * Update the status stage of a claimed lead
   */
  async updateLeadStatus(
    leadId: string,
    status: LeadStatus,
  ): Promise<LeadItem> {
    const currentUser = useAuthStore.getState().user || {
      id: "coordinator-current",
      fullName: "Coordinator",
    };

    try {
      const res = await apiClient.patch<LeadItem>(
        `/leads/${encodeURIComponent(leadId)}/status`,
        { status },
      );
      return res;
    } catch {
      return mockLeadStore.updateLeadStatus(leadId, status, currentUser);
    }
  },

  /**
   * Append an internal note and optionally update the scheduled follow-up date
   */
  async addLeadNote(
    leadId: string,
    note: string,
    followUpDate?: string,
  ): Promise<LeadActivityItem> {
    const currentUser = useAuthStore.getState().user || {
      id: "coordinator-current",
      fullName: "Coordinator",
    };

    try {
      const res = await apiClient.post<LeadActivityItem>(
        `/leads/${encodeURIComponent(leadId)}/notes`,
        { note, followUpDate },
      );
      return res;
    } catch {
      return mockLeadStore.addLeadNote(leadId, note, followUpDate, currentUser);
    }
  },

  /**
   * Retrieve chronological activity timeline for a lead
   */
  async fetchLeadActivities(leadId: string): Promise<LeadActivityItem[]> {
    try {
      const res = await apiClient.get<LeadActivityItem[]>(
        `/leads/${encodeURIComponent(leadId)}/activities`,
      );
      return Array.isArray(res) ? res : mockLeadStore.getLeadActivities(leadId);
    } catch {
      return mockLeadStore.getLeadActivities(leadId);
    }
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
