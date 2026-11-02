import { apiClient } from "./apiClient";
import type {
  PackageDetails,
  PaginatedPackages,
  ItineraryDay,
} from "@flyora/types";

export interface PackageFilterParams {
  serviceId?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
  includeUnpublished?: boolean;
}

export interface CreatePackagePayload {
  serviceId: string;
  title: string;
  slug?: string;
  durationDays: number;
  durationNights: number;
  destination: string;
  startingPrice: number;
  coverImageUrl: string;
  galleryImageUrls?: string[];
  overview: string;
  itinerary: ItineraryDay[];
  inclusions?: string[];
  exclusions?: string[];
  isFeatured?: boolean;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export type UpdatePackagePayload = Partial<CreatePackagePayload>;

export interface PresignedUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  fileKey: string;
  isMock: boolean;
}

export const packagesApi = {
  /**
   * Fetch paginated list of packages with optional filters
   */
  async listPackages(
    params: PackageFilterParams = {},
  ): Promise<PaginatedPackages> {
    const query = new URLSearchParams();

    if (params.serviceId) query.set("serviceId", params.serviceId);
    if (params.destination) query.set("destination", params.destination);
    if (params.minPrice !== undefined)
      query.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined)
      query.set("maxPrice", String(params.maxPrice));
    if (params.search) query.set("search", params.search);
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.featuredOnly !== undefined)
      query.set("featuredOnly", String(params.featuredOnly));
    if (params.includeUnpublished !== undefined)
      query.set("includeUnpublished", String(params.includeUnpublished));

    const qs = query.toString();
    const endpoint = `/packages${qs ? `?${qs}` : ""}`;
    return apiClient.get<PaginatedPackages>(endpoint);
  },

  /**
   * Fetch single package details by unique slug
   */
  async getPackageBySlug(slug: string): Promise<PackageDetails> {
    return apiClient.get<PackageDetails>(
      `/packages/${encodeURIComponent(slug)}`,
    );
  },

  /**
   * Create a new package (Super Admin / Content Manager)
   */
  async createPackage(payload: CreatePackagePayload): Promise<PackageDetails> {
    return apiClient.post<PackageDetails>("/packages", payload);
  },

  /**
   * Update an existing package by ID (Super Admin / Content Manager)
   */
  async updatePackage(
    id: string,
    payload: UpdatePackagePayload,
  ): Promise<PackageDetails> {
    return apiClient.put<PackageDetails>(
      `/packages/${encodeURIComponent(id)}`,
      payload,
    );
  },

  /**
   * Delete a package by ID (Super Admin only)
   */
  async deletePackage(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `/packages/${encodeURIComponent(id)}`,
    );
  },

  /**
   * Request Cloudflare R2 presigned PUT upload URL
   */
  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: "packages" | "destinations" | "avatars" = "packages",
  ): Promise<PresignedUploadResponse> {
    return apiClient.post<PresignedUploadResponse>("/storage/upload-url", {
      filename,
      contentType,
      folder,
    });
  },

  /**
   * Stream raw binary directly to Cloudflare R2 via presigned PUT
   */
  async directUploadToR2(
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.timeout = 120_000;
      xhr.ontimeout = () =>
        reject(new Error("Photo upload took too long. Please try again."));
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream",
      );

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve();
        } else {
          reject(
            new Error(`Direct storage upload failed with status ${xhr.status}`),
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during direct storage upload"));
      };

      xhr.send(file);
    });
  },
};
