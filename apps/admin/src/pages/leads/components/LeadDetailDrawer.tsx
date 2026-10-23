import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<"details" | "timeline">("details");

  if (!isOpen || !lead) return null;

  const currentStatusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;

  // Clean phone number for tel: and whatsapp:
  const cleanPhone = lead.customer.phone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${lead.customer.fullName}, this is Flyora Travels. Regarding your enquiry for ${
      lead.packageTitle || lead.serviceName
    }, how may I assist you today?`,
  )}`;

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
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
