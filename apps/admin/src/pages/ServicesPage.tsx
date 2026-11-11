import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ManagedService } from "@flyora/types";
import {
  createServiceSchema,
  type CreateServiceInput,
} from "@flyora/validators";
import {
  Plus,
  Search,
  Pencil,
  Loader2,
  ArrowUpDown,
  ImageIcon,
  Globe,
} from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { ApiError } from "../lib/apiClient";
import { ServiceOrderModal } from "../components/services/ServiceOrderModal";
import { Modal, FormError } from "../components/ui/Modal";
import { R2ImageDropzone } from "../components/packages/R2ImageDropzone";

export function ServicesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ManagedService | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const [reordering, setReordering] = useState<ManagedService[] | null>(null);
  const {
    data: services = [],
    isPending,
    isError,
    refetch,
  } = useQuery<ManagedService[]>({
    queryKey: ["managed-services"],
    queryFn: () => apiClient.get("/services/manage"),
  });
  const filtered = services.filter((s) =>
    `${s.name} ${s.description || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const saved = async () => {
    setEditing(null);
    setNotice("Service saved.");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["managed-services"] }),
      queryClient.invalidateQueries({ queryKey: ["services"] }),
    ]);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Services</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the services customers can enquire about and assign to your
            team.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNotice("");
              setReordering(services);
            }}
            disabled={isPending || isError || services.length < 2}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            <ArrowUpDown size={16} />
            Reorder
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
            onClick={() => {
              setNotice("");
              setEditing("new");
            }}
          >
            <Plus size={16} />
            Add service
          </button>
        </div>
      </div>
      {notice && (
        <p role="status" className="text-sm text-emerald-700">
          {notice}
        </p>
      )}
      <label className="relative block max-w-md">
        <span className="sr-only">Search services</span>
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm"
        />
      </label>
      {isPending ? (
        <p role="status">Loading services…</p>
      ) : isError ? (
        <div role="alert" className="rounded-xl border bg-white p-5">
          We couldn’t load services.{" "}
          <button className="underline" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                {[
                  "Service",
                  "Travel Sector",
                  "Team members",
                  "Packages",
                  "Status",
                  "",
                ].map((heading, i) => (
                  <th key={i} className="px-5 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((service) => {
                const isDom = service.isDomestic ?? true;
                const isIntl = service.isInternational ?? true;
                return (
                  <tr key={service.id}>
                    <td className="px-5 py-4 min-w-72">
                      <div className="flex items-center gap-3">
                        {service.imageUrl ? (
                          <img
                            src={service.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {service.name}
                          </p>
                          <p className="mt-0.5 max-w-md text-xs text-slate-500 line-clamp-1">
                            {service.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {isDom && isIntl ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 border border-indigo-100">
                          <Globe size={12} />
                          Domestic & Intl
                        </span>
                      ) : isIntl ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 border border-sky-100">
                          International only
                        </span>
                      ) : isDom ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                          Domestic only
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">{service._count.coordinators}</td>
                    <td className="px-5 py-4">{service._count.packages}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${service.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {service.isActive ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setNotice("");
                          setEditing(service);
                        }}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-xs"
                        aria-label={`Edit ${service.name}`}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="p-8 text-center text-sm text-slate-500">
              {search
                ? "No services match your search."
                : "Add your first service."}
            </p>
          )}
        </div>
      )}
      {reordering && (
        <ServiceOrderModal
          services={reordering}
          onClose={() => setReordering(null)}
          onSaved={async () => {
            setReordering(null);
            setNotice("Service order saved.");
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ["managed-services"] }),
              queryClient.invalidateQueries({ queryKey: ["services"] }),
            ]);
          }}
        />
      )}
      {editing && (
        <ServiceEditor
          key={editing === "new" ? "new" : editing.id}
          service={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}
    </div>
  );
}
function ServiceEditor({
  service,
  onClose,
  onSaved,
}: {
  service?: ManagedService;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [imageUrl, setImageUrl] = useState(service?.imageUrl || "");
  const [isDomestic, setIsDomestic] = useState(service?.isDomestic ?? true);
  const [isInternational, setIsInternational] = useState(
    service?.isInternational ?? true,
  );
  const [active, setActive] = useState(service?.isActive ?? true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const guard = useRef(false);

  const mutation = useMutation({
    mutationFn: (payload: CreateServiceInput) =>
      service
        ? apiClient.patch(`/services/${service.id}`, payload)
        : apiClient.post("/services", payload),
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (guard.current || isUploading) return;

    if (!isDomestic && !isInternational) {
      setError(
        "Please select at least one travel sector (Domestic or International).",
      );
      return;
    }

    const parsed = createServiceSchema.safeParse({
      name,
      description,
      imageUrl: imageUrl.trim() || null,
      isDomestic,
      isInternational,
      isActive: active,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check the service details.");
      return;
    }

    guard.current = true;
    setError("");
    try {
      await mutation.mutateAsync(parsed.data);
      await onSaved();
    } catch (err) {
      setError(
        err instanceof ApiError && err.statusCode === 409
          ? err.error === "SERVICE_ORDER_CHANGED"
            ? "The service list has changed. Please try again."
            : "A service with this name already exists. Choose another name."
          : "We couldn’t save the service. Please try again.",
      );
    } finally {
      guard.current = false;
    }
  };

  return (
    <Modal
      title={service ? "Edit service" : "Add service"}
      busy={mutation.isPending || isUploading}
      onClose={onClose}
      footer={
        <>
          <button
            className="rounded-lg border px-4 py-2.5 text-sm"
            disabled={mutation.isPending || isUploading}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="service-editor"
            disabled={mutation.isPending || isUploading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white disabled:opacity-50"
          >
            {(mutation.isPending || isUploading) && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {mutation.isPending
              ? "Saving…"
              : isUploading
                ? "Uploading image…"
                : "Save service"}
          </button>
        </>
      }
    >
      <form id="service-editor" onSubmit={submit} className="space-y-5">
        {error && <FormError>{error}</FormError>}

        <label className="block text-sm font-medium text-slate-900">
          Service name
          <input
            required
            maxLength={80}
            value={name}
            disabled={mutation.isPending || isUploading}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            placeholder="e.g. Travel insurance"
          />
        </label>

        <label className="block text-sm font-medium text-slate-900">
          Short description
          <textarea
            maxLength={500}
            rows={2}
            value={description}
            disabled={mutation.isPending || isUploading}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 block w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 font-normal text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            placeholder="What can customers book or get help with?"
          />
        </label>

        {/* Real Cloudflare R2 Cover Image Upload */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4">
          <R2ImageDropzone
            folder="services"
            label="Service card cover image (Cloudflare R2)"
            helperText="Directly uploaded to R2 bucket. Displayed on homepage hero cards · Up to 10 MB"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            disabled={mutation.isPending}
            onUploadingChange={setIsUploading}
          />
        </div>

        {/* Sector Scope: Domestic vs International */}
        <div className="space-y-2.5 rounded-xl border border-slate-200/90 bg-slate-50/60 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <Globe size={14} className="text-slate-500" />
            <span>Travel Sector Availability</span>
          </div>
          <p className="text-xs text-slate-500">
            Choose which website tabs display this service card:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                isDomestic
                  ? "bg-white border-blue-500/80 shadow-xs ring-1 ring-blue-500/20"
                  : "bg-white/50 border-slate-200 hover:bg-white text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={isDomestic}
                disabled={mutation.isPending || isUploading}
                onChange={(e) => setIsDomestic(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="block font-semibold text-slate-900">
                  Domestic Travel
                </span>
                <span className="block text-slate-500 mt-0.5">
                  Visible when customers choose Domestic
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                isInternational
                  ? "bg-white border-blue-500/80 shadow-xs ring-1 ring-blue-500/20"
                  : "bg-white/50 border-slate-200 hover:bg-white text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={isInternational}
                disabled={mutation.isPending || isUploading}
                onChange={(e) => setIsInternational(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="block font-semibold text-slate-900">
                  International Travel
                </span>
                <span className="block text-slate-500 mt-0.5">
                  Visible when customers choose International
                </span>
              </div>
            </label>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-900">
          <input
            type="checkbox"
            checked={active}
            disabled={mutation.isPending || isUploading}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          Active on the website
        </label>
        {!active && (
          <p className="text-xs leading-relaxed text-slate-500">
            Pausing hides this service and its packages from the website.
            Existing enquiries and team assignments are kept.
          </p>
        )}
      </form>
    </Modal>
  );
}
