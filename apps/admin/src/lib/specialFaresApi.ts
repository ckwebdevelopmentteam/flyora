import { apiClient } from "./apiClient";
import type {
  BulkSpecialFareResult,
  SpecialFareAdminDetail,
  SpecialFareSearchQuery,
} from "@flyora/types";
import type {
  CreateSpecialFareInput,
  UpdateSpecialFareInput,
  UpdateSpecialFareSeatsInput,
} from "@flyora/validators";

export interface AdminSpecialFaresResponse {
  items: SpecialFareAdminDetail[];
  total: number;
}

export const specialFaresApi = {
  /**
   * Fetch all special fare allotments for staff dashboard (with costs & margins)
   */
  async listAdminSpecialFares(
    params: SpecialFareSearchQuery = {},
  ): Promise<AdminSpecialFaresResponse> {
    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.status) query.set("status", params.status);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    const endpoint = `/admin/special-fares${qs ? `?${qs}` : ""}`;
    return apiClient.get<AdminSpecialFaresResponse>(endpoint);
  },

  /**
   * Fetch single allotment details
   */
  async getSpecialFareById(id: string): Promise<SpecialFareAdminDetail> {
    return apiClient.get<SpecialFareAdminDetail>(
      `/admin/special-fares/${encodeURIComponent(id)}`,
    );
  },

  /**
   * Create a new special fare allotment
   */
  async createSpecialFare(
    payload: CreateSpecialFareInput,
  ): Promise<SpecialFareAdminDetail> {
    return apiClient.post<SpecialFareAdminDetail>(
      "/admin/special-fares",
      payload,
    );
  },

  /**
   * Bulk create special fare allotments (Date-Range Series or CSV/Excel sheet upload)
   */
  async bulkCreateSpecialFares(
    items: CreateSpecialFareInput[],
  ): Promise<BulkSpecialFareResult> {
    return apiClient.post<BulkSpecialFareResult>("/admin/special-fares/bulk", {
      items,
    });
  },

  /**
   * Update an existing allotment
   */
  async updateSpecialFare(
    id: string,
    payload: UpdateSpecialFareInput,
  ): Promise<SpecialFareAdminDetail> {
    return apiClient.put<SpecialFareAdminDetail>(
      `/admin/special-fares/${encodeURIComponent(id)}`,
      payload,
    );
  },

  /**
   * 1-Click seat adjustment (-1, +1, or exact seat count)
   */
  async updateSeats(
    id: string,
    payload: UpdateSpecialFareSeatsInput,
  ): Promise<{ id: string; availableSeats: number; status: string }> {
    return apiClient.patch<{
      id: string;
      availableSeats: number;
      status: string;
    }>(`/admin/special-fares/${encodeURIComponent(id)}/seats`, payload);
  },

  /**
   * Toggle visibility on/off immediately
   */
  async toggleStatus(id: string): Promise<{ id: string; isActive: boolean }> {
    return apiClient.patch<{ id: string; isActive: boolean }>(
      `/admin/special-fares/${encodeURIComponent(id)}/toggle`,
    );
  },

  /**
   * Delete allotment (Super Admin only)
   */
  async deleteSpecialFare(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(
      `/admin/special-fares/${encodeURIComponent(id)}`,
    );
  },
};
