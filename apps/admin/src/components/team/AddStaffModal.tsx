import { useState, useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserSchema, type CreateUserInput } from "@flyora/validators";
import type { ServiceSummary, UserRole } from "@flyora/types";
import { apiClient } from "../../lib/apiClient";
import { ArrowRight, Loader2 } from "lucide-react";
import { Modal, Steps, FormError } from "../ui/Modal";
import { userMessage } from "../../lib/userMessage";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: "SERVICE_COORDINATOR", label: "Service Coordinator" },
  { value: "OPERATIONS_MANAGER", label: "Operations Manager" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ACCOUNTS", label: "Accounts" },
  { value: "CONTENT_MANAGER", label: "Content Manager" },
];

export const AddStaffModal = ({ isOpen, onClose }: AddStaffModalProps) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const formId = useId();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: services = [],
    isLoading: isLoadingServices,
    isError: servicesError,
    refetch: retryServices,
  } = useQuery<ServiceSummary[]>({
    queryKey: ["services"],
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: () => apiClient.get("/services"),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema as any),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phone: "",
      role: "SERVICE_COORDINATOR",
      serviceIds: [],
      primaryServiceId: undefined,
    },
  });

  const selectedRole = watch("role");
  const selectedServiceIds = watch("serviceIds") || [];
  const primaryServiceId = watch("primaryServiceId");

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => apiClient.post("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(
        userMessage(
          err,
          "We couldn't create this staff account. Please try again.",
        ),
      );
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      setStep(0);
      setErrorMessage(null);
    }
  }, [isOpen, reset]);
  if (!isOpen) return null;

  const handleServiceToggle = (serviceId: string) => {
    let nextServices: string[];
    if (selectedServiceIds.includes(serviceId)) {
      nextServices = selectedServiceIds.filter((id) => id !== serviceId);
      if (primaryServiceId === serviceId) {
        setValue("primaryServiceId", nextServices[0] || undefined);
      }
    } else {
      nextServices = [...selectedServiceIds, serviceId];
      if (!primaryServiceId) {
        setValue("primaryServiceId", serviceId);
      }
    }
    setValue("serviceIds", nextServices, { shouldValidate: true });
  };

  const onSubmit = (data: CreateUserInput) => {
    setErrorMessage(null);
    if (createMutation.isPending || step !== 2) return;
    createMutation.mutate(
      data.role === "SERVICE_COORDINATOR"
        ? data
        : { ...data, serviceIds: [], primaryServiceId: undefined },
    );
  };

  const next = async () => {
    setErrorMessage(null);
    if (
      step === 0 &&
      !(await trigger(["fullName", "email", "phone", "password"]))
    )
      return;
    if (
      step === 1 &&
      selectedRole === "SERVICE_COORDINATOR" &&
      (!selectedServiceIds.length || !primaryServiceId)
    ) {
      setErrorMessage(
        "Choose at least one travel service and a primary service.",
      );
      return;
    }
    setStep((value) => Math.min(2, value + 1));
  };
  const values = getValues();
  return (
    <Modal
      title="Add team member"
      description="Set up their account and choose what they can work on."
      onClose={onClose}
      busy={createMutation.isPending}
      footer={
        <>
          <button
            type="button"
            className="button-secondary"
            disabled={createMutation.isPending}
            onClick={() => (step ? setStep(step - 1) : onClose())}
          >
            {step ? "Back" : "Cancel"}
          </button>
          {step < 2 ? (
            <button
              type="button"
              className="button-primary"
              onClick={() => void next()}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              form={formId}
              className="button-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating…
                </>
              ) : (
                "Create account"
              )}
            </button>
          )}
        </>
      }
    >
      <Steps
        labels={["Account details", "Role & services", "Review"]}
        current={step}
      />
      <FormError>{errorMessage}</FormError>
      <form
        id={formId}
        onSubmit={(event) => {
          if (step !== 2) {
            event.preventDefault();
            void next();
          } else void handleSubmit(onSubmit)(event);
        }}
        noValidate
      >
        <fieldset disabled={createMutation.isPending} className="min-w-0">
          {step === 0 && (
            <div className="form-grid">
              {(
                [
                  ["fullName", "Full name", "text", "e.g. Aisha Khan"],
                  ["email", "Email address", "email", "e.g. aisha@flyora.com"],
                  ["phone", "Phone number", "tel", "Include the country code"],
                  ["password", "Password", "password", "At least 8 characters"],
                ] as const
              ).map(([name, label, type, placeholder]) => (
                <div className="field" key={name}>
                  <label htmlFor={`staff-${name}`}>{label}</label>
                  <input
                    id={`staff-${name}`}
                    type={type}
                    placeholder={placeholder}
                    {...register(name)}
                    autoComplete={name === "password" ? "new-password" : "off"}
                    aria-invalid={!!errors[name]}
                  />
                  {errors[name] && (
                    <p className="text-xs text-rose-700">
                      {errors[name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <div className="field">
                <label htmlFor="staff-role">Role</label>
                <select id="staff-role" {...register("role")}>
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <small>Choose the access level this person needs.</small>
              </div>
              {selectedRole === "SERVICE_COORDINATOR" && (
                <div className="space-y-3">
                  <h3 className="font-medium">Travel services</h3>
                  <p className="text-sm text-slate-500">
                    They can pick up enquiries for these services.
                  </p>
                  {isLoadingServices ? (
                    <p role="status">Loading services…</p>
                  ) : servicesError ? (
                    <div className="notice">
                      We couldn't load the services.{" "}
                      <button
                        className="underline"
                        type="button"
                        onClick={() => void retryServices()}
                      >
                        Try again
                      </button>
                    </div>
                  ) : (
                    services.map((service) => (
                      <label
                        key={service.id}
                        className="flex gap-3 items-center border rounded-lg p-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                        />
                        <span>{service.name}</span>
                      </label>
                    ))
                  )}
                  {!!selectedServiceIds.length && (
                    <div className="field">
                      <label htmlFor="staff-primary">Primary service</label>
                      <select
                        id="staff-primary"
                        value={primaryServiceId || ""}
                        onChange={(event) =>
                          setValue("primaryServiceId", event.target.value)
                        }
                      >
                        {services
                          .filter((service) =>
                            selectedServiceIds.includes(service.id),
                          )
                          .map((service) => (
                            <option value={service.id} key={service.id}>
                              {service.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <dl className="review-list">
                {[
                  ["Name", values.fullName],
                  ["Email", values.email],
                  ["Phone", values.phone],
                  [
                    "Role",
                    ROLES.find((role) => role.value === selectedRole)?.label,
                  ],
                  [
                    "Services",
                    selectedRole === "SERVICE_COORDINATOR"
                      ? services
                          .filter((service) =>
                            selectedServiceIds.includes(service.id),
                          )
                          .map((service) => service.name)
                          .join(", ")
                      : "Based on role",
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="notice">
                The team member can sign in using the email and password you
                entered. Share their details with them securely.
              </div>
            </div>
          )}
        </fieldset>
      </form>
    </Modal>
  );
};
