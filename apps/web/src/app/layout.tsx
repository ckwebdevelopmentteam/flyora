import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "1000",
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flyora Tours & Travels | Curated Holidays, Flights & Visa Services",
  description:
    "Custom tour packages, confirmed flights, visa assistance, and luxury stays across India and the world. Built around you since 2014.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
