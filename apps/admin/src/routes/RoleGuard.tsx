import { Link, Outlet } from "react-router-dom";
import type { UserRole } from "@flyora/types";
import { useAuthStore } from "../stores/authStore";
import { ShieldAlert, ArrowLeft } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 shadow-xs flex items-center justify-center text-zinc-700 mb-4">
          <ShieldAlert className="w-5 h-5 stroke-[1.5]" />
        </div>
        <h2 className="text-base font-medium text-zinc-900 mb-1 tracking-tight">
          Access Restricted
        </h2>
        <p className="text-xs text-zinc-500 max-w-sm mb-5 leading-relaxed">
          You don't have access to this page. Contact your manager if you need
          help.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return <Outlet />;
};
