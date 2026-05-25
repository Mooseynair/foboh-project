"use client";

import { RefreshCcw } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import type { Product } from "@/lib/types";
import { AdjustmentControls } from "./AdjustmentControls";
import { PreviewTable } from "./PreviewTable";
import { ProductList } from "./ProductList";
import {
  ProductSearchFilters,
  type ProductFilterState,
} from "./ProductSearchFilters";
import {
  useProfileForm,
  useProfileFormActions,
  type ProductScope,
} from "./ProfileFormProvider";

type Props = {
  initialProducts: Product[];
  categories: string[];
  segments: string[];
  brands: string[];
};

const emptyFilters: ProductFilterState = {
  q: "",
  sku: "",
  category: "",
  segment: "",
  brand: "",
};

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<{ products: Product[] }>);

export function SelectProductPricingCard({
  initialProducts,
  categories,
  segments,
  brands,
}: Props) {
  const { state } = useProfileForm();
  const { setScope, toggleProduct, setProducts, setAdjustment } =
    useProfileFormActions();

  const [filters, setFilters] = useState<ProductFilterState>(emptyFilters);
  const deferredFilters = useDeferredValue(filters);

  const swrKey = useMemo(() => {
    const sp = new URLSearchParams();
    if (deferredFilters.q) sp.set("q", deferredFilters.q);
    if (deferredFilters.category) sp.set("category", deferredFilters.category);
    if (deferredFilters.segment) sp.set("segment", deferredFilters.segment);
    if (deferredFilters.brand) sp.set("brand", deferredFilters.brand);
    return `/api/products?${sp.toString()}`;
  }, [deferredFilters]);

  const { data } = useSWR(swrKey, fetcher, {
    fallbackData: { products: initialProducts },
    keepPreviousData: true,
  });

  // Client-side SKU substring filter (server `q` already searches title + sku;
  // the dedicated SKU input is a tighter filter the user can stack on top).
  const products = useMemo(() => {
    const all = data?.products ?? [];
    if (!filters.sku) return all;
    const needle = filters.sku.trim().toLowerCase();
    return all.filter((p) => p.sku.toLowerCase().includes(needle));
  }, [data, filters.sku]);

  const selectedIds = useMemo(
    () => new Set(state.selectedProductIds),
    [state.selectedProductIds],
  );

  const visibleIds = useMemo(() => products.map((p) => p.id), [products]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const selectedProducts = useMemo(() => {
    const lookup = new Map(
      [...initialProducts, ...products].map((p) => [p.id, p] as const),
    );
    return state.selectedProductIds
      .map((id) => lookup.get(id))
      .filter((p): p is Product => Boolean(p));
  }, [initialProducts, products, state.selectedProductIds]);

  const activeFilterChips = [
    filters.category && { key: "category", label: filters.category },
    filters.segment && { key: "segment", label: filters.segment },
    filters.brand && { key: "brand", label: filters.brand },
  ].filter(Boolean) as { key: string; label: string }[];

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      // Deselect only the visible products; keep selections from other filters intact.
      setProducts(
        state.selectedProductIds.filter((id) => !visibleIds.includes(id)),
      );
    } else {
      const next = new Set(state.selectedProductIds);
      for (const id of visibleIds) next.add(id);
      setProducts(Array.from(next));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Select Product Pricing</h2>
            <p className="text-sm text-muted-foreground">Set details</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {state.selectedProductIds.length} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>You are creating a Pricing Profile for</Label>
          <RadioGroup
            value={state.scope}
            onValueChange={(v) => setScope(v as ProductScope)}
            className="flex flex-wrap gap-6"
          >
            <ScopeRow id="scope-one" value="one" label="One Product" />
            <ScopeRow
              id="scope-multiple"
              value="multiple"
              label="Multiple Products"
            />
            <ScopeRow id="scope-all" value="all" label="All Products" />
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Search for Products</Label>
          <ProductSearchFilters
            value={filters}
            onChange={setFilters}
            categories={categories}
            segments={segments}
            brands={brands}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            Showing ({products.length} Result{products.length === 1 ? "" : "s"})
            {filters.q || filters.sku ? " for " : ""}
          </span>
          {(filters.q || filters.sku) && (
            <Badge variant="outline">
              {filters.q || filters.sku} (Product Name or SKU Code)
            </Badge>
          )}
          {activeFilterChips.map((chip) => (
            <Badge key={chip.key} variant="outline">
              {chip.label}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="font-medium text-primary hover:underline"
          >
            {allVisibleSelected ? "Deselect All" : "Select all"}
          </button>
          {state.selectedProductIds.length > 0 && (
            <span className="text-muted-foreground">
              You&apos;ve selected {state.selectedProductIds.length} product
              {state.selectedProductIds.length === 1 ? "" : "s"}, these will be
              added to this profile
            </span>
          )}
        </div>

        <ProductList
          products={products}
          selectedIds={selectedIds}
          onToggle={toggleProduct}
        />

        <Separator />

        <AdjustmentControls
          adjustment={state.adjustment}
          onChange={setAdjustment}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Preview new prices</p>
          <Button variant="ghost" size="sm" className="text-primary">
            <RefreshCcw className="mr-1 size-3.5" />
            Refresh New Price Table
          </Button>
        </div>

        <PreviewTable
          products={selectedProducts}
          adjustment={state.adjustment}
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Your entries are saved automatically
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost">Back</Button>
            <Button>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScopeRow({
  id,
  value,
  label,
}: {
  id: string;
  value: ProductScope;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem id={id} value={value} />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  );
}

