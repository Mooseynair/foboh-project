"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculatePrice, formatAdjustment } from "@/lib/pricing";
import type { Adjustment, Product } from "@/lib/types";

type Props = {
  products: Product[];
  adjustment: Adjustment;
};

export function PreviewTable({ products, adjustment }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
        Select products above to preview new prices.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Title</TableHead>
            <TableHead>SKU Code</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Global Wholesale Price</TableHead>
            <TableHead className="text-right">Adjustment</TableHead>
            <TableHead className="text-right">New Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const newPrice = calculatePrice(product.basePrice, adjustment);
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {product.sku}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.subCategory}
                </TableCell>
                <TableCell className="text-right">
                  ${product.basePrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatAdjustment(adjustment)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${newPrice.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
