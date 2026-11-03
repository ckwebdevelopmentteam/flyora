import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Flyora Tours & Travels LLP",
  description:
    "Learn how Flyora Tours & Travels LLP collects, uses, and protects your personal data and travel information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDF9F5] text-[#1C1815] font-sans antialiased">
      <Navbar activePath="/privacy" />

      <main className="flex-1 max-w-4xl mx-auto px-5 sm:px-8 py-28 sm:py-36">
        <div className="mb-10 text-center sm:text-left border-b border-black/10 pb-8">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#002f89] block mb-2 font-semibold">
            Legal &amp; Transparency
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1C1815] tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-[#7A7167]">
            Last updated: January 2025 • Flyora Tours &amp; Travels LLP
          </p>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-[#5C534A]">
          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              1. Introduction
            </h2>
            <p>
              Flyora Tours &amp; Travels LLP (&ldquo;we&rdquo;,
              &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting
              your privacy and personal data. This Privacy Policy outlines how
              we collect, process, store, and safeguard information provided by
              visitors and clients using our website and concierge booking
              services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Personal Identifiers:</strong> Name, email address,
                contact telephone number, nationality, passport details (only
                when required for airline or visa processing).
              </li>
              <li>
                <strong>Travel Preferences:</strong> Destination choices,
                dietary restrictions, preferred hotels, passenger details, and
                travel dates.
              </li>
              <li>
                <strong>Payment &amp; Transaction Data:</strong> Transaction
                references and billing addresses processed securely via
                certified payment gateways (we never store raw credit card
                numbers).
              </li>
              <li>
                <strong>Technical Details:</strong> Browser type, device
                characteristics, IP address, and cookie identifiers to enhance
                user experience.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              3. How We Use Your Data
            </h2>
            <p>
              We process your personal information strictly for legitimate
              travel facilitation purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                Customizing itineraries and booking flights, accommodations, and
                private tours.
              </li>
              <li>
                Communicating updates, flight itineraries, and visa status
                notifications.
              </li>
              <li>
                Delivering customer support via WhatsApp, telephone, and email.
              </li>
              <li>
                Sending curated promotional updates if you have subscribed to
                our newsletter (you may unsubscribe anytime).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              4. Data Sharing &amp; Third Parties
            </h2>
            <p>
              We only share your data with verified third parties strictly
              necessary to deliver your requested journeys: airline carriers,
              destination management partners, visa authorities, and verified
              luxury hotel partners. We do not sell your personal data to
              marketers or external brokers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1815] font-normal mb-3">
              5. Your Rights &amp; Contact
            </h2>
            <p>
              You have the right to request access, correction, or deletion of
              your personal data at any time. For privacy inquiries, please
              contact our Data Officer at{" "}
              <a
                href="mailto:support@flyora.com"
                className="text-[#002f89] underline font-medium"
              >
                support@flyora.com
              </a>{" "}
              or via our{" "}
              <Link
                href="/contact"
                className="text-[#002f89] underline font-medium"
              >
                Contact Page
              </Link>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
