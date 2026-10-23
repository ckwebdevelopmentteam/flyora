import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, UserCheck, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { leadsApi } from "../../lib/leadsApi";
import type { LeadItem, UserProfile } from "@flyora/types";

interface ReassignLeadModalProps {
  lead: LeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReassignLeadModal: React.FC<ReassignLeadModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch all staff members
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<
    UserProfile[]
  >({
    queryKey: ["users"],
    queryFn: () => apiClient.get("/users"),
    enabled: isOpen,
  });

  // Filter active staff members eligible to handle leads
  const eligibleCoordinators = users.filter(
    (u) =>
      u.isActive &&
      (u.role === "SERVICE_COORDINATOR" ||
        u.role === "OPERATIONS_MANAGER" ||
        u.role === "SUPER_ADMIN"),
  );

  const reassignMutation = useMutation({
    mutationFn: ({
      leadId,
      assignedToId,
    }: {
      leadId: string;
      assignedToId: string;
    }) => leadsApi.reassignLead(leadId, assignedToId),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to reassign lead",
      );
    },
  });

  if (!isOpen || !lead) return null;

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg("Please select a target coordinator");
      return;
    }
    setErrorMsg(null);
    reassignMutation.mutate({
      leadId: lead.id,
      assignedToId: selectedUserId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Reassign Lead
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Manual admin coordinator transfer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleReassign} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Lead Context Summary */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Customer:</span>
              <span className="font-semibold text-zinc-900">
                {lead.customer.fullName} ({lead.customer.phone})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Service:</span>
              <span className="font-medium text-zinc-800">
                {lead.serviceName}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-zinc-200/70">
              <span className="text-zinc-500">Currently Assigned:</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  lead.assignedToName
                    ? "bg-zinc-200 text-zinc-800"
                    : "bg-amber-100 text-amber-800 font-bold"
                }`}
              >
                {lead.assignedToName || "Unassigned Pool"}
              </span>
            </div>
          </div>

          {/* Coordinator Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Assign To New Coordinator *
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={isLoadingUsers}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">-- Choose Coordinator --</option>
              {eligibleCoordinators.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.role.replace("_", " ")}) -{" "}
                  {user.availability}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500 mt-1">
              Select an available coordinator to take over direct client
              follow-ups.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-medium hover:bg-zinc-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reassignMutation.isPending || !selectedUserId}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {reassignMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <span>Confirm Transfer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
