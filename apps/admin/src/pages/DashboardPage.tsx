import { StaffWorkload } from "./dashboard/StaffWorkload";
import { DashboardChart } from "./dashboard/DashboardChart";
import { useAuthStore } from "../stores/authStore";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";
export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "SERVICE_COORDINATOR";
  const manager = role === "SUPER_ADMIN" || role === "OPERATIONS_MANAGER";
  const splitOverview = manager || role === "SERVICE_COORDINATOR";
  return (
    <div className="dashboard-page space-y-6">
      <div className="page-heading">
        <h1>Overview</h1>
      </div>
      {splitOverview ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          <div className="xl:col-span-6 h-full">
            <DashboardMetrics
              role={role}
              userId={user?.id || ""}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-4 flex-1"
            />
          </div>
          <div className="xl:col-span-6 h-full">
            <DashboardChart role={role} userId={user?.id || ""} />
          </div>
        </div>
      ) : (
        <>
          <DashboardMetrics role={role} userId={user?.id || ""} />
          <DashboardChart role={role} userId={user?.id || ""} />
        </>
      )}
      {manager && <StaffWorkload userId={user?.id || ""} />}
    </div>
  );
};
