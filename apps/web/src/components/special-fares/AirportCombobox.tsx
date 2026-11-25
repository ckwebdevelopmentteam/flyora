"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export interface AirportOption {
  code: string;
  city: string;
  airportName: string;
  country: string;
  flag: string;
}

export const IMPORTANT_AIRPORTS: AirportOption[] = [
  {
    code: "CCJ",
    city: "Kozhikode",
    airportName: "Calicut International Airport",
    country: "India",
    flag: "🇮🇳",
  },
  {
    code: "COK",
    city: "Kochi",
    airportName: "Cochin International Airport",
    country: "India",
    flag: "🇮🇳",
  },
  {
    code: "BOM",
    city: "Mumbai",
    airportName: "Chhatrapati Shivaji Maharaj International",
    country: "India",
    flag: "🇮🇳",
  },
  {
    code: "DEL",
    city: "New Delhi",
    airportName: "Indira Gandhi International Airport",
    country: "India",
    flag: "🇮🇳",
  },
  {
    code: "BLR",
    city: "Bengaluru",
    airportName: "Kempegowda International Airport",
    country: "India",
    flag: "🇮🇳",
  },
  {
    code: "CNN",
    city: "Kannur",
    airportName: "Kannur International Airport",
    country: "India",
    flag: "🇮🇳",
  },
  {
    code: "TRV",
    city: "Thiruvananthapuram",
    airportName: "Trivandrum International Airport",
    country: "India",
    flag: "🇮🇳",
  },
  {
    code: "MAA",
    city: "Chennai",
    airportName: "Chennai International Airport",
    country: "India",
    flag: "🇮🇳",
  },
  {
    code: "HYD",
    city: "Hyderabad",
    airportName: "Rajiv Gandhi International Airport",
    country: "India",
    flag: "🇮🇳",
  },
  {
    code: "AMD",
    city: "Ahmedabad",
    airportName: "Sardar Vallabhbhai Patel International",
    country: "India",
    flag: "🇮🇳",
  },
  {
    code: "DXB",
    city: "Dubai",
    airportName: "Dubai International Airport",
    country: "UAE",
    flag: "🇦🇪",
  },
  {
    code: "SHJ",
    city: "Sharjah",
    airportName: "Sharjah International Airport",
    country: "UAE",
    flag: "🇦🇪",
  },
  {
    code: "AUH",
    city: "Abu Dhabi",
    airportName: "Zayed International Airport",
    country: "UAE",
    flag: "🇦🇪",
  },
  {
    code: "JED",
    city: "Jeddah",
    airportName: "King Abdulaziz International Airport",
    country: "Saudi Arabia",
    flag: "🇸🇦",
  },
  {
    code: "RUH",
    city: "Riyadh",
    airportName: "King Khalid International Airport",
    country: "Saudi Arabia",
    flag: "🇸🇦",
  },
  {
    code: "DOH",
    city: "Doha",
    airportName: "Hamad International Airport",
    country: "Qatar",
    flag: "🇶🇦",
  },
  {
    code: "MCT",
    city: "Muscat",
    airportName: "Muscat International Airport",
    country: "Oman",
    flag: "🇴🇲",
  },
  {
    code: "KWI",
    city: "Kuwait",
    airportName: "Kuwait International Airport",
    country: "Kuwait",
    flag: "🇰🇼",
  },
  {
    code: "BAH",
    city: "Bahrain",
    airportName: "Bahrain International Airport",
    country: "Bahrain",
    flag: "🇧🇭",
  },
  {
    code: "SIN",
    city: "Singapore",
    airportName: "Singapore Changi Airport",
    country: "Singapore",
    flag: "🇸🇬",
  },
  {
    code: "LHR",
    city: "London",
    airportName: "London Heathrow Airport",
    country: "UK",
    flag: "🇬🇧",
  },
];

interface AirportComboboxProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (codeOrText: string) => void;
  recentAirports?: AirportOption[];
  extraAirports?: AirportOption[];
  inputId?: string;
}

export function AirportCombobox({
  label,
  placeholder,
  value,
  onChange,
  recentAirports = [],
  extraAirports = [],
  inputId,
}: AirportComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const allAirports = useMemo(() => {
    const map = new Map<string, AirportOption>();
    for (const a of IMPORTANT_AIRPORTS) {
      map.set(a.code, a);
    }
    for (const a of extraAirports) {
      if (!map.has(a.code)) {
        map.set(a.code, a);
      }
    }
    return Array.from(map.values());
  }, [extraAirports]);

  const query = isOpen ? searchTerm.trim().toLowerCase() : "";

  const matchesQuery = (opt: AirportOption) => {
    if (!query) return true;
    return (
      opt.code.toLowerCase().includes(query) ||
      opt.city.toLowerCase().includes(query) ||
      opt.airportName.toLowerCase().includes(query) ||
      opt.country.toLowerCase().includes(query)
    );
  };

  const filteredRecent = useMemo(
    () => recentAirports.filter(matchesQuery),
    [recentAirports, query],
  );

  const filteredImportant = useMemo(
    () =>
      allAirports.filter(
        (a) =>
          matchesQuery(a) && !filteredRecent.some((rec) => rec.code === a.code),
      ),
    [allAirports, filteredRecent, query],
  );

  const selectedAirport = allAirports.find(
    (a) => a.code.toLowerCase() === value.trim().toLowerCase(),
  );

  const handleSelect = (opt: AirportOption) => {
    onChange(opt.code);
    setSearchTerm(opt.code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={inputId}
        className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        <input
          id={inputId}
          type="text"
          value={
            isOpen
              ? searchTerm
              : selectedAirport
                ? `${selectedAirport.city} (${selectedAirport.code})`
                : value
          }
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm("");
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-3.5 pr-12 py-2.5 text-sm font-semibold text-[#1C1815] bg-[#FAF9F6] border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002f89]/20 focus:border-[#002f89] truncate"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setSearchTerm("");
              }}
              aria-label={`Clear ${label}`}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Search className="w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* Dropdown Popover matching Reference Screenshot */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full sm:w-[360px] bg-white rounded-[14px] border border-stone-200 shadow-[0_16px_44px_rgba(0,0,0,0.14)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-h-[340px] overflow-y-auto divide-y divide-stone-100 [scrollbar-width:thin]">
            {/* Section 1: Active / Recent Sectors */}
            {filteredRecent.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#F4F6FA] text-[11px] font-bold text-[#1C1815] tracking-tight sticky top-0 z-10">
                  {query
                    ? "Matching Active Sectors"
                    : "Active & Previously Searched"}
                </div>
                <div className="divide-y divide-stone-100/80">
                  {filteredRecent.map((opt) => (
                    <button
                      key={`recent-${opt.code}`}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#FAF9F6] transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1C1815]">
                            {opt.city}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#002f89] text-white text-[10px] font-bold font-mono tracking-wide">
                            {opt.code}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 truncate mt-0.5">
                          {opt.airportName}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-xs text-stone-600">
                        <span>{opt.country}</span>
                        <span className="text-sm" aria-hidden="true">
                          {opt.flag}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Important Airports */}
            {filteredImportant.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#F4F6FA] text-[11px] font-bold text-[#1C1815] tracking-tight sticky top-0 z-10">
                  Important Airports
                </div>
                <div className="divide-y divide-stone-100/80">
                  {filteredImportant.map((opt) => (
                    <button
                      key={`airport-${opt.code}`}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#FAF9F6] transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1C1815]">
                            {opt.city}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#002f89] text-white text-[10px] font-bold font-mono tracking-wide">
                            {opt.code}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 truncate mt-0.5">
                          {opt.airportName}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-xs text-stone-600">
                        <span>{opt.country}</span>
                        <span className="text-sm" aria-hidden="true">
                          {opt.flag}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredRecent.length === 0 && filteredImportant.length === 0 && (
              <div className="p-5 text-center text-xs text-stone-500">
                No airport matches &ldquo;{searchTerm}&rdquo;. Press Find Fares
                to search anyway.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
