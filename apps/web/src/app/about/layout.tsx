import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://flyora.com"),
  title: "About Us | Flyora — Curated Bespoke Luxury Journeys",
  description:
    "Discover Flyora's story, values, and passion for creating thoughtful, extraordinary travel experiences across the globe. Built around you.",
  openGraph: {
    title: "About Us | Flyora Tours & Travels",
    description:
      "At Flyora, we believe every journey opens the door to new places, meaningful experiences, and stories worth remembering.",
    url: "https://flyora.com/about",
    siteName: "Flyora Tours & Travels",
    images: [
      {
        url: "/about/hero-travel.jpg",
        width: 1200,
        height: 630,
        alt: "Flyora Luxury Travel Inspiration",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
