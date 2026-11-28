import {
  createSpecialFareSchema,
  type CreateSpecialFareInput,
} from "@flyora/validators";
import {
  resolveAirlineByNameOrCode,
  resolveAirportByCodeOrCity,
} from "./flightCatalog";

export interface ParsedSheetRow {
  rowNumber: number;
  rawSummary: string;
  valid: boolean;
  data?: CreateSpecialFareInput;
  errors: string[];
}

export const SAMPLE_SPECIAL_FARES_CSV = [
  "airlineName,airlineCode,flightNumber,originCity,originCode,originTerminal,destinationCity,destinationCode,destinationTerminal,departureDate,departureTime,arrivalDate,arrivalTime,cabinClass,rbd,flightType,baggage,isRefundable,totalSeats,farePerSeat,childFare,infantFare,originalFare,supplierCost,pnrNumber,stopTicketingHoursBefore,notes",
  "Salam Air,OV,OV-789,Kozhikode,CCJ,T1,Dubai,DXB,T2,2026-12-05,19:15,2026-12-05,23:30,ECONOMY,G,NON_STOP,30 Kg Check-in + 7 Kg Cabin,No,5,15000,15000,5000,19500,12200,GRP789X,12,Riya direct group block",
  "Air India Express,IX,IX-345,Kochi,COK,,Sharjah,SHJ,,2026-12-06,08:40,2026-12-06,11:25,ECONOMY,Y,NON_STOP,30 Kg Check-in + 7 Kg Cabin,Yes,10,11500,11500,4500,15800,9000,IXSHJ22,6,Refundable promotional seats",
].join("\n");

function splitRow(line: string, delimiter: "," | "\t"): string[] {
  if (delimiter === "\t") {
    return line.split("\t").map((cell) => cell.trim());
  }

  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseDateAndTime(dateRaw: string, timeRaw?: string): Date | null {
  const cleanDate = dateRaw.trim();
  if (!cleanDate) return null;

  // Already includes ISO timestamp
  if (cleanDate.includes("T") || /\d{2}:\d{2}/.test(cleanDate)) {
    const direct = new Date(cleanDate);
    if (!isNaN(direct.getTime())) return direct;
  }

  let isoDate = cleanDate;
  // Support DD/MM/YYYY or DD-MM-YYYY common in Riya / Indian travel sheets
  const dmy = cleanDate.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    isoDate = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  const cleanTime = (timeRaw || "12:00").trim();
  const timeMatch = cleanTime.match(/^(\d{1,2}):(\d{2})/);
  const hhmm = timeMatch
    ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`
    : "12:00";

  const combined = new Date(`${isoDate}T${hhmm}:00`);
  if (!isNaN(combined.getTime())) return combined;
  return null;
}

function parseBooleanCell(raw: string): boolean {
  const norm = raw.trim().toLowerCase();
  return ["yes", "true", "1", "y", "refundable"].includes(norm);
}

function parseNumberCell(raw: string): number | undefined {
  const cleaned = raw.replace(/[₹,\s]/g, "").trim();
  if (!cleaned) return undefined;
  const num = Number(cleaned);
  return isNaN(num) ? undefined : num;
}

function parseCabinClass(raw: string): "ECONOMY" | "BUSINESS" | "FIRST_CLASS" {
  const norm = raw.trim().toUpperCase().replace(/\s+/g, "_");
  if (norm.includes("BUSINESS")) return "BUSINESS";
  if (norm.includes("FIRST")) return "FIRST_CLASS";
  return "ECONOMY";
}

function parseFlightType(raw: string): "NON_STOP" | "CONNECTING" {
  const norm = raw.trim().toUpperCase();
  if (
    norm.includes("CONNECT") ||
    norm.includes("VIA") ||
    norm === "1" ||
    norm.includes("STOPOVER")
  ) {
    return "CONNECTING";
  }
  return "NON_STOP";
}

function parseBaggageCell(raw: string): string {
  const clean = raw.trim();
  if (!clean) return "30 Kg Check-in + 7 Kg Cabin";
  if (/^\d+$/.test(clean)) {
    return `${clean} Kg Check-in + 7 Kg Cabin`;
  }
  return clean;
}

function extractParentheticalCode(text: string): {
  label: string;
  code: string | null;
} {
  const match = text.match(/^(.*?)\s*\(\s*([A-Za-z0-9]{2,5})\s*\)$/);
  if (match) {
    return { label: match[1].trim(), code: match[2].toUpperCase() };
  }
  return { label: text.trim(), code: null };
}

export function parseSpecialFareSheet(text: string): ParsedSheetRow[] {
  const rawLines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim().length > 0);

  if (rawLines.length < 2) return [];

  const delimiter: "," | "\t" = rawLines[0].includes("\t") ? "\t" : ",";
  const headers = splitRow(rawLines[0], delimiter).map(normalizeHeader);

  const getField = (cells: string[], aliases: string[]): string => {
    for (const alias of aliases) {
      const idx = headers.indexOf(alias);
      if (idx !== -1 && cells[idx] !== undefined) {
        return cells[idx].trim();
      }
    }
    return "";
  };

  return rawLines.slice(1).map((line, idx) => {
    const rowNumber = idx + 2;
    const cells = splitRow(line, delimiter);
    const errors: string[] = [];

    // Resolve Airline
    const airlineRaw = getField(cells, ["airlinename", "airline", "carrier"]);
    const airlineParsed = extractParentheticalCode(airlineRaw);
    const matchedAirline = resolveAirlineByNameOrCode(
      airlineParsed.code || airlineParsed.label,
    );
    const airlineName =
      airlineParsed.label || matchedAirline?.name || airlineRaw;
    const airlineCode =
      getField(cells, ["airlinecode", "carriercode"]) ||
      airlineParsed.code ||
      matchedAirline?.code ||
      null;

    // Resolve Origin
    const originCombined = getField(cells, ["origin", "from", "sectorfrom"]);
    const originParsed = extractParentheticalCode(originCombined);
    const rawOriginCode =
      getField(cells, ["origincode", "fromcode"]) || originParsed.code || "";
    const rawOriginCity =
      getField(cells, ["origincity", "fromcity"]) || originParsed.label || "";
    const resolvedOrigin = resolveAirportByCodeOrCity(
      rawOriginCode || rawOriginCity,
    );
    const originCode = (
      rawOriginCode ||
      resolvedOrigin?.code ||
      ""
    ).toUpperCase();
    const originCity = rawOriginCity || resolvedOrigin?.city || originCode;

    // Resolve Destination
    const destCombined = getField(cells, ["destination", "to", "sectorto"]);
    const destParsed = extractParentheticalCode(destCombined);
    const rawDestCode =
      getField(cells, ["destinationcode", "tocode", "destcode"]) ||
      destParsed.code ||
      "";
    const rawDestCity =
      getField(cells, ["destinationcity", "tocity", "destcity"]) ||
      destParsed.label ||
      "";
    const resolvedDest = resolveAirportByCodeOrCity(rawDestCode || rawDestCity);
    const destinationCode = (
      rawDestCode ||
      resolvedDest?.code ||
      ""
    ).toUpperCase();
    const destinationCity =
      rawDestCity || resolvedDest?.city || destinationCode;

    // Departure / Arrival Dates
    const depDateRaw = getField(cells, [
      "departuredate",
      "depdate",
      "traveldate",
      "date",
      "fromdate",
    ]);
    const depTimeRaw = getField(cells, ["departuretime", "deptime", "time"]);
    const departure = parseDateAndTime(depDateRaw, depTimeRaw);
    if (!departure) {
      errors.push("Invalid or missing departure date/time");
    }

    const arrDateRaw =
      getField(cells, ["arrivaldate", "arrdate"]) || depDateRaw;
    const arrTimeRaw = getField(cells, ["arrivaltime", "arrtime"]);
    let arrival = arrTimeRaw ? parseDateAndTime(arrDateRaw, arrTimeRaw) : null;
    if (
      arrival &&
      departure &&
      !getField(cells, ["arrivaldate", "arrdate"]) &&
      arrival.getTime() < departure.getTime()
    ) {
      // Crossed midnight without explicit arrival date
      arrival = new Date(arrival.getTime() + 24 * 60 * 60 * 1000);
    }

    // Expiry / Stop Ticketing
    const expiresRaw = getField(cells, [
      "expiresat",
      "expiry",
      "stopticketing",
    ]);
    const stopHours = parseNumberCell(
      getField(cells, ["stopticketinghoursbefore", "cutoffhours"]),
    );
    let expiresAtIso: string | undefined;
    if (expiresRaw) {
      const exp = parseDateAndTime(expiresRaw);
      if (exp) expiresAtIso = exp.toISOString();
    } else if (departure && stopHours && stopHours > 0) {
      expiresAtIso = new Date(
        departure.getTime() - stopHours * 3600 * 1000,
      ).toISOString();
    } else if (departure) {
      expiresAtIso = new Date(
        departure.getTime() - 6 * 3600 * 1000,
      ).toISOString();
    }

    const totalSeats = parseNumberCell(
      getField(cells, ["totalseats", "seats", "seat", "quota"]),
    );
    const availableSeats = parseNumberCell(getField(cells, ["availableseats"]));
    const farePerSeat = parseNumberCell(
      getField(cells, [
        "fareperseat",
        "adultfare",
        "sellingfare",
        "specialfare",
        "fare",
        "price",
      ]),
    );
    const childFare = parseNumberCell(
      getField(cells, ["childfare", "chdfare"]),
    );
    const infantFare = parseNumberCell(
      getField(cells, ["infantfare", "inffare"]),
    );
    const originalFare = parseNumberCell(
      getField(cells, ["originalfare", "marketfare", "crossedfare", "mrp"]),
    );
    const supplierCost = parseNumberCell(
      getField(cells, ["suppliercost", "cost", "netfare", "buyrate"]),
    );

    const candidate = {
      airlineName,
      airlineCode,
      flightNumber: getField(cells, ["flightnumber", "flightno", "no"]) || null,
      originCity,
      originCode,
      originTerminal:
        getField(cells, ["originterminal", "depterminal"]) || null,
      destinationCity,
      destinationCode,
      destinationTerminal:
        getField(cells, ["destinationterminal", "arrterminal"]) || null,
      departureDate: departure ? departure.toISOString() : "",
      arrivalDate: arrival ? arrival.toISOString() : null,
      flightType: parseFlightType(
        getField(cells, ["flighttype", "stops", "type"]),
      ),
      cabinClass: parseCabinClass(
        getField(cells, ["cabinclass", "cabin", "class"]),
      ),
      rbd: getField(cells, ["rbd"]) || null,
      baggageInfo: parseBaggageCell(
        getField(cells, ["baggage", "baggageinfo"]),
      ),
      isRefundable: parseBooleanCell(
        getField(cells, ["isrefundable", "refundable", "refund"]),
      ),
      totalSeats: totalSeats ?? 0,
      availableSeats: availableSeats ?? totalSeats ?? 0,
      originalFare: originalFare ?? null,
      farePerSeat: farePerSeat ?? 0,
      childFare: childFare ?? null,
      infantFare: infantFare ?? null,
      supplierCost: supplierCost ?? null,
      pnrNumber: getField(cells, ["pnrnumber", "pnr"]) || null,
      notes: getField(cells, ["notes", "remarks"]) || null,
      expiresAt: expiresAtIso,
      status: "ACTIVE" as const,
      isActive: true,
      displayOrder: 0,
    };

    const parsed = createSpecialFareSchema.safeParse(candidate);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const msg = issue.message;
        if (!errors.includes(msg)) errors.push(msg);
      }
    }

    const rawSummary = `${originCode || originCity || "?"} ➔ ${destinationCode || destinationCity || "?"} · ${airlineName || "?"} (${depDateRaw || "?"})`;

    return {
      rowNumber,
      rawSummary,
      valid: errors.length === 0 && parsed.success,
      data: parsed.success && errors.length === 0 ? parsed.data : undefined,
      errors,
    };
  });
}
