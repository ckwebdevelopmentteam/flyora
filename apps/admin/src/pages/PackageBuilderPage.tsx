import { userMessage } from "../lib/userMessage";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPackageSchema,
  type CreatePackageInput,
} from "@flyora/validators";
import { apiClient } from "../lib/apiClient";
import { packagesApi } from "../lib/packagesApi";
import type { ServiceSummary } from "@flyora/types";
import {
  R2ImageDropzone,
  R2GalleryUploader,
} from "../components/packages/R2ImageDropzone";
import { ItineraryBuilder } from "../components/packages/ItineraryBuilder";
import { TagInput } from "../components/packages/TagInput";
import { SerpPreview } from "../components/packages/SerpPreview";
import {
  ArrowLeft,
  Save,
  Loader2,
  Info,
  Image as ImageIcon,
  Calendar,
  CheckCircle2,
  Globe,
  Sparkles,
  AlertCircle,
} from "lucide-react";

type TabKey = "basic" | "media" | "itinerary" | "inclusions" | "seo";

const INCLUSION_PRESETS = [
  "Return Flight Tickets",
  "4-Star / 5-Star Hotel Stay",
  "Daily Buffet Breakfast",
  "Airport Transfers (Private)",
  "Visa Assistance & Insurance",
  "English Speaking Tour Guide",
  "Sightseeing & Entrance Tickets",
];

const EXCLUSION_PRESETS = [
  "Personal Expenses & Shopping",
  "Tips & Gratuities",
  "GST (5%) & TCS",
  "Travel Insurance",
  "Optional Tours & Water Sports",
  "Meals not specified in the plan",
  "Early check-in / Late check-out",
];

export const PackageBuilderPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const isEditMode = Boolean(slug);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch all available services
  const { data: services = [], isLoading: isLoadingServices } = useQuery<
    ServiceSummary[]
  >({
    queryKey: ["services"],
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: () => apiClient.get("/services"),
  });

  // Fetch package if in edit mode
  const { data: existingPackage, isLoading: isLoadingExisting } = useQuery({
    queryKey: ["package", slug],
    queryFn: () => (slug ? packagesApi.getPackageBySlug(slug) : null),
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreatePackageInput>({
    resolver: zodResolver(createPackageSchema as any),
    defaultValues: {
      serviceId: "",
      title: "",
      slug: "",
      durationDays: 5,
      durationNights: 4,
      destination: "",
      startingPrice: 0,
      coverImageUrl: "",
      galleryImageUrls: [],
      overview: "",
      itinerary: [
        {
          day: 1,
          title: "",
          description: "",
          meals: "",
          stay: "",
        },
      ],
      inclusions: [],
      exclusions: [],
      isFeatured: false,
      isPublished: true,
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
  });

  // Reset form when editing existing package
  useEffect(() => {
    if (existingPackage) {
      reset({
        serviceId: existingPackage.serviceId,
        title: existingPackage.title,
        slug: existingPackage.slug,
        durationDays: existingPackage.durationDays,
        durationNights: existingPackage.durationNights,
        destination: existingPackage.destination,
        startingPrice: Number(existingPackage.startingPrice),
        coverImageUrl: existingPackage.coverImageUrl,
        galleryImageUrls: existingPackage.galleryImageUrls || [],
        overview: existingPackage.overview,
        itinerary: existingPackage.itinerary || [],
        inclusions: existingPackage.inclusions || [],
        exclusions: existingPackage.exclusions || [],
        isFeatured: existingPackage.isFeatured,
        isPublished: existingPackage.isPublished,
        metaTitle: existingPackage.metaTitle || "",
        metaDescription: existingPackage.metaDescription || "",
        keywords: existingPackage.keywords || [],
      });
    }
  }, [existingPackage, reset]);

  // Set default serviceId when services load in create mode
  useEffect(() => {
    if (!isEditMode && services.length > 0 && !watch("serviceId")) {
      setValue("serviceId", services[0].id);
    }
  }, [services, isEditMode, setValue, watch]);

  // Watched values
  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedOverview = watch("overview");
  const watchedMetaTitle = watch("metaTitle") || "";
  const watchedMetaDesc = watch("metaDescription") || "";

  // Helper to auto-generate slug from title
  const handleGenerateSlug = () => {
    if (!watchedTitle) return;
    const cleanSlug = watchedTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setValue("slug", cleanSlug, { shouldValidate: true });
  };

  // Mutation to create or update
  const saveMutation = useMutation({
    mutationFn: async (data: CreatePackageInput) => {
      if (isEditMode && existingPackage) {
        return packagesApi.updatePackage(existingPackage.id, data);
      }
      return packagesApi.createPackage(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["package"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setSuccessToast(
        isEditMode
          ? "Package updated successfully"
          : "Package created successfully",
      );
      setTimeout(() => {
        navigate("/packages");
      }, 1200);
    },
    onError: (err: any) => {
      setSubmitError(
        userMessage(err, "Failed to save package. Please check inputs."),
      );
    },
  });

  const onSubmit = (formData: CreatePackageInput) => {
    setSubmitError(null);
    if (uploadingImages) {
      setSubmitError("Please wait for the photos to finish uploading.");
      return;
    }
    saveMutation.mutate({
      ...formData,
      itinerary: formData.itinerary.map((day, index) => ({
        ...day,
        day: index + 1,
      })),
    });
  };
  const onInvalid = (fields: typeof errors) => {
    const basic = [
      "title",
      "slug",
      "destination",
      "serviceId",
      "durationDays",
      "durationNights",
      "startingPrice",
      "overview",
    ] as const;
    setActiveTab(
      basic.some((key) => fields[key])
        ? "basic"
        : fields.coverImageUrl || fields.galleryImageUrls
          ? "media"
          : fields.itinerary
            ? "itinerary"
            : fields.inclusions || fields.exclusions
              ? "inclusions"
              : "seo",
    );
    setSubmitError("Please check the highlighted fields before saving.");
  };

  // Identify which tabs have validation errors
  const hasBasicErrors = Boolean(
    errors.title ||
    errors.slug ||
    errors.destination ||
    errors.serviceId ||
    errors.durationDays ||
    errors.durationNights ||
    errors.startingPrice ||
    errors.overview,
  );
  const hasMediaErrors = Boolean(
    errors.coverImageUrl || errors.galleryImageUrls,
  );
  const hasItineraryErrors = Boolean(errors.itinerary);

  if (isEditMode && isLoadingExisting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
        <p className="text-xs font-mono text-zinc-500">
          Loading package details...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Link
              to="/packages"
              className="hover:text-black transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tour Packages</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-medium">
              {isEditMode ? "Edit Package" : "Create New Package"}
            </span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            {isEditMode
              ? `Edit: ${existingPackage?.title || watchedTitle}`
              : "Tour Package & Itinerary Builder"}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/packages")}
            disabled={uploadingImages}
            className="px-3.5 py-2 rounded-md border border-zinc-200 bg-white text-zinc-700 text-xs font-medium hover:bg-zinc-100 transition shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saveMutation.isPending || isSubmitting || uploadingImages}
            onClick={handleSubmit(onSubmit, onInvalid)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 disabled:opacity-50 transition shadow-xs"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEditMode ? "Update Package" : "Publish Package"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 rounded-md bg-zinc-900 text-white flex items-center gap-2.5 text-xs shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Banner */}
      {submitError && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Builder Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-200 overflow-x-auto pb-px">
        {[
          {
            key: "basic",
            label: "1. Basic Details",
            icon: Info,
            hasError: hasBasicErrors,
          },
          {
            key: "media",
            label: "2. Photos",
            icon: ImageIcon,
            hasError: hasMediaErrors,
          },
          {
            key: "itinerary",
            label: "3. Itinerary",
            icon: Calendar,
            hasError: hasItineraryErrors,
          },
          {
            key: "inclusions",
            label: "4. Inclusions & Exclusions",
            icon: CheckCircle2,
            hasError: false,
          },
          {
            key: "seo",
            label: "5. Website listing",
            icon: Globe,
            hasError: false,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              disabled={uploadingImages}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                isActive
                  ? "border-black text-black font-semibold bg-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{tab.label}</span>
              {tab.hasError && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* ================= TAB 1: BASIC INFORMATION ================= */}
        {activeTab === "basic" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 font-mono">
                Package details
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Add the trip details and starting price.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Package Title */}
              <div>
                <label
                  className="block text-xs font-medium text-zinc-900 mb-1"
                  htmlFor="package-title"
                >
                  Package Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="package-title"
                  type="text"
                  placeholder="e.g. 5D/4N Dubai Family Luxury & Desert Safari"
                  {...register("title")}
                  className="w-full text-xs px-3.5 py-2.5 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
                />
                {errors.title && (
                  <p className="text-[11px] text-red-600 mt-1 font-mono">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Unique Website address with generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    className="block text-xs font-medium text-zinc-900"
                    htmlFor="package-slug"
                  >
                    Website address
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="text-[11px] text-zinc-600 hover:text-black font-mono flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Generate</span>
                  </button>
                </div>
                <div className="flex items-center rounded-md border border-zinc-200 bg-[#FAFAF9] focus-within:border-black focus-within:bg-white transition overflow-hidden">
                  <span className="px-3 py-2 text-xs font-mono text-zinc-400 bg-zinc-100/60 border-r border-zinc-200 select-none">
                    /packages/
                  </span>
                  <input
                    id="package-slug"
                    type="text"
                    placeholder="5d-4n-dubai-family-luxury"
                    {...register("slug")}
                    className="min-w-0 flex-1 text-xs px-3 py-2 bg-transparent outline-none text-zinc-900 font-mono"
                  />
                </div>
                {errors.slug && (
                  <p className="text-[11px] text-red-600 mt-1 font-mono">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Destination */}
              <div>
                <label
                  className="block text-xs font-medium text-zinc-900 mb-1"
                  htmlFor="package-destination"
                >
                  Destination / Country <span className="text-red-500">*</span>
                </label>
                <input
                  id="package-destination"
                  type="text"
                  placeholder="e.g. Dubai, United Arab Emirates"
                  {...register("destination")}
                  className="w-full text-xs px-3.5 py-2 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
                />
                {errors.destination && (
                  <p className="text-[11px] text-red-600 mt-1 font-mono">
                    {errors.destination.message}
                  </p>
                )}
              </div>

              {/* Service Category */}
              <div>
                <label
                  className="block text-xs font-medium text-zinc-900 mb-1"
                  htmlFor="package-serviceId"
                >
                  Operating Service Category{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="package-serviceId"
                  disabled={isLoadingServices}
                  {...register("serviceId")}
                  className="w-full text-xs px-3.5 py-2 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
                >
                  <option value="">Select Service Category</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name}
                    </option>
                  ))}
                </select>
                {errors.serviceId && (
                  <p className="text-[11px] text-red-600 mt-1 font-mono">
                    {errors.serviceId.message}
                  </p>
                )}
              </div>

              {/* Duration Days & Nights */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-zinc-900 mb-1"
                    htmlFor="package-durationDays"
                  >
                    Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="package-durationDays"
                    type="number"
                    min={1}
                    {...register("durationDays", { valueAsNumber: true })}
                    className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
                  />
                  {errors.durationDays && (
                    <p className="text-[11px] text-red-600 mt-1 font-mono">
                      {errors.durationDays.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-zinc-900 mb-1"
                    htmlFor="package-durationNights"
                  >
                    Nights <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="package-durationNights"
                    type="number"
                    min={0}
                    {...register("durationNights", { valueAsNumber: true })}
                    className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
                  />
                  {errors.durationNights && (
                    <p className="text-[11px] text-red-600 mt-1 font-mono">
                      {errors.durationNights.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Starting Price */}
              <div>
                <label
                  className="block text-xs font-medium text-zinc-900 mb-1"
                  htmlFor="package-startingPrice"
                >
                  Starting Price (₹ INR) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-md border border-zinc-200 bg-[#FAFAF9] focus-within:border-black focus-within:bg-white transition overflow-hidden">
                  <span className="px-3 py-2 text-xs font-mono text-zinc-500 bg-zinc-100/60 border-r border-zinc-200 select-none">
                    ₹
                  </span>
                  <input
                    id="package-startingPrice"
                    type="number"
                    min={1}
                    step={100}
                    placeholder="49999"
                    {...register("startingPrice", { valueAsNumber: true })}
                    className="min-w-0 flex-1 text-xs px-3 py-2 bg-transparent outline-none text-zinc-900 font-mono"
                  />
                </div>
                {errors.startingPrice && (
                  <p className="text-[11px] text-red-600 mt-1 font-mono">
                    {errors.startingPrice.message}
                  </p>
                )}
              </div>

              {/* Overview / Tour Description */}
              <div className="md:col-span-2">
                <label
                  className="block text-xs font-medium text-zinc-900 mb-1"
                  htmlFor="package-overview"
                >
                  Overview / Tour Summary{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="package-overview"
                  rows={4}
                  placeholder="Provide an enticing summary of this tour package, key highlights, target traveler profile, and signature inclusions..."
                  {...register("overview")}
                  className="w-full text-xs px-3.5 py-2.5 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition leading-relaxed"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.overview ? (
                    <p className="text-[11px] text-red-600 font-mono">
                      {errors.overview.message}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {watchedOverview?.length || 0} characters
                  </span>
                </div>
              </div>

              {/* Featured & Published Switches */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-[#FAFAF9] cursor-pointer hover:bg-zinc-100/40 transition">
                  <input
                    type="checkbox"
                    {...register("isPublished")}
                    className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black accent-black"
                  />
                  <div>
                    <span className="block text-xs font-medium text-zinc-900">
                      Publish to Catalog
                    </span>
                    <span className="block text-[11px] text-zinc-500 font-mono">
                      Visible to travelers on the public website catalog
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-[#FAFAF9] cursor-pointer hover:bg-zinc-100/40 transition">
                  <input
                    type="checkbox"
                    {...register("isFeatured")}
                    className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black accent-black"
                  />
                  <div>
                    <span className="block text-xs font-medium text-zinc-900">
                      Feature on Homepage
                    </span>
                    <span className="block text-[11px] text-zinc-500 font-mono">
                      Show in spotlight carousel and top deals section
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Next Tab Button */}
            <div className="pt-3 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  if (
                    await trigger([
                      "title",
                      "slug",
                      "destination",
                      "serviceId",
                      "durationDays",
                      "durationNights",
                      "startingPrice",
                      "overview",
                    ])
                  )
                    setActiveTab("media");
                }}
                className="px-4 py-2 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition"
              >
                Continue to photos →
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PHOTOS & R2 DIRECT UPLOAD ================= */}
        {activeTab === "media" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 font-mono">
                Package photos
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Choose clear photos to help customers explore the trip.
              </p>
            </div>

            {/* Cover Image Slot */}
            <div className="space-y-2">
              <Controller
                control={control}
                name="coverImageUrl"
                render={({ field }) => (
                  <R2ImageDropzone
                    value={field.value}
                    onChange={field.onChange}
                    label="Cover photo *"
                    disabled={uploadingImages}
                    onUploadingChange={setUploadingImages}
                    helperText="JPG, PNG or WebP · Up to 10 MB"
                  />
                )}
              />
              {errors.coverImageUrl && (
                <p className="text-[11px] text-red-600 font-mono">
                  {errors.coverImageUrl.message}
                </p>
              )}
            </div>

            {/* Multi-Photo Gallery */}
            <div className="pt-4 border-t border-zinc-100">
              <Controller
                control={control}
                name="galleryImageUrls"
                render={({ field }) => (
                  <R2GalleryUploader
                    urls={field.value || []}
                    onChange={field.onChange}
                    disabled={uploadingImages}
                    onUploadingChange={setUploadingImages}
                    coverUrl={watch("coverImageUrl")}
                    onChooseCover={(url) =>
                      setValue("coverImageUrl", url, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                )}
              />
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-between">
              <button
                type="button"
                disabled={uploadingImages}
                onClick={() => setActiveTab("basic")}
                className="px-3.5 py-1.5 rounded-md border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-100 transition"
              >
                ← Back to Basic Info
              </button>
              <button
                type="button"
                disabled={uploadingImages}
                onClick={() => setActiveTab("itinerary")}
                className="px-4 py-2 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition"
              >
                Proceed to Itinerary Builder →
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: DAY-BY-DAY ITINERARY ================= */}
        {activeTab === "itinerary" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs space-y-6">
            <ItineraryBuilder
              control={control}
              register={register}
              errors={errors}
            />

            <div className="pt-3 border-t border-zinc-100 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className="px-3.5 py-1.5 rounded-md border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-100 transition"
              >
                ← Back to Media
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("inclusions")}
                className="px-4 py-2 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition"
              >
                Proceed to Inclusions & Exclusions →
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 4: INCLUSIONS & EXCLUSIONS ================= */}
        {activeTab === "inclusions" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 font-mono">
                Included & not included
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Choose what the price covers and what the customer pays
                separately.
              </p>
            </div>

            <div className="package-extras-editors">
              {/* Inclusions */}
              <Controller
                control={control}
                name="inclusions"
                render={({ field }) => (
                  <TagInput
                    label="Included"
                    helperText="Press Enter after typing or click suggested preset badges below."
                    tags={field.value || []}
                    onChange={field.onChange}
                    presets={INCLUSION_PRESETS}
                    variant="inclusion"
                  />
                )}
              />

              {/* Exclusions */}
              <div>
                <Controller
                  control={control}
                  name="exclusions"
                  render={({ field }) => (
                    <TagInput
                      label="Not included"
                      helperText="Specify exclusions to avoid customer misunderstandings."
                      tags={field.value || []}
                      onChange={field.onChange}
                      presets={EXCLUSION_PRESETS}
                      variant="exclusion"
                    />
                  )}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-between">
              <button
                type="button"
                disabled={uploadingImages}
                onClick={() => setActiveTab("itinerary")}
                className="px-3.5 py-1.5 rounded-md border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-100 transition"
              >
                ← Back to Itinerary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className="px-4 py-2 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition"
              >
                Proceed to SEO & SERP →
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SEO & GOOGLE SERP ================= */}
        {activeTab === "seo" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 font-mono">
                Search Engine Optimization & Metadata
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Optimize meta tags for higher Google ranking and attractive
                social media shares.
              </p>
            </div>

            {/* Google SERP Live Simulation */}
            <SerpPreview
              title={watchedMetaTitle || watchedTitle}
              slug={watchedSlug || ""}
              description={watchedMetaDesc || watchedOverview}
            />

            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  className="block text-xs font-medium text-zinc-900"
                  htmlFor="package-metaTitle"
                >
                  Meta Title
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    watchedMetaTitle.length > 60
                      ? "text-amber-600 font-medium"
                      : "text-zinc-400"
                  }`}
                >
                  {watchedMetaTitle.length} / 60 characters
                </span>
              </div>
              <input
                id="package-metaTitle"
                type="text"
                placeholder="e.g. 5D/4N Dubai Luxury Family Tour Package | Flyora Travels"
                {...register("metaTitle")}
                className="w-full text-xs px-3.5 py-2 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  className="block text-xs font-medium text-zinc-900"
                  htmlFor="package-metaDescription"
                >
                  Meta Description
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    watchedMetaDesc.length > 160
                      ? "text-amber-600 font-medium"
                      : "text-zinc-400"
                  }`}
                >
                  {watchedMetaDesc.length} / 160 characters
                </span>
              </div>
              <textarea
                id="package-metaDescription"
                rows={3}
                placeholder="Book the ultimate 5-day luxury Dubai vacation with Flyora. Includes Desert Safari, Burj Khalifa VIP access, private transfers, and 5-star hotel accommodations."
                {...register("metaDescription")}
                className="w-full text-xs px-3.5 py-2 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
              />
            </div>

            {/* Keywords */}
            <Controller
              control={control}
              name="keywords"
              render={({ field }) => (
                <TagInput
                  label="Search Keywords"
                  helperText="Add target search keywords (e.g. 'dubai holiday package', 'burj khalifa tour', 'desert safari')."
                  tags={field.value || []}
                  onChange={field.onChange}
                />
              )}
            />

            <div className="pt-3 border-t border-zinc-100 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("inclusions")}
                className="px-3.5 py-1.5 rounded-md border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-100 transition"
              >
                ← Back to Inclusions
              </button>
              <button
                type="button"
                disabled={
                  saveMutation.isPending || isSubmitting || uploadingImages
                }
                onClick={handleSubmit(onSubmit, onInvalid)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 disabled:opacity-50 transition shadow-xs"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Package...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>
                      {isEditMode ? "Save Changes" : "Publish Tour Package"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
