import Link from "next/link";
import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  listCustomerGroups,
  listCustomers,
  listProducts,
  listProfiles,
} from "@/lib/db/store";
import { formatAdjustment } from "@/lib/pricing";

import { DeleteProfileButton } from "./_components/DeleteProfileButton";

export default async function SavedProfilesPage() {
  const [profiles, products, customers, customerGroups] = await Promise.all([
    Promise.resolve(listProfiles()),
    Promise.resolve(listProducts()),
    Promise.resolve(listCustomers()),
    Promise.resolve(listCustomerGroups()),
  ]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const customerById = new Map(customers.map((c) => [c.id, c]));
  const groupById = new Map(customerGroups.map((g) => [g.id, g]));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Saved Profiles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every pricing profile you've saved, at a glance.
          </p>
        </div>
        <Link href="/pricing-profile/new">
          <Button>New profile</Button>
        </Link>
      </header>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No profiles yet. Create one to see it here.
            </p>
            <Link
              href="/pricing-profile/new"
              className="mt-4 inline-block"
            >
              <Button variant="outline" size="sm">
                Create your first profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => {
            const adjMode = profile.adjustment.mode === "fixed" ? "Fixed" : "Dynamic";
            const productSample = profile.productIds
              .slice(0, 3)
              .map((id) => productById.get(id)?.title)
              .filter((t): t is string => Boolean(t));
            const more = profile.productIds.length - productSample.length;
            const groupNames = profile.customerGroupIds
              .map((id) => groupById.get(id)?.name)
              .filter((n): n is string => Boolean(n));
            const customerNames = profile.customerIds
              .map((id) => customerById.get(id)?.name)
              .filter((n): n is string => Boolean(n));

            return (
              <Card key={profile.id} className="h-full">
                <CardHeader>
                  <CardTitle className="truncate">{profile.name}</CardTitle>
                  {profile.description ? (
                    <CardDescription className="line-clamp-2">
                      {profile.description}
                    </CardDescription>
                  ) : null}
                  <CardAction>
                    <DeleteProfileButton
                      profileId={profile.id}
                      profileName={profile.name}
                    />
                  </CardAction>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <Section label="Adjustment">
                    <div className="flex items-baseline gap-2">
                      <Badge variant="secondary">{adjMode}</Badge>
                      <span className="text-base font-semibold tabular-nums">
                        {formatAdjustment(profile.adjustment)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        vs base wholesale
                      </span>
                    </div>
                  </Section>

                  <Section
                    label={`Products affected (${profile.productIds.length})`}
                  >
                    {productSample.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No products
                      </p>
                    ) : (
                      <ul className="space-y-0.5 text-sm">
                        {productSample.map((title) => (
                          <li key={title} className="truncate">
                            {title}
                          </li>
                        ))}
                        {more > 0 ? (
                          <li className="text-xs text-muted-foreground">
                            +{more} more
                          </li>
                        ) : null}
                      </ul>
                    )}
                  </Section>

                  <Section label="Applied to">
                    {groupNames.length === 0 && customerNames.length === 0 ? (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="size-3.5" />
                        Not assigned
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {groupNames.map((name) => (
                          <Badge key={`g-${name}`} variant="default">
                            {name}
                          </Badge>
                        ))}
                        {customerNames.map((name) => (
                          <Badge key={`c-${name}`} variant="outline">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Section>
                </CardContent>

                <CardFooter className="justify-between text-xs text-muted-foreground">
                  <span>
                    Created{" "}
                    {new Date(profile.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-mono">{profile.id}</span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
