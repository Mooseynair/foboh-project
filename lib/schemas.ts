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

export type PricingProfileInput = z.infer<typeof PricingProfileInputSchema>;
