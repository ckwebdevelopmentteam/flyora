"use client";

import React, { useState } from "react";
import {
  Compass,
  Palmtree,
  Plane,
  FileCheck,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  PhoneCall,
  MessageCircle,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { EnquiryModal } from "../components/EnquiryModal";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >(undefined);

  const openEnquiry = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
  };

  const services = [
    {
      title: "Holiday Packages",
      description:
        "Bespoke domestic and international vacation itineraries with handpicked 4★ & 5★ luxury stays.",
      icon: Palmtree,
      tag: "Trending Destinations",
    },
    {
      title: "Visa Assistance",
      description:
        "Fast-track tourist & business visas for Dubai, Schengen, UK, USA, Singapore with expert document screening.",
      icon: FileCheck,
      tag: "99.4% Approval Rate",
    },
    {
      title: "Flight Bookings",
      description:
        "Exclusive corporate and leisure airfares with direct flight coordinator support 24/7.",
      icon: Plane,
      tag: "Best Rate Guarantee",
    },
    {
      title: "Umrah & Hajj Packages",
      description:
        "Spiritual journeys with proximity hotels in Makkah & Madinah, dedicated ground guidance, and transfers.",
      icon: Compass,
      tag: "Sacred Journeys",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Banner */}
      <div className="bg-zinc-900 text-zinc-300 text-[11px] py-2 px-4 text-center font-mono tracking-tight flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>
          Flyora Travels Operations Live: Instant Coordinator Assistance
          Available
        </span>
      </div>

      {/* Navigation */}
      <nav className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider uppercase text-zinc-900">
                Flyora
              </span>
              <span className="text-[10px] text-zinc-400 font-mono -mt-1">
                Travels
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-600">
            <a href="#services" className="hover:text-zinc-900 transition">
              Services
            </a>
            <a href="#why-us" className="hover:text-zinc-900 transition">
              Why Flyora
            </a>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-700 font-mono text-[11px]"
            >
              Staff Portal ↗
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openEnquiry()}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-xs hover:shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Dedicated Service Coordinators For Every Journey</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 mb-6 leading-[1.12]">
            Curated Travel Experiences & Seamless Global Visas
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Directly connect with certified travel coordinators. First-come
            personalized itineraries, direct hotel supplier rates, and verified
            tour packages with zero middleman markups.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-14">
            <button
              onClick={() => openEnquiry()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-sm font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Plan Your Trip Today</span>
            </button>

            <a
              href="https://wa.me/919876543210?text=Hello%20Flyora%20Travels,%20I%20would%20like%20to%20plan%20a%20trip!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Instant WhatsApp</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-zinc-200/80">
            <div className="p-3">
              <p className="text-2xl font-extrabold text-zinc-900 font-mono">
                15 Mins
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Average Response Time
              </p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-extrabold text-zinc-900 font-mono">
                99.4%
              </p>
              <p className="text-xs text-zinc-500 mt-1">Visa Approval Rate</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-extrabold text-zinc-900 font-mono">
                50+
              </p>
              <p className="text-xs text-zinc-500 mt-1">Global Destinations</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-extrabold text-zinc-900 font-mono">
                4.9 ★
              </p>
              <p className="text-xs text-zinc-500 mt-1">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </header>

      {/* Services Grid */}
      <section
        id="services"
        className="py-20 bg-zinc-50/70 border-y border-zinc-200/80"
      >
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
              Our Core Expertise
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Tailored Services For Every Travel Need
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/90 shadow-xs hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-800 flex items-center justify-center transition">
                        <Icon className="w-6 h-6 stroke-[1.75]" />
                      </div>
                      <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {item.tag}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-zinc-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => openEnquiry()}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-900 group-hover:text-black transition"
                  >
                    <span>Request Quotation</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Flyora Section */}
      <section id="why-us" className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-zinc-900 text-white rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 block">
                  The Flyora Difference
                </span>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">
                  No automated bots. Real human coordinators.
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  When you submit an enquiry, our first-come take-lead system
                  assigns a dedicated specialist who contacts you via phone or
                  WhatsApp with genuine local recommendations.
                </p>
              </div>
              <div className="pt-8">
                <button
                  onClick={() => openEnquiry()}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-100 transition"
                >
                  Get in Touch Now
                </button>
              </div>
            </div>

            <div className="p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-zinc-900 mb-2">
                  Transparent Net Rates
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Direct contracts with global destination management companies
                  (DMCs) in Dubai, Bali, Thailand, and Europe to provide fair,
                  guaranteed rates.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-600 mt-6 pt-6 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>No hidden surcharge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified hotel vouchers</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-zinc-900 mb-2">
                  Fast-Track Processing
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Avoid visa delays and booking hiccups. Our coordinators manage
                  your paperwork, appointments, and travel insurance from start
                  to departure.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-600 mt-6 pt-6 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Expedited embassy submissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Flight itinerary confirmations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200/90 py-10 bg-[#FAFAF9]">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-zinc-700" />
            <span className="font-semibold text-zinc-800">Flyora Travels</span>
            <span>— Premium bespoke travel & visa operations</span>
          </div>
          <div className="font-mono text-[11px]">
            © {new Date().getFullYear()} Flyora Travels. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Interactive Modal & Floating WhatsApp */}
      <EnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultServiceId={selectedServiceId}
      />
      <FloatingWhatsApp onOpenEnquiry={() => openEnquiry()} />
    </div>
  );
}
