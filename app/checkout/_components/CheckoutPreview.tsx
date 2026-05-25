"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAdjustment } from "@/lib/pricing";
import { resolvePriceForSubject, type ResolveSubject } from "@/lib/resolve";
import type {
  Customer,
  CustomerGroup,
  PricingProfile,
  Product,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  products: Product[];
  customers: Customer[];
  customerGroups: CustomerGroup[];
  profiles: PricingProfile[];
};

type Mode = "customer" | "group";

export function CheckoutPreview({
  products,
  customers,
  customerGroups,
  profiles,
}: Props) {
  const [mode, setMode] = useState<Mode>("customer");
  const [customerId, setCustomerId] = useState<string>(customers[0]?.id ?? "");
  const [groupId, setGroupId] = useState<string>(customerGroups[0]?.id ?? "");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const subject = useMemo<
    (ResolveSubject & { displayName: string }) | null
  >(() => {
    if (mode === "customer") {
      const c = customers.find((x) => x.id === customerId);
      if (!c) return null;
      return {
        kind: "customer",
        customerId: c.id,
        groupIds: c.groupIds,
        displayName: c.name,
      };
    }
    const g = customerGroups.find((x) => x.id === groupId);
    if (!g) return null;
    return { kind: "group", groupId: g.id, displayName: g.name };
  }, [mode, customerId, groupId, customers, customerGroups]);

  const subjectGroupNames =
    subject?.kind === "customer"
      ? (subject.groupIds
          .map((id) => customerGroups.find((g) => g.id === id)?.name)
          .filter(Boolean) as string[])
      : [];

  const rows = useMemo(() => {
    if (!subject) return [];
    return selectedProductIds
      .map((pid) => products.find((p) => p.id === pid))
      .filter((p): p is Product => Boolean(p))
      .map((product) => {
        const result = resolvePriceForSubject(subject, product, profiles);
        const sourceProfile = result.sourceProfileId
          ? profiles.find((p) => p.id === result.sourceProfileId) ?? null
          : null;
        return { product, result, sourceProfile };
      });
  }, [subject, selectedProductIds, products, profiles]);

  const subtotalBase = rows.reduce((s, r) => s + r.result.basePrice, 0);
  const subtotalFinal = rows.reduce((s, r) => s + r.result.price, 0);
  const delta = subtotalBase - subtotalFinal;

  const toggleProduct = (id: string, checked: boolean) => {
    setSelectedProductIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Buyer</CardTitle>
            <CardDescription>Who's checking out?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Buy as</Label>
              <RadioGroup
                value={mode}
                onValueChange={(v) => v && setMode(v as Mode)}
                className="flex gap-4"
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                  <RadioGroupItem value="customer" />
                  Individual customer
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                  <RadioGroupItem value="group" />
                  Customer group
                </label>
              </RadioGroup>
            </div>

            {mode === "customer" ? (
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select
                  value={customerId}
                  onValueChange={(v) => v && setCustomerId(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer">
                      {(v) =>
                        customers.find((c) => c.id === v)?.name ?? v
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {subjectGroupNames.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-muted-foreground">
                      Member of:
                    </span>
                    {subjectGroupNames.map((name) => (
                      <Badge key={name} variant="secondary">
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Customer group</Label>
                <Select
                  value={groupId}
                  onValueChange={(v) => v && setGroupId(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a group">
                      {(v) =>
                        customerGroups.find((g) => g.id === v)?.name ?? v
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {customerGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Shows pricing that applies to anyone in this group.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cart</CardTitle>
            <CardDescription>Pick the products to purchase.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {products.map((p) => {
                const checked = selectedProductIds.includes(p.id);
                return (
                  <li key={p.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 hover:bg-muted/40">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => toggleProduct(p.id, v === true)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {p.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.sku} · ${p.basePrice.toFixed(2)}
                        </p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>
            {subject
              ? `Pricing as seen by ${subject.displayName}.`
              : "Choose a buyer to begin."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Add at least one product to the cart to preview pricing.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Base</TableHead>
                    <TableHead>Applied profile</TableHead>
                    <TableHead className="text-right">Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ product, result, sourceProfile }) => {
                    const discounted = result.price < result.basePrice;
                    const increased = result.price > result.basePrice;
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.sku}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          ${result.basePrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="max-w-[260px]">
                          {sourceProfile ? (
                            <div className="space-y-1">
                              <Badge variant="secondary">
                                {sourceProfile.name}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {formatAdjustment(sourceProfile.adjustment)} ·{" "}
                                {result.why}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {result.why}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "font-semibold tabular-nums",
                              discounted && "text-emerald-600",
                              increased && "text-destructive",
                            )}
                          >
                            ${result.price.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-end">
                <dl className="w-full max-w-xs space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Subtotal (base)</dt>
                    <dd className="tabular-nums">${subtotalBase.toFixed(2)}</dd>
                  </div>
                  {delta !== 0 ? (
                    <div className="flex justify-between">
                      <dt
                        className={cn(
                          delta > 0 ? "text-emerald-600" : "text-destructive",
                        )}
                      >
                        {delta > 0 ? "Savings" : "Surcharge"}
                      </dt>
                      <dd
                        className={cn(
                          "tabular-nums",
                          delta > 0 ? "text-emerald-600" : "text-destructive",
                        )}
                      >
                        {delta > 0 ? "-" : "+"}${Math.abs(delta).toFixed(2)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">
                      ${subtotalFinal.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
