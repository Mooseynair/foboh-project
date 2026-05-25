"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Customer, CustomerGroup } from "@/lib/types";
import {
  useProfileForm,
  useProfileFormActions,
} from "./ProfileFormProvider";

type Props = {
  customers: Customer[];
  customerGroups: CustomerGroup[];
};

export function AssignCustomersCard({ customers, customerGroups }: Props) {
  const { state } = useProfileForm();
  const { toggleCustomer, toggleCustomerGroup } = useProfileFormActions();
  const hasAssignment =
    state.selectedCustomerIds.length > 0 ||
    state.selectedCustomerGroupIds.length > 0;

  return (
    <Card id="assign-customers-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">
            Assign Customers to Pricing Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose which customers this profile will be applied to
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {hasAssignment ? "● In progress" : "● Not Started"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Customer Groups
          </Label>
          <div className="flex flex-wrap gap-3">
            {customerGroups.map((group) => {
              const checked = state.selectedCustomerGroupIds.includes(group.id);
              return (
                <label
                  key={group.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted/40"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleCustomerGroup(group.id)}
                  />
                  {group.name}
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Individual Customers
          </Label>
          <div className="flex flex-wrap gap-3">
            {customers.map((customer) => {
              const checked = state.selectedCustomerIds.includes(customer.id);
              return (
                <label
                  key={customer.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted/40"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleCustomer(customer.id)}
                  />
                  {customer.name}
                </label>
              );
            })}
          </div>
        </div>

        <p className="pt-2 text-xs text-muted-foreground">
          Skeleton-only: this card is wired to state and gets persisted on save,
          but precedence-rule UX comes in the next pass.
        </p>
      </CardContent>
    </Card>
  );
}
