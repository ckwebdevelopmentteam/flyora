"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { EnquiryModal } from "../../components/EnquiryModal";
import { BecomeAdvisorModal } from "../../components/BecomeAdvisorModal";
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

  useEffect(() => {
    const handleGlobal = () => handleOpenEnquiry();
    window.addEventListener("flyora:open-enquiry", handleGlobal);
    return () =>
      window.removeEventListener("flyora:open-enquiry", handleGlobal);
  }, []);

  return (
    <div className="min-h-screen bg-[#144A72] text-[#1C1815] flex flex-col font-sans selection:bg-[#002f89] selection:text-white antialiased">
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

        {/* A scroll-led purpose story: Purpose, What We Offer, and Meet Our Team on grape background */}
        <AboutPurposeJourney
          curators={ABOUT_DATA.curators}
          onOpenEnquiry={handleOpenEnquiry}
        />

        {/* Start the white stage one viewport before the purple story ends.
            Its sticky surface rises over the still-pinned purpose scene,
            creating the requested bottom-to-top curtain handoff:
            Mission, How We Plan Our Journeys, and Our Values on white background */}
        <div className="relative z-10 -mt-[100svh]">
          <AboutValuesExperience
            approach={ABOUT_DATA.approach}
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

      {/* Global Luxury Footer */}
      <Footer
        onOpenEnquiry={handleOpenEnquiry}
        onBecomeAdvisor={() => setIsAdvisorModalOpen(true)}
      />
    </div>
  );
}
