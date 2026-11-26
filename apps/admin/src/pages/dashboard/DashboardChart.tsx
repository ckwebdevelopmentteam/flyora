import { useState } from "react";
import { adminFeatures } from "../../config/features";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { enquiryStages } from "../../lib/enquiryFilters";
import { leadsApi } from "../../lib/leadsApi";
import { bookingsApi } from "../bookings/bookingsApi";
import { Card } from "@/components/ui/card";
import {
  DonutChart,
  type DonutChartSegment,
} from "@/components/ui/donut-chart";
import { cn } from "@/lib/utils";

const STAGE_COLORS: Record<string, string> = {
  NEW: "#002f89",
  CONTACTED: "#2563eb",
  QUOTED: "#38bdf8",
  NEGOTIATING: "#f59e0b",
  BOOKED: "#10b981",
  LOST: "#94a3b8",
};

interface Bar {
  key: string;
  label: string;
  value?: number;
  to?: string;
  loading: boolean;
}
function BarChart({
  title,
  rows,
  error,
  unit,
}: {
  title: string;
  rows: Bar[];
  error: boolean;
  unit: string;
}) {
  const complete = rows.every((row) => row.value !== undefined);
  const total = complete
    ? rows.reduce((sum, row) => sum + row.value!, 0)
    : undefined;

  return (
    <section className="surface dashboard-chart" aria-label={title}>
      <header>
        <h2>{title}</h2>
        <span>
          {total === undefined ? "—" : total.toLocaleString("en-IN")}{" "}
          {total === 1 ? (unit === "enquiries" ? "enquiry" : "payment") : unit}
        </span>
      </header>

      {complete && !!total && (
        <div className="distribution-bar" aria-hidden="true">
          {rows
            .filter((row) => !!row.value)
            .map((row) => (
              <span
                key={row.key}
                className={`distribution-${row.key.toLowerCase()}`}
                style={{ width: `${(row.value! / total) * 100}%` }}
              />
            ))}
        </div>
      )}
      <ul className="distribution-legend">
        {rows.map((row) => {
          const text =
            row.value === undefined
              ? row.loading
                ? "Loading"
                : "Unavailable"
              : row.value.toLocaleString("en-IN");
          const percentage =
            complete && total
              ? `${Math.round((row.value! / total) * 1000) / 10}%`
              : complete
                ? "0%"
                : "—";
          const content = (
            <>
              <span
                className={`distribution-dot distribution-${row.key.toLowerCase()}`}
                aria-hidden="true"
              />
              <span>{row.label}</span>
              <strong>{row.value === undefined ? "—" : text}</strong>
              <span className="distribution-percent">{percentage}</span>
            </>
          );
          return (
            <li key={row.key}>
              {row.to ? (
                <Link
                  to={row.to}
                  aria-label={`${row.label}: ${text}`}
                  className="distribution-item"
                >
                  {content}
                </Link>
              ) : (
                <div
                  className="distribution-item"
                  aria-label={`${row.label}: ${text}`}
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {error && (
        <p role="alert" className="text-sm text-rose-700 mt-4">
          Some counts couldn't load. Use refresh to try again.
        </p>
      )}
      {complete && total === 0 && (
        <p className="text-sm text-slate-500 mt-4">No {unit} yet.</p>
      )}
    </section>
  );
}
function EnquiryDonutCard({
  title,
  rows,
  error,
}: {
  title: string;
  rows: Bar[];
  error: boolean;
}) {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const complete = rows.every((row) => row.value !== undefined);
  const total = complete
    ? rows.reduce((sum, row) => sum + (row.value ?? 0), 0)
    : undefined;

  const segments: DonutChartSegment[] = rows.map((row) => ({
    value: row.value ?? 0,
    color: STAGE_COLORS[row.key] || "#94a3b8",
    label: row.label,
    key: row.key,
  }));

  const activeSegment = segments.find((s) => s.label === hoveredLabel);
  const displayValue =
    activeSegment !== undefined
      ? activeSegment.value.toLocaleString("en-IN")
      : total === undefined
        ? "—"
        : total.toLocaleString("en-IN");
  const displayLabel = activeSegment?.label ?? "Total Enquiries";
  const displayPercentage =
    activeSegment && total ? (activeSegment.value / total) * 100 : null;

  return (
    <Card
      aria-label={title}
      className="h-full p-5 sm:p-6 flex flex-col justify-between gap-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <span className="text-xs font-medium text-slate-500">
          {total === undefined ? "—" : total.toLocaleString("en-IN")}{" "}
          {total === 1 ? "enquiry" : "enquiries"}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0 flex items-center justify-center">
          <DonutChart
            data={segments}
            totalValue={total ?? 0}
            size={196}
            strokeWidth={24}
            animationDuration={0.9}
            animationDelayPerSegment={0.05}
            highlightOnHover={true}
            onSegmentHover={(seg) => setHoveredLabel(seg?.label ?? null)}
            centerContent={
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayLabel}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <p className="text-xs font-medium text-slate-500 truncate max-w-[120px]">
                    {displayLabel}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 leading-tight">
                    {displayValue}
                  </p>
                  {displayPercentage !== null && (
                    <p className="text-xs font-semibold text-[#002f89]">
                      [{displayPercentage.toFixed(0)}%]
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            }
          />
        </div>

        <ul className="w-full grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {rows.map((row) => {
            const text =
              row.value === undefined
                ? row.loading
                  ? "Loading"
                  : "Unavailable"
                : row.value.toLocaleString("en-IN");
            const percentage =
              complete && total
                ? `${Math.round((row.value! / total) * 1000) / 10}%`
                : complete
                  ? "0%"
                  : "—";
            const color = STAGE_COLORS[row.key] || "#94a3b8";
            const isHovered = hoveredLabel === row.label;
            const itemContent = (
              <>
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {row.label}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <strong className="text-xs font-semibold text-slate-900">
                    {row.value === undefined ? "—" : text}
                  </strong>
                  <span className="text-[11px] text-slate-400">
                    {percentage}
                  </span>
                </span>
              </>
            );
            return (
              <li key={row.key}>
                {row.to ? (
                  <Link
                    to={row.to}
                    aria-label={`${row.label}: ${text}`}
                    onMouseEnter={() => setHoveredLabel(row.label)}
                    onMouseLeave={() => setHoveredLabel(null)}
                    className={cn(
                      "flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg transition-colors",
                      isHovered ? "bg-blue-50" : "hover:bg-slate-50",
                    )}
                  >
                    {itemContent}
                  </Link>
                ) : (
                  <div
                    aria-label={`${row.label}: ${text}`}
                    onMouseEnter={() => setHoveredLabel(row.label)}
                    onMouseLeave={() => setHoveredLabel(null)}
                    className={cn(
                      "flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg transition-colors",
                      isHovered ? "bg-blue-50" : "hover:bg-slate-50",
                    )}
                  >
                    {itemContent}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-700">
          Some counts couldn't load. Use refresh to try again.
        </p>
      )}
      {complete && total === 0 && (
        <p className="text-sm text-slate-500">No enquiries yet.</p>
      )}
    </Card>
  );
}

function EnquiryChart({ role, userId }: { role: string; userId: string }) {
  const manager = role === "SUPER_ADMIN" || role === "OPERATIONS_MANAGER";
  const enquiries = useQuery({
    queryKey: ["dashboard", userId, "my-enquiries"],
    queryFn: () => leadsApi.fetchMyLeads(),
    enabled: !manager,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
  const stages = useQueries({
    queries: enquiryStages.map((stage) => ({
      queryKey:
        stage.key === "NEW"
          ? ["dashboard", userId, "new-enquiries", role]
          : ["dashboard", userId, "enquiry-stage", stage.key, role],
      queryFn: async () => {
        const total = (
          await leadsApi.getAllLeads({ status: stage.key, limit: 1 })
        ).total;
        if (!Number.isInteger(total) || total < 0)
          throw new Error("The stage count was incomplete.");
        return total;
      },
      enabled: manager,
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
    })),
  });
  const rows: Bar[] = enquiryStages.map((stage, index) => ({
    ...stage,
    value: manager
      ? stages[index].isError
        ? undefined
        : stages[index].data
      : enquiries.isError || !enquiries.data
        ? undefined
        : enquiries.data.filter((lead) => lead.status === stage.key).length,
    loading: manager ? stages[index].isPending : enquiries.isPending,
    to: manager
      ? `/admin/leads?status=${stage.key}`
      : `/leads?tab=my-leads&status=${stage.key}`,
  }));
  return (
    <EnquiryDonutCard
      title="Enquiry breakdown"
      rows={rows}
      error={
        manager ? stages.some((stage) => stage.isError) : enquiries.isError
      }
    />
  );
}
function PaymentsChart({ userId }: { userId: string }) {
  const bookings = useQuery({
    queryKey: ["dashboard", userId, "bookings", "ACCOUNTS"],
    queryFn: () => bookingsApi.fetchBookings(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
  const payments = bookings.data?.flatMap((booking) => booking.payments || []);
  const rows: Bar[] = [
    { key: "PENDING", label: "Needs verification" },
    { key: "VERIFIED", label: "Verified" },
    { key: "REJECTED", label: "Rejected" },
  ].map((stage) => ({
    ...stage,
    value:
      bookings.isError || !payments
        ? undefined
        : payments.filter((payment) => payment.status === stage.key).length,
    loading: bookings.isPending,
    to: stage.key === "PENDING" ? "/bookings?payment=review" : undefined,
  }));
  return (
    <BarChart
      title="Payment verification"
      rows={rows}
      unit="payments"
      error={bookings.isError}
    />
  );
}
export function DashboardChart({
  role,
  userId,
}: {
  role: string;
  userId: string;
}) {
  if (
    role === "CONTENT_MANAGER" ||
    (role === "ACCOUNTS" && !adminFeatures.bookingWorkflow)
  )
    return null;
  return role === "ACCOUNTS" ? (
    <PaymentsChart userId={userId} />
  ) : (
    <EnquiryChart role={role} userId={userId} />
  );
}
