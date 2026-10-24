import React, { useState, useRef } from "react";
import type { BookingRecord, PaymentMethod, PaymentRecord } from "./types";
import { bookingsApi } from "./bookingsApi";
import { receiptContentType } from "./receiptUpload";
import { formatINR } from "./paymentCalculator";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  FileUp,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRecord;
  onPaymentRecorded?: (payment: PaymentRecord) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentRecorded,
}) => {
  const [amount, setAmount] = useState<string>(() =>
    booking.dueAmount > 0 ? String(booking.dueAmount) : "",
  );
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState<string>("");

  // Receipt upload state
  const [receiptFileKey, setReceiptFileKey] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInFlight = useRef(false);
  const submitInFlight = useRef(false);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const isOverDue = numAmount > booking.dueAmount;

  // Preset quick fill shortcuts
  const handleQuickPreset = (val: number) => {
    setAmount(String(Math.round(val)));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFileUpload(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFileUpload(file);
  };

  const processFileUpload = async (file: File) => {
    if (uploadInFlight.current || submitInFlight.current) return;
    setUploadError(null);
    setReceiptFileKey("");
    setReceiptFileName("");
    try {
      receiptContentType(file);
    } catch (error) {
      setUploadError((error as Error).message);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    uploadInFlight.current = true;
    setIsUploadingFile(true);
    try {
      const res = await bookingsApi.uploadReceiptSlip(file);
      setReceiptFileKey(res.fileKey);
      setReceiptFileName(file.name);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload receipt slip. Please try again.",
      );
    } finally {
      uploadInFlight.current = false;
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = () => {
    setReceiptFileKey("");
    setReceiptFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitInFlight.current || uploadInFlight.current) return;
    setErrorMessage(null);

    if (numAmount <= 0) {
      setErrorMessage("Payment amount must be greater than zero.");
      return;
    }

    if (!transactionRef.trim()) {
      setErrorMessage("Transaction reference or Bank UTR is required.");
      return;
    }
    if (transactionRef.trim().length < 3) {
      setErrorMessage(
        "Transaction reference must contain at least 3 characters.",
      );
      return;
    }
    if (!paymentDate || !Number.isFinite(Date.parse(paymentDate))) {
      setErrorMessage("Choose a valid payment date.");
      return;
    }

    if (!receiptFileKey) {
      setErrorMessage(
        "Please attach a payment receipt or bank slip proof for accounts verification.",
      );
      return;
    }

    submitInFlight.current = true;
    setIsSubmitting(true);
    try {
      const payment = await bookingsApi.recordPayment(booking.id, {
        amount: numAmount,
        method,
        transactionRef: transactionRef.trim(),
        receiptFileKey,
        paymentDate,
        notes: notes.trim() || undefined,
      });

      if (onPaymentRecorded) {
        onPaymentRecorded(payment);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to record payment. Please try again.",
      );
    } finally {
      submitInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150">
          <form onSubmit={handleSubmit} noValidate>
            {/* Header */}
            <div className="px-6 py-5 bg-[#FAFAF9] border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900">
                    Record Offline Payment
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono">
                    {booking.bookingRef} • {booking.customerName}
                  </p>
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

            {/* Financial Overview Gauge */}
            <div className="px-6 py-3.5 bg-[#F8F8F6] border-b border-zinc-200 grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-400 block font-sans uppercase">
                  Total Package
                </span>
                <span className="font-semibold text-zinc-900">
                  {formatINR(booking.totalAmount)}
                </span>
              </div>
              <div className="border-x border-zinc-200">
                <span className="text-[10px] text-zinc-400 block font-sans uppercase">
                  Verified Paid
                </span>
                <span className="font-semibold text-emerald-700">
                  {formatINR(booking.paidAmount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-sans uppercase">
                  Outstanding Due
                </span>
                <span className="font-bold text-amber-700">
                  {formatINR(booking.dueAmount)}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-4">
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs"
                >
                  {errorMessage}
                </div>
              )}

              {/* Amount & Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-800">
                    Payment Amount (₹) *
                  </label>
                  {booking.dueAmount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickPreset(booking.dueAmount)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
                      >
                        Full Due ({formatINR(booking.dueAmount)})
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickPreset(booking.dueAmount * 0.5)
                        }
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
                      >
                        50% Due
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-zinc-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs font-mono pl-7 pr-3 py-2 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black"
                  />
                </div>

                {isOverDue && (
                  <span className="text-[10px] text-amber-700 block mt-1 font-mono">
                    ⚠️ Notice: Entered amount exceeds outstanding due balance (
                    {formatINR(booking.dueAmount)}).
                  </span>
                )}
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-800 block mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black bg-white"
                  >
                    <option value="UPI">
                      UPI Transfer (GPay / PhonePe / Paytm)
                    </option>
                    <option value="BANK_TRANSFER_NEFT_IMPS">
                      Bank Transfer (NEFT / IMPS / RTGS)
                    </option>
                    <option value="CASH">Cash Deposit at Counter</option>
                    <option value="CREDIT_DEBIT_OFFLINE">
                      Credit / Debit Card (Offline Machine)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-800 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full text-xs font-mono p-2 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Transaction Reference / Bank UTR */}
              <div>
                <label className="text-xs font-semibold text-zinc-800 block mb-1">
                  Transaction Reference / UTR Number *
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI/528391823901 or HDFC92849182"
                  className="w-full text-xs font-mono p-2 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-zinc-400"
                />
                <span className="text-[10px] text-zinc-400 block mt-1">
                  Required for accounts reconciliation with the company bank
                  statement
                </span>
              </div>

              {/* Receipt File Dropzone (R2 Private Storage) */}
              <div>
                <label className="text-xs font-semibold text-zinc-800 block mb-1.5 flex items-center justify-between">
                  <span>Payment Slip / Bank Receipt Proof *</span>
                  <span className="text-[10px] font-mono text-zinc-400 font-normal">
                    Cloudflare R2 Private Bucket
                  </span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  aria-label="Payment receipt"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!receiptFileKey ? (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-disabled={isUploadingFile || isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (!uploadInFlight.current && !submitInFlight.current)
                          fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!uploadInFlight.current && !submitInFlight.current)
                        fileInputRef.current?.click();
                    }}
                    className="border-2 border-dashed border-zinc-300 hover:border-zinc-500 rounded-xl p-4 text-center cursor-pointer bg-[#FAFAF9] hover:bg-zinc-50 transition space-y-1.5"
                  >
                    {isUploadingFile ? (
                      <div className="py-2 flex items-center justify-center gap-2 text-xs text-zinc-600">
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                        <span>
                          Uploading receipt slip to private storage...
                        </span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-zinc-400 mx-auto stroke-[1.5]" />
                        <p className="text-xs font-medium text-zinc-800">
                          Click to upload or drag & drop slip proof
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          PNG, JPG, or PDF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-900 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-xs truncate">
                        {receiptFileName || receiptFileKey}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 rounded text-emerald-700 hover:text-rose-700 hover:bg-emerald-100 transition"
                      title="Remove slip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {uploadError && (
                  <span
                    role="alert"
                    className="text-[10px] text-rose-600 block mt-1"
                  >
                    {uploadError}
                  </span>
                )}
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-xs font-semibold text-zinc-800 block mb-1">
                  Internal Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Customer sent screenshot via WhatsApp from Axis Bank account..."
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-zinc-400 resize-none"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-6 py-4 bg-[#FAFAF9] border-t border-zinc-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-black hover:bg-zinc-200/60 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isUploadingFile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Recording Payment...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Record & Submit for Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
