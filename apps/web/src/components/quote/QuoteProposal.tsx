import Link from "next/link";
import {
  CalendarDays,
  Check,
  Compass,
  Hotel,
  LockKeyhole,
  MapPin,
  Plane,
  ShieldCheck,
  Ticket,
  Users,
  X,
  Car,
  FileCheck,
  Package,
} from "lucide-react";
import type { PublicQuote } from "./publicQuote";
import { formatPrice, formatQuoteDate } from "./publicQuote";
import { QuoteActions, QuoteValidity } from "./QuoteActions";
import styles from "./QuoteProposal.module.css";

const categories = [
  { type: "FLIGHT", title: "Flights", icon: Plane },
  { type: "HOTEL", title: "Accommodation", icon: Hotel },
  { type: "VISA", title: "Visa assistance", icon: FileCheck },
  { type: "TRANSFER", title: "Transfers", icon: Car },
  { type: "ACTIVITY", title: "Excursions & experiences", icon: Ticket },
  { type: "OTHER", title: "Additional services", icon: Package },
] as const;

export function QuoteHeader() {
  return (
    <header className={styles.header}>
      <Link
        prefetch={false}
        href="/"
        className={styles.brand}
        aria-label="Flyora Travels home"
      >
        <span className={styles.brandMark}>
          <Compass size={21} aria-hidden="true" />
        </span>
        <span>
          FLYORA<small>TRAVELS</small>
        </span>
      </Link>
      <span className={styles.privateLabel}>
        <LockKeyhole size={13} aria-hidden="true" />
        Your personal travel proposal
      </span>
    </header>
  );
}

export function QuoteProposal({
  quote,
  initialNow,
}: {
  quote: PublicQuote;
  initialNow: number;
}) {
  const title = quote.packageTitle || quote.destination || quote.serviceTitle;
  return (
    <main className={styles.shell}>
      <QuoteHeader />
      <section className={styles.hero} aria-labelledby="proposal-title">
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>A journey, curated for you</p>
          <p className={styles.greeting}>
            Prepared exclusively for <strong>{quote.customerName}</strong>
          </p>
          <h1 id="proposal-title" className={styles.title}>
            {title}
          </h1>
          <div className={styles.heroBottom}>
            <span className={styles.reference}>#{quote.quoteNumber}</span>
            <QuoteValidity
              validUntil={quote.validUntil}
              isExpired={quote.isExpired}
              status={quote.status}
              initialNow={initialNow}
            />
          </div>
        </div>
      </section>
      <div className={styles.body}>
        <section className={styles.overview} aria-label="Your trip overview">
          <div className={styles.overviewCard}>
            <CalendarDays size={20} aria-hidden="true" />
            <div>
              <p className={styles.label}>Travel date</p>
              <p className={styles.value}>
                {quote.travelDate
                  ? formatQuoteDate(quote.travelDate)
                  : "To be confirmed"}
              </p>
              <p className={styles.detail}>
                {quote.destination || quote.serviceTitle}
              </p>
            </div>
          </div>
          <div className={styles.overviewCard}>
            <Users size={20} aria-hidden="true" />
            <div>
              <p className={styles.label}>Travellers</p>
              <p className={styles.value}>
                {quote.numberOfAdults != null
                  ? `${quote.numberOfAdults} ${quote.numberOfAdults === 1 ? "adult" : "adults"}${quote.numberOfKids != null ? ` · ${quote.numberOfKids} ${quote.numberOfKids === 1 ? "child" : "children"}` : ""}`
                  : "To be confirmed"}
              </p>
              <p className={styles.detail}>Personalized to your travel plans</p>
            </div>
          </div>
          <div className={styles.overviewCard}>
            <MapPin size={20} aria-hidden="true" />
            <div>
              <p className={styles.label}>Your coordinator</p>
              <p className={styles.value}>{quote.coordinator.fullName}</p>
              <p className={styles.detail}>Flyora travel desk</p>
            </div>
          </div>
        </section>
        <div className={styles.columns}>
          <div>
            <h2 className={styles.sectionHeading}>
              The details of your journey
            </h2>
            <p className={styles.intro}>
              A considered selection of travel services, brought together in one
              proposal.
            </p>
            {categories.map(({ type, title: category, icon: Icon }) => {
              const items = quote.items.filter((item) => item.type === type);
              if (!items.length) return null;
              return (
                <section
                  key={type}
                  className={styles.group}
                  aria-label={category}
                >
                  <h3 className={styles.groupHeading}>
                    <Icon size={18} aria-hidden="true" />
                    {category}
                    <span>
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </h3>
                  {items.map((item) => (
                    <article key={item.id} className={styles.item}>
                      <div>
                        <h4 className={styles.itemTitle}>{item.title}</h4>
                        {item.description && (
                          <p className={styles.itemDescription}>
                            {item.description}
                          </p>
                        )}
                        <p className={styles.itemQuantity}>
                          Quantity {item.quantity} ×{" "}
                          {formatPrice(item.sellingPrice)}
                        </p>
                      </div>
                      <p className={styles.itemPrice}>
                        {formatPrice(
                          (Math.round(item.sellingPrice * 100) *
                            item.quantity) /
                            100,
                        )}
                        <small>Line total</small>
                      </p>
                    </article>
                  ))}
                </section>
              );
            })}
            <section
              className={styles.comparison}
              aria-label="What is included"
            >
              <div className={styles.listCard}>
                <h2>Included in your quote</h2>
                {quote.inclusions.length ? (
                  <ul className={styles.list}>
                    {quote.inclusions.map((item, i) => (
                      <li key={i}>
                        <Check
                          className={styles.check}
                          size={15}
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.detail}>
                    Please refer to the itemized services above.
                  </p>
                )}
              </div>
              <div className={styles.listCard}>
                <h2>Not included</h2>
                {quote.exclusions.length ? (
                  <ul className={styles.list}>
                    {quote.exclusions.map((item, i) => (
                      <li key={i}>
                        <X
                          className={styles.cross}
                          size={15}
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.detail}>
                    Ask your coordinator to confirm any additional expenses.
                  </p>
                )}
              </div>
            </section>
          </div>
          <aside className={styles.summary} aria-labelledby="investment-title">
            <h2 id="investment-title" className={styles.label}>
              Your total investment
            </h2>
            <p className={styles.total}>{formatPrice(quote.totalPrice)}</p>
            <p className={styles.taxNote}>
              All applicable taxes included.
              <br />
              No hidden charges.
            </p>
            <div className={styles.summaryDivider} />
            <div className={styles.coordinator}>
              <span className={styles.avatar} aria-hidden="true">
                {quote.coordinator.fullName.slice(0, 1)}
              </span>
              <div>
                <strong>{quote.coordinator.fullName}</strong>
                <p className={styles.detail}>
                  Your dedicated Flyora coordinator
                </p>
              </div>
            </div>
            <QuoteActions
              coordinator={quote.coordinator}
              quoteNumber={quote.quoteNumber}
              serviceTitle={quote.destination || quote.serviceTitle}
              validUntil={quote.validUntil}
              isExpired={quote.isExpired}
              status={quote.status}
              initialNow={initialNow}
            />
          </aside>
        </div>
        <footer className={styles.footer}>
          <span>
            <ShieldCheck
              size={14}
              aria-hidden="true"
              style={{ display: "inline", marginRight: 6 }}
            />
            <strong>Thoughtfully planned. Personally supported.</strong>
          </span>
          <span>
            Flyora Travels · Prepared {formatQuoteDate(quote.createdAt)} · #
            {quote.quoteNumber}
          </span>
        </footer>
      </div>
    </main>
  );
}
