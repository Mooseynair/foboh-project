"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Adjustment } from "@/lib/types";

type Props = {
  adjustment: Adjustment;
  onChange: (next: Adjustment) => void;
};

export function AdjustmentControls({ adjustment, onChange }: Props) {
  const setMode = (mode: Adjustment["mode"]) => {
    if (mode === adjustment.mode) return;
    onChange(
      mode === "fixed"
        ? { mode: "fixed", direction: adjustment.direction, amount: 5 }
        : { mode: "dynamic", direction: adjustment.direction, percent: 10 },
    );
  };

  const setDirection = (direction: Adjustment["direction"]) => {
    onChange({ ...adjustment, direction });
  };

  const setValue = (raw: string) => {
    const num = Number.parseFloat(raw);
    const value = Number.isFinite(num) && num >= 0 ? num : 0;
    onChange(
      adjustment.mode === "fixed"
        ? { ...adjustment, amount: value }
        : { ...adjustment, percent: value },
    );
  };

  const value =
    adjustment.mode === "fixed" ? adjustment.amount : adjustment.percent;
  const symbol = adjustment.mode === "fixed" ? "$" : "%";

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label>Based on</Label>
        <Select value="globalWholesale">
          <SelectTrigger className="max-w-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="globalWholesale">
              Global Wholesale Price
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Set Price Adjustment Mode</Label>
        <RadioGroup
          className="flex gap-6"
          value={adjustment.mode}
          onValueChange={(v) => setMode(v as Adjustment["mode"])}
        >
          <Row id="mode-fixed" value="fixed" label="Fixed ($)" />
          <Row id="mode-dynamic" value="dynamic" label="Dynamic (%)" />
        </RadioGroup>
      </div>

      <div className="grid gap-2">
        <Label>Set Price Adjustment Increment Mode</Label>
        <RadioGroup
          className="flex gap-6"
          value={adjustment.direction}
          onValueChange={(v) => setDirection(v as Adjustment["direction"])}
        >
          <Row id="dir-increase" value="increase" label="Increase +" />
          <Row id="dir-decrease" value="decrease" label="Decrease -" />
        </RadioGroup>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="adjustment-value">Adjustment</Label>
        <div className="relative max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {adjustment.direction === "increase" ? "+" : "-"} {symbol}
          </span>
          <Input
            id="adjustment-value"
            className="pl-12"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={Number.isNaN(value) ? "" : value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          The adjusted price will be calculated from{" "}
          <span className="font-medium text-foreground">
            Global Wholesale Price
          </span>{" "}
          selected above
        </p>
      </div>
    </div>
  );
}

function Row({
  id,
  value,
  label,
}: {
  id: string;
  value: string;
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
