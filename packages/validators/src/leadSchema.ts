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
