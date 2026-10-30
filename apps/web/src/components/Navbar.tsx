"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useServicesCatalog } from "../lib/use-services-catalog";
import { serviceImage, serviceDescription } from "../lib/service-visuals";
import {
  Menu,
  X,
  Sparkles,
  MessageCircle,
  Phone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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

export const Navbar: React.FC<NavbarProps> = ({
  onFindAdvisor,
  onBecomeAdvisor,
  onOpenEnquiry,
  activePath = "",
  isFixed = false,
  className = "",
  ctaLabel = "Plan My Trip",
}) => {
  const {
    services,
    loaded: servicesLoaded,
    error: servicesError,
    retry: retryServices,
  } = useServicesCatalog();
  const serviceItems: ServiceItem[] = services.map((service) => ({
    label: service.name,
    description: serviceDescription(service),
    serviceId: service.id,
    badge: "Travel services",
    imageSrc: serviceImage(service.slug),
    href: `/services#${service.slug}`,
    icon: <Compass className="w-4 h-4" />,
  }));
  const pageCount = Math.max(1, Math.ceil(serviceItems.length / 4));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicePage, setServicePage] = useState(0);

  const currentPage = Math.min(servicePage, pageCount - 1);

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

  const selectService = (
    event: React.MouseEvent<HTMLAnchorElement>,
    service: ServiceItem,
  ) => {
    setServicesOpen(false);
    setMobileMenuOpen(false);
    if (
      window.location.pathname === "/services" &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      window.history.pushState(null, "", service.href);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };
  // Reusable single service card component linking directly to dedicated section
  const renderServiceCard = (service: ServiceItem, isThreeCol = false) => (
    <Link
      key={service.serviceId}
      href={service.href}
      onClick={(event) => selectService(event, service)}
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
                onClick={handleMouseEnter}
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

            {/* Contact */}
            <Link
              href="/contact"
              aria-current={activePath === "/contact" ? "page" : undefined}
              className={`text-[11.5px] lg:text-[12px] font-sans font-medium uppercase tracking-[0.14em] transition-colors py-1 relative select-none ${activePath === "/contact" ? "text-[#1C1815] font-semibold border-b-2 border-[#463D34]" : "text-[#4A423B] hover:text-black"}`}
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
                  {serviceItems.length
                    ? `${currentPage * 4 + 1} – ${Math.min((currentPage + 1) * 4, serviceItems.length)} of ${serviceItems.length}`
                    : ""}
                </span>
              </div>

              {/* Left and Right Arrow Navigation */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  data-testid="services-prev-arrow"
                  onClick={() => setServicePage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  aria-label="Previous services"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/10 flex items-center justify-center transition-all ${
                    currentPage === 0
                      ? "opacity-25 cursor-not-allowed text-stone-400 pointer-events-none bg-stone-50"
                      : "opacity-100 cursor-pointer text-stone-700 hover:bg-stone-100 hover:text-black active:scale-95 shadow-xs"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  data-testid="services-next-arrow"
                  onClick={() =>
                    setServicePage(Math.min(pageCount - 1, currentPage + 1))
                  }
                  disabled={currentPage === pageCount - 1}
                  aria-label="Next services"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/10 flex items-center justify-center transition-all ${
                    currentPage === pageCount - 1
                      ? "opacity-25 cursor-not-allowed text-stone-400 pointer-events-none bg-stone-50"
                      : "opacity-100 cursor-pointer text-stone-700 hover:bg-stone-100 hover:text-black active:scale-95 shadow-xs"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!servicesLoaded && (
              <p role="status" className="py-8 text-sm text-stone-500">
                Loading services…
              </p>
            )}
            {servicesError && (
              <p role="alert" className="py-4 text-sm text-stone-600">
                We couldn’t refresh services.{" "}
                <button
                  onClick={() => void retryServices()}
                  className="underline"
                >
                  Try again
                </button>
              </p>
            )}
            {servicesLoaded && !servicesError && !serviceItems.length && (
              <p className="py-8 text-sm text-stone-500">
                Our services will be available soon.
              </p>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {serviceItems
                .slice(currentPage * 4, currentPage * 4 + 4)
                .map((service) => renderServiceCard(service))}
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

              <div className="flex items-center gap-2">
                {Array.from({ length: pageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    data-testid={`services-dot-${index}`}
                    onClick={() => setServicePage(index)}
                    aria-label={`Service page ${index + 1}`}
                    aria-current={index === currentPage ? "page" : undefined}
                    className={`h-2 rounded-full transition-all ${index === currentPage ? "w-7 bg-[#463D34]" : "w-2 bg-stone-300"}`}
                  />
                ))}
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
                  Services ({serviceItems.length})
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    mobileServicesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="mt-2.5 mb-2 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-150 max-h-[380px] overflow-y-auto pr-1">
                  {serviceItems.map((service) => (
                    <Link
                      key={service.serviceId}
                      href={service.href}
                      onClick={(event) => selectService(event, service)}
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
              href="/contact"
              aria-current={activePath === "/contact" ? "page" : undefined}
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
