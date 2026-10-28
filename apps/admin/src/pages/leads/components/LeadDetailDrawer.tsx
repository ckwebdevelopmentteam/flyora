import { QuotationCard } from "./QuotationCard";
import { quotePublicUrl } from "../../quotes/quotePresentation";
import { userMessage } from "../../../lib/userMessage";
import { Modal } from "../../../components/ui/Modal";
import { useState, useEffect } from "react";
import type { LeadItem, LeadStatus, LeadActivityItem } from "@flyora/types";
import {
  X,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  Users,
  Send,
  Loader2,
  FileText,
  DollarSign,
} from "lucide-react";
import { QuotationBuilderModal } from "../../quotes/QuotationBuilderModal";
import { quotesApi } from "../../quotes/quotesApi";
import type { QuotationRecord } from "../../quotes/types";
import { ConvertBookingModal } from "../../bookings/ConvertBookingModal";

interface LeadDetailDrawerProps {
  lead: LeadItem | null;
  activities: LeadActivityItem[];
  activityUnavailable?: boolean;
  onRetryActivities?: () => void;
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
  onUpdateStatus: (status: LeadStatus) => Promise<void>;
  onAddNote: (note: string, followUpDate?: string) => Promise<void>;
}

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; dotClass: string; bgClass: string; textClass: string }
> = {
  NEW: {
    label: "New",
    dotClass: "bg-blue-500",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
  },
  CONTACTED: {
    label: "Contacted",
    dotClass: "bg-amber-500",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
  },
  QUOTED: {
    label: "Quoted",
    dotClass: "bg-purple-500",
    bgClass: "bg-purple-50",
    textClass: "text-purple-700",
  },
  NEGOTIATING: {
    label: "Negotiating",
    dotClass: "bg-indigo-500",
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-700",
  },
  BOOKED: {
    label: "Booked",
    dotClass: "bg-emerald-500",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
  },
  LOST: {
    label: "Lost",
    dotClass: "bg-zinc-400",
    bgClass: "bg-zinc-100",
    textClass: "text-zinc-600",
  },
};

export const LeadDetailDrawer = ({
  lead,
  activities,
  activityUnavailable,
  onRetryActivities,
  isOpen,
  onClose,
  onChanged,
  onUpdateStatus,
  onAddNote,
}: LeadDetailDrawerProps) => {
  const [actionError, setActionError] = useState("");
  const [quotesError, setQuotesError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [followUpDateInput, setFollowUpDateInput] = useState(
    lead?.followUpDate ? lead.followUpDate.slice(0, 10) : "",
  );
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "timeline" | "quotes">(
    "details",
  );

  // Quotations & Booking Conversion state
  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState(false);
  const [quotes, setQuotes] = useState<QuotationRecord[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [quoteToConvert, setQuoteToConvert] = useState<QuotationRecord | null>(
    null,
  );

  // Load quotes for this lead
  const loadQuotes = async (leadId: string) => {
    setIsLoadingQuotes(true);
    setQuotesError("");
    try {
      const data = await quotesApi.fetchQuotationsForLead(leadId);
      setQuotes(Array.isArray(data) ? data : []);
    } catch (error) {
      setQuotesError(
        userMessage(
          error,
          "We couldn't load the quotations. Please try again.",
        ),
      );
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  useEffect(() => {
    if (lead?.id && isOpen) {
      void loadQuotes(lead.id);
    }
  }, [lead?.id, isOpen]);

  if (!isOpen || !lead) return null;

  const currentStatusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;

  // Clean phone number for tel: and whatsapp:
  const cleanPhone = lead.customer.phone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${lead.customer.fullName}, this is Flyora Travels. Regarding your enquiry for ${
      lead.packageTitle || lead.serviceName
    }, how may I assist you today?`,
  )}`;

  const handleCopyQuoteLink = async (quote: QuotationRecord) => {
    const publicUrl = quotePublicUrl(quote.shareToken);

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedQuoteId(quote.id);
      setTimeout(() => setCopiedQuoteId(null), 2500);
    } catch {
      setActionError("We couldn't copy the link. Please try again.");
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = e.target.value as LeadStatus;
    if (newStatus === lead.status) return;

    setActionError("");
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(newStatus);
    } catch (error) {
      setActionError(
        userMessage(error, "We couldn't change the stage. Please try again."),
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setActionError("");
    setIsSubmittingNote(true);
    try {
      await onAddNote(noteText.trim(), followUpDateInput || undefined);
      setNoteText("");
    } catch (error) {
      setActionError(
        userMessage(error, "We couldn't save the note. Please try again."),
      );
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Format currency in INR
  const formattedBudget = lead.estimatedBudget
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(lead.estimatedBudget)
    : "Not specified";

  // Check if follow-up is today or overdue
  const isFollowUpDueToday =
    lead.followUpDate &&
    new Date(lead.followUpDate).toDateString() === new Date().toDateString();
  const isFollowUpOverdue =
    lead.followUpDate &&
    new Date(lead.followUpDate).getTime() < Date.now() &&
    !isFollowUpDueToday;

  return (
    <Modal
      title="Enquiry details"
      description={lead.customer.fullName}
      onClose={onClose}
      drawer
      hideHeader
    >
      <div className="w-full h-full min-h-0 bg-white flex flex-col">
        {/* Drawer Header */}
        <div className="enquiry-drawer-header">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono ${currentStatusConfig.bgClass} ${currentStatusConfig.textClass}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${currentStatusConfig.dotClass}`}
                  />
                  {currentStatusConfig.label}
                </span>
              </div>
              <h2 className="text-lg font-medium text-zinc-900 mt-1.5">
                {lead.customer.fullName}
              </h2>
              <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                {lead.customer.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    {lead.customer.city}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              aria-label="Close enquiry details"
              onClick={onClose}
              className="icon-button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Direct One-Click Actions: Call & WhatsApp */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <a href={`tel:${cleanPhone}`} className="button-secondary">
              <Phone className="w-3.5 h-3.5" />
              <span>Call ({lead.customer.phone})</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="button-secondary"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Prominent Create Quotation Action */}
          <button
            type="button"
            onClick={() => setIsQuoteBuilderOpen(true)}
            className="button-primary w-full mt-3"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Create quotation</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 text-xs font-medium border-b-2 transition mr-6 ${
              activeTab === "details"
                ? "border-black text-black font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("quotes")}
            className={`py-3 text-xs font-medium border-b-2 transition mr-6 flex items-center gap-1.5 ${
              activeTab === "quotes"
                ? "border-black text-black font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <span>Quotations</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[10px] font-mono text-emerald-800 font-semibold">
              {isLoadingQuotes ? "…" : quotesError ? "—" : quotes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-3 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "timeline"
                ? "border-black text-black font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <span>Activity</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 text-[10px] font-mono text-zinc-600">
              {activityUnavailable ? "—" : activities.length}
            </span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {actionError && (
            <p className="notice notice-error" role="alert">
              {actionError}
            </p>
          )}
          {activeTab === "details" ? (
            <>
              {/* Stage Selector */}
              <div className="bg-[#F8F8F6] p-4 rounded-xl border border-zinc-200/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-zinc-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-black" />
                    Enquiry stage
                  </label>
                  {isUpdatingStatus && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                  )}
                </div>
                <select
                  aria-label="Enquiry stage"
                  value={lead.status}
                  onChange={handleStatusChange}
                  disabled={isUpdatingStatus || lead.status === "BOOKED"}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-black"
                >
                  <option value="NEW">New (Uncontacted)</option>
                  <option value="CONTACTED">Contacted (In Discussion)</option>
                  <option value="QUOTED">Quoted (Sent Rates)</option>
                  <option value="NEGOTIATING">Negotiating (Closing)</option>
                  {lead.status === "BOOKED" && (
                    <option value="BOOKED">Booked</option>
                  )}
                  <option value="LOST">Lost (Declined / Unresponsive)</option>
                </select>
              </div>

              {/* Travel & Enquiry Information Card */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                  Trip details
                </h3>

                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-400 text-[11px] block">
                      Requested Service
                    </span>
                    <p className="font-medium text-zinc-900 mt-0.5">
                      {lead.serviceName}
                    </p>
                  </div>

                  {lead.packageTitle && (
                    <div>
                      <span className="text-zinc-400 text-[11px] block">
                        Tour Package
                      </span>
                      <p className="font-medium text-zinc-900 mt-0.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        {lead.packageTitle}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                    <div>
                      <span className="text-zinc-400 text-[11px] block">
                        Travel Date
                      </span>
                      <p className="font-medium text-zinc-900 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {lead.travelDate
                          ? new Date(lead.travelDate).toLocaleDateString()
                          : "Flexible"}
                      </p>
                    </div>

                    <div>
                      <span className="text-zinc-400 text-[11px] block">
                        Travellers
                      </span>
                      <p className="font-medium text-zinc-900 mt-0.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        {lead.numberOfAdults} Adults
                        {lead.numberOfKids > 0
                          ? `, ${lead.numberOfKids} Kids`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                    <div>
                      <span className="text-zinc-400 text-[11px] block">
                        Estimated Budget
                      </span>
                      <p className="font-medium text-zinc-900 mt-0.5 flex items-center gap-1.5 font-mono">
                        <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                        {formattedBudget}
                      </p>
                    </div>

                    <div>
                      <span className="text-zinc-400 text-[11px] block">
                        Enquiry Source
                      </span>
                      <p className="font-medium text-zinc-900 mt-0.5 font-mono text-[11px]">
                        {lead.source.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow-up Reminder Badge */}
              {lead.followUpDate && (
                <div
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    isFollowUpOverdue
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : isFollowUpDueToday
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-zinc-50 border-zinc-200 text-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Follow-up:{" "}
                      {new Date(lead.followUpDate).toLocaleDateString()}
                    </span>
                  </div>
                  {isFollowUpDueToday && (
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-mono text-[10px] font-semibold">
                      TODAY
                    </span>
                  )}
                  {isFollowUpOverdue && (
                    <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-mono text-[10px] font-semibold">
                      OVERDUE
                    </span>
                  )}
                </div>
              )}

              {/* Add Internal Note & Schedule Follow-Up Form */}
              <form
                onSubmit={handleNoteSubmit}
                className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                    Customer notes
                  </label>
                </div>

                <textarea
                  rows={3}
                  aria-label="Staff note"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Log customer response, hotel preference, price negotiation notes..."
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-zinc-400 resize-none"
                />

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                      Next Follow-Up Date
                    </label>
                    <input
                      type="date"
                      aria-label="Next follow-up date"
                      value={followUpDateInput}
                      onChange={(e) => setFollowUpDateInput(e.target.value)}
                      className="w-full text-xs p-1.5 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingNote || !noteText.trim()}
                    className="self-end px-3 py-2 rounded-lg bg-black text-white hover:bg-zinc-800 disabled:opacity-50 text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
                  >
                    {isSubmittingNote ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>Save Note</span>
                  </button>
                </div>
              </form>
            </>
          ) : activeTab === "timeline" ? (
            <div className="space-y-4">
              {activityUnavailable ? (
                <div className="notice notice-error" role="alert">
                  <p>We couldn't load the activity. Please try again.</p>
                  <button
                    className="button-secondary mt-3"
                    onClick={onRetryActivities}
                  >
                    Try again
                  </button>
                </div>
              ) : activities.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  No activity recorded yet.
                </p>
              ) : (
                <ol className="enquiry-activity">
                  {activities.map((activity) => (
                    <li key={activity.id}>
                      <div>
                        <strong>{activity.userName || "Team member"}</strong>
                        <span>
                          {activity.action.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </div>
                      <p>{activity.details}</p>
                      <time dateTime={activity.createdAt}>
                        {new Date(activity.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </time>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Saved quotations
              </h3>
              {isLoadingQuotes ? (
                <div className="text-center py-8 text-xs text-zinc-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading quotations...</span>
                </div>
              ) : quotesError ? (
                <div className="notice notice-error" role="alert">
                  <p>{quotesError}</p>
                  <button
                    className="button-secondary mt-3"
                    onClick={() => void loadQuotes(lead.id)}
                  >
                    Try again
                  </button>
                </div>
              ) : !quotes || quotes.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-zinc-300 bg-[#FAFAF9] space-y-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-zinc-800">
                      No quotations created yet
                    </p>
                    <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                      Add the services and prices you want to offer this
                      customer.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotes
                    .filter((quote) => Boolean(quote?.id && quote.shareToken))
                    .map((quote) => (
                      <QuotationCard
                        key={quote.id}
                        quote={quote}
                        lead={lead}
                        copied={copiedQuoteId === quote.id}
                        onCopy={() => void handleCopyQuoteLink(quote)}
                        onBook={() => setQuoteToConvert(quote)}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quotation Builder Modal */}
      {isQuoteBuilderOpen && (
        <QuotationBuilderModal
          lead={lead}
          isOpen={isQuoteBuilderOpen}
          onClose={() => setIsQuoteBuilderOpen(false)}
          onQuoteCreated={(newQuote) => {
            if (newQuote && newQuote.id) {
              setQuotes((prev) => [
                newQuote,
                ...(Array.isArray(prev) ? prev : []).filter(
                  (q) => q && q.id !== newQuote.id,
                ),
              ]);
            }
            setActiveTab("quotes");
            onChanged?.();
          }}
        />
      )}

      {/* Convert to Booking Modal */}
      {quoteToConvert && (
        <ConvertBookingModal
          isOpen={Boolean(quoteToConvert)}
          onClose={() => setQuoteToConvert(null)}
          quotation={quoteToConvert}
          lead={lead}
          onBookingConverted={() => {
            onChanged?.();
            setQuotes((prev) =>
              prev.map((q) =>
                q.id === quoteToConvert.id ? { ...q, status: "ACCEPTED" } : q,
              ),
            );
          }}
        />
      )}
    </Modal>
  );
};
