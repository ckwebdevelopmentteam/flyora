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
  Plus,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { QuotationBuilderModal } from "../../quotes/QuotationBuilderModal";
import { quotesApi } from "../../quotes/quotesApi";
import type { QuotationRecord } from "../../quotes/types";
import { ConvertBookingModal } from "../../bookings/ConvertBookingModal";

interface LeadDetailDrawerProps {
  lead: LeadItem | null;
  activities: LeadActivityItem[];
  isOpen: boolean;
  onClose: () => void;
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
  isOpen,
  onClose,
  onUpdateStatus,
  onAddNote,
}: LeadDetailDrawerProps) => {
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
    try {
      const data = await quotesApi.fetchQuotationsForLead(leadId);
      setQuotes(Array.isArray(data) ? data : []);
    } catch {
      setQuotes([]);
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
    const webBaseUrl =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://flyora.com";
    const publicUrl = `${webBaseUrl}/quote/${quote.shareToken}`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedQuoteId(quote.id);
      setTimeout(() => setCopiedQuoteId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = e.target.value as LeadStatus;
    if (newStatus === lead.status) return;

    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmittingNote(true);
    try {
      await onAddNote(noteText.trim(), followUpDateInput || undefined);
      setNoteText("");
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-zinc-200 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-zinc-200 bg-[#FAFAF9]">
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
                  <span className="text-[11px] font-mono text-zinc-400">
                    #{lead.id.slice(-6)}
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
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct One-Click Actions: Call & WhatsApp */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call ({lead.customer.phone})</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Prominent Create Quotation Action */}
            <button
              type="button"
              onClick={() => setIsQuoteBuilderOpen(true)}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-zinc-900 to-black hover:from-black hover:to-zinc-800 text-white text-xs font-semibold shadow-xs transition group"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Create Quotation (Margin Guard)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-mono ml-1">
                P4
              </span>
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
              Enquiry Details
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
                {quotes?.length || 0}
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
              <span>Activity Timeline</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 text-[10px] font-mono text-zinc-600">
                {activities.length}
              </span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "details" ? (
              <>
                {/* Stage Selector */}
                <div className="bg-[#F8F8F6] p-4 rounded-xl border border-zinc-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-zinc-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-black" />
                      Sales Pipeline Stage
                    </label>
                    {isUpdatingStatus && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                    )}
                  </div>
                  <select
                    value={lead.status}
                    onChange={handleStatusChange}
                    disabled={isUpdatingStatus}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-black"
                  >
                    <option value="NEW">New (Uncontacted)</option>
                    <option value="CONTACTED">Contacted (In Discussion)</option>
                    <option value="QUOTED">Quoted (Sent Rates)</option>
                    <option value="NEGOTIATING">Negotiating (Closing)</option>
                    <option value="BOOKED">Booked (Won)</option>
                    <option value="LOST">Lost (Declined / Unresponsive)</option>
                  </select>
                </div>

                {/* Travel & Enquiry Information Card */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                    Customer Requirements
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
                          Guests / Pax
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
                      Add Call Note / Requirement
                    </label>
                  </div>

                  <textarea
                    rows={3}
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
              /* Timeline Feed */
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-10 text-zinc-400 text-xs">
                    No activity logs recorded yet.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                    {activities.map((act) => (
                      <div key={act.id} className="relative group">
                        {/* Dot indicator */}
                        <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full border-2 border-white bg-black shadow-xs" />

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-zinc-900">
                              {act.userName}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {new Date(act.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="inline-block px-1.5 py-0.2 rounded bg-zinc-100 text-[10px] font-mono text-zinc-600">
                            {act.action.replace(/_/g, " ")}
                          </div>

                          <p className="text-xs text-zinc-600 bg-[#F8F8F6] p-2.5 rounded-lg border border-zinc-100 mt-1 leading-relaxed">
                            {act.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Quotations Tab Feed */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                  <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                    Generated Proposals ({quotes?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsQuoteBuilderOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black text-white hover:bg-zinc-800 text-[11px] font-medium transition shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create New Quote</span>
                  </button>
                </div>

                {isLoadingQuotes ? (
                  <div className="text-center py-8 text-xs text-zinc-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading quotations...</span>
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
                        Use the offline rates builder to assemble flights,
                        hotels, and custom transfers with live margin checking.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsQuoteBuilderOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Launch Quotation Builder</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(quotes || [])
                      .filter((q): q is QuotationRecord =>
                        Boolean(q && q.id && q.shareToken),
                      )
                      .map((quote) => {
                        const webBaseUrl =
                          typeof window !== "undefined" &&
                          window.location.hostname === "localhost"
                            ? "http://localhost:3000"
                            : "https://flyora.com";
                        const publicQuoteUrl = `${webBaseUrl}/quote/${quote.shareToken}`;

                        const cleanPhoneNum = lead.customer.phone.replace(
                          /[^0-9]/g,
                          "",
                        );
                        const formattedPrice =
                          "₹" +
                          Math.round(quote.sellingPrice).toLocaleString(
                            "en-IN",
                          );
                        const formattedValidUntil = new Date(
                          quote.validUntil,
                        ).toLocaleDateString();

                        const quickWhatsAppText = `Hello ${lead.customer.fullName}! Here is your customized travel quote from Flyora Travels:\nTotal: ${formattedPrice} (All Inclusive)\nValid Until: ${formattedValidUntil}\nProposal Link: ${publicQuoteUrl}`;
                        const directWhatsAppUrl = `https://wa.me/${cleanPhoneNum}?text=${encodeURIComponent(
                          quickWhatsAppText,
                        )}`;

                        return (
                          <div
                            key={quote.id}
                            className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs space-y-3 hover:border-zinc-300 transition"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-zinc-900">
                                  {quote.quoteNumber}
                                </span>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                                    quote.status === "SENT" ||
                                    quote.status === "ACCEPTED"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : quote.status === "EXPIRED"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : quote.status === "REJECTED"
                                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                                          : "bg-zinc-100 text-zinc-700"
                                  }`}
                                >
                                  {quote.status}
                                </span>
                              </div>

                              <span className="text-[10px] font-mono text-zinc-400">
                                {new Date(quote.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Financials Row */}
                            <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-[#F8F8F6] border border-zinc-200/60 text-xs font-mono">
                              <div>
                                <span className="text-[10px] text-zinc-400 block font-sans">
                                  Quoted Price
                                </span>
                                <span className="font-bold text-zinc-900">
                                  {formattedPrice}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-400 block font-sans">
                                  Gross Margin
                                </span>
                                <span
                                  className={`font-semibold ${
                                    quote.marginPercent >= 12
                                      ? "text-emerald-700"
                                      : "text-amber-700"
                                  }`}
                                >
                                  {quote.marginPercent.toFixed(1)}% (+₹
                                  {Math.round(
                                    quote.marginAmount,
                                  ).toLocaleString("en-IN")}
                                  )
                                </span>
                              </div>
                            </div>

                            {/* Line items count & Validity */}
                            <div className="flex items-center justify-between text-[11px] text-zinc-500">
                              <span>
                                {quote.items?.length || 0} line item(s)
                              </span>
                              <span className="font-mono text-[10px]">
                                Valid until: {formattedValidUntil}
                              </span>
                            </div>

                            {/* One-Click Action Buttons */}
                            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyQuoteLink(quote)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition"
                              >
                                {copiedQuoteId === quote.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700">
                                      Copied!
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-zinc-400" />
                                    <span>Copy Link</span>
                                  </>
                                )}
                              </button>

                              {cleanPhoneNum && (
                                <a
                                  href={directWhatsAppUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}

                              <a
                                href={publicQuoteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
                                title="Preview Customer Proposal"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* 1-Click Convert to Booking Action */}
                            <button
                              type="button"
                              onClick={() => setQuoteToConvert(quote)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Convert to Booking</span>
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
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
            if (lead.status !== "QUOTED") {
              void onUpdateStatus("QUOTED");
            }
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
            if (lead.status !== "BOOKED") {
              void onUpdateStatus("BOOKED");
            }
            setQuotes((prev) =>
              prev.map((q) =>
                q.id === quoteToConvert.id ? { ...q, status: "ACCEPTED" } : q,
              ),
            );
          }}
        />
      )}
    </div>
  );
};
