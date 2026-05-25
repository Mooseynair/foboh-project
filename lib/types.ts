export type Product = {
  id: string;
  title: string;
  sku: string;
  brand: string;
  subCategory: string;
  segment: string;
  basePrice: number;
  uom: string;
};

export type CustomerGroup = {
  id: string;
  name: string;
};

export type Customer = {
  id: string;
  name: string;
  groupIds: string[];
};

export type Adjustment =
  | { mode: "fixed"; direction: "increase" | "decrease"; amount: number }
  | { mode: "dynamic"; direction: "increase" | "decrease"; percent: number };

export type PricingProfile = {
  id: string;
  name: string;
  description?: string;
  basedOn: "globalWholesale";
  productIds: string[];
  adjustment: Adjustment;
  customerIds: string[];
  customerGroupIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ResolvedPrice = {
  price: number;
  basePrice: number;
  sourceProfileId: string | null;
  why: string;
};
