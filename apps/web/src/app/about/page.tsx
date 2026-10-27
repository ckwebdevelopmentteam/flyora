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
import { AboutValues } from "./components/AboutValues";
import { TravelInspiration } from "./components/TravelInspiration";
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
      {/* Fixed/Sticky Floating Luxury Navbar */}
      <Navbar
        activePath="/about"
        onOpenEnquiry={handleOpenEnquiry}
        onBecomeAdvisor={() => setIsAdvisorModalOpen(true)}
      />

      {/* Main Editorial Content Flow */}
      <main className="flex-1">
        {/* Section 1: Hero Section */}
        <AboutHero data={ABOUT_DATA.hero} />

        {/* Section 2: Our Story Section ("Who We Are") */}
        <AboutStory data={ABOUT_DATA.story} onOpenEnquiry={handleOpenEnquiry} />

        {/* Section 3: Our Values Section ("What Guides Us") */}
        <AboutValues data={ABOUT_DATA.values} />

        {/* Section 4: Travel Image Section ("Every destination has a story.") */}
        <TravelInspiration data={ABOUT_DATA.inspiration} />

        {/* Section 5: Closing CTA Section */}
        <AboutCTA
          data={ABOUT_DATA.cta}
          onOpenEnquiry={() => handleOpenEnquiry("Custom Holidays")}
        />
      </main>

      {/* Shared Reusable Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        packageTitle={
          enquiryService
            ? `Inquiry: ${enquiryService}`
            : "Custom Travel Inquiry"
        }
      />

      {/* Shared Reusable Become Advisor Modal */}
      <BecomeAdvisorModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
      />

      {/* Floating WhatsApp Concierge Button */}
      <FloatingWhatsApp />

      {/* Luxury Footer */}
      <Footer
        onOpenEnquiry={handleOpenEnquiry}
        onBecomeAdvisor={() => setIsAdvisorModalOpen(true)}
      />
    </div>
  );
}
