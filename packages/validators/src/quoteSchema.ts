import { z } from "zod";

export const quoteItemSchema = z.object({
  type: z.enum(["FLIGHT", "HOTEL", "VISA", "TRANSFER", "ACTIVITY", "OTHER"]),
  title: z.string().min(2, "Item title is required"),
  details: z.string().optional(),
  supplierCost: z.number().min(0, "Cost must be positive"),
  sellingPrice: z.number().min(0, "Price must be positive"),
});

export const createQuotationSchema = z.object({
  leadId: z.string().uuid(),
  items: z
    .array(quoteItemSchema)
    .min(1, "At least one item is required in the quote"),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  validUntil: z.string().min(1, "Validity date is required"),
  notes: z.string().optional(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
