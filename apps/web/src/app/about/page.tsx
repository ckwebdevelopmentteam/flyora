"use client";

import React, { useState } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { EnquiryModal } from "../../components/EnquiryModal";
import { BecomeAdvisorModal } from "../../components/BecomeAdvisorModal";
import { FloatingWhatsApp } from "../../components/FloatingWhatsApp";
import { ABOUT_DATA } from "./aboutData";
import { AboutEditorialStory } from "./components/AboutEditorialStory";
import { AboutPurposeJourney } from "./components/AboutPurposeJourney";
import { AboutValuesExperience } from "./components/AboutValuesExperience";

export default function AboutPage() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryService, setEnquiryService] = useState<string | undefined>();
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);

  const handleOpenEnquiry = (serviceId?: string) => {
    setEnquiryService(serviceId);
    setIsEnquiryOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#144A72] text-[#1C1815] flex flex-col font-sans selection:bg-[#463D34] selection:text-white antialiased">
      {/* Floating Glassmorphic Navbar */}
      <Navbar
        isFixed={true}
        activePath="/about"
        onOpenEnquiry={handleOpenEnquiry}
        onBecomeAdvisor={() => setIsAdvisorModalOpen(true)}
      />

      {/* Main Editorial Flow matching reference UI/UX rhythm */}
      <main className="flex-1 bg-white">
        {/* Editorial Story matching 4 reference screenshots: Hero, Overlapping Mountain, It Began With A Feeling, Unique Different & Daring, Regenerative Travel */}
        <AboutEditorialStory onOpenEnquiry={handleOpenEnquiry} />

        {/* A scroll-led purpose story replaces the transition, curators, and
            standalone approach sections. */}
        <AboutPurposeJourney data={ABOUT_DATA.approach} />

        {/* Start the white stage one viewport before the purple story ends.
            Its sticky surface rises over the still-pinned purpose scene,
            creating the requested bottom-to-top curtain handoff. */}
        <div className="relative z-10 -mt-[100svh]">
          <AboutValuesExperience
            approach={ABOUT_DATA.approach}
            curators={ABOUT_DATA.curators}
            onOpenEnquiry={handleOpenEnquiry}
          />
        </div>
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
