import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile, UserRole, StaffAvailability } from "@flyora/types";
import { apiClient } from "../lib/apiClient";
import { AddStaffModal } from "../components/team/AddStaffModal";
import { EditServicesModal } from "../components/team/EditServicesModal";
import {
  Users,
  Plus,
  Search,
  Loader2,
  Phone,
  Edit2,
  AlertCircle,
} from "lucide-react";

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  OPERATIONS_MANAGER: "Operations",
  SERVICE_COORDINATOR: "Coordinator",
  ACCOUNTS: "Accounts",
  CONTENT_MANAGER: "Content",
};

const AVAILABILITY_CONFIG: Record<
  StaffAvailability,
  { label: string; dot: string }
> = {
  AVAILABLE: {
    label: "Available",
    dot: "bg-emerald-500",
  },
  BUSY: {
    label: "Busy",
    dot: "bg-amber-500",
  },
  OFF_DUTY: {
    label: "Off Duty",
    dot: "bg-zinc-400",
  },
};

export const TeamPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoordinator, setEditingCoordinator] =
    useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery<UserProfile[]>({
    queryKey: ["users"],
    queryFn: () => apiClient.get("/users"),
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery));

      const matchesRole =
        selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRoleFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-zinc-900">
            Team & Coordinators
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Directory of staff accounts, contact details, and assigned travel
            services.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
          />
        </div>

        <select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-black"
        >
          <option value="ALL">All Roles</option>
          <option value="SERVICE_COORDINATOR">Coordinators</option>
          <option value="OPERATIONS_MANAGER">Operations Managers</option>
          <option value="SUPER_ADMIN">Super Admins</option>
          <option value="ACCOUNTS">Accounts</option>
          <option value="CONTENT_MANAGER">Content Managers</option>
        </select>
      </div>

      {/* Staff Table Card */}
      <div className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
            <span className="text-xs">Loading staff directory...</span>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center justify-center text-zinc-600 gap-2">
            <AlertCircle className="w-5 h-5 text-zinc-600" />
            <span className="text-xs">Failed to load staff list.</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 text-center px-4">
            <Users className="w-8 h-8 text-zinc-300 mb-2 stroke-[1.5]" />
            <p className="text-xs text-zinc-500">No staff members found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F6F3] border-b border-zinc-200 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Staff Member</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Phone</th>
                  <th className="py-2.5 px-4">Assigned Services</th>
                  <th className="py-2.5 px-4">Availability</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.map((userItem) => {
                  const roleLabel = ROLE_LABELS[userItem.role] || userItem.role;
                  const avail =
                    AVAILABILITY_CONFIG[userItem.availability] ||
                    AVAILABILITY_CONFIG.AVAILABLE;

                  return (
                    <tr
                      key={userItem.id}
                      className="hover:bg-[#FBFBFA] transition"
                    >
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded bg-[#F4F4F1] border border-zinc-200 flex items-center justify-center text-zinc-800 font-mono text-xs shrink-0">
                            {userItem.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900">
                              {userItem.fullName}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {userItem.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F6F6F3] border border-zinc-200 text-zinc-700">
                          {roleLabel}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4">
                        {userItem.phone ? (
                          <div className="flex items-center gap-1.5 text-zinc-700 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{userItem.phone}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Assigned Services */}
                      <td className="py-3 px-4 max-w-xs">
                        {userItem.services && userItem.services.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {userItem.services.map((item) => (
                              <span
                                key={item.id}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-zinc-250 text-zinc-700 font-mono"
                              >
                                {item.service?.name || "Service"}
                                {item.isPrimary && " ★"}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Availability status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${avail.dot}`}
                          />
                          <span className="text-xs text-zinc-700">
                            {avail.label}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {userItem.role === "SERVICE_COORDINATOR" ? (
                          <button
                            onClick={() => setEditingCoordinator(userItem)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-[11px] transition shadow-2xs"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Services</span>
                          </button>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditServicesModal
        user={editingCoordinator}
        isOpen={!!editingCoordinator}
        onClose={() => setEditingCoordinator(null)}
      />
    </div>
  );
};
