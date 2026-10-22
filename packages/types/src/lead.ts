export type LeadStatus =
  "NEW" | "CONTACTED" | "QUOTED" | "NEGOTIATING" | "BOOKED" | "LOST";

export type LeadSource =
  "WEBSITE_FORM" | "WHATSAPP_CLICK" | "PHONE_CALL" | "DIRECT_WALK_IN";

export interface CustomerSummary {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  city?: string | null;
}

export interface LeadItem {
  id: string;
  customerId: string;
  customer: CustomerSummary;
  serviceId: string;
  serviceName: string;
  packageId?: string | null;
  packageTitle?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  claimedAt?: string | null;
  status: LeadStatus;
  source: LeadSource;
  travelDate?: string | null;
  numberOfAdults: number;
  numberOfKids: number;
  estimatedBudget?: number | null;
  followUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivityItem {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}
