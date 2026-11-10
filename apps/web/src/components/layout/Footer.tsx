"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useServicesCatalog } from "../../lib/use-services-catalog";
import { Mail, Phone } from "lucide-react";

export interface FooterProps {
  onOpenEnquiry?: (serviceId?: string) => void;
  onBecomeAdvisor?: () => void;
  className?: string;
}

// Clean SVG icon components matching the exact reference footer
const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YouTubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const Footer: React.FC<FooterProps> = ({
  className = "",
  onOpenEnquiry,
}) => {
  const { services } = useServicesCatalog();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setEmail("");
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  return (
    <footer
      className={`relative z-10 w-full bg-[#FDF8F4] text-[#4A423B] border-t border-[#EBE3D8] pt-10 sm:pt-16 lg:pt-20 pb-4 sm:pb-6 overflow-hidden ${className}`}
    >
      {/* Container aligned with Destinations section padding: px-4 sm:px-10 lg:px-[105px] */}
      <div className="w-full px-4 sm:px-10 lg:px-[105px]">
        {/* ===================================================================
            TOP SECTION: Brand Bio & Newsletter
            =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Brand Intro Column */}
          <div className="lg:col-span-5 space-y-3">
            <Link href="/" className="inline-block group">
              <Image
                src="/flyora-logo.png"
                alt="Flyora Tours & Travels LLP"
                width={190}
                height={58}
                className="h-9 sm:h-11 md:h-12 w-auto object-contain transition-opacity group-hover:opacity-90"
                priority={false}
              />
            </Link>
            <p className="text-xs sm:text-sm text-[#5C534A] leading-relaxed max-w-md font-sans">
              Flyora Tours &amp; Travels LLP is your trusted travel partner,
              creating memorable journeys across India and around the world.
            </p>
          </div>

          {/* Vertical Divider (Desktop) */}
          <div className="hidden lg:flex lg:col-span-1 justify-center">
            <div className="h-20 w-px bg-black/[0.08]" />
          </div>

          {/* Newsletter Column - 60% width on desktop aligned to the right edge */}
          <div className="lg:col-span-6">
            <div className="w-full lg:w-[60%] lg:ml-auto space-y-2.5">
              <h3 className="font-sans font-bold text-base sm:text-lg text-[#1C1815] tracking-tight">
                Subscribe to Our Newsletter
              </h3>

              <form onSubmit={handleSubscribe} className="space-y-2 w-full">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full shadow-2xs">
                  <div className="relative flex-1 flex items-center min-h-[44px] sm:min-h-0 bg-white rounded-md sm:rounded-r-none border border-black/15 focus-within:border-[#002f89] focus-within:ring-1 focus-within:ring-[#002f89] transition">
                    <Mail className="w-4.5 h-4.5 text-neutral-400 ml-3.5 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full py-3 sm:py-2.5 px-3 text-xs sm:text-sm text-[#1C1815] placeholder:text-neutral-400 bg-transparent focus:outline-none"
                      aria-label="Email address for newsletter"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-2 sm:mt-0 px-5 sm:px-7 py-2.5 sm:py-2.5 min-h-[44px] sm:min-h-0 bg-[#002f89] hover:bg-[#00246b] text-white text-xs sm:text-sm font-semibold rounded-md sm:rounded-l-none transition-colors cursor-pointer shrink-0 shadow-xs w-full sm:w-auto"
                  >
                    Subscribe
                  </button>
                </div>

                {isSubscribed && (
                  <p className="text-xs font-medium text-emerald-700">
                    ✓ Thank you for subscribing to Flyora travel updates!
                  </p>
                )}

                <p className="text-[11px] sm:text-xs text-[#7A7167] leading-relaxed">
                  Get travel deals, new package updates, and destination
                  inspiration directly in your inbox.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <hr className="border-t border-black/[0.08] my-8 sm:my-10" />

        {/* ===================================================================
            MIDDLE SECTION: 4 Column Directory with enhanced typography
            =================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* Column 1: Quick Links */}
          <div className="space-y-2.5">
            <h4 className="font-sans font-bold text-sm sm:text-base text-[#1C1815]">
              Quick Links
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[#5C534A]">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/tours"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  Tour Packages
                </Link>
              </li>
              {services.map((service) => (
                <li key={service.id}>
                  {onOpenEnquiry ? (
                    <button
                      type="button"
                      onClick={() => onOpenEnquiry(service.id)}
                      className="hover:text-[#002f89] transition-colors text-left"
                    >
                      {service.name}
                    </button>
                  ) : (
                    <Link
                      href={`/services#${service.slug}`}
                      className="hover:text-[#002f89] transition-colors"
                    >
                      {service.name}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link
                  href="/explore"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Travel Support */}
          <div className="space-y-2.5 md:justify-self-center">
            <h4 className="font-sans font-bold text-sm sm:text-base text-[#1C1815]">
              Travel Support
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[#5C534A]">
              <li>
                <Link
                  href="/#faqs"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  Booking &amp; Payment
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  Cancellation &amp; Refund
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  Travel Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-2.5 md:justify-self-center">
            <h4 className="font-sans font-bold text-sm sm:text-base text-[#1C1815]">
              Company
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[#5C534A]">
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  About Flyora
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#002f89] transition-colors inline-block"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Get in Touch */}
          <div className="space-y-2.5 md:justify-self-end">
            <h4 className="font-sans font-bold text-sm sm:text-base text-[#1C1815]">
              Get in Touch
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#5C534A]">
              <a
                href="mailto:support@flyora.com"
                className="flex items-center gap-2 hover:text-[#002f89] transition-colors group"
              >
                <Mail className="w-4 h-4 text-[#1C1815] shrink-0 group-hover:text-[#002f89] transition-colors" />
                <span>support@flyora.com</span>
              </a>

              <a
                href="tel:+919876543210"
                className="flex items-center gap-2 hover:text-[#002f89] transition-colors group"
              >
                <Phone className="w-4 h-4 text-[#1C1815] shrink-0 group-hover:text-[#002f89] transition-colors" />
                <span>+91 98765 43210</span>
              </a>

              {/* Social Media Circular Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Flyora on WhatsApp"
                  className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center text-neutral-700 hover:text-[#25D366] hover:border-[#25D366] hover:shadow-xs transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Flyora on Instagram"
                  className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center text-neutral-700 hover:text-[#E4405F] hover:border-[#E4405F] hover:shadow-xs transition-all cursor-pointer"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Flyora on Facebook"
                  className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center text-neutral-700 hover:text-[#1877F2] hover:border-[#1877F2] hover:shadow-xs transition-all cursor-pointer"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>

                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Flyora on YouTube"
                  className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center text-neutral-700 hover:text-[#FF0000] hover:border-[#FF0000] hover:shadow-xs transition-all cursor-pointer"
                >
                  <YouTubeIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          BOTTOM SECTION: World Landmarks Illustration taking same padding
          =================================================================== */}
      <div className="w-full px-4 sm:px-10 lg:px-[105px] mt-8 sm:mt-12 overflow-hidden flex justify-center">
        <div className="w-full overflow-hidden flex justify-center">
          <Image
            src="/footer-landmarks.png"
            alt="World travel landmarks illustration"
            width={4096}
            height={552}
            sizes="100vw"
            quality={95}
            className="w-full h-auto object-cover object-bottom select-none pointer-events-none"
            priority={false}
          />
        </div>
      </div>

      <div className="text-center pt-3 pb-2 sm:pb-3 px-4 sm:px-10 lg:px-[105px] text-xs text-[#7A7167]">
        <p>© 2026 Flyora Tours &amp; Travels LLP. All Rights Reserved.</p>
      </div>
    </footer>
  );
};
