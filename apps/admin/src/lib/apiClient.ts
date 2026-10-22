import { useAuthStore } from "../stores/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export interface ApiResponse<T = any> {
  statusCode: number;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  statusCode: number;
  error?: string;

  constructor(message: string, statusCode: number = 500, error?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.error = error;
  }
}

interface RequestOptions extends RequestInit {
  _retry?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers);

  // Set default Content-Type if not FormData
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Attach access token
  const token = useAuthStore.getState().accessToken;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized with token refresh
  if (
    response.status === 401 &&
    !options._retry &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh")
  ) {
    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      useAuthStore.getState().clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new ApiError("Session expired. Please log in again.", 401);
    }

    if (isRefreshing) {
      // Wait for ongoing refresh
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh((newToken: string) => {
          headers.set("Authorization", `Bearer ${newToken}`);
          request<T>(endpoint, { ...options, headers, _retry: true })
            .then(resolve)
            .catch(reject);
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const refreshJson = (await refreshRes.json()) as ApiResponse<{
        accessToken: string;
      }>;

      if (!refreshRes.ok || !refreshJson.data?.accessToken) {
        throw new Error(refreshJson.message || "Token refresh failed");
      }

      const newAccessToken = refreshJson.data.accessToken;
      useAuthStore.getState().setTokens(newAccessToken);
      onRefreshed(newAccessToken);

      // Retry original request with new token
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      return await request<T>(endpoint, { ...options, headers, _retry: true });
    } catch (refreshErr) {
      useAuthStore.getState().clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new ApiError("Session expired. Please log in again.", 401);
    } finally {
      isRefreshing = false;
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || "An error occurred with the request",
      response.status,
      data.error,
    );
  }

  // Fastify returns { statusCode, data } - extract data if present
  return (data.data !== undefined ? data.data : data) as T;
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
