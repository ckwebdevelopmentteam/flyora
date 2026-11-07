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
      className="relative w-full bg-white border-t border-black/[0.06] py-16 sm:py-24"
      aria-label="Meet Our Team"
    >
      <span id="meet-our-team" className="sr-only" aria-hidden="true" />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 xl:px-16">
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
