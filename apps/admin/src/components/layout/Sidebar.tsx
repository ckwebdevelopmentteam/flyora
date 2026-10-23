import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import {
  Compass,
  LayoutDashboard,
  Users,
  Inbox,
  FileText,
  CreditCard,
  Briefcase,
  X,
  Layers,
  Palmtree,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const user = useAuthStore((state) => state.user);
  const isAdminOrManager =
    user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER";

  const adminNavItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      active: true,
    },
    {
      name: "Tour Packages",
      path: "/packages",
      icon: Palmtree,
      active: true,
    },
    {
      name: "Team & Staff",
      path: "/team",
      icon: Users,
      active: true,
    },
    {
      name: "All Leads",
      path: "/admin/leads",
      icon: Inbox,
      active: true,
    },
    {
      name: "Quotations",
      path: "#quotes",
      icon: FileText,
      active: false,
      badge: "P4",
    },
    {
      name: "Bookings & Payments",
      path: "#bookings",
      icon: CreditCard,
      active: false,
      badge: "P5",
    },
  ];

  const coordinatorNavItems = [
    {
      name: "My Dashboard",
      path: "/",
      icon: LayoutDashboard,
      active: true,
    },
    {
      name: "Tour Packages",
      path: "/packages",
      icon: Palmtree,
      active: true,
    },
    {
      name: "Service Pool",
      path: "#pool",
      icon: Layers,
      active: false,
      badge: "P3",
    },
    {
      name: "My Leads",
      path: "#my-leads",
      icon: Inbox,
      active: false,
      badge: "P3",
    },
    {
      name: "My Quotes",
      path: "#quotes",
      icon: FileText,
      active: false,
      badge: "P4",
    },
  ];

  const navItems = isAdminOrManager ? adminNavItems : coordinatorNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-60 bg-[#FAFAF9] border-r border-zinc-200/90 flex flex-col z-40 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-200/90">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold tracking-wider uppercase text-zinc-900">
                Flyora
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">ops</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-zinc-400 hover:text-black hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <p className="px-2.5 pb-2 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;

            if (!item.active) {
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-zinc-400 cursor-not-allowed select-none text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1 rounded bg-zinc-200/60 text-zinc-500 font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition ${
                    isActive
                      ? "bg-black text-white font-medium shadow-xs"
                      : "text-zinc-600 hover:text-black hover:bg-zinc-200/50"
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Assigned Services Footer for Coordinators */}
        {user?.services && user.services.length > 0 && (
          <div className="p-3 mx-2.5 mb-3 rounded-lg bg-white border border-zinc-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">
              <Briefcase className="w-3 h-3 stroke-[1.5]" />
              <span>Assigned Services</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {user.services.map((item) => (
                <span
                  key={item.id}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#F8F8F6] border border-zinc-200 text-zinc-700 font-mono"
                >
                  {item.service?.name || "Service"}
                  {item.isPrimary && " ★"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-2.5 border-t border-zinc-200/90 text-[10px] text-zinc-400 font-mono text-center">
          Flyora v0.1.0
        </div>
      </aside>
    </>
  );
};
