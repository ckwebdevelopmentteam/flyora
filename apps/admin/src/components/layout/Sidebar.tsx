import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import {
  Compass,
  LayoutDashboard,
  Users,
  Inbox,
  CreditCard,
  Palmtree,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}
export const Sidebar = ({
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) => {
  const aside = useRef<HTMLElement>(null);
  const [mobile, setMobile] = useState(
    () =>
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 1023px)").matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const user = useAuthStore((state) => state.user);
  const { pathname, search } = useLocation();
  useEffect(() => {
    onClose();
  }, [pathname, search]);
  const manager =
    user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER";
  const sales = manager || user?.role === "SERVICE_COORDINATOR";
  const items = [
    { name: "Overview", path: "/", icon: LayoutDashboard },
    ...(sales
      ? [
          {
            name: "Enquiries",
            path: manager ? "/admin/leads" : "/leads?tab=my-leads",
            icon: Inbox,
          },
        ]
      : []),
    ...(user?.role !== "CONTENT_MANAGER"
      ? [{ name: "Bookings & payments", path: "/bookings", icon: CreditCard }]
      : []),
    ...(user?.role !== "ACCOUNTS"
      ? [{ name: "Tour packages", path: "/packages", icon: Palmtree }]
      : []),
    ...(manager ? [{ name: "Team", path: "/team", icon: Users }] : []),
  ];
  useEffect(() => {
    if (!isOpen || !mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.getElementById("workspace-shell")?.setAttribute("inert", "");
    const controls = () =>
      Array.from(
        aside.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not(:disabled)",
        ) || [],
      ).filter((element) => !element.classList.contains("desktop-only"));
    controls()[0]?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab") {
        const items = controls();
        if (event.shiftKey && document.activeElement === items[0]) {
          event.preventDefault();
          items.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
          event.preventDefault();
          items[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = overflow;
      document.getElementById("workspace-shell")?.removeAttribute("inert");
      previous?.focus();
    };
  }, [isOpen, mobile, onClose]);
  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 bg-slate-900/30 z-30 lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside
        ref={aside}
        inert={mobile && !isOpen}
        className={`workspace-sidebar ${isOpen ? "mobile-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="workspace-brand">
          <Link
            to="/"
            aria-label="Flyora overview"
            className={collapsed ? "lg:hidden" : ""}
          >
            <span className="brand-mark">
              <Compass size={19} />
            </span>
            <span>
              flyora<span className="text-indigo-600">.</span>
            </span>
          </Link>
          <button
            className="icon-button ml-auto desktop-only"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <PanelLeftClose size={17} />
            )}
          </button>
          <button
            className="icon-button ml-auto mobile-only"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>
        <nav>
          <p className={`nav-heading ${collapsed ? "lg:sr-only" : ""}`}>
            Workspace
          </p>
          {items.map(({ name, path, icon: Icon }) => {
            const [route] = path.split("?");
            const active =
              name === "Enquiries"
                ? pathname.startsWith("/leads") ||
                  pathname.startsWith("/admin/leads")
                : route === "/"
                  ? pathname === route
                  : pathname.startsWith(route);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => {
                  if (`${pathname}${search}` === path) onClose();
                }}
                className={`nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                title={collapsed ? name : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                <span className={collapsed ? "lg:sr-only" : ""}>{name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-profile">
          <span className="avatar">{user?.fullName?.charAt(0) || "F"}</span>
          <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
            <p className="text-sm font-medium truncate">
              {user?.fullName || "Flyora team"}
            </p>
            <p className="text-xs text-slate-500">Staff workspace</p>
          </div>
        </div>
      </aside>
    </>
  );
};
