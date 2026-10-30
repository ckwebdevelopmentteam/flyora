import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { StaffAvailability, UserRole } from "@flyora/types";
import { useAuthStore } from "../../stores/authStore";
import { apiClient, logout } from "../../lib/apiClient";
import { LogOut, ChevronDown, Menu, Loader2, Check } from "lucide-react";

import { Modal } from "../ui/Modal";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const AVAILABILITY_CONFIG: Record<
  StaffAvailability,
  { label: string; dotClass: string }
> = {
  AVAILABLE: {
    label: "Available",
    dotClass: "bg-emerald-500",
  },
  BUSY: {
    label: "Busy",
    dotClass: "bg-amber-500",
  },
  OFF_DUTY: {
    label: "Off Duty",
    dotClass: "bg-zinc-400",
  },
};

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Admin",
  OPERATIONS_MANAGER: "Operations",
  SERVICE_COORDINATOR: "Staff",
  ACCOUNTS: "Accounts",
  CONTENT_MANAGER: "Content",
};

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pageTitle = pathname.startsWith("/admin/leads")
    ? "Enquiries"
    : pathname.startsWith("/leads")
      ? "Enquiries"
      : pathname.startsWith("/bookings")
        ? "Bookings & payments"
        : pathname.startsWith("/packages")
          ? "Tour packages"
          : pathname.startsWith("/team")
            ? "Team"
            : pathname.startsWith("/services")
              ? "Services"
              : "Overview";
  const { user, setAvailability } = useAuthStore();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvailabilityChange = async (newStatus: StaffAvailability) => {
    if (!user || user.availability === newStatus || isUpdating) return;
    setIsUpdating(true);
    setAvailabilityError(null);
    try {
      await apiClient.patch(`/users/${user.id}/availability`, {
        availability: newStatus,
      });
      setAvailability(newStatus);
      setDropdownOpen(false);
    } catch {
      setAvailabilityError(
        "We couldn't update your availability. Please try again.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      navigate("/login");
    } catch {
      setLogoutError("Sign out failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const currentAvailability = user?.availability || "AVAILABLE";
  const config = AVAILABILITY_CONFIG[currentAvailability];
  const roleLabel = user?.role ? ROLE_LABELS[user.role] || user.role : "Staff";

  return (
    <header className="workspace-header">
      {/* Left: Mobile hamburger & breadcrumb indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-1.5 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="hidden sm:inline">Workspace</span>
          <span className="hidden sm:inline">/</span>
          <span className="text-slate-800 font-medium">{pageTitle}</span>
        </div>
      </div>

      {/* Right: Availability Toggle, User Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* Availability Switcher */}
        {user?.role === "SERVICE_COORDINATOR" && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isUpdating}
              aria-label={`Availability: ${config.label}`}
              aria-expanded={dropdownOpen}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-zinc-200 bg-[#F6F6F3] text-xs font-medium text-zinc-800 hover:border-zinc-300 transition"
            >
              {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}
                />
              )}
              <span className="hidden sm:inline text-xs">{config.label}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 rounded-lg bg-white border border-zinc-200 shadow-lg py-1 z-30">
                {(["AVAILABLE", "BUSY", "OFF_DUTY"] as StaffAvailability[]).map(
                  (status) => {
                    const itemConfig = AVAILABILITY_CONFIG[status];
                    const isSelected = status === currentAvailability;
                    return (
                      <button
                        key={status}
                        onClick={() => handleAvailabilityChange(status)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition ${
                          isSelected
                            ? "bg-zinc-100 text-black font-semibold"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${itemConfig.dotClass}`}
                          />
                          <span>{itemConfig.label}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-black" />}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>
        )}

        {availabilityError && (
          <p
            role="alert"
            className="absolute top-full right-4 max-w-xs p-3 bg-white border rounded-lg shadow-sm text-xs text-rose-700"
          >
            {availabilityError}
          </p>
        )}
        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200">
          <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center font-mono text-xs">
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="role-badge md:hidden">{roleLabel}</span>
          <div className="hidden md:block text-left leading-none">
            <p className="text-xs font-medium text-zinc-900">
              {user?.fullName || "Staff Member"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="role-badge">{roleLabel}</span>
              {user?.role === "SERVICE_COORDINATOR" && (
                <span
                  className="text-xs text-slate-500 truncate max-w-56"
                  title={user.services
                    ?.map((item) => item.service?.name)
                    .join(", ")}
                >
                  {user.services
                    ?.map((item) => item.service?.name)
                    .filter(Boolean)
                    .join(" · ") || "No services assigned"}
                </span>
              )}
            </div>
          </div>
        </div>

        {logoutError && (
          <p role="alert" className="text-xs text-red-700">
            {logoutError}
          </p>
        )}
        {/* Logout */}
        <button
          onClick={() => setConfirmLogout(true)}
          disabled={loggingOut}
          aria-label="Sign out"
          title="Sign Out"
          className="p-1.5 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
      {confirmLogout && (
        <Modal
          title="Sign out?"
          onClose={() => setConfirmLogout(false)}
          busy={loggingOut}
          footer={
            <>
              <button
                className="button-secondary"
                onClick={() => setConfirmLogout(false)}
                disabled={loggingOut}
              >
                Stay signed in
              </button>
              <button
                className="button-primary"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
              >
                {loggingOut ? "Signing out…" : "Sign out"}
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            You can sign in again whenever you're ready.
          </p>
          {logoutError && <p role="alert">{logoutError}</p>}
        </Modal>
      )}
    </header>
  );
};
