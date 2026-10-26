import React, { useState, useRef, useEffect, useId } from "react";
import type { BookingRecord, PaymentMethod, PaymentRecord } from "./types";
import { bookingsApi } from "./bookingsApi";
import { receiptContentType } from "./receiptUpload";
import { formatINR } from "./paymentCalculator";
import {
  ArrowRight,
  Loader2,
  UploadCloud,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Modal, Steps, FormError } from "../../components/ui/Modal";
import { userMessage } from "../../lib/userMessage";

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
  const formId = useId();
  const [step, setStep] = useState(0);
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

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setAmount(booking.dueAmount > 0 ? String(booking.dueAmount) : "");
    setMethod("UPI");
    setTransactionRef("");
    setNotes("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setReceiptFileKey("");
    setReceiptFileName("");
    setUploadError(null);
    setErrorMessage(null);
  }, [isOpen, booking.id]);
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

  const handleDrop = async (e: React.DragEvent<HTMLElement>) => {
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
        userMessage(error, "We couldn't upload the receipt. Please try again."),
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
    if (step < 2) {
      next();
      return;
    }

    if (!Number.isFinite(numAmount) || numAmount <= 0) {
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
        userMessage(err, "We couldn't record this payment. Please try again."),
      );
    } finally {
      submitInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const detailsValid = () => {
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setErrorMessage("Enter a payment amount greater than zero.");
      return false;
    }
    if (transactionRef.trim().length < 3) {
      setErrorMessage(
        "Enter the payment reference or UTR number (at least 3 characters).",
      );
      return false;
    }
    if (!paymentDate || !Number.isFinite(Date.parse(paymentDate))) {
      setErrorMessage("Choose a valid payment date.");
      return false;
    }
    return true;
  };
  const next = () => {
    setErrorMessage(null);
    if (step === 0 && !detailsValid()) return;
    if (step === 1 && !receiptFileKey) {
      setErrorMessage("Please attach a payment receipt before continuing.");
      return;
    }
    setStep((value) => Math.min(2, value + 1));
  };
  const methods: Record<PaymentMethod, string> = {
    UPI: "UPI",
    BANK_TRANSFER_NEFT_IMPS: "Bank transfer",
    CASH: "Cash",
    CREDIT_DEBIT_OFFLINE: "Card payment",
  };
  const busy = isSubmitting || isUploadingFile;
  return (
    <Modal
      title="Record payment"
      description={`${booking.bookingRef} · ${booking.customerName}`}
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <button
            className="button-secondary"
            type="button"
            disabled={busy}
            onClick={() => {
              if (step) {
                setStep(step - 1);
                setErrorMessage(null);
              } else onClose();
            }}
          >
            {step ? "Back" : "Cancel"}
          </button>
          {step < 2 ? (
            <button
              className="button-primary"
              type="button"
              onClick={next}
              disabled={busy}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              form={formId}
              className="button-primary"
              disabled={busy}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit for verification"
              )}
            </button>
          )}
        </>
      }
    >
      <Steps
        labels={["Payment details", "Add receipt", "Review & submit"]}
        current={step}
      />
      <FormError>{errorMessage}</FormError>
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <fieldset disabled={busy} className="space-y-5 min-w-0">
          {step === 0 && (
            <>
              <div className="notice flex justify-between gap-4">
                <span>Balance due</span>
                <strong>{formatINR(booking.dueAmount)}</strong>
              </div>
              <div className="field">
                <label htmlFor="payment-amount">Amount received (₹)</label>
                <input
                  id="payment-amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                />
                {booking.dueAmount > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="button-secondary text-xs"
                      onClick={() => handleQuickPreset(booking.dueAmount)}
                    >
                      Full balance
                    </button>
                    <button
                      type="button"
                      className="button-secondary text-xs"
                      onClick={() => handleQuickPreset(booking.dueAmount * 0.5)}
                    >
                      Half balance
                    </button>
                  </div>
                )}
                {isOverDue && (
                  <small className="text-amber-700">
                    This is more than the balance due. Check the amount before
                    continuing.
                  </small>
                )}
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="payment-method">Payment method</label>
                  <select
                    id="payment-method"
                    value={method}
                    onChange={(event) =>
                      setMethod(event.target.value as PaymentMethod)
                    }
                  >
                    {Object.entries(methods).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="payment-date">Payment date</label>
                  <input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(event) => setPaymentDate(event.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="payment-ref">
                  Payment reference / UTR number
                </label>
                <input
                  id="payment-ref"
                  value={transactionRef}
                  onChange={(event) => setTransactionRef(event.target.value)}
                  placeholder="e.g. UPI/528391823901 or HDFC92849182"
                />
                <small>
                  Find this on the payment confirmation or bank receipt.
                </small>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div>
                <h3 className="font-semibold mb-1">
                  Attach the payment receipt
                </h3>
                <p className="text-sm text-slate-500">
                  Your accounts team will use this to check the payment.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                aria-label="Payment receipt"
                accept="image/png,image/jpeg,application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
              {!receiptFileKey ? (
                <button
                  type="button"
                  className="w-full border-2 border-dashed rounded-lg p-8 text-center hover:border-indigo-400 bg-slate-50"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                >
                  {isUploadingFile ? (
                    <>
                      <Loader2
                        size={24}
                        className="animate-spin mx-auto mb-3"
                      />
                      Uploading receipt…
                    </>
                  ) : (
                    <>
                      <UploadCloud
                        size={26}
                        className="text-indigo-500 mx-auto mb-3"
                      />
                      <span className="block font-medium">
                        Choose a file or drop it here
                      </span>
                      <span className="block text-xs text-slate-500 mt-2">
                        PNG, JPG or PDF · Up to 10 MB
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="notice flex items-center justify-between gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-600 shrink-0"
                  />
                  <span className="truncate flex-1">{receiptFileName}</span>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Remove receipt"
                    onClick={handleRemoveFile}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              <FormError>{uploadError}</FormError>
              <div className="field">
                <label htmlFor="payment-notes">
                  Staff notes <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="payment-notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Anything the accounts team should know"
                />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <dl className="review-list">
                {[
                  ["Customer", booking.customerName],
                  ["Amount received", formatINR(numAmount)],
                  ["Payment method", methods[method]],
                  [
                    "Payment date",
                    new Date(paymentDate).toLocaleDateString("en-GB"),
                  ],
                  ["Reference", transactionRef],
                  ["Receipt", receiptFileName],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              {notes && <div className="notice">{notes}</div>}
              <div className="notice border-indigo-100 bg-indigo-50 text-indigo-900">
                The payment will be marked as pending. The customer's balance
                changes only after your accounts team verifies it.
              </div>
            </>
          )}
        </fieldset>
      </form>
    </Modal>
  );
};
