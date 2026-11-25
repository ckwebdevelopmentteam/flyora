import { useEffect, useState } from "react";
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

  // Sync form when opening / editing
  useEffect(() => {
    if (!isOpen) return;
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
      onClose();
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
      drawer
      wide
      busy={mutation.isPending}
      title={
        isEditing
          ? `Edit Allotment: ${initialData?.originCode} ➔ ${initialData?.destinationCode}`
          : "Add Special Fare Allotment"
      }
      description="Enter bulk contracted flight ticket details. Internal supplier costs and PNRs remain strictly hidden from the public website."
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="special-fare-form"
            disabled={mutation.isPending}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {mutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            {isEditing ? "Save Changes" : "Publish Allotment"}
          </button>
        </div>
      }
    >
      <form
        id="special-fare-form"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-6 pb-4"
      >
        {submitError && <FormError>{submitError}</FormError>}

        {/* Section 1: Route & Airline */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
            <Plane className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sector & Flight Info</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Origin City *
              </label>
              <input
                {...register("originCity")}
                placeholder="e.g. Kozhikode"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.originCity && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.originCity.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Origin Airport Code (IATA) *
              </label>
              <input
                {...register("originCode")}
                placeholder="e.g. CCJ"
                maxLength={5}
                className="w-full px-3 py-2 text-xs uppercase font-mono border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.originCode && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.originCode.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Destination City *
              </label>
              <input
                {...register("destinationCity")}
                placeholder="e.g. Dubai"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.destinationCity && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.destinationCity.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Destination Airport Code (IATA) *
              </label>
              <input
                {...register("destinationCode")}
                placeholder="e.g. DXB"
                maxLength={5}
                className="w-full px-3 py-2 text-xs uppercase font-mono border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.destinationCode && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.destinationCode.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Airline Name *
              </label>
              <input
                {...register("airlineName")}
                placeholder="e.g. Air India Express"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.airlineName && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.airlineName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Airline Code
              </label>
              <input
                {...register("airlineCode")}
                placeholder="e.g. IX"
                className="w-full px-3 py-2 text-xs uppercase font-mono border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Flight Number
              </label>
              <input
                {...register("flightNumber")}
                placeholder="e.g. IX-345"
                className="w-full px-3 py-2 text-xs uppercase font-mono border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
              <input
                type="radio"
                value="NON_STOP"
                {...register("flightType")}
                className="text-indigo-600"
              />
              <span>Non-Stop Flight</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
              <input
                type="radio"
                value="CONNECTING"
                {...register("flightType")}
                className="text-indigo-600"
              />
              <span>Connecting Flight</span>
            </label>
          </div>
        </section>

        {/* Section 2: Schedule & Auto-Expiry */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Schedule & Auto-Expiry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Departure Date & Time *
              </label>
              <input
                type="datetime-local"
                {...register("departureDate")}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.departureDate && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.departureDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Arrival Date & Time
              </label>
              <input
                type="datetime-local"
                {...register("arrivalDate")}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Public Auto-Expiry *
              </label>
              <input
                type="datetime-local"
                {...register("expiresAt")}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Auto-hides from public site after this time
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Baggage Policy */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
            <Luggage className="w-3.5 h-3.5 text-indigo-600" />
            <span>Baggage Policy</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {BAGGAGE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue("baggageInfo", preset)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  watchBaggage === preset
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <input
            {...register("baggageInfo")}
            placeholder="e.g. 30 Kg Check-in + 7 Kg Cabin"
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </section>

        {/* Section 4: Seats, Pricing & Margin */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
            <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
            <span>Seats & Commercials</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Total Quota *
              </label>
              <input
                type="number"
                min={1}
                {...register("totalSeats", { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Available Seats *
              </label>
              <input
                type="number"
                min={0}
                {...register("availableSeats", { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Supplier Cost (₹)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Staff only"
                {...register("supplierCost", { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Customer Fare (₹) *
              </label>
              <input
                type="number"
                min={1}
                {...register("farePerSeat", { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs font-semibold border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.farePerSeat && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.farePerSeat.message}
                </p>
              )}
            </div>
          </div>

          {/* Live Profit Preview Banner */}
          {watchFare > 0 && watchCost > 0 && (
            <div
              className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Group PNR Reference (Staff Only)
              </label>
              <input
                {...register("pnrNumber")}
                placeholder="e.g. GRP9821X"
                className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Internal Staff Remarks
              </label>
              <input
                {...register("notes")}
                placeholder="e.g. Non-refundable bulk batch from supplier X"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Section 5: Extensible Additional Details (Ready for custom business fields) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Additional Booking Details (Custom Fields)</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setCustomFields((prev) => [...prev, { key: "", value: "" }])
              }
              className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add Field
            </button>
          </div>

          {customFields.length === 0 ? (
            <p className="text-[11px] text-zinc-400 italic">
              Optional custom attributes (e.g., Terminal, Meal Policy, Market
              Counter Fare). Click "Add Field" to attach extra ticket details.
            </p>
          ) : (
            <div className="space-y-2">
              {customFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={field.key}
                    onChange={(e) => {
                      const next = [...customFields];
                      next[index].key = e.target.value;
                      setCustomFields(next);
                    }}
                    placeholder="Field Name (e.g. Market Rate)"
                    className="flex-1 px-2.5 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    value={field.value}
                    onChange={(e) => {
                      const next = [...customFields];
                      next[index].value = e.target.value;
                      setCustomFields(next);
                    }}
                    placeholder="Value (e.g. 14500)"
                    className="flex-1 px-2.5 py-1.5 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCustomFields((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    className="p-1.5 text-zinc-400 hover:text-rose-600 cursor-pointer"
                    aria-label="Remove field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
