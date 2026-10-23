import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TeamPage } from "./pages/TeamPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleGuard } from "./routes/RoleGuard";

import { PackagesListPage } from "./pages/PackagesListPage";
import { PackageBuilderPage } from "./pages/PackageBuilderPage";
import { CoordinatorLeadsPage } from "./pages/leads/CoordinatorLeadsPage";

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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />

              {/* Tour Packages Catalog (All staff can view) */}
              <Route path="packages" element={<PackagesListPage />} />

              {/* Coordinator Leads Workspace & Service Pool */}
              <Route path="leads" element={<CoordinatorLeadsPage />} />

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
