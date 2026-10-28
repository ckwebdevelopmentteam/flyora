import { userMessage } from "../../lib/userMessage";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ServiceSummary, UserProfile } from "@flyora/types";
import { apiClient } from "../../lib/apiClient";
import { Loader2 } from "lucide-react";
import { Modal, FormError } from "../ui/Modal";

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

  const {
    data: services = [],
    isLoading: isLoadingServices,
    isError: servicesError,
    refetch: retryServices,
  } = useQuery<ServiceSummary[]>({
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
      setErrorMessage(
        userMessage(err, "Failed to update coordinator services."),
      );
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

  return (
    <Modal
      title="Assign travel services"
      description={user.fullName}
      onClose={onClose}
      busy={updateMutation.isPending}
      footer={
        <>
          <button
            className="button-secondary"
            disabled={updateMutation.isPending}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="button-primary"
            disabled={
              updateMutation.isPending || isLoadingServices || servicesError
            }
            onClick={() => {
              if (!updateMutation.isPending) updateMutation.mutate();
            }}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save services"
            )}
          </button>
        </>
      }
    >
      <FormError>{errorMessage}</FormError>
      <p className="text-sm text-slate-500 mb-5">
        Choose the services this coordinator handles. They can pick up enquiries
        for the selected services.
      </p>
      <fieldset disabled={updateMutation.isPending} className="space-y-3">
        {isLoadingServices ? (
          <p role="status">Loading services…</p>
        ) : servicesError ? (
          <div className="notice">
            We couldn't load the services.{" "}
            <button className="underline" onClick={() => void retryServices()}>
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
                onChange={() => handleToggle(service.id)}
              />
              <span>{service.name}</span>
            </label>
          ))
        )}
        {!!selectedServiceIds.length && (
          <div className="field pt-3">
            <label htmlFor="edit-primary-service">Primary service</label>
            <select
              id="edit-primary-service"
              value={primaryServiceId || ""}
              onChange={(event) => setPrimaryServiceId(event.target.value)}
            >
              {services
                .filter((service) => selectedServiceIds.includes(service.id))
                .map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </fieldset>
    </Modal>
  );
};
