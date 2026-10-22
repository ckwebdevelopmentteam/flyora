import { z } from "zod";

export const publicEnquirySchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid 10-digit phone number is required"),
  email: z
    .string()
    .email("Valid email is required")
    .optional()
    .or(z.literal("")),
  serviceId: z.string().uuid("Please select a service"),
  packageId: z.string().uuid().optional(),
  travelDate: z.string().optional(),
  numberOfAdults: z.number().int().min(1).default(1),
  numberOfKids: z.number().int().min(0).default(0),
  notes: z.string().max(1000).optional(),
  turnstileToken: z.string().optional(),
});

export type PublicEnquiryInput = z.infer<typeof publicEnquirySchema>;
