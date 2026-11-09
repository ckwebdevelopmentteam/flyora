export interface PopularVisaCountry {
  id: string;
  name: string;
  region: "Europe" | "Americas" | "Middle East" | "Asia" | "Oceania" | string;
  image: string;
  visaType: string;
  processingTime: string;
  approvalRate: string;
  popularFor: string;
}

export const POPULAR_VISA_COUNTRIES: PopularVisaCountry[] = [
  {
    id: "visa-schengen",
    name: "Schengen Europe",
    region: "Europe",
    image: "/destinations/switzerland_hd.jpg",
    visaType: "Tourist & Business (29 Nations)",
    processingTime: "10-15 Working Days",
    approvalRate: "99.2% Approved",
    popularFor: "France, Germany, Italy, Swiss",
  },
  {
    id: "visa-uk",
    name: "United Kingdom",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    visaType: "Standard Visitor & Transit",
    processingTime: "15 Days (Priority Avail.)",
    approvalRate: "98.9% Approved",
    popularFor: "London, Scotland, Wales",
  },
  {
    id: "visa-usa",
    name: "United States",
    region: "Americas",
    image:
      "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=80",
    visaType: "B1/B2 Tourism & Business",
    processingTime: "Early Slot Expediting",
    approvalRate: "98.4% Approved",
    popularFor: "New York, California, Florida",
  },
  {
    id: "visa-uae",
    name: "United Arab Emirates",
    region: "Middle East",
    image: "/destinations/dubai_hd.jpg",
    visaType: "30 / 60-Day Express Tourist eVisa",
    processingTime: "24 to 48 Hours",
    approvalRate: "99.8% Approved",
    popularFor: "Dubai, Abu Dhabi, Sharjah",
  },
  {
    id: "visa-saudi",
    name: "Saudi Arabia",
    region: "Middle East",
    image: "/packages/makkah.jpg",
    visaType: "Umrah, Tourist & Multiple Entry",
    processingTime: "Instant / 24 Hours",
    approvalRate: "99.9% Approved",
    popularFor: "Makkah, Madinah, Riyadh",
  },
  {
    id: "visa-japan",
    name: "Japan",
    region: "Asia",
    image: "/destinations/kyoto_hd.jpg",
    visaType: "Short-Stay Tourist & eVisa",
    processingTime: "5-7 Working Days",
    approvalRate: "99.3% Approved",
    popularFor: "Tokyo, Kyoto, Osaka",
  },
  {
    id: "visa-singapore",
    name: "Singapore",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
    visaType: "30-Day Paper eVisa",
    processingTime: "3-4 Working Days",
    approvalRate: "99.7% Approved",
    popularFor: "Marina Bay, Sentosa",
  },
  {
    id: "visa-canada",
    name: "Canada",
    region: "Americas",
    image:
      "https://images.unsplash.com/photo-1517935703635-27c946402475?auto=format&fit=crop&w=800&q=80",
    visaType: "Visitor Visa (TRV) & Biometrics",
    processingTime: "File Audit & Bio Slot",
    approvalRate: "98.1% Approved",
    popularFor: "Toronto, Vancouver, Banff",
  },
  {
    id: "visa-australia",
    name: "Australia",
    region: "Oceania",
    image:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
    visaType: "Subclass 600 Tourist Stream",
    processingTime: "15-20 Working Days",
    approvalRate: "98.7% Approved",
    popularFor: "Sydney, Melbourne, Gold Coast",
  },
  {
    id: "visa-turkey",
    name: "Turkey",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
    visaType: "Express eVisa & Sticker Gateway",
    processingTime: "24-48 Hours",
    approvalRate: "99.6% Approved",
    popularFor: "Istanbul, Cappadocia, Antalya",
  },
];
