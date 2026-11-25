import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSpecialFareSchema,
  type CreateSpecialFareInput,
} from "@flyora/validators";
import type { SpecialFareAdminDetail } from "@flyora/types";
import { Modal, FormError } from "../ui/Modal";
import { specialFaresApi } from "../../lib/specialFaresApi";
import { userMessage } from "../../lib/userMessage";
import {
  Plane,
  Calendar,
  Luggage,
  IndianRupee,
  TrendingUp,
  Info,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

interface SpecialFareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SpecialFareAdminDetail | null;
  onSuccess: (message: string) => void;
}

const BAGGAGE_PRESETS = [
  "20 Kg Check-in + 7 Kg Cabin",
  "30 Kg Check-in + 7 Kg Cabin",
  "40 Kg Check-in + 7 Kg Cabin",
  "15 Kg Check-in + 7 Kg Cabin",
];

function toLocalDatetimeInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

export function SpecialFareDrawer({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: SpecialFareDrawerProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(initialData?.id);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extensible metadata rows for forthcoming custom business fields
  const [customFields, setCustomFields] = useState<
    Array<{ key: string; value: string }>
  >([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateSpecialFareInput>({
    resolver: zodResolver(createSpecialFareSchema as any),
    defaultValues: {
      airlineName: "",
      airlineCode: "",
      flightNumber: "",
      originCity: "",
      originCode: "",
      destinationCity: "",
      destinationCode: "",
      departureDate: "",
      arrivalDate: "",
      flightType: "NON_STOP",
      baggageInfo: "30 Kg Check-in + 7 Kg Cabin",
      totalSeats: 10,
      availableSeats: 10,
      originalFare: undefined,
      farePerSeat: 0,
      supplierCost: undefined,
      pnrNumber: "",
      notes: "",
      expiresAt: "",
      status: "ACTIVE",
      isActive: true,
      displayOrder: 0,
    },
  });

  const handleSmoothClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 180);
  }, [isClosing, onClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Sync form when opening / editing
  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
      return;
    }
    setIsClosing(false);
    setSubmitError(null);

    if (initialData) {
      reset({
        airlineName: initialData.airlineName,
        airlineCode: initialData.airlineCode || "",
        flightNumber: initialData.flightNumber || "",
        originCity: initialData.originCity,
        originCode: initialData.originCode,
        destinationCity: initialData.destinationCity,
        destinationCode: initialData.destinationCode,
        departureDate: toLocalDatetimeInput(initialData.departureDate),
        arrivalDate: toLocalDatetimeInput(initialData.arrivalDate),
        flightType: initialData.flightType,
        baggageInfo: initialData.baggageInfo,
        totalSeats: initialData.totalSeats,
        availableSeats: initialData.availableSeats,
        originalFare: initialData.originalFare ?? undefined,
        farePerSeat: initialData.farePerSeat,
        supplierCost: initialData.supplierCost ?? undefined,
        pnrNumber: initialData.pnrNumber || "",
        notes: initialData.notes || "",
        expiresAt: toLocalDatetimeInput(initialData.expiresAt),
        status: initialData.status,
        isActive: initialData.isActive,
        displayOrder: initialData.displayOrder,
      });

      if (initialData.metadata && typeof initialData.metadata === "object") {
        setCustomFields(
          Object.entries(initialData.metadata).map(([key, val]) => ({
            key,
            value: String(val ?? ""),
          })),
        );
      } else {
        setCustomFields([]);
      }
    } else {
      reset({
        airlineName: "",
        airlineCode: "",
        flightNumber: "",
        originCity: "",
        originCode: "",
        destinationCity: "",
        destinationCode: "",
        departureDate: "",
        arrivalDate: "",
        flightType: "NON_STOP",
        baggageInfo: "30 Kg Check-in + 7 Kg Cabin",
        totalSeats: 10,
        availableSeats: 10,
        originalFare: undefined,
        farePerSeat: 0,
        supplierCost: undefined,
        pnrNumber: "",
        notes: "",
        expiresAt: "",
        status: "ACTIVE",
        isActive: true,
        displayOrder: 0,
      });
      setCustomFields([]);
    }
  }, [isOpen, initialData, reset]);

  const watchDeparture = watch("departureDate");
  const watchFare = watch("farePerSeat") || 0;
  const watchCost = watch("supplierCost") || 0;
  const watchTotalSeats = watch("totalSeats") || 0;
  const watchBaggage = watch("baggageInfo");

  // Auto-suggest expiresAt = departureDate - 6 hours when creating new allotment
  useEffect(() => {
    if (!isEditing && watchDeparture) {
      const dep = new Date(watchDeparture);
      if (!isNaN(dep.getTime())) {
        const exp = new Date(dep.getTime() - 6 * 60 * 60 * 1000);
        setValue("expiresAt", toLocalDatetimeInput(exp.toISOString()));
      }
    }
  }, [watchDeparture, isEditing, setValue]);

  // Sync availableSeats with totalSeats on create if user hasn't explicitly changed it
  useEffect(() => {
    if (!isEditing && watchTotalSeats > 0) {
      setValue("availableSeats", watchTotalSeats);
    }
  }, [watchTotalSeats, isEditing, setValue]);

  const marginAmount =
    watchFare > 0 && watchCost > 0 ? watchFare - watchCost : 0;
  const marginPercent =
    watchFare > 0 && watchCost > 0 ? (marginAmount / watchFare) * 100 : 0;

  const mutation = useMutation({
    mutationFn: async (data: CreateSpecialFareInput) => {
      const metadataObj: Record<string, string> = {};
      for (const row of customFields) {
        if (row.key.trim()) {
          metadataObj[row.key.trim()] = row.value.trim();
        }
      }

      const payload: CreateSpecialFareInput = {
        ...data,
        departureDate: new Date(data.departureDate).toISOString(),
        arrivalDate: data.arrivalDate
          ? new Date(data.arrivalDate).toISOString()
          : null,
        expiresAt: data.expiresAt
          ? new Date(data.expiresAt).toISOString()
          : undefined,
        originalFare:
          data.originalFare !== undefined &&
          !isNaN(Number(data.originalFare)) &&
          Number(data.originalFare) > 0
            ? Number(data.originalFare)
            : null,
        supplierCost:
          data.supplierCost !== undefined && !isNaN(Number(data.supplierCost))
            ? Number(data.supplierCost)
            : null,
        metadata: Object.keys(metadataObj).length > 0 ? metadataObj : null,
      };

      if (isEditing && initialData) {
        return specialFaresApi.updateSpecialFare(initialData.id, payload);
      }
      return specialFaresApi.createSpecialFare(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["special-fares"] });
      onSuccess(
        isEditing
          ? "Special fare allotment updated successfully."
          : "Special fare allotment added to inventory.",
      );
      handleSmoothClose();
    },
    onError: (err: any) => {
      setSubmitError(
        userMessage(err, "Unable to save allotment. Please check all fields."),
      );
    },
  });

  if (!isOpen) return null;

  return (
    <Modal
      wide
      closing={isClosing}
      panelClassName="max-w-[780px]"
      busy={mutation.isPending}
      title={
        isEditing
          ? `Edit Allotment: ${initialData?.originCode} ➔ ${initialData?.destinationCode}`
          : "Add Special Fare Allotment"
      }
      description="Enter bulk contracted flight ticket details. Internal supplier costs and PNRs remain strictly hidden from the public website."
      onClose={handleSmoothClose}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            disabled={mutation.isPending || isClosing}
            onClick={handleSmoothClose}
            className="button-secondary cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="special-fare-form"
            disabled={mutation.isPending || isClosing}
            className="button-primary cursor-pointer disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Publish Allotment"}
          </button>
        </div>
      }
    >
      <form
        id="special-fare-form"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-7"
        noValidate
      >
        <FormError>{submitError}</FormError>

        {/* Section 1: Route & Airline */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2.5">
            <Plane className="w-4 h-4 text-indigo-600" />
            <span>Sector & Flight Info</span>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="sf-originCity">Origin City *</label>
              <input
                id="sf-originCity"
                {...register("originCity")}
                placeholder="e.g. Kozhikode"
              />
              {errors.originCity && (
                <p className="text-xs text-rose-600">
                  {errors.originCity.message}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="sf-originCode">
                Origin Airport Code (IATA) *
              </label>
              <input
                id="sf-originCode"
                {...register("originCode")}
                placeholder="e.g. CCJ"
                maxLength={5}
                className="uppercase font-mono"
              />
              {errors.originCode && (
                <p className="text-xs text-rose-600">
                  {errors.originCode.message}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="sf-destinationCity">Destination City *</label>
              <input
                id="sf-destinationCity"
                {...register("destinationCity")}
                placeholder="e.g. Dubai"
              />
              {errors.destinationCity && (
                <p className="text-xs text-rose-600">
                  {errors.destinationCity.message}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="sf-destinationCode">
                Destination Airport Code (IATA) *
              </label>
              <input
                id="sf-destinationCode"
                {...register("destinationCode")}
                placeholder="e.g. DXB"
                maxLength={5}
                className="uppercase font-mono"
              />
              {errors.destinationCode && (
                <p className="text-xs text-rose-600">
                  {errors.destinationCode.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="field">
              <label htmlFor="sf-airlineName">Airline Name *</label>
              <input
                id="sf-airlineName"
                {...register("airlineName")}
                placeholder="e.g. Air India Express"
              />
              {errors.airlineName && (
                <p className="text-xs text-rose-600">
                  {errors.airlineName.message}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="sf-airlineCode">Airline Code</label>
              <input
                id="sf-airlineCode"
                {...register("airlineCode")}
                placeholder="e.g. IX"
                className="uppercase font-mono"
              />
            </div>

            <div className="field">
              <label htmlFor="sf-flightNumber">Flight Number</label>
              <input
                id="sf-flightNumber"
                {...register("flightNumber")}
                placeholder="e.g. IX-345"
                className="uppercase font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
              <input
                type="radio"
                value="NON_STOP"
                {...register("flightType")}
                className="accent-indigo-600"
              />
              <span>Non-Stop Flight</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
              <input
                type="radio"
                value="CONNECTING"
                {...register("flightType")}
                className="accent-indigo-600"
              />
              <span>Connecting Flight</span>
            </label>
          </div>
        </section>

        {/* Section 2: Schedule & Auto-Expiry */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Schedule & Auto-Expiry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="field">
              <label htmlFor="sf-departureDate">Departure Date & Time *</label>
              <input
                id="sf-departureDate"
                type="datetime-local"
                {...register("departureDate")}
              />
              {errors.departureDate && (
                <p className="text-xs text-rose-600">
                  {errors.departureDate.message}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="sf-arrivalDate">Arrival Date & Time</label>
              <input
                id="sf-arrivalDate"
                type="datetime-local"
                {...register("arrivalDate")}
              />
            </div>

            <div className="field">
              <label htmlFor="sf-expiresAt">Public Auto-Expiry *</label>
              <input
                id="sf-expiresAt"
                type="datetime-local"
                {...register("expiresAt")}
              />
              <small>Auto-hides from public site after this time</small>
            </div>
          </div>
        </section>

        {/* Section 3: Baggage Policy */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2.5">
            <Luggage className="w-4 h-4 text-indigo-600" />
            <span>Baggage Policy</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {BAGGAGE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue("baggageInfo", preset)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  watchBaggage === preset
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="field">
            <input
              {...register("baggageInfo")}
              placeholder="e.g. 30 Kg Check-in + 7 Kg Cabin"
            />
          </div>
        </section>

        {/* Section 4: Seats, Pricing & Margin */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2.5">
            <IndianRupee className="w-4 h-4 text-indigo-600" />
            <span>Seats & Commercials</span>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="sf-totalSeats">Total Quota *</label>
              <input
                id="sf-totalSeats"
                type="number"
                min={1}
                {...register("totalSeats", { valueAsNumber: true })}
              />
            </div>

            <div className="field">
              <label htmlFor="sf-availableSeats">Available Seats *</label>
              <input
                id="sf-availableSeats"
                type="number"
                min={0}
                {...register("availableSeats", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="field">
              <label htmlFor="sf-supplierCost">Supplier Cost (₹)</label>
              <input
                id="sf-supplierCost"
                type="number"
                min={0}
                placeholder="Staff only"
                {...register("supplierCost", { valueAsNumber: true })}
              />
            </div>

            <div className="field">
              <label htmlFor="sf-originalFare">Crossed / Market Fare (₹)</label>
              <input
                id="sf-originalFare"
                type="number"
                min={0}
                placeholder="e.g. 14500 (Shown crossed in red)"
                {...register("originalFare", { valueAsNumber: true })}
              />
            </div>

            <div className="field">
              <label htmlFor="sf-farePerSeat">
                Customer Special Fare (₹) *
              </label>
              <input
                id="sf-farePerSeat"
                type="number"
                min={1}
                {...register("farePerSeat", { valueAsNumber: true })}
                className="font-semibold text-emerald-700"
              />
              {errors.farePerSeat && (
                <p className="text-xs text-rose-600">
                  {errors.farePerSeat.message}
                </p>
              )}
            </div>
          </div>

          {/* Live Profit Preview Banner */}
          {watchFare > 0 && watchCost > 0 && (
            <div
              className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                marginAmount > 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>
                  Estimated Profit Margin:{" "}
                  <strong>₹{marginAmount.toLocaleString("en-IN")}</strong> per
                  seat ({marginPercent.toFixed(1)}%)
                </span>
              </div>
              <span className="font-semibold">
                Total Batch Profit: ₹
                {(marginAmount * (watchTotalSeats || 1)).toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>
          )}

          <div className="form-grid">
            <div className="field">
              <label htmlFor="sf-pnrNumber">
                Group PNR Reference (Staff Only)
              </label>
              <input
                id="sf-pnrNumber"
                {...register("pnrNumber")}
                placeholder="e.g. GRP9821X"
                className="font-mono"
              />
            </div>

            <div className="field">
              <label htmlFor="sf-notes">Internal Staff Remarks</label>
              <input
                id="sf-notes"
                {...register("notes")}
                placeholder="e.g. Non-refundable bulk batch from supplier X"
              />
            </div>
          </div>
        </section>

        {/* Section 5: Extensible Additional Details (Ready for custom business fields) */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Additional Booking Details (Custom Fields)</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setCustomFields((prev) => [...prev, { key: "", value: "" }])
              }
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Field
            </button>
          </div>

          {customFields.length === 0 ? (
            <p className="text-xs text-zinc-500 notice">
              Optional custom attributes (e.g., Terminal, Meal Policy, Market
              Counter Fare). Click &ldquo;Add Field&rdquo; to attach extra
              ticket details.
            </p>
          ) : (
            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="field flex-1">
                    <input
                      value={field.key}
                      onChange={(e) => {
                        const next = [...customFields];
                        next[index].key = e.target.value;
                        setCustomFields(next);
                      }}
                      placeholder="Field Name (e.g. Market Rate)"
                    />
                  </div>
                  <div className="field flex-1">
                    <input
                      value={field.value}
                      onChange={(e) => {
                        const next = [...customFields];
                        next[index].value = e.target.value;
                        setCustomFields(next);
                      }}
                      placeholder="Value (e.g. 14500)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomFields((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    className="icon-button hover:text-rose-600 cursor-pointer"
                    aria-label="Remove field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </form>
    </Modal>
  );
}
