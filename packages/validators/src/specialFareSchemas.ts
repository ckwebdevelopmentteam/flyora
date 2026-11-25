import { z } from "zod";

export const specialFareFlightTypeEnum = z.enum(["NON_STOP", "CONNECTING"]);
export const specialFareStatusEnum = z.enum([
  "ACTIVE",
  "SOLD_OUT",
  "EXPIRED",
  "PAUSED",
]);

export const createSpecialFareSchema = z.object({
  airlineName: z.string().min(1, "Airline name is required").trim(),
  airlineCode: z.string().trim().optional().nullable(),
  flightNumber: z.string().trim().optional().nullable(),
  originCity: z.string().min(1, "Origin city is required").trim(),
  originCode: z
    .string()
    .min(2, "Origin airport code is required")
    .max(5)
    .trim()
    .toUpperCase(),
  destinationCity: z.string().min(1, "Destination city is required").trim(),
  destinationCode: z
    .string()
    .min(2, "Destination airport code is required")
    .max(5)
    .trim()
    .toUpperCase(),
  departureDate: z.string().min(1, "Departure date & time is required"),
  arrivalDate: z.string().optional().nullable(),
  flightType: specialFareFlightTypeEnum.default("NON_STOP"),
  baggageInfo: z
    .string()
    .trim()
    .min(1, "Baggage info is required")
    .default("30 Kg Check-in + 7 Kg Cabin"),
  totalSeats: z.coerce
    .number()
    .int()
    .positive("Total seats must be at least 1"),
  availableSeats: z.coerce.number().int().nonnegative().optional(),
  farePerSeat: z.coerce
    .number()
    .positive("Fare per seat must be greater than 0"),
  supplierCost: z.coerce.number().nonnegative().optional().nullable(),
  pnrNumber: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
  expiresAt: z.string().optional(),
  status: specialFareStatusEnum.default("ACTIVE"),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
});

export const updateSpecialFareSchema = createSpecialFareSchema.partial();

export const updateSpecialFareSeatsSchema = z
  .object({
    change: z.coerce.number().int().optional(),
    availableSeats: z.coerce.number().int().nonnegative().optional(),
  })
  .refine(
    (data) => data.change !== undefined || data.availableSeats !== undefined,
    { message: "Either change or availableSeats must be provided" },
  );

export const specialFareSearchQuerySchema = z.object({
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  date: z.string().trim().optional(),
  airline: z.string().trim().optional(),
  status: specialFareStatusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const specialFareEnquirySchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").trim(),
  phone: z.string().min(7, "Valid phone number is required").trim(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  passengerCount: z.coerce
    .number()
    .int()
    .positive("Must be at least 1 passenger")
    .default(1),
  notes: z.string().trim().optional(),
});

export type CreateSpecialFareInput = z.infer<typeof createSpecialFareSchema>;
export type UpdateSpecialFareInput = z.infer<typeof updateSpecialFareSchema>;
export type UpdateSpecialFareSeatsInput = z.infer<
  typeof updateSpecialFareSeatsSchema
>;
export type SpecialFareSearchQueryInput = z.infer<
  typeof specialFareSearchQuerySchema
>;
export type SpecialFareEnquiryInput = z.infer<typeof specialFareEnquirySchema>;
