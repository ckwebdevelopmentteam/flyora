import { useSearchParams } from "react-router-dom";
import { userMessage } from "../../lib/userMessage";
import React, { useState, useEffect } from "react";
import type {
  BookingRecord,
  BookingStatus,
  PaymentCalculatedStatus,
} from "./types";
import { bookingsApi } from "./bookingsApi";
import { calculateBookingFinancials, formatINR } from "./paymentCalculator";
import { BookingDetailDrawer } from "./BookingDetailDrawer";
import { RecordPaymentModal } from "./RecordPaymentModal";
import {
  Calendar,
  Clock,
  Compass,
  CreditCard,
  ExternalLink,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">(
    "ALL",
  );
  const [searchParams, setSearchParams] = useSearchParams();
  type PaymentFilter = PaymentCalculatedStatus | "ALL" | "NEEDS_REVIEW";
  const requestedFilter = searchParams.get("payment");
  const paymentFilter: PaymentFilter =
    requestedFilter === "review"
      ? "NEEDS_REVIEW"
      : ["FULLY_PAID", "PARTIALLY_PAID", "UNPAID"].includes(
            requestedFilter || "",
          )
        ? (requestedFilter as PaymentFilter)
        : "ALL";
  const setPaymentFilter = (value: PaymentFilter) =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value === "ALL") next.delete("payment");
      else next.set("payment", value === "NEEDS_REVIEW" ? "review" : value);
      return next;
    });

  // Drawers & Modals
  const [selectedBookingForDrawer, setSelectedBookingForDrawer] =
    useState<BookingRecord | null>(null);
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState<BookingRecord | null>(null);

  const loadBookings = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await bookingsApi.fetchBookings({
        status: statusFilter,
        search: searchQuery,
      });
      setBookings(data);
    } catch (error) {
      setLoadError(
        userMessage(error, "Bookings could not be loaded. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, [statusFilter]);

  // Handle client-side search & payment status filter
  const filteredBookings = bookings.filter((b) => {
    const financials = calculateBookingFinancials({
      totalAmount: b.totalAmount,
      payments: b.payments,
    });

    if (paymentFilter === "NEEDS_REVIEW") {
      if (!b.payments?.some((payment) => payment.status === "PENDING"))
        return false;
    } else if (
      paymentFilter !== "ALL" &&
      financials.paymentStatus !== paymentFilter
    )
      return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        b.bookingRef.toLowerCase().includes(q) ||
        (b.customerName || "").toLowerCase().includes(q) ||
        (b.customerPhone || "").toLowerCase().includes(q) ||
        (b.serviceName || "").toLowerCase().includes(q) ||
        (b.packageTitle || "").toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Calculate executive aggregate metrics
  const totalBookingsCount = bookings.length;
  const totalRevenueBooked = bookings.reduce(
    (sum, b) => sum + (Number(b.totalAmount) || 0),
    0,
  );
  const totalVerifiedCollected = bookings.reduce((sum, b) => {
    const fin = calculateBookingFinancials({
      totalAmount: b.totalAmount,
      payments: b.payments,
    });
    return sum + fin.verifiedPaidAmount;
  }, 0);
  const totalBalanceDue = Math.max(
    0,
    totalRevenueBooked - totalVerifiedCollected,
  );

  // Sync drawer booking if data changes
  const handleRefresh = async () => {
    await loadBookings();
    if (selectedBookingForDrawer) {
      try {
        const refreshed = await bookingsApi.fetchBookingById(
          selectedBookingForDrawer.id,
        );
        if (refreshed) setSelectedBookingForDrawer(refreshed);
      } catch (error) {
        setLoadError(
          userMessage(error, "Booking details could not be refreshed."),
        );
      }
    }
  };

  const openDetails = async (booking: BookingRecord) => {
    setLoadError(null);
    try {
      const details = await bookingsApi.fetchBookingById(booking.id);
      if (details) setSelectedBookingForDrawer(details);
    } catch (error) {
      setLoadError(userMessage(error, "Booking details could not be loaded."));
    }
  };

  return (
    <div className="space-y-6">
      {loadError && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {loadError}
        </p>
      )}
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Bookings & payments
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage confirmed trips, receipts and customer payments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 shadow-2xs transition"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-zinc-500 ${
              isLoading ? "animate-spin" : ""
            }`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Executive Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Bookings */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              Total Bookings
            </span>
            <Compass className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-zinc-900">
            {isLoading || loadError ? "—" : totalBookingsCount}
          </p>
          <span className="text-[10px] text-zinc-500 mt-1 block">
            Customer trips
          </span>
        </div>

        {/* Card 2: Total Revenue Booked */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              Total Booked
            </span>
            <TrendingUp className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-zinc-900">
            {isLoading || loadError ? "—" : formatINR(totalRevenueBooked)}
          </p>
          <span className="text-[10px] text-zinc-500 mt-1 block">
            Total booking value
          </span>
        </div>

        {/* Card 3: Verified Collected */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              Verified Paid
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700">
            {isLoading || loadError ? "—" : formatINR(totalVerifiedCollected)}
          </p>
          <span className="text-[10px] text-emerald-600 mt-1 block font-mono">
            {isLoading || loadError
              ? "Not available yet"
              : totalRevenueBooked > 0
                ? `${Math.round((totalVerifiedCollected / totalRevenueBooked) * 100)}% collected`
                : "0% collected"}
          </span>
        </div>

        {/* Card 4: Outstanding Due */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              Balance Due
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700">
            {isLoading || loadError ? "—" : formatINR(totalBalanceDue)}
          </p>
          <span className="text-[10px] text-amber-700 mt-1 block">
            Awaiting customer payment
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-3">
        {/* Row 1: Search & Status Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Booking Status Tabs */}
          <div className="flex flex-wrap gap-1">
            {(
              [
                { label: "All Bookings", val: "ALL" },
                { label: "Confirmed", val: "CONFIRMED" },
                { label: "In Progress", val: "IN_PROGRESS" },
                { label: "Completed", val: "COMPLETED" },
                { label: "Cancelled", val: "CANCELLED" },
              ] as const
            ).map((t) => (
              <button
                key={t.val}
                type="button"
                onClick={() => setStatusFilter(t.val)}
                className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                  statusFilter === t.val
                    ? "bg-black text-white shadow-xs"
                    : "text-zinc-600 hover:text-black hover:bg-zinc-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, customer, phone..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Row 2: Payment status Filter Pills */}
        <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10px] font-mono uppercase text-zinc-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Payment status:
          </span>

          {(
            [
              { label: "All Payments", val: "ALL" },
              { label: "Fully Paid", val: "FULLY_PAID" },
              { label: "Partially Paid", val: "PARTIALLY_PAID" },
              { label: "Needs verification", val: "NEEDS_REVIEW" },
              { label: "Unpaid", val: "UNPAID" },
            ] as const
          ).map((p) => (
            <button
              key={p.val}
              type="button"
              onClick={() => setPaymentFilter(p.val)}
              className={`text-[11px] px-2.5 py-1 rounded-md border transition font-mono ${
                paymentFilter === p.val
                  ? "bg-zinc-900 text-white border-zinc-900 font-semibold"
                  : "bg-[#FAFAF9] text-zinc-600 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            <span>Loading confirmed bookings...</span>
          </div>
        ) : loadError && !bookings.length ? (
          <div className="p-8 text-center text-slate-500">
            Bookings are unavailable.{" "}
            <button className="underline" onClick={() => void handleRefresh()}>
              Try again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Compass className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-sm font-medium text-zinc-800">
              No matching bookings found
            </p>
            <p className="text-xs text-zinc-500">
              Open a customer enquiry and confirm their quotation to create a
              booking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF9] border-b border-zinc-200 text-[11px] font-mono text-zinc-400 uppercase">
                <tr>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Service / Tour</th>
                  <th className="px-4 py-3.5">Travel Date</th>
                  <th className="px-4 py-3.5">Collection Progress</th>
                  <th className="px-4 py-3.5">Payment status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredBookings.map((booking) => {
                  const financials = calculateBookingFinancials({
                    totalAmount: booking.totalAmount,
                    payments: booking.payments,
                  });

                  const webBaseUrl =
                    typeof window !== "undefined" &&
                    window.location.hostname === "localhost"
                      ? "http://localhost:3000"
                      : "https://flyora.com";
                  const publicVoucherUrl = `${webBaseUrl}/booking/${booking.bookingRef}`;

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-[#F8F8F6] transition group"
                    >
                      {/* Ref */}
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => void openDetails(booking)}
                          className="font-mono text-xs font-bold text-zinc-900 hover:text-emerald-700 transition"
                        >
                          {booking.bookingRef}
                        </button>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {booking.status}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-zinc-900">
                          {booking.customerName}
                        </p>
                        <span className="text-[11px] text-zinc-500 font-mono block">
                          {booking.customerPhone}
                        </span>
                      </td>

                      {/* Service / Tour */}
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-zinc-800">
                          {booking.packageTitle || booking.serviceName}
                        </p>
                        <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          {booking.paxCount
                            ? `${booking.paxCount} travellers`
                            : "Travellers not specified"}
                        </span>
                      </td>

                      {/* Travel Date */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {new Date(booking.travelDate).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Financials & Progress Meter */}
                      <td className="px-4 py-3.5 min-w-44">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="font-bold text-zinc-900">
                              {formatINR(financials.verifiedPaidAmount)}
                            </span>
                            <span className="text-zinc-400">
                              of {formatINR(financials.totalAmount)}
                            </span>
                          </div>

                          <div className="w-full h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                            <div
                              className={`h-full ${
                                financials.isFullyPaid
                                  ? "bg-emerald-600"
                                  : financials.progressPercent > 0
                                    ? "bg-blue-600"
                                    : "bg-zinc-300"
                              }`}
                              style={{
                                width: `${financials.progressPercent}%`,
                              }}
                            />
                          </div>

                          {financials.dueAmount > 0 ? (
                            <span className="text-[10px] font-mono text-amber-700 block">
                              Due: {formatINR(financials.dueAmount)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-700 block font-semibold">
                              All Paid
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment status Badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                            financials.paymentStatus === "FULLY_PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : financials.paymentStatus === "PARTIALLY_PAID"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : financials.paymentStatus ===
                                    "PENDING_VERIFICATION"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {financials.paymentStatus.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Record Payment Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBookingForPayment(booking)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-[11px] font-medium transition shadow-xs"
                            title="Record manual offline payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Payment</span>
                          </button>

                          {/* View Details Drawer */}
                          <button
                            type="button"
                            onClick={() => void openDetails(booking)}
                            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-[11px] font-medium transition"
                          >
                            Details
                          </button>

                          {/* Voucher Preview Link */}
                          <a
                            href={publicVoucherUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
                            title="Preview Digital Trip Voucher"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
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

      {/* Booking Detail Drawer */}
      {selectedBookingForDrawer && (
        <BookingDetailDrawer
          booking={selectedBookingForDrawer}
          isOpen={Boolean(selectedBookingForDrawer)}
          onClose={() => setSelectedBookingForDrawer(null)}
          onRecordPaymentClick={() => {
            setSelectedBookingForPayment(selectedBookingForDrawer);
          }}
          onPaymentVerified={() => void handleRefresh()}
        />
      )}

      {/* Record Payment Modal */}
      {selectedBookingForPayment && (
        <RecordPaymentModal
          booking={selectedBookingForPayment}
          isOpen={Boolean(selectedBookingForPayment)}
          onClose={() => setSelectedBookingForPayment(null)}
          onPaymentRecorded={() => void handleRefresh()}
        />
      )}
    </div>
  );
};
