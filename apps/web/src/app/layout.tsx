import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import { NavigationScrollHandler } from "../components/NavigationScrollHandler";

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
  icons: {
    icon: "/flyora-logo.png",
    shortcut: "/flyora-logo.png",
    apple: "/flyora-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable}`}>
      <body>
        <NavigationScrollHandler />
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
