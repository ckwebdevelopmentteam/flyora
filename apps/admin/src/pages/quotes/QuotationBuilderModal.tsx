import React, { useState, useEffect } from "react";
import type { LeadItem } from "@flyora/types";
import type { QuoteItemFormState, QuotationRecord } from "./types";
import { QuotationLineItemRepeater } from "./QuotationLineItemRepeater";
import { MarginGuardSummaryCard } from "./MarginGuardSummaryCard";
import { InclusionsExclusionsSelector } from "./InclusionsExclusionsSelector";
import { ShareQuoteSuccessModal } from "./ShareQuoteSuccessModal";
import { calculateMargin, resolveServiceMinMargin } from "./marginCalculator";
import { quotesApi } from "./quotesApi";
import {
  X,
  FileText,
  Calendar,
  Users,
  MapPin,
  Send,
  Loader2,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface QuotationBuilderModalProps {
  lead: LeadItem;
  isOpen: boolean;
  onClose: () => void;
  onQuoteCreated?: (quote: QuotationRecord) => void;
}

export const QuotationBuilderModal: React.FC<QuotationBuilderModalProps> = ({
  lead,
  isOpen,
  onClose,
  onQuoteCreated,
}) => {
  const paxCount = (lead.numberOfAdults || 1) + (lead.numberOfKids || 0);

  // Default validity date: 7 days in future
  const defaultValidUntil = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  };

  // Initial Line Items derived from lead package or service
  const createInitialItems = (): QuoteItemFormState[] => {
    const initial: QuoteItemFormState[] = [];

    // Pre-populate sensible starting items
    if (lead.packageTitle) {
      initial.push({
        id: "item-init-hotel",
        type: "HOTEL",
        title: `${lead.packageTitle} - Hotel Accommodation`,
        description: "Deluxe room accommodation with daily breakfast",
        quantity: Math.max(1, paxCount),
        supplierCost: 0,
        sellingPrice: 0,
      });
      initial.push({
        id: "item-init-transfer",
        type: "TRANSFER",
        title: "Airport Transfers & Sightseeing Transport",
        description: "Private air-conditioned vehicle throughout the tour",
        quantity: 1,
        supplierCost: 0,
        sellingPrice: 0,
      });
    } else {
      initial.push({
        id: "item-init-service",
        type: "OTHER",
        title: `${lead.serviceName} Arrangement`,
        description: `Custom package for ${paxCount} traveler(s)`,
        quantity: Math.max(1, paxCount),
        supplierCost: 0,
        sellingPrice: 0,
      });
    }

    return initial;
  };

  const [items, setItems] = useState<QuoteItemFormState[]>(createInitialItems);
  const [inclusions, setInclusions] = useState<string[]>([
    "Daily Breakfast",
    "Airport Pick-up & Drop (Private AC Vehicle)",
    "Taxes & Service Charges",
  ]);
  const [exclusions, setExclusions] = useState<string[]>([
    "Personal Expenses & Laundry",
    "City Tourism Dirham / Hotel Tax (Paid directly at check-in)",
    "International Travel Insurance",
  ]);
  const [validUntil, setValidUntil] = useState<string>(defaultValidUntil);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sub-target confirmation prompt modal state
  const [showSubTargetWarningDialog, setShowSubTargetWarningDialog] =
    useState<boolean>(false);

  // Success Celebration Modal
  const [createdQuote, setCreatedQuote] = useState<QuotationRecord | null>(
    null,
  );

  // Resolve minimum margin threshold
  const minMarginPercent = resolveServiceMinMargin(lead.serviceName);

  // Live real-time Margin Guard calculation on every keystroke
  const marginResult = calculateMargin({
    items,
    minMarginPercent,
  });

  // Re-seed items if lead changes
  useEffect(() => {
    if (isOpen) {
      setItems(createInitialItems());
      setValidUntil(defaultValidUntil());
      setNotes("");
      setErrorMessage(null);
      setCreatedQuote(null);
      setShowSubTargetWarningDialog(false);
    }
  }, [lead.id, isOpen]);

  if (!isOpen) return null;

  const handleAttemptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("Please add at least one line item to the quotation.");
      return;
    }

    if (marginResult.totalSellingPrice <= 0) {
      setErrorMessage("Total quoted package price must be greater than zero.");
      return;
    }

    // If margin is below target, require deliberate confirmation
    if (!marginResult.isHealthy) {
      setShowSubTargetWarningDialog(true);
      return;
    }

    void executeCreation();
  };

  const executeCreation = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setShowSubTargetWarningDialog(false);

    try {
      const quote = await quotesApi.createQuotation({
        leadId: lead.id,
        customerName: lead.customer.fullName,
        customerPhone: lead.customer.phone,
        serviceName: lead.serviceName,
        packageTitle: lead.packageTitle || undefined,
        validUntil,
        items,
        inclusions,
        exclusions,
        notes,
        minMarginPercent,
      });

      setCreatedQuote(quote);
      if (onQuoteCreated) {
        onQuoteCreated(quote);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to create quotation. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-4xl bg-[#F8F8F6] rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-zinc-900">
                      Quotation Builder & Margin Guard
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                      Module 5
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Offline rates quote generator with real-time floor margin
                    enforcement
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pre-filled Lead Context Banner */}
            <div className="px-6 py-3 bg-[#F0EFEB] border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex flex-wrap items-center gap-3 text-zinc-700">
                <span className="font-semibold text-zinc-900">
                  {lead.customer.fullName}
                </span>
                <span className="text-zinc-400">•</span>
                <span className="font-mono text-[11px]">
                  {lead.customer.phone}
                </span>
                {lead.customer.city && (
                  <>
                    <span className="text-zinc-400">•</span>
                    <span className="inline-flex items-center gap-1 text-zinc-600">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      {lead.customer.city}
                    </span>
                  </>
                )}
                <span className="text-zinc-400">•</span>
                <span className="px-2 py-0.5 rounded bg-white text-zinc-800 font-medium border border-zinc-200">
                  {lead.packageTitle || lead.serviceName}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-zinc-600 font-mono">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3 text-zinc-400" />
                  {paxCount} Pax ({lead.numberOfAdults}A, {lead.numberOfKids}K)
                </span>
                {lead.travelDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {new Date(lead.travelDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable Body */}
            <form
              onSubmit={handleAttemptSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {/* Prominent Live Margin Guard Card */}
              <MarginGuardSummaryCard
                margin={marginResult}
                serviceName={lead.serviceName}
              />

              {/* Error Alert */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Dynamic Line-Item Repeater */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                <QuotationLineItemRepeater
                  items={items}
                  onChange={setItems}
                  defaultPaxCount={paxCount}
                />
              </div>

              {/* Inclusions & Exclusions */}
              <InclusionsExclusionsSelector
                inclusions={inclusions}
                exclusions={exclusions}
                onChangeInclusions={setInclusions}
                onChangeExclusions={setExclusions}
              />

              {/* Proposal Metadata: Validity Date & Internal Staff Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                {/* Validity Date */}
                <div>
                  <label className="text-xs font-semibold text-zinc-800 block mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    Quote Validity Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full text-xs font-mono p-2 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-1">
                    Customer proposal link expires after this date
                  </span>
                </div>

                {/* Internal Coordinator Notes */}
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-800 block mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    Internal Staff Notes (Hidden from Customer)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Supplier contact: Ramesh @ Dnata UAE, agreed net rate until Friday..."
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-zinc-400"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-1">
                    Strict security guardrail: NEVER shown on customer-facing
                    links
                  </span>
                </div>
              </div>

              {/* Action Bar inside Form */}
              <div className="pt-2 flex items-center justify-between border-t border-zinc-200 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-black hover:bg-zinc-200/60 transition"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  {!marginResult.isHealthy &&
                    marginResult.totalSellingPrice > 0 && (
                      <span className="text-[11px] font-mono text-rose-600 font-medium hidden sm:inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Sub-target confirmation required
                      </span>
                    )}

                  <button
                    type="submit"
                    onClick={handleAttemptSubmit}
                    disabled={isSubmitting || items.length === 0}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition ${
                      marginResult.isHealthy
                        ? "bg-black text-white hover:bg-zinc-800"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Quotation...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {marginResult.isHealthy
                            ? "Generate & Finalize Quotation"
                            : "Generate Quotation (Sub-Target)"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sub-Target Confirmation Alert Dialog */}
      {showSubTargetWarningDialog && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div
            onClick={() => setShowSubTargetWarningDialog(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-300 p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Sub-Target Margin Warning
                </h3>
                <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                  The current margin for this quote is{" "}
                  <strong className="text-rose-700">
                    {marginResult.marginPercent.toFixed(1)}%
                  </strong>
                  , which is below the minimum required{" "}
                  <strong>{minMarginPercent}%</strong> target for{" "}
                  {lead.serviceName}.
                </p>
                {marginResult.shortfallAmount > 0 && (
                  <p className="text-xs text-zinc-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 mt-2 font-mono">
                    To meet target, increase package price by:{" "}
                    <strong>
                      ₹{marginResult.shortfallAmount.toLocaleString("en-IN")}
                    </strong>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubTargetWarningDialog(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-black hover:bg-zinc-100 transition"
                >
                  Adjust Pricing
                </button>
                <button
                  type="button"
                  onClick={() => void executeCreation()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  Proceed Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {createdQuote && (
        <ShareQuoteSuccessModal
          quote={createdQuote}
          customerName={lead.customer.fullName}
          customerPhone={lead.customer.phone}
          destinationOrService={lead.packageTitle || lead.serviceName}
          adultsCount={lead.numberOfAdults}
          kidsCount={lead.numberOfKids}
          isOpen={true}
          onClose={() => {
            setCreatedQuote(null);
            onClose();
          }}
        />
      )}
    </>
  );
};
