import React, { useState, useEffect, useRef } from "react";
import type { LeadItem } from "@flyora/types";
import type { QuoteItemFormState, QuotationRecord } from "./types";
import { QuotationLineItemRepeater } from "./QuotationLineItemRepeater";
import { MarginGuardSummaryCard } from "./MarginGuardSummaryCard";
import { InclusionsExclusionsSelector } from "./InclusionsExclusionsSelector";
import { ShareQuoteSuccessModal } from "./ShareQuoteSuccessModal";
import { calculateMargin, resolveServiceMinMargin } from "./marginCalculator";
import { quotesApi } from "./quotesApi";
import { ArrowRight, Loader2 } from "lucide-react";
import { Modal, Steps, FormError } from "../../components/ui/Modal";
import { userMessage } from "../../lib/userMessage";

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
  const [step, setStep] = useState(0);
  const submitting = useRef(false);
  const paxCount = (lead.numberOfAdults || 1) + (lead.numberOfKids || 0);

  // Default validity date: 7 days in future
  const defaultValidUntil = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  };

  // Initial Line Items derived from lead package or service
  const createInitialItems = (): QuoteItemFormState[] => {
    const name = lead.serviceName.toLowerCase();
    const type: QuoteItemFormState["type"] = lead.packageTitle
      ? "OTHER"
      : name.includes("hotel")
        ? "HOTEL"
        : name.includes("flight")
          ? "FLIGHT"
          : name.includes("visa")
            ? "VISA"
            : "OTHER";
    return [
      {
        id: "item-init-service",
        type,
        title: lead.packageTitle || lead.serviceName,
        description: "",
        quantity:
          type === "FLIGHT" || type === "VISA" ? Math.max(1, paxCount) : 1,
        supplierCost: 0,
        sellingPrice: 0,
      },
    ];
  };

  const [items, setItems] = useState<QuoteItemFormState[]>(createInitialItems);
  const [inclusions, setInclusions] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
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
      setStep(0);
      setInclusions([]);
      setExclusions([]);
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
    if (submitting.current) return;
    submitting.current = true;
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
        userMessage(err, "We couldn't save this quotation. Please try again."),
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  if (createdQuote)
    return (
      <ShareQuoteSuccessModal
        quote={createdQuote}
        customerName={lead.customer.fullName}
        customerPhone={lead.customer.phone}
        destinationOrService={lead.packageTitle || lead.serviceName}
        adultsCount={lead.numberOfAdults}
        kidsCount={lead.numberOfKids}
        isOpen
        onClose={() => {
          setCreatedQuote(null);
          onClose();
        }}
      />
    );

  const next = () => {
    setErrorMessage(null);
    if (
      step === 0 &&
      (!items.length ||
        items.some(
          (item) =>
            !item.title.trim() ||
            !Number.isFinite(item.quantity) ||
            item.quantity < 1 ||
            !Number.isFinite(item.supplierCost) ||
            item.supplierCost < 0 ||
            !Number.isFinite(item.sellingPrice) ||
            item.sellingPrice < 0,
        ) ||
        marginResult.totalSellingPrice <= 0)
    ) {
      setErrorMessage(
        "Add a service name, quantity and customer price before continuing.",
      );
      return;
    }
    if (
      step === 1 &&
      (!validUntil ||
        !Number.isFinite(Date.parse(validUntil)) ||
        validUntil < new Date().toISOString().slice(0, 10))
    ) {
      setErrorMessage("Choose a valid date, today or later.");
      return;
    }
    setStep((value) => Math.min(value + 1, 2));
  };
  return (
    <Modal
      title="Create quotation"
      description={`${lead.customer.fullName} · ${lead.packageTitle || lead.serviceName}`}
      onClose={onClose}
      busy={isSubmitting}
      wide
      footer={
        <>
          <button
            className="button-secondary"
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              if (step > 0) {
                setStep(step - 1);
                setErrorMessage(null);
                setShowSubTargetWarningDialog(false);
              } else onClose();
            }}
          >
            {step > 0 ? "Back" : "Cancel"}
          </button>
          {step < 2 ? (
            <button type="button" className="button-primary" onClick={next}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="button-primary"
              disabled={isSubmitting}
              onClick={() => {
                if (showSubTargetWarningDialog) void executeCreation();
                else handleAttemptSubmit();
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : showSubTargetWarningDialog ? (
                "Save below target"
              ) : (
                "Save quotation"
              )}
            </button>
          )}
        </>
      }
    >
      <Steps
        labels={["Services & prices", "What's included", "Review & save"]}
        current={step}
      />
      <FormError>{errorMessage}</FormError>
      {step === 0 && (
        <div className="space-y-5">
          <QuotationLineItemRepeater
            items={items}
            onChange={setItems}
            defaultPaxCount={paxCount}
          />
        </div>
      )}
      {step === 1 && (
        <div className="space-y-6">
          <InclusionsExclusionsSelector
            inclusions={inclusions}
            exclusions={exclusions}
            onChangeInclusions={setInclusions}
            onChangeExclusions={setExclusions}
          />
          <div className="form-grid">
            <div className="field">
              <label htmlFor="quote-valid-until">Valid until</label>
              <input
                id="quote-valid-until"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
                required
              />
              <small>The date shown on the customer's quotation.</small>
            </div>
            <div className="field">
              <label htmlFor="quote-notes">
                Staff notes <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                id="quote-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Anything your team should know"
              />
              <small>Only your team can see these notes.</small>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-6">
          <dl className="review-list">
            <div>
              <dt>Customer</dt>
              <dd>{lead.customer.fullName}</dd>
            </div>
            <div>
              <dt>Services</dt>
              <dd>
                {items.length} {items.length === 1 ? "item" : "items"}
              </dd>
            </div>
            <div>
              <dt>Travellers</dt>
              <dd>{paxCount}</dd>
            </div>
            <div>
              <dt>Valid until</dt>
              <dd>{new Date(validUntil).toLocaleDateString("en-GB")}</dd>
            </div>
          </dl>
          <div className="surface overflow-hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 p-4 border-b last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-medium break-words">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-slate-500 break-words mt-1">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {item.quantity} × ₹
                    {item.sellingPrice.toLocaleString("en-IN")}
                  </p>
                </div>
                <strong className="shrink-0">
                  ₹{(item.quantity * item.sellingPrice).toLocaleString("en-IN")}
                </strong>
              </div>
            ))}
          </div>
          <MarginGuardSummaryCard
            margin={marginResult}
            serviceName={lead.serviceName}
          />
          {showSubTargetWarningDialog && (
            <div
              className="notice border-amber-200 bg-amber-50 text-amber-900"
              role="alert"
            >
              <strong>This quote is below your target profit.</strong>
              <p className="mt-1">
                Go back to adjust the prices, or choose “Save below target” to
                continue with a profit of{" "}
                {marginResult.marginPercent.toFixed(1)}%.
              </p>
            </div>
          )}
          {(inclusions.length > 0 || exclusions.length > 0) && (
            <div className="form-grid">
              {[
                { title: "Included", values: inclusions },
                { title: "Not included", values: exclusions },
              ].map((list) => (
                <section key={list.title} className="surface p-4">
                  <h3 className="text-sm font-semibold mb-2">{list.title}</h3>
                  {list.values.length ? (
                    <ul className="space-y-2 text-sm text-slate-600">
                      {list.values.map((value) => (
                        <li key={value} className="break-words">
                          {value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">None added</p>
                  )}
                </section>
              ))}
            </div>
          )}
          {notes.trim() && (
            <div className="surface p-4">
              <h3 className="text-sm font-semibold mb-2">Staff notes</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap break-words">
                {notes}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
