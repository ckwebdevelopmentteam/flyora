import { z } from "zod";

export const leadStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "QUOTED",
  "NEGOTIATING",
  "BOOKED",
  "LOST",
]);

export const leadSourceEnum = z.enum([
  "WEBSITE_FORM",
  "WHATSAPP_CLICK",
  "PHONE_CALL",
  "DIRECT_WALK_IN",
]);

export const updateLeadStatusSchema = z.object({
  status: leadStatusEnum,
});

export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;

export const addLeadNoteSchema = z.object({
  note: z.string().min(1, "Note cannot be empty").max(2000, "Note too long"),
  followUpDate: z.string().optional().nullable().or(z.literal("")),
});

export type AddLeadNoteInput = z.infer<typeof addLeadNoteSchema>;

export const reassignLeadSchema = z.object({
  assignedToId: z.string().uuid("Please select a valid coordinator"),
});

export type ReassignLeadInput = z.infer<typeof reassignLeadSchema>;

export const leadFilterSchema = z.object({
  serviceId: z.string().uuid().optional(),
  status: leadStatusEnum.optional(),
  assignedToId: z.string().uuid().optional(),
  unassignedOnly: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type LeadFilterInput = z.infer<typeof leadFilterSchema>;

export const leadIdParamSchema = z.object({
  id: z.string().uuid("Invalid lead ID"),
});

export type LeadIdParam = z.infer<typeof leadIdParamSchema>;

export const createLeadSchema = z.object({
  fullName: z.string().min(2, "Customer name must be at least 2 characters"),
  phone: z.string().min(8, "Valid phone number is required"),
  email: z
    .string()
    .email("Valid email is required")
    .optional()
    .or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  serviceId: z.string().uuid("Please select a service"),
  packageId: z
    .preprocess(
      (val) =>
        val === "" || val === null || val === undefined ? undefined : val,
      z.string().uuid("Invalid package ID").optional().nullable(),
    )
    .optional(),
  source: leadSourceEnum.default("PHONE_CALL"),
  status: leadStatusEnum.default("NEW"),
  travelDate: z
    .preprocess(
      (val) =>
        val === "" || val === null || val === undefined ? undefined : val,
      z.string().optional().nullable(),
    )
    .optional(),
  numberOfAdults: z.coerce.number().int().min(1).default(1),
  numberOfKids: z.coerce.number().int().min(0).default(0),
  estimatedBudget: z
    .preprocess(
      (val) =>
        val === "" ||
        val === null ||
        val === undefined ||
        Number.isNaN(Number(val))
          ? undefined
          : Number(val),
      z
        .number()
        .positive("Budget must be greater than 0")
        .optional()
        .nullable(),
    )
    .optional(),
  note: z.string().max(2000).optional().or(z.literal("")),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
