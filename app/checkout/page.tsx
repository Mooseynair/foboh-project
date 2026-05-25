import {
  listCustomerGroups,
  listCustomers,
  listProducts,
  listProfiles,
} from "@/lib/db/store";
import { CheckoutPreview } from "./_components/CheckoutPreview";

export default async function CheckoutPreviewPage() {
  const [products, customers, customerGroups, profiles] = await Promise.all([
    Promise.resolve(listProducts()),
    Promise.resolve(listCustomers()),
    Promise.resolve(listCustomerGroups()),
    Promise.resolve(listProfiles()),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="mb-6">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Checkout Preview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See exactly what a customer or customer group is charged at checkout,
          based on the active pricing profiles.
        </p>
      </header>

      <CheckoutPreview
        products={products}
        customers={customers}
        customerGroups={customerGroups}
        profiles={profiles}
      />
    </div>
  );
}
