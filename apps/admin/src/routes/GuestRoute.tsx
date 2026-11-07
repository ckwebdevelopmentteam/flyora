import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export function loginDestination(state: unknown): string {
  const from = (state as { from?: { pathname?: unknown } } | null)?.from
    ?.pathname;
  return typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    from.split(/[?#]/, 1)[0] !== "/login"
    ? from
    : "/";
}

// App waits for session initialization before mounting any routes.
export const GuestRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  return isAuthenticated ? (
    <Navigate to={loginDestination(location.state)} replace />
  ) : (
    <Outlet />
  );
};
