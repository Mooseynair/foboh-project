import { z } from "zod";

export const AdjustmentSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("fixed"),
    direction: z.enum(["increase", "decrease"]),
    amount: z.number().min(0),
  }),
  z.object({
    mode: z.literal("dynamic"),
    direction: z.enum(["increase", "decrease"]),
    percent: z.number().min(0).max(1000),
  }),
]);

export const PricingProfileInputSchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().optional(),
  basedOn: z.literal("globalWholesale"),
  productIds: z.array(z.string().min(1)).min(1, "select at least one product"),
  adjustment: AdjustmentSchema,
  customerIds: z.array(z.string().min(1)).default([]),
  customerGroupIds: z.array(z.string().min(1)).default([]),
});

export const PricingProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  basedOn: z.literal("globalWholesale"),
  productIds: z.array(z.string()),
  adjustment: AdjustmentSchema,
  customerIds: z.array(z.string()),
  customerGroupIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string(),
  brand: z.string(),
  subCategory: z.string(),
  segment: z.string(),
  basePrice: z.number(),
});

export const CustomerGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  groupIds: z.array(z.string()),
});

export const ResolvedPriceSchema = z.object({
  price: z.number(),
  basePrice: z.number(),
  sourceProfileId: z.string().nullable(),
  why: z.string(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  issues: z.array(z.unknown()).optional(),
});

export type PricingProfileInput = z.infer<typeof PricingProfileInputSchema>;
export type PricingProfile = z.infer<typeof PricingProfileSchema>;
export type Adjustment = z.infer<typeof AdjustmentSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerGroup = z.infer<typeof CustomerGroupSchema>;
export type ResolvedPrice = z.infer<typeof ResolvedPriceSchema>;
