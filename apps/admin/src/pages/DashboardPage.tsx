import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import {
  Users,
  Briefcase,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const isAdminOrManager =
    user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] uppercase tracking-wider mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span>Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-zinc-900">
            Welcome, {user?.fullName || "Staff Member"}
          </h1>
          <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
            {isAdminOrManager
              ? "Manage staff permissions, assign coordinator travel services, and supervise operations."
              : "Track your assigned travel services, manage shift availability, and prepare for customer enquiries."}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4 pt-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F6F6F3] border border-zinc-200 text-zinc-700">
              Role: {user?.role?.replace(/_/g, " ")}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F6F6F3] border border-zinc-200 text-zinc-700">
              Status: {user?.availability || "AVAILABLE"}
            </span>
          </div>
        </div>
      </div>

      {/* Coordinator Assigned Services */}
      {user?.services && user.services.length > 0 && (
        <div className="bg-white border border-zinc-200/90 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-900 text-xs font-medium">
              <Briefcase className="w-3.5 h-3.5 stroke-[1.5] text-zinc-500" />
              <span>Assigned Travel Services</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              {user.services.length} active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {user.services.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-zinc-200 bg-[#FBFBFA]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-zinc-900">
                    {item.service?.name || "Service"}
                  </span>
                  {item.isPrimary && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white border border-zinc-300 text-zinc-800 font-semibold">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-mono text-zinc-500">
                  Floor Margin: {item.service?.minMarginPercent ?? 10}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operational Modules Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isAdminOrManager ? (
          <div className="bg-white border border-zinc-200/90 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-350 transition shadow-xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#F6F6F3] border border-zinc-200 flex items-center justify-center text-zinc-800">
                <Users className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-medium text-zinc-900">
                Team & Coordinator Setup
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Add coordinators, configure phone numbers, and assign travel
                service lines (Visa, Holidays, Flights, Umrah).
              </p>
            </div>
            <div className="mt-5">
              <Link
                to="/team"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition shadow-xs"
              >
                <span>Manage Team</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/90 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#F6F6F3] border border-zinc-200 flex items-center justify-center text-zinc-800">
                <Layers className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-medium text-zinc-900">
                Service Lead Pool (Phase 3)
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Incoming leads for your assigned services will appear here for
                one-click claim and customer contact.
              </p>
            </div>
            <div className="mt-5">
              <span className="text-[10px] font-mono text-zinc-500 px-2 py-1 rounded bg-[#F6F6F3] border border-zinc-200">
                Phase 3 Deliverable
              </span>
            </div>
          </div>
        )}

        <div className="bg-white border border-zinc-200/90 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#F6F6F3] border border-zinc-200 flex items-center justify-center text-zinc-800">
              <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900">
              Module 1 Architecture
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Fastify authentication, RBAC authorization guards, and
              service-coordinator mappings are connected to live database.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>API Online • Port 5000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
