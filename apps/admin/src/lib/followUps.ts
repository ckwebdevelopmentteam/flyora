import type { LeadItem } from "@flyora/types";
export function isFollowUpDue(
  lead: Pick<LeadItem, "status" | "followUpDate">,
  now = new Date(),
): boolean {
  if (lead.status === "BOOKED" || lead.status === "LOST" || !lead.followUpDate)
    return false;
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const due = Date.parse(lead.followUpDate);
  return Number.isFinite(due) && due <= end.getTime();
}
export function countDueFollowups(leads: LeadItem[], now = new Date()): number {
  return leads.filter((lead) => isFollowUpDue(lead, now)).length;
}
