import { Button } from "@/components/ui/button";
import {
  listCustomerGroups,
  listCustomers,
  listProducts,
} from "@/lib/db/store";
import { ProfileBasicCard } from "./_components/ProfileBasicCard";
import { SelectProductPricingCard } from "./_components/SelectProductPricingCard";
import { AssignCustomersCard } from "./_components/AssignCustomersCard";
import { ProfileFormProvider } from "./_components/ProfileFormProvider";
import { SaveAsDraftButton } from "./_components/SaveAsDraftButton";

export default async function NewPricingProfilePage() {
  const [products, customers, customerGroups] = await Promise.all([
    Promise.resolve(listProducts()),
    Promise.resolve(listCustomers()),
    Promise.resolve(listCustomerGroups()),
  ]);

  const categories = Array.from(new Set(products.map((p) => p.subCategory))).sort();
  const segments = Array.from(new Set(products.map((p) => p.segment))).sort();
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

  return (
    <ProfileFormProvider>
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <nav className="text-sm text-muted-foreground">
              Pricing Profile <span className="mx-1">›</span>
              <span className="text-foreground">Setup a Profile</span>
            </nav>
            <p className="mt-1 text-sm text-muted-foreground">
              Setup your pricing profile, select products and assign customers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost">Cancel</Button>
            <SaveAsDraftButton />
          </div>
        </header>

        <div className="space-y-4">
          <ProfileBasicCard />
          <SelectProductPricingCard
            initialProducts={products}
            categories={categories}
            segments={segments}
            brands={brands}
          />
          <AssignCustomersCard
            customers={customers}
            customerGroups={customerGroups}
          />
        </div>
      </div>
    </ProfileFormProvider>
  );
}
