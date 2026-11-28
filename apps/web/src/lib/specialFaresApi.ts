import { publicApiUrl } from "./service-catalog";
import type {
  SpecialFareEnquiryPayload,
  SpecialFareRoute,
  SpecialFareSearchQuery,
  SpecialFareSummary,
} from "@flyora/types";

export interface PublicSpecialFaresResult {
  items: SpecialFareSummary[];
  total: number;
}

export async function fetchPublicSpecialFares(
  query: SpecialFareSearchQuery = {},
  signal?: AbortSignal,
): Promise<PublicSpecialFaresResult> {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.date) params.set("date", query.date);
  if (query.airline) params.set("airline", query.airline);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const qs = params.toString();
  const res = await fetch(
    `${publicApiUrl()}/public/special-fares${qs ? `?${qs}` : ""}`,
    {
      signal,
      cache: "no-store",
    },
  );
  const body = await res.json();
  if (!res.ok || !body.data) {
    throw new Error(body.message || "Unable to fetch special fare deals.");
  }

  return body.data as PublicSpecialFaresResult;
}

export async function fetchPublicSpecialFareRoutes(
  signal?: AbortSignal,
): Promise<SpecialFareRoute[]> {
  const res = await fetch(`${publicApiUrl()}/public/special-fares/routes`, {
    signal,
    cache: "no-store",
  });
  const body = await res.json();
  if (!res.ok || !Array.isArray(body.data)) {
    throw new Error(body.message || "Unable to fetch special fare routes.");
  }
  return body.data as SpecialFareRoute[];
}

export async function submitSpecialFareEnquiry(
  ticketId: string,
  payload: SpecialFareEnquiryPayload,
): Promise<{ success: boolean; leadId: string; message: string }> {
  const res = await fetch(
    `${publicApiUrl()}/public/special-fares/${encodeURIComponent(ticketId)}/enquire`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const body = await res.json();
  if (!res.ok || !body.data?.success) {
    throw new Error(body.message || "Unable to submit your enquiry.");
  }
  return body.data;
}
