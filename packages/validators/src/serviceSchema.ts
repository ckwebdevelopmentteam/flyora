import { z } from "zod";

export const createServiceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter a service name")
      .max(80, "Use 80 characters or fewer"),
    description: z
      .string()
      .trim()
      .max(500, "Use 500 characters or fewer")
      .default(""),
    minMarginPercent: z.number().finite().min(0).max(99),
    isActive: z.boolean().default(true),
  })
  .strict();
export const updateServiceSchema = createServiceSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "No changes supplied");
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
