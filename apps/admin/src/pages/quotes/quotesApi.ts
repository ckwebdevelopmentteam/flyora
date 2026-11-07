import { apiClient } from "../../lib/apiClient";
import type { QuotationRecord, QuoteItemFormState } from "./types";
import type { QuoteStatus } from "@flyora/types";

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

export const quotesApi = {
  /**
   * Create a new quotation for a lead
   */
  async createQuotation(
    payload: CreateQuotationPayload,
  ): Promise<QuotationRecord> {
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

    const response = await apiClient.post<QuotationRecord>("/quotes", body);
    if (!response?.id || !response.quoteNumber || !response.shareToken)
      throw new Error(
        "The quotation wasn't confirmed. Please refresh before trying again.",
      );
    return response;
  },

  /**
   * Fetch all quotations created for a given lead
   */
  async fetchQuotationsForLead(leadId: string): Promise<QuotationRecord[]> {
    const result = await apiClient.get<QuotationRecord[]>(
      `/quotes/lead/${encodeURIComponent(leadId)}`,
    );
    if (!Array.isArray(result))
      throw new Error("We couldn't load the quotations. Please try again.");
    return result;
  },

  /**
   * Update quotation status
   */
  async updateQuoteStatus(quoteId: string, status: QuoteStatus): Promise<void> {
    await apiClient.patch(`/quotes/${encodeURIComponent(quoteId)}/status`, {
      status,
    });
  },
};
