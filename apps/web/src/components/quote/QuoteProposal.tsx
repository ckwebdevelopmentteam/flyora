import Link from "next/link";
import { CalendarDays, Check, Compass, Users, Minus } from "lucide-react";
import type { PublicQuote } from "./publicQuote";
import { formatPrice, formatQuoteDate } from "./publicQuote";
import { QuoteActions, QuoteValidity } from "./QuoteActions";
import styles from "./ProposalDocument.module.css";
import voucherStyles from "./QuoteProposal.module.css";

const categories = [
  { type: "FLIGHT", title: "Flights" },
  { type: "HOTEL", title: "Accommodation" },
  { type: "VISA", title: "Visa assistance" },
  { type: "TRANSFER", title: "Transfers" },
  { type: "ACTIVITY", title: "Experiences" },
  { type: "OTHER", title: "Other services" },
] as const;

export function QuoteHeader({
  reference,
  proposal = false,
}: {
  reference?: string;
  proposal?: boolean;
}) {
  const theme = proposal ? styles : voucherStyles;
  return (
    <header className={theme.header}>
      <Link
        prefetch={false}
        href="/"
        className={theme.brand}
        aria-label="Flyora Travels home"
      >
        <span className={theme.brandMark}>
          <Compass size={22} aria-hidden="true" />
        </span>
        <span>
          FLYORA<small>TRAVELS</small>
        </span>
      </Link>
      <span
        className={proposal ? styles.reference : voucherStyles.privateLabel}
      >
        {reference
          ? `#${reference}`
          : proposal
            ? "Travel proposal"
            : "Your trip details"}
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
  const title =
    quote.packageTitle ||
    quote.destination ||
    (quote.items.length === 1 ? quote.items[0].title : quote.serviceTitle);
  return (
    <main className={styles.shell}>
      <QuoteHeader proposal reference={quote.quoteNumber} />
      <div className={styles.document}>
        <section className={styles.hero} aria-labelledby="proposal-title">
          <div className={styles.tripHeading}>
            <p className={styles.eyebrow}>Travel proposal</p>
            <h1 id="proposal-title" className={styles.title}>
              {title}
            </h1>
            {(quote.travelDate || quote.numberOfAdults != null) && (
              <div className={styles.tripMeta} aria-label="Trip details">
                {quote.travelDate && (
                  <span>
                    <CalendarDays size={15} aria-hidden="true" />
                    {formatQuoteDate(quote.travelDate)}
                  </span>
                )}
                {quote.numberOfAdults != null && (
                  <span>
                    <Users size={15} aria-hidden="true" />
                    {quote.numberOfAdults}{" "}
                    {quote.numberOfAdults === 1 ? "adult" : "adults"}
                    {quote.numberOfKids
                      ? ` · ${quote.numberOfKids} ${quote.numberOfKids === 1 ? "child" : "children"}`
                      : ""}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={styles.recipient}>
            <p className={styles.eyebrow}>Prepared for</p>
            <p className={styles.customerName}>{quote.customerName}</p>
          </div>
        </section>
        <div className={styles.columns}>
          <section
            className={styles.details}
            aria-label="Proposal details"
            tabIndex={0}
          >
            <h2 className={styles.sectionHeading}>Your trip</h2>
            <div className={styles.services}>
              {categories.map(({ type, title: category }) => {
                const items = quote.items.filter((item) => item.type === type);
                if (!items.length) return null;
                return (
                  <section
                    key={type}
                    className={styles.group}
                    aria-label={category}
                  >
                    <h3 className={styles.groupHeading}>{category}</h3>
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
                            {item.quantity} × {formatPrice(item.sellingPrice)}
                          </p>
                        </div>
                        <p className={styles.itemPrice}>
                          {formatPrice(
                            (Math.round(item.sellingPrice * 100) *
                              item.quantity) /
                              100,
                          )}
                        </p>
                      </article>
                    ))}
                  </section>
                );
              })}
            </div>
            {(quote.inclusions.length > 0 || quote.exclusions.length > 0) && (
              <section
                className={styles.comparison}
                aria-label="What is included"
              >
                {quote.inclusions.length > 0 && (
                  <div className={styles.listCard}>
                    <h2>Included</h2>
                    <ul className={styles.list}>
                      {quote.inclusions.map((item, i) => (
                        <li key={i}>
                          <Check size={14} aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {quote.exclusions.length > 0 && (
                  <div className={styles.listCard}>
                    <h2>Not included</h2>
                    <ul className={styles.list}>
                      {quote.exclusions.map((item, i) => (
                        <li key={i}>
                          <Minus size={14} aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </section>
          <aside className={styles.summary} aria-labelledby="price-title">
            <div>
              <h2 id="price-title" className={styles.label}>
                Total price
              </h2>
              <p className={styles.total}>{formatPrice(quote.totalPrice)}</p>
              <QuoteValidity
                validUntil={quote.validUntil}
                isExpired={quote.isExpired}
                status={quote.status}
                initialNow={initialNow}
              />
            </div>
            <div className={styles.contact}>
              <div className={styles.coordinator}>
                <span className={styles.avatar} aria-hidden="true">
                  {quote.coordinator.fullName.slice(0, 1)}
                </span>
                <div>
                  <p className={styles.contactLabel}>Your travel advisor</p>
                  <p className={styles.advisorName}>
                    {quote.coordinator.fullName}
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
            </div>
          </aside>
        </div>
      </div>
      <footer className={styles.footer}>
        <span>Prices in INR</span>
        <span>Prepared {formatQuoteDate(quote.createdAt)}</span>
      </footer>
    </main>
  );
}
