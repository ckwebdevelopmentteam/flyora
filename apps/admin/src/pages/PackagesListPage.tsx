import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { packagesApi, type PackageFilterParams } from "../lib/packagesApi";
import { apiClient } from "../lib/apiClient";
import type { PackageSummary, ServiceSummary } from "@flyora/types";
import { useAuthStore } from "../stores/authStore";
import {
  Plus,
  Search,
  MapPin,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  Palmtree,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

const columnHelper = createColumnHelper<PackageSummary>();

export const PackagesListPage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // Filter & pagination states
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal states
  const [packageToDelete, setPackageToDelete] = useState<PackageSummary | null>(
    null,
  );
  const [previewPackageSlug, setPreviewPackageSlug] = useState<string | null>(
    null,
  );
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch Services for filter dropdown
  const { data: services = [] } = useQuery<ServiceSummary[]>({
    queryKey: ["services"],
    queryFn: () => apiClient.get("/services"),
  });

  // Query packages list
  const filterParams: PackageFilterParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      serviceId: selectedService || undefined,
      destination: destinationFilter.trim() || undefined,
      page,
      limit,
      includeUnpublished: true,
    }),
    [search, selectedService, destinationFilter, page, limit],
  );

  const {
    data: packagesData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["packages", filterParams],
    queryFn: () => packagesApi.listPackages(filterParams),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => packagesApi.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setPackageToDelete(null);
      setSuccessToast("Package deleted successfully");
      setTimeout(() => setSuccessToast(null), 3000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to delete package");
    },
  });

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setSelectedService("");
    setDestinationFilter("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search || selectedService || destinationFilter,
  );

  // Table Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Package",
        cell: (info) => {
          const pkg = info.row.original;
          return (
            <div className="flex items-center gap-3 min-w-[240px]">
              <div className="w-12 h-10 rounded-md overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                <img
                  src={pkg.coverImageUrl}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=120&q=80";
                  }}
                />
              </div>
              <div className="space-y-0.5 truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-xs text-zinc-900 truncate">
                    {pkg.title}
                  </span>
                  {pkg.isFeatured && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                      <Sparkles className="w-2.5 h-2.5 fill-amber-500" />
                      Featured
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  /packages/{pkg.slug}
                </div>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor("destination", {
        header: "Destination",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-xs text-zinc-700 whitespace-nowrap">
            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
            <span>{info.getValue()}</span>
          </div>
        ),
      }),

      columnHelper.accessor("durationDays", {
        header: "Duration",
        cell: (info) => {
          const pkg = info.row.original;
          return (
            <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAFAF9] border border-zinc-200 text-zinc-700 w-fit whitespace-nowrap">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>
                {pkg.durationDays}D / {pkg.durationNights}N
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor("serviceName", {
        header: "Category",
        cell: (info) => (
          <span className="text-[11px] px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 font-mono whitespace-nowrap shadow-xs">
            {info.getValue() || "Tour Package"}
          </span>
        ),
      }),

      columnHelper.accessor("startingPrice", {
        header: "Starting Fare",
        cell: (info) => (
          <div className="text-xs font-semibold font-mono text-zinc-900 whitespace-nowrap">
            ₹{Number(info.getValue()).toLocaleString("en-IN")}
          </div>
        ),
      }),

      columnHelper.accessor("isPublished", {
        header: "Status",
        cell: (info) => {
          const isPublished = info.getValue();
          return isPublished ? (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 font-mono">
              <XCircle className="w-2.5 h-2.5" />
              Draft
            </span>
          );
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => {
          const pkg = info.row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {/* Preview Button */}
              <button
                type="button"
                onClick={() => setPreviewPackageSlug(pkg.slug)}
                className="p-1.5 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
                title="Quick preview"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              {/* Edit Button */}
              <Link
                to={`/packages/edit/${pkg.slug}`}
                className="p-1.5 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
                title="Edit package"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Link>

              {/* Delete Button (Super Admin only) */}
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setPackageToDelete(pkg)}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete package"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        },
      }),
    ],
    [isSuperAdmin],
  );

  const tableData = packagesData?.items || [];

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
              Tour Packages Catalog
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono">
              {packagesData?.total || 0} total
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Curated destination packages, Cloudflare R2 photos, and day-by-day
            itineraries.
          </p>
        </div>

        <Link
          to="/packages/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Tour Package</span>
        </Link>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 rounded-md bg-zinc-900 text-white flex items-center gap-2.5 text-xs shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title or destination..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
            />
          </div>

          {/* Service Dropdown */}
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setPage(1);
            }}
            className="text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition"
          >
            <option value="">All Services</option>
            {services.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.name}
              </option>
            ))}
          </select>

          {/* Destination Filter */}
          <input
            type="text"
            placeholder="Filter destination..."
            value={destinationFilter}
            onChange={(e) => {
              setDestinationFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 bg-[#FAFAF9] text-zinc-900 focus:bg-white focus:border-black outline-none transition max-w-[160px]"
          />

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {isFetching && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-zinc-200 bg-[#FAFAF9] text-zinc-500 font-mono text-[11px] uppercase tracking-wider"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-2.5 px-4 font-normal">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-black mx-auto mb-2" />
                    <p className="text-xs font-mono text-zinc-500">
                      Loading tour packages catalog...
                    </p>
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    <Palmtree className="w-8 h-8 text-zinc-300 mx-auto mb-2 stroke-[1.2]" />
                    <p className="text-xs font-medium text-zinc-800">
                      No packages found
                    </p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5 mb-3">
                      {hasActiveFilters
                        ? "Try clearing filters to see existing packages"
                        : "Start creating your first tour package itinerary"}
                    </p>
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-3 py-1.5 rounded-md border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <Link
                        to="/packages/new"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Package</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-zinc-50/70 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {packagesData && packagesData.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-200 bg-[#FAFAF9] text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">
              Page {packagesData.page} of {packagesData.totalPages} (
              {packagesData.total} packages)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 text-xs font-mono hover:bg-zinc-100 transition"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= packagesData.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 text-xs font-mono hover:bg-zinc-100 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-lg bg-white border border-zinc-200 shadow-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-zinc-900">
                  Delete Tour Package?
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Are you sure you want to delete{" "}
                  <strong className="text-zinc-800">
                    "{packageToDelete.title}"
                  </strong>
                  ? This will permanently remove its itineraries and media
                  associations.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setPackageToDelete(null)}
                className="px-3 py-1.5 rounded-md border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(packageToDelete.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition shadow-xs"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewPackageSlug && (
        <PackagePreviewModal
          slug={previewPackageSlug}
          onClose={() => setPreviewPackageSlug(null)}
        />
      )}
    </div>
  );
};

interface PackagePreviewModalProps {
  slug: string;
  onClose: () => void;
}

const PackagePreviewModal = ({ slug, onClose }: PackagePreviewModalProps) => {
  const { data: pkg, isLoading } = useQuery({
    queryKey: ["package", slug],
    queryFn: () => packagesApi.getPackageBySlug(slug),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-lg bg-white border border-zinc-200 shadow-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="h-12 px-5 flex items-center justify-between border-b border-zinc-200 bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-900 font-mono uppercase tracking-wider">
              Package Preview
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              /packages/{slug}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-black hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-black mx-auto mb-2" />
              <p className="text-xs font-mono text-zinc-500">
                Loading package...
              </p>
            </div>
          ) : !pkg ? (
            <p className="text-xs text-red-500">
              Failed to load package details.
            </p>
          ) : (
            <>
              {/* Hero Banner */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                <img
                  src={pkg.coverImageUrl}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center gap-2 text-xs font-mono mb-1">
                    <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                      {pkg.destination}
                    </span>
                    <span>•</span>
                    <span>
                      {pkg.durationDays}D / {pkg.durationNights}N
                    </span>
                  </div>
                  <h2 className="text-base font-semibold leading-tight">
                    {pkg.title}
                  </h2>
                  <p className="text-xs font-mono text-zinc-200 mt-1">
                    Starting from ₹
                    {Number(pkg.startingPrice).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Overview */}
              <div>
                <h4 className="text-xs font-mono uppercase text-zinc-500 mb-1">
                  Overview
                </h4>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {pkg.overview}
                </p>
              </div>

              {/* Itinerary */}
              {pkg.itinerary && pkg.itinerary.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-zinc-500">
                    Itinerary ({pkg.itinerary.length} Days)
                  </h4>
                  <div className="space-y-2">
                    {pkg.itinerary.map((day) => (
                      <div
                        key={day.day}
                        className="p-3 rounded-md border border-zinc-200 bg-[#FAFAF9] text-xs space-y-1"
                      >
                        <div className="font-semibold text-zinc-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-black text-white text-[10px] font-mono flex items-center justify-center">
                            D{day.day}
                          </span>
                          <span>{day.title}</span>
                        </div>
                        <p className="text-zinc-600 pl-7 text-[11px] leading-relaxed">
                          {day.description}
                        </p>
                        {(day.meals || day.stay) && (
                          <div className="pl-7 pt-1 flex flex-wrap gap-2 text-[10px] text-zinc-500 font-mono">
                            {day.meals && <span>🍽 {day.meals}</span>}
                            {day.stay && <span>🏨 {day.stay}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-mono uppercase text-emerald-800 mb-1.5">
                    Inclusions
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-700">
                    {pkg.inclusions.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-500 mb-1.5">
                    Exclusions
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-700">
                    {pkg.exclusions.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-12 px-5 flex items-center justify-end border-t border-zinc-200 bg-[#FAFAF9]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
