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
  User,
  Mail,
  Phone,
  Calendar,
  Plane,
  Bus,
  Train,
  Luggage,
  Package,
  PenLine,
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

// Custom Passport Icon matching the reference design in media_1793685416686_e324fab2.jpg
const PassportIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <circle cx="12" cy="11" r="3.2" />
    <path d="M8.5 11h7" />
    <path d="M12 7.8v6.4" />
    <line x1="9" y1="17.5" x2="15" y2="17.5" />
  </svg>
);

// 6 Target travel services from reference design
const SERVICE_DEFINITIONS = [
  {
    key: "flight",
    label: "Flight Booking",
    icon: Plane,
    matchKeywords: ["flight", "corporate-flight", "flights"],
  },
  {
    key: "bus",
    label: "Bus Booking",
    icon: Bus,
    matchKeywords: ["bus", "buses"],
  },
  {
    key: "train",
    label: "Train Booking",
    icon: Train,
    matchKeywords: ["train", "trains"],
  },
  {
    key: "visa",
    label: "Visa Assistance",
    icon: PassportIcon,
    matchKeywords: ["visa", "visas"],
  },
  {
    key: "holiday",
    label: "Holiday Package",
    icon: Luggage,
    matchKeywords: ["holiday", "holidays", "custom", "tour"],
  },
  {
    key: "hajj",
    label: "Hajj Package",
    icon: Package,
    matchKeywords: ["hajj", "umrah", "pilgrimage"],
  },
];

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
    notes: packageTitle && packageTitle.includes("|") ? packageTitle : "",
  });

  const [adultsInput, setAdultsInput] = useState(
    String(formData.numberOfAdults ?? 1),
  );
  const [kidsInput, setKidsInput] = useState(
    String(formData.numberOfKids ?? 0),
  );

  useEffect(() => {
    setAdultsInput(String(formData.numberOfAdults ?? 1));
  }, [formData.numberOfAdults]);

  useEffect(() => {
    setKidsInput(String(formData.numberOfKids ?? 0));
  }, [formData.numberOfKids]);

  const handleAdultsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setAdultsInput(val);
      if (val !== "") {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) {
          setFormData((prev) => ({ ...prev, numberOfAdults: parsed }));
        }
      }
    }
  };

  const handleAdultsBlur = () => {
    const parsed = parseInt(adultsInput, 10);
    const clamped = isNaN(parsed) || parsed < 1 ? 1 : Math.min(50, parsed);
    setAdultsInput(String(clamped));
    setFormData((prev) => ({ ...prev, numberOfAdults: clamped }));
  };

  const handleKidsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setKidsInput(val);
      if (val !== "") {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) {
          setFormData((prev) => ({ ...prev, numberOfKids: parsed }));
        }
      }
    }
  };

  const handleKidsBlur = () => {
    const parsed = parseInt(kidsInput, 10);
    const clamped = isNaN(parsed) || parsed < 0 ? 0 : Math.min(20, parsed);
    setKidsInput(String(clamped));
    setFormData((prev) => ({ ...prev, numberOfKids: clamped }));
  };

  const stepAdults = (delta: number) => {
    const current = formData.numberOfAdults ?? 1;
    const next = Math.min(50, Math.max(1, current + delta));
    setAdultsInput(String(next));
    setFormData((prev) => ({ ...prev, numberOfAdults: next }));
  };

  const stepKids = (delta: number) => {
    const current = formData.numberOfKids ?? 0;
    const next = Math.min(20, Math.max(0, current + delta));
    setKidsInput(String(next));
    setFormData((prev) => ({ ...prev, numberOfKids: next }));
  };

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

          // Find initial service matching defaultServiceId, packageTitle, or fallback
          let initialId = defaultServiceId || "";
          if (!initialId && packageTitle && typeof packageTitle === "string") {
            const titleLower = packageTitle.toLowerCase();
            // Match keywords intelligently
            const found = data.data.find((s: ServiceSummary) => {
              const nameLower = s.name.toLowerCase();
              const slugLower = (s.slug || "").toLowerCase();
              if (titleLower.includes("hajj") || titleLower.includes("umrah")) {
                return (
                  nameLower.includes("hajj") ||
                  nameLower.includes("umrah") ||
                  slugLower.includes("hajj")
                );
              }
              if (titleLower.includes("holiday")) {
                return (
                  nameLower.includes("holiday") || slugLower.includes("holiday")
                );
              }
              if (titleLower.includes("flight")) {
                return (
                  nameLower.includes("flight") || slugLower.includes("flight")
                );
              }
              if (titleLower.includes("visa")) {
                return nameLower.includes("visa") || slugLower.includes("visa");
              }
              if (titleLower.includes("bus")) {
                return nameLower.includes("bus") || slugLower.includes("bus");
              }
              if (titleLower.includes("train")) {
                return (
                  nameLower.includes("train") || slugLower.includes("train")
                );
              }
              return (
                titleLower.includes(nameLower) || titleLower.includes(slugLower)
              );
            });
            if (found) initialId = found.id;
          }

          if (
            !initialId ||
            !data.data.some((s: ServiceSummary) => s.id === initialId)
          ) {
            initialId = defaultPackageId ? "" : data.data[0].id;
          }

          setFormData((prev) => ({
            ...prev,
            serviceId: prev.serviceId || initialId,
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
  }, [
    isOpen,
    apiUrl,
    defaultServiceId,
    defaultPackageId,
    serviceAttempt,
    packageTitle,
  ]);

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
      phone: formData.phone?.trim(),
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
            : "Your enquiry has been received. Our team will get in touch with the best options for you shortly.",
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

  // Helper to map card definition to backend service ID
  const getServiceForCard = (def: (typeof SERVICE_DEFINITIONS)[0]) => {
    if (!services.length) return null;
    return (
      services.find((s) =>
        def.matchKeywords.some(
          (kw) =>
            s.name.toLowerCase().includes(kw) ||
            (s.slug || "").toLowerCase().includes(kw),
        ),
      ) || null
    );
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="enquiry-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="fixed inset-0 m-auto w-[94vw] max-w-[840px] max-h-[92vh] p-0 rounded-[30px] sm:rounded-[36px] bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm shadow-[0_30px_90px_rgba(0,0,0,0.35)] border-0"
    >
      <div className="bg-white rounded-[30px] sm:rounded-[36px] shadow-2xl border border-neutral-100 w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header matching exact user uploaded mockup in media_1793685416686_e324fab2.jpg */}
        <div className="relative pt-8 sm:pt-9 px-7 sm:px-10 pb-5 bg-white flex items-start justify-between gap-5">
          <div className="max-w-lg">
            <h3
              id="enquiry-title"
              className="text-2xl sm:text-[27px] font-bold text-neutral-900 tracking-tight leading-tight font-sans"
            >
              Plan Your Trip with Us
            </h3>
            <p className="text-xs sm:text-[14px] text-neutral-500 font-normal leading-relaxed mt-1.5">
              Tell us your travel plans and our team will get in touch with the
              best options for you.
            </p>
          </div>

          <div className="flex items-center gap-3.5 shrink-0 pt-0.5">
            {/* Triple Overlapping Destination Circular Avatars */}
            <div
              className="flex items-center -space-x-3.5 select-none"
              aria-hidden="true"
            >
              <img
                src="/services/hajj-packages.jpg"
                alt=""
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-black/5"
              />
              <img
                src="/destinations/maldives_hd.jpg"
                alt=""
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-black/5"
              />
              <img
                src="/destinations/dubai_hd.jpg"
                alt=""
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-black/5"
              />
            </div>

            {/* Close Button */}
            <button
              type="button"
              aria-label="Close enquiry"
              disabled={isSubmitting}
              onClick={handleReset}
              className="p-1.5 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer outline-none focus:outline-none"
            >
              <X className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-7 sm:px-10 pb-6 sm:pb-8 overflow-y-auto flex-1 no-scrollbar">
          {submissionSuccess ? (
            /* Success State */
            <div className="text-center py-8 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-[#F0F7F4] text-[#1E4D3A] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1E4D3A]/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-neutral-900 mb-1.5 font-sans">
                Enquiry Done!
              </h4>
              <p className="text-sm text-neutral-600 mb-5 max-w-sm mx-auto leading-relaxed">
                {submissionSuccess.message}
              </p>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 mb-6 inline-block">
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                  Enquiry Reference ID
                </span>
                <span className="text-sm font-mono font-bold text-neutral-900">
                  {submissionSuccess.leadId}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    Chat on WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 text-xs font-semibold transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Form State matching reference design */
            <form
              onSubmit={handleSubmit}
              className="space-y-6 sm:space-y-6.5 pt-1"
            >
              <fieldset
                disabled={isSubmitting}
                className="space-y-6 sm:space-y-6.5 min-w-0"
              >
                {servicesError && (
                  <div
                    role="alert"
                    className="text-xs text-rose-700 bg-rose-50 p-3.5 rounded-xl border border-rose-200"
                  >
                    {servicesError}{" "}
                    <button
                      type="button"
                      onClick={() => setServiceAttempt((n) => n + 1)}
                      className="underline font-semibold cursor-pointer"
                    >
                      Retry loading services
                    </button>
                  </div>
                )}

                {serverError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
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
                  <div
                    role="alert"
                    className="text-xs text-rose-700 bg-rose-50/80 p-3 rounded-xl border border-rose-100"
                  >
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

                {/* 1. ROW 1: Full Name, Email Address, and Phone / WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4.5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="enquiry-fullName"
                      className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-2"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative rounded-2xl border bg-white focus-within:ring-2 focus-within:ring-[#1E4D3A]/20 transition-all flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 gap-2.5 ${
                        validationErrors.fullName
                          ? "border-rose-400 focus-within:border-rose-500"
                          : "border-neutral-200 focus-within:border-[#1E4D3A]"
                      }`}
                    >
                      <User className="w-4 h-4 text-neutral-400 shrink-0" />
                      <input
                        type="text"
                        id="enquiry-fullName"
                        autoComplete="name"
                        placeholder="Enter your full name"
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
                        className="w-full text-xs sm:text-[13.5px] text-neutral-900 placeholder:text-neutral-400 bg-transparent outline-none font-normal"
                      />
                    </div>
                    {validationErrors.fullName && (
                      <p
                        id="enquiry-fullName-error"
                        className="text-[11px] text-rose-600 mt-1"
                      >
                        {validationErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label
                      htmlFor="enquiry-email"
                      className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-2"
                    >
                      Email Address
                    </label>
                    <div
                      className={`relative rounded-2xl border bg-white focus-within:ring-2 focus-within:ring-[#1E4D3A]/20 transition-all flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 gap-2.5 ${
                        validationErrors.email
                          ? "border-rose-400 focus-within:border-rose-500"
                          : "border-neutral-200 focus-within:border-[#1E4D3A]"
                      }`}
                    >
                      <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                      <input
                        type="email"
                        id="enquiry-email"
                        autoComplete="email"
                        placeholder="Enter your email address"
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
                        className="w-full text-xs sm:text-[13.5px] text-neutral-900 placeholder:text-neutral-400 bg-transparent outline-none font-normal"
                      />
                    </div>
                    {validationErrors.email && (
                      <p
                        id="enquiry-email-error"
                        className="text-[11px] text-rose-600 mt-1"
                      >
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone / WhatsApp Number */}
                  <div>
                    <label
                      htmlFor="enquiry-phone"
                      className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-2"
                    >
                      Phone / WhatsApp Number{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`relative rounded-2xl border bg-white focus-within:ring-2 focus-within:ring-[#1E4D3A]/20 transition-all flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 gap-2.5 ${
                        validationErrors.phone
                          ? "border-rose-400 focus-within:border-rose-500"
                          : "border-neutral-200 focus-within:border-[#1E4D3A]"
                      }`}
                    >
                      <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                      <input
                        type="tel"
                        id="enquiry-phone"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="10-digit number"
                        aria-describedby={
                          validationErrors.phone
                            ? "enquiry-phone-error"
                            : undefined
                        }
                        aria-invalid={!!validationErrors.phone}
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full text-xs sm:text-[13.5px] text-neutral-900 placeholder:text-neutral-400 bg-transparent outline-none font-normal"
                      />
                    </div>
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

                {/* 2. ROW 2: Travel Service * (Exact 6-service grid matching reference) */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-2">
                    Travel Service <span className="text-red-500">*</span>
                  </label>

                  {/* Hidden accessible select for screen-readers & test verification */}
                  <select
                    id="enquiry-serviceId"
                    value={formData.serviceId}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceId: e.target.value })
                    }
                    className="sr-only"
                    aria-label="Travel Service Needed"
                  >
                    <option value="">Select a service</option>
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
                    {SERVICE_DEFINITIONS.map((def) => {
                      const IconComponent = def.icon;
                      const matchedService = getServiceForCard(def);
                      const isSelected =
                        matchedService &&
                        formData.serviceId === matchedService.id;

                      return (
                        <button
                          key={def.key}
                          type="button"
                          onClick={() => {
                            if (matchedService) {
                              setFormData({
                                ...formData,
                                serviceId: matchedService.id,
                              });
                            }
                          }}
                          className={`flex items-center justify-between px-4 sm:px-4.5 py-3.5 sm:py-4 rounded-2xl transition-all duration-200 cursor-pointer select-none text-left border ${
                            isSelected
                              ? "border-[#1E4D3A] bg-[#F0F7F4]/60 shadow-xs ring-1 ring-[#1E4D3A]"
                              : "border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-1">
                            <IconComponent
                              className={`w-5 h-5 shrink-0 transition-colors ${
                                isSelected
                                  ? "text-[#1E4D3A]"
                                  : "text-neutral-700"
                              }`}
                            />
                            <span
                              className={`text-[13px] sm:text-[13.5px] font-medium truncate ${
                                isSelected
                                  ? "text-[#1E4D3A] font-semibold"
                                  : "text-neutral-800"
                              }`}
                            >
                              {def.label}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#1E4D3A] text-white flex items-center justify-center shrink-0 ml-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white stroke-[#1E4D3A]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. ROW 3: Preferred Travel Date & Number of Travellers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Preferred Travel Date */}
                  <div>
                    <label
                      htmlFor="enquiry-travelDate"
                      className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-2"
                    >
                      Preferred Travel Date
                    </label>
                    <div className="relative rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-[#1E4D3A] focus-within:ring-2 focus-within:ring-[#1E4D3A]/20 transition-all flex items-center px-4 py-3 sm:py-3.5 gap-2.5 cursor-pointer">
                      <Calendar className="w-4 h-4 text-neutral-400 shrink-0 pointer-events-none" />
                      <input
                        type={formData.travelDate ? "date" : "text"}
                        onFocus={(e) => {
                          e.target.type = "date";
                          try {
                            e.target.showPicker?.();
                          } catch {}
                        }}
                        onBlur={(e) => {
                          if (!e.target.value) e.target.type = "text";
                        }}
                        id="enquiry-travelDate"
                        placeholder="Select travel date"
                        value={formData.travelDate || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            travelDate: e.target.value,
                          })
                        }
                        className="w-full text-xs sm:text-[13.5px] text-neutral-900 placeholder:text-neutral-400 bg-transparent outline-none font-normal cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Number of Travellers Split Component with direct number typing */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-2">
                      Number of Travellers
                    </label>
                    <div className="rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex items-center divide-x divide-neutral-200 py-1.5 sm:py-2">
                      {/* Adults (12+) */}
                      <div className="flex-1 flex items-center justify-between px-3.5 sm:px-4 py-1 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                          <label
                            htmlFor="enquiry-numberOfAdults"
                            className="text-xs sm:text-[13px] font-medium text-neutral-700 truncate cursor-pointer"
                          >
                            Adults (12+)
                          </label>
                        </div>
                        <input
                          type="number"
                          id="enquiry-numberOfAdults"
                          aria-label="Adults (12+ yrs)"
                          min={1}
                          max={50}
                          value={adultsInput}
                          onChange={handleAdultsChange}
                          onBlur={handleAdultsBlur}
                          className="w-12 sm:w-14 text-center font-semibold text-xs sm:text-[13.5px] text-neutral-900 bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white focus:ring-2 focus:ring-[#1E4D3A]/20 border border-neutral-200 focus:border-[#1E4D3A] rounded-xl py-1 sm:py-1.5 px-2 outline-none transition cursor-text"
                        />
                      </div>

                      {/* Children (0–11) */}
                      <div className="flex-1 flex items-center justify-between px-3.5 sm:px-4 py-1 gap-2">
                        <label
                          htmlFor="enquiry-numberOfKids"
                          className="text-xs sm:text-[13px] font-medium text-neutral-700 truncate pl-1 cursor-pointer"
                        >
                          Children (0–11)
                        </label>
                        <input
                          type="number"
                          id="enquiry-numberOfKids"
                          aria-label="Children (0-11 yrs)"
                          min={0}
                          max={20}
                          value={kidsInput}
                          onChange={handleKidsChange}
                          onBlur={handleKidsBlur}
                          className="w-12 sm:w-14 text-center font-semibold text-xs sm:text-[13.5px] text-neutral-900 bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white focus:ring-2 focus:ring-[#1E4D3A]/20 border border-neutral-200 focus:border-[#1E4D3A] rounded-xl py-1 sm:py-1.5 px-2 outline-none transition cursor-text"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. ROW 4: Special Requests (Optional) */}
                <div>
                  <label
                    htmlFor="enquiry-notes"
                    className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-2"
                  >
                    Special Requests (Optional)
                  </label>
                  <div className="rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-[#1E4D3A] focus-within:ring-2 focus-within:ring-[#1E4D3A]/20 transition-all p-4 flex items-start gap-3">
                    <PenLine className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <textarea
                      rows={3}
                      id="enquiry-notes"
                      maxLength={1000}
                      aria-label="Special Preferences or Itinerary Requests"
                      placeholder="Tell us about your destination, preferences or any specific requirements..."
                      value={formData.notes || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full text-xs sm:text-[13.5px] text-neutral-900 placeholder:text-neutral-400 bg-transparent outline-none resize-none font-normal leading-relaxed min-h-[90px]"
                    />
                  </div>
                </div>

                {/* 5. FOOTER: Cancel and Send Enquiry Buttons */}
                <div className="pt-5 sm:pt-6 border-t border-solid border-neutral-200/80 flex items-center justify-end gap-3.5 mt-6 sm:mt-7">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleReset}
                    className="px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    aria-label="Submit Travel Enquiry"
                    disabled={
                      isSubmitting ||
                      isLoadingServices ||
                      !!servicesError ||
                      services.length === 0
                    }
                    className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#13382C] hover:bg-[#0E2920] text-white text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Enquiry</span>
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
