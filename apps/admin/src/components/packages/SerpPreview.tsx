import { Globe } from "lucide-react";

interface SerpPreviewProps {
  title: string;
  slug: string;
  description: string;
}

export const SerpPreview = ({ title, slug, description }: SerpPreviewProps) => {
  const displayTitle = title || "Package Title — Flyora Luxury Travel";
  const displaySlug = slug || "package-slug";
  const displayDesc =
    description ||
    "Explore unforgettable curated travel experiences, luxury stays, and private guided itineraries with Flyora Travels.";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 tracking-tight">
        <Globe className="w-3.5 h-3.5 text-zinc-500" />
        <span>Search Engine Snippet Preview (SERP)</span>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs space-y-1 font-sans">
        {/* URL breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
          <span>flyora.com</span>
          <span>›</span>
          <span className="text-zinc-700">packages</span>
          <span>›</span>
          <span className="text-zinc-900 truncate max-w-[200px]">
            {displaySlug}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
          {displayTitle}
        </h4>

        {/* Description */}
        <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
          {displayDesc}
        </p>
      </div>
    </div>
  );
};
