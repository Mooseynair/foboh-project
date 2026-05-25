import type { Adjustment } from "./types";

export function calculatePrice(base: number, adj: Adjustment): number {
  const delta =
    adj.mode === "fixed" ? adj.amount : (adj.percent / 100) * base;
  const signed = adj.direction === "increase" ? base + delta : base - delta;
  const clamped = Math.max(0, signed);
  return Math.round(clamped * 100) / 100;
}

export function formatAdjustment(adj: Adjustment): string {
  const sign = adj.direction === "increase" ? "+" : "-";
  return adj.mode === "fixed"
    ? `${sign}$${adj.amount.toFixed(2)}`
    : `${sign}${adj.percent}%`;
}
