"use client";

import React from "react";
import Team, {
  type TeamMember,
  InstagramIcon,
  LinkedinIcon,
  DribbbleIcon,
} from "@/components/ui/team-02";
import { ABOUT_DATA } from "@/app/about/aboutData";

export interface MeetOurTeamSectionProps {
  onOpenEnquiry?: (serviceId?: string) => void;
}

export function MeetOurTeamSection({ onOpenEnquiry }: MeetOurTeamSectionProps) {
  const members: TeamMember[] = ABOUT_DATA.curators.items.map((curator) => ({
    name: curator.name,
    role: curator.role,
    image: curator.image,
    socials: [
      {
        icon: <InstagramIcon size={16} />,
        link: "#",
      },
      {
        icon: <DribbbleIcon size={16} />,
        link: "#",
      },
      {
        icon: <LinkedinIcon size={16} />,
        link: "#",
      },
    ],
  }));

  return (
    <section
      id="our-team"
      className="relative w-full overflow-hidden border-t border-rose-100/80 border-b border-rose-100/60 py-10 sm:py-16 lg:py-24"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #FFF7F6 18%, #FFF4F3 50%, #FFF8F7 82%, #FFFFFF 100%)",
      }}
      aria-label="Meet Our Team"
    >
      <span id="meet-our-team" className="sr-only" aria-hidden="true" />

      {/* =========================================================================
          PREMIUM RED-INSPIRED BRAND BACKGROUND (Coral-Red, Blush, Warm White)
          ========================================================================= */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        {/* 1. Large Top-Left Soft Coral/Blush Gradient Shape */}
        <div
          className="absolute -top-20 -left-20 sm:-top-28 sm:-left-28 lg:-top-36 lg:-left-36 w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] lg:w-[640px] lg:h-[640px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(254,205,211,0.55) 0%, rgba(254,226,226,0.35) 45%, rgba(255,241,242,0.12) 70%, transparent 100%)",
            filter: "blur(24px)",
          }}
        />
        {/* Top-Left Secondary Blush Crescent */}
        <div
          className="absolute -top-10 -left-10 sm:-top-16 sm:-left-16 w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] lg:w-[420px] lg:h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(251,113,133,0.22) 0%, rgba(254,205,211,0.3) 50%, transparent 80%)",
            filter: "blur(18px)",
          }}
        />

        {/* 2. Large Right-Side Smooth Blush/Coral Sweep */}
        <div
          className="absolute top-1/4 -right-20 sm:-right-32 lg:-right-40 w-[320px] h-[520px] sm:w-[460px] sm:h-[660px] lg:w-[580px] lg:h-[780px] rounded-[50%_50%_60%_40%/40%_60%_40%_60%] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 75% 50%, rgba(254,205,211,0.6) 0%, rgba(254,226,226,0.38) 45%, rgba(255,241,242,0.1) 75%, transparent 100%)",
            filter: "blur(28px)",
          }}
        />
        <div
          className="absolute top-1/3 -right-10 sm:-right-16 w-[200px] h-[360px] sm:w-[300px] sm:h-[480px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 80% 50%, rgba(244,63,94,0.18) 0%, rgba(254,205,211,0.25) 50%, transparent 80%)",
            filter: "blur(20px)",
          }}
        />

        {/* 3. Bottom-Right Curved Organic Accent Sweep (Rich Flyora Coral-Red) */}
        <div
          className="absolute -bottom-24 -right-16 sm:-bottom-32 sm:-right-20 lg:-bottom-40 lg:-right-24 w-[300px] h-[300px] sm:w-[460px] sm:h-[460px] lg:w-[580px] lg:h-[580px] rounded-[60%_40%_70%_30%/50%_60%_40%_50%] pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(225,29,72,0.45) 0%, rgba(244,63,94,0.32) 40%, rgba(254,205,211,0.2) 70%, transparent 100%)",
            filter: "blur(18px)",
          }}
        />
        <div
          className="absolute -bottom-16 -right-10 sm:-bottom-24 sm:-right-12 w-[180px] h-[180px] sm:w-[280px] sm:h-[280px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 60% 60%, rgba(225,29,72,0.5) 0%, rgba(244,63,94,0.3) 50%, transparent 80%)",
            filter: "blur(14px)",
          }}
        />

        {/* 4. Bottom-Left Smooth Curved Gradient Shape */}
        <div
          className="absolute -bottom-28 -left-20 sm:-bottom-36 sm:-left-24 w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 70%, rgba(244,63,94,0.25) 0%, rgba(254,205,211,0.3) 50%, transparent 80%)",
            filter: "blur(24px)",
          }}
        />

        {/* 5. Left Subtle Red Dot Matrix */}
        <div
          className="absolute left-3 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 w-28 sm:w-36 lg:w-44 h-56 sm:h-64 pointer-events-none opacity-45"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(225,29,72,0.35) 1.25px, transparent 1.25px)",
            backgroundSize: "18px 18px",
            maskImage:
              "radial-gradient(ellipse at 40% 50%, black 25%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 40% 50%, black 25%, transparent 75%)",
          }}
        />

        {/* 6. Right Subtle Red Dot Matrix */}
        <div
          className="absolute right-4 sm:right-8 lg:right-12 top-1/4 w-24 sm:w-32 lg:w-36 h-44 sm:h-52 pointer-events-none opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(225,29,72,0.3) 1.25px, transparent 1.25px)",
            backgroundSize: "18px 18px",
            maskImage:
              "radial-gradient(ellipse at 60% 50%, black 25%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 60% 50%, black 25%, transparent 75%)",
          }}
        />

        {/* 7. Center Airy Warm White Glow */}
        <div
          className="absolute inset-x-[12%] inset-y-[8%] rounded-full opacity-90 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.96) 0%, rgba(255,248,247,0.7) 60%, transparent 100%)",
          }}
        />
      </div>

      {/* Main Content Container (Untouched Structure) */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 lg:px-8 xl:px-16">
        <Team
          badge="Team"
          title="Meet Our Team"
          description="Care from the team who listens well, shaping bespoke journeys tailored to your personal pace and passion."
          members={members}
          className=""
          containerClassName="py-0"
          onMemberClick={(member) =>
            onOpenEnquiry
              ? onOpenEnquiry(`Consultation with ${member.name}`)
              : undefined
          }
        />
      </div>
    </section>
  );
}
