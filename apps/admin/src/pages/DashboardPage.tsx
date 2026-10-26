import { DashboardChart } from "./dashboard/DashboardChart";
import { Link } from "react-router-dom";
import {
  Inbox,
  CreditCard,
  Palmtree,
  Users,
  Layers,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { DashboardMetrics } from "./dashboard/DashboardMetrics";

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const manager =
    user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER";
  const content = user?.role === "CONTENT_MANAGER";
  const accounts = user?.role === "ACCOUNTS";
  const enquiry = {
    title: manager ? "All enquiries" : "My enquiries",
    text: "Assignments and follow-ups",
    to: manager ? "/admin/leads" : "/leads?tab=my-leads",
    icon: Inbox,
    action: "Open enquiries",
  };
  const booking = {
    title: "Bookings & payments",
    text: "Trips, receipts and balances",
    to: "/bookings",
    icon: CreditCard,
    action: "Open bookings",
  };
  const packages = {
    title: "Tour packages",
    text: "Destinations and itineraries",
    to: "/packages",
    icon: Palmtree,
    action: "View packages",
  };
  const shortcuts = content
    ? [
        packages,
        {
          title: "Add a tour package",
          text: "Create and publish a package",
          to: "/packages/new",
          icon: Plus,
          action: "Add package",
        },
      ]
    : accounts
      ? [booking]
      : [
          enquiry,
          booking,
          packages,
          manager
            ? {
                title: "Team",
                text: "Staff roles and services",
                to: "/team",
                icon: Users,
                action: "Manage team",
              }
            : {
                title: "Available enquiries",
                text: "New customers for your services",
                to: "/leads?tab=pool",
                icon: Layers,
                action: "View available enquiries",
              },
        ];
  return (
    <div className="space-y-7">
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
      <section className="dashboard-shortcuts" aria-label="Quick links">
        <h2 className="text-sm font-semibold">Quick links</h2>
        <div
          className={`grid ${shortcuts.length > 1 ? "sm:grid-cols-2" : ""} gap-4`}
        >
          {shortcuts.map(({ title, text, to, icon: Icon }) => (
            <Link
              to={to}
              key={title}
              className="surface p-5 hover:border-slate-300 transition-colors group"
            >
              <div className="flex gap-4">
                <span className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 border border-slate-100 grid place-items-center text-slate-600">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                    {text}
                  </p>
                </div>
                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                  className="ml-auto shrink-0 text-slate-400"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
      {user?.role === "SERVICE_COORDINATOR" && !!user.services?.length && (
        <section className="surface p-5">
          <h2 className="text-sm font-semibold mb-3">Your travel services</h2>
          <div className="flex flex-wrap gap-2">
            {user.services.map((item) => (
              <span
                key={item.id}
                className="bg-slate-50 border rounded-md px-3 py-1.5 text-sm text-slate-600"
              >
                {item.service?.name || "Travel service"}
                {item.isPrimary ? " · Primary" : ""}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
