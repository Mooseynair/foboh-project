"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePlus2, Layers, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  {
    href: "/pricing-profile/new",
    label: "New Profile",
    icon: FilePlus2,
  },
  {
    href: "/profiles",
    label: "Saved Profiles",
    icon: Layers,
  },
  {
    href: "/checkout",
    label: "Checkout Preview",
    icon: ShoppingCart,
  },
];

export function Sidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-r border-foreground/10 bg-card">
      <div className="px-5 py-5">
        <Link href="/" className="block">
          <span className="font-heading text-base font-semibold tracking-tight">
            FOBOH
          </span>
          <p className="text-xs text-muted-foreground">Pricing Workspace</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-[10px] uppercase tracking-wide text-muted-foreground">
        v0 · in-memory store
      </div>
    </aside>
  );
}
