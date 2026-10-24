import type { Metadata } from "next";

// Customer names, balances and booking references stay out of link previews.
export const bookingMetadata: Metadata = {
  title: "Flyora Travels — Your Trip Voucher",
  description:
    "Your travel itinerary and verified payment summary, prepared by Flyora Travels.",
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
    title: "Flyora Travels — Your Trip Voucher",
    description: "Your personal travel voucher from Flyora Travels.",
    siteName: "Flyora Travels",
    type: "website",
  },
};
