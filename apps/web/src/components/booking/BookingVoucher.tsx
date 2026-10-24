import {
  CalendarDays,
  Check,
  Hotel,
  Plane,
  FileCheck,
  Car,
  Ticket,
  Package,
  ShieldCheck,
  X,
  UserRound,
} from "lucide-react";
import { QuoteHeader } from "../quote/QuoteProposal";
import { formatPrice, formatQuoteDate } from "../quote/publicQuote";
import type { PublicBooking } from "./publicBooking";
import { BookingActions, BookingRefresh } from "./BookingActions";
import shared from "../quote/QuoteProposal.module.css";
import styles from "./BookingVoucher.module.css";

const categories = [
  { type: "FLIGHT", title: "Flights", icon: Plane },
  { type: "HOTEL", title: "Accommodation", icon: Hotel },
  { type: "VISA", title: "Visa assistance", icon: FileCheck },
  { type: "TRANSFER", title: "Transfers", icon: Car },
  { type: "ACTIVITY", title: "Excursions & experiences", icon: Ticket },
  { type: "OTHER", title: "Additional services", icon: Package },
] as const;
const statusLabels = {
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function BookingVoucher({ booking }: { booking: PublicBooking }) {
  const cancelled = booking.status === "CANCELLED";
  const progress =
    booking.totalAmount === 0
      ? 100
      : Math.min(100, (booking.paidAmount / booking.totalAmount) * 100);
  const greeting = cancelled
    ? "Cancelled booking for"
    : booking.status === "COMPLETED"
      ? "Completed trip for"
      : booking.status === "IN_PROGRESS"
        ? "Travelling with"
        : "Confirmed booking for";
  return (
    <main className={shared.shell}>
      <QuoteHeader />
      <section className={shared.hero} aria-labelledby="voucher-title">
        <div className={shared.heroContent}>
          <p className={shared.eyebrow}>Your Flyora trip voucher</p>
          <p className={shared.greeting}>
            {greeting} <strong>{booking.customerName}</strong>
          </p>
          <h1 id="voucher-title" className={shared.title}>
            {booking.serviceTitle}
          </h1>
          <div className={shared.heroBottom}>
            <span className={shared.reference}>{booking.bookingRef}</span>
            <span
              className={`${styles.status} ${cancelled ? styles.cancelled : ""}`}
            >
              {statusLabels[booking.status]}
            </span>
          </div>
        </div>
      </section>
      <div className={shared.body}>
        {cancelled && (
          <div className={styles.cancellation} role="alert">
            <strong>This booking has been cancelled.</strong> Please contact
            your coordinator about revised arrangements, payments or any refund.
            This voucher is not an active travel confirmation.
          </div>
        )}
        <section className={shared.overview} aria-label="Booking overview">
          <div className={shared.overviewCard}>
            <CalendarDays size={20} aria-hidden="true" />
            <div>
              <p className={shared.label}>Travel date</p>
              <p className={shared.value}>
                {formatQuoteDate(booking.travelDate)}
              </p>
              <p className={shared.detail}>
                Confirm meeting times with your coordinator
              </p>
            </div>
          </div>
          <div className={shared.overviewCard}>
            <UserRound size={20} aria-hidden="true" />
            <div>
              <p className={shared.label}>Lead traveller</p>
              <p className={shared.value}>{booking.customerName}</p>
              <p className={shared.detail}>Keep this reference for your trip</p>
            </div>
          </div>
          <div className={shared.overviewCard}>
            <ShieldCheck size={20} aria-hidden="true" />
            <div>
              <p className={shared.label}>Your coordinator</p>
              <p className={shared.value}>{booking.coordinator.fullName}</p>
              <p className={shared.detail}>Flyora travel desk</p>
            </div>
          </div>
        </section>
        <div className={shared.columns}>
          <div>
            <h2 className={shared.sectionHeading}>
              {cancelled
                ? "Original itinerary & services"
                : "Your itinerary & services"}
            </h2>
            <p className={shared.intro}>
              {cancelled
                ? "The original itinerary is shown for reference only."
                : "Your travel arrangements, brought together in one place. Confirm duration, final timings and travel documents with your coordinator."}
            </p>
            {!booking.itineraryItems.length && (
              <p className={styles.empty}>
                Your coordinator will share the detailed itinerary with you.
              </p>
            )}
            {categories.map(({ type, title, icon: Icon }) => {
              const items = booking.itineraryItems.filter(
                (item) => item.type === type,
              );
              return items.length ? (
                <section key={type} className={shared.group} aria-label={title}>
                  <h3 className={shared.groupHeading}>
                    <Icon size={18} aria-hidden="true" />
                    {title}
                    <span>
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </h3>
                  {items.map((item, index) => (
                    <article
                      key={index}
                      className={`${shared.item} ${styles.itineraryItem}`}
                    >
                      <div>
                        <h4 className={shared.itemTitle}>{item.title}</h4>
                        {item.description && (
                          <p className={shared.itemDescription}>
                            {item.description}
                          </p>
                        )}
                        <p className={shared.itemQuantity}>
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </article>
                  ))}
                </section>
              ) : null;
            })}
            <section
              className={shared.comparison}
              aria-label="Included and excluded services"
            >
              {[
                {
                  title: "Included in your booking",
                  items: booking.inclusions,
                  icon: Check,
                  className: shared.check,
                },
                {
                  title: "Not included",
                  items: booking.exclusions,
                  icon: X,
                  className: shared.cross,
                },
              ].map(({ title, items, icon: Icon, className }) => (
                <div className={shared.listCard} key={title}>
                  <h2>{title}</h2>
                  {items.length ? (
                    <ul className={shared.list}>
                      {items.map((item, index) => (
                        <li key={index}>
                          <Icon
                            size={15}
                            className={className}
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={shared.detail}>
                      Confirm details with your coordinator.
                    </p>
                  )}
                </div>
              ))}
            </section>
          </div>
          <aside className={shared.summary} aria-labelledby="payment-title">
            <h2 id="payment-title" className={shared.label}>
              Payment summary
            </h2>
            <p className={shared.total}>{formatPrice(booking.totalAmount)}</p>
            <p className={shared.detail}>Total package amount</p>
            <dl className={styles.financials}>
              <div>
                <dt>Verified paid</dt>
                <dd>{formatPrice(booking.paidAmount)}</dd>
              </div>
              <div>
                <dt>Balance due</dt>
                <dd>{formatPrice(booking.dueAmount)}</dd>
              </div>
            </dl>
            {!cancelled && (
              <>
                <progress
                  className={styles.progress}
                  max={100}
                  value={progress}
                  aria-label="Verified payment progress"
                >
                  {Math.round(progress)}%
                </progress>
                <p
                  className={`${styles.paymentState} ${booking.isFullyPaid ? styles.fullyPaid : ""}`}
                >
                  {booking.isFullyPaid
                    ? "Fully Paid & Verified"
                    : booking.paidAmount > 0
                      ? "Partially paid"
                      : "Awaiting verified payment"}
                </p>
              </>
            )}
            <p className={styles.paymentNote}>
              {cancelled
                ? "Recorded balances are shown for reference. Contact your coordinator to confirm the cancellation settlement."
                : "Only payments verified by Flyora Accounts/Admin are included. A submitted payment awaiting verification will not reduce this balance yet."}
            </p>
            <div className={styles.refresh}>
              <BookingRefresh />
            </div>
            <BookingActions
              coordinator={booking.coordinator}
              bookingRef={booking.bookingRef}
              serviceTitle={booking.serviceTitle}
              status={booking.status}
            />
          </aside>
        </div>
        <footer className={shared.footer}>
          <span>Thoughtfully planned. Personally supported.</span>
          <span>
            Flyora Travels · Issued {formatQuoteDate(booking.createdAt)} ·{" "}
            {booking.bookingRef}
          </span>
        </footer>
      </div>
    </main>
  );
}
