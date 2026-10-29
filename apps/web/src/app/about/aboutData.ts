export interface StatItem {
  id: string;
  value: string;
  label: string;
  /** Illustrative placeholder data for client customization */
  isPlaceholder?: boolean;
}

export interface CuratorItem {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  image: string;
}

export interface ApproachItem {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  location: string;
  category: string;
  avatar: string;
}

export interface JourneyTierItem {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  description: string;
  priceEstimate: string;
  unit: string;
  highlights: string[];
  isPopular?: boolean;
}

export interface AboutPageData {
  hero: {
    badge: string;
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
  transitionStatement: {
    eyebrow: string;
    headingPart1: string;
    headingPart2: string;
    description: string;
  };
  curators: {
    topAction: {
      label: string;
      href: string;
    };
    eyebrow: string;
    heading: string;
    items: CuratorItem[];
  };
  approach: {
    eyebrow: string;
    heading: string;
    items: ApproachItem[];
    companionImage: {
      src: string;
      alt: string;
      caption: string;
    };
  };
  testimonials: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    items: TestimonialItem[];
  };
  pricingAndCta: {
    eyebrow: string;
    heading: string;
    description: string;
    tiers: JourneyTierItem[];
    closingCta: {
      label: string;
      href: string;
    };
  };
}

/**
 * Centrally managed copy & media configuration for Flyora About Us.
 * Directly inspired by the reference design's complete section hierarchy:
 * 1. Big full-width photographic hero (airplane over clouds at sunset, no lady, clear About Us mention)
 * 2. "Who We Are" story section with stats & consultant photo
 * 3. Centered philosophy transition statement
 * 4. "Care from the team who listens well" curators showcase
 * 5. "How We Approach Travel" numbered accordion + companion visual
 * 6. "Words from our Clients" testimonials row
 * 7. "Simple and Transparent Planning" closing adventure tiers
 */
export const ABOUT_DATA: AboutPageData = {
  hero: {
    badge: "ABOUT US",
    eyebrow: "ABOUT US · YOUR JOURNEY, OUR PASSION",
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
      src: "/about/hero-airplane-wide.jpg",
      alt: "Luxury private airplane soaring gracefully above golden clouds and alpine peaks at sunset",
    },
    socialProof: {
      count: "1,200+",
      label: "discerning travelers who found the right journey",
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
      "Every itinerary is shaped around your pace, your comfort, and what feels inspiring right now.",
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
      caption: "Bespoke Travel Consultation",
    },
    primaryCta: {
      label: "Match With an Advisor",
    },
    secondaryCta: {
      label: "View Curated Tours",
      href: "/tours",
    },
  },

  transitionStatement: {
    eyebrow: "A GENTLE PLACE TO BEGIN",
    headingPart1: "We create space for the moments, memories, and stories",
    headingPart2: "you will carry for a lifetime.",
    description:
      "Every detail matters when creating a journey worth remembering. No rushed itineraries, no rigid templates — just thoughtful discovery.",
  },

  curators: {
    topAction: {
      label: "View All Curators",
      href: "/tours",
    },
    eyebrow: "MEET OUR TRAVEL CURATORS",
    heading: "Care from the team who listens well",
    items: [
      {
        id: "curator-1",
        name: "Elena Vance",
        role: "Senior Travel Curator",
        specialties: ["Mediterranean Escapes", "Custom Itineraries"],
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "curator-2",
        name: "Marcus Reed",
        role: "Expeditions Specialist",
        specialties: ["Alpine Rail & Hikes", "Nordic Escapes"],
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "curator-3",
        name: "Aria Chen",
        role: "Luxury Island Advisor",
        specialties: ["Private Overwater Villas", "Wellness Retreats"],
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "curator-4",
        name: "Julian Ross",
        role: "Cultural Heritage Concierge",
        specialties: ["Sacred Pilgrimages", "Culinary Discoveries"],
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },

  approach: {
    eyebrow: "HOW WE PLAN OUR JOURNEYS",
    heading:
      "We prioritize thoughtful pacing, personal choice, and effortless flow",
    items: [
      {
        id: "approach-1",
        number: "001",
        title: "Choice and pacing come first",
        shortDesc:
          "An approach to travel that feels right for you, unhurried, supportive, and free from pressure.",
        fullDesc:
          "An approach to travel that feels right for you, unhurried, supportive, and free from pressure. We design ample free time between signature excursions so you can explore naturally.",
      },
      {
        id: "approach-2",
        number: "002",
        title: "Thoughtful journeys & handcrafted details",
        shortDesc:
          "We focus on the small details that help make every trip feel considered and personal.",
        fullDesc:
          "From room tier selections with optimal morning sunlight to seamless airport luggage handoffs, every detail is considered in advance.",
      },
      {
        id: "approach-3",
        number: "003",
        title: "Respect for privacy and personal boundaries",
        shortDesc:
          "We believe travel is about personal discovery and the peaceful memories you bring home.",
        fullDesc:
          "Whether you prefer secluded private villas or boutique estate hotels, your personal space, dietary preferences, and quiet hours are always safeguarded.",
      },
      {
        id: "approach-4",
        number: "004",
        title: "Simpler planning & dedicated concierge",
        shortDesc:
          "We aim to make planning and discovering your next journey feel completely straightforward.",
        fullDesc:
          "Direct WhatsApp contact with your advisor throughout your trip for on-ground restaurant bookings, route changes, or flight assistance.",
      },
    ],
    companionImage: {
      src: "/about/journey-companion.jpg",
      alt: "Contemplative traveler on a serene timber terrace overlooking twilight misty fjords",
      caption: "Thoughtful pacing & handcrafted flow",
    },
  },

  testimonials: {
    eyebrow: "TESTIMONIALS",
    heading: "Words from our Travelers",
    subtitle:
      "These reflections share what it feels like to travel safely, respectfully, and without pressure.",
    items: [
      {
        id: "test-1",
        category: "Bespoke Itinerary",
        quote:
          "The entire trip was incredibly soothing and respectful. I felt no pressure to rush anything; every transfer was seamless and deeply considered.",
        author: "Sophia Martinez",
        role: "Project Coordinator",
        location: "London, UK",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      },
      {
        id: "test-2",
        category: "Mediterranean Escape",
        quote:
          "The setting was peaceful and respectful. I was never pushed beyond my comfort level, and I came away with memories that made everyday life lighter.",
        author: "Olivia Brown",
        role: "Strategy Director",
        location: "New York, USA",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      },
      {
        id: "test-3",
        category: "Swiss Alps Rail",
        quote:
          "I found the atmosphere to be very calming and genuine. There was zero sales pressure to add tours, only valuable strategies to make our family trip effortless.",
        author: "Emma Johnson",
        role: "Lead Developer",
        location: "Zurich, Switzerland",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      },
    ],
  },

  pricingAndCta: {
    eyebrow: "FLEXIBLE JOURNEY OPTIONS",
    heading: "Simple and Transparent Planning",
    description:
      "Choose the planning tier that suits your journey style. Transparent pricing with zero hidden fees.",
    tiers: [
      {
        id: "tier-first-step",
        badge: "First Step",
        title: "Single Session Consultation",
        subtitle:
          "A single session to get clarity and expert guidance on your destination.",
        description:
          "Ideal for travelers who want itinerary review, hotel perks, and visa checklist verification.",
        priceEstimate: "Complimentary",
        unit: "Initial Match",
        highlights: [
          "30-min destination consultation",
          "VIP hotel amenities eligibility",
          "Curated neighborhood recommendations",
        ],
      },
      {
        id: "tier-bespoke",
        badge: "Most Popular",
        title: "Bespoke Full Itinerary",
        subtitle:
          "Deeper, consistent care for complex custom routes and family travel.",
        description:
          "Comprehensive day-by-day itinerary planning with private guides, rail, and reservations.",
        priceEstimate: "Custom",
        unit: "Per Journey",
        highlights: [
          "Complete door-to-door itinerary",
          "Private transfers & vetted drivers",
          "Dedicated on-trip WhatsApp desk",
          "24/7 emergency rebooking care",
        ],
        isPopular: true,
      },
      {
        id: "tier-ongoing",
        badge: "Ongoing Care",
        title: "Annual Travel Membership",
        subtitle:
          "Ongoing support for frequent business & leisure globe-trotters.",
        description:
          "Unlimited trip planning, priority flight upgrades, and personalized global concierge.",
        priceEstimate: "Tailored",
        unit: "Annual",
        highlights: [
          "Unlimited custom journeys",
          "Direct senior curator access",
          "Exclusive private villa portfolio",
          "Complimentary visa processing desk",
        ],
      },
    ],
    closingCta: {
      label: "Explore Destinations",
      href: "/tours",
    },
  },
};
