import { cache } from "react";
import { resolvePriceForSubject } from "../resolve";
import type {
  Customer,
  CustomerGroup,
  PricingProfile,
  Product,
  ResolvedPrice,
} from "../types";
import {
  seedCustomerGroups,
  seedCustomers,
  seedProducts,
} from "./seed";

type Store = {
  products: Map<string, Product>;
  customers: Map<string, Customer>;
  customerGroups: Map<string, CustomerGroup>;
  profiles: Map<string, PricingProfile>;
};

declare global {
  // eslint-disable-next-line no-var
  var __foboh_store: Store | undefined;
}

function createStore(): Store {
  const store: Store = {
    products: new Map(seedProducts.map((p) => [p.id, p])),
    customers: new Map(seedCustomers.map((c) => [c.id, c])),
    customerGroups: new Map(seedCustomerGroups.map((g) => [g.id, g])),
    profiles: new Map(),
  };
  return store;
}

const store: Store = globalThis.__foboh_store ?? createStore();
if (!globalThis.__foboh_store) globalThis.__foboh_store = store;

export type ProductFilters = {
  q?: string;
  category?: string;
  segment?: string;
  brand?: string;
};

export const listProducts = cache(
  (filters: ProductFilters = {}): Product[] => {
    const q = filters.q?.trim().toLowerCase();
    const products = Array.from(store.products.values());
    return products.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) {
        return false;
      }
      if (filters.category && p.subCategory !== filters.category) return false;
      if (filters.segment && p.segment !== filters.segment) return false;
      if (filters.brand && p.brand !== filters.brand) return false;
      return true;
    });
  },
);

export const getProduct = cache((id: string): Product | undefined =>
  store.products.get(id),
);

export const listCustomers = cache((): Customer[] =>
  Array.from(store.customers.values()),
);

export const getCustomer = cache((id: string): Customer | undefined =>
  store.customers.get(id),
);

export const listCustomerGroups = cache((): CustomerGroup[] =>
  Array.from(store.customerGroups.values()),
);

export const listProfiles = cache((): PricingProfile[] =>
  Array.from(store.profiles.values()),
);

export const getProfile = cache((id: string): PricingProfile | undefined =>
  store.profiles.get(id),
);

export function createProfile(
  data: Omit<PricingProfile, "id" | "createdAt" | "updatedAt">,
): PricingProfile {
  const now = new Date().toISOString();
  const id = `prof_${Math.random().toString(36).slice(2, 10)}`;
  const profile: PricingProfile = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  store.profiles.set(id, profile);
  return profile;
}

export function updateProfile(
  id: string,
  patch: Partial<Omit<PricingProfile, "id" | "createdAt">>,
): PricingProfile | undefined {
  const existing = store.profiles.get(id);
  if (!existing) return undefined;
  const updated: PricingProfile = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  store.profiles.set(id, updated);
  return updated;
}

export function deleteProfile(id: string): boolean {
  return store.profiles.delete(id);
}

/**
 * Skeleton precedence rule — placeholder for the next pass.
 *
 * "Lowest final price wins": among all profiles that match the customer
 * (directly or via a group) AND include the product, compute each final
 * price and pick the minimum. Tie-break by createdAt ascending. The next
 * pass replaces this with a considered, specificity-based rule.
 */
export function resolvePrice(
  customerId: string,
  productId: string,
): ResolvedPrice | { error: string } {
  const customer = store.customers.get(customerId);
  if (!customer) return { error: "customer not found" };
  const product = store.products.get(productId);
  if (!product) return { error: "product not found" };

  return resolvePriceForSubject(
    { kind: "customer", customerId, groupIds: customer.groupIds },
    product,
    Array.from(store.profiles.values()),
  );
}
