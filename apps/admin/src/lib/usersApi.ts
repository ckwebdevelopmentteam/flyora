import { apiClient } from "./apiClient";
import type { UserProfile } from "@flyora/types";
import type { UpdateProfileInput } from "@flyora/validators";

export const usersApi = {
  /**
   * Update authenticated user's personal profile (phone, avatarUrl)
   */
  async updateProfile(payload: UpdateProfileInput): Promise<UserProfile> {
    return apiClient.patch<UserProfile>("/users/profile", payload);
  },
};
