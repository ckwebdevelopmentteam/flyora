"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { EnquiryModal } from "../../components/EnquiryModal";
import { FloatingWhatsApp } from "../../components/FloatingWhatsApp";
import {
  Star,
  Globe,
  Plane,
  Train,
  Bus,
  Compass,
  Sparkles,
  Check,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Clock,
  Headphones,
  Award,
  MessageCircle,
} from "lucide-react";

interface ServiceDetail {
  id: string;
  serviceId: string;
  badge: string;
  subtitle: string;
  title: string;
  description: string;
  inclusions: string[];
  ctaText: string;
  imageSrc: string;
  accentColor: string;
  icon: React.ReactNode;
}

const SERVICES_CATALOG: ServiceDetail[] = [
  {
    id: "custom-holidays",
    serviceId: "Custom Holidays",
    badge: "Bespoke Travel",
    subtitle: "Private Itineraries & Luxury Stays",
    title: "Tailored Vacations Crafted Around Your Dream Lifestyle",
    description:
      "No rigid templates or pre-packaged compromises. Whether you envision a private overwater sanctuary in the Maldives, an alpine chalet in the Swiss peaks, or a cultural immersion through Kyoto, our master itinerary planners curate every villa, private transfer, and hidden excursion to match your personal rhythm.",
    inclusions: [
      "Hand-selected 5-star villas, boutique retreats & private chalets",
      "Private chauffeured airport and intercity transfers",
      "Curated VIP dining reservations & off-the-beaten-path experiences",
      "24/7 dedicated personal concierge support throughout your journey",
    ],
    ctaText: "Plan Custom Holiday",
    imageSrc: "/services/custom-holidays.jpg",
    accentColor: "from-amber-600/20 to-amber-700/5",
    icon: <Star className="w-4 h-4 text-amber-600" />,
  },
  {
    id: "visa-assistance",
    serviceId: "Visas",
    badge: "Global Documentation",
    subtitle: "Hassle-Free Approvals for 100+ Countries",
    title: "Effortless Visa Processing with Unmatched Approval Rates",
    description:
      "Navigating consular requirements shouldn't stand between you and your next global journey. Our dedicated visa officers handle document scrutiny, appointment bookings, biometric scheduling, and embassy follow-ups with meticulous attention to detail.",
    inclusions: [
      "End-to-end document verification & error prevention checks",
      "Priority consular appointment scheduling & biometric appointment prep",
      "Express tourist, business, and transit visa facilitation",
      "Real-time status updates and dedicated case manager assistance",
    ],
    ctaText: "Apply for Visa",
    imageSrc: "/services/visa-assistance.jpg",
    accentColor: "from-blue-600/20 to-blue-700/5",
    icon: <Globe className="w-4 h-4 text-blue-600" />,
  },
  {
    id: "flight-booking",
    serviceId: "Flights",
    badge: "Commercial & Business Air",
    subtitle: "Global Airline Network & Best Fares",
    title: "Exclusive Airline Fares & Seamless Multi-City Flight Routing",
    description:
      "Gain access to premier airline alliances, private corporate negotiated rates, and optimized multi-sector flight routes that public search engines overlook. From business class upgrades to large family groups, we ensure every ticket comes with 24/7 rebooking support.",
    inclusions: [
      "Access to corporate partner rates & unpublished special airline fares",
      "Complex multi-city, open-jaw & round-the-world route management",
      "Advance seat assignments, extra baggage & special meal preferences",
      "Instant rebooking and cancellation support during unexpected disruptions",
    ],
    ctaText: "Book Flights",
    imageSrc: "/services/flight-booking.jpg",
    accentColor: "from-sky-600/20 to-sky-700/5",
    icon: <Plane className="w-4 h-4 text-sky-600" />,
  },
  {
    id: "train-booking",
    serviceId: "Trains",
    badge: "Scenic Rail & Express",
    subtitle: "Confirmed Berths & Iconic Scenic Rail",
    title: "Confirmed Railway Reservations & Iconic Rail Experiences",
    description:
      "Experience the timeless romance and scenic majesty of rail journeys without the booking friction. We secure confirmed berths, tatkal bookings, express intercity transit, and tickets for iconic luxury tourist trains across India, Europe, and Asia.",
    inclusions: [
      "Confirmed berth allocation across high-demand express & luxury trains",
      "Tatkal & emergency quota reservation assistance",
      "Family & group bookings with adjacent compartment seating",
      "Live PNR tracking, platform updates & connection guidance",
    ],
    ctaText: "Book Train Tickets",
    imageSrc: "/services/train-booking.jpg",
    accentColor: "from-emerald-600/20 to-emerald-700/5",
    icon: <Train className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: "bus-booking",
    serviceId: "Buses",
    badge: "Highway Comfort",
    subtitle: "Premium AC Volvo & Sleeper Coaches",
    title: "Luxury Volvo Coaches & Dependable Intercity Road Transit",
    description:
      "Connect seamlessly between major cities and picturesque hill stations in total comfort. We partner exclusively with top-tier AC Volvo, sleeper, and luxury multi-axle coach operators known for punctual departures and spotless hygiene.",
    inclusions: [
      "Top-rated multi-axle Volvo & Scania AC sleeper coaches",
      "Verified prime boarding & drop-off lounges with security",
      "Sanitized coaches, onboard charging ports & blankets",
      "Direct e-ticket dispatch and real-time live GPS bus tracking links",
    ],
    ctaText: "Book Bus Journey",
    imageSrc: "/services/bus-booking.jpg",
    accentColor: "from-orange-600/20 to-orange-700/5",
    icon: <Bus className="w-4 h-4 text-orange-600" />,
  },
  {
    id: "umrah-packages",
    serviceId: "Umrah Packages",
    badge: "Sacred Pilgrimage",
    subtitle: "Makkah & Madinah Curated with Care",
    title: "Peaceful & Blessed Umrah Pilgrimages Curated for Comfort",
    description:
      "Embark on your spiritual journey with complete devotion and zero logistical stress. Our Umrah packages combine luxury hotels steps away from the Holy Haram courtyard, fast electronic visa issuance, private AC ground transport, and knowledgeable Ziyarat guides.",
    inclusions: [
      "4-star & 5-star hotels right on the Haram courtyard in Makkah & Madinah",
      "Swift Saudi Umrah e-visa issuance with comprehensive medical cover",
      "Private air-conditioned vehicle transfers between Jeddah, Makkah & Madinah",
      "Historical site Ziyarats led by experienced multilingual guides",
    ],
    ctaText: "Explore Umrah Packages",
    imageSrc: "/services/umrah-packages.jpg",
    accentColor: "from-teal-600/20 to-teal-700/5",
    icon: <Compass className="w-4 h-4 text-teal-600" />,
  },
  {
    id: "hajj-packages",
    serviceId: "Hajj Packages",
    badge: "The Holy Pillar",
    subtitle: "Complete Guided Rites & Premium Camps",
    title: "The Sacred Journey of a Lifetime, Fully Guided & Dignified",
    description:
      "Performing Hajj is a monumental spiritual milestone. Flyora offers end-to-end guidance from official registration and visa management to upgraded European air-conditioned camps in Mina, private inter-ritual transit, and dedicated scholars to guide your rites.",
    inclusions: [
      "Upgraded air-conditioned tents in Mina and Arafat with full board dining",
      "Dedicated Islamic scholars conducting preparatory seminars & daily ritual guidance",
      "Reserved air-conditioned transport connecting all holy ritual stations",
      "24/7 on-ground medical coordination team and dedicated liaison officers",
    ],
    ctaText: "Enquire for Hajj",
    imageSrc: "/services/hajj-packages.jpg",
    accentColor: "from-amber-600/20 to-amber-700/5",
    icon: <Sparkles className="w-4 h-4 text-amber-600" />,
  },
];

const FAQS = [
  {
    question: "How does Flyora customize my vacation itinerary?",
    answer:
      "We begin with a brief consultation to understand your travel dates, preferred destinations, comfort level, and specific interests. A dedicated itinerary designer then crafts a personalized day-by-day plan featuring hand-selected hotels, private transfers, and tailored activities. You review and refine the proposal until it matches your exact vision.",
  },
  {
    question: "How far in advance should I apply for my travel visa?",
    answer:
      "We recommend initiating your visa process at least 4 to 8 weeks prior to your intended departure date, depending on the embassy's processing window. For urgent travel, our visa desk provides express visa assistance and appointment fast-tracking where applicable.",
  },
  {
    question: "Can Flyora handle emergency rebooking or travel disruptions?",
    answer:
      "Yes. Every client has direct access to our 24/7 emergency support desk and personal travel advisor. Whether facing flight cancellations, railway schedule changes, or medical adjustments, our team rebooks flights, coordinates hotel vouchers, and rearranges transfers instantly.",
  },
  {
    question: "What documents are required for Umrah and Hajj packages?",
    answer:
      "Pilgrims require a valid passport with at least 6 months of validity, recent passport-sized photographs with white backgrounds, proof of required vaccinations, and official relationship documentation where applicable. Our pilgrimage desk assists with all Saudi visa applications and regulatory paperwork.",
  },
  {
    question: "Are flight, train, and bus tickets confirmed immediately?",
    answer:
      "Yes. Once your itinerary or route is finalized and confirmed, official e-tickets with airline PNRs, railway berth numbers, or bus boarding vouchers are dispatched directly to your email and WhatsApp with verified booking codes.",
  },
  {
    question: "What payment options and booking protection do you offer?",
    answer:
      "We accept all major credit and debit cards, net banking, UPI, and international bank transfers via secure encrypted gateways. We also provide transparent cancellation policies and optional comprehensive travel insurance to safeguard your investment.",
  },
];

export default function ServicesPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(
    undefined,
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleOpenEnquiry = (serviceId?: string) => {
    setSelectedService(serviceId);
    setEnquiryOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1C1815] selection:bg-[#463D34] selection:text-white">
      {/* Navigation */}
      <Navbar
        activePath="/services"
        onOpenEnquiry={handleOpenEnquiry}
        ctaLabel="Plan My Trip"
      />

      <main className="relative pt-6 sm:pt-10">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center pt-8 sm:pt-14 pb-12 sm:pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-black/[0.06] mb-5">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#463D34] font-medium">
              Comprehensive Concierge Services
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-[#1C1815] leading-[1.12]">
            Curated Travel &amp; Transit Solutions,{" "}
            <span className="italic font-light text-[#5A4F44]">
              Seamlessly Delivered.
            </span>
          </h1>

          <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg font-sans text-[#524941] max-w-3xl mx-auto leading-relaxed">
            From bespoke private holidays and express visa processing to
            flights, scenic rail, luxury highway coaches, and sacred pilgrimages
            — Flyora combines world-class personal concierge care with verified
            travel excellence.
          </p>

          {/* Quick Jump Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {SERVICES_CATALOG.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-[11.5px] font-sans font-medium text-stone-700 hover:text-black hover:border-black/25 hover:bg-stone-50 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                {s.icon}
                <span>{s.serviceId}</span>
              </a>
            ))}
          </div>

          {/* Trust Guarantees Strip */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-black/[0.06] grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-3.5 rounded-xl bg-white/70 border border-black/[0.05] shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 mb-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <h4 className="text-xs font-serif font-bold text-stone-900">
                100+ Global Partners
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Direct airline, embassy &amp; hotel alliances
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 border border-black/[0.05] shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 mb-2.5">
                <Clock className="w-4 h-4 text-blue-700" />
              </div>
              <h4 className="text-xs font-serif font-bold text-stone-900">
                Rapid Turnaround
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Fast e-visa &amp; instant booking ticketing
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 border border-black/[0.05] shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 mb-2.5">
                <Headphones className="w-4 h-4 text-amber-700" />
              </div>
              <h4 className="text-xs font-serif font-bold text-stone-900">
                24/7 Dedicated Care
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Round-the-clock trip &amp; rebooking support
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 border border-black/[0.05] shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 mb-2.5">
                <Award className="w-4 h-4 text-[#463D34]" />
              </div>
              <h4 className="text-xs font-serif font-bold text-stone-900">
                Best Value Guarantee
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Transparent pricing with no hidden surcharges
              </p>
            </div>
          </div>
        </section>

        {/* Alternating Editorial Showcase Sections */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16 sm:space-y-24 py-8 sm:py-12">
          {SERVICES_CATALOG.map((service, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={service.id}
                id={service.id}
                className="scroll-mt-28 p-5 sm:p-8 lg:p-10 rounded-3xl bg-white border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all duration-300"
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center`}
                >
                  {/* Photo Column */}
                  <div
                    className={`lg:col-span-6 relative ${
                      isEven ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="relative h-64 sm:h-80 lg:h-[390px] w-full rounded-2xl overflow-hidden border border-black/[0.08] shadow-md group">
                      <Image
                        src={service.imageSrc}
                        alt={service.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      {/* Floating Badge in photo */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-sans font-semibold uppercase tracking-wider shadow-sm">
                          {service.icon}
                          <span>{service.badge}</span>
                        </span>
                      </div>

                      {/* Bottom Photo Title Accent */}
                      <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                        <p className="text-[11px] font-mono uppercase tracking-widest text-amber-200">
                          {service.subtitle}
                        </p>
                        <p className="text-lg font-serif font-medium mt-0.5">
                          {service.serviceId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Storytelling & Inclusions Content Column */}
                  <div
                    className={`lg:col-span-6 flex flex-col justify-center ${
                      isEven ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-mono font-medium uppercase tracking-[0.18em] text-[#8C7A6B]">
                        Service 0{index + 1} • {service.subtitle}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-serif font-medium text-[#1C1815] leading-snug">
                      {service.title}
                    </h2>

                    <p className="mt-3.5 text-sm sm:text-[15px] font-sans text-[#4A423B] leading-relaxed">
                      {service.description}
                    </p>

                    {/* Inclusions Checklist */}
                    <div className="mt-6 pt-5 border-t border-black/[0.06]">
                      <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-400 mb-3">
                        Key Inclusions &amp; Highlights
                      </h3>
                      <ul className="space-y-2.5">
                        {service.inclusions.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-xs sm:text-[13px] text-stone-700 leading-snug"
                          >
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenEnquiry(service.serviceId)}
                        className="px-5 py-2.5 rounded-lg bg-[#463D34] hover:bg-[#352E27] active:bg-[#2B2520] text-white text-xs font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-xs flex items-center gap-2"
                      >
                        <span>{service.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={`https://wa.me/919876543210?text=Hello%20Flyora,%20I%20am%20interested%20in%20learning%20more%20about%20your%20${encodeURIComponent(
                          service.serviceId,
                        )}%20services.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-lg border border-black/[0.09] text-stone-700 hover:text-emerald-700 hover:border-emerald-500/40 hover:bg-emerald-50/30 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat With Specialist</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* FAQs Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-12 sm:py-20 border-t border-black/[0.06] mt-8">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#8C7A6B] font-medium">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-[#1C1815] mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm font-sans text-stone-500 mt-2 max-w-xl mx-auto">
              Everything you need to know about booking, visa formalities, and
              concierge support.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div
                  key={faq.question}
                  className="rounded-xl border border-black/[0.07] bg-white overflow-hidden transition-all duration-200 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-stone-50/60 transition cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-[15px] font-serif font-medium text-stone-900 leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-black/[0.04] bg-stone-50/30">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-16 sm:pb-24">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#2B2520] via-[#38312B] to-[#1C1815] text-white text-center shadow-xl relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-sans font-medium uppercase tracking-widest text-[#E6D5C7] mb-4">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Ready To Embark</span>
              </span>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal tracking-wide text-white">
                Have a Unique Request or Multi-City Itinerary?
              </h2>

              <p className="mt-3.5 text-xs sm:text-sm text-white/80 font-sans leading-relaxed">
                Connect with our senior travel designers to build a seamless
                custom holiday, coordinate group visas, or book priority
                tickets.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleOpenEnquiry()}
                  className="px-6 py-3 rounded-lg bg-white hover:bg-stone-100 text-stone-900 text-xs font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-md"
                >
                  Request Custom Consultation
                </button>

                <a
                  href="https://wa.me/919876543210?text=Hello%20Flyora,%20I%20have%20a%20custom%20travel%20requirement."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/10 text-white text-xs font-sans font-semibold uppercase tracking-[0.12em] transition flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Quick Action */}
      <FloatingWhatsApp />

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        defaultServiceId={selectedService}
      />
    </div>
  );
}
