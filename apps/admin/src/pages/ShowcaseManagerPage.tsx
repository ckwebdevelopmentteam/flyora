import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { packagesApi } from "../lib/packagesApi";
import { PackageImage } from "../components/packages/PackageImage";
import { Modal } from "../components/ui/Modal";
import type { PackageSummary, ShowcaseConfig } from "@flyora/types";
import {
  Globe,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Edit3,
  Layers,
  GripVertical,
  Search,
} from "lucide-react";

export const ShowcaseManagerPage = () => {
  const queryClient = useQueryClient();

  // Queries
  const {
    data: showcaseData,
    isLoading: isLoadingShowcase,
    isRefetching: isRefetchingShowcase,
  } = useQuery({
    queryKey: ["showcase"],
    queryFn: () => packagesApi.getShowcase(),
  });

  const { data: allPackagesData } = useQuery({
    queryKey: ["packages", { limit: 50, includeUnpublished: true }],
    queryFn: () =>
      packagesApi.listPackages({ limit: 50, includeUnpublished: true }),
  });

  // Notifications & UI State
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Modals state
  const [editingSection, setEditingSection] = useState<
    "popular" | "featured" | null
  >(null);
  const [pendingTitle, setPendingTitle] = useState("");
  const [pendingEyebrow, setPendingEyebrow] = useState("");
  const [showTitleWarning, setShowTitleWarning] = useState(false);

  const [addingToSection, setAddingToSection] = useState<
    "popular" | "featured" | null
  >(null);
  const [addSearchTerm, setAddSearchTerm] = useState("");

  const [packageToRemove, setPackageToRemove] = useState<{
    pkg: PackageSummary;
    section: "popular" | "featured";
  } | null>(null);

  const [packageToHide, setPackageToHide] = useState<PackageSummary | null>(
    null,
  );

  // Drag-and-drop state
  const [draggedItem, setDraggedItem] = useState<{
    section: "popular" | "featured";
    index: number;
  } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const showErrorNotification = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4500);
  };

  // =========================================================================
  // MUTATIONS (Strict backend confirmation before closing/notifying)
  // =========================================================================

  const updateConfigMutation = useMutation({
    mutationFn: async (payload: Partial<ShowcaseConfig>) => {
      const result = await packagesApi.updateShowcaseConfig(payload);
      await queryClient.refetchQueries({ queryKey: ["showcase"] });
      return result;
    },
    onSuccess: () => {
      setShowTitleWarning(false);
      setEditingSection(null);
      showNotification("Section title updated live on public website!");
    },
    onError: (err: any) => {
      showErrorNotification(
        err?.message || "Failed to update section title. Please try again.",
      );
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({
      section,
      itemIds,
    }: {
      section: "popular" | "featured";
      itemIds: string[];
    }) => {
      const res = await packagesApi.reorderShowcase(section, itemIds);
      await queryClient.refetchQueries({ queryKey: ["showcase"] });
      return res;
    },
    onSuccess: () => {
      showNotification("Display order updated live on website!");
    },
    onError: (err: any) => {
      showErrorNotification(
        err?.message || "Failed to update order. Please try again.",
      );
    },
  });

  const removeShowcaseMutation = useMutation({
    mutationFn: async ({
      packageId,
      section,
    }: {
      packageId: string;
      section: "popular" | "featured";
    }) => {
      const res = await packagesApi.togglePackageShowcase(
        packageId,
        section,
        false,
      );
      await queryClient.refetchQueries({ queryKey: ["showcase"] });
      return res;
    },
    onSuccess: (_, variables) => {
      const sectionName =
        variables.section === "popular"
          ? "Popular packages"
          : "Featured packages";
      setPackageToRemove(null);
      showNotification(
        `Package removed from ${sectionName} and updated on website.`,
      );
    },
    onError: (err: any) => {
      showErrorNotification(
        err?.message || "Failed to remove package. Please try again.",
      );
    },
  });

  const addToShowcaseMutation = useMutation({
    mutationFn: async ({
      packageId,
      section,
    }: {
      packageId: string;
      section: "popular" | "featured";
    }) => {
      const res = await packagesApi.togglePackageShowcase(
        packageId,
        section,
        true,
      );
      await queryClient.refetchQueries({ queryKey: ["showcase"] });
      return res;
    },
    onSuccess: (_, variables) => {
      const sectionName =
        variables.section === "popular"
          ? "Popular packages"
          : "Featured packages";
      setAddingToSection(null);
      showNotification(`Package added to ${sectionName} live!`);
    },
    onError: (err: any) => {
      showErrorNotification(
        err?.message || "Failed to add package to section. Please try again.",
      );
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({
      id,
      isPublished,
    }: {
      id: string;
      isPublished: boolean;
    }) => {
      const res = await packagesApi.togglePackagePublish(id, isPublished);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["showcase"] }),
        queryClient.refetchQueries({ queryKey: ["packages"] }),
      ]);
      return res;
    },
    onSuccess: (_, variables) => {
      setPackageToHide(null);
      showNotification(
        variables.isPublished
          ? "Package published and now visible on website."
          : "Package hidden from public website and carousels.",
      );
    },
    onError: (err: any) => {
      showErrorNotification(
        err?.message ||
          "Failed to toggle package visibility. Please try again.",
      );
    },
  });

  // =========================================================================
  // REORDER HANDLERS (Move buttons & Drag-and-Drop)
  // =========================================================================

  const handleMove = (
    section: "popular" | "featured",
    index: number,
    direction: "up" | "down",
  ) => {
    if (reorderMutation.isPending) return;

    const list =
      section === "popular"
        ? [...(showcaseData?.popular || [])]
        : [...(showcaseData?.featured || [])];

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    reorderMutation.mutate({
      section,
      itemIds: list.map((item) => item.id),
    });
  };

  const handleDragStart = (
    section: "popular" | "featured",
    index: number,
    e: React.DragEvent,
  ) => {
    setDraggedItem({ section, index });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${section}:${index}`);
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (
    targetSection: "popular" | "featured",
    targetIndex: number,
  ) => {
    if (!draggedItem || draggedItem.section !== targetSection) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const sourceIndex = draggedItem.index;
    setDraggedItem(null);
    setDragOverIndex(null);

    if (sourceIndex === targetIndex) return;

    const list =
      targetSection === "popular"
        ? [...(showcaseData?.popular || [])]
        : [...(showcaseData?.featured || [])];

    const [moved] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, moved);

    reorderMutation.mutate({
      section: targetSection,
      itemIds: list.map((item) => item.id),
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // Title modal helpers
  const handleStartEditTitle = (section: "popular" | "featured") => {
    setEditingSection(section);
    if (section === "popular") {
      setPendingTitle(showcaseData?.config.popularTitle || "Popular packages");
      setPendingEyebrow(
        showcaseData?.config.popularEyebrow || "PLAN YOUR NEXT TRIP",
      );
    } else {
      setPendingTitle(
        showcaseData?.config.featuredTitle || "Featured packages",
      );
      setPendingEyebrow(
        showcaseData?.config.featuredEyebrow || "FLYORA CURATED JOURNEYS",
      );
    }
  };

  const handleSaveTitleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingTitle.trim()) return;
    setShowTitleWarning(true);
  };

  const handleConfirmSaveTitle = () => {
    if (!editingSection) return;
    if (editingSection === "popular") {
      updateConfigMutation.mutate({
        popularTitle: pendingTitle.trim(),
        popularEyebrow: pendingEyebrow.trim(),
      });
    } else {
      updateConfigMutation.mutate({
        featuredTitle: pendingTitle.trim(),
        featuredEyebrow: pendingEyebrow.trim(),
      });
    }
  };

  // Available packages for Add modal (MUTUALLY EXCLUSIVE: cannot be in Popular OR Featured)
  const availablePackagesForSection = (_section: "popular" | "featured") => {
    const popularIds = new Set((showcaseData?.popular || []).map((p) => p.id));
    const featuredIds = new Set(
      (showcaseData?.featured || []).map((p) => p.id),
    );
    // Exclude packages already assigned to ANY showcase section
    const assignedIds = new Set([...popularIds, ...featuredIds]);

    let items = (allPackagesData?.items || []).filter(
      (p) => !assignedIds.has(p.id),
    );
    if (addSearchTerm.trim()) {
      const q = addSearchTerm.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.destination.toLowerCase().includes(q),
      );
    }
    return items;
  };

  // Find packages in the OTHER section matching the search term (for helpful guidance)
  const getOtherSectionMatches = (section: "popular" | "featured") => {
    if (!addSearchTerm.trim()) return [];
    const otherList =
      section === "popular"
        ? showcaseData?.featured || []
        : showcaseData?.popular || [];
    const q = addSearchTerm.toLowerCase();
    return otherList.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.destination.toLowerCase().includes(q),
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
              Tour packages
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono">
              Live Showcase
            </span>
            {isRefetchingShowcase && (
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                <Loader2 className="w-3 h-3 animate-spin" />
                Syncing...
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Curate and arrange packages for the public website homepage and
            services carousels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/packages/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Tour Package</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <Link
          to="/packages"
          className="pb-3 px-1 text-xs font-medium border-b-2 border-transparent text-zinc-500 hover:text-zinc-900 transition flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Packages</span>
        </Link>
        <Link
          to="/packages/showcase"
          className="pb-3 px-1 text-xs font-semibold border-b-2 border-black text-black transition flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-900" />
          <span>Website Showcase (Popular & Featured)</span>
        </Link>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 rounded-md bg-zinc-900 text-white flex items-center gap-2.5 text-xs shadow-md animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorToast && (
        <div className="p-3 rounded-md bg-red-900 text-white flex items-center gap-2.5 text-xs shadow-md animate-in fade-in slide-in-from-top-1">
          <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoadingShowcase && (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-xs font-mono">
            Loading showcase sections...
          </span>
        </div>
      )}

      {!isLoadingShowcase && showcaseData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ========================================================================= */}
          {/* SECTION 1: POPULAR PACKAGES */}
          {/* ========================================================================= */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden flex flex-col">
            {/* Section Header */}
            <div className="p-4 bg-[#FAFAF9] border-b border-zinc-200 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-zinc-900">
                    {showcaseData.config.popularTitle}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                    Primary Section
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mt-1">
                  Eyebrow: &quot;{showcaseData.config.popularEyebrow}&quot;
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStartEditTitle("popular")}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 text-[11px] font-medium text-zinc-700 transition"
                  title="Rename section"
                >
                  <Edit3 className="w-3 h-3 text-zinc-500" />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddSearchTerm("");
                    setAddingToSection("popular");
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-black hover:bg-zinc-800 text-[11px] font-medium text-white transition shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Package</span>
                </button>
              </div>
            </div>

            {/* Section Info Banner */}
            <div className="px-4 py-2 bg-amber-50/50 border-b border-amber-100 text-[11px] text-amber-800 flex items-center justify-between">
              <span>Primary carousel on Website Homepage & Services page</span>
              <span className="font-mono font-semibold">
                {showcaseData.popular.length} packages
              </span>
            </div>

            {/* Packages List with Drag-and-Drop & Move Up/Down */}
            <div className="p-4 flex-1 space-y-2.5">
              {showcaseData.popular.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-lg">
                  <p className="text-xs font-medium text-zinc-600">
                    No popular packages selected
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Click &quot;Add Package&quot; to assign packages to this
                    section.
                  </p>
                </div>
              ) : (
                showcaseData.popular.map((pkg, idx) => {
                  const isDraggingThis =
                    draggedItem?.section === "popular" &&
                    draggedItem?.index === idx;
                  const isOverThis =
                    draggedItem?.section === "popular" && dragOverIndex === idx;

                  return (
                    <div
                      key={pkg.id}
                      draggable={!reorderMutation.isPending}
                      onDragStart={(e) => handleDragStart("popular", idx, e)}
                      onDragOver={(e) => handleDragOver(idx, e)}
                      onDrop={() => handleDrop("popular", idx)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition shadow-xs select-none ${
                        isDraggingThis
                          ? "opacity-40 border-dashed border-amber-400 bg-amber-50/30"
                          : isOverThis
                            ? "border-amber-500 bg-amber-50/40"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                    >
                      {/* Left: Drag Handle, Position & Thumbnail */}
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Drag Handle */}
                        <div
                          className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 p-0.5 -ml-1 touch-none"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Position Badge */}
                        <span className="w-6 h-6 rounded-md bg-zinc-100 text-zinc-600 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>

                        {/* Thumbnail */}
                        <div className="w-12 h-10 rounded-md overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                          <PackageImage
                            src={pkg.coverImageUrl}
                            alt={pkg.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Package Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-zinc-900 truncate">
                              {pkg.title}
                            </span>
                            {!pkg.isPublished && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-100 text-zinc-500 border border-zinc-200">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate">
                            {pkg.destination} • {pkg.durationDays}D/
                            {pkg.durationNights}N • ₹
                            {pkg.startingPrice.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Hide/Publish Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            if (pkg.isPublished) {
                              setPackageToHide(pkg);
                            } else {
                              togglePublishMutation.mutate({
                                id: pkg.id,
                                isPublished: true,
                              });
                            }
                          }}
                          className={`p-1.5 rounded-md transition ${
                            pkg.isPublished
                              ? "text-emerald-700 hover:bg-emerald-50"
                              : "text-zinc-400 hover:bg-zinc-100"
                          }`}
                          title={
                            pkg.isPublished
                              ? "Visible on website (Click to hide)"
                              : "Hidden (Click to publish)"
                          }
                        >
                          {pkg.isPublished ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={idx === 0 || reorderMutation.isPending}
                          onClick={() => handleMove("popular", idx, "up")}
                          className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none text-zinc-600 transition"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={
                            idx === showcaseData.popular.length - 1 ||
                            reorderMutation.isPending
                          }
                          onClick={() => handleMove("popular", idx, "down")}
                          className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none text-zinc-600 transition"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>

                        {/* Remove from Popular (opens confirmation modal) */}
                        <button
                          type="button"
                          onClick={() =>
                            setPackageToRemove({ pkg, section: "popular" })
                          }
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition ml-1"
                          title="Remove from Popular section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: FEATURED PACKAGES */}
          {/* ========================================================================= */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden flex flex-col">
            {/* Section Header */}
            <div className="p-4 bg-[#FAFAF9] border-b border-zinc-200 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-zinc-900">
                    {showcaseData.config.featuredTitle}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                    Curated Section
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mt-1">
                  Eyebrow: &quot;{showcaseData.config.featuredEyebrow}&quot;
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStartEditTitle("featured")}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 text-[11px] font-medium text-zinc-700 transition"
                  title="Rename section"
                >
                  <Edit3 className="w-3 h-3 text-zinc-500" />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddSearchTerm("");
                    setAddingToSection("featured");
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-black hover:bg-zinc-800 text-[11px] font-medium text-white transition shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Package</span>
                </button>
              </div>
            </div>

            {/* Section Info Banner */}
            <div className="px-4 py-2 bg-purple-50/50 border-b border-purple-100 text-[11px] text-purple-800 flex items-center justify-between">
              <span>
                Curated editorial highlights shown below Popular Packages
              </span>
              <span className="font-mono font-semibold">
                {showcaseData.featured.length} packages
              </span>
            </div>

            {/* Packages List with Drag-and-Drop & Move Up/Down */}
            <div className="p-4 flex-1 space-y-2.5">
              {showcaseData.featured.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-lg">
                  <p className="text-xs font-medium text-zinc-600">
                    No featured packages selected
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Click &quot;Add Package&quot; to assign editorial highlight
                    packages.
                  </p>
                </div>
              ) : (
                showcaseData.featured.map((pkg, idx) => {
                  const isDraggingThis =
                    draggedItem?.section === "featured" &&
                    draggedItem?.index === idx;
                  const isOverThis =
                    draggedItem?.section === "featured" &&
                    dragOverIndex === idx;

                  return (
                    <div
                      key={pkg.id}
                      draggable={!reorderMutation.isPending}
                      onDragStart={(e) => handleDragStart("featured", idx, e)}
                      onDragOver={(e) => handleDragOver(idx, e)}
                      onDrop={() => handleDrop("featured", idx)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition shadow-xs select-none ${
                        isDraggingThis
                          ? "opacity-40 border-dashed border-purple-400 bg-purple-50/30"
                          : isOverThis
                            ? "border-purple-500 bg-purple-50/40"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                    >
                      {/* Left: Drag Handle, Position & Thumbnail */}
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Drag Handle */}
                        <div
                          className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 p-0.5 -ml-1 touch-none"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Position Badge */}
                        <span className="w-6 h-6 rounded-md bg-zinc-100 text-zinc-600 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>

                        {/* Thumbnail */}
                        <div className="w-12 h-10 rounded-md overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                          <PackageImage
                            src={pkg.coverImageUrl}
                            alt={pkg.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Package Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-zinc-900 truncate">
                              {pkg.title}
                            </span>
                            {!pkg.isPublished && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-100 text-zinc-500 border border-zinc-200">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate">
                            {pkg.destination} • {pkg.durationDays}D/
                            {pkg.durationNights}N • ₹
                            {pkg.startingPrice.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Hide/Publish Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            if (pkg.isPublished) {
                              setPackageToHide(pkg);
                            } else {
                              togglePublishMutation.mutate({
                                id: pkg.id,
                                isPublished: true,
                              });
                            }
                          }}
                          className={`p-1.5 rounded-md transition ${
                            pkg.isPublished
                              ? "text-emerald-700 hover:bg-emerald-50"
                              : "text-zinc-400 hover:bg-zinc-100"
                          }`}
                          title={
                            pkg.isPublished
                              ? "Visible on website (Click to hide)"
                              : "Hidden (Click to publish)"
                          }
                        >
                          {pkg.isPublished ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={idx === 0 || reorderMutation.isPending}
                          onClick={() => handleMove("featured", idx, "up")}
                          className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none text-zinc-600 transition"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={
                            idx === showcaseData.featured.length - 1 ||
                            reorderMutation.isPending
                          }
                          onClick={() => handleMove("featured", idx, "down")}
                          className="p-1.5 rounded-md border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none text-zinc-600 transition"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>

                        {/* Remove from Featured (opens confirmation modal) */}
                        <button
                          type="button"
                          onClick={() =>
                            setPackageToRemove({ pkg, section: "featured" })
                          }
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition ml-1"
                          title="Remove from Featured section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT SECTION TITLE */}
      {/* ========================================================================= */}
      {editingSection && (
        <Modal
          onClose={() => {
            setEditingSection(null);
            setShowTitleWarning(false);
          }}
          title={`Edit ${editingSection === "popular" ? "Popular Packages" : "Featured Packages"} Title`}
        >
          {!showTitleWarning ? (
            <form onSubmit={handleSaveTitleClick} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Section Heading (Publicly displayed on website)
                </label>
                <input
                  type="text"
                  required
                  value={pendingTitle}
                  onChange={(e) => setPendingTitle(e.target.value)}
                  placeholder="e.g. Popular packages, Trending Now, Top Picks"
                  className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 focus:border-black outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Eyebrow Subtitle (Small uppercase badge above heading)
                </label>
                <input
                  type="text"
                  value={pendingEyebrow}
                  onChange={(e) => setPendingEyebrow(e.target.value)}
                  placeholder="e.g. PLAN YOUR NEXT TRIP, FLYORA CURATED JOURNEYS"
                  className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 focus:border-black outline-none transition font-mono"
                />
              </div>

              {/* Preview */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Website Live Preview
                </span>
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                  {pendingEyebrow.trim() || "(NO EYEBROW)"}
                </span>
                <h3 className="text-base font-bold text-zinc-900">
                  {pendingTitle.trim() || "(Section Heading)"}
                </h3>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:text-black rounded-md border border-zinc-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-zinc-800 rounded-md shadow-xs transition"
                >
                  Next: Review & Apply
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Warning Alert */}
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-amber-950">
                    Live Public Website Impact Warning
                  </p>
                  <p className="text-amber-800">
                    Changing this section name will{" "}
                    <strong>immediately update</strong> the headline on the
                    public homepage and services carousel:
                  </p>
                  <div className="mt-2 p-2 rounded bg-white/80 border border-amber-200 font-mono text-[11px]">
                    New Title: <strong>&quot;{pendingTitle}&quot;</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowTitleWarning(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:text-black rounded-md border border-zinc-200 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={updateConfigMutation.isPending}
                  onClick={handleConfirmSaveTitle}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-xs transition flex items-center gap-1.5"
                >
                  {updateConfigMutation.isPending && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Confirm & Apply to Live Website</span>
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD PACKAGE TO SECTION */}
      {/* ========================================================================= */}
      {addingToSection && (
        <Modal
          onClose={() => setAddingToSection(null)}
          title={`Add Package to ${addingToSection === "popular" ? "Popular" : "Featured"} Section`}
        >
          <div className="space-y-3">
            {/* Mutual Exclusivity Guidance Note */}
            <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-600 text-[11px] flex items-center justify-between">
              <span>
                Each package can belong to <strong>only one</strong> showcase
                section at a time.
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                {addingToSection === "popular"
                  ? `${showcaseData?.featured.length || 0} in Featured`
                  : `${showcaseData?.popular.length || 0} in Popular`}
              </span>
            </div>

            {/* Filter search bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={addSearchTerm}
                onChange={(e) => setAddSearchTerm(e.target.value)}
                placeholder="Search packages by title or destination..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-md border border-zinc-200 focus:border-black outline-none transition"
              />
            </div>

            {/* Hint when searched package is in the other section */}
            {getOtherSectionMatches(addingToSection).length > 0 && (
              <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <p className="font-semibold text-[11px] flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Already in{" "}
                    {addingToSection === "popular"
                      ? "Featured Packages"
                      : "Popular Packages"}
                    :
                  </span>
                </p>
                {getOtherSectionMatches(addingToSection).map((p) => (
                  <p key={p.id} className="text-[11px] text-amber-800 pl-5">
                    • <strong>&quot;{p.title}&quot;</strong> is currently in the{" "}
                    {addingToSection === "popular" ? "Featured" : "Popular"}{" "}
                    section. Remove it from there first to feature it here.
                  </p>
                ))}
              </div>
            )}

            <div className="max-h-[340px] overflow-y-auto divide-y divide-zinc-100 border border-zinc-200 rounded-md">
              {availablePackagesForSection(addingToSection).length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 font-mono space-y-1">
                  <p className="font-medium text-zinc-600">
                    {addSearchTerm
                      ? "No matching unassigned packages found."
                      : "All packages are currently in use."}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    All packages are already assigned to either Popular or
                    Featured showcase.
                  </p>
                </div>
              ) : (
                availablePackagesForSection(addingToSection).map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-2.5 flex items-center justify-between gap-3 hover:bg-zinc-50 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-8 rounded overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                        <PackageImage
                          src={pkg.coverImageUrl}
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-900 truncate">
                          {pkg.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {pkg.destination} • ₹
                          {pkg.startingPrice.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={addToShowcaseMutation.isPending}
                      onClick={() =>
                        addToShowcaseMutation.mutate({
                          packageId: pkg.id,
                          section: addingToSection,
                        })
                      }
                      className="px-2.5 py-1 text-xs font-medium text-white bg-black hover:bg-zinc-800 disabled:opacity-50 rounded-md shadow-xs transition shrink-0 flex items-center gap-1"
                    >
                      {addToShowcaseMutation.isPending && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                      <span>Add to Section</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAddingToSection(null)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-black rounded-md border border-zinc-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRM REMOVAL FROM POPULAR / FEATURED (Strict backend confirm) */}
      {/* ========================================================================= */}
      {packageToRemove && (
        <Modal
          onClose={() => {
            if (!removeShowcaseMutation.isPending) {
              setPackageToRemove(null);
            }
          }}
          title={`Remove from ${packageToRemove.section === "popular" ? "Popular Packages" : "Featured Packages"}`}
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1.5">
                <p className="font-semibold text-red-950">
                  Confirm Removal from Showcase Section
                </p>
                <p className="text-red-800">
                  Are you sure you want to remove{" "}
                  <strong>&quot;{packageToRemove.pkg.title}&quot;</strong> from
                  the{" "}
                  {packageToRemove.section === "popular"
                    ? "Popular packages"
                    : "Featured packages"}{" "}
                  carousel?
                </p>
                <div className="mt-2 p-2 bg-white/80 rounded border border-red-200 text-zinc-600 text-[11px]">
                  <strong>Note:</strong> The package will not be deleted from
                  your database or package catalogue. It will only be removed
                  from this public carousel.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                disabled={removeShowcaseMutation.isPending}
                onClick={() => setPackageToRemove(null)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-black rounded-md border border-zinc-200 transition"
              >
                Keep in Section
              </button>
              <button
                type="button"
                disabled={removeShowcaseMutation.isPending}
                onClick={() =>
                  removeShowcaseMutation.mutate({
                    packageId: packageToRemove.pkg.id,
                    section: packageToRemove.section,
                  })
                }
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-md shadow-xs transition flex items-center gap-1.5"
              >
                {removeShowcaseMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>Remove from Section</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: HIDE PACKAGE WARNING */}
      {/* ========================================================================= */}
      {packageToHide && (
        <Modal
          onClose={() => {
            if (!togglePublishMutation.isPending) {
              setPackageToHide(null);
            }
          }}
          title="Confirm Hiding Package"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1.5">
                <p className="font-semibold text-amber-950">
                  Public Website Visibility Warning
                </p>
                <p className="text-amber-800">
                  Hiding <strong>&quot;{packageToHide.title}&quot;</strong> will
                  immediately remove it from:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                  <li>Homepage and Services carousel cards</li>
                  <li>Public tour package catalogue and searches</li>
                  <li>Traveler enquiry forms for this itinerary</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                disabled={togglePublishMutation.isPending}
                onClick={() => setPackageToHide(null)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-black rounded-md border border-zinc-200 transition"
              >
                Keep Visible
              </button>
              <button
                type="button"
                disabled={togglePublishMutation.isPending}
                onClick={() =>
                  togglePublishMutation.mutate({
                    id: packageToHide.id,
                    isPublished: false,
                  })
                }
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-md shadow-xs transition flex items-center gap-1.5"
              >
                {togglePublishMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>Hide From Website</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
