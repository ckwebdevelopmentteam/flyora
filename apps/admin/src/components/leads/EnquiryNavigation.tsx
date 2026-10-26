import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export function EnquiryNavigation({
  includeAll = false,
}: {
  includeAll?: boolean;
}) {
  const role = useAuthStore((state) => state.user?.role);
  const location = useLocation();
  const manager =
    includeAll || role === "SUPER_ADMIN" || role === "OPERATIONS_MANAGER";
  const current = location.pathname.startsWith("/admin/leads")
    ? "all"
    : new URLSearchParams(location.search).get("tab") === "my-leads"
      ? "mine"
      : "available";
  const views = [
    ...(manager ? [{ key: "all", label: "All", to: "/admin/leads" }] : []),
    { key: "mine", label: "Mine", to: "/leads?tab=my-leads" },
    { key: "available", label: "Available", to: "/leads?tab=pool" },
  ];
  return (
    <nav aria-label="Enquiry views" className="enquiry-views">
      {views.map((view) => (
        <Link
          key={view.key}
          to={view.to}
          aria-current={view.key === current ? "page" : undefined}
        >
          {view.label}
        </Link>
      ))}
    </nav>
  );
}
