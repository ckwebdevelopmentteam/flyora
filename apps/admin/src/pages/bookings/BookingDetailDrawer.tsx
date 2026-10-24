import React, { useState } from "react";
import type { BookingRecord, PaymentRecord, BookingStatus } from "./types";
import {
  calculateBookingFinancials,
  formatINR,
  formatPaymentMethod,
} from "./paymentCalculator";
import { bookingsApi } from "./bookingsApi";
import { ReplaceReceiptButton } from "./ReplaceReceiptButton";
import { useAuthStore } from "../../stores/authStore";
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Users,
  X,
} from "lucide-react";

interface BookingDetailDrawerProps {
  booking: BookingRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPaymentClick?: () => void;
  onPaymentVerified?: () => void;
}

const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; dotClass: string; bgClass: string; textClass: string }
> = {
  CONFIRMED: {
    label: "Confirmed",
    dotClass: "bg-emerald-500",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
  },
  IN_PROGRESS: {
    label: "In Progress",
    dotClass: "bg-blue-500",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
  },
  COMPLETED: {
    label: "Completed",
    dotClass: "bg-purple-500",
    bgClass: "bg-purple-50",
    textClass: "text-purple-700",
  },
  CANCELLED: {
    label: "Cancelled",
    dotClass: "bg-zinc-400",
    bgClass: "bg-zinc-100",
    textClass: "text-zinc-600",
  },
};

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  booking,
  isOpen,
  onClose,
  onRecordPaymentClick,
  onPaymentVerified,
}) => {
  const user = useAuthStore((state) => state.user);
  const canVerifyPayments =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "OPERATIONS_MANAGER" ||
    user?.role === "ACCOUNTS";

  const [activePaymentTab, setActivePaymentTab] = useState<
    "all" | "pending" | "verified"
  >("all");
  const [verifyingPaymentId, setVerifyingPaymentId] = useState<string | null>(
    null,
  );
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const [isLoadingReceipt, setIsLoadingReceipt] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const financials = calculateBookingFinancials({
    totalAmount: booking.totalAmount,
    payments: booking.payments,
  });

  const statusConfig =
    BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.CONFIRMED;

  const cleanPhone = (booking.customerPhone || "").replace(/[^0-9]/g, "");

  const webBaseUrl =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://flyora.com";

  const publicVoucherUrl = `${webBaseUrl}/booking/${booking.bookingRef}`;

  const whatsAppMessage = `Hello ${booking.customerName || "Valued Traveler"}! Greetings from Flyora Travels.
Here is your official Trip Voucher & Confirmation for ${
    booking.packageTitle || booking.serviceName
  }:
• Reference: ${booking.bookingRef}
• Travel Date: ${new Date(booking.travelDate).toLocaleDateString()}
• Total Package: ${formatINR(financials.totalAmount)}
• Verified Paid: ${formatINR(financials.verifiedPaidAmount)}
• Balance Due: ${formatINR(financials.dueAmount)}

View live Trip Voucher & Itinerary:
${publicVoucherUrl}`;

  const directWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    whatsAppMessage,
  )}`;

  // Handle viewing receipt with presigned URL
  const handleViewReceipt = async (payment: PaymentRecord) => {
    setActionError(null);
    setIsLoadingReceipt(true);
    try {
      const res = await bookingsApi.getReceiptPresignedUrl(payment.id);
      if (res && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Receipt could not be opened. Please try again.",
      );
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  // Verify payment
  const handleVerifyPayment = async (paymentId: string) => {
    setActionError(null);
    setVerifyingPaymentId(paymentId);
    try {
      await bookingsApi.verifyPayment(paymentId, { status: "VERIFIED" });
      if (onPaymentVerified) {
        onPaymentVerified();
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Payment could not be verified. Please try again.",
      );
    } finally {
      setVerifyingPaymentId(null);
    }
  };

  // Reject payment
  const handleRejectPayment = async (paymentId: string) => {
    setActionError(null);
    setVerifyingPaymentId(paymentId);
    try {
      await bookingsApi.verifyPayment(paymentId, {
        status: "REJECTED",
        notes: rejectionReason.trim() || "Payment slip rejected by accounts",
      });
      setRejectingPaymentId(null);
      setRejectionReason("");
      if (onPaymentVerified) {
        onPaymentVerified();
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Payment could not be rejected. Please try again.",
      );
    } finally {
      setVerifyingPaymentId(null);
    }
  };

  const paymentsList = booking.payments || [];
  const filteredPayments = paymentsList.filter((p) => {
    if (activePaymentTab === "pending") return p.status === "PENDING";
    if (activePaymentTab === "verified") return p.status === "VERIFIED";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-zinc-200 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-zinc-200 bg-[#FAFAF9]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-mono ${statusConfig.bgClass} ${statusConfig.textClass}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`}
                    />
                    {statusConfig.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-900">
                    {booking.bookingRef}
                  </span>
                </div>

                <h2 className="text-lg font-medium text-zinc-900 mt-1.5">
                  {booking.customerName}
                </h2>

                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                  {booking.customerCity && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      {booking.customerCity}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    Booked {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Communication & Voucher Actions */}
            {actionError && (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700"
              >
                {actionError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium transition shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ({booking.customerPhone})</span>
                </a>
              )}

              {cleanPhone && (
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Voucher</span>
                </a>
              )}
            </div>

            {/* Public Trip Voucher Link */}
            <a
              href={publicVoucherUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-medium transition"
            >
              <span>Preview Customer Trip Voucher</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            </a>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Financial Overview Gauge Card */}
            <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                  Payment Status
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    financials.paymentStatus === "FULLY_PAID"
                      ? "bg-emerald-100 text-emerald-800"
                      : financials.paymentStatus === "PARTIALLY_PAID"
                        ? "bg-blue-100 text-blue-800"
                        : financials.paymentStatus === "PENDING_VERIFICATION"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {financials.paymentStatus.replace(/_/g, " ")}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">Collected Progress</span>
                  <span className="font-semibold text-zinc-900">
                    {financials.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      financials.isFullyPaid
                        ? "bg-emerald-600"
                        : financials.progressPercent > 0
                          ? "bg-blue-600"
                          : "bg-zinc-300"
                    }`}
                    style={{ width: `${financials.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Key Metrics Breakdown */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans">
                    Total Package
                  </span>
                  <span className="font-bold text-zinc-900">
                    {formatINR(financials.totalAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans">
                    Verified Paid
                  </span>
                  <span className="font-bold text-emerald-700">
                    {formatINR(financials.verifiedPaidAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans">
                    Pending Review
                  </span>
                  <span className="font-semibold text-amber-700">
                    {formatINR(financials.pendingVerificationAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans">
                    Outstanding Due
                  </span>
                  <span
                    className={`font-bold ${
                      financials.dueAmount > 0
                        ? "text-rose-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {formatINR(financials.dueAmount)}
                  </span>
                </div>
              </div>

              {/* Record Payment Action */}
              {onRecordPaymentClick && (
                <button
                  type="button"
                  onClick={onRecordPaymentClick}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Offline Payment</span>
                </button>
              )}
            </div>

            {/* Trip Details Card */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 text-xs">
              <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                Confirmed Trip Itinerary
              </h3>

              <div>
                <span className="text-zinc-400 text-[11px] block">Service</span>
                <p className="font-medium text-zinc-900 mt-0.5">
                  {booking.serviceName}
                </p>
              </div>

              {booking.packageTitle && (
                <div>
                  <span className="text-zinc-400 text-[11px] block">
                    Package
                  </span>
                  <p className="font-medium text-zinc-900 mt-0.5">
                    {booking.packageTitle}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                <div>
                  <span className="text-zinc-400 text-[11px] block">
                    Travel Departure
                  </span>
                  <p className="font-medium text-zinc-900 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {new Date(booking.travelDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <span className="text-zinc-400 text-[11px] block">
                    Travelers / Pax
                  </span>
                  <p className="font-medium text-zinc-900 mt-0.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    {booking.paxCount || 2} Pax
                  </p>
                </div>
              </div>

              {booking.quotationNumber && (
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-zinc-400 text-[11px] block">
                    Original Quotation Ref
                  </span>
                  <span className="font-mono text-zinc-700">
                    #{booking.quotationNumber}
                  </span>
                </div>
              )}

              {booking.notes && (
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-zinc-400 text-[11px] block flex items-center gap-1">
                    <Lock className="w-3 h-3 text-zinc-400" />
                    Staff Notes
                  </span>
                  <p className="text-zinc-600 mt-0.5 bg-[#FAFAF9] p-2 rounded border border-zinc-100 leading-relaxed">
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Payment History & Accounts Verification Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                  Payment History ({paymentsList.length})
                </h3>

                {/* Filter Tabs */}
                {paymentsList.length > 0 && (
                  <div className="flex gap-1 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setActivePaymentTab("all")}
                      className={`px-2 py-0.5 rounded ${
                        activePaymentTab === "all"
                          ? "bg-black text-white"
                          : "text-zinc-500 hover:text-black"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePaymentTab("pending")}
                      className={`px-2 py-0.5 rounded ${
                        activePaymentTab === "pending"
                          ? "bg-amber-600 text-white"
                          : "text-zinc-500 hover:text-black"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePaymentTab("verified")}
                      className={`px-2 py-0.5 rounded ${
                        activePaymentTab === "verified"
                          ? "bg-emerald-600 text-white"
                          : "text-zinc-500 hover:text-black"
                      }`}
                    >
                      Verified
                    </button>
                  </div>
                )}
              </div>

              {paymentsList.length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-dashed border-zinc-300 bg-[#FAFAF9] space-y-2 p-4">
                  <CreditCard className="w-6 h-6 text-zinc-400 mx-auto" />
                  <p className="text-xs font-medium text-zinc-800">
                    No payments recorded yet
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Record advance payments via UPI, NEFT, or Cash with receipt
                    slips.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPayments.map((payment) => {
                    const isPending = payment.status === "PENDING";
                    const isVerified = payment.status === "VERIFIED";
                    const isCurrentlyVerifying =
                      verifyingPaymentId === payment.id;

                    return (
                      <div
                        key={payment.id}
                        className={`p-3.5 rounded-xl border bg-white shadow-2xs space-y-2.5 transition ${
                          isPending
                            ? "border-amber-200"
                            : isVerified
                              ? "border-emerald-200"
                              : "border-rose-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-sm text-zinc-900">
                            {formatINR(payment.amount)}
                          </span>

                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                              isVerified
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isPending
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-600">
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-sans">
                              Method
                            </span>
                            <span>{formatPaymentMethod(payment.method)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-sans">
                              UTR / Reference
                            </span>
                            <span className="truncate block font-semibold text-zinc-800">
                              {payment.transactionRef}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1 border-t border-zinc-100">
                          <span>
                            Date:{" "}
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </span>
                          {payment.recordedByName && (
                            <span className="truncate">
                              By: {payment.recordedByName}
                            </span>
                          )}
                        </div>

                        {payment.notes && (
                          <p className="text-[11px] text-zinc-600 bg-zinc-50 p-2 rounded font-sans">
                            {payment.notes}
                          </p>
                        )}

                        {/* View Presigned Receipt & Accounts Verification */}
                        {isPending && (
                          <ReplaceReceiptButton
                            paymentId={payment.id}
                            transactionRef={payment.transactionRef}
                            onReplaced={onPaymentVerified}
                            onError={setActionError}
                          />
                        )}
                        <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewReceipt(payment)}
                            disabled={isLoadingReceipt}
                            className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-black font-medium transition"
                          >
                            <FileText className="w-3.5 h-3.5 text-zinc-400" />
                            <span>View Receipt Slip</span>
                          </button>

                          {/* Accounts / Admin Verification Actions */}
                          {canVerifyPayments && isPending && (
                            <div className="flex items-center gap-1.5">
                              {rejectingPaymentId === payment.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    placeholder="Reason..."
                                    value={rejectionReason}
                                    onChange={(e) =>
                                      setRejectionReason(e.target.value)
                                    }
                                    className="text-xs p-1 rounded border border-zinc-300 w-24"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRejectPayment(payment.id)
                                    }
                                    className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-semibold hover:bg-rose-700"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectingPaymentId(null)}
                                    className="text-[10px] text-zinc-500 px-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRejectingPaymentId(payment.id)
                                    }
                                    disabled={isCurrentlyVerifying}
                                    className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition"
                                  >
                                    Reject
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleVerifyPayment(payment.id)
                                    }
                                    disabled={isCurrentlyVerifying}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                                  >
                                    {isCurrentlyVerifying ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    <span>Verify</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
