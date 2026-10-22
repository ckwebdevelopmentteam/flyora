export type QuoteStatus =
  "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface QuoteLineItem {
  id?: string;
  type: "FLIGHT" | "HOTEL" | "VISA" | "TRANSFER" | "ACTIVITY" | "OTHER";
  title: string;
  details?: string;
  supplierCost: number;
  sellingPrice: number;
}

export interface QuotationDetails {
  id: string;
  quoteNumber: string;
  leadId: string;
  createdById: string;
  createdByName?: string;
  status: QuoteStatus;
  shareToken: string;
  supplierCost: number;
  sellingPrice: number;
  marginAmount: number;
  marginPercent: number;
  items: QuoteLineItem[];
  inclusions: string[];
  exclusions: string[];
  validUntil: string;
  acceptedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}
