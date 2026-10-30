import { z } from "zod";

export const itineraryDaySchema = z.object({
  day: z.number().int().min(1, "Day number must be at least 1"),
  title: z.string().min(2, "Day title is required"),
  description: z.string().min(5, "Day description is required"),
  meals: z.string().optional(),
  stay: z.string().optional(),
});

export const createPackageSchema = z.object({
  serviceId: z.string().uuid("Valid service ID is required"),
  title: z.string().min(3, "Package title must be at least 3 characters"),
  slug: z
    .string()
    .min(3)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    )
    .optional(),
  durationDays: z.number().int().min(1, "Duration days must be at least 1"),
  durationNights: z.number().int().min(0, "Duration nights cannot be negative"),
  destination: z.string().min(2, "Destination is required"),
  startingPrice: z.number().positive("Starting price must be positive"),
  coverImageUrl: z.string().url("Cover image must be a valid URL"),
  galleryImageUrls: z.array(z.string().url()).default([]),
  overview: z.string().min(10, "Overview must be at least 10 characters"),
  itinerary: z
    .array(itineraryDaySchema)
    .min(1, "At least 1 itinerary day is required"),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).default([]),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;

export const updatePackageSchema = createPackageSchema.partial();

export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

export const packageFilterSchema = z.object({
  serviceId: z.string().optional(),
  destination: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  featuredOnly: z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean().optional(),
  ),
  includeUnpublished: z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean().optional(),
  ),
});

export type PackageFilterInput = z.infer<typeof packageFilterSchema>;
