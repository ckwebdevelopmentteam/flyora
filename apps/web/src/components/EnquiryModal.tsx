"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  MessageCircle,
  Users,
  AlertCircle,
  Compass,
} from "lucide-react";
import { publicEnquirySchema, PublicEnquiryInput } from "@flyora/validators";

interface ServiceOption {
  id: string;
  name: string;
  slug: string;
}

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceId?: string;
  defaultPackageId?: string;
  packageTitle?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  defaultServiceId,
  defaultPackageId,
  packageTitle,
}) => {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const [formData, setFormData] = useState<Partial<PublicEnquiryInput>>({
    fullName: "",
    phone: "",
    email: "",
    serviceId: defaultServiceId || "",
    packageId: defaultPackageId,
    travelDate: "",
    numberOfAdults: 1,
    numberOfKids: 0,
    notes: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<null | {
    leadId: string;
    message: string;
  }>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  // Fetch available services on mount
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadServices() {
      setIsLoadingServices(true);
      try {
        const res = await fetch(`${apiUrl}/services`);
        const data = await res.json();
        if (isMounted && data.data && Array.isArray(data.data)) {
          setServices(data.data);
          setFormData((prev) => ({
            ...prev,
            serviceId:
              prev.serviceId || defaultServiceId || data.data[0]?.id || "",
          }));
        }
      } catch {
        if (isMounted) {
          const fallback = [
            {
              id: "00000000-0000-0000-0000-000000000001",
              name: "Holiday Packages",
              slug: "holiday-packages",
            },
            {
              id: "00000000-0000-0000-0000-000000000002",
              name: "Visa Assistance",
              slug: "visa-assistance",
            },
            {
              id: "00000000-0000-0000-0000-000000000003",
              name: "Flight Booking",
              slug: "flight-booking",
            },
            {
              id: "00000000-0000-0000-0000-000000000004",
              name: "Umrah & Hajj",
              slug: "umrah-hajj",
            },
          ];
          setServices(fallback);
          setFormData((prev) => ({
            ...prev,
            serviceId: prev.serviceId || fallback[0].id,
          }));
        }
      } finally {
        if (isMounted) setIsLoadingServices(false);
      }
    }

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [isOpen, apiUrl, defaultServiceId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setValidationErrors({});

    // Validate with Zod
    const result = publicEnquirySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (field) fieldErrors[field] = err.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/public/enquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to submit enquiry. Please try again.",
        );
      }

      setSubmissionSuccess({
        leadId: responseData.data?.leadId || "REF-" + Date.now().toString(36),
        message:
          responseData.data?.message ||
          "Your enquiry has been received. Our specialist will contact you shortly.",
      });
    } catch (err: unknown) {
      setServerError(
        (err as Error).message ||
          "Network error. Please try WhatsApp directly.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionSuccess(null);
    setServerError(null);
    setValidationErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
                {packageTitle
                  ? `Enquire: ${packageTitle}`
                  : "Plan Your Journey with Flyora"}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Direct coordinator response within 15 mins
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {submissionSuccess ? (
            /* Success State */
            <div className="text-center py-6 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900 mb-1">
                Enquiry Submitted!
              </h4>
              <p className="text-xs text-zinc-600 mb-4 max-w-sm mx-auto">
                {submissionSuccess.message}
              </p>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 mb-6 inline-block">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                  Enquiry Reference ID
                </span>
                <span className="text-sm font-mono font-bold text-zinc-900">
                  {submissionSuccess.leadId}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(
                    `Hi Flyora Travels, I just submitted an enquiry (Ref: ${submissionSuccess.leadId}) for ${formData.fullName}. Please share details!`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  Chat Directly on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs font-medium transition"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4">
              {serverError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Travel Service Needed *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceId: e.target.value })
                  }
                  disabled={isLoadingServices}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                >
                  {isLoadingServices ? (
                    <option>Loading available services...</option>
                  ) : (
                    services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name}
                      </option>
                    ))
                  )}
                </select>
                {validationErrors.serviceId && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {validationErrors.serviceId}
                  </p>
                )}
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder:text-zinc-400"
                  />
                  {validationErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {validationErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 10),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder:text-zinc-400 font-mono"
                  />
                  {validationErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder:text-zinc-400"
                  />
                  {validationErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Expected Travel Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.travelDate || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, travelDate: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Passengers (Adults & Kids) */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Adults (12+ yrs)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.numberOfAdults || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfAdults: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Children (0-11 yrs)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={formData.numberOfKids || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfKids: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Special Requests / Notes */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Special Preferences or Itinerary Requests
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Need 4-star hotel in Bur Dubai, Burj Khalifa top floor tickets, vegetarian meal preferences..."
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder:text-zinc-400"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting with Travel Coordinator...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Travel Enquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
