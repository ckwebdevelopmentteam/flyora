import type { Metadata } from "next";
import { ContactPage } from "./ContactPage";

export const metadata: Metadata = {
  metadataBase: new URL("https://flyora.com"),
  title: "Contact Us | Flyora Tours & Travels",
  description:
    "Talk to Flyora about holidays, flights, hotels, visas and pilgrimage travel. Send an enquiry or get in touch with our team.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Let’s talk about your trip | Flyora",
    description: "A holiday, a flight, a visa. Tell us what you have in mind.",
    url: "/contact",
    type: "website",
    images: [
      {
        url: "/destinations/maldives.jpg",
        width: 1376,
        height: 768,
        alt: "An island getaway with overwater villas",
      },
    ],
  },
};

export default function Page() {
  return <ContactPage />;
}
