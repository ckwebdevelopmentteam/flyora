import { FileQuestion, WifiOff } from "lucide-react";
import { QuoteHeader } from "./QuoteProposal";
import { QuoteRetry } from "./QuoteActions";
import styles from "./ProposalDocument.module.css";

export function QuoteNotFound() {
  return (
    <main className={styles.shell}>
      <QuoteHeader proposal />
      <section className={styles.state}>
        <FileQuestion size={42} aria-hidden="true" />
        <h1>Quotation not found or link has expired</h1>
        <p>
          Please check the full link or contact your Flyora coordinator for an
          updated quotation.
        </p>
      </section>
    </main>
  );
}
export function QuoteUnavailable() {
  return (
    <main className={styles.shell}>
      <QuoteHeader proposal />
      <section className={styles.state}>
        <WifiOff size={42} aria-hidden="true" />
        <h1>We couldn’t load your quotation</h1>
        <p>
          Your proposal may still be available. Please try again in a moment, or
          contact your coordinator if you need assistance.
        </p>
        <QuoteRetry />
      </section>
    </main>
  );
}
export function QuoteLoading() {
  return (
    <main className={styles.shell} aria-busy="true">
      <QuoteHeader proposal />
      <div className={styles.body}>
        <p role="status" className={styles.intro}>
          Preparing your Flyora proposal…
        </p>
        <div aria-hidden="true" className={styles.loading}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
          <div className={styles.skeleton} />
          <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
          <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
        </div>
      </div>
    </main>
  );
}
