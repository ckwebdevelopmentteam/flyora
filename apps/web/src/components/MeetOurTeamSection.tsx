"use client";

import React from "react";
import Team, {
  InstagramIcon,
  LinkedinIcon,
  DribbbleIcon,
} from "@/components/ui/team-02";
import { ABOUT_DATA } from "@/app/about/aboutData";

export interface MeetOurTeamSectionProps {
  onOpenEnquiry?: (serviceId?: string) => void;
}

export function MeetOurTeamSection({ onOpenEnquiry }: MeetOurTeamSectionProps) {
  const curators = ABOUT_DATA.curators.items;

  return (
    <div className="relative w-full overflow-hidden bg-white">
      <span id="meet-our-team" className="sr-only" aria-hidden="true" />
      <span id="meet-our-team-section" className="sr-only" aria-hidden="true" />

      {/* Decorative background curve with dotted flight trail and paper plane rising to the left */}
      <div
        className="absolute bottom-0 inset-x-0 h-36 sm:h-44 lg:h-52 pointer-events-none opacity-100 bg-cover bg-bottom bg-no-repeat z-0"
        style={{
          backgroundImage: `url('/destinations/team-curve-bg.svg?v=1')`,
        }}
        aria-hidden="true"
      />

      <Team
        id="our-team"
        className="relative z-10 w-full overflow-hidden bg-transparent"
        containerClassName="py-14 sm:py-18 lg:py-24"
        isDark={false}
        customHeader={
          <div className="flex flex-col items-center justify-center text-center">
            {/* Eyebrow with flanking blue lines */}
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <div className="w-8 sm:w-12 h-[1.5px] bg-[#002f89]" />
              <span className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.22em] text-[#002f89]">
                THE PEOPLE BEHIND FLYORA
              </span>
              <div className="w-8 sm:w-12 h-[1.5px] bg-[#002f89]" />
            </div>

            {/* Heading with "Meet" in black and "Our Team" in Flyora blue */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#111827] mb-3">
              Meet <span className="text-[#002f89]">Our Team</span>
            </h2>

            {/* Description Subtitle */}
            <p className="text-sm sm:text-base text-[#4b5563] max-w-2xl mx-auto font-normal leading-relaxed">
              Care from the team who listens well, shaping bespoke journeys
              tailored to your personal pace and passion.
            </p>
          </div>
        }
        members={curators.map((curator) => ({
          name: curator.name,
          role: curator.role,
          image: curator.image,
          socials: [
            {
              icon: <InstagramIcon size={16} />,
              link: "#",
            },
            {
              icon: <LinkedinIcon size={16} />,
              link: "#",
            },
            {
              icon: <DribbbleIcon size={16} />,
              link: "#",
            },
          ],
        }))}
        onMemberClick={(member) =>
          onOpenEnquiry?.(`Consultation with ${member.name}`)
        }
      />
    </div>
  );
}
