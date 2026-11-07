import { FileQuestion, WifiOff } from "lucide-react";
import { QuoteHeader } from "../quote/QuoteProposal";
import { BookingRefresh } from "./BookingActions";
import shared from "../quote/QuoteProposal.module.css";

export function BookingNotFound() {
  return (
    <main className={shared.shell}>
      <QuoteHeader />
      <section className={shared.state}>
        <FileQuestion size={42} aria-hidden="true" />
        <h1>Booking reference not found</h1>
        <p>
          Please check the full reference or contact your Flyora coordinator.
        </p>
      </section>
    </main>
  );
}
export function BookingUnavailable() {
  return (
    <main className={shared.shell}>
      <QuoteHeader />
      <section className={shared.state}>
        <WifiOff size={42} aria-hidden="true" />
        <h1>We couldn’t load your booking</h1>
        <p>
          Your trip details may still be available. Please try again, or contact
          your coordinator.
        </p>
        <BookingRefresh retry />
      </section>
    </main>
  );
}
export function BookingLoading() {
  return (
    <main className={shared.shell} aria-busy="true">
      <QuoteHeader />
      <div className={shared.body}>
        <p className={shared.intro} role="status">
          Preparing your Flyora trip voucher…
        </p>
        <div className={shared.loading} aria-hidden="true">
          <div className={`${shared.skeleton} ${shared.skeletonTitle}`} />
          <div className={`${shared.skeleton} ${shared.skeletonCard}`} />
          <div className={`${shared.skeleton} ${shared.skeletonCard}`} />
        </div>
      </div>
    </main>
  );
}
