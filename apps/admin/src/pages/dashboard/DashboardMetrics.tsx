import { countDueFollowups } from "../../lib/followUps";
export { countDueFollowups } from "../../lib/followUps";
import {
  useQuery,
  useQueries,
  useQueryClient,
  useIsFetching,
} from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Inbox,
  Layers,
  Clock,
  CalendarCheck,
  Wallet,
  CircleDollarSign,
  RefreshCw,
  FileClock,
  Palmtree,
  Globe,
  Star,
  type LucideIcon,
} from "lucide-react";
import { leadsApi } from "../../lib/leadsApi";
import { packagesApi } from "../../lib/packagesApi";
import { bookingsApi } from "../bookings/bookingsApi";
import { calculateBookingFinancials } from "../bookings/paymentCalculator";
import type { BookingRecord } from "../bookings/types";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});
const count = new Intl.NumberFormat("en-IN");
function validCount(value: number): number {
  if (!Number.isInteger(value) || value < 0)
    throw new Error("The count was incomplete.");
  return value;
}
export function summarizeBookings(bookings: BookingRecord[]) {
  let confirmed = 0,
    collected = 0,
    outstanding = 0,
    pending = 0;
  for (const booking of bookings) {
    const totals = calculateBookingFinancials(booking);
    collected += totals.verifiedPaidAmount;
    if (booking.status === "CONFIRMED") confirmed++;
    if (booking.status !== "CANCELLED") outstanding += totals.dueAmount;
    pending += (booking.payments || []).filter(
      (payment) => payment.status === "PENDING",
    ).length;
  }
  return { confirmed, collected, outstanding, pending };
}
function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
  to,
  loading,
}: {
  title: string;
  value?: string;
  hint: string;
  icon: LucideIcon;
  to: string;
  loading: boolean;
}) {
  return (
    <Link
      to={to}
      className="metric-card"
      aria-label={`${title}: ${value ?? (loading ? "Loading" : "Unavailable")}`}
    >
      <span className="metric-label">
        {title}
        <Icon size={18} aria-hidden="true" />
      </span>
      {loading && value === undefined ? (
        <span className="metric-skeleton" aria-label="Loading number" />
      ) : (
        <strong className="metric-value">{value ?? "—"}</strong>
      )}
      {hint && <span className="metric-hint">{hint}</span>}
    </Link>
  );
}
function MetricsHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const client = useQueryClient();
  const fetching = useIsFetching({ queryKey: ["dashboard"] }) > 0;
  return (
    <div className="metrics-heading">
      <div>
        <h2 className="sr-only">{title}</h2>
        <span className="sr-only">{description}</span>
      </div>
      <button
        className="icon-button"
        aria-label="Refresh numbers"
        title="Refresh numbers"
        disabled={fetching}
        onClick={() =>
          void client.invalidateQueries({ queryKey: ["dashboard"] })
        }
      >
        <RefreshCw
          size={15}
          aria-hidden="true"
          className={fetching ? "animate-spin" : ""}
        />
      </button>
    </div>
  );
}

function BusinessMetrics({ role, userId }: { role: string; userId: string }) {
  const manager = role === "SUPER_ADMIN" || role === "OPERATIONS_MANAGER";
  const accounts = role === "ACCOUNTS";
  const newEnquiries = useQuery({
    queryKey: ["dashboard", userId, "new-enquiries", role],
    queryFn: async () =>
      manager
        ? validCount(
            (await leadsApi.getAllLeads({ status: "NEW", limit: 1 })).total,
          )
        : (await leadsApi.fetchMyLeads({ status: "NEW" })).length,
    enabled: !accounts && !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
  const bookings = useQuery({
    queryKey: ["dashboard", userId, "bookings", role],
    queryFn: () => bookingsApi.fetchBookings(),
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
  const totals =
    bookings.data && !bookings.isError
      ? summarizeBookings(bookings.data)
      : undefined;
  return (
    <section aria-label="Business metrics" className="space-y-4">
      <MetricsHeader
        title="Key figures"
        description={`All-time totals · ${manager || accounts ? "Across your team" : "Your assigned customers"}`}
      />
      <div className="metrics-grid">
        {accounts ? (
          <MetricCard
            title="Payments to review"
            value={totals && count.format(totals.pending)}
            hint="Waiting for verification"
            icon={FileClock}
            to="/bookings?payment=review"
            loading={bookings.isPending}
          />
        ) : (
          <MetricCard
            title="New enquiries"
            value={
              newEnquiries.isError || newEnquiries.data === undefined
                ? undefined
                : count.format(newEnquiries.data)
            }
            hint=""
            icon={Inbox}
            to={
              manager
                ? "/admin/leads?status=NEW"
                : "/leads?tab=my-leads&status=NEW"
            }
            loading={newEnquiries.isPending}
          />
        )}
        <MetricCard
          title="Confirmed bookings"
          value={totals && count.format(totals.confirmed)}
          hint=""
          icon={CalendarCheck}
          to="/bookings"
          loading={bookings.isPending}
        />
        <MetricCard
          title="Payments collected"
          value={totals && currency.format(totals.collected)}
          hint="Verified only"
          icon={Wallet}
          to="/bookings"
          loading={bookings.isPending}
        />
        <MetricCard
          title="Balance due"
          value={totals && currency.format(totals.outstanding)}
          hint=""
          icon={CircleDollarSign}
          to="/bookings"
          loading={bookings.isPending}
        />
      </div>
      {(bookings.isError || newEnquiries.isError) && (
        <div className="notice notice-error" role="alert">
          Some numbers couldn't load. Refresh the numbers to try again.
        </div>
      )}
      {!accounts && totals !== undefined && totals.pending > 0 && (
        <Link to="/bookings?payment=review" className="metrics-attention">
          <FileClock size={17} aria-hidden="true" />
          <span>
            {count.format(totals.pending)}{" "}
            {totals.pending === 1 ? "payment is" : "payments are"} waiting for
            verification
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </section>
  );
}
function CoordinatorMetrics({ userId }: { userId: string }) {
  const pool = useQuery({
    queryKey: ["dashboard", userId, "pool"],
    queryFn: () => leadsApi.fetchPoolLeads(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
  const enquiries = useQuery({
    queryKey: ["dashboard", userId, "my-enquiries"],
    queryFn: () => leadsApi.fetchMyLeads(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
  const bookings = useQuery({
    queryKey: ["dashboard", userId, "bookings", "SERVICE_COORDINATOR"],
    queryFn: () => bookingsApi.fetchBookings(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
  const totals =
    bookings.data && !bookings.isError
      ? summarizeBookings(bookings.data)
      : undefined;
  const sources = [pool, enquiries, bookings];
  return (
    <section aria-label="Your work metrics" className="space-y-4">
      <MetricsHeader
        title="Your work"
        description="Your assigned customers and travel services"
      />
      <div className="metrics-grid">
        <MetricCard
          title="Available enquiries"
          value={
            pool.data && !pool.isError
              ? count.format(pool.data.length)
              : undefined
          }
          hint="Your travel services"
          icon={Layers}
          to="/leads?tab=pool"
          loading={pool.isPending}
        />
        <MetricCard
          title="Follow-ups due"
          value={
            enquiries.data && !enquiries.isError
              ? count.format(countDueFollowups(enquiries.data))
              : undefined
          }
          hint="Today and overdue"
          icon={Clock}
          to="/leads?tab=my-leads"
          loading={enquiries.isPending}
        />
        <MetricCard
          title="Confirmed bookings"
          value={totals && count.format(totals.confirmed)}
          hint=""
          icon={CalendarCheck}
          to="/bookings"
          loading={bookings.isPending}
        />
        <MetricCard
          title="Balance due"
          value={totals && currency.format(totals.outstanding)}
          hint="Your customers"
          icon={CircleDollarSign}
          to="/bookings"
          loading={bookings.isPending}
        />
      </div>
      {sources.some((source) => source.isError) && (
        <div className="notice notice-error" role="alert">
          Some numbers couldn't load. Refresh the numbers to try again.
        </div>
      )}
    </section>
  );
}
function ContentMetrics({ userId }: { userId: string }) {
  const definitions = [
    {
      title: "Tour packages",
      hint: "Published and draft packages",
      params: { includeUnpublished: true },
      icon: Palmtree,
    },
    {
      title: "Published packages",
      hint: "Available on your website",
      params: {},
      icon: Globe,
    },
    {
      title: "Featured packages",
      hint: "Highlighted on your website",
      params: { featuredOnly: true },
      icon: Star,
    },
  ];
  const queries = useQueries({
    queries: definitions.map((definition) => ({
      queryKey: ["dashboard", userId, definition.title],
      queryFn: async () =>
        validCount(
          (await packagesApi.listPackages({ ...definition.params, limit: 1 }))
            .total,
        ),
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
    })),
  });
  return (
    <section aria-label="Package metrics" className="space-y-4">
      <MetricsHeader
        title="Packages at a glance"
        description="Your current website content"
      />
      <div className="metrics-grid">
        {definitions.map((definition, index) => (
          <MetricCard
            key={definition.title}
            {...definition}
            value={
              queries[index].isError || queries[index].data === undefined
                ? undefined
                : count.format(queries[index].data!)
            }
            to="/packages"
            loading={queries[index].isPending}
          />
        ))}
      </div>
      {queries.some((query) => query.isError) && (
        <div className="notice notice-error" role="alert">
          Some numbers couldn't load. Refresh the numbers to try again.
        </div>
      )}
    </section>
  );
}
export function DashboardMetrics({
  role,
  userId,
}: {
  role: string;
  userId: string;
}) {
  return role === "CONTENT_MANAGER" ? (
    <ContentMetrics userId={userId} />
  ) : role === "SERVICE_COORDINATOR" ? (
    <CoordinatorMetrics userId={userId} />
  ) : (
    <BusinessMetrics role={role} userId={userId} />
  );
}
