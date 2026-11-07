import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(254),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72)
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      "Password is too long",
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72)
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      "Password is too long",
    ),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  role: z.enum([
    "SUPER_ADMIN",
    "OPERATIONS_MANAGER",
    "SERVICE_COORDINATOR",
    "CONTENT_MANAGER",
    "ACCOUNTS",
  ]),
  serviceIds: z.array(z.string()).default([]),
  primaryServiceId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateProfileSchema = z.object({
  phone: z.string().optional().nullable().or(z.literal("")),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
