"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Sparkles,
  MessageCircle,
  Phone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plane,
  Train,
  Bus,
  Globe,
  Compass,
  Star,
  Info,
  Mail,
  ArrowUpRight,
} from "lucide-react";

export interface NavbarProps {
  onFindAdvisor?: () => void;
  onBecomeAdvisor?: () => void;
  onOpenEnquiry?: (serviceId?: string) => void;
  activePath?: string;
  isFixed?: boolean;
  className?: string;
  ctaLabel?: string;
  // Backwards compatibility props (no-op since search bar is replaced)
  alwaysShowSearch?: boolean;
  defaultSearchOpen?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  serviceId?: string;
}

export interface ServiceItem {
  label: string;
  description: string;
  serviceId: string;
  badge: string;
  imageSrc: string;
  href: string;
  icon: React.ReactNode;
}

// Top-level nav items (flat links)
export const NAV_ITEMS: NavItem[] = [
  { label: "Tour Packages", href: "/tours" },
];

// All 7 Services with matched high-quality image backgrounds & direct dedicated page section links
export const SERVICE_ITEMS: ServiceItem[] = [
  {
    label: "Custom Holidays",
    description: "Bespoke itineraries crafted around your dream travel style",
    serviceId: "Custom Holidays",
    badge: "Tailored Luxury",
    imageSrc: "/services/custom-holidays.jpg",
    href: "/services#custom-holidays",
    icon: <Star className="w-3.5 h-3.5 text-amber-300" />,
  },
  {
    label: "Visa Assistance",
    description:
      "Hassle-free document verification & processing for 100+ countries",
    serviceId: "Visas",
    badge: "Fast & Seamless",
    imageSrc: "/services/visa-assistance.jpg",
    href: "/services#visa-assistance",
    icon: <Globe className="w-3.5 h-3.5 text-blue-300" />,
  },
  {
    label: "Flight Booking",
    description:
      "Best fare routes, corporate travel & 24/7 dedicated flight support",
    serviceId: "Flights",
    badge: "Best Fares",
    imageSrc: "/services/flight-booking.jpg",
    href: "/services#flight-booking",
    icon: <Plane className="w-3.5 h-3.5 text-sky-300" />,
  },
  {
    label: "Train Booking",
    description:
      "Express reservations, luxury tourist rails & scenic train journeys",
    serviceId: "Trains",
    badge: "Scenic Rail",
    imageSrc: "/services/train-booking.jpg",
    href: "/services#train-booking",
    icon: <Train className="w-3.5 h-3.5 text-emerald-300" />,
  },
  {
    label: "Bus Booking",
    description:
      "Premium AC Volvo, sleeper coaches & dependable intercity road transit",
    serviceId: "Buses",
    badge: "Highway Comfort",
    imageSrc: "/services/bus-booking.jpg",
    href: "/services#bus-booking",
    icon: <Bus className="w-3.5 h-3.5 text-orange-300" />,
  },
  {
    label: "Umrah Packages",
    description:
      "Sacred pilgrimages with premium close-to-Haram accommodation & guidance",
    serviceId: "Umrah Packages",
    badge: "Spiritual Journey",
    imageSrc: "/services/umrah-packages.jpg",
    href: "/services#umrah-packages",
    icon: <Compass className="w-3.5 h-3.5 text-teal-300" />,
  },
  {
    label: "Hajj Packages",
    description:
      "Comprehensive blessed pilgrimage with deluxe Mina camps & sacred guidance",
    serviceId: "Hajj Packages",
    badge: "Sacred Pilgrimage",
    imageSrc: "/services/hajj-packages.jpg",
    href: "/services#hajj-packages",
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-300" />,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  onFindAdvisor,
  onBecomeAdvisor,
  onOpenEnquiry,
  activePath = "",
  isFixed = false,
  className = "",
  ctaLabel = "Plan My Trip",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicePage, setServicePage] = useState(0); // 0 = first 4 cards, 1 = next 3 cards

  const servicesTriggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hover handlers with debounce to allow smooth cursor transition between trigger & dropdown
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setServicesOpen(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 200);
  };

  // Close services dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        servicesTriggerRef.current &&
        !servicesTriggerRef.current.contains(e.target as Node)
      ) {
        setServicesOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setServicesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    setMobileMenuOpen(false);
    setServicesOpen(false);

    if (item.serviceId && onOpenEnquiry) {
      e.preventDefault();
      onOpenEnquiry(item.serviceId);
      return;
    }

    if (item.href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleCtaClick = () => {
    if (onOpenEnquiry) {
      onOpenEnquiry();
    } else if (onFindAdvisor) {
      onFindAdvisor();
    } else if (onBecomeAdvisor) {
      onBecomeAdvisor();
    }
  };

  const isServicesActive =
    activePath === "/services" ||
    activePath.startsWith("/services") ||
    activePath === "/#services";

  // Reusable single service card component linking directly to dedicated section
  const renderServiceCard = (service: ServiceItem, isThreeCol = false) => (
    <Link
      key={service.serviceId}
      href={service.href}
      onClick={() => {
        setServicesOpen(false);
        setMobileMenuOpen(false);
      }}
      className="group relative h-48 sm:h-52 lg:h-56 w-full rounded-xl overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-[#463D34] focus:ring-offset-2 transition-all duration-300 transform-gpu hover:-translate-y-1 hover:shadow-xl cursor-pointer block"
    >
      {/* Background Image */}
      <Image
        src={service.imageSrc}
        alt={service.label}
        fill
        sizes={
          isThreeCol
            ? "(max-width: 1024px) 50vw, 33vw"
            : "(max-width: 1024px) 50vw, 25vw"
        }
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />

      {/* High contrast gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 group-hover:from-black/95 group-hover:via-black/35 transition-colors duration-300" />

      {/* Border accent */}
      <div className="absolute inset-0 rounded-xl border border-white/15 group-hover:border-white/35 transition-colors pointer-events-none" />

      {/* Card Content Overlay */}
      <div className="relative h-full p-4 sm:p-5 flex flex-col justify-between z-10">
        {/* Top: Category Tag Badge & Action Arrow */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-[10px] font-sans font-medium uppercase tracking-wider text-white">
            {service.icon}
            <span>{service.badge}</span>
          </span>
          <span className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white/90 group-hover:bg-white group-hover:text-stone-900 group-hover:rotate-45 transition-all duration-300">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Bottom: Service Name, Description & CTA */}
        <div>
          <h3 className="text-white text-[16px] sm:text-[17px] lg:text-[22px] font-serif font-bold tracking-wide leading-tight group-hover:text-[#F3E8DE] transition-colors">
            {service.label}
          </h3>
          <p className="text-white/80 text-[11px] sm:text-[11.5px] line-clamp-2 mt-1 leading-snug">
            {service.description}
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-[10.5px] font-sans font-semibold uppercase tracking-[0.12em] text-[#E6D5C7] group-hover:text-white transition-colors">
            <span>Explore Service</span>
            <span className="text-xs transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <header
      className={`${
        isFixed ? "fixed top-4 sm:top-6 inset-x-0" : "sticky top-3 sm:top-5"
      } z-50 px-4 sm:px-5 w-full max-w-[1360px] mx-auto pointer-events-none transition-all duration-300 ${className}`}
    >
      {/* Floating Glassmorphic Navbar Card */}
      <div
        className={`pointer-events-auto relative bg-white/95 backdrop-blur-md rounded-2xl border border-black/[0.07] transition-all duration-300 ${
          isScrolled
            ? "shadow-[0_12px_36px_rgb(0,0,0,0.12)] bg-white"
            : "shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
        }`}
      >
        <div className="h-16 px-5 sm:px-7 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2 select-none shrink-0"
          >
            <span className="font-serif text-[22px] sm:text-[24px] font-normal tracking-[0.2em] text-[#1C1815] uppercase transition-opacity group-hover:opacity-85">
              FLYORA
            </span>
          </Link>

          {/* Center: Nav Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-5 lg:gap-7 xl:gap-8"
          >
            {/* Tour Packages — flat link */}
            {NAV_ITEMS.map((item) => {
              const isActive =
                activePath === item.href ||
                (item.href === "/tours" && activePath.startsWith("/tours"));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`text-[11.5px] lg:text-[12px] font-sans font-medium uppercase tracking-[0.14em] transition-colors py-1 relative select-none ${
                    isActive
                      ? "text-[#1C1815] font-semibold"
                      : "text-[#4A423B] hover:text-black"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#463D34] rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Services — hover & click dropdown trigger */}
            <div
              ref={servicesTriggerRef}
              data-testid="services-trigger"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative py-2"
            >
              <button
                type="button"
                onClick={() => setServicesOpen((prev) => !prev)}
                className={`flex items-center gap-1 text-[11.5px] lg:text-[12px] font-sans font-medium uppercase tracking-[0.14em] transition-colors py-1 select-none cursor-pointer ${
                  isServicesActive || servicesOpen
                    ? "text-[#1C1815] font-semibold"
                    : "text-[#4A423B] hover:text-black"
                }`}
                aria-haspopup="true"
                aria-expanded={servicesOpen}
              >
                Services
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    servicesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* About — link to dedicated /about page */}
            <Link
              href="/about"
              className={`text-[11.5px] lg:text-[12px] font-sans font-medium uppercase tracking-[0.14em] transition-colors py-1 relative select-none ${
                activePath === "/about"
                  ? "text-[#1C1815] font-semibold"
                  : "text-[#4A423B] hover:text-black"
              }`}
            >
              About
              {activePath === "/about" && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#463D34] rounded-full" />
              )}
            </Link>

            {/* Contact — link to homepage section */}
            <Link
              href="/#contact"
              className="text-[11.5px] lg:text-[12px] font-sans font-medium uppercase tracking-[0.14em] transition-colors py-1 relative select-none text-[#4A423B] hover:text-black"
            >
              Contact
            </Link>
          </nav>

          {/* Right: Quick actions + CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* WhatsApp Quick Chat */}
            <a
              href="https://wa.me/919876543210?text=Hi%20Flyora%20Travels,%20I%20am%20looking%20for%20a%20customized%20tour%20package."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-md border border-black/[0.08] text-[#38312B] hover:text-emerald-700 hover:border-emerald-500/50 hover:bg-emerald-50/40 text-[11px] font-medium transition cursor-pointer"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Primary Action Button */}
            <button
              onClick={handleCtaClick}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-md bg-[#463D34] hover:bg-[#352E27] active:bg-[#2B2520] text-white text-[11px] sm:text-[11.5px] font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1.5"
            >
              <span>{ctaLabel}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="md:hidden p-1.5 rounded-lg text-[#38312B] hover:text-black hover:bg-zinc-100 transition cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[1.75]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[1.75]" />
              )}
            </button>
          </div>
        </div>

        {/* Full-Width Services Dropdown Box Modal (Desktop) */}
        {servicesOpen && (
          <div
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="hidden md:block absolute top-[calc(100%+8px)] inset-x-0 w-full bg-white/95 backdrop-blur-xl rounded-2xl border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.14)] p-4 sm:p-5 lg:p-6 transition-all duration-300 animate-in fade-in slide-in-from-top-2 z-50 before:content-[''] before:absolute before:-top-3 before:inset-x-0 before:h-3"
          >
            {/* Modal Header: Title on Left, Carousel Arrows on Right */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-stone-800">
                  Flyora Travel Services
                </span>
                <span className="text-[10px] font-mono text-stone-400 px-2 py-0.5 rounded-full bg-stone-100">
                  {servicePage === 0 ? "1 - 4 of 7" : "5 - 7 of 7"}
                </span>
              </div>

              {/* Left and Right Arrow Navigation */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  data-testid="services-prev-arrow"
                  onClick={() => setServicePage(0)}
                  disabled={servicePage === 0}
                  aria-label="Previous services"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/10 flex items-center justify-center transition-all ${
                    servicePage === 0
                      ? "opacity-25 cursor-not-allowed text-stone-400 pointer-events-none bg-stone-50"
                      : "opacity-100 cursor-pointer text-stone-700 hover:bg-stone-100 hover:text-black active:scale-95 shadow-xs"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  data-testid="services-next-arrow"
                  onClick={() => setServicePage(1)}
                  disabled={servicePage === 1}
                  aria-label="Next services"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/10 flex items-center justify-center transition-all ${
                    servicePage === 1
                      ? "opacity-25 cursor-not-allowed text-stone-400 pointer-events-none bg-stone-50"
                      : "opacity-100 cursor-pointer text-stone-700 hover:bg-stone-100 hover:text-black active:scale-95 shadow-xs"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carousel Content (7 Cards Across 2 Slides) */}
            <div className="overflow-hidden w-full">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${servicePage * 100}%)` }}
              >
                {/* Slide 1: First 4 Cards */}
                <div className="w-full shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  {SERVICE_ITEMS.slice(0, 4).map((service) =>
                    renderServiceCard(service, false),
                  )}
                </div>

                {/* Slide 2: Next 3 Cards */}
                <div className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {SERVICE_ITEMS.slice(4, 7).map((service) =>
                    renderServiceCard(service, true),
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Bar: Link to Dedicated Guide + Pagination Dots */}
            <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-black/[0.05]">
              <Link
                href="/services"
                onClick={() => setServicesOpen(false)}
                className="text-[11px] font-sans font-semibold text-stone-600 hover:text-black uppercase tracking-wider transition-colors flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Explore Dedicated Services Guide</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-stone-400 group-hover:text-black" />
              </Link>

              {/* Pagination Dots (2 Dots) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="services-dot-0"
                  onClick={() => setServicePage(0)}
                  aria-label="Page 1: First 4 services"
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    servicePage === 0
                      ? "w-7 bg-[#463D34]"
                      : "w-2 bg-stone-300 hover:bg-stone-400"
                  }`}
                />
                <button
                  type="button"
                  data-testid="services-dot-1"
                  onClick={() => setServicePage(1)}
                  aria-label="Page 2: Next 3 services"
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    servicePage === 1
                      ? "w-7 bg-[#463D34]"
                      : "w-2 bg-stone-300 hover:bg-stone-400"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/[0.06] px-5 py-4 bg-white/98 backdrop-blur-md rounded-b-2xl animate-in slide-in-from-top-2 duration-200 space-y-1">
            {/* Tour Packages */}
            {NAV_ITEMS.map((item) => {
              const isActive =
                activePath === item.href ||
                (item.href === "/tours" && activePath.startsWith("/tours"));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center gap-2 text-left text-xs font-sans font-medium uppercase tracking-[0.14em] py-2.5 px-1 transition-colors border-b border-black/[0.04] ${
                    isActive
                      ? "text-[#1C1815] font-semibold"
                      : "text-[#38312B] hover:text-black"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-stone-400" />
                  {item.label}
                </Link>
              );
            })}

            {/* Services expandable section */}
            <div>
              <button
                type="button"
                onClick={() => setMobileServicesOpen((p) => !p)}
                className="w-full flex items-center justify-between gap-2 text-left text-xs font-sans font-medium uppercase tracking-[0.14em] py-2.5 px-1 text-[#38312B] hover:text-black transition-colors border-b border-black/[0.04] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-stone-400" />
                  Services ({SERVICE_ITEMS.length})
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    mobileServicesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="mt-2.5 mb-2 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-150 max-h-[380px] overflow-y-auto pr-1">
                  {SERVICE_ITEMS.map((service) => (
                    <Link
                      key={service.serviceId}
                      href={service.href}
                      onClick={() => {
                        setServicesOpen(false);
                        setMobileMenuOpen(false);
                      }}
                      className="relative h-24 rounded-xl overflow-hidden text-left p-3 flex flex-col justify-end group border border-black/10 cursor-pointer shadow-xs shrink-0 block"
                    >
                      <Image
                        src={service.imageSrc}
                        alt={service.label}
                        fill
                        sizes="100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
                      <div className="relative z-10">
                        <div className="text-[12.5px] font-medium font-serif text-white flex items-center justify-between">
                          <span>{service.label}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
                        </div>
                        <div className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                          {service.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 text-left text-xs font-sans font-medium uppercase tracking-[0.14em] py-2.5 px-1 transition-colors border-b border-black/[0.04] ${
                activePath === "/about"
                  ? "text-[#1C1815] font-semibold"
                  : "text-[#38312B] hover:text-black"
              }`}
            >
              <Info className="w-3.5 h-3.5 text-stone-400" />
              About
            </Link>

            {/* Contact */}
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-left text-xs font-sans font-medium uppercase tracking-[0.14em] py-2.5 px-1 text-[#38312B] hover:text-black transition-colors border-b border-black/[0.04]"
            >
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              Contact
            </Link>

            {/* Bottom action area */}
            <div className="pt-3 border-t border-zinc-100 space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCtaClick();
                }}
                className="w-full py-2.5 rounded-md bg-[#463D34] hover:bg-[#352E27] text-white text-xs font-semibold uppercase tracking-[0.12em] transition text-center flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E6D5C7]" />
                <span>{ctaLabel}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                <a
                  href="https://wa.me/919876543210?text=Hello%20Flyora%20Travels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="tel:+919876543210"
                  className="py-2 px-3 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Desk</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
