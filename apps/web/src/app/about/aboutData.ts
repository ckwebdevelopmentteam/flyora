export interface StatItem {
  id: string;
  value: string;
  label: string;
  /** Note for developers and client: illustrative placeholder data */
  isPlaceholder?: boolean;
}

export interface ValueItem {
  id: string;
  number: string;
  title: string;
  description: string;
  detail?: string;
  highlight?: string;
}

export interface AboutPageData {
  hero: {
    eyebrow: string;
    heading: string;
    description: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
      href: string;
    };
    image: {
      src: string;
      alt: string;
      caption?: string;
    };
    socialProof: {
      count: string;
      label: string;
      avatars: string[];
    };
  };
  story: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    stats: StatItem[];
    image: {
      src: string;
      alt: string;
      caption?: string;
    };
    primaryCta: {
      label: string;
    };
    secondaryCta: {
      label: string;
      href: string;
    };
  };
  values: {
    eyebrow: string;
    heading: string;
    supportingText: string;
    items: ValueItem[];
    companionImage: {
      src: string;
      alt: string;
      caption: string;
    };
  };
  inspiration: {
    eyebrow: string;
    heading: string;
    supportingText: string;
    image: {
      src: string;
      alt: string;
      locationTag: string;
    };
    tags: string[];
  };
  cta: {
    eyebrow: string;
    heading: string;
    description: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
    };
  };
}

/**
 * Centrally managed copy & media configuration for Flyora About Us.
 * Client content can be safely updated here without modifying page components or layouts.
 */
export const ABOUT_DATA: AboutPageData = {
  hero: {
    eyebrow: "YOUR JOURNEY, OUR PASSION",
    heading: "The world is closer than you think.",
    description:
      "At Flyora, we believe every journey opens the door to new places, meaningful experiences, and stories worth remembering.",
    primaryCta: {
      label: "Explore Destinations",
      href: "/tours",
    },
    secondaryCta: {
      label: "Discover Flyora",
      href: "#our-story",
    },
    image: {
      src: "/about/hero-travel.jpg",
      alt: "Traveler standing atop a scenic sunlit Mediterranean clifftop overlooking the turquoise coastline",
      caption: "Amalfi Coastline, Italy",
    },
    socialProof: {
      count: "1,200+",
      label: "discerning travelers discovering extraordinary journeys",
      avatars: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      ],
    },
  },

  story: {
    eyebrow: "WHO WE ARE",
    heading: "Making every journey feel extraordinary.",
    paragraphs: [
      "Flyora was created around a simple idea: discovering the world should feel exciting, personal, and effortless. We want to make travel feel less complicated and help people focus on the experiences that matter.",
      "From secluded ocean retreats and scenic rail expeditions to culturally enriching pilgrimages, our dedicated advisors craft journeys centered entirely around your distinct travel style.",
    ],
    // NOTE: Illustrative placeholder statistics only. Ready to replace with verified client figures.
    stats: [
      {
        id: "stat-destinations",
        value: "25+",
        label: "Destinations Explored",
        isPlaceholder: true,
      },
      {
        id: "stat-journeys",
        value: "1,200+",
        label: "Journeys Planned",
        isPlaceholder: true,
      },
      {
        id: "stat-satisfaction",
        value: "98%",
        label: "Traveler Satisfaction",
        isPlaceholder: true,
      },
    ],
    image: {
      src: "/about/consultant-story.jpg",
      alt: "Flyora luxury travel advisor consulting with travelers in an editorial sunlit studio",
      caption: "Tailored Consultation Desk",
    },
    primaryCta: {
      label: "Match With an Advisor",
    },
    secondaryCta: {
      label: "View Curated Tours",
      href: "/tours",
    },
  },

  values: {
    eyebrow: "WHAT GUIDES US",
    heading: "More than a destination. An experience.",
    supportingText:
      "Every detail matters when creating a journey worth remembering.",
    items: [
      {
        id: "value-1",
        number: "01",
        title: "Thoughtful Journeys",
        description:
          "We focus on the details that help make every trip feel considered and personal.",
        detail:
          "Every route, room tier, and private transfer is meticulously vetted to guarantee effortless flow and timeless comfort.",
        highlight: "Personalized Itineraries",
      },
      {
        id: "value-2",
        number: "02",
        title: "Meaningful Experiences",
        description:
          "We believe travel is about the places we discover and the memories we bring home.",
        detail:
          "Beyond standard tourist paths, we connect you with authentic local culture, heritage guides, and tranquil hidden gems.",
        highlight: "Cultural Immersion",
      },
      {
        id: "value-3",
        number: "03",
        title: "Simpler Planning",
        description:
          "We aim to make planning and discovering your next journey feel straightforward.",
        detail:
          "From visa document clearances to on-ground concierge support, our team handles logistics so you can enjoy every moment.",
        highlight: "Frictionless Travel",
      },
    ],
    companionImage: {
      src: "/destinations/bali.jpg",
      alt: "Serene tropical travel escape representing mindful, peaceful discovery",
      caption: "Ubud & Seminyak, Bali",
    },
  },

  inspiration: {
    eyebrow: "TIMELESS INSPIRATION",
    heading: "Every destination has a story.",
    supportingText:
      "Find inspiration in the places, people, and experiences waiting beyond the familiar.",
    image: {
      src: "/about/destination-story.jpg",
      alt: "Panoramic Swiss Alps turquoise lake and alpine wooden pier in soft golden light",
      locationTag: "Oeschinensee, Swiss Alps",
    },
    tags: [
      "Alpine Sanctuaries",
      "Coastal Escapes",
      "Heritage Discoveries",
      "Private Rail",
      "Spiritual Journeys",
    ],
  },

  cta: {
    eyebrow: "YOUR NEXT ADVENTURE",
    heading: "Your next story starts here.",
    description:
      "Discover a new destination and start imagining where your next journey could take you.",
    primaryCta: {
      label: "Explore Destinations",
      href: "/tours",
    },
    secondaryCta: {
      label: "Speak with a Specialist",
    },
  },
};
