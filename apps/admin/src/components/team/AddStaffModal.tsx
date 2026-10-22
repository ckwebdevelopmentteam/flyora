import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserSchema, type CreateUserInput } from "@flyora/validators";
import type { ServiceSummary, UserRole } from "@flyora/types";
import { apiClient } from "../../lib/apiClient";
import { X, Loader2, AlertCircle, Briefcase, Check } from "lucide-react";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: services = [], isLoading: isLoadingServices } = useQuery<
    ServiceSummary[]
  >({
    queryKey: ["services"],
    queryFn: () => apiClient.get("/services"),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
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
      setErrorMessage(err.message || "Failed to create staff member.");
    },
  });

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
    createMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white border border-zinc-200/90 rounded-xl shadow-2xl p-6 z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h2 className="text-base font-medium text-zinc-900 tracking-tight">
              Add Staff Member
            </h2>
            <p className="text-xs text-zinc-500">
              Create a staff account and assign service mappings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register("fullName")}
                placeholder="Rashid Ahmed"
                className="w-full px-3 py-1.5 bg-[#FBFBFA] border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
              {errors.fullName && (
                <p className="text-[11px] text-zinc-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="staff@flyora.com"
                className="w-full px-3 py-1.5 bg-[#FBFBFA] border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
              {errors.email && (
                <p className="text-[11px] text-zinc-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                {...register("phone")}
                placeholder="+91 9876543210"
                className="w-full px-3 py-1.5 bg-[#FBFBFA] border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
              {errors.phone && (
                <p className="text-[11px] text-zinc-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Temporary Password *
              </label>
              <input
                type="password"
                {...register("password")}
                placeholder="Min 8 characters"
                className="w-full px-3 py-1.5 bg-[#FBFBFA] border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
              {errors.password && (
                <p className="text-[11px] text-zinc-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Role *
            </label>
            <select
              {...register("role")}
              className="w-full px-3 py-1.5 bg-[#FBFBFA] border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-black"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-white">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Service Assignment */}
          {selectedRole === "SERVICE_COORDINATOR" && (
            <div className="p-3.5 rounded-lg bg-[#FBFBFA] border border-zinc-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-800 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                <span>Service Assignments</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Incoming leads for checked services will be routable to this
                coordinator.
              </p>

              {isLoadingServices ? (
                <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading services...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.map((svc) => {
                    const isChecked = selectedServiceIds.includes(svc.id);
                    const isPrimary = primaryServiceId === svc.id;

                    return (
                      <div
                        key={svc.id}
                        onClick={() => handleServiceToggle(svc.id)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                          isChecked
                            ? "bg-zinc-100 border-zinc-400 text-zinc-900"
                            : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition ${
                              isChecked
                                ? "bg-black border-black text-white"
                                : "border-zinc-300 bg-white"
                            }`}
                          >
                            {isChecked && (
                              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                            )}
                          </div>
                          <span>{svc.name}</span>
                        </div>

                        {isChecked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setValue("primaryServiceId", svc.id);
                            }}
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono transition ${
                              isPrimary
                                ? "bg-black text-white font-semibold"
                                : "text-zinc-500 hover:text-black"
                            }`}
                          >
                            {isPrimary ? "Primary ★" : "Set Primary"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-black transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition disabled:opacity-40 flex items-center gap-2 shadow-xs"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Save Staff</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
