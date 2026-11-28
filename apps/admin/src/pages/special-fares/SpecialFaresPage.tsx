import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SpecialFareAdminDetail, SpecialFareStatus } from "@flyora/types";
import { useAuthStore } from "../../stores/authStore";
import { specialFaresApi } from "../../lib/specialFaresApi";
import { SpecialFareDrawer } from "../../components/special-fares/SpecialFareDrawer";
import { BulkUploadModal } from "../../components/special-fares/BulkUploadModal";
import { Modal, FormError } from "../../components/ui/Modal";
import { userMessage } from "../../lib/userMessage";
import {
  PlaneTakeoff,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Luggage,
  AlertTriangle,
  Minus,
  Upload,
} from "lucide-react";

const STATUS_TABS: Array<{ label: string; value: SpecialFareStatus | "ALL" }> =
  [
    { label: "All Deals", value: "ALL" },
    { label: "Active", value: "ACTIVE" },
    { label: "Sold Out", value: "SOLD_OUT" },
    { label: "Paused", value: "PAUSED" },
    { label: "Expired", value: "EXPIRED" },
  ];

export function SpecialFaresPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canEdit =
    !!user && ["SUPER_ADMIN", "OPERATIONS_MANAGER"].includes(user.role);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SpecialFareStatus | "ALL">(
    "ALL",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editingTicket, setEditingTicket] =
    useState<SpecialFareAdminDetail | null>(null);
  const [ticketToDelete, setTicketToDelete] =
    useState<SpecialFareAdminDetail | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [updatingSeatId, setUpdatingSeatId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "special-fares",
      statusFilter === "ALL" ? undefined : statusFilter,
    ],
    queryFn: () =>
      specialFaresApi.listAdminSpecialFares({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        limit: 100,
      }),
  });

  const allItems = data?.items || [];

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.originCity.toLowerCase().includes(q) ||
        item.originCode.toLowerCase().includes(q) ||
        item.destinationCity.toLowerCase().includes(q) ||
        item.destinationCode.toLowerCase().includes(q) ||
        item.airlineName.toLowerCase().includes(q) ||
        (item.flightNumber || "").toLowerCase().includes(q) ||
        (item.pnrNumber || "").toLowerCase().includes(q),
    );
  }, [allItems, searchQuery]);

  // Top Dashboard Metrics
  const metrics = useMemo(() => {
    const now = Date.now();
    const in24Hours = now + 24 * 60 * 60 * 1000;

    let activeCount = 0;
    let totalSeatsRemaining = 0;
    let expiringSoon = 0;
    let potentialMargin = 0;

    for (const item of allItems) {
      const expTime = new Date(item.expiresAt).getTime();
      const depTime = new Date(item.departureDate).getTime();
      const effectiveExp = Math.min(expTime, depTime);
      if (item.isActive && item.status === "ACTIVE" && effectiveExp > now) {
        activeCount += 1;
        totalSeatsRemaining += item.availableSeats;
        if (effectiveExp <= in24Hours) {
          expiringSoon += 1;
        }
        if (item.marginAmount && item.marginAmount > 0) {
          potentialMargin += item.marginAmount * item.availableSeats;
        }
      }
    }

    return { activeCount, totalSeatsRemaining, expiringSoon, potentialMargin };
  }, [allItems]);

  // 1-Click Seat Adjustment Mutation
  const seatMutation = useMutation({
    mutationFn: async ({ id, change }: { id: string; change: number }) => {
      setUpdatingSeatId(id);
      return specialFaresApi.updateSeats(id, { change });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["special-fares"] });
      showToast("Seat inventory updated.");
    },
    onError: (err: any) => {
      showToast(userMessage(err, "Failed to update seat count."));
    },
    onSettled: () => {
      setUpdatingSeatId(null);
    },
  });

  // Quick Visibility Toggle Mutation
  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      setTogglingId(id);
      return specialFaresApi.toggleStatus(id);
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["special-fares"] });
      showToast(
        res.isActive
          ? "Special fare published to public website."
          : "Special fare hidden from public view.",
      );
    },
    onError: (err: any) => {
      showToast(userMessage(err, "Failed to toggle visibility."));
    },
    onSettled: () => {
      setTogglingId(null);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => specialFaresApi.deleteSpecialFare(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["special-fares"] });
      setTicketToDelete(null);
      setDeleteError(null);
      showToast("Allotment archived from public inventory.");
    },
    onError: (err: any) => {
      setDeleteError(
        userMessage(err, "Could not archive allotment. Please try again."),
      );
    },
  });

  const formatCountdown = (expiresAtIso: string, departureDateIso: string) => {
    const effectiveEndMs = Math.min(
      new Date(expiresAtIso).getTime(),
      new Date(departureDateIso).getTime(),
    );
    const diffMs = effectiveEndMs - Date.now();
    if (diffMs <= 0) return { label: "Expired", urgent: true, expired: true };
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 24) {
      return {
        label: `In ${hours}h`,
        urgent: true,
        expired: false,
      };
    }
    return {
      label: `In ${days}d`,
      urgent: days <= 2,
      expired: false,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            Special Fare Inventory
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage contracted group airline allotments, live seat availability,
            margins, and auto-expiry timings.
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setBulkUploadOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Sheet (CSV)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingTicket(null);
                setDrawerOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#002f89] hover:bg-[#00246b] text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Allotment</span>
            </button>
          </div>
        )}
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
            <span className="font-medium">Active Allotments</span>
            <PlaneTakeoff className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">
            {metrics.activeCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Live & visible on website
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
            <span className="font-medium">Seats Remaining</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">
            {metrics.totalSeatsRemaining}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Across active sector blocks
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
            <span className="font-medium">Expiring in 24 Hours</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                metrics.expiringSoon > 0 ? "text-amber-500" : "text-zinc-400"
              }`}
            />
          </div>
          <div className="text-2xl font-bold text-zinc-900">
            {metrics.expiringSoon}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Needs quick clearance push
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
            <span className="font-medium">Potential Batch Margin</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            ₹{metrics.potentialMargin.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Profit on remaining seats
          </p>
        </div>
      </div>

      {/* Filters & Status Tabs */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.value
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-zinc-600 hover:bg-zinc-100 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search route, airline, IATA, PNR..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-zinc-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-700" />
            <span className="text-xs">Loading special fare inventory...</span>
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-xs text-rose-600">
              Unable to load special fare inventory.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-3 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <PlaneTakeoff className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-sm font-medium text-zinc-900">
              No special fare allotments found
            </p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Add bulk contracted flight tickets to display exclusive offers to
              searching visitors and capture high-intent flight leads.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="py-3 px-4">Route & Airline</th>
                  <th className="py-3 px-4">Schedule & Expiry</th>
                  <th className="py-3 px-4">Baggage</th>
                  <th className="py-3 px-4 text-center">Live Seats</th>
                  <th className="py-3 px-4">Pricing & Margin</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredItems.map((ticket) => {
                  const countdown = formatCountdown(
                    ticket.expiresAt,
                    ticket.departureDate,
                  );
                  const isExpired =
                    ticket.status === "EXPIRED" || countdown.expired;
                  const isSeatBusy = updatingSeatId === ticket.id;
                  const isToggleBusy = togglingId === ticket.id;

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-zinc-50/70 transition-colors"
                    >
                      {/* Route & Airline */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-bold text-zinc-900 text-[13px]">
                          <span>{ticket.originCode}</span>
                          <span className="text-zinc-400 font-normal">➔</span>
                          <span>{ticket.destinationCode}</span>
                          {ticket.flightNumber && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded">
                              {ticket.flightNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {ticket.originCity} to {ticket.destinationCity} ·{" "}
                          <span className="font-medium text-zinc-700">
                            {ticket.airlineName}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {ticket.pnrNumber && (
                            <span className="text-[10px] font-mono text-blue-700">
                              PNR: {ticket.pnrNumber}
                            </span>
                          )}
                          {ticket.rbd && (
                            <span className="text-[10px] font-mono px-1 bg-zinc-100 text-zinc-600 rounded">
                              RBD: {ticket.rbd}
                            </span>
                          )}
                          {ticket.cabinClass &&
                            ticket.cabinClass !== "ECONOMY" && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                                {ticket.cabinClass.replace("_", " ")}
                              </span>
                            )}
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                              ticket.isRefundable
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            {ticket.isRefundable ? "Refundable" : "Non-Ref"}
                          </span>
                        </div>
                      </td>

                      {/* Schedule & Expiry */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-zinc-800">
                          {new Date(ticket.departureDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}{" "}
                          <span className="text-zinc-500 font-normal">
                            {new Date(ticket.departureDate).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              countdown.expired
                                ? "bg-zinc-100 text-zinc-500"
                                : countdown.urgent
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {countdown.expired
                              ? "Expired"
                              : `Expires ${countdown.label}`}
                          </span>
                        </div>
                      </td>

                      {/* Baggage */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-100 text-zinc-700 text-[11px]">
                          <Luggage className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span>{ticket.baggageInfo}</span>
                        </div>
                      </td>

                      {/* 1-Click Live Seat Counter */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                          <button
                            type="button"
                            disabled={isSeatBusy || ticket.availableSeats <= 0}
                            onClick={() =>
                              seatMutation.mutate({
                                id: ticket.id,
                                change: -1,
                              })
                            }
                            aria-label="Decrease seats"
                            className="w-6 h-6 rounded flex items-center justify-center bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span
                            className={`min-w-[44px] font-bold text-xs ${
                              ticket.availableSeats <= 3
                                ? "text-rose-600"
                                : "text-zinc-900"
                            }`}
                          >
                            {isSeatBusy ? (
                              <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                            ) : (
                              `${ticket.availableSeats} / ${ticket.totalSeats}`
                            )}
                          </span>

                          <button
                            type="button"
                            disabled={
                              isSeatBusy ||
                              ticket.availableSeats >= ticket.totalSeats
                            }
                            onClick={() =>
                              seatMutation.mutate({
                                id: ticket.id,
                                change: 1,
                              })
                            }
                            aria-label="Increase seats"
                            className="w-6 h-6 rounded flex items-center justify-center bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Pricing & Margin */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-700 text-[13px]">
                            ₹{ticket.farePerSeat.toLocaleString("en-IN")}
                          </span>
                          {ticket.originalFare &&
                            ticket.originalFare > ticket.farePerSeat && (
                              <span className="text-[11px] font-medium text-rose-600 line-through">
                                ₹{ticket.originalFare.toLocaleString("en-IN")}
                              </span>
                            )}
                        </div>
                        {ticket.supplierCost !== null &&
                          ticket.supplierCost !== undefined && (
                            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                              <span>
                                Cost: ₹
                                {ticket.supplierCost.toLocaleString("en-IN")}
                              </span>
                              {ticket.marginPercent !== null && (
                                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium text-[10px]">
                                  +{ticket.marginPercent}%
                                </span>
                              )}
                            </div>
                          )}
                      </td>

                      {/* Status & Visibility Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={!canEdit || isToggleBusy || isExpired}
                          onClick={() => toggleMutation.mutate(ticket.id)}
                          title={
                            isExpired
                              ? "Expired (edit departure/expiry to reactivate)"
                              : ticket.status === "PAUSED"
                                ? "Archived (click to restore)"
                                : ticket.isActive
                                  ? "Visible on website (click to hide)"
                                  : "Hidden from public (click to publish)"
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer disabled:cursor-default ${
                            isExpired
                              ? "bg-zinc-100 text-zinc-600 border-zinc-200"
                              : ticket.status === "SOLD_OUT"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : ticket.status === "PAUSED"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : ticket.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          }`}
                        >
                          {isToggleBusy ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : !isExpired && ticket.isActive ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>
                            {isExpired
                              ? "Expired"
                              : ticket.status === "SOLD_OUT"
                                ? "Sold Out"
                                : ticket.status === "PAUSED"
                                  ? "Archived"
                                  : ticket.isActive
                                    ? "Live"
                                    : "Hidden"}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTicket(ticket);
                                setDrawerOpen(true);
                              }}
                              aria-label="Edit allotment"
                              className="p-1.5 text-zinc-400 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError(null);
                                setTicketToDelete(ticket);
                              }}
                              aria-label="Archive allotment"
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Drawer */}
      <SpecialFareDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingTicket(null);
        }}
        initialData={editingTicket}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Bulk CSV / Excel Sheet Upload Modal */}
      <BulkUploadModal
        isOpen={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <Modal
          busy={deleteMutation.isPending}
          title="Archive Special Fare Allotment"
          description={`Archive ${ticketToDelete.originCode} ➔ ${ticketToDelete.destinationCode} (${ticketToDelete.airlineName})? It will be removed from public inventory but retained for history and can be restored.`}
          onClose={() => setTicketToDelete(null)}
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setTicketToDelete(null)}
                className="button-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(ticketToDelete.id)}
                className="button-primary button-danger cursor-pointer"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>Archive Allotment</span>
              </button>
            </div>
          }
        >
          {deleteError && <FormError>{deleteError}</FormError>}
          <p className="text-xs text-zinc-600">
            Any existing leads already generated from this deal will remain
            safely in the CRM leads pool.
          </p>
        </Modal>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 bg-[#002f89] text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
