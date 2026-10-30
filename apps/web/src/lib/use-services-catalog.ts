"use client";
import { useEffect, useSyncExternalStore } from "react";
import type { ServiceSummary } from "@flyora/types";
import { loadServices } from "./service-catalog";

type Snapshot = { services: ServiceSummary[]; loaded: boolean; error: boolean };
const empty: Snapshot = { services: [], loaded: false, error: false };
let snapshot = empty;
let checkedAt = 0;
let pending: Promise<void> | undefined;
const listeners = new Set<() => void>();
const publish = (next: Snapshot) => {
  snapshot = next;
  listeners.forEach((listener) => listener());
};
export function refreshServices(force = false): Promise<void> {
  if (pending) return pending;
  if (!force && snapshot.loaded && Date.now() - checkedAt < 15_000)
    return Promise.resolve();
  pending = loadServices(AbortSignal.timeout(15_000))
    .then((services) => {
      checkedAt = Date.now();
      publish({ services, loaded: true, error: false });
    })
    .catch(() => publish({ ...snapshot, loaded: true, error: true }))
    .finally(() => {
      pending = undefined;
    });
  return pending;
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
let users = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const foregroundRefresh = () => {
  if (document.visibilityState === "visible") void refreshServices(true);
};
export function useServicesCatalog() {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => empty,
  );
  useEffect(() => {
    void refreshServices();
    if (users++ === 0) {
      window.addEventListener("focus", foregroundRefresh);
      document.addEventListener("visibilitychange", foregroundRefresh);
      timer = setInterval(foregroundRefresh, 30_000);
    }
    return () => {
      if (--users === 0) {
        clearInterval(timer);
        window.removeEventListener("focus", foregroundRefresh);
        document.removeEventListener("visibilitychange", foregroundRefresh);
      }
    };
  }, []);
  return { ...state, retry: () => refreshServices(true) };
}
