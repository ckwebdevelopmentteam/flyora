"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Loader2,
  Check,
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
  Hotel,
  Luggage,
  Package,
  Compass,
  PenLine,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import type { PublicEnquiryInput } from "@flyora/validators";
import type { ServiceSummary } from "@flyora/types";
import { enquiryFormSchema, whatsappLink } from "../lib/enquiry";

export interface EnquiryPrefill {
  serviceId?: string;
  serviceName?: string;
  destination?: string;
  origin?: string;
  travelDate?: string;
  adults?: number;
  children?: number;
  tierOrClass?: string;
  summaryLabel?: string;
  notes?: string;
}

export interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceId?: string;
  defaultPackageId?: string;
  packageTitle?: string;
  prefill?: EnquiryPrefill;
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

// Dynamic Icon Resolver based on service name & slug
const getServiceIcon = (service: { name: string; slug?: string }) => {
  const text = `${service.name} ${service.slug || ""}`.toLowerCase();
  if (
    text.includes("flight") ||
    text.includes("airline") ||
    text.includes("plane") ||
    text.includes("air")
  ) {
    return Plane;
  }
  if (text.includes("bus") || text.includes("coach")) {
    return Bus;
  }
  if (
    text.includes("train") ||
    text.includes("rail") ||
    text.includes("metro")
  ) {
    return Train;
  }
  if (
    text.includes("hotel") ||
    text.includes("resort") ||
    text.includes("stay") ||
    text.includes("room") ||
    text.includes("accommodation")
  ) {
    return Hotel;
  }
  if (text.includes("visa") || text.includes("passport")) {
    return PassportIcon;
  }
  if (
    text.includes("hajj") ||
    text.includes("umrah") ||
    text.includes("pilgrim") ||
    text.includes("makkah") ||
    text.includes("madinah")
  ) {
    return Package;
  }
  if (
    text.includes("holiday") ||
    text.includes("tour") ||
    text.includes("trip") ||
    text.includes("vacation") ||
    text.includes("package")
  ) {
    return Luggage;
  }
  return Compass;
};

// Formatter to clean up any odd admin casing while preserving service naming
const formatServiceName = (name: string) => {
  if (name.toLowerCase() === "bus booking") return "Bus Booking";
  return name;
};

export const EnquiryModal: React.FC<EnquiryModalProps> = (props) =>
  props.isOpen ? (
    <EnquiryForm
      key={`${props.defaultServiceId || ""}:${props.defaultPackageId || ""}:${props.prefill?.destination || ""}:${props.prefill?.summaryLabel || ""}`}
      {...props}
    />
  ) : null;

const EnquiryForm: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  defaultServiceId,
  defaultPackageId,
  packageTitle,
  prefill,
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

  const isIsoDate =
    prefill?.travelDate && /^\d{4}-\d{2}-\d{2}$/.test(prefill.travelDate);

  const [formData, setFormData] = useState<Partial<PublicEnquiryInput>>({
    fullName: "",
    phone: "",
    email: "",
    serviceId: defaultServiceId || prefill?.serviceId || "",
    packageId: defaultPackageId,
    travelDate: isIsoDate ? prefill!.travelDate! : "",
    numberOfAdults: prefill?.adults ?? 1,
    numberOfKids: prefill?.children ?? 0,
    notes:
      packageTitle && packageTitle.includes("|")
        ? packageTitle
        : prefill?.notes || "",
  });

  // Dynamic service-specific fields state (prefilled from user's hero selection)
  const [customDestination, setCustomDestination] = useState(
    prefill?.destination || "",
  );
  const [customTimeline, setCustomTimeline] = useState(
    prefill?.travelDate || "",
  );
  const [customTierOrClass, setCustomTierOrClass] = useState(
    prefill?.tierOrClass || "",
  );

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

  // Helper to determine service category for dynamic inputs
  const getServiceCategory = (
    name?: string,
    slug?: string,
  ): "flight" | "visa" | "train" | "bus" | "umrah" | "hajj" | "holiday" => {
    const text = `${name || ""} ${slug || ""}`.toLowerCase();
    if (
      text.includes("flight") ||
      text.includes("plane") ||
      text.includes("air")
    )
      return "flight";
    if (text.includes("visa") || text.includes("passport")) return "visa";
    if (text.includes("train") || text.includes("rail")) return "train";
    if (text.includes("bus") || text.includes("coach")) return "bus";
    if (text.includes("hajj")) return "hajj";
    if (text.includes("umrah")) return "umrah";
    return "holiday";
  };

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

          // Find initial service matching prefill, defaultServiceId, packageTitle, or fallback
          let initialId = defaultServiceId || prefill?.serviceId || "";
          const targetService = (
            prefill?.serviceName ||
            prefill?.serviceId ||
            defaultServiceId ||
            ""
          ).toLowerCase();

          if (targetService) {
            const match = data.data.find((s: ServiceSummary) => {
              const sName = s.name.toLowerCase();
              const sSlug = (s.slug || "").toLowerCase();
              const sId = s.id.toLowerCase();
              return (
                sId === targetService ||
                sName === targetService ||
                sSlug === targetService ||
                sName.includes(targetService) ||
                targetService.includes(sName)
              );
            });
            if (match) initialId = match.id;
          }

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
            serviceId:
              prev.serviceId &&
              data.data.some((s: ServiceSummary) => s.id === prev.serviceId)
                ? prev.serviceId
                : initialId,
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
    prefill,
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

    // Compile dynamic structured details into notes so coordinator/admin receives exact selections
    const selectedSrv = services.find((s) => s.id === result.data.serviceId);
    const category = getServiceCategory(selectedSrv?.name, selectedSrv?.slug);
    const detailLines: string[] = [];

    if (category === "flight") {
      if (customDestination)
        detailLines.push(`Flight Route: ${customDestination}`);
      if (customTierOrClass)
        detailLines.push(`Cabin Class: ${customTierOrClass}`);
      if (customTimeline)
        detailLines.push(`Departure Window: ${customTimeline}`);
    } else if (category === "visa") {
      if (customDestination)
        detailLines.push(`Visa Country: ${customDestination}`);
      if (customTimeline)
        detailLines.push(`Processing Timeline: ${customTimeline}`);
    } else if (category === "train") {
      if (customDestination)
        detailLines.push(`Train Route: ${customDestination}`);
      if (customTierOrClass)
        detailLines.push(`Rail Class: ${customTierOrClass}`);
      if (customTimeline) detailLines.push(`Travel Date: ${customTimeline}`);
    } else if (category === "bus") {
      if (customDestination)
        detailLines.push(`Bus Route: ${customDestination}`);
      if (customTierOrClass)
        detailLines.push(`Coach Type: ${customTierOrClass}`);
      if (customTimeline) detailLines.push(`Travel Date: ${customTimeline}`);
    } else if (category === "umrah") {
      if (customDestination)
        detailLines.push(`Umrah Tier: ${customDestination}`);
      if (customTimeline) detailLines.push(`Season: ${customTimeline}`);
    } else if (category === "hajj") {
      if (customDestination)
        detailLines.push(`Hajj Tier: ${customDestination}`);
      if (customTimeline) detailLines.push(`Hajj Season: ${customTimeline}`);
    } else {
      if (customDestination)
        detailLines.push(`Destination: ${customDestination}`);
      if (customTimeline) detailLines.push(`Travel Period: ${customTimeline}`);
      if (customTierOrClass)
        detailLines.push(`Preference: ${customTierOrClass}`);
    }

    const userNotes = (result.data.notes || "").trim();
    const serviceName = selectedSrv?.name || "Service";
    const compiledNotes =
      detailLines.length > 0
        ? `[${serviceName} Selection]\n${detailLines.join("\n")}${userNotes ? `\n\nNotes:\n${userNotes}` : ""}`.slice(
            0,
            1000,
          )
        : userNotes;

    const payload = {
      ...result.data,
      notes: compiledNotes || undefined,
    };

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
        body: JSON.stringify(payload),
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

  const selectedServiceObj = services.find((s) => s.id === formData.serviceId);
  const currentCategory = getServiceCategory(
    selectedServiceObj?.name,
    selectedServiceObj?.slug,
  );

  const getTravelerLabel = () => {
    if (currentCategory === "visa") return "Visa Applicants";
    if (currentCategory === "umrah" || currentCategory === "hajj")
      return "Number of Pilgrims";
    if (["flight", "train", "bus"].includes(currentCategory))
      return "Number of Passengers";
    return "Number of Travellers";
  };

  const whatsappUrl = whatsappLink(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    submissionSuccess
      ? `Hi Flyora Travels, my enquiry reference is ${submissionSuccess.leadId}.`
      : `Hi Flyora Travels, I need help with an enquiry for ${selectedServiceObj?.name || prefill?.serviceName || "Travel Services"}${customDestination ? ` (${customDestination})` : ""}.`,
  );

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
                {/* Prefilled Confirmation Banner */}
                {prefill && (prefill.summaryLabel || prefill.destination) && (
                  <div className="flex items-start sm:items-center gap-2.5 px-4 py-3 rounded-[8px] bg-blue-50/90 border border-blue-200/90 text-blue-950 text-xs sm:text-[13px] shadow-2xs">
                    <Sparkles className="w-4 h-4 text-[#002f89] shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-[#002f89]">
                        Prefilled from your selection:
                      </span>{" "}
                      <span className="text-neutral-800 font-medium">
                        {prefill.summaryLabel ||
                          [
                            prefill.serviceName,
                            prefill.destination,
                            prefill.travelDate,
                            prefill.tierOrClass,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                      </span>
                    </div>
                  </div>
                )}

                {servicesError && (
                  <div
                    role="alert"
                    className="text-xs text-rose-700 bg-rose-50 p-3.5 rounded-[8px] border border-rose-200"
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
                  <div className="p-3.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
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
                    className="text-xs text-rose-700 bg-rose-50/80 p-3 rounded-[8px] border border-rose-100"
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
                      className={`relative rounded-[8px] border bg-white focus-within:ring-2 focus-within:ring-[#002f89]/20 transition-all flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 gap-2.5 ${
                        validationErrors.fullName
                          ? "border-rose-400 focus-within:border-rose-500"
                          : "border-neutral-200 focus-within:border-[#002f89]"
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
                      className={`relative rounded-[8px] border bg-white focus-within:ring-2 focus-within:ring-[#002f89]/20 transition-all flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 gap-2.5 ${
                        validationErrors.email
                          ? "border-rose-400 focus-within:border-rose-500"
                          : "border-neutral-200 focus-within:border-[#002f89]"
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
                      className={`relative rounded-[8px] border bg-white focus-within:ring-2 focus-within:ring-[#002f89]/20 transition-all flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 gap-2.5 ${
                        validationErrors.phone
                          ? "border-rose-400 focus-within:border-rose-500"
                          : "border-neutral-200 focus-within:border-[#002f89]"
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

                {/* 2. ROW 2: Travel Service * (Dynamic backend services grid) */}
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

                  {isLoadingServices ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="h-[52px] sm:h-[56px] rounded-[8px] bg-neutral-100/70 border border-neutral-200/50 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : services.length === 0 ? (
                    <div className="p-4 rounded-[8px] border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                      No travel services available at the moment.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
                      {services.map((srv) => {
                        const IconComponent = getServiceIcon(srv);
                        const isSelected = formData.serviceId === srv.id;

                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                serviceId: srv.id,
                              }));
                            }}
                            className={`group flex items-center justify-between px-4 sm:px-4.5 py-3 sm:py-3.5 rounded-[8px] transition-all duration-200 ease-in-out cursor-pointer select-none text-left border active:scale-[0.98] ${
                              isSelected
                                ? "bg-[#002f89] text-white border-[#002f89] hover:bg-[#00246b] hover:border-[#00246b] shadow-sm"
                                : "bg-white text-neutral-800 border-neutral-200 hover:bg-[#F5F2EB] hover:border-neutral-300 hover:text-neutral-950 hover:shadow-2xs"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-1">
                              <IconComponent
                                className={`w-5 h-5 shrink-0 transition-all duration-200 ${
                                  isSelected
                                    ? "text-white"
                                    : "text-neutral-600 group-hover:text-neutral-900"
                                }`}
                              />
                              <span
                                className={`text-[13px] sm:text-[13.5px] font-medium truncate transition-colors duration-200 ${
                                  isSelected
                                    ? "text-white font-semibold"
                                    : "text-neutral-800 group-hover:text-neutral-950"
                                }`}
                              >
                                {formatServiceName(srv.name)}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-white text-[#002f89] flex items-center justify-center shrink-0 ml-1.5 shadow-2xs">
                                <Check className="w-2.5 h-2.5 stroke-[3] text-[#002f89]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {validationErrors.serviceId && (
                    <p className="text-[11px] text-rose-600 mt-1.5">
                      {validationErrors.serviceId}
                    </p>
                  )}
                </div>

                {/* 2.5 SERVICE-SPECIFIC CONTEXTUAL FIELDS */}
                <div className="bg-[#FAF9F6] border border-neutral-200/90 rounded-[8px] p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2">
                    <span className="text-[11.5px] sm:text-[12px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5 font-sans">
                      <Sparkles className="w-3.5 h-3.5 text-[#002f89]" />
                      {selectedServiceObj?.name || "Service"} Specific Details
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Customized Options
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                    {/* FLIGHT FIELDS */}
                    {currentCategory === "flight" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Flight Route (From → To)
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Plane className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                              type="text"
                              value={customDestination}
                              onChange={(e) =>
                                setCustomDestination(e.target.value)
                              }
                              placeholder="e.g. Mumbai (BOM) → Dubai (DXB)"
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Cabin Class Preference
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                            <select
                              value={customTierOrClass}
                              onChange={(e) =>
                                setCustomTierOrClass(e.target.value)
                              }
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none cursor-pointer"
                            >
                              <option value="">Select cabin class...</option>
                              <option value="Economy Class">
                                Economy Class
                              </option>
                              <option value="Premium Economy">
                                Premium Economy
                              </option>
                              <option value="Business Class">
                                Business Class
                              </option>
                              <option value="First Class Suite">
                                First Class Suite
                              </option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* VISA FIELDS */}
                    {currentCategory === "visa" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Visa Destination Country
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <PassportIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                              type="text"
                              value={customDestination}
                              onChange={(e) =>
                                setCustomDestination(e.target.value)
                              }
                              placeholder="e.g. Schengen Europe, UK, USA, Dubai"
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Processing Timeline
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                            <select
                              value={customTimeline}
                              onChange={(e) =>
                                setCustomTimeline(e.target.value)
                              }
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none cursor-pointer"
                            >
                              <option value="">
                                Select processing speed...
                              </option>
                              <option value="Within 30 Days">
                                Within 30 Days
                              </option>
                              <option value="Express 7–10 Days">
                                Express 7–10 Days
                              </option>
                              <option value="Next 30–60 Days">
                                Next 30–60 Days
                              </option>
                              <option value="Flexible Dates">
                                Flexible Dates
                              </option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* TRAIN FIELDS */}
                    {currentCategory === "train" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Train / Station Route
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Train className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                              type="text"
                              value={customDestination}
                              onChange={(e) =>
                                setCustomDestination(e.target.value)
                              }
                              placeholder="e.g. New Delhi → Mumbai Central"
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Rail Class Preference
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                            <select
                              value={customTierOrClass}
                              onChange={(e) =>
                                setCustomTierOrClass(e.target.value)
                              }
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none cursor-pointer"
                            >
                              <option value="">Select rail class...</option>
                              <option value="1st AC (1A) Confirmed">
                                1st AC (1A) Confirmed
                              </option>
                              <option value="2nd AC (2A)">2nd AC (2A)</option>
                              <option value="3rd AC (3A)">3rd AC (3A)</option>
                              <option value="Executive Chair Car (EC)">
                                Executive Chair Car (EC)
                              </option>
                              <option value="Sleeper Class (SL)">
                                Sleeper Class (SL)
                              </option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* BUS FIELDS */}
                    {currentCategory === "bus" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Bus Route / Cities
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Bus className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                              type="text"
                              value={customDestination}
                              onChange={(e) =>
                                setCustomDestination(e.target.value)
                              }
                              placeholder="e.g. Bangalore → Goa (Panjim)"
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Coach / Seat Preference
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                            <select
                              value={customTierOrClass}
                              onChange={(e) =>
                                setCustomTierOrClass(e.target.value)
                              }
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none cursor-pointer"
                            >
                              <option value="">
                                Select coach preference...
                              </option>
                              <option value="2 Sleeper Berths (Volvo AC)">
                                2 Sleeper Berths (Volvo AC)
                              </option>
                              <option value="1 Single Lower Sleeper">
                                1 Single Lower Sleeper
                              </option>
                              <option value="2 Semi-Sleeper Seats">
                                2 Semi-Sleeper Seats
                              </option>
                              <option value="Full Luxury Coach Charter (35+)">
                                Full Luxury Coach Charter (35+)
                              </option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* UMRAH FIELDS */}
                    {currentCategory === "umrah" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Umrah Package Tier
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Sparkles className="w-4 h-4 text-[#002f89] shrink-0" />
                            <select
                              value={customDestination}
                              onChange={(e) =>
                                setCustomDestination(e.target.value)
                              }
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none cursor-pointer"
                            >
                              <option value="">Select package tier...</option>
                              <option value="Executive 5-Star (Courtyard Facing)">
                                Executive 5-Star (Courtyard Facing)
                              </option>
                              <option value="Deluxe Makkah & Madinah (10D)">
                                Deluxe Makkah & Madinah (10D)
                              </option>
                              <option value="Ramadan Special Umrah">
                                Ramadan Special Umrah
                              </option>
                              <option value="Economy Family Umrah">
                                Economy Family Umrah
                              </option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Preferred Travel Period
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                              type="text"
                              value={customTimeline}
                              onChange={(e) =>
                                setCustomTimeline(e.target.value)
                              }
                              placeholder="e.g. Next 30 Days, Nov – Dec 2026, Ramadan"
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* HAJJ FIELDS */}
                    {currentCategory === "hajj" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Hajj Package Tier
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Sparkles className="w-4 h-4 text-[#002f89] shrink-0" />
                            <select
                              value={customDestination}
                              onChange={(e) =>
                                setCustomDestination(e.target.value)
                              }
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none cursor-pointer"
                            >
                              <option value="">Select Hajj tier...</option>
                              <option value="Executive Non-Shifting (Mina A)">
                                Executive Non-Shifting (Mina A)
                              </option>
                              <option value="Deluxe Shifting (Mina & Azizia)">
                                Deluxe Shifting (Mina & Azizia)
                              </option>
                              <option value="Economy VIP Guided">
                                Economy VIP Guided
                              </option>
                              <option value="Private Luxury Camp">
                                Private Luxury Camp
                              </option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Hajj Season / Year
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                              type="text"
                              value={customTimeline}
                              onChange={(e) =>
                                setCustomTimeline(e.target.value)
                              }
                              placeholder="e.g. May – Jun 2027, Advance Waitlist 2028"
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* CUSTOM HOLIDAY FIELDS */}
                    {currentCategory === "holiday" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Target Destination / Region
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                              type="text"
                              value={customDestination}
                              onChange={(e) =>
                                setCustomDestination(e.target.value)
                              }
                              placeholder="e.g. Switzerland & The Alps, Bali, Maldives"
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                            Preferred Travel Period
                          </label>
                          <div className="relative rounded-[8px] border border-neutral-200 bg-white px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all">
                            <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                              type="text"
                              value={customTimeline}
                              onChange={(e) =>
                                setCustomTimeline(e.target.value)
                              }
                              placeholder="e.g. Nov – Dec 2026, Summer 2027, Flexible"
                              className="w-full text-xs sm:text-[13px] text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. ROW 3: Preferred Travel Date & Number of Travellers */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4">
                  {/* Preferred Travel Date */}
                  <div className="sm:col-span-5">
                    <label
                      htmlFor="enquiry-travelDate"
                      className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-2"
                    >
                      Preferred Travel Date
                    </label>
                    <div className="relative rounded-[8px] border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all flex items-center px-4 py-2.5 sm:py-3 gap-2.5 cursor-pointer h-[46px] sm:h-[50px]">
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
                  <div className="sm:col-span-7">
                    <label className="block text-xs sm:text-[13px] font-semibold text-neutral-800 mb-2">
                      {getTravelerLabel()}
                    </label>
                    <div className="rounded-[8px] border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex items-center divide-x divide-neutral-200 overflow-hidden h-[46px] sm:h-[50px]">
                      {/* Adults */}
                      <div className="flex-1 flex items-center justify-between px-3 sm:px-3.5 py-1 gap-2 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0 truncate">
                          <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                          <label
                            htmlFor="enquiry-numberOfAdults"
                            className="text-xs sm:text-[13px] font-medium text-neutral-700 truncate cursor-pointer"
                          >
                            {currentCategory === "visa"
                              ? "Adults (18+)"
                              : currentCategory === "umrah" ||
                                  currentCategory === "hajj"
                                ? "Adult Pilgrims"
                                : "Adults (12+)"}
                          </label>
                        </div>
                        <input
                          type="number"
                          id="enquiry-numberOfAdults"
                          aria-label="Adults"
                          min={1}
                          max={50}
                          value={adultsInput}
                          onChange={handleAdultsChange}
                          onBlur={handleAdultsBlur}
                          className="w-9 sm:w-10 text-center font-semibold text-xs sm:text-[13px] text-neutral-900 bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white focus:ring-2 focus:ring-[#002f89]/20 border border-neutral-200 focus:border-[#002f89] rounded-md py-1 px-1 outline-none transition cursor-text shrink-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      {/* Children / Minors */}
                      <div className="flex-1 flex items-center justify-between px-3 sm:px-3.5 py-1 gap-2 min-w-0">
                        <label
                          htmlFor="enquiry-numberOfKids"
                          className="text-xs sm:text-[13px] font-medium text-neutral-700 truncate pl-0.5 cursor-pointer"
                        >
                          {currentCategory === "visa"
                            ? "Minors (0–17)"
                            : currentCategory === "umrah" ||
                                currentCategory === "hajj"
                              ? "Child Pilgrims"
                              : "Children (0–11)"}
                        </label>
                        <input
                          type="number"
                          id="enquiry-numberOfKids"
                          aria-label="Children"
                          min={0}
                          max={20}
                          value={kidsInput}
                          onChange={handleKidsChange}
                          onBlur={handleKidsBlur}
                          className="w-9 sm:w-10 text-center font-semibold text-xs sm:text-[13px] text-neutral-900 bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white focus:ring-2 focus:ring-[#002f89]/20 border border-neutral-200 focus:border-[#002f89] rounded-md py-1 px-1 outline-none transition cursor-text shrink-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  <div className="rounded-[8px] border border-neutral-200 bg-white hover:border-neutral-300 focus-within:border-[#002f89] focus-within:ring-2 focus-within:ring-[#002f89]/15 transition-all p-4 flex items-start gap-3">
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
                    className="px-6 py-2.5 sm:py-3 rounded-[8px] text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
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
                    className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-[8px] bg-[#002f89] hover:bg-[#00246b] active:bg-[#001c54] text-white text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-[0_4px_14px_rgba(0,47,137,0.3)] hover:shadow-[0_6px_20px_rgba(0,47,137,0.45)] transition-all cursor-pointer disabled:opacity-60 active:scale-95"
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
