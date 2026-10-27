import type { Metadata } from "next";
import { ExploreView } from "../../components/ExploreView";

export const metadata: Metadata = {
  title: "Explore Curated Destinations & Travel Guides | Flyora Travels",
  description:
    "Discover bespoke itineraries, certified luxury travel advisors, and handpicked global destinations across China, Indonesia, Italy, Brazil, Chile, and more.",
};

export default function ExplorePage() {
  return <ExploreView />;
}
