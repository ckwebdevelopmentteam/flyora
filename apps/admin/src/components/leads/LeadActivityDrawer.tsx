import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Clock,
  Phone,
  MessageCircle,
  Loader2,
  User,
  History,
} from "lucide-react";
import { leadsApi } from "../../lib/leadsApi";
import type { LeadDetailItem } from "@flyora/types";

interface LeadActivityDrawerProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadActivityDrawer: React.FC<LeadActivityDrawerProps> = ({
  leadId,
  isOpen,
  onClose,
}) => {
  const {
    data: lead,
    isLoading,
    error,
  } = useQuery<LeadDetailItem>({
    queryKey: ["lead-detail", leadId],
    queryFn: () => leadsApi.getLeadById(leadId!),
    enabled: isOpen && !!leadId,
  });

  if (!isOpen || !leadId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-zinc-700" />
            <h3 className="text-sm font-semibold text-zinc-900">
              Lead Activity & History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
              <span className="text-xs">Loading activity timeline...</span>
            </div>
          ) : error || !lead ? (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs">
              Failed to load lead details.
            </div>
          ) : (
            <>
              {/* Customer Profile Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-zinc-900">
                      {lead.customer.fullName}
                    </h4>
                    <p className="text-xs text-zinc-500 font-mono">
                      {lead.customer.phone}{" "}
                      {lead.customer.email && `• ${lead.customer.email}`}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      lead.status === "BOOKED"
                        ? "bg-emerald-100 text-emerald-800"
                        : lead.status === "QUOTED"
                          ? "bg-blue-100 text-blue-800"
                          : lead.status === "CONTACTED"
                            ? "bg-amber-100 text-amber-800"
                            : lead.status === "LOST"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-zinc-200 text-zinc-800"
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60">
                  <a
                    href={`tel:${lead.customer.phone}`}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${lead.customer.phone.replace(
                      /[^0-9]/g,
                      "",
                    )}?text=${encodeURIComponent(
                      `Hello ${lead.customer.fullName}, this is regarding your ${lead.serviceName} enquiry with Flyora Travels.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Trip Specifications */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-zinc-200 bg-white">
                  <span className="text-[11px] text-zinc-400 font-mono block mb-1">
                    Service
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {lead.serviceName}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-zinc-200 bg-white">
                  <span className="text-[11px] text-zinc-400 font-mono block mb-1">
                    Coordinator
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {lead.assignedToName || "Unassigned Pool"}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-zinc-200 bg-white">
                  <span className="text-[11px] text-zinc-400 font-mono block mb-1">
                    Travel Date
                  </span>
                  <span className="font-medium text-zinc-800">
                    {lead.travelDate
                      ? new Date(lead.travelDate).toLocaleDateString()
                      : "Not specified"}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-zinc-200 bg-white">
                  <span className="text-[11px] text-zinc-400 font-mono block mb-1">
                    Passengers
                  </span>
                  <span className="font-medium text-zinc-800">
                    {lead.numberOfAdults} Adults, {lead.numberOfKids} Kids
                  </span>
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h5 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Activity Timeline ({lead.activities?.length || 0})
                </h5>

                {lead.activities && lead.activities.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                    {lead.activities.map((act) => (
                      <div key={act.id} className="relative group">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-zinc-900 border-2 border-white"></div>
                        <div className="bg-[#FAFAF9] p-3 rounded-xl border border-zinc-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-zinc-900">
                              {act.action.replace("_", " ")}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {new Date(act.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-zinc-600 text-xs mb-1.5">
                            {act.details}
                          </p>
                          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {act.userName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">
                    No timeline activity recorded yet.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
