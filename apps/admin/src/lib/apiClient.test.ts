import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const profile = {
  id: "staff-1",
  email: "staff@example.test",
  fullName: "Staff",
  role: "SUPER_ADMIN" as const,
  isActive: true,
  availability: "AVAILABLE" as const,
  createdAt: "",
  updatedAt: "",
};
const session = (token = "access-new") => ({
  user: profile,
  accessToken: token,
  accessExpiresIn: 900,
});
const response = (data: unknown, status = 200) =>
  new Response(
    JSON.stringify({
      data,
      message: status >= 400 ? "Request failed" : undefined,
    }),
    { status, headers: { "Content-Type": "application/json" } },
  );
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
let receiveMessage: (event: { data: string }) => void;
let client: typeof import("./apiClient");
let store: (typeof import("../stores/authStore"))["useAuthStore"];
let storage: Map<string, string>;
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(async () => {
  vi.resetModules();
  storage = new Map([
    [
      "flyora_admin_auth",
      JSON.stringify({ accessToken: "legacy", refreshToken: "legacy-refresh" }),
    ],
  ]);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  vi.stubGlobal(
    "BroadcastChannel",
    class {
      addEventListener(_type: string, listener: typeof receiveMessage) {
        receiveMessage = listener;
      }
      postMessage() {}
    },
  );
  vi.stubGlobal("navigator", {});
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  client = await import("./apiClient");
  store = (await import("../stores/authStore")).useAuthStore;
});
afterEach(() => vi.unstubAllGlobals());
describe("browser auth lifecycle", () => {
  it("removes legacy persisted credentials and restores through an HttpOnly cookie", async () => {
    expect(storage.has("flyora_admin_auth")).toBe(false);
    expect(store.getState().isAuthenticated).toBe(false);
    fetchMock.mockResolvedValue(response(session()));
    await client.initializeAuth();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const options = fetchMock.mock.calls[0][1];
    expect(options.credentials).toBe("include");
    expect(options.body).toBe("{}");
    expect(options.headers["X-Refresh-Operation"]).toMatch(/^[0-9a-f-]{36}$/);
    expect(store.getState().accessToken).toBe("access-new");
    expect(storage.size).toBe(0);
  });
  it("deduplicates StrictMode initialization", async () => {
    fetchMock.mockResolvedValue(response(session()));
    await Promise.all([client.initializeAuth(), client.initializeAuth()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("a cross-tab account change waits for superseded initialization before restoring", async () => {
    const gate = deferred<Response>();
    fetchMock
      .mockReturnValueOnce(gate.promise)
      .mockResolvedValueOnce(response(session("other-account")));
    const first = client.initializeAuth();
    await Promise.resolve();
    receiveMessage({ data: "login" });
    gate.resolve(response(session("old-account")));
    await first;
    await vi.waitFor(() =>
      expect(store.getState().accessToken).toBe("other-account"),
    );
    expect(store.getState().isLoading).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("cross-tab logout clears an authenticated session", () => {
    store.getState().setAuth(session());
    receiveMessage({ data: "logout" });
    expect(store.getState().accessToken).toBeNull();
    expect(store.getState().isAuthenticated).toBe(false);
  });
  it("all concurrent failed refresh callers settle without hanging", async () => {
    fetchMock.mockResolvedValue(response(null, 401));
    const results = await Promise.allSettled([
      client.refreshSession(),
      client.refreshSession(),
      client.refreshSession(),
    ]);
    expect(results.every((result) => result.status === "rejected")).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(store.getState().isAuthenticated).toBe(false);
  });
  it("temporary failure retains the refresh operation for lost-response recovery", async () => {
    fetchMock.mockRejectedValue(new TypeError("offline"));
    await client.initializeAuth();
    expect(store.getState().sessionUnavailable).toBe(true);
    const pending = storage.get("flyora_refresh_operation_v1");
    expect(pending).toBeTruthy();
    fetchMock.mockResolvedValueOnce(response(session()));
    await client.initializeAuth();
    expect(fetchMock.mock.calls[2][1].headers["X-Refresh-Operation"]).toBe(
      pending,
    );
    expect(store.getState().sessionUnavailable).toBe(false);
  });
  it("automatically recovers one transient refresh failure using the same operation", async () => {
    fetchMock
      .mockResolvedValueOnce(response(null, 500))
      .mockResolvedValueOnce(response(session()));
    await client.initializeAuth();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].headers["X-Refresh-Operation"]).toBe(
      fetchMock.mock.calls[1][1].headers["X-Refresh-Operation"],
    );
    expect(store.getState().isAuthenticated).toBe(true);
    expect(store.getState().sessionUnavailable).toBe(false);
  });
  it("recovers an interrupted successful response without generating a second operation", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response("{", { status: 200 }))
      .mockResolvedValueOnce(response(session()));
    await client.initializeAuth();
    expect(store.getState().isAuthenticated).toBe(true);
    expect(fetchMock.mock.calls[0][1].headers["X-Refresh-Operation"]).toBe(
      fetchMock.mock.calls[1][1].headers["X-Refresh-Operation"],
    );
  });
  it.each([400, 401, 403, 429])(
    "does not automatically retry a definitive HTTP %s",
    async (status) => {
      fetchMock.mockResolvedValue(response(null, status));
      await client.initializeAuth();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
  it("stops after two transient failures and retains the recovery operation", async () => {
    fetchMock.mockResolvedValue(response(null, 503));
    await client.initializeAuth();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.getState().sessionUnavailable).toBe(true);
    expect(storage.get("flyora_refresh_operation_v1")).toBeTruthy();
  });
  it("does not clear an authenticated state on a temporary refresh failure", async () => {
    store.getState().setAuth(session("old"));
    fetchMock.mockResolvedValue(response(null, 503));
    await expect(client.refreshSession()).rejects.toMatchObject({
      statusCode: 503,
    });
    expect(store.getState().accessToken).toBe("old");
  });
  it("401 retries share a refresh and use the new bearer token", async () => {
    store.getState().setAuth(session("old"));
    fetchMock.mockImplementation(async (url: string, options: RequestInit) => {
      if (url.endsWith("/auth/refresh")) return response(session("fresh"));
      return new Headers(options.headers).get("Authorization") ===
        "Bearer fresh"
        ? response({ ok: true })
        : response(null, 401);
    });
    const results = await Promise.all([
      client.apiClient.get("/one"),
      client.apiClient.get("/two"),
      client.apiClient.get("/three"),
    ]);
    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(
      fetchMock.mock.calls.filter((call) => call[0].endsWith("/auth/refresh")),
    ).toHaveLength(1);
  });
  it("late refresh responses cannot restore a cleared session", async () => {
    const gate = deferred<Response>();
    fetchMock.mockReturnValue(gate.promise);
    const pending = client.refreshSession();
    await Promise.resolve();
    store.getState().clearAuth();
    gate.resolve(response(session()));
    await expect(pending).rejects.toMatchObject({ statusCode: 401 });
    expect(store.getState().isAuthenticated).toBe(false);
  });
  it("logout only clears local auth after server revocation succeeds", async () => {
    store.getState().setAuth(session());
    fetchMock.mockResolvedValueOnce(response(null, 503));
    await expect(client.logout()).rejects.toMatchObject({ statusCode: 503 });
    expect(store.getState().isAuthenticated).toBe(true);
    fetchMock.mockResolvedValueOnce(response({ success: true }));
    await client.logout();
    expect(store.getState().accessToken).toBeNull();
    expect(storage.size).toBe(0);
  });
  it("never sends bearer credentials to absolute third party URLs", async () => {
    store.getState().setAuth(session());
    await expect(
      client.apiClient.get("https://evil.example/api"),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("does not refresh on permission errors", async () => {
    store.getState().setAuth(session());
    fetchMock.mockResolvedValue(response(null, 403));
    await expect(client.apiClient.get("/admin")).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("a second unauthorized response clears the invalid session without retry loops", async () => {
    store.getState().setAuth(session("old"));
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith("/auth/refresh") ? response(session()) : response(null, 401),
    );
    await expect(client.apiClient.get("/protected")).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(store.getState().isAuthenticated).toBe(false);
  });
  it("responses from a logged-out session cannot repopulate query data", async () => {
    store.getState().setAuth(session());
    const gate = deferred<Response>();
    fetchMock.mockReturnValue(gate.promise);
    const request = client.apiClient.get("/private");
    store.getState().clearAuth();
    gate.resolve(response({ secret: true }));
    await expect(request).rejects.toMatchObject({ statusCode: 401 });
  });
});
