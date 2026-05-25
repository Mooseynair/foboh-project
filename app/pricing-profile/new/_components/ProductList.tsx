"use client";

import { Wine } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function ProductList({ products, selectedIds, onToggle }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
        No products match the current filters.
      </div>
    );
  }
  return (
    <ul className="divide-y rounded-md border">
      {products.map((product) => {
        const checked = selectedIds.has(product.id);
        return (
          <li
            key={product.id}
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() => onToggle(product.id)}
              id={`product-${product.id}`}
              aria-label={product.title}
            />
            <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
              <Wine className="size-5" />
            </div>
            <label
              htmlFor={`product-${product.id}`}
              className="flex flex-1 cursor-pointer flex-col"
            >
              <span className="text-sm font-medium">{product.title}</span>
              <span className="text-xs text-muted-foreground">
                SKU {product.sku} · {product.uom}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
