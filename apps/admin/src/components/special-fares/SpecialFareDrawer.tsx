import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  CatalogAutocomplete,
  type AutocompleteOption,
} from "./CatalogAutocomplete";
import { ADMIN_AIRLINE_CATALOG, ADMIN_AIRPORT_CATALOG } from "./flightCatalog";
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
  CalendarRange,
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

const WEEKDAYS = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
  { day: 0, label: "Sun" },
];

type ExpiryPreset = "6H_BEFORE" | "1D_2200" | "2D_2200" | "CUSTOM";

function toLocalDatetimeInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

function computePresetExpiry(
  departureDate: Date,
  preset: ExpiryPreset,
): Date | null {
  if (isNaN(departureDate.getTime())) return null;
  if (preset === "6H_BEFORE") {
    return new Date(departureDate.getTime() - 6 * 3600 * 1000);
  }
  if (preset === "1D_2200" || preset === "2D_2200") {
    const days = preset === "1D_2200" ? 1 : 2;
    const d = new Date(departureDate.getTime() - days * 86400 * 1000);
    d.setHours(22, 0, 0, 0);
    return d;
  }
  return null;
}

function buildDateSeries(
  fromDate: string,
  toDate: string,
  activeWeekdays: number[],
): string[] {
  if (!fromDate || !toDate || activeWeekdays.length === 0) return [];
  const start = new Date(`${fromDate}T00:00:00`);
  const end = new Date(`${toDate}T00:00:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end && dates.length < 100) {
    if (activeWeekdays.includes(cursor.getDay())) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const d = String(cursor.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
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

  // Schedule mode: single departure vs date-range series (create only)
  const [seriesMode, setSeriesMode] = useState(false);
  const [seriesFromDate, setSeriesFromDate] = useState("");
  const [seriesToDate, setSeriesToDate] = useState("");
  const [seriesDepTime, setSeriesDepTime] = useState("19:15");
  const [seriesArrTime, setSeriesArrTime] = useState("23:30");
  const [seriesNextDayArrival, setSeriesNextDayArrival] = useState(false);
  const [seriesWeekdays, setSeriesWeekdays] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [expiryPreset, setExpiryPreset] = useState<ExpiryPreset>("6H_BEFORE");

  // Connecting layover fields (optional, saved inside metadata)
  const [layoverVia, setLayoverVia] = useState("");
  const [layoverFlight, setLayoverFlight] = useState("");
  const [layoverDuration, setLayoverDuration] = useState("");

  // Extensible metadata rows
  const [customFields, setCustomFields] = useState<
    Array<{ key: string; value: string }>
  >([]);

  const airportOptions = useMemo<AutocompleteOption[]>(
    () =>
      ADMIN_AIRPORT_CATALOG.map((a) => ({
        id: a.code,
        label: a.city,
        sublabel: `${a.name} · ${a.country}`,
        badge: a.code,
        keywords: `${a.city} ${a.code} ${a.name} ${a.country}`,
      })),
    [],
  );

  const airlineOptions = useMemo<AutocompleteOption[]>(
    () =>
      ADMIN_AIRLINE_CATALOG.map((a) => ({
        id: a.code,
        label: a.name,
        badge: a.code,
        keywords: `${a.name} ${a.code}`,
      })),
    [],
  );

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
      originTerminal: "",
      destinationCity: "",
      destinationCode: "",
      destinationTerminal: "",
      departureDate: "",
      arrivalDate: "",
      flightType: "NON_STOP",
      cabinClass: "ECONOMY",
      rbd: "",
      baggageInfo: "30 Kg Check-in + 7 Kg Cabin",
      isRefundable: false,
      totalSeats: 10,
      availableSeats: 10,
      originalFare: undefined,
      farePerSeat: 0,
      childFare: undefined,
      infantFare: undefined,
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
    setSeriesMode(false);

    if (initialData) {
      reset({
        airlineName: initialData.airlineName,
        airlineCode: initialData.airlineCode || "",
        flightNumber: initialData.flightNumber || "",
        originCity: initialData.originCity,
        originCode: initialData.originCode,
        originTerminal: initialData.originTerminal || "",
        destinationCity: initialData.destinationCity,
        destinationCode: initialData.destinationCode,
        destinationTerminal: initialData.destinationTerminal || "",
        departureDate: toLocalDatetimeInput(initialData.departureDate),
        arrivalDate: toLocalDatetimeInput(initialData.arrivalDate),
        flightType: initialData.flightType,
        cabinClass: initialData.cabinClass || "ECONOMY",
        rbd: initialData.rbd || "",
        baggageInfo: initialData.baggageInfo,
        isRefundable: Boolean(initialData.isRefundable),
        totalSeats: initialData.totalSeats,
        availableSeats: initialData.availableSeats,
        originalFare: initialData.originalFare ?? undefined,
        farePerSeat: initialData.farePerSeat,
        childFare: initialData.childFare ?? undefined,
        infantFare: initialData.infantFare ?? undefined,
        supplierCost: initialData.supplierCost ?? undefined,
        pnrNumber: initialData.pnrNumber || "",
        notes: initialData.notes || "",
        expiresAt: toLocalDatetimeInput(initialData.expiresAt),
        status: initialData.status,
        isActive: initialData.isActive,
        displayOrder: initialData.displayOrder,
      });
      setExpiryPreset("CUSTOM");

      if (initialData.metadata && typeof initialData.metadata === "object") {
        const meta = initialData.metadata as Record<string, unknown>;
        setLayoverVia(String(meta["Layover Via"] ?? ""));
        setLayoverFlight(String(meta["Connecting Flight"] ?? ""));
        setLayoverDuration(String(meta["Layover Duration"] ?? ""));
        setCustomFields(
          Object.entries(meta)
            .filter(
              ([k]) =>
                ![
                  "Layover Via",
                  "Connecting Flight",
                  "Layover Duration",
                ].includes(k),
            )
            .map(([key, val]) => ({ key, value: String(val ?? "") })),
        );
      } else {
        setLayoverVia("");
        setLayoverFlight("");
        setLayoverDuration("");
        setCustomFields([]);
      }
    } else {
      reset({
        airlineName: "",
        airlineCode: "",
        flightNumber: "",
        originCity: "",
        originCode: "",
        originTerminal: "",
        destinationCity: "",
        destinationCode: "",
        destinationTerminal: "",
        departureDate: "",
        arrivalDate: "",
        flightType: "NON_STOP",
        cabinClass: "ECONOMY",
        rbd: "",
        baggageInfo: "30 Kg Check-in + 7 Kg Cabin",
        isRefundable: false,
        totalSeats: 10,
        availableSeats: 10,
        originalFare: undefined,
        farePerSeat: 0,
        childFare: undefined,
        infantFare: undefined,
        supplierCost: undefined,
        pnrNumber: "",
        notes: "",
        expiresAt: "",
        status: "ACTIVE",
        isActive: true,
        displayOrder: 0,
      });
      setExpiryPreset("6H_BEFORE");
      setSeriesFromDate("");
      setSeriesToDate("");
      setSeriesDepTime("19:15");
      setSeriesArrTime("23:30");
      setSeriesNextDayArrival(false);
      setSeriesWeekdays([0, 1, 2, 3, 4, 5, 6]);
      setLayoverVia("");
      setLayoverFlight("");
      setLayoverDuration("");
      setCustomFields([]);
    }
  }, [isOpen, initialData, reset]);

  const watchDeparture = watch("departureDate");
  const watchFare = watch("farePerSeat") || 0;
  const watchCost = watch("supplierCost") || 0;
  const watchTotalSeats = watch("totalSeats") || 0;
  const watchBaggage = watch("baggageInfo");
  const watchOriginCity = watch("originCity") || "";
  const watchDestCity = watch("destinationCity") || "";
  const watchAirlineName = watch("airlineName") || "";
  const watchFlightType = watch("flightType");
  const watchIsRefundable = watch("isRefundable");

  // Auto-calculate expiresAt from preset when departureDate changes
  useEffect(() => {
    if (seriesMode || expiryPreset === "CUSTOM" || !watchDeparture) return;
    const dep = new Date(watchDeparture);
    const exp = computePresetExpiry(dep, expiryPreset);
    if (exp) {
      setValue("expiresAt", toLocalDatetimeInput(exp.toISOString()));
    }
  }, [watchDeparture, expiryPreset, seriesMode, setValue]);

  // Keep dummy valid departureDate populated in form state when seriesMode is enabled so RHF/Zod passes shared validation
  useEffect(() => {
    if (seriesMode && !watchDeparture) {
      const fallback = seriesFromDate
        ? `${seriesFromDate}T${seriesDepTime || "12:00"}`
        : toLocalDatetimeInput(new Date(Date.now() + 86400000).toISOString());
      setValue("departureDate", fallback);
    }
  }, [seriesMode, seriesFromDate, seriesDepTime, watchDeparture, setValue]);

  // Sync availableSeats with totalSeats on create
  useEffect(() => {
    if (!isEditing && watchTotalSeats > 0) {
      setValue("availableSeats", watchTotalSeats);
    }
  }, [watchTotalSeats, isEditing, setValue]);

  const seriesDates = useMemo(
    () =>
      seriesMode
        ? buildDateSeries(seriesFromDate, seriesToDate, seriesWeekdays)
        : [],
    [seriesMode, seriesFromDate, seriesToDate, seriesWeekdays],
  );

  const marginAmount =
    watchFare > 0 && watchCost > 0 ? watchFare - watchCost : 0;
  const marginPercent =
    watchFare > 0 && watchCost > 0 ? (marginAmount / watchFare) * 100 : 0;

  const buildMetadataObject = (): Record<string, string> | null => {
    const metadataObj: Record<string, string> = {};
    if (watchFlightType === "CONNECTING") {
      if (layoverVia.trim()) metadataObj["Layover Via"] = layoverVia.trim();
      if (layoverFlight.trim())
        metadataObj["Connecting Flight"] = layoverFlight.trim().toUpperCase();
      if (layoverDuration.trim())
        metadataObj["Layover Duration"] = layoverDuration.trim();
    }
    for (const row of customFields) {
      if (row.key.trim()) {
        metadataObj[row.key.trim()] = row.value.trim();
      }
    }
    return Object.keys(metadataObj).length > 0 ? metadataObj : null;
  };

  const toNullableFare = (val: unknown): number | null => {
    if (val === undefined || val === null || val === "") return null;
    const n = Number(val);
    return !isNaN(n) && n > 0 ? n : null;
  };

  const mutation = useMutation({
    mutationFn: async (data: CreateSpecialFareInput) => {
      const metadata = buildMetadataObject();
      const baseFields = {
        ...data,
        airlineCode: data.airlineCode?.trim() || null,
        flightNumber: data.flightNumber?.trim() || null,
        originTerminal: data.originTerminal?.trim() || null,
        destinationTerminal: data.destinationTerminal?.trim() || null,
        rbd: data.rbd?.trim() ? data.rbd.trim().toUpperCase() : null,
        originalFare: toNullableFare(data.originalFare),
        childFare: toNullableFare(data.childFare),
        infantFare: toNullableFare(data.infantFare),
        supplierCost:
          data.supplierCost !== undefined && !isNaN(Number(data.supplierCost))
            ? Number(data.supplierCost)
            : null,
        metadata,
      };

      if (!isEditing && seriesMode) {
        if (seriesDates.length === 0) {
          throw new Error(
            "Please select a valid From Date, To Date, and at least one weekday for series creation.",
          );
        }

        const effectivePreset: ExpiryPreset =
          expiryPreset === "CUSTOM" ? "6H_BEFORE" : expiryPreset;

        const items: CreateSpecialFareInput[] = seriesDates.map((isoDay) => {
          const dep = new Date(`${isoDay}T${seriesDepTime || "12:00"}:00`);
          let arrIso: string | null = null;
          if (seriesArrTime) {
            const arr = new Date(`${isoDay}T${seriesArrTime}:00`);
            if (seriesNextDayArrival || arr.getTime() < dep.getTime()) {
              arr.setDate(arr.getDate() + 1);
            }
            arrIso = arr.toISOString();
          }
          const exp =
            computePresetExpiry(dep, effectivePreset) ||
            new Date(dep.getTime() - 6 * 3600 * 1000);

          return {
            ...baseFields,
            departureDate: dep.toISOString(),
            arrivalDate: arrIso,
            expiresAt: exp.toISOString(),
          };
        });

        const res = await specialFaresApi.bulkCreateSpecialFares(items);
        return { kind: "bulk" as const, count: res.createdCount };
      }

      const singlePayload: CreateSpecialFareInput = {
        ...baseFields,
        departureDate: new Date(data.departureDate).toISOString(),
        arrivalDate: data.arrivalDate
          ? new Date(data.arrivalDate).toISOString()
          : null,
        expiresAt: data.expiresAt
          ? new Date(data.expiresAt).toISOString()
          : undefined,
      };

      if (isEditing && initialData) {
        await specialFaresApi.updateSpecialFare(initialData.id, singlePayload);
        return { kind: "single" as const, count: 1 };
      }
      await specialFaresApi.createSpecialFare(singlePayload);
      return { kind: "single" as const, count: 1 };
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["special-fares"] });
      if (res.kind === "bulk") {
        onSuccess(`${res.count} series allotments published to inventory.`);
      } else {
        onSuccess(
          isEditing
            ? "Special fare allotment updated successfully."
            : "Special fare allotment added to inventory.",
        );
      }
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
      panelClassName="max-w-[820px]"
      busy={mutation.isPending}
      title={
        isEditing
          ? `Edit Allotment: ${initialData?.originCode} ➔ ${initialData?.destinationCode}`
          : "Add Special Fare Allotment"
      }
      description="Enter bulk contracted flight ticket details or create a date-range series. Internal supplier costs, RBD, and PNRs stay strictly hidden from the public website."
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
            {isEditing
              ? "Save Changes"
              : seriesMode && seriesDates.length > 0
                ? `Publish ${seriesDates.length} Allotments`
                : "Publish Allotment"}
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

        {/* Section 1: Sector, Airport Search & Airline */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2.5">
            <Plane className="w-4 h-4 text-indigo-600" />
            <span>Sector & Flight Info</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="field sm:col-span-5">
              <label htmlFor="sf-originCity">Origin City *</label>
              <CatalogAutocomplete
                id="sf-originCity"
                value={watchOriginCity}
                placeholder="Search e.g. Kozhikode or CCJ"
                options={airportOptions}
                onChangeText={(text) =>
                  setValue("originCity", text, { shouldValidate: true })
                }
                onSelectOption={(opt) => {
                  setValue("originCity", opt.label, { shouldValidate: true });
                  if (opt.badge) {
                    setValue("originCode", opt.badge, { shouldValidate: true });
                  }
                }}
              />
              {errors.originCity && (
                <p className="text-xs text-rose-600">
                  {errors.originCity.message}
                </p>
              )}
            </div>

            <div className="field sm:col-span-4">
              <label htmlFor="sf-originCode">Origin IATA *</label>
              <input
                id="sf-originCode"
                {...register("originCode")}
                placeholder="CCJ"
                maxLength={5}
                className="uppercase font-mono"
              />
              {errors.originCode && (
                <p className="text-xs text-rose-600">
                  {errors.originCode.message}
                </p>
              )}
            </div>

            <div className="field sm:col-span-3">
              <label htmlFor="sf-originTerminal">Dep Terminal</label>
              <input
                id="sf-originTerminal"
                {...register("originTerminal")}
                placeholder="e.g. T1"
                maxLength={20}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="field sm:col-span-5">
              <label htmlFor="sf-destinationCity">Destination City *</label>
              <CatalogAutocomplete
                id="sf-destinationCity"
                value={watchDestCity}
                placeholder="Search e.g. Dubai or DXB"
                options={airportOptions}
                onChangeText={(text) =>
                  setValue("destinationCity", text, { shouldValidate: true })
                }
                onSelectOption={(opt) => {
                  setValue("destinationCity", opt.label, {
                    shouldValidate: true,
                  });
                  if (opt.badge) {
                    setValue("destinationCode", opt.badge, {
                      shouldValidate: true,
                    });
                  }
                }}
              />
              {errors.destinationCity && (
                <p className="text-xs text-rose-600">
                  {errors.destinationCity.message}
                </p>
              )}
            </div>

            <div className="field sm:col-span-4">
              <label htmlFor="sf-destinationCode">Dest IATA *</label>
              <input
                id="sf-destinationCode"
                {...register("destinationCode")}
                placeholder="DXB"
                maxLength={5}
                className="uppercase font-mono"
              />
              {errors.destinationCode && (
                <p className="text-xs text-rose-600">
                  {errors.destinationCode.message}
                </p>
              )}
            </div>

            <div className="field sm:col-span-3">
              <label htmlFor="sf-destinationTerminal">Arr Terminal</label>
              <input
                id="sf-destinationTerminal"
                {...register("destinationTerminal")}
                placeholder="e.g. T2"
                maxLength={20}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="field sm:col-span-4">
              <label htmlFor="sf-airlineName">Airline Name *</label>
              <CatalogAutocomplete
                id="sf-airlineName"
                value={watchAirlineName}
                placeholder="Search e.g. Salam Air"
                options={airlineOptions}
                onChangeText={(text) =>
                  setValue("airlineName", text, { shouldValidate: true })
                }
                onSelectOption={(opt) => {
                  setValue("airlineName", opt.label, { shouldValidate: true });
                  if (opt.badge) setValue("airlineCode", opt.badge);
                }}
              />
              {errors.airlineName && (
                <p className="text-xs text-rose-600">
                  {errors.airlineName.message}
                </p>
              )}
            </div>

            <div className="field sm:col-span-2">
              <label htmlFor="sf-airlineCode">Code</label>
              <input
                id="sf-airlineCode"
                {...register("airlineCode")}
                placeholder="OV"
                className="uppercase font-mono"
              />
            </div>

            <div className="field sm:col-span-2">
              <label htmlFor="sf-flightNumber">Flight No.</label>
              <input
                id="sf-flightNumber"
                {...register("flightNumber")}
                placeholder="OV-789"
                className="uppercase font-mono"
              />
            </div>

            <div className="field sm:col-span-2">
              <label htmlFor="sf-cabinClass">Cabin Class</label>
              <select id="sf-cabinClass" {...register("cabinClass")}>
                <option value="ECONOMY">Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST_CLASS">First Class</option>
              </select>
            </div>

            <div className="field sm:col-span-2">
              <label htmlFor="sf-rbd">RBD (Staff)</label>
              <input
                id="sf-rbd"
                {...register("rbd")}
                placeholder="e.g. G"
                maxLength={4}
                className="uppercase font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-5">
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

            {/* Refundable Toggle (matches Riya Refund: Yes/No) */}
            <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg">
              <input
                type="checkbox"
                checked={Boolean(watchIsRefundable)}
                onChange={(e) => setValue("isRefundable", e.target.checked)}
                className="accent-emerald-600 w-3.5 h-3.5"
              />
              <span>Refundable Fare</span>
            </label>
          </div>

          {/* Connecting / Layover Segment Details */}
          {watchFlightType === "CONNECTING" && (
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="field">
                <label htmlFor="sf-layover-via">Via / Layover Hub</label>
                <input
                  id="sf-layover-via"
                  value={layoverVia}
                  onChange={(e) => setLayoverVia(e.target.value)}
                  placeholder="e.g. Muscat (MCT)"
                />
              </div>
              <div className="field">
                <label htmlFor="sf-layover-flight">2nd Leg Flight No.</label>
                <input
                  id="sf-layover-flight"
                  value={layoverFlight}
                  onChange={(e) => setLayoverFlight(e.target.value)}
                  placeholder="e.g. OV-204"
                  className="uppercase font-mono"
                />
              </div>
              <div className="field">
                <label htmlFor="sf-layover-dur">Layover Duration</label>
                <input
                  id="sf-layover-dur"
                  value={layoverDuration}
                  onChange={(e) => setLayoverDuration(e.target.value)}
                  placeholder="e.g. 2h 15m transit"
                />
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Schedule, Series Mode & Stop Ticketing Auto-Expiry */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Schedule & Stop Ticketing Cut-Off</span>
            </div>

            {!isEditing && (
              <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setSeriesMode(false)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    !seriesMode
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Single Date
                </button>
                <button
                  type="button"
                  onClick={() => setSeriesMode(true)}
                  className={`px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition cursor-pointer ${
                    seriesMode
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <CalendarRange className="w-3 h-3" />
                  <span>Date Range Series</span>
                </button>
              </div>
            )}
          </div>

          {!seriesMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="field">
                <label htmlFor="sf-departureDate">
                  Departure Date & Time *
                </label>
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
                <label htmlFor="sf-expiresAt">Stop Ticketing / Expiry *</label>
                <input
                  id="sf-expiresAt"
                  type="datetime-local"
                  {...register("expiresAt")}
                  onChange={(e) => {
                    setExpiryPreset("CUSTOM");
                    setValue("expiresAt", e.target.value);
                  }}
                />
                <small>Auto-hides from site after this timestamp</small>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 rounded-xl bg-indigo-50/40 border border-indigo-200/70">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="field">
                  <label htmlFor="sf-series-from">From Date *</label>
                  <input
                    id="sf-series-from"
                    type="date"
                    value={seriesFromDate}
                    onChange={(e) => setSeriesFromDate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="sf-series-to">To Date *</label>
                  <input
                    id="sf-series-to"
                    type="date"
                    value={seriesToDate}
                    onChange={(e) => setSeriesToDate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="sf-series-dep">Departure Time *</label>
                  <input
                    id="sf-series-dep"
                    type="time"
                    value={seriesDepTime}
                    onChange={(e) => setSeriesDepTime(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="sf-series-arr">Arrival Time</label>
                  <input
                    id="sf-series-arr"
                    type="time"
                    value={seriesArrTime}
                    onChange={(e) => setSeriesArrTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="block text-[11px] font-semibold text-zinc-600 mb-1.5">
                    Days of Operation
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {WEEKDAYS.map((wd) => {
                      const active = seriesWeekdays.includes(wd.day);
                      return (
                        <button
                          key={wd.day}
                          type="button"
                          onClick={() =>
                            setSeriesWeekdays((prev) =>
                              prev.includes(wd.day)
                                ? prev.filter((d) => d !== wd.day)
                                : [...prev, wd.day],
                            )
                          }
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition cursor-pointer ${
                            active
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          {wd.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setSeriesWeekdays([0, 1, 2, 3, 4, 5, 6])}
                      className="text-[11px] font-medium text-indigo-600 hover:underline ml-1 cursor-pointer"
                    >
                      All Days
                    </button>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-xs text-zinc-700 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={seriesNextDayArrival}
                    onChange={(e) => setSeriesNextDayArrival(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  <span>Arrival Next Day (+1)</span>
                </label>
              </div>

              <div className="text-xs font-medium text-indigo-900 bg-white/80 border border-indigo-200 rounded-lg px-3 py-2">
                {seriesDates.length > 0 ? (
                  <span>
                    Will create <strong>{seriesDates.length} allotments</strong>{" "}
                    (same quota per date) from <strong>{seriesDates[0]}</strong>{" "}
                    to <strong>{seriesDates[seriesDates.length - 1]}</strong>.
                  </span>
                ) : (
                  <span className="text-zinc-500">
                    Pick From &amp; To dates above to preview series batch size
                    (max 100 per series).
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Riya Stop Ticketing Cut-off Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500 mr-1">
              Stop Ticketing Preset:
            </span>
            {(
              [
                { id: "6H_BEFORE", label: "6h Before Dep" },
                { id: "1D_2200", label: "1 Day Before (22:00)" },
                { id: "2D_2200", label: "2 Days Before (22:00)" },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setExpiryPreset(preset.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition cursor-pointer ${
                  expiryPreset === preset.id
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {preset.label}
              </button>
            ))}
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

        {/* Section 4: Seats, Pricing (Adult / Child / Infant) & Margin */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2.5">
            <IndianRupee className="w-4 h-4 text-indigo-600" />
            <span>Seats &amp; Commercials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="field">
              <label htmlFor="sf-totalSeats">
                {seriesMode ? "Seats Per Date *" : "Total Quota *"}
              </label>
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
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="field">
              <label htmlFor="sf-farePerSeat">Adult Special Fare (₹) *</label>
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

            <div className="field">
              <label htmlFor="sf-childFare">Child Fare (₹)</label>
              <input
                id="sf-childFare"
                type="number"
                min={0}
                placeholder="e.g. 15000"
                {...register("childFare", { valueAsNumber: true })}
              />
            </div>

            <div className="field">
              <label htmlFor="sf-infantFare">Infant Fare (₹)</label>
              <input
                id="sf-infantFare"
                type="number"
                min={0}
                placeholder="e.g. 5000"
                {...register("infantFare", { valueAsNumber: true })}
              />
            </div>

            <div className="field">
              <label htmlFor="sf-originalFare">Crossed Market Fare (₹)</label>
              <input
                id="sf-originalFare"
                type="number"
                min={0}
                placeholder="Red crossed price"
                {...register("originalFare", { valueAsNumber: true })}
              />
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
                {seriesMode && seriesDates.length > 0
                  ? `Series Potential: ₹${(
                      marginAmount *
                      (watchTotalSeats || 1) *
                      seriesDates.length
                    ).toLocaleString("en-IN")}`
                  : `Total Batch Profit: ₹${(
                      marginAmount * (watchTotalSeats || 1)
                    ).toLocaleString("en-IN")}`}
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

        {/* Section 5: Extensible Additional Details */}
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
              Optional custom attributes (e.g., Meal Policy, Fare Rules). Click
              &ldquo;Add Field&rdquo; to attach extra ticket details.
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
                      placeholder="Field Name (e.g. Meal Policy)"
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
                      placeholder="Value (e.g. Complimentary Snack)"
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
