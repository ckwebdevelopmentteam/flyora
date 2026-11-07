import { create } from "zustand";
import type {
  AuthSession,
  StaffAvailability,
  UserProfile,
} from "@flyora/types";

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionUnavailable: boolean;
  generation: number;
  setAuth: (session: AuthSession) => void;
  setUser: (user: UserProfile) => void;
  setAvailability: (availability: StaffAvailability) => void;
  clearAuth: () => void;
}
// One-time migration: old persisted credentials are never rehydrated.
try {
  localStorage.removeItem("flyora_admin_auth");
} catch {
  /* Storage may be disabled. */
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  sessionUnavailable: false,
  generation: 0,
  setAuth: (session) =>
    set({
      user: session.user,
      accessToken: session.accessToken,
      isAuthenticated: true,
      isLoading: false,
      sessionUnavailable: false,
    }),
  setUser: (user) => set({ user }),
  setAvailability: (availability) =>
    set((state) => ({
      user: state.user ? { ...state.user, availability } : null,
    })),
  clearAuth: () =>
    set((state) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      sessionUnavailable: false,
      generation: state.generation + 1,
    })),
}));
