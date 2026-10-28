import type { LeadStatus } from "@flyora/types";
export const enquiryStages = [
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "QUOTED", label: "Quoted" },
  { key: "NEGOTIATING", label: "Negotiating" },
  { key: "BOOKED", label: "Booked" },
  { key: "LOST", label: "Lost" },
] as const;
export function enquiryStageFromUrl(
  value: string | null,
): LeadStatus | undefined {
  return enquiryStages.find((stage) => stage.key === value)?.key;
}
