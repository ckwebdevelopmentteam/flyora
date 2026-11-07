export type QuoteStatus =
  "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export type QuotationItemType =
  "FLIGHT" | "HOTEL" | "VISA" | "TRANSFER" | "ACTIVITY" | "OTHER";

export interface QuotationItem {
  id: string;
  type: QuotationItemType;
  title: string;
  description?: string;
  details?: string;
  quantity: number;
  supplierCost: number;
  sellingPrice: number;
}

// Backward-compatibility alias
export type QuoteLineItem = QuotationItem;

export interface MarginCheckResult {
  supplierCost: number;
  sellingPrice: number;
  marginAmount: number;
  marginPercent: number;
  minMarginPercent: number;
  isHealthy: boolean;
  shortfallAmount: number;
}

export interface QuotationDetails {
  id: string;
  quoteNumber: string;
  version: number;
  leadId: string;
  createdById: string;
  createdByName?: string;
  status: QuoteStatus;
  shareToken: string;
  supplierCost: number;
  sellingPrice: number;
  marginAmount: number;
  marginPercent: number;
  items: QuotationItem[];
  inclusions: string[];
  exclusions: string[];
  validUntil: string;
  acceptedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  customer?: {
    id: string;
    fullName: string;
    phone: string;
    email?: string | null;
  };
  service?: {
    id: string;
    name: string;
    slug: string;
    minMarginPercent: number;
  };
}

// Sanitized Public View — STRICTLY ZERO SUPPLIER COSTS OR MARGINS LEAKED
export interface PublicQuotationItem {
  id: string;
  type: QuotationItemType;
  title: string;
  description?: string;
  quantity: number;
  sellingPrice: number;
}

export interface PublicQuotationView {
  quoteNumber: string;
  status: QuoteStatus;
  shareToken: string;
  totalPrice: number;
  items: PublicQuotationItem[];
  inclusions: string[];
  exclusions: string[];
  validUntil: string;
  isExpired: boolean;
  createdAt: string;
  customerName: string;
  serviceTitle: string;
  serviceSlug: string;
  coordinator: {
    fullName: string;
    phone?: string | null;
  };
}
