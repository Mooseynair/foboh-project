import { calculatePrice } from "./pricing";
import type { PricingProfile, Product, ResolvedPrice } from "./types";

export type ResolveSubject =
  | { kind: "customer"; customerId: string; groupIds: string[] }
  | { kind: "group"; groupId: string };

/**
 * Lowest-final-price wins: among profiles matching the subject AND product,
 * return the one yielding the lowest price. Tie-break by `createdAt` asc.
 * Falls back to `basePrice` if nothing matches. Rationale in README.md.
 */
export function resolvePriceForSubject(
  subject: ResolveSubject,
  product: Product,
  profiles: PricingProfile[],
): ResolvedPrice {
  const matching = profiles
    .filter((p) => {
      if (!p.productIds.includes(product.id)) return false;
      if (subject.kind === "customer") {
        return (
          p.customerIds.includes(subject.customerId) ||
          p.customerGroupIds.some((g) => subject.groupIds.includes(g))
        );
      }
      return p.customerGroupIds.includes(subject.groupId);
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  if (matching.length === 0) {
    return {
      price: product.basePrice,
      basePrice: product.basePrice,
      sourceProfileId: null,
      why: "no matching profile — base price applies",
    };
  }

  let best: { price: number; profile: PricingProfile } | null = null;
  for (const profile of matching) {
    const price = calculatePrice(product.basePrice, profile.adjustment);
    if (best === null || price < best.price) {
      best = { price, profile };
    }
  }

  return {
    price: best!.price,
    basePrice: product.basePrice,
    sourceProfileId: best!.profile.id,
    why:
      matching.length === 1
        ? "Only matching profile"
        : `Lowest of ${matching.length} matching profiles`,
  };
}
