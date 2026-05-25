@AGENTS.md

# FOBOH Pricing Profile — project notes

A supplier-facing pricing profile tool (Next.js 16 + React 19 + shadcn/ui). Built for the FOBOH engineering challenge — see `README.md` for the brief and what to evaluate.

## Layout

- `app/pricing-profile/new/` — the only real page. Server component does the initial parallel fetch from the in-memory store, then renders client cards inside a `ProfileFormProvider` (reducer-based form state).
- `app/api/` — REST routes: products (filterable), customers, customer-groups, pricing-profiles CRUD, and `resolve-price` (the precedence resolver).
- `lib/db/store.ts` — in-memory store backed by `globalThis` so it survives hot-reload. Module-level singleton. `cache()` wraps the read helpers for per-request dedup.
- `lib/db/seed.ts` — the 5 products from the brief, 2 customer groups (Independent Retailers, VIP), 1 customer (Bondi Cellars) in both groups.
- `lib/pricing.ts` — `calculatePrice(base, adj)` clamps at 0, rounds to 2dp.
- `lib/schemas.ts` — Zod schemas. `PricingProfileInputSchema` is the source of truth for POST/PUT bodies.

## Precedence rule (current state)

**Placeholder** — `resolvePrice` in `lib/db/store.ts` picks the lowest final price among all profiles that match the customer (direct or via group) AND include the product, tie-break by `createdAt`. The `why` string includes "placeholder rule" so callers can see it's not the final answer.

This is the deliberate skeleton choice. The next pass replaces it with a considered specificity-based rule + plain-English rationale in `README.md` (the actual scoring criterion in the brief).

## Conventions worth remembering

- shadcn is the `base-nova` preset → primitives come from `@base-ui/react`, **not** Radix. Notably `Select.onValueChange` is typed `(v: string | null)`, so coerce when consuming.
- Next.js 16: `params` and `searchParams` are Promises — always `await`.
- Don't barrel-import shadcn components — import each one directly from `@/components/ui/<name>`.
- Preview prices are **derived during render** from selection × adjustment (no effect, no separate state). `useDeferredValue` keeps search-typing responsive. Filters drive SWR fetches with `keepPreviousData`.

## Verification

`pnpm build` runs lint + type check + production build. `pnpm dev` boots on `:3000` and redirects `/` → `/pricing-profile/new`. The resolver scenario from the brief (Profiles A/B/C → Bondi + Koyama Brut) returns `$95` from Profile C under the placeholder rule.
