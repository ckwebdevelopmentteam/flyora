"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { JourneyCTA } from "../../components/JourneyCTA";
import { BecomeAdvisorModal } from "../../components/BecomeAdvisorModal";
import { ContactForm, type ContactFormHandle } from "./ContactForm";
import styles from "./ContactPage.module.css";

// Placeholder business details, kept consistent with the existing footer.
export const CONTACT = {
  phone: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  email: "concierge@flyora.com",
  address: "Flyora Travels Tower, Suite 402, High Street Plaza",
  city: "Kochi, Kerala",
  whatsapp:
    "https://wa.me/919876543210?text=Hello%20Flyora%2C%20I%27d%20like%20to%20plan%20a%20trip.",
  // Replace with the business profile when the real contact details are supplied.
  instagram: "https://www.instagram.com/",
  map: "https://maps.google.com/maps?q=Kochi%2C%20Kerala%2C%20India&z=12&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Kochi%2C%20Kerala%2C%20India",
};

export function ContactPage() {
  const formSection = useRef<HTMLDivElement>(null);
  const form = useRef<ContactFormHandle>(null);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  function openForm(name?: string) {
    formSection.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    form.current?.begin(name);
  }
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#contact-main">
        Skip to content
      </a>
      <Navbar
        activePath="/contact"
        onOpenEnquiry={openForm}
        onBecomeAdvisor={() => setAdvisorOpen(true)}
      />
      <main id="contact-main">
        <div className={styles.container}>
          <section className={styles.introGrid} aria-labelledby="contact-title">
            <div className={styles.introduction}>
              <Image
                src="/contact/lagoon-placeholder.png"
                alt=""
                fill
                sizes="(max-width: 760px) 100vw, 45vw"
                preload
                className={styles.travelPhoto}
              />
              <div className={styles.imageShade} />
              <div>
                <p className={styles.eyebrow}>Your travel desk</p>
                <h1 id="contact-title">
                  Let’s talk
                  <br />
                  about <em>your trip.</em>
                </h1>
                <p className={styles.lead}>Tell us what you have in mind.</p>
              </div>
              <div>
                <div className={styles.directContact}>
                  <a href={CONTACT.phoneHref}>
                    <Phone size={17} aria-hidden="true" />
                    <span>{CONTACT.phone}</span>
                  </a>
                  <a href={`mailto:${CONTACT.email}`}>
                    <Mail size={17} aria-hidden="true" />
                    <span>{CONTACT.email}</span>
                  </a>
                </div>
                <div className={styles.socialLinks}>
                  <a
                    href={CONTACT.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/contact/icons/whatsapp.svg"
                      alt=""
                      width={18}
                      height={18}
                    />
                    Chat on WhatsApp
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                  <a
                    href={CONTACT.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram (opens in a new tab)"
                  >
                    <Image
                      src="/contact/icons/instagram.svg"
                      alt=""
                      width={18}
                      height={18}
                    />
                    <span className={styles.srOnly}>Instagram</span>
                  </a>
                </div>
                <p className={styles.smallNote}>
                  Already booked? Include your booking reference in the message.
                </p>
              </div>
            </div>
            <div
              ref={formSection}
              className={styles.formSection}
              id="contact-enquiry"
            >
              <ContactForm ref={form} />
            </div>
          </section>
          <section className={styles.visit} aria-labelledby="visit-title">
            <div className={styles.visitDetails}>
              <p className={styles.eyebrow}>Meet in person</p>
              <h2 id="visit-title">Visit our travel desk.</h2>
              <p>Visits by appointment.</p>
              <address>
                <span>
                  {CONTACT.address}
                  <br />
                  {CONTACT.city}
                </span>
              </address>
              <div className={styles.visitActions}>
                <a
                  className={styles.visitLink}
                  href={`mailto:${CONTACT.email}?subject=Arrange%20a%20visit`}
                >
                  Arrange a visit <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <a
                  className={styles.directionsLink}
                  href={CONTACT.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className={styles.mapSection}>
              <div className={styles.mapFrame}>
                <iframe
                  title="Google Maps — Kochi location preview"
                  src={CONTACT.map}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <p className={styles.mapCaption}>Location preview · Kochi</p>
            </div>
          </section>
        </div>
      </main>
      <JourneyCTA onStart={() => openForm()} />
      <Footer
        onOpenEnquiry={openForm}
        onBecomeAdvisor={() => setAdvisorOpen(true)}
      />
      <BecomeAdvisorModal
        isOpen={advisorOpen}
        onClose={() => setAdvisorOpen(false)}
      />
    </div>
  );
}
