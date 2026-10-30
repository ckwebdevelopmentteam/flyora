import { PackageImage } from "../components/packages/PackageImage";
import { PackagePreview } from "../components/packages/PackagePreview";
import { Modal, FormError } from "../components/ui/Modal";
import { userMessage } from "../lib/userMessage";
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
  RotateCcw,
} from "lucide-react";

const columnHelper = createColumnHelper<PackageSummary>();

export const PackagesListPage = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const canManagePackages =
    !!user &&
    ["SUPER_ADMIN", "OPERATIONS_MANAGER", "CONTENT_MANAGER"].includes(
      user.role,
    );
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    staleTime: 0,
    refetchOnWindowFocus: true,
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
    error: packagesError,
    refetch: retryPackages,
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
      setDeleteError(
        userMessage(err, "We couldn't delete this package. Please try again."),
      );
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
                <PackageImage
                  src={pkg.coverImageUrl}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
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
              {canManagePackages && (
                <Link
                  to={`/packages/edit/${pkg.slug}`}
                  className="p-1.5 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
                  title="Edit package"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* Delete Button (Super Admin only) */}
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setPackageToDelete(pkg);
                  }}
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
    [isSuperAdmin, canManagePackages],
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
              Tour packages
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono">
              {packagesData?.total || 0} total
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Manage your itineraries, photos and package prices.
          </p>
        </div>

        {canManagePackages && (
          <Link
            to="/packages/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Tour Package</span>
          </Link>
        )}
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

      {packagesError && (
        <div role="alert" className="form-error">
          We couldn't load the packages.{" "}
          <button className="underline" onClick={() => void retryPackages()}>
            Try again
          </button>
        </div>
      )}
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
              ) : packagesError ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-10 text-center text-slate-500"
                  >
                    Packages are unavailable. Try refreshing the list.
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
                    ) : canManagePackages ? (
                      <Link
                        to="/packages/new"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Package</span>
                      </Link>
                    ) : null}
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

      {packageToDelete && (
        <Modal
          title="Delete package?"
          description={packageToDelete.title}
          onClose={() => setPackageToDelete(null)}
          busy={deleteMutation.isPending}
          footer={
            <>
              <button
                className="button-secondary"
                onClick={() => setPackageToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="button-primary button-danger"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(packageToDelete.id)}
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete package"}
              </button>
            </>
          }
        >
          <FormError>{deleteError}</FormError>
          <p>
            This permanently deletes the package and its itinerary. You cannot
            undo this.
          </p>
        </Modal>
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
  const {
    data: pkg,
    isLoading,
    refetch: retryPreview,
  } = useQuery({
    queryKey: ["package", slug],
    queryFn: () => packagesApi.getPackageBySlug(slug),
  });

  return (
    <Modal
      title="Package preview"
      panelClassName="package-preview-modal"
      description={pkg?.title || ""}
      onClose={onClose}
      wide
      footer={
        <button className="button-primary ml-auto" onClick={onClose}>
          Close preview
        </button>
      }
    >
      <div className="space-y-5">
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-black mx-auto mb-2" />
            <p className="text-xs font-mono text-zinc-500">
              Loading package...
            </p>
          </div>
        ) : !pkg ? (
          <p className="text-xs text-red-500">
            We couldn't load the package details.{" "}
            <button className="underline" onClick={() => void retryPreview()}>
              Try again
            </button>
          </p>
        ) : (
          <PackagePreview key={pkg.id} pkg={pkg} />
        )}
      </div>
    </Modal>
  );
};
