import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AuthSession,
  StaffAvailability,
  UserProfile,
} from "@flyora/types";

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (session: AuthSession) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: UserProfile) => void;
  setAvailability: (availability: StaffAvailability) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (session: AuthSession) => {
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? null,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setTokens: (accessToken: string, refreshToken?: string) => {
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
        }));
      },

      setUser: (user: UserProfile) => {
        set({ user });
      },

      setAvailability: (availability: StaffAvailability) => {
        set((state) => ({
          user: state.user ? { ...state.user, availability } : null,
        }));
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "flyora_admin_auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
