import { enquiryStageFromUrl } from "../../lib/enquiryFilters";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { EnquiryCard } from "../../components/leads/EnquiryCard";
import { useAuthStore } from "../../stores/authStore";
import { isFollowUpDue } from "../../lib/followUps";
import { userMessage } from "../../lib/userMessage";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LeadItem, LeadStatus, ServiceSummary } from "@flyora/types";
import { leadsApi } from "../../lib/leadsApi";
import { apiClient } from "../../lib/apiClient";
import { LeadDetailDrawer } from "./components/LeadDetailDrawer";
import { AddLeadModal } from "./components/AddLeadModal";
import {
  Inbox,
  Zap,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  ChevronRight,
  RotateCcw,
  Plus,
  X,
} from "lucide-react";

const STAGES: { key: string; label: string; dotClass: string }[] = [
  { key: "ALL", label: "All", dotClass: "bg-zinc-400" },
  { key: "NEW", label: "New", dotClass: "bg-blue-500" },
  { key: "CONTACTED", label: "Contacted", dotClass: "bg-amber-500" },
  { key: "QUOTED", label: "Quoted", dotClass: "bg-purple-500" },
  { key: "NEGOTIATING", label: "Negotiating", dotClass: "bg-indigo-500" },
  { key: "BOOKED", label: "Booked", dotClass: "bg-emerald-500" },
  { key: "LOST", label: "Lost", dotClass: "bg-zinc-400" },
];

export const CoordinatorLeadsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const mobile = useMediaQuery("(max-width: 767px)");
  const user = useAuthStore((state) => state.user);
  const manager =
    user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER";

  // Active tab derived from URL query: "pool" | "my-leads"
  const currentTab = searchParams.get("tab") === "pool" ? "pool" : "my-leads";
  const setTab = (tab: "pool" | "my-leads") => {
    setSearchParams({ tab });
  };

  // Filter states for "My Leads"
  const selectedStage =
    enquiryStageFromUrl(searchParams.get("status")) || "ALL";
  const setSelectedStage = (value: string) =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value === "ALL") next.delete("status");
      else next.set("status", value);
      return next;
    });
  const [searchQuery, setSearchQuery] = useState("");
  const [followUpTodayOnly, setFollowUpTodayOnly] = useState(false);

  // Filter states for "Available enquiries"
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  // Drawer state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Add lead modal state
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Fetch coordinator's assigned services for filter
  const { data: services = [] } = useQuery<ServiceSummary[]>({
    queryKey: ["services"],
    queryFn: () => apiClient.get("/services"),
  });

  // Query: Pool Leads (auto-poll every 15 seconds for incoming customer enquiries)
  const {
    data: poolLeads = [],
    isLoading: isLoadingPool,
    error: poolError,
    refetch: refetchPool,
  } = useQuery<LeadItem[]>({
    queryKey: ["leads", "pool", selectedServiceId],
    queryFn: () =>
      leadsApi.fetchServiceEnquiries(selectedServiceId || undefined),
    refetchInterval: 15000,
  });

  // Query: My Claimed Leads
  const {
    data: myLeads = [],
    isLoading: isLoadingMyLeads,
    error: myLeadsError,
    refetch: refetchMyLeads,
  } = useQuery<LeadItem[]>({
    queryKey: ["leads", "my-leads", selectedStage, searchQuery],
    queryFn: () =>
      leadsApi.fetchMyLeads({
        status: selectedStage !== "ALL" ? selectedStage : undefined,
        search: searchQuery || undefined,
      }),
  });

  // Query: Selected Lead Activities for Drawer
  const {
    data: leadActivities = [],
    error: activitiesError,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ["leads", selectedLeadId, "activities"],
    queryFn: () =>
      selectedLeadId
        ? leadsApi.fetchLeadActivities(selectedLeadId)
        : Promise.resolve([]),
    enabled: !!selectedLeadId,
  });

  // Mutation: Atomically Claim Lead
  const claimMutation = useMutation({
    mutationFn: (leadId: string) => leadsApi.takeLead(leadId),
    onMutate: async (leadId) => {
      // Optimistic update: cancel queries & remove immediately from pool
      await queryClient.cancelQueries({ queryKey: ["leads", "pool"] });
      const previousPool = queryClient.getQueryData<LeadItem[]>([
        "leads",
        "pool",
        selectedServiceId,
      ]);
      if (previousPool) {
        queryClient.setQueryData<LeadItem[]>(
          ["leads", "pool", selectedServiceId],
          previousPool.filter((l) => l.id !== leadId),
        );
      }
      return { previousPool };
    },
    onError: (err: any, _, context) => {
      // Rollback on conflict or failure
      if (context?.previousPool) {
        queryClient.setQueryData(
          ["leads", "pool", selectedServiceId],
          context.previousPool,
        );
      }
      showToast(
        "error",
        userMessage(
          err,
          "We couldn't take this enquiry. Please refresh and try again.",
        ),
      );
      refetchPool();
    },
    onSuccess: (data) => {
      showToast(
        "success",
        `Enquiry for ${data.lead.customer.fullName} moved to My enquiries.`,
      );
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  // Mutation: Update Lead Stage
  const statusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: LeadStatus }) =>
      leadsApi.updateLeadStatus(leadId, status),
    onSuccess: (updated) => {
      showToast(
        "success",
        `Stage updated to ${STAGES.find((stage) => stage.key === updated.status)?.label || "the selected stage"}.`,
      );
      queryClient.invalidateQueries({ queryKey: ["leads", "my-leads"] });
      queryClient.invalidateQueries({
        queryKey: ["leads", selectedLeadId, "activities"],
      });
    },
  });

  // Mutation: Add Internal Note
  const noteMutation = useMutation({
    mutationFn: ({
      leadId,
      note,
      followUpDate,
    }: {
      leadId: string;
      note: string;
      followUpDate?: string;
    }) => leadsApi.addLeadNote(leadId, note, followUpDate),
    onSuccess: () => {
      showToast("success", "Note saved & timeline updated.");
      queryClient.invalidateQueries({ queryKey: ["leads", "my-leads"] });
      queryClient.invalidateQueries({
        queryKey: ["leads", selectedLeadId, "activities"],
      });
    },
  });

  // Filtered "My Leads" with follow-up filter
  const filteredMyLeads = useMemo(() => {
    let list = myLeads;
    if (followUpTodayOnly) {
      list = list.filter((lead) => isFollowUpDue(lead));
    }
    return list;
  }, [myLeads, followUpTodayOnly]);

  // Selected lead object for drawer
  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return (
      myLeads.find((l) => l.id === selectedLeadId) ||
      poolLeads.find((l) => l.id === selectedLeadId) ||
      null
    );
  }, [selectedLeadId, myLeads, poolLeads]);

  const followUpTodayCount = myLeads.filter((lead) =>
    isFollowUpDue(lead),
  ).length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-xs font-medium ${
              toast.type === "success"
                ? "bg-zinc-900 border-zinc-800 text-white"
                : toast.type === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-white border-zinc-200 text-zinc-900"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {toast.type === "error" && (
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-0.5 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="page-heading flex items-center justify-between gap-4">
        <h1>{currentTab === "my-leads" ? "My enquiries" : "All enquiries"}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="button-primary flex items-center gap-1.5"
            onClick={() => setIsAddLeadModalOpen(true)}
          >
            <Plus size={16} aria-hidden="true" />
            <span>Add lead</span>
          </button>
          <button
            className="icon-button"
            aria-label="Refresh enquiries"
            title="Refresh enquiries"
            onClick={() => {
              void refetchPool();
              void refetchMyLeads();
            }}
          >
            <RotateCcw size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: Available enquiries */}
      {currentTab === "pool" && (
        <div className="space-y-4">
          {/* Service Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200/90 shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-700">Service</span>
              <select
                aria-label="Filter enquiries by service"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="text-xs bg-[#F8F8F6] border border-zinc-200 rounded-lg px-2.5 py-1 text-zinc-800 font-medium focus:outline-hidden"
              >
                <option value="">All services</option>
                {services
                  .filter(
                    (service) =>
                      manager ||
                      user?.services?.some(
                        (mapping) => mapping.serviceId === service.id,
                      ),
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Updates automatically</span>
            </div>
          </div>

          {/* Pool Leads Listing */}
          {isLoadingPool ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mx-auto" />
              <p className="text-xs text-zinc-500 mt-2">Loading enquiries…</p>
            </div>
          ) : poolError ? (
            <div className="notice notice-error" role="alert">
              <p>
                {userMessage(
                  poolError,
                  "We couldn't load the enquiries. Please try again.",
                )}
              </p>
              <button
                className="button-secondary mt-3"
                onClick={() => void refetchPool()}
              >
                Try again
              </button>
            </div>
          ) : poolLeads.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
              <div className="w-10 h-10 rounded-full bg-[#F6F6F3] border border-zinc-200 flex items-center justify-center mx-auto text-zinc-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-medium text-zinc-900 mt-3">
                No enquiries yet
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Enquiries for your assigned services will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {poolLeads.map((lead) => {
                const isClaiming =
                  claimMutation.isPending &&
                  claimMutation.variables === lead.id;

                return (
                  <div
                    key={lead.id}
                    className={`border rounded-xl p-5 transition flex flex-col justify-between ${lead.assignedToId ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-white border-zinc-200 shadow-xs hover:border-zinc-300"}`}
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Service tag & timestamp */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#F6F6F3] border border-zinc-200 text-zinc-700 font-medium">
                          {lead.serviceName}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(lead.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Customer Name & masked contact */}
                      <div>
                        <h3 className="text-base font-medium text-zinc-900">
                          {lead.customer.fullName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          {lead.customer.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-zinc-400" />
                              {lead.customer.city}
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-zinc-400">
                            {lead.customer.phone.replace(
                              /(\d{5})\d{5}/,
                              "$1 •••••",
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Tour Package Requirement */}
                      {lead.packageTitle && (
                        <div className="p-2.5 rounded-lg bg-[#F8F8F6] border border-zinc-100 text-xs">
                          <span className="text-[10px] font-mono text-zinc-400 block">
                            Requested Tour:
                          </span>
                          <span className="font-medium text-zinc-800">
                            {lead.packageTitle}
                          </span>
                        </div>
                      )}

                      {/* Travel Spec Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-zinc-600">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">
                          <Users className="w-3 h-3 text-zinc-400" />
                          {lead.numberOfAdults} adults
                          {lead.numberOfKids > 0
                            ? `, ${lead.numberOfKids} children`
                            : ""}
                        </span>

                        {lead.travelDate && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            {new Date(lead.travelDate).toLocaleDateString()}
                          </span>
                        )}

                        {lead.estimatedBudget && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">
                            ₹{lead.estimatedBudget.toLocaleString("en-IN")}
                          </span>
                        )}

                        <span className="text-[10px] text-zinc-400 ml-auto">
                          via {lead.source.toLowerCase().replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action: "Take enquiry" button */}
                    <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">
                        {lead.assignedToId
                          ? `Taken by ${lead.assignedToName || "a staff member"}`
                          : "Not assigned"}
                      </span>

                      <button
                        onClick={() => claimMutation.mutate(lead.id)}
                        disabled={isClaiming || !!lead.assignedToId}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 disabled:opacity-50 text-xs font-medium transition shadow-xs"
                      >
                        {isClaiming ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span>
                          {lead.assignedToId
                            ? lead.assignedToId === user?.id
                              ? "Assigned to you"
                              : "Already taken"
                            : "Take enquiry"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: My enquiries */}
      {currentTab === "my-leads" && (
        <div className="space-y-4">
          <div className="enquiry-toolbar">
            <div className="relative flex-1 min-w-0">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                aria-label="Search enquiries"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search name or phone"
                className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white"
              />
            </div>
            <select
              aria-label="Enquiry stage filter"
              value={selectedStage}
              onChange={(event) => setSelectedStage(event.target.value)}
            >
              {STAGES.map((stage) => (
                <option key={stage.key} value={stage.key}>
                  {stage.key === "ALL" ? "Any stage" : stage.label}
                </option>
              ))}
            </select>
            <button
              className={`button-secondary ${followUpTodayOnly ? "due-filter-selected" : ""}`}
              aria-pressed={followUpTodayOnly}
              onClick={() => setFollowUpTodayOnly(!followUpTodayOnly)}
            >
              <Clock size={15} aria-hidden="true" />
              Follow-ups due
              {!isLoadingMyLeads && !myLeadsError && followUpTodayCount > 0
                ? ` (${followUpTodayCount})`
                : ""}
            </button>
          </div>

          {isLoadingMyLeads ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mx-auto" />
              <p className="text-xs text-zinc-500 mt-2">Loading enquiries…</p>
            </div>
          ) : myLeadsError ? (
            <div className="notice notice-error" role="alert">
              <p>
                {userMessage(
                  myLeadsError,
                  "We couldn't load your enquiries. Please try again.",
                )}
              </p>
              <button
                className="button-secondary mt-3"
                onClick={() => void refetchMyLeads()}
              >
                Try again
              </button>
            </div>
          ) : filteredMyLeads.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
              <div className="w-10 h-10 rounded-full bg-[#F6F6F3] border border-zinc-200 flex items-center justify-center mx-auto text-zinc-400">
                <Inbox className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-zinc-900 mt-3">
                No matching enquiries
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Try another filter or choose an available enquiry.
              </p>
              <button
                onClick={() => setTab("pool")}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition shadow-xs"
              >
                <span>View available</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden shadow-xs">
              {mobile ? (
                <div className="mobile-enquiry-list">
                  {filteredMyLeads.map((lead) => (
                    <EnquiryCard
                      key={lead.id}
                      lead={lead}
                      onOpen={() => setSelectedLeadId(lead.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="enquiry-desktop-table overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F8F6] border-b border-zinc-200/90 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Service / Package</th>
                        <th className="py-3 px-4">Stage</th>
                        <th className="py-3 px-4">Follow-Up</th>
                        <th className="py-3 px-4">Direct Contact</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredMyLeads.map((lead) => {
                        const cleanPhone = lead.customer.phone.replace(
                          /[^0-9]/g,
                          "",
                        );
                        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hello ${lead.customer.fullName}, this is Flyora Travels regarding your ${
                            lead.packageTitle || lead.serviceName
                          } enquiry.`,
                        )}`;

                        const isFollowUpDueToday =
                          lead.followUpDate &&
                          new Date(lead.followUpDate).toDateString() ===
                            new Date().toDateString();

                        return (
                          <tr
                            key={lead.id}
                            className="hover:bg-[#FBFBFA] transition cursor-pointer"
                            onClick={() => setSelectedLeadId(lead.id)}
                          >
                            {/* Customer */}
                            <td className="py-3 px-4">
                              <p className="font-medium text-zinc-900">
                                {lead.customer.fullName}
                              </p>
                              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                                {lead.customer.phone}
                              </p>
                            </td>

                            {/* Service */}
                            <td className="py-3 px-4">
                              <span className="font-medium text-zinc-800 block">
                                {lead.serviceName}
                              </span>
                              {lead.packageTitle && (
                                <span className="text-[11px] text-zinc-500 block truncate max-w-[200px]">
                                  {lead.packageTitle}
                                </span>
                              )}
                            </td>

                            {/* Stage */}
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-zinc-100 text-zinc-700">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    lead.status === "BOOKED"
                                      ? "bg-emerald-500"
                                      : lead.status === "CONTACTED"
                                        ? "bg-amber-500"
                                        : lead.status === "QUOTED"
                                          ? "bg-purple-500"
                                          : lead.status === "NEGOTIATING"
                                            ? "bg-indigo-500"
                                            : lead.status === "NEW"
                                              ? "bg-blue-500"
                                              : "bg-zinc-400"
                                  }`}
                                />
                                {lead.status}
                              </span>
                            </td>

                            {/* Follow-up */}
                            <td className="py-3 px-4 font-mono text-[11px]">
                              {lead.followUpDate ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${
                                    isFollowUpDueToday
                                      ? "bg-amber-100 text-amber-800 font-semibold"
                                      : "text-zinc-600"
                                  }`}
                                >
                                  <Clock className="w-3 h-3 text-zinc-400" />
                                  {new Date(
                                    lead.followUpDate,
                                  ).toLocaleDateString()}
                                  {isFollowUpDueToday && " (Due)"}
                                </span>
                              ) : (
                                <span className="text-zinc-400">—</span>
                              )}
                            </td>

                            {/* Direct Contact Buttons */}
                            <td
                              className="py-3 px-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${cleanPhone}`}
                                  title={`Call ${lead.customer.phone}`}
                                  className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition border border-emerald-200"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Open WhatsApp chat"
                                  className="p-1.5 rounded-md text-zinc-700 hover:bg-zinc-100 transition border border-zinc-200"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                </a>
                              </div>
                            </td>

                            {/* Action Button */}
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLeadId(lead.id);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-600 hover:text-black hover:bg-zinc-100 transition"
                              >
                                <span>Details</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Slide-over Action Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        activities={leadActivities}
        activityUnavailable={!!activitiesError}
        onRetryActivities={() => void refetchActivities()}
        isOpen={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onChanged={() => {
          void queryClient.invalidateQueries({ queryKey: ["leads"] });
          void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        }}
        onUpdateStatus={async (newStatus) => {
          if (!selectedLeadId) return;
          await statusMutation.mutateAsync({
            leadId: selectedLeadId,
            status: newStatus,
          });
        }}
        onAddNote={async (note, followUpDate) => {
          if (!selectedLeadId) return;
          await noteMutation.mutateAsync({
            leadId: selectedLeadId,
            note,
            followUpDate,
          });
        }}
      />

      {/* Manual Lead Creation Modal */}
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onSuccess={(lead) => {
          showToast(
            "success",
            `Enquiry for ${lead.customer.fullName} added and assigned to you.`,
          );
          setTab("my-leads");
          void queryClient.invalidateQueries({ queryKey: ["leads"] });
          void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        }}
        services={services}
        defaultServiceId={selectedServiceId || undefined}
      />
    </div>
  );
};
