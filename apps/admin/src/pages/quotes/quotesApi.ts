import { apiClient } from "../../lib/apiClient";
import type { QuotationRecord, QuoteItemFormState } from "./types";
import type { QuoteStatus } from "@flyora/types";
import { calculateMargin, resolveServiceMinMargin } from "./marginCalculator";

export interface CreateQuotationPayload {
  leadId: string;
  customerName?: string;
  customerPhone?: string;
  serviceName?: string;
  packageTitle?: string;
  validUntil: string;
  items: QuoteItemFormState[];
  inclusions: string[];
  exclusions: string[];
  notes?: string;
  minMarginPercent?: number;
}

// In-memory / localStorage fallback store for quotations during development
const QUOTE_STORAGE_KEY = "flyora_admin_quotes_v1";

function getLocalQuotes(): QuotationRecord[] {
  try {
    const raw = localStorage.getItem(QUOTE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalQuotes(quotes: QuotationRecord[]): void {
  try {
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(quotes));
  } catch {
    // Ignore storage errors
  }
}

let quoteCounter = 1042;

export const quotesApi = {
  /**
   * Create a new quotation for a lead
   */
  async createQuotation(
    payload: CreateQuotationPayload,
  ): Promise<QuotationRecord> {
    const margin = calculateMargin({
      items: payload.items,
      minMarginPercent:
        payload.minMarginPercent ??
        resolveServiceMinMargin(payload.serviceName),
    });

    const body = {
      leadId: payload.leadId,
      validUntil: payload.validUntil,
      items: payload.items.map((it) => ({
        id: it.id,
        type: it.type,
        title: it.title,
        details: it.description,
        description: it.description,
        quantity: it.quantity,
        supplierCost: it.supplierCost,
        sellingPrice: it.sellingPrice,
      })),
      inclusions: payload.inclusions,
      exclusions: payload.exclusions,
      notes: payload.notes,
    };

    try {
      const response = await apiClient.post<QuotationRecord>("/quotes", body);
      if (response && response.quoteNumber) {
        // Also cache locally for smooth offline/drawer display
        const existing = getLocalQuotes().filter((q) => q.id !== response.id);
        saveLocalQuotes([response, ...existing]);
        return response;
      }
    } catch {
      // Backend not yet ready or offline -> fallback mock creation
    }

    // Mock Quotation Generation
    quoteCounter += 1;
    const year = new Date().getFullYear();
    const mockQuote: QuotationRecord = {
      id: `quote-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      quoteNumber: `FLY-${year}-${String(quoteCounter).padStart(4, "0")}`,
      leadId: payload.leadId,
      createdById: "coordinator-current",
      createdByName: "Service Coordinator",
      status: "SENT",
      shareToken: `token-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      supplierCost: margin.totalSupplierCost,
      sellingPrice: margin.totalSellingPrice,
      marginAmount: margin.grossMarginAmount,
      marginPercent: margin.marginPercent,
      items: payload.items,
      inclusions: payload.inclusions,
      exclusions: payload.exclusions,
      validUntil: payload.validUntil,
      notes: payload.notes || null,
      createdAt: new Date().toISOString(),
    };

    const existing = getLocalQuotes().filter((q) => q.id !== mockQuote.id);
    saveLocalQuotes([mockQuote, ...existing]);

    return mockQuote;
  },

  /**
   * Fetch all quotations created for a given lead
   */
  async fetchQuotationsForLead(leadId: string): Promise<QuotationRecord[]> {
    try {
      const response = await apiClient.get<QuotationRecord[]>(
        `/quotes/lead/${encodeURIComponent(leadId)}`,
      );
      if (Array.isArray(response)) {
        return response;
      }
    } catch {
      // Backend not ready -> use fallback store
    }

    return getLocalQuotes().filter((q) => q.leadId === leadId);
  },

  /**
   * Update quotation status
   */
  async updateQuoteStatus(quoteId: string, status: QuoteStatus): Promise<void> {
    try {
      await apiClient.patch(`/quotes/${encodeURIComponent(quoteId)}/status`, {
        status,
      });
    } catch {
      // Mock update
      const all = getLocalQuotes();
      const updated = all.map((q) => (q.id === quoteId ? { ...q, status } : q));
      saveLocalQuotes(updated);
    }
  },
};
