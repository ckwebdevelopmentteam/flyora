import { useId, useState } from "react";
import type { PackageDetails } from "@flyora/types";
import {
  Check,
  Plus,
  Minus,
  MapPin,
  CalendarDays,
  Utensils,
  BedDouble,
} from "lucide-react";
import { PackageImage } from "./PackageImage";

export function PackagePreview({ pkg }: { pkg: PackageDetails }) {
  const photos = [
    ...new Set(
      [pkg.coverImageUrl, ...(pkg.galleryImageUrls || [])].filter(Boolean),
    ),
  ];
  const [selected, setSelected] = useState(0);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const accordionId = useId();
  return (
    <div className="package-preview">
      <div className="package-preview-summary">
        <div>
          <PackageImage
            src={photos[selected] || photos[0]}
            alt={pkg.title}
            className="package-preview-photo"
          />
          {photos.length > 1 && (
            <div className="package-preview-thumbs" aria-label="Package photos">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  aria-label={`View photo ${index + 1}`}
                  aria-pressed={selected === index}
                  onClick={() => setSelected(index)}
                >
                  <PackageImage
                    src={photo}
                    alt={`${pkg.title} photo ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={15} />
              {pkg.destination}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={15} />
              {pkg.durationDays} days · {pkg.durationNights} nights
            </span>
          </div>
          <h3 className="text-xl font-semibold text-slate-900">{pkg.title}</h3>
          <p className="text-sm text-slate-500">
            From{" "}
            <strong className="text-xl text-slate-900">
              ₹{Number(pkg.startingPrice).toLocaleString("en-IN")}
            </strong>
          </p>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {pkg.overview}
          </p>
        </div>
      </div>
      <div className="package-preview-plan">
        {!!pkg.itinerary?.length && (
          <section aria-label="Itinerary">
            <h3 className="text-base font-semibold mb-4">
              Itinerary{" "}
              <span className="text-sm text-slate-400 font-normal">
                · {pkg.itinerary.length} days
              </span>
            </h3>
            <ol className="package-itinerary-timeline">
              {pkg.itinerary.map((day, index) => {
                const expanded = openDay === index;
                const titleId = `${accordionId}-${index}-title`;
                const contentId = `${accordionId}-${index}-content`;
                return (
                  <li key={index}>
                    <span className="package-day-badge" aria-hidden="true">
                      <span>DAY</span>
                      {index + 1}
                    </span>
                    <div
                      className={`package-day-card ${expanded ? "expanded" : ""}`}
                    >
                      <button
                        type="button"
                        id={titleId}
                        aria-label={`Day ${index + 1}: ${day.title}`}
                        aria-expanded={expanded}
                        aria-controls={contentId}
                        onClick={() => setOpenDay(expanded ? null : index)}
                      >
                        <span className="package-day-title">{day.title}</span>
                        <span className="package-day-toggle" aria-hidden="true">
                          {expanded ? <Minus size={15} /> : <Plus size={15} />}
                        </span>
                      </button>
                      <div
                        id={contentId}
                        role="region"
                        aria-labelledby={titleId}
                        hidden={!expanded}
                        className="package-day-description"
                      >
                        <p>{day.description}</p>
                        {(day.meals || day.stay) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-3">
                            {day.meals && (
                              <span className="inline-flex items-center gap-1">
                                <Utensils size={13} />
                                {day.meals}
                              </span>
                            )}
                            {day.stay && (
                              <span className="inline-flex items-center gap-1">
                                <BedDouble size={13} />
                                {day.stay}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}
        <aside
          className="package-preview-extras"
          aria-label="Package inclusions and exclusions"
        >
          {[
            { title: "Included", items: pkg.inclusions, icon: Check },
            { title: "Not included", items: pkg.exclusions, icon: Minus },
          ].map(({ title, items, icon: Icon }) => (
            <section key={title}>
              <h3 className="font-semibold text-sm mb-3">{title}</h3>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Icon
                      size={15}
                      className={
                        title === "Included"
                          ? "text-emerald-600 shrink-0 mt-0.5"
                          : "text-slate-400 shrink-0 mt-0.5"
                      }
                    />
                    {item}
                  </li>
                ))}
              </ul>
              {!items.length && (
                <p className="text-sm text-slate-400">None added</p>
              )}
            </section>
          ))}
        </aside>
      </div>
    </div>
  );
}
