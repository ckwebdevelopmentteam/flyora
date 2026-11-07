import { useSearchParams } from "react-router-dom";
import { enquiryStageFromUrl } from "../../lib/enquiryFilters";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { EnquiryCard } from "../../components/leads/EnquiryCard";
import { userMessage } from "../../lib/userMessage";
import React, { useState, useEffect } from "react";
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
import { loadMasterLeads } from "./masterLeads";
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
  const mobile = useMediaQuery("(max-width: 767px)");

  // Filters & State
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCoordinator = searchParams.get("assignedToId") || "";
  const setSelectedCoordinator = (value: string) =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set("assignedToId", value);
      else next.delete("assignedToId");
      return next;
    });
  const selectedStatus = enquiryStageFromUrl(searchParams.get("status")) || "";
  const setSelectedStatus = (value: string) =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (!value) next.delete("status");
      else next.set("status", value);
      return next;
    });
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  // Modals state
  const [reassigningLead, setReassigningLead] = useState<LeadItem | null>(null);
  const [viewingLeadId, setViewingLeadId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Services for filter
  const {
    data: services = [],
    error: servicesError,
    refetch: refetchServices,
  } = useQuery<ServiceSummary[]>({
    queryKey: ["services"],
    queryFn: () => apiClient.get("/services"),
  });

  // Fetch Staff for filter
  const {
    data: staffList = [],
    error: staffError,
    refetch: refetchStaff,
  } = useQuery<UserProfile[]>({
    queryKey: ["users"],
    queryFn: () => apiClient.get("/users"),
  });

  // Fetch Master Leads Query
  const {
    data: leadsData,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: [
      "master-leads",
      search,
      selectedService,
      selectedCoordinator,
      selectedStatus,
      unassignedOnly,
      createdFrom,
      createdTo,
      page,
    ],
    queryFn: ({ signal }) =>
      loadMasterLeads(
        {
          search: search.trim() || undefined,
          serviceId: selectedService || undefined,
          assignedToId: unassignedOnly
            ? undefined
            : selectedCoordinator || undefined,
          status: (selectedStatus as LeadStatus) || undefined,
          unassignedOnly: unassignedOnly ? "true" : undefined,
          page,
          limit,
        },
        createdFrom,
        createdTo,
        signal,
      ),
  });

  const leads = leadsData?.leads || [];
  const total = leadsData?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  useEffect(() => {
    if (leadsData && page > totalPages) setPage(totalPages);
  }, [leadsData, page, totalPages]);
  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);
  const showToast = (message: string) => setToastMessage(message);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span role="status">{toastMessage}</span>
        </div>
      )}

      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Enquiries
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700">
              {isLoading || error ? "—" : total} total
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition shadow-2xs"
            aria-label="Refresh leads"
            title="Refresh Leads"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {(servicesError || staffError) && (
        <div role="alert" className="text-sm text-rose-700">
          Some filter options could not be loaded.{" "}
          <button
            className="underline"
            onClick={() => {
              void refetchServices();
              void refetchStaff();
            }}
          >
            Retry filters
          </button>
        </div>
      )}
      {/* Filter Toolbar */}
      <div className="bg-[#FAFAF9] p-3.5 rounded-2xl border border-zinc-200/90 flex flex-wrap items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            aria-label="Search leads"
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
          disabled={!!servicesError}
          aria-label="Filter by service"
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
          aria-label="Filter by coordinator"
          disabled={unassignedOnly || !!staffError}
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
          aria-label="Filter by status"
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

        <label className="flex items-center gap-2">
          Created from
          <input
            type="date"
            value={createdFrom}
            max={createdTo || undefined}
            onChange={(event) => {
              setCreatedFrom(event.target.value);
              setPage(1);
            }}
            className="border rounded-lg p-1.5"
          />
        </label>
        <label className="flex items-center gap-2">
          Created to
          <input
            type="date"
            value={createdTo}
            min={createdFrom || undefined}
            onChange={(event) => {
              setCreatedTo(event.target.value);
              setPage(1);
            }}
            className="border rounded-lg p-1.5"
          />
        </label>
        {/* Unassigned Pool Toggle */}
        <button
          type="button"
          aria-pressed={unassignedOnly}
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
          <span>Unassigned only</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {userMessage(error, "We couldn't load enquiries. Please try again.")}{" "}
          <button onClick={() => refetch()} className="underline">
            Try again
          </button>
        </div>
      )}
      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
        {mobile ? (
          <div className="mobile-enquiry-list">
            {isLoading ? (
              <p role="status" className="p-6 text-sm text-slate-500">
                Loading enquiries…
              </p>
            ) : error ? null : leads.length ? (
              leads.map((lead) => (
                <EnquiryCard
                  key={lead.id}
                  lead={lead}
                  showOwner
                  onOpen={() => setReassigningLead(lead)}
                  action={lead.assignedToId ? "Reassign" : "Assign"}
                  secondary={{
                    label: "Activity",
                    onClick: () => setViewingLeadId(lead.id),
                  }}
                />
              ))
            ) : (
              <p className="p-6 text-sm text-slate-500">No enquiries found</p>
            )}
          </div>
        ) : (
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
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      Leads could not be loaded. Try again above.
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-zinc-500">
                      <Inbox className="w-8 h-8 mx-auto mb-2 text-zinc-300 stroke-[1.5]" />
                      <p className="font-medium text-zinc-700">
                        No enquiries found
                      </p>
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
        )}

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing {leads.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, total)} of {total} leads
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              aria-label="Previous page"
              disabled={isLoading || !!error || page <= 1}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              aria-label="Next page"
              disabled={isLoading || !!error || page >= totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <ReassignLeadModal
        key={reassigningLead?.id || "closed"}
        lead={reassigningLead}
        isOpen={!!reassigningLead}
        onClose={() => setReassigningLead(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["master-leads"] });
          queryClient.invalidateQueries({ queryKey: ["lead-detail"] });
          queryClient.invalidateQueries({ queryKey: ["leads"] });
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
