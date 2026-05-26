# FOBOH Pricing Profile — project notes

A supplier-facing pricing profile tool (Next.js 16 + React 19 + shadcn/ui). Built for the FOBOH engineering challenge — see `README.md` for the brief, the precedence-rule rationale, and what to evaluate.

## Layout

- `app/pricing-profile/new/` — main create-profile flow. Server component does the initial parallel fetch from the in-memory store, then renders client cards inside a `ProfileFormProvider` (reducer-based form state).
- `app/profiles/` — saved-profiles list (delete, link back into create).
- `app/checkout/` — resolve-price preview UI: pick a customer or group + products, see what the resolver returns.
- `app/api-docs/` — Swagger UI rendering of `/api/openapi.json`.
- `app/api/` — REST routes: `products` (filterable), `customers`, `customer-groups`, `pricing-profiles` CRUD, `resolve-price` (precedence resolver), and `openapi.json` (spec).
- `lib/db/store.ts` — in-memory store backed by `globalThis` so it survives hot-reload. Module-level singleton. `cache()` wraps the read helpers for per-request dedup. Exports a thin `resolvePrice(customerId, productId)` that looks up the subject and delegates.
- `lib/db/seed.ts` — the 5 products from the brief, 2 customer groups (Independent Retailers, VIP), 1 customer (Bondi Cellars) in both groups.
- `lib/resolve.ts` — `resolvePriceForSubject` is where the actual precedence logic lives (kept separate from the store so it's pure and easy to test in isolation).
- `lib/pricing.ts` — `calculatePrice(base, adj)` clamps at 0, rounds to 2dp.
- `lib/schemas.ts` — Zod schemas. `PricingProfileInputSchema` is the source of truth for POST/PUT bodies.
- `lib/openapi.ts` — generates the OpenAPI 3 spec from the Zod schemas so it can't drift from runtime validation.

## Precedence rule

**Lowest-final-price wins.** `resolvePriceForSubject` in `lib/resolve.ts` filters profiles to those matching the customer (directly or via group) AND the product, then picks the one yielding the lowest final price. Tie-break by `createdAt` ascending. Falls back to `basePrice` if nothing matches. Full rationale in `README.md` — this is the final rule, not a placeholder, so don't propose replacing it with specificity-based scoring.

## Conventions worth remembering

- shadcn is the `base-nova` preset → primitives come from `@base-ui/react`, **not** Radix. Notably `Select.onValueChange` is typed `(v: string | null)`, so coerce when consuming.
- Next.js 16: `params` and `searchParams` are Promises — always `await`.
- Don't barrel-import shadcn components — import each one directly from `@/components/ui/<name>`.
- Preview prices are **derived during render** from selection × adjustment (no effect, no separate state). `useDeferredValue` keeps search-typing responsive. Filters drive SWR fetches with `keepPreviousData`.

## Verification

`pnpm build` runs lint + type check + production build. `pnpm dev` boots on `:3000` and redirects `/` → `/pricing-profile/new`. The resolver scenario from the brief (Profiles A/B/C → Bondi + Koyama Brut) returns `$95` from Profile C.
