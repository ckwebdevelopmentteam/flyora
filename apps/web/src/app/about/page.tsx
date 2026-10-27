"use client";

import React, { useState } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { EnquiryModal } from "../../components/EnquiryModal";
import { BecomeAdvisorModal } from "../../components/BecomeAdvisorModal";
import { FloatingWhatsApp } from "../../components/FloatingWhatsApp";
import { ABOUT_DATA } from "./aboutData";
import { AboutHero } from "./components/AboutHero";
import { AboutStory } from "./components/AboutStory";
import { AboutTransition } from "./components/AboutTransition";
import { AboutCurators } from "./components/AboutCurators";
import { AboutValues } from "./components/AboutValues";
import { AboutTestimonials } from "./components/AboutTestimonials";
import { AboutCTA } from "./components/AboutCTA";

export default function AboutPage() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryService, setEnquiryService] = useState<string | undefined>();
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);

  const handleOpenEnquiry = (serviceId?: string) => {
    setEnquiryService(serviceId);
    setIsEnquiryOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1C1815] flex flex-col font-sans selection:bg-[#463D34] selection:text-white antialiased">
      {/* Floating Glassmorphic Navbar */}
      <Navbar
        activePath="/about"
        onOpenEnquiry={handleOpenEnquiry}
        onBecomeAdvisor={() => setIsAdvisorModalOpen(true)}
      />

      {/* Main Editorial Flow matching reference UI/UX rhythm */}
      <main className="flex-1">
        {/* Section 1: Hero with Big Full-Width Airplane Sky Visual & About Us Pill */}
        <AboutHero data={ABOUT_DATA.hero} />

        {/* Section 2: "WHO WE ARE" with Stats & Rounded Consultation Photo */}
        <AboutStory data={ABOUT_DATA.story} onOpenEnquiry={handleOpenEnquiry} />

        {/* Section 3: "A GENTLE PLACE TO BEGIN" Centered Transition Statement */}
        <AboutTransition data={ABOUT_DATA.transitionStatement} />

        {/* Section 4: "MEET OUR TRAVEL CURATORS" 4-Card Showcase */}
        <AboutCurators
          data={ABOUT_DATA.curators}
          onOpenEnquiry={handleOpenEnquiry}
        />

        {/* Section 5: "HOW WE PLAN OUR JOURNEYS" Numbered Accordion & Visual */}
        <AboutValues data={ABOUT_DATA.approach} />

        {/* Section 6: "WORDS FROM OUR TRAVELERS" Testimonials with Navigation */}
        <AboutTestimonials data={ABOUT_DATA.testimonials} />

        {/* Section 7: "SIMPLE AND TRANSPARENT PLANNING" Tiers & Final CTA */}
        <AboutCTA
          data={ABOUT_DATA.pricingAndCta}
          onOpenEnquiry={handleOpenEnquiry}
        />
      </main>

      {/* Reusable Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        packageTitle={
          enquiryService
            ? `Inquiry: ${enquiryService}`
            : "Custom Travel Inquiry"
        }
      />

      {/* Reusable Become Advisor Modal */}
      <BecomeAdvisorModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
      />

      {/* Floating WhatsApp Quick Action */}
      <FloatingWhatsApp />

      {/* Global Luxury Footer */}
      <Footer
        onOpenEnquiry={handleOpenEnquiry}
        onBecomeAdvisor={() => setIsAdvisorModalOpen(true)}
      />
    </div>
  );
}
