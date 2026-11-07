import type { Metadata } from "next";

export const quoteMetadata: Metadata = {
  title: "Flyora Travels — Your Custom Quotation",
  description:
    "View your customized travel proposal and itinerary prepared by Flyora Travels.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
    },
  },
  referrer: "no-referrer",
  openGraph: {
    title: "Flyora Travels — Your Custom Quotation",
    description:
      "Your personalized travel proposal, prepared by Flyora Travels.",
    siteName: "Flyora Travels",
    type: "website",
  },
};
