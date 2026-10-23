import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Inbox,
  Search,
  UserCheck,
  History,
  Loader2,
  RefreshCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { leadsApi } from "../../lib/leadsApi";
import { ReassignLeadModal } from "../../components/leads/ReassignLeadModal";
import { LeadActivityDrawer } from "../../components/leads/LeadActivityDrawer";
import type {
  LeadItem,
  LeadStatus,
  ServiceSummary,
  UserProfile,
} from "@flyora/types";

export const MasterLeadsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters & State
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedCoordinator, setSelectedCoordinator] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 15;

  // Modals state
  const [reassigningLead, setReassigningLead] = useState<LeadItem | null>(null);
  const [viewingLeadId, setViewingLeadId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Services for filter
  const { data: services = [] } = useQuery<ServiceSummary[]>({
    queryKey: ["services"],
    queryFn: () => apiClient.get("/services"),
  });

  // Fetch Staff for filter
  const { data: staffList = [] } = useQuery<UserProfile[]>({
    queryKey: ["users"],
    queryFn: () => apiClient.get("/users"),
  });

  // Fetch Master Leads Query
  const {
    data: leadsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: [
      "master-leads",
      search,
      selectedService,
      selectedCoordinator,
      selectedStatus,
      unassignedOnly,
      page,
    ],
    queryFn: () =>
      leadsApi.getAllLeads({
        search: search.trim() || undefined,
        serviceId: selectedService || undefined,
        assignedToId: selectedCoordinator || undefined,
        status: (selectedStatus as LeadStatus) || undefined,
        unassignedOnly: unassignedOnly ? "true" : undefined,
        page,
        limit,
      }),
  });

  const leads = leadsData?.leads || [];
  const total = leadsData?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // Summary counts
  const unassignedCount = useMemo(
    () => leads.filter((l) => !l.assignedToId).length,
    [leads],
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Master Lead Control Center
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700">
              {total} Total
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time oversight of all incoming enquiries, coordinator claims,
            and reassignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition shadow-2xs"
            title="Refresh Leads"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FAFAF9] p-3.5 rounded-2xl border border-zinc-200/90 flex flex-wrap items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by customer, phone, or service..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Service Filter */}
        <select
          value={selectedService}
          onChange={(e) => {
            setSelectedService(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">All Services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Coordinator Filter */}
        <select
          value={selectedCoordinator}
          onChange={(e) => {
            setSelectedCoordinator(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">All Coordinators</option>
          {staffList.map((st) => (
            <option key={st.id} value={st.id}>
              {st.fullName} ({st.role.replace("_", " ")})
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">All Statuses</option>
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="QUOTED">QUOTED</option>
          <option value="NEGOTIATING">NEGOTIATING</option>
          <option value="BOOKED">BOOKED</option>
          <option value="LOST">LOST</option>
        </select>

        {/* Unassigned Pool Toggle */}
        <button
          type="button"
          onClick={() => {
            setUnassignedOnly((prev) => !prev);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
            unassignedOnly
              ? "bg-amber-100 border-amber-300 text-amber-900 font-semibold"
              : "bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Unassigned Pool Only</span>
          {unassignedCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-mono flex items-center justify-center font-bold">
              {unassignedCount}
            </span>
          )}
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-[#FAFAF9] text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Trip Specs</th>
                <th className="py-3 px-4">Coordinator</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-900" />
                    <span>Loading master leads...</span>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-zinc-300 stroke-[1.5]" />
                    <p className="font-medium text-zinc-700">No leads found</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Try resetting your filters or search query.
                    </p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isUnassigned = !lead.assignedToId;
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-zinc-50/70 transition group"
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-900">
                          {lead.customer.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          <span>{lead.customer.phone}</span>
                          {lead.customer.email && (
                            <span className="text-zinc-400 truncate max-w-[120px]">
                              • {lead.customer.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#F4F4F5] border border-zinc-200/80 font-mono text-[11px] text-zinc-800 font-medium">
                          {lead.serviceName}
                        </span>
                        {lead.packageTitle && (
                          <div className="text-[10px] text-zinc-400 truncate max-w-[140px] mt-0.5">
                            {lead.packageTitle}
                          </div>
                        )}
                      </td>

                      {/* Trip Specs */}
                      <td className="py-3.5 px-4">
                        <div className="text-zinc-800 font-medium">
                          {lead.numberOfAdults} Adults
                          {lead.numberOfKids > 0 &&
                            `, ${lead.numberOfKids} Kids`}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {lead.travelDate
                            ? new Date(lead.travelDate).toLocaleDateString()
                            : "Flexible Date"}
                        </div>
                      </td>

                      {/* Assigned Coordinator */}
                      <td className="py-3.5 px-4">
                        {isUnassigned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold font-mono text-[10px] animate-pulse">
                            Unassigned Pool
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="font-medium text-zinc-900">
                              {lead.assignedToName}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Stage Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
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
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString()}{" "}
                        <span className="text-zinc-400">
                          {new Date(lead.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingLeadId(lead.id)}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-black transition"
                            title="View Activity History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setReassigningLead(lead)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-700 text-[11px] font-medium transition flex items-center gap-1"
                            title="Reassign Coordinator"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Reassign</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing {leads.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, total)} of {total} leads
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <ReassignLeadModal
        lead={reassigningLead}
        isOpen={!!reassigningLead}
        onClose={() => setReassigningLead(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["master-leads"] });
          showToast("Lead successfully reassigned to coordinator");
        }}
      />

      <LeadActivityDrawer
        leadId={viewingLeadId}
        isOpen={!!viewingLeadId}
        onClose={() => setViewingLeadId(null)}
      />
    </div>
  );
};
