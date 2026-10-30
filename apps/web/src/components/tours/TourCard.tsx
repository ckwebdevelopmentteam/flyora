"use client";

import React from "react";
import Link from "next/link";
import {
  Check,
  Clock,
  MapPin,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { PackageSummary } from "@flyora/types";

interface TourCardProps {
  pkg: PackageSummary;
  onCustomize: (packageId: string, packageTitle: string) => void;
}

export const TourCard: React.FC<TourCardProps> = ({ pkg, onCustomize }) => {
  // Format price to Indian Rupee (e.g. ₹64,999)
  const formattedPrice = Number(pkg.startingPrice || 0).toLocaleString("en-IN");

  // Destination tag logic
  const destinationShort = pkg.destination.split(",")[0] || pkg.destination;

  // WhatsApp pre-filled text
  const whatsappText = encodeURIComponent(
    `Hi Flyora Travels, I'm interested in the "${pkg.title}" package (${pkg.durationDays}D/${pkg.durationNights}N). Please send me the complete day-by-day itinerary and pricing for my travel dates.`,
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappText}`;

  return (
    <div className="group bg-white border border-stone-200/90 hover:border-[#4A2E18]/40 hover:shadow-xl hover:shadow-stone-200/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full">
      {/* Photo Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
        <img
          src={pkg.coverImageUrl || "/destinations/dubai.jpg"}
          alt={pkg.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Destination Badge */}
          <span className="bg-white/95 backdrop-blur-md text-stone-900 text-[11px] font-medium px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#4A2E18]" />
            <span>{destinationShort}</span>
          </span>

          {/* Duration Badge in Coffee Brown */}
          <span className="bg-[#4A2E18] text-white text-[11px] font-mono font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#E6D5C7]" />
            <span>
              {pkg.durationNights}N / {pkg.durationDays}D
            </span>
          </span>
        </div>

        {/* Bottom Image Overlay Tags */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          {pkg.isFeatured && (
            <span className="bg-amber-400/90 text-stone-900 font-semibold text-[10px] uppercase font-mono px-2 py-0.5 rounded-full shadow-xs">
              Handpicked
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Title */}
          <div>
            <Link
              href={`/tours/${pkg.slug}`}
              className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#4A2E18] transition line-clamp-1"
            >
              {pkg.title}
            </Link>
            <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate">{pkg.destination}</span>
            </p>
          </div>

          {pkg.inclusions?.length ? (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
              {pkg.inclusions.slice(0, 4).map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50/80 px-2 py-1 rounded-lg"
                >
                  <Check className="w-3.5 h-3.5 text-[#4A2E18] shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Pricing and Action Buttons */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          {/* Price Bar */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                Starting From
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  ₹{formattedPrice}
                </span>
              </div>
            </div>

            <button
              onClick={() => onCustomize(pkg.id, pkg.title)}
              className="text-xs font-semibold text-[#4A2E18] hover:text-[#38200F] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#4A2E18]" />
              <span>Customize</span>
            </button>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* View Itinerary Button in Coffee Brown */}
            <Link
              href={`/tours/${pkg.slug}`}
              className="w-full py-2.5 px-3 rounded-xl bg-[#4A2E18] hover:bg-[#38200F] active:scale-98 text-white text-xs font-semibold text-center shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <span>View Itinerary</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E6D5C7]" />
            </Link>

            {/* Direct WhatsApp Action */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl border border-stone-200 hover:border-emerald-500 text-stone-800 hover:text-emerald-700 bg-white hover:bg-emerald-50/50 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
