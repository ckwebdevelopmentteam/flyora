"use client";

import React, { useState, useEffect, useRef } from "react";
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
import type { PublicEnquiryInput } from "@flyora/validators";
import type { ServiceSummary } from "@flyora/types";
import { enquiryFormSchema, whatsappLink } from "../lib/enquiry";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceId?: string;
  defaultPackageId?: string;
  packageTitle?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = (props) =>
  props.isOpen ? (
    <EnquiryForm
      key={`${props.defaultServiceId || ""}:${props.defaultPackageId || ""}`}
      {...props}
    />
  ) : null;

const EnquiryForm: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  defaultServiceId,
  defaultPackageId,
  packageTitle,
}) => {
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [serviceAttempt, setServiceAttempt] = useState(0);
  const submitting = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const submission = useRef<AbortController | null>(null);
  const close = () => {
    if (!submitting.current) onClose();
  };
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.close();
      submission.current?.abort();
      previousFocus?.focus();
    };
  }, []);

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

    const controller = new AbortController();
    async function loadServices() {
      setIsLoadingServices(true);
      setServicesError(null);
      try {
        const res = await fetch(`${apiUrl}/services`, {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15000),
          ]),
        });
        const data = await res.json();
        if (
          !res.ok ||
          !Array.isArray(data.data) ||
          !data.data.length ||
          !data.data.every(
            (service: ServiceSummary) =>
              service &&
              typeof service.id === "string" &&
              typeof service.name === "string",
          )
        )
          throw new Error("Services are unavailable. Please try again.");
        if (!controller.signal.aborted) {
          setServices(data.data);
          setFormData((prev) => ({
            ...prev,
            serviceId: data.data.some(
              (s: ServiceSummary) =>
                s.id === (prev.serviceId || defaultServiceId),
            )
              ? prev.serviceId || defaultServiceId
              : defaultPackageId
                ? ""
                : data.data[0].id,
          }));
        }
      } catch {
        if (!controller.signal.aborted) {
          setServices([]);
          setServicesError("Services are unavailable. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingServices(false);
      }
    }
    void loadServices();
    return () => controller.abort();
  }, [isOpen, apiUrl, defaultServiceId, defaultPackageId, serviceAttempt]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current || isLoadingServices || servicesError) return;
    setServerError(null);
    setValidationErrors({});

    // Validate with Zod
    const result = enquiryFormSchema.safeParse({
      ...formData,
      fullName: formData.fullName?.trim(),
      email: formData.email?.trim(),
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (field) fieldErrors[field] = err.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

    if (!services.some((service) => service.id === result.data.serviceId)) {
      setValidationErrors({ serviceId: "Please select an available service" });
      return;
    }
    submitting.current = true;
    setIsSubmitting(true);
    submission.current = new AbortController();

    try {
      const response = await fetch(`${apiUrl}/public/enquiry`, {
        method: "POST",
        signal: AbortSignal.any([
          submission.current.signal,
          AbortSignal.timeout(30000),
        ]),
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof responseData.message === "string"
            ? responseData.message
            : "Failed to submit enquiry. Please try again.",
        );
      }

      if (
        responseData.data?.success !== true ||
        typeof responseData.data?.leadId !== "string" ||
        !responseData.data.leadId
      )
        throw new Error(
          "We could not confirm your enquiry. Please contact us before submitting again.",
        );
      setSubmissionSuccess({
        leadId: responseData.data.leadId,
        message:
          typeof responseData.data.message === "string"
            ? responseData.data.message
            : "Your enquiry has been received. Our specialist will contact you shortly.",
      });
    } catch (err: unknown) {
      if (submission.current?.signal.aborted) return;
      setServerError(
        err instanceof TypeError ||
          (err instanceof Error && err.name === "TimeoutError")
          ? "We could not confirm whether your enquiry was received. Please contact us before submitting again."
          : err instanceof Error
            ? err.message
            : "Unable to submit your enquiry. Please contact us.",
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (submitting.current) return;
    setSubmissionSuccess(null);
    setServerError(null);
    setValidationErrors({});
    close();
  };

  const whatsappUrl = whatsappLink(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    submissionSuccess
      ? `Hi Flyora Travels, my enquiry reference is ${submissionSuccess.leadId}.`
      : "Hi Flyora Travels, I need help with a travel enquiry.",
  );

  return (
    <dialog
      ref={dialog}
      aria-labelledby="enquiry-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="fixed inset-0 m-auto w-full max-w-lg max-h-[92vh] p-0 rounded-2xl bg-transparent backdrop:bg-black/60"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="enquiry-title"
                className="text-sm font-semibold text-zinc-900 tracking-tight"
              >
                {packageTitle
                  ? `Enquire: ${packageTitle}`
                  : "Plan Your Journey with Flyora"}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Tell us about your travel plans
              </p>
            </div>
          </div>
          <button
            aria-label="Close enquiry"
            disabled={isSubmitting}
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
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    Chat Directly on WhatsApp
                  </a>
                )}
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
              <fieldset disabled={isSubmitting} className="space-y-4 min-w-0">
                {servicesError && (
                  <div role="alert" className="text-sm text-rose-700">
                    {servicesError}{" "}
                    <button
                      type="button"
                      onClick={() => setServiceAttempt((n) => n + 1)}
                      className="underline"
                    >
                      Retry loading services
                    </button>
                  </div>
                )}
                {serverError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span role="alert">
                      {serverError}{" "}
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Contact us on WhatsApp
                        </a>
                      )}
                    </span>
                  </div>
                )}

                {Object.keys(validationErrors).length > 0 && (
                  <div role="alert" className="text-xs text-rose-700">
                    {Object.entries(validationErrors).map(
                      ([field, message]) => (
                        <p
                          key={field}
                          id={
                            [
                              "travelDate",
                              "numberOfAdults",
                              "numberOfKids",
                              "notes",
                            ].includes(field)
                              ? `enquiry-${field}-error`
                              : undefined
                          }
                        >
                          {message}
                        </p>
                      ),
                    )}
                  </div>
                )}
                {/* Service Selection */}
                <div>
                  <label
                    htmlFor="enquiry-serviceId"
                    className="block text-xs font-medium text-zinc-700 mb-1"
                  >
                    Travel Service Needed *
                  </label>
                  <select
                    id="enquiry-serviceId"
                    aria-describedby={
                      validationErrors.serviceId
                        ? "enquiry-serviceId-error"
                        : undefined
                    }
                    aria-invalid={!!validationErrors.serviceId}
                    value={formData.serviceId}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceId: e.target.value })
                    }
                    disabled={
                      isLoadingServices || !!defaultPackageId || !!servicesError
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                  >
                    <option value="">Select a service</option>
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
                    <p
                      id="enquiry-serviceId-error"
                      className="text-[11px] text-rose-600 mt-1"
                    >
                      {validationErrors.serviceId}
                    </p>
                  )}
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="enquiry-fullName"
                      className="block text-xs font-medium text-zinc-700 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      autoComplete="name"
                      id="enquiry-fullName"
                      aria-describedby={
                        validationErrors.fullName
                          ? "enquiry-fullName-error"
                          : undefined
                      }
                      aria-invalid={!!validationErrors.fullName}
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder:text-zinc-400"
                    />
                    {validationErrors.fullName && (
                      <p
                        id="enquiry-fullName-error"
                        className="text-[11px] text-rose-600 mt-1"
                      >
                        {validationErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-phone"
                      className="block text-xs font-medium text-zinc-700 mb-1"
                    >
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="10-digit number"
                      id="enquiry-phone"
                      aria-describedby={
                        validationErrors.phone
                          ? "enquiry-phone-error"
                          : undefined
                      }
                      aria-invalid={!!validationErrors.phone}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder:text-zinc-400 font-mono"
                    />
                    {validationErrors.phone && (
                      <p
                        id="enquiry-phone-error"
                        className="text-[11px] text-rose-600 mt-1"
                      >
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="enquiry-email"
                      className="block text-xs font-medium text-zinc-700 mb-1"
                    >
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      id="enquiry-email"
                      aria-describedby={
                        validationErrors.email
                          ? "enquiry-email-error"
                          : undefined
                      }
                      aria-invalid={!!validationErrors.email}
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder:text-zinc-400"
                    />
                    {validationErrors.email && (
                      <p
                        id="enquiry-email-error"
                        className="text-[11px] text-rose-600 mt-1"
                      >
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-travelDate"
                      className="block text-xs font-medium text-zinc-700 mb-1"
                    >
                      Expected Travel Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="enquiry-travelDate"
                        aria-describedby={
                          validationErrors.travelDate
                            ? "enquiry-travelDate-error"
                            : undefined
                        }
                        aria-invalid={!!validationErrors.travelDate}
                        value={formData.travelDate || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            travelDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Passengers (Adults & Kids) */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <div>
                    <label
                      htmlFor="enquiry-numberOfAdults"
                      className="block text-[11px] font-medium text-zinc-600 mb-1 flex items-center gap-1"
                    >
                      <Users className="w-3 h-3" /> Adults (12+ yrs)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      step={1}
                      id="enquiry-numberOfAdults"
                      aria-describedby={
                        validationErrors.numberOfAdults
                          ? "enquiry-numberOfAdults-error"
                          : undefined
                      }
                      aria-invalid={!!validationErrors.numberOfAdults}
                      value={formData.numberOfAdults ?? 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numberOfAdults: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-numberOfKids"
                      className="block text-[11px] font-medium text-zinc-600 mb-1 flex items-center gap-1"
                    >
                      <Users className="w-3 h-3" /> Children (0-11 yrs)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={1}
                      id="enquiry-numberOfKids"
                      aria-describedby={
                        validationErrors.numberOfKids
                          ? "enquiry-numberOfKids-error"
                          : undefined
                      }
                      aria-invalid={!!validationErrors.numberOfKids}
                      value={formData.numberOfKids || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numberOfKids: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>
                </div>

                {/* Special Requests / Notes */}
                <div>
                  <label
                    htmlFor="enquiry-notes"
                    className="block text-xs font-medium text-zinc-700 mb-1"
                  >
                    Special Preferences or Itinerary Requests
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    placeholder="e.g. Need 4-star hotel in Bur Dubai, Burj Khalifa top floor tickets, vegetarian meal preferences..."
                    id="enquiry-notes"
                    aria-describedby={
                      validationErrors.notes ? "enquiry-notes-error" : undefined
                    }
                    aria-invalid={!!validationErrors.notes}
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
                    disabled={
                      isSubmitting ||
                      isLoadingServices ||
                      !!servicesError ||
                      services.length === 0
                    }
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
              </fieldset>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
};
