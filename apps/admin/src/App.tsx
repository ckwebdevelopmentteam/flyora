import { useEffect } from "react";
import { initializeAuth } from "./lib/apiClient";
import { useAuthStore } from "./stores/authStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TeamPage } from "./pages/TeamPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminLayout } from "./components/layout/AdminLayout";
import { GuestRoute } from "./routes/GuestRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleGuard } from "./routes/RoleGuard";

import { PackagesListPage } from "./pages/PackagesListPage";
import { PackageBuilderPage } from "./pages/PackageBuilderPage";
import { CoordinatorLeadsPage } from "./pages/leads/CoordinatorLeadsPage";
import { MasterLeadsPage } from "./pages/admin/MasterLeadsPage";
import { BookingsPage } from "./pages/bookings/BookingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const unavailable = useAuthStore((state) => state.sessionUnavailable);
  useEffect(() => {
    void initializeAuth();
    return useAuthStore.subscribe((state, previous) => {
      if (state.generation !== previous.generation) queryClient.clear();
    });
  }, []);
  if (isLoading)
    return (
      <main className="min-h-screen grid place-items-center" role="status">
        Checking your session…
      </main>
    );
  if (unavailable)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p role="alert">Session verification is temporarily unavailable.</p>
        <button
          className="border rounded px-4 py-3"
          onClick={() => void initializeAuth()}
        >
          Try again
        </button>
      </main>
    );
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />

              {/* Tour Packages Catalog (All staff can view) */}
              <Route path="packages" element={<PackagesListPage />} />

              {/* Coordinator Leads Workspace & Service Pool */}
              <Route path="leads" element={<CoordinatorLeadsPage />} />

              {/* Bookings & Offline Payments Management */}
              <Route path="bookings" element={<BookingsPage />} />

              {/* Package Builder (Super Admin, Operations Manager, Content Manager) */}
              <Route
                element={
                  <RoleGuard
                    allowedRoles={[
                      "SUPER_ADMIN",
                      "OPERATIONS_MANAGER",
                      "CONTENT_MANAGER",
                    ]}
                  />
                }
              >
                <Route path="packages/new" element={<PackageBuilderPage />} />
                <Route
                  path="packages/edit/:slug"
                  element={<PackageBuilderPage />}
                />
              </Route>

              {/* Team Management - Restricted to Super Admin & Operations Manager */}
              <Route
                element={
                  <RoleGuard
                    allowedRoles={["SUPER_ADMIN", "OPERATIONS_MANAGER"]}
                  />
                }
              >
                <Route path="team" element={<TeamPage />} />
                <Route path="admin/leads" element={<MasterLeadsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
