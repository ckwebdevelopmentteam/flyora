import type { ServiceSummary } from "@flyora/types";

const images: Record<string, string> = {
  "holiday-packages": "custom-holidays",
  "custom-holidays": "custom-holidays",
  "visa-assistance": "visa-assistance",
  "flight-booking": "flight-booking",
  "train-booking": "train-booking",
  "bus-booking": "bus-booking",
  "umrah-hajj": "umrah-packages",
  "umrah-packages": "umrah-packages",
  "hajj-packages": "hajj-packages",
  "hotel-booking": "custom-holidays",
};
const defaults = ["custom-holidays", "train-booking", "bus-booking"];
export function serviceImage(slug: string) {
  // Stable variety: the same service gets the same picture on every render and device.
  const hash = [...slug].reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  return `/services/${images[slug] || defaults[hash % defaults.length]}.webp`;
}
export function serviceDescription(service: ServiceSummary) {
  return (
    service.description?.trim() ||
    `Plan your ${service.name.toLowerCase()} with our travel team.`
  );
}
