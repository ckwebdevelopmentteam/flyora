export interface CatalogAirport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export interface CatalogAirline {
  code: string;
  name: string;
}

export const ADMIN_AIRPORT_CATALOG: CatalogAirport[] = [
  {
    code: "CCJ",
    city: "Kozhikode",
    name: "Calicut International Airport",
    country: "India",
  },
  {
    code: "COK",
    city: "Kochi",
    name: "Cochin International Airport",
    country: "India",
  },
  {
    code: "CNN",
    city: "Kannur",
    name: "Kannur International Airport",
    country: "India",
  },
  {
    code: "TRV",
    city: "Thiruvananthapuram",
    name: "Trivandrum International Airport",
    country: "India",
  },
  {
    code: "BOM",
    city: "Mumbai",
    name: "Chhatrapati Shivaji Maharaj International",
    country: "India",
  },
  {
    code: "DEL",
    city: "New Delhi",
    name: "Indira Gandhi International Airport",
    country: "India",
  },
  {
    code: "BLR",
    city: "Bengaluru",
    name: "Kempegowda International Airport",
    country: "India",
  },
  {
    code: "MAA",
    city: "Chennai",
    name: "Chennai International Airport",
    country: "India",
  },
  {
    code: "HYD",
    city: "Hyderabad",
    name: "Rajiv Gandhi International Airport",
    country: "India",
  },
  {
    code: "AMD",
    city: "Ahmedabad",
    name: "Sardar Vallabhbhai Patel International",
    country: "India",
  },
  { code: "GOI", city: "Goa", name: "Dabolim Airport", country: "India" },
  {
    code: "GOX",
    city: "Mopa Goa",
    name: "Manohar International Airport",
    country: "India",
  },
  {
    code: "IXE",
    city: "Mangaluru",
    name: "Mangalore International Airport",
    country: "India",
  },
  {
    code: "DXB",
    city: "Dubai",
    name: "Dubai International Airport",
    country: "UAE",
  },
  {
    code: "SHJ",
    city: "Sharjah",
    name: "Sharjah International Airport",
    country: "UAE",
  },
  {
    code: "AUH",
    city: "Abu Dhabi",
    name: "Zayed International Airport",
    country: "UAE",
  },
  {
    code: "DWC",
    city: "Dubai World Central",
    name: "Al Maktoum International",
    country: "UAE",
  },
  {
    code: "RKT",
    city: "Ras Al Khaimah",
    name: "Ras Al Khaimah International",
    country: "UAE",
  },
  {
    code: "DOH",
    city: "Doha",
    name: "Hamad International Airport",
    country: "Qatar",
  },
  {
    code: "JED",
    city: "Jeddah",
    name: "King Abdulaziz International Airport",
    country: "Saudi Arabia",
  },
  {
    code: "RUH",
    city: "Riyadh",
    name: "King Khalid International Airport",
    country: "Saudi Arabia",
  },
  {
    code: "DMM",
    city: "Dammam",
    name: "King Fahd International Airport",
    country: "Saudi Arabia",
  },
  {
    code: "MED",
    city: "Madinah",
    name: "Prince Mohammad Bin Abdulaziz",
    country: "Saudi Arabia",
  },
  {
    code: "MCT",
    city: "Muscat",
    name: "Muscat International Airport",
    country: "Oman",
  },
  {
    code: "SLL",
    city: "Salalah",
    name: "Salalah International Airport",
    country: "Oman",
  },
  {
    code: "KWI",
    city: "Kuwait",
    name: "Kuwait International Airport",
    country: "Kuwait",
  },
  {
    code: "BAH",
    city: "Bahrain",
    name: "Bahrain International Airport",
    country: "Bahrain",
  },
  {
    code: "SIN",
    city: "Singapore",
    name: "Changi Airport",
    country: "Singapore",
  },
  {
    code: "KUL",
    city: "Kuala Lumpur",
    name: "Kuala Lumpur International",
    country: "Malaysia",
  },
  {
    code: "BKK",
    city: "Bangkok",
    name: "Suvarnabhumi Airport",
    country: "Thailand",
  },
  { code: "LHR", city: "London", name: "Heathrow Airport", country: "UK" },
  {
    code: "LGW",
    city: "London Gatwick",
    name: "Gatwick Airport",
    country: "UK",
  },
];

export const ADMIN_AIRLINE_CATALOG: CatalogAirline[] = [
  { code: "IX", name: "Air India Express" },
  { code: "AI", name: "Air India" },
  { code: "6E", name: "IndiGo" },
  { code: "OV", name: "Salam Air" },
  { code: "WY", name: "Oman Air" },
  { code: "EK", name: "Emirates" },
  { code: "FZ", name: "flydubai" },
  { code: "G9", name: "Air Arabia" },
  { code: "3L", name: "Air Arabia Abu Dhabi" },
  { code: "EY", name: "Etihad Airways" },
  { code: "SV", name: "Saudia" },
  { code: "XY", name: "flynas" },
  { code: "F3", name: "flyadeal" },
  { code: "QR", name: "Qatar Airways" },
  { code: "KU", name: "Kuwait Airways" },
  { code: "J9", name: "Jazeera Airways" },
  { code: "GF", name: "Gulf Air" },
  { code: "SG", name: "SpiceJet" },
  { code: "QP", name: "Akasa Air" },
  { code: "UL", name: "SriLankan Airlines" },
  { code: "SQ", name: "Singapore Airlines" },
  { code: "MH", name: "Malaysia Airlines" },
  { code: "TG", name: "Thai Airways" },
  { code: "BA", name: "British Airways" },
];

const AIRPORT_ALIAS_MAP: Record<string, string> = {
  calicut: "CCJ",
  kozhikode: "CCJ",
  cochin: "COK",
  kochi: "COK",
  trivandrum: "TRV",
  thiruvananthapuram: "TRV",
  kannur: "CNN",
  bombay: "BOM",
  mumbai: "BOM",
  delhi: "DEL",
  bangalore: "BLR",
  bengaluru: "BLR",
  madras: "MAA",
  chennai: "MAA",
  dubai: "DXB",
  sharjah: "SHJ",
  abudhabi: "AUH",
  doha: "DOH",
  jeddah: "JED",
  riyadh: "RUH",
  dammam: "DMM",
  medina: "MED",
  madinah: "MED",
  muscat: "MCT",
  salalah: "SLL",
  kuwait: "KWI",
  bahrain: "BAH",
};

export function resolveAirportByCodeOrCity(
  input: string,
): CatalogAirport | null {
  const clean = input.trim();
  if (!clean) return null;
  const upper = clean.toUpperCase();
  const exactCode = ADMIN_AIRPORT_CATALOG.find((a) => a.code === upper);
  if (exactCode) return exactCode;

  const lower = clean.toLowerCase().replace(/\s+/g, "");
  const aliasCode = AIRPORT_ALIAS_MAP[lower];
  if (aliasCode) {
    return ADMIN_AIRPORT_CATALOG.find((a) => a.code === aliasCode) || null;
  }

  return (
    ADMIN_AIRPORT_CATALOG.find(
      (a) =>
        a.city.toLowerCase() === clean.toLowerCase() ||
        a.name.toLowerCase().includes(clean.toLowerCase()),
    ) || null
  );
}

export function resolveAirlineByNameOrCode(
  input: string,
): CatalogAirline | null {
  const clean = input.trim();
  if (!clean) return null;
  const upper = clean.toUpperCase();
  return (
    ADMIN_AIRLINE_CATALOG.find(
      (a) => a.code === upper || a.name.toLowerCase() === clean.toLowerCase(),
    ) || null
  );
}
