"use client";

import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const { toggleCustomer, toggleCustomerGroup, markCustomersCompleted } =
    useProfileFormActions();
  const completed = state.customersCompleted;
  const groupCount = state.selectedCustomerGroupIds.length;
  const customerCount = state.selectedCustomerIds.length;
  const hasAssignment = customerCount > 0 || groupCount > 0;
  const summary = hasAssignment
    ? `${groupCount} group${groupCount === 1 ? "" : "s"}, ${customerCount} customer${
        customerCount === 1 ? "" : "s"
      } assigned`
    : "No customers assigned";

  return (
    <Card id="assign-customers-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">
            Assign Customers to Pricing Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            {completed
              ? summary
              : "Choose which customers this profile will be applied to"}
          </p>
        </div>
        <Badge
          variant={completed ? "default" : "secondary"}
          className={
            completed
              ? "shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "shrink-0"
          }
        >
          {completed ? "● Completed" : "● Not Started"}
        </Badge>
      </CardHeader>
      <CardContent className={completed ? undefined : "space-y-4"}>
        {completed ? (
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markCustomersCompleted(false)}
            >
              <Pencil className="mr-1 size-3.5" />
              Make Changes
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Customer Groups
              </Label>
              <div className="flex flex-wrap gap-3">
                {customerGroups.map((group) => {
                  const checked = state.selectedCustomerGroupIds.includes(
                    group.id,
                  );
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
                  const checked = state.selectedCustomerIds.includes(
                    customer.id,
                  );
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

            <div className="flex items-center justify-end pt-2">
              <Button
                onClick={() => markCustomersCompleted(true)}
                disabled={!hasAssignment}
              >
                Mark as complete
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
