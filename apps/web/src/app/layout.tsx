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
  title: "Flyora | Find the Perfect Travel Advisor For You",
  description:
    "Match with a hand-picked travel advisor based on your travel needs and preferences. Unlock VIP hotel upgrades, daily breakfast, and custom itineraries.",
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
