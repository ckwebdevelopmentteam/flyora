import { adminFeatures } from "../../config/features";
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
  cardClassName,
  iconClassName,
}: {
  title: string;
  value?: string;
  hint: string;
  icon: LucideIcon;
  to: string;
  loading: boolean;
  cardClassName?: string;
  iconClassName?: string;
}) {
  return (
    <Link
      to={to}
      className={`metric-card h-full justify-between ${cardClassName ?? "bg-white"}`}
      aria-label={`${title}: ${value ?? (loading ? "Loading" : "Unavailable")}`}
    >
      <span className="metric-label">
        <span>{title}</span>
        {iconClassName ? (
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconClassName}`}
          >
            <Icon size={17} aria-hidden="true" />
          </span>
        ) : (
          <Icon size={18} aria-hidden="true" />
        )}
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
function EnquiryMetrics({
  role,
  userId,
  gridClassName = "metrics-grid",
}: {
  role: string;
  userId: string;
  gridClassName?: string;
}) {
  const manager = role === "SUPER_ADMIN" || role === "OPERATIONS_MANAGER";
  const enquiries = useQuery({
    queryKey: ["dashboard", userId, "my-enquiries"],
    queryFn: () => leadsApi.fetchMyLeads(),
    enabled: !manager && !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
  const pool = useQuery({
    queryKey: ["dashboard", userId, "pool"],
    queryFn: () => leadsApi.fetchPoolLeads(),
    enabled: !manager && !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
  const definitions = [
    {
      title: "All enquiries",
      status: undefined,
      icon: Inbox,
      cardClassName: "bg-blue-50/70 border-blue-200/80 hover:border-blue-300",
      iconClassName: "bg-blue-100 text-[#002f89]",
    },
    {
      title: "New enquiries",
      status: "NEW" as const,
      icon: Layers,
      cardClassName: "bg-sky-50/80 border-sky-200/80 hover:border-sky-300",
      iconClassName: "bg-sky-100 text-sky-700",
    },
    {
      title: "Contacted",
      status: "CONTACTED" as const,
      icon: Clock,
      cardClassName:
        "bg-amber-50/70 border-amber-200/80 hover:border-amber-300",
      iconClassName: "bg-amber-100 text-amber-700",
    },
    {
      title: "Booked",
      status: "BOOKED" as const,
      icon: CalendarCheck,
      cardClassName:
        "bg-emerald-50/70 border-emerald-200/80 hover:border-emerald-300",
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
  ];
  const totals = useQueries({
    queries: definitions.map(({ status }) => ({
      queryKey: ["dashboard", userId, "enquiry-total", status, role],
      queryFn: async () =>
        validCount((await leadsApi.getAllLeads({ status, limit: 1 })).total),
      enabled: manager && !!userId,
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      refetchOnMount: "always" as const,
    })),
  });
  const unavailable = manager
    ? totals.some((query) => query.isError)
    : enquiries.isError || pool.isError;
  const mine = enquiries.isError ? undefined : enquiries.data;
  const staffCards = [
    {
      title: "My enquiries",
      value: mine?.length,
      icon: Inbox,
      to: "/leads?tab=my-leads",
      loading: enquiries.isPending,
      cardClassName: "bg-blue-50/70 border-blue-200/80 hover:border-blue-300",
      iconClassName: "bg-blue-100 text-[#002f89]",
    },
    {
      title: "Available enquiries",
      value: pool.isError ? undefined : pool.data?.length,
      icon: Layers,
      to: "/leads?tab=pool",
      loading: pool.isPending,
      cardClassName: "bg-sky-50/80 border-sky-200/80 hover:border-sky-300",
      iconClassName: "bg-sky-100 text-sky-700",
    },
    {
      title: "Follow-ups due",
      value: mine && countDueFollowups(mine),
      icon: Clock,
      to: "/leads?tab=my-leads",
      loading: enquiries.isPending,
      cardClassName:
        "bg-amber-50/70 border-amber-200/80 hover:border-amber-300",
      iconClassName: "bg-amber-100 text-amber-700",
    },
    {
      title: "Booked",
      value: mine && mine.filter((lead) => lead.status === "BOOKED").length,
      icon: CalendarCheck,
      to: "/leads?tab=my-leads&status=BOOKED",
      loading: enquiries.isPending,
      cardClassName:
        "bg-emerald-50/70 border-emerald-200/80 hover:border-emerald-300",
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
  ];
  return (
    <section
      aria-label={manager ? "Enquiry metrics" : "Your work metrics"}
      className="h-full flex flex-col"
    >
      <MetricsHeader
        title="Enquiries"
        description={manager ? "Across your team" : "Your assigned services"}
      />
      <div className={gridClassName}>
        {manager
          ? definitions.map((definition, index) => (
              <MetricCard
                key={definition.title}
                title={definition.title}
                value={
                  totals[index].isError || totals[index].data === undefined
                    ? undefined
                    : count.format(totals[index].data!)
                }
                hint=""
                icon={definition.icon}
                cardClassName={definition.cardClassName}
                iconClassName={definition.iconClassName}
                to={`/admin/leads${definition.status ? `?status=${definition.status}` : ""}`}
                loading={totals[index].isPending}
              />
            ))
          : staffCards.map((card) => (
              <MetricCard
                key={card.title}
                {...card}
                value={
                  card.value === undefined
                    ? undefined
                    : count.format(card.value)
                }
                hint=""
              />
            ))}
      </div>
      {unavailable && (
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
  gridClassName,
}: {
  role: string;
  userId: string;
  gridClassName?: string;
}) {
  if (!adminFeatures.bookingWorkflow && role !== "CONTENT_MANAGER") {
    return role === "ACCOUNTS" ? null : (
      <EnquiryMetrics
        role={role}
        userId={userId}
        gridClassName={gridClassName}
      />
    );
  }
  return role === "CONTENT_MANAGER" ? (
    <ContentMetrics userId={userId} />
  ) : role === "SERVICE_COORDINATOR" ? (
    <CoordinatorMetrics userId={userId} />
  ) : (
    <BusinessMetrics role={role} userId={userId} />
  );
}
