import { StaffWorkload } from "./dashboard/StaffWorkload";
import { DashboardChart } from "./dashboard/DashboardChart";
import { useAuthStore } from "../stores/authStore";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const manager =
    user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER";
  return (
    <div className="dashboard-page space-y-6">
      <div className="page-heading">
        <h1>Overview</h1>
      </div>
      <DashboardMetrics
        role={user?.role || "SERVICE_COORDINATOR"}
        userId={user?.id || ""}
      />
      <DashboardChart
        role={user?.role || "SERVICE_COORDINATOR"}
        userId={user?.id || ""}
      />
      {manager && <StaffWorkload userId={user?.id || ""} />}
    </div>
  );
};
