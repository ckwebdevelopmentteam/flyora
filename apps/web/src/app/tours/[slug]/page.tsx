"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Building2,
  Utensils,
  CheckCircle2,
  XCircle,
  MessageCircle,
  ArrowLeft,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calendar,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { EnquiryModal } from "../../../components/EnquiryModal";
import { FloatingWhatsApp } from "../../../components/FloatingWhatsApp";
import type { PackageDetails } from "@flyora/types";

export default function TourDetailPage() {
  const params = useParams();
  const currentSlug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0] || ""
        : "";
  return <TourDetails key={currentSlug} currentSlug={currentSlug} />;
}

function TourDetails({ currentSlug }: { currentSlug: string }) {
  const [pkg, setPkg] = useState<Partial<PackageDetails> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [openDays, setOpenDays] = useState<Record<number, boolean>>({
    1: true,
  });
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryService, setEnquiryService] = useState<string>();
  const [selectedImage, setSelectedImage] = useState<string>();
  const openEnquiry = (service?: string) => {
    setEnquiryService(service);
    setIsEnquiryOpen(true);
  };

  useEffect(() => {
    const controller = new AbortController();
    async function loadDetails() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(
          `${apiUrl}/packages/${encodeURIComponent(currentSlug)}`,
          {
            cache: "no-store",
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(15000),
            ]),
          },
        );
        if (res.status === 404) {
          if (!controller.signal.aborted)
            setLoadError("This package is no longer available.");
          return;
        }
        const json = await res.json();
        if (!res.ok || !json.data?.id || !json.data?.serviceId)
          throw new Error();
        if (!controller.signal.aborted) setPkg(json.data);
      } catch {
        if (!controller.signal.aborted)
          setLoadError("We couldn’t load this package. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadDetails();
    return () => controller.abort();
  }, [currentSlug, attempt]);

  const toggleDay = (dayNum: number) => {
    setOpenDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const expandAllDays = () => {
    if (!pkg?.itinerary) return;
    const all: Record<number, boolean> = {};
    pkg.itinerary.forEach((item) => {
      all[item.day] = true;
    });
    setOpenDays(all);
  };

  const collapseAllDays = () => {
    setOpenDays({});
  };

  if (!pkg) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-stone-900">
          {loading ? "Loading itinerary…" : loadError}
        </h2>
        {!loading && (
          <>
            <button
              onClick={() => {
                setLoading(true);
                setLoadError("");
                setAttempt((n) => n + 1);
              }}
            >
              Try again
            </button>
            <Link href="/tours">View all packages</Link>
          </>
        )}
      </div>
    );
  }

  const photos = [
    ...new Set(
      [pkg.coverImageUrl, ...(pkg.galleryImageUrls || [])].filter(
        (url): url is string => !!url,
      ),
    ),
  ];
  const formattedPrice = Number(pkg.startingPrice || 0).toLocaleString("en-IN");
  const whatsappText = encodeURIComponent(
    `Hi Flyora Travels, I'm reviewing the "${pkg.title}" package on your website. I want to customize this trip and get an official quotation.`,
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-[#4A2E18] selection:text-white">
      {/* Navbar */}
      <Navbar activePath="/tours" onOpenEnquiry={openEnquiry} />

      {/* Main Container (Wider than Navbar like Homepage Image Section: 1440px) */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Link & Breadcrumb */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-200/80">
          <Link
            href="/tours"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A2E18] hover:text-[#38200F] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tours</span>
          </Link>

          <span className="text-xs font-mono text-stone-400">
            Package Ref: {pkg.slug}
          </span>
        </div>

        {/* Hero Banner Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Columns: Photos & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Cover Image */}
            <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden bg-stone-100 shadow-md">
              <Image
                unoptimized
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                src={
                  selectedImage || photos[0] || "/services/custom-holidays.jpg"
                }
                alt={pkg.title || "Tour Cover"}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="bg-white/95 backdrop-blur-md text-stone-900 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4A2E18]" />
                  <span>{pkg.destination}</span>
                </span>

                <span className="bg-[#4A2E18] text-white text-xs font-mono font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                  {pkg.durationNights} Nights / {pkg.durationDays} Days
                </span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="bg-emerald-500/90 text-white font-mono text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full">
                  {pkg.serviceName}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-xs">
                  {pkg.title}
                </h1>
              </div>
            </div>

            {photos.length > 1 && (
              <div
                className="flex gap-3 overflow-x-auto pb-1"
                aria-label="Package photos"
              >
                {photos.map((photo, index) => (
                  <button
                    key={photo}
                    type="button"
                    aria-label={`View photo ${index + 1}`}
                    aria-pressed={(selectedImage || photos[0]) === photo}
                    onClick={() => setSelectedImage(photo)}
                    className="relative w-24 h-16 shrink-0 overflow-hidden rounded-lg border-2 border-stone-200 aria-pressed:border-[#4A2E18]"
                  >
                    <Image
                      unoptimized
                      fill
                      sizes="96px"
                      src={photo}
                      alt={`${pkg.title} photo ${index + 1}`}
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-50 border border-stone-200/90 rounded-2xl p-4">
              {[
                {
                  label: "Duration",
                  value: `${pkg.durationDays} Days / ${pkg.durationNights} Nights`,
                },
                { label: "Destination", value: pkg.destination },
                { label: "Service", value: pkg.serviceName },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text-[10px] text-stone-400 font-mono uppercase">
                    {item.label}
                  </p>
                  <p className="text-xs font-bold text-stone-900 break-words">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Overview Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                Trip Overview
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                {pkg.overview}
              </p>
            </div>

            {/* Day-by-Day Expandable Itinerary */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                    Day-by-Day Itinerary
                  </h2>
                  <p className="text-xs text-stone-500">
                    Detailed daily plan designed by destination specialists
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#4A2E18]">
                  <button
                    onClick={expandAllDays}
                    className="hover:underline py-1 px-2"
                  >
                    Expand All
                  </button>
                  <span>•</span>
                  <button
                    onClick={collapseAllDays}
                    className="hover:underline py-1 px-2 text-stone-500"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Itinerary Accordion List */}
              <div className="space-y-3">
                {pkg.itinerary?.map((item) => {
                  const isOpen = !!openDays[item.day];
                  return (
                    <div
                      key={item.day}
                      className="border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs transition"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleDay(item.day)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-stone-50/70 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-[#4A2E18] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
                            Day {item.day}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-stone-900">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-500">
                              {item.stay && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-[#4A2E18]" />
                                  <span>{item.stay}</span>
                                </span>
                              )}
                              {item.meals && (
                                <span className="flex items-center gap-1">
                                  <Utensils className="w-3 h-3 text-[#4A2E18]" />
                                  <span>{item.meals}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-1 rounded-full text-stone-400">
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 border-t border-stone-100 bg-stone-50/30 leading-relaxed">
                          {item.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inclusions & Exclusions Grid */}
            <div className="pt-6 border-t border-stone-100 space-y-4">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                What&apos;s Included &amp; Excluded
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inclusions Card */}
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Inclusions (Confirmed)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-700">
                    {pkg.inclusions?.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclusions Card */}
                <div className="bg-rose-50/30 border border-rose-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider font-mono">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Exclusions</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-600">
                    {pkg.exclusions?.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Column: Sticky Booking Widget (Coffee Brown) */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border-2 border-[#4A2E18]/20 rounded-3xl p-6 shadow-xl space-y-6">
              {/* Pricing Header */}
              <div className="space-y-1 pb-5 border-b border-stone-100">
                <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
                  Starting price
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-stone-900 tracking-tight">
                    ₹{formattedPrice}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Final price depends on your travel dates.</span>
                </p>
              </div>

              {/* Action Buttons in Coffee Brown & Emerald */}
              <div className="space-y-3">
                {/* Primary Button in Coffee Brown */}
                <button
                  onClick={() => openEnquiry()}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#4A2E18] hover:bg-[#38200F] active:scale-98 text-white text-xs sm:text-sm font-semibold text-center shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#E6D5C7]" />
                  <span>Customize &amp; Book Trip</span>
                </button>

                {/* Direct WhatsApp CTA */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl border-2 border-emerald-500 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70 active:scale-98 text-xs sm:text-sm font-semibold text-center transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Direct Travel Coordinator Promise */}
              <div className="pt-4 border-t border-stone-100 space-y-3 text-xs text-stone-600">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#4A2E18] shrink-0" />
                  <span>1-on-1 Assigned Travel Coordinator</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#4A2E18] shrink-0" />
                  <span>Flexible Dates &amp; Instant Fare Locks</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-[#4A2E18] shrink-0" />
                  <span>Official GST Invoices &amp; Offline Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reusable Public Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        defaultServiceId={enquiryService || pkg.serviceId}
        defaultPackageId={enquiryService ? undefined : pkg.id}
        packageTitle={enquiryService ? undefined : pkg.title}
      />

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp />

      {/* Footer */}
      <Footer onOpenEnquiry={openEnquiry} />
    </div>
  );
}
