import { useState, useId, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createLeadSchema, type CreateLeadInput } from "@flyora/validators";
import type { LeadItem, ServiceSummary, PackageSummary } from "@flyora/types";
import { leadsApi } from "../../../lib/leadsApi";
import { packagesApi } from "../../../lib/packagesApi";
import { useAuthStore } from "../../../stores/authStore";
import { userMessage } from "../../../lib/userMessage";
import { Modal, FormError } from "../../../components/ui/Modal";
import { Loader2, Plus } from "lucide-react";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lead: LeadItem) => void;
  services: ServiceSummary[];
  defaultServiceId?: string;
}

const SOURCES: { value: string; label: string }[] = [
  { value: "PHONE_CALL", label: "Phone Call" },
  { value: "DIRECT_WALK_IN", label: "Direct Walk-In" },
  { value: "WHATSAPP_CLICK", label: "WhatsApp Inquiry" },
  { value: "WEBSITE_FORM", label: "Website Form" },
];

const STAGES: { value: string; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUOTED", label: "Quoted" },
  { value: "NEGOTIATING", label: "Negotiating" },
];

export const AddLeadModal = ({
  isOpen,
  onClose,
  onSuccess,
  services,
  defaultServiceId,
}: AddLeadModalProps) => {
  const formId = useId();
  const user = useAuthStore((state) => state.user);
  const manager =
    user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER";

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter available services: Coordinators see only their assigned services if mapped
  const availableServices = services.filter(
    (service) =>
      manager ||
      !user?.services?.length ||
      user?.services?.some((m) => m.serviceId === service.id),
  );

  const displayServices =
    availableServices.length > 0 ? availableServices : services;

  const initialServiceId = defaultServiceId || displayServices[0]?.id || "";

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema as any),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      city: "",
      serviceId: initialServiceId,
      packageId: "",
      source: "PHONE_CALL",
      status: "NEW",
      travelDate: "",
      numberOfAdults: 1,
      numberOfKids: 0,
      estimatedBudget: undefined,
      note: "",
    },
  });

  const selectedServiceId = watch("serviceId");

  // Reset form when modal opens with proper default service
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      reset({
        fullName: "",
        phone: "",
        email: "",
        city: "",
        serviceId: initialServiceId,
        packageId: "",
        source: "PHONE_CALL",
        status: "NEW",
        travelDate: "",
        numberOfAdults: 1,
        numberOfKids: 0,
        estimatedBudget: undefined,
        note: "",
      });
    }
  }, [isOpen, initialServiceId, reset]);

  // Load tour packages if selected service has packages
  const { data: packagesData, isLoading: isLoadingPackages } = useQuery({
    queryKey: ["packages", "by-service", selectedServiceId],
    queryFn: () =>
      packagesApi.listPackages({
        serviceId: selectedServiceId,
        limit: 100,
      }),
    enabled: !!selectedServiceId && isOpen,
  });

  const packagesList: PackageSummary[] = packagesData?.items || [];

  const createMutation = useMutation({
    mutationFn: (data: CreateLeadInput) => {
      // Clean up empty optional fields
      const payload: CreateLeadInput = {
        ...data,
        email: data.email?.trim() || undefined,
        city: data.city?.trim() || undefined,
        packageId: data.packageId?.trim() || undefined,
        travelDate: data.travelDate?.trim() || undefined,
        estimatedBudget: data.estimatedBudget
          ? Number(data.estimatedBudget)
          : undefined,
        note: data.note?.trim() || undefined,
      };
      return leadsApi.createLead(payload);
    },
    onSuccess: (lead) => {
      reset();
      onSuccess(lead);
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(
        userMessage(err, "We couldn't add this lead. Please try again."),
      );
    },
  });

  if (!isOpen) return null;

  return (
    <Modal
      title="Add new enquiry"
      description="Record a new customer enquiry. It will be automatically assigned to you in My enquiries."
      onClose={onClose}
      busy={createMutation.isPending}
      wide
      footer={
        <>
          <button
            type="button"
            className="button-secondary"
            disabled={createMutation.isPending}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            className="button-primary"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Adding lead…
              </>
            ) : (
              <>
                <Plus size={16} />
                Add & Assign to Me
              </>
            )}
          </button>
        </>
      }
    >
      <FormError>{errorMessage}</FormError>

      <form
        id={formId}
        data-testid="add-lead-form"
        onSubmit={handleSubmit((data) => createMutation.mutate(data))}
        noValidate
      >
        <fieldset disabled={createMutation.isPending} className="space-y-5">
          {/* Section 1: Customer Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Customer Information
            </h3>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="lead-fullName">
                  Customer full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lead-fullName"
                  type="text"
                  placeholder="e.g. Ananya Das"
                  {...register("fullName")}
                  aria-invalid={!!errors.fullName}
                  autoFocus
                />
                {errors.fullName && (
                  <small className="text-red-600">
                    {errors.fullName.message}
                  </small>
                )}
              </div>

              <div className="field">
                <label htmlFor="lead-phone">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <small className="text-red-600">{errors.phone.message}</small>
                )}
              </div>

              <div className="field">
                <label htmlFor="lead-email">Email address</label>
                <input
                  id="lead-email"
                  type="email"
                  placeholder="e.g. ananya@example.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <small className="text-red-600">{errors.email.message}</small>
                )}
              </div>

              <div className="field">
                <label htmlFor="lead-city">City / Location</label>
                <input
                  id="lead-city"
                  type="text"
                  placeholder="e.g. Mumbai, Maharashtra"
                  {...register("city")}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Section 2: Service & Package */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Service & Package
            </h3>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="lead-serviceId">
                  Service <span className="text-red-500">*</span>
                </label>
                <select
                  id="lead-serviceId"
                  {...register("serviceId")}
                  aria-invalid={!!errors.serviceId}
                >
                  {displayServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {errors.serviceId && (
                  <small className="text-red-600">
                    {errors.serviceId.message}
                  </small>
                )}
              </div>

              <div className="field">
                <label htmlFor="lead-packageId">Tour package (optional)</label>
                <select
                  id="lead-packageId"
                  {...register("packageId")}
                  disabled={isLoadingPackages || packagesList.length === 0}
                >
                  <option value="">
                    {isLoadingPackages
                      ? "Loading packages..."
                      : packagesList.length === 0
                        ? "No specific package"
                        : "Select a package (optional)"}
                  </option>
                  {packagesList.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="lead-source">Lead source</label>
                <select id="lead-source" {...register("source")}>
                  {SOURCES.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="lead-status">Initial stage</label>
                <select id="lead-status" {...register("status")}>
                  {STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Section 3: Trip Details & Estimates */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Trip Details & Budget
            </h3>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="lead-travelDate">Expected travel date</label>
                <input
                  id="lead-travelDate"
                  type="date"
                  {...register("travelDate")}
                />
              </div>

              <div className="field">
                <label htmlFor="lead-budget">Estimated budget (₹)</label>
                <input
                  id="lead-budget"
                  type="number"
                  placeholder="e.g. 75000"
                  min="0"
                  step="500"
                  {...register("estimatedBudget")}
                />
              </div>

              <div className="field">
                <label htmlFor="lead-adults">Adults</label>
                <input
                  id="lead-adults"
                  type="number"
                  min="1"
                  max="100"
                  {...register("numberOfAdults", { valueAsNumber: true })}
                />
              </div>

              <div className="field">
                <label htmlFor="lead-kids">Children</label>
                <input
                  id="lead-kids"
                  type="number"
                  min="0"
                  max="50"
                  {...register("numberOfKids", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Initial Requirement / Notes */}
          <div className="field">
            <label htmlFor="lead-note">Requirement / Initial notes</label>
            <textarea
              id="lead-note"
              rows={3}
              placeholder="e.g. Looking for a 4-night 5-day package with beach resort and airport transfers..."
              {...register("note")}
            />
          </div>
        </fieldset>
      </form>
    </Modal>
  );
};
