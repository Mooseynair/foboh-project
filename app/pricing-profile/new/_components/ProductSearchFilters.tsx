"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProductFilterState = {
  q: string;
  sku: string;
  category: string;
  segment: string;
  brand: string;
};

const ALL = "__all__";

type Props = {
  value: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  categories: string[];
  segments: string[];
  brands: string[];
};

export function ProductSearchFilters({
  value,
  onChange,
  categories,
  segments,
  brands,
}: Props) {
  const set = (patch: Partial<ProductFilterState>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search"
          value={value.q}
          onChange={(e) => set({ q: e.target.value })}
        />
      </div>
      <Input
        placeholder="Product / SKU"
        value={value.sku}
        onChange={(e) => set({ sku: e.target.value })}
      />
      <SelectFilter
        placeholder="Category"
        value={value.category}
        onChange={(v) => set({ category: v })}
        options={categories}
      />
      <SelectFilter
        placeholder="Segment"
        value={value.segment}
        onChange={(v) => set({ segment: v })}
        options={segments}
      />
      <SelectFilter
        placeholder="Brand"
        value={value.brand}
        onChange={(v) => set({ brand: v })}
        options={brands}
      />
    </div>
  );
}

function SelectFilter({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select
      value={value === "" ? ALL : value}
      onValueChange={(v) => onChange(!v || v === ALL ? "" : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {placeholder.toLowerCase()}s</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
