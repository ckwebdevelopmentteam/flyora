import { useAuthStore } from "../stores/authStore";
import type { AuthSession } from "@flyora/types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const OPERATION_KEY = "flyora_refresh_operation_v1";
const LOCK_NAME = "flyora_auth_v1";
export interface ApiResponse<T = unknown> {
  statusCode: number;
  data?: T;
  message?: string;
  error?: string;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public error?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
interface RequestOptions extends RequestInit {
  _retry?: boolean;
}
let refreshPromise: Promise<string> | null = null;
let initializePromise: Promise<void> | null = null;
const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("flyora_auth_events")
    : null;
channel?.addEventListener("message", (event) => {
  if (event.data === "logout" || event.data === "login") {
    const pending = initializePromise ?? refreshPromise;
    useAuthStore.getState().clearAuth();
    if (event.data === "login") {
      useAuthStore.setState({ isLoading: true });
      // Wait for an older generation's refresh to settle before restoring the
      // new account; otherwise initialization can join a superseded promise.
      void Promise.resolve(pending)
        .catch(() => {})
        .then(() => initializeAuth());
    }
  }
});
async function locked<T>(work: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks)
    return navigator.locks.request(LOCK_NAME, work);
  return work();
}
async function authRequest<T>(
  endpoint: string,
  body?: unknown,
  headers?: HeadersInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body ?? {}),
      signal: AbortSignal.timeout(endpoint === "refresh" ? 20_000 : 15_000),
    });
  } catch {
    throw new ApiError(
      "Authentication is temporarily unavailable. Please try again.",
      503,
    );
  }
  const json = await response.json().catch(() => {
    if (response.ok)
      throw new ApiError(
        "Authentication response was interrupted. Please try again.",
        503,
      );
    return {};
  });
  if (!response.ok)
    throw new ApiError(
      json.message || "Authentication failed",
      response.status,
    );
  return json.data as T;
}
function clearOperation() {
  try {
    localStorage.removeItem(OPERATION_KEY);
  } catch {
    /* no storage */
  }
}
function operationId() {
  try {
    const pending = localStorage.getItem(OPERATION_KEY);
    if (
      pending &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        pending,
      )
    )
      return pending;
    const id = crypto.randomUUID();
    localStorage.setItem(OPERATION_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
export function refreshSession(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  const generation = useAuthStore.getState().generation;
  refreshPromise = locked(async () => {
    if (generation !== useAuthStore.getState().generation)
      throw new ApiError("Session changed", 401);
    try {
      const operation = operationId();
      let session: AuthSession | undefined;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (generation !== useAuthStore.getState().generation)
          throw new ApiError("Session changed", 401);
        try {
          session = await authRequest<AuthSession>(
            "refresh",
            {},
            { "X-Refresh-Operation": operation },
          );
          if (!session?.accessToken || !session.user?.id)
            throw new ApiError(
              "Authentication response was incomplete. Please try again.",
              503,
            );
          break;
        } catch (error) {
          // One retry reuses the operation UUID so a committed rotation with a
          // lost response is recovered, rather than mistaken for token replay.
          if (
            attempt === 1 ||
            !(error instanceof ApiError) ||
            ![500, 502, 503, 504].includes(error.statusCode)
          )
            throw error;
        }
      }
      if (!session)
        throw new ApiError(
          "Authentication is temporarily unavailable. Please try again.",
          503,
        );
      clearOperation();
      if (generation !== useAuthStore.getState().generation)
        throw new ApiError("Session changed", 401);
      useAuthStore.getState().setAuth(session);
      return session.accessToken;
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.statusCode === 401 &&
        generation === useAuthStore.getState().generation
      ) {
        clearOperation();
        useAuthStore.getState().clearAuth();
      }
      throw error;
    }
  }).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}
export function initializeAuth(): Promise<void> {
  if (initializePromise) return initializePromise;
  useAuthStore.setState({ isLoading: true, sessionUnavailable: false });
  initializePromise = refreshSession()
    .then(
      () => {},
      (error) => {
        useAuthStore.setState({
          isLoading: false,
          sessionUnavailable:
            !(error instanceof ApiError) || error.statusCode !== 401,
        });
      },
    )
    .finally(() => {
      initializePromise = null;
    });
  return initializePromise;
}
export async function login(credentials: { email: string; password: string }) {
  useAuthStore.getState().clearAuth();
  return locked(async () => {
    const session = await authRequest<AuthSession>("login", credentials);
    clearOperation();
    useAuthStore.getState().setAuth(session);
    channel?.postMessage("login");
    return session;
  });
}
export async function logout() {
  await locked(async () => {
    await authRequest("logout");
    clearOperation();
    useAuthStore.getState().clearAuth();
    channel?.postMessage("logout");
  });
}
async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  // Credentials may only go to the configured API, never an arbitrary absolute URL.
  if (!endpoint.startsWith("/") || endpoint.startsWith("//"))
    throw new ApiError("Expected an API-relative path", 400);
  const headers = new Headers(options.headers);
  if (
    !(options.body instanceof FormData) &&
    options.body !== undefined &&
    !headers.has("Content-Type")
  )
    headers.set("Content-Type", "application/json");
  const token = useAuthStore.getState().accessToken;
  const generation = useAuthStore.getState().generation;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const { _retry, ...fetchOptions } = options;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
    signal: options.signal ?? AbortSignal.timeout(30_000),
  });
  if (response.status === 401 && !_retry && !endpoint.startsWith("/auth/")) {
    if (generation !== useAuthStore.getState().generation)
      throw new ApiError("Session changed", 401);
    // A delayed 401 for an older token need not rotate the newly refreshed one.
    if (token === useAuthStore.getState().accessToken) await refreshSession();
    if (generation !== useAuthStore.getState().generation)
      throw new ApiError("Session changed", 401);
    return request<T>(endpoint, { ...options, _retry: true });
  }
  const data = await response.json().catch(() => ({}));
  if (
    response.status === 401 &&
    _retry &&
    generation === useAuthStore.getState().generation
  )
    useAuthStore.getState().clearAuth();
  if (!response.ok)
    throw new ApiError(
      data.message || "An error occurred with the request",
      response.status,
      data.error,
    );
  if (generation !== useAuthStore.getState().generation)
    throw new ApiError("Session changed", 401);
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
