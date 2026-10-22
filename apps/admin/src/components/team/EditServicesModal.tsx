import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ServiceSummary, UserProfile } from "@flyora/types";
import { apiClient } from "../../lib/apiClient";
import { X, Loader2, AlertCircle, Check } from "lucide-react";

interface EditServicesModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditServicesModal = ({
  user,
  isOpen,
  onClose,
}: EditServicesModalProps) => {
  const queryClient = useQueryClient();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [primaryServiceId, setPrimaryServiceId] = useState<string | undefined>(
    undefined,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: services = [], isLoading: isLoadingServices } = useQuery<
    ServiceSummary[]
  >({
    queryKey: ["services"],
    queryFn: () => apiClient.get("/services"),
    enabled: isOpen,
  });

  useEffect(() => {
    if (user && user.services) {
      const ids = user.services.map((s) => s.serviceId);
      setSelectedServiceIds(ids);
      const primary = user.services.find((s) => s.isPrimary);
      setPrimaryServiceId(primary?.serviceId || ids[0]);
    } else {
      setSelectedServiceIds([]);
      setPrimaryServiceId(undefined);
    }
    setErrorMessage(null);
  }, [user, isOpen]);

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("No user selected");
      return apiClient.patch(`/users/${user.id}/services`, {
        serviceIds: selectedServiceIds,
        primaryServiceId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Failed to update coordinator services.");
    },
  });

  if (!isOpen || !user) return null;

  const handleToggle = (serviceId: string) => {
    let next: string[];
    if (selectedServiceIds.includes(serviceId)) {
      next = selectedServiceIds.filter((id) => id !== serviceId);
      if (primaryServiceId === serviceId) {
        setPrimaryServiceId(next[0] || undefined);
      }
    } else {
      next = [...selectedServiceIds, serviceId];
      if (!primaryServiceId) {
        setPrimaryServiceId(serviceId);
      }
    }
    setSelectedServiceIds(next);
  };

  const handleSave = () => {
    setErrorMessage(null);
    updateMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-zinc-200/90 rounded-xl shadow-2xl p-6 z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h2 className="text-base font-medium text-zinc-900 tracking-tight">
              Edit Assigned Services
            </h2>
            <p className="text-xs text-zinc-500">
              Coordinator:{" "}
              <span className="text-zinc-800 font-medium">{user.fullName}</span>
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

        <div className="mt-4 space-y-3.5">
          <p className="text-xs text-zinc-600">
            Select the services this coordinator handles. Incoming leads will
            match these lines.
          </p>

          {isLoadingServices ? (
            <div className="flex items-center gap-2 text-xs text-zinc-500 py-3 justify-center">
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
                    onClick={() => handleToggle(svc.id)}
                    className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                      isChecked
                        ? "bg-zinc-100 border-zinc-400 text-zinc-900"
                        : "bg-[#FBFBFA] border-zinc-200 text-zinc-700 hover:border-zinc-300"
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
                          setPrimaryServiceId(svc.id);
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

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-black transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-medium transition disabled:opacity-40 flex items-center gap-2 shadow-xs"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
