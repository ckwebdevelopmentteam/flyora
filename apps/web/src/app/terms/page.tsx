import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions | Flyora Tours & Travels LLP",
  description:
    "Read the terms and conditions governing bookings, cancellations, itineraries, and services with Flyora Tours & Travels LLP.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDF9F5] text-[#1C1815] font-sans antialiased">
      <Navbar activePath="/terms" />

      <main className="flex-1 max-w-4xl mx-auto px-5 sm:px-8 py-28 sm:py-36">
        <div className="mb-10 text-center sm:text-left border-b border-black/10 pb-8">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#002f89] block mb-2 font-semibold">
            Agreement &amp; Policies
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1C1815] tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm text-[#7A7167]">
            Last updated: January 2025 • Flyora Tours &amp; Travels LLP
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-[#5C534A]">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              1. Scope of Agreement
            </h2>
            <p>
              By accessing the services provided by Flyora Tours &amp; Travels
              LLP (&ldquo;Flyora&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) via
              website, concierge consultation, or invoice issuance, you agree to
              comply with and be bound by these Terms &amp; Conditions.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              2. Bookings, Quotations &amp; Confirmation
            </h2>
            <p>
              Quotations provided by our curators are subject to availability
              and currency rate fluctuations until formal booking confirmation.
              A booking is deemed confirmed only after the required advance
              deposit is received and a confirmation voucher with your booking
              reference is issued.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              3. Payments &amp; Settlement
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                All payments must be made in the agreed currency using our
                authorized payment channels.
              </li>
              <li>
                Balance payments for holiday packages and private charters are
                due prior to final voucher release according to schedule.
              </li>
              <li>
                Any bank processing fees or foreign exchange differences remain
                the client&rsquo;s responsibility.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              4. Cancellations &amp; Refunds
            </h2>
            <p>
              Cancellations must be communicated in writing. Refunds are
              governed by underlying vendor policies (airlines, hotels, local
              ground handlers). While Flyora works proactively to secure waivers
              and credits, non-refundable hotel rates or airline cancellation
              charges apply in accordance with partner policies.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              5. Passports, Visas &amp; Health Requirements
            </h2>
            <p>
              Travelers must hold a valid passport (with at least six months
              remaining validity from return date) and appropriate visas for
              international destinations. While Flyora provides expert visa
              guidance and documentation assistance, the granting or rejection
              of visas remains the sole jurisdiction of embassy authorities.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              6. Contact &amp; Assistance
            </h2>
            <p>
              For questions regarding bookings or agreements, contact our
              concierge desk at{" "}
              <a
                href="tel:+919876543210"
                className="text-[#002f89] underline font-medium"
              >
                +91 98765 43210
              </a>{" "}
              or{" "}
              <a
                href="mailto:support@flyora.com"
                className="text-[#002f89] underline font-medium"
              >
                support@flyora.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
