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
    minMarginPercent: z.number().finite().min(0).max(99).optional(),
    isActive: z.boolean().default(true),
  })
  .strict();
export const updateServiceSchema = createServiceSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "No changes supplied");
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

const serviceIds = z
  .array(z.string().uuid())
  .min(1)
  .max(1000)
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "Each service must appear once",
  );
export const reorderServicesSchema = z
  .object({ serviceIds, expectedServiceIds: serviceIds })
  .strict();
export type ReorderServicesInput = z.infer<typeof reorderServicesSchema>;
