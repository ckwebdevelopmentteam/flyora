import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { enquiryStages } from "../../lib/enquiryFilters";
import { leadsApi } from "../../lib/leadsApi";
import { bookingsApi } from "../bookings/bookingsApi";

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
  const maximum = Math.max(1, ...rows.map((row) => row.value ?? 0));
  return (
    <section className="surface dashboard-chart" aria-label={title}>
      <header>
        <h2>{title}</h2>
        <span>
          {total === undefined ? "—" : total.toLocaleString("en-IN")} {unit}
        </span>
      </header>
      <ul className="chart-bars">
        {rows.map((row) => {
          const text =
            row.value === undefined
              ? row.loading
                ? "Loading"
                : "Unavailable"
              : row.value.toLocaleString("en-IN");
          const content = (
            <>
              <span className="chart-label">{row.label}</span>
              <span className="chart-track" aria-hidden="true">
                <span
                  className={`chart-fill chart-${row.key.toLowerCase()}`}
                  style={{ width: `${((row.value ?? 0) / maximum) * 100}%` }}
                />
              </span>
              <strong>
                {row.value === undefined ? (row.loading ? "…" : "—") : text}
              </strong>
            </>
          );
          return (
            <li key={row.key}>
              {row.to ? (
                <Link
                  to={row.to}
                  aria-label={`${row.label}: ${text}`}
                  className="chart-row"
                >
                  {content}
                </Link>
              ) : (
                <div className="chart-row" aria-label={`${row.label}: ${text}`}>
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
    <BarChart
      title="Enquiry stages"
      rows={rows}
      unit="enquiries"
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
  if (role === "CONTENT_MANAGER") return null;
  return role === "ACCOUNTS" ? (
    <PaymentsChart userId={userId} />
  ) : (
    <EnquiryChart role={role} userId={userId} />
  );
}
