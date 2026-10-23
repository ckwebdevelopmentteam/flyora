import { z } from "zod";

export const quoteItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["FLIGHT", "HOTEL", "VISA", "TRANSFER", "ACTIVITY", "OTHER"]),
  title: z.string().min(2, "Item title is required"),
  description: z.string().optional(),
  details: z.string().optional(),
  quantity: z.coerce.number().int().positive().default(1),
  supplierCost: z.coerce.number().min(0, "Cost must be zero or positive"),
  sellingPrice: z.coerce.number().min(0, "Price must be positive"),
});

export const createQuotationSchema = z.object({
  leadId: z.string().uuid("Valid lead ID required"),
  items: z
    .array(quoteItemSchema)
    .min(1, "At least one item is required in the quote"),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  validUntil: z.string().min(1, "Validity date is required"),
  notes: z.string().max(2000).optional(),
});

export const updateQuotationStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationStatusInput = z.infer<
  typeof updateQuotationStatusSchema
>;
