# FOBOH Pricing Profile

Supplier-facing pricing profile builder, built for the FOBOH engineering challenge. Lets a supplier browse + filter products, multi-select them into a profile, apply a fixed ($) or dynamic (%) increase/decrease adjustment, preview the new prices, and save the profile via an API. There's also a `/api/resolve-price` endpoint that takes a customer + product and returns the resolved price under the current precedence rule.

> **Skeleton pass.** This commit gets the happy path working end-to-end with a deliberately-generic placeholder precedence rule. The considered precedence rule + plain-English rationale (the actually-scored part of the brief) comes next.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 · shadcn/ui (base-nova preset, `@base-ui/react` primitives) · Zod for request validation · SWR for client-side filter refetches · in-memory store (Maps) backed by `globalThis` so it survives hot-reload.

## Getting started

```bash
pnpm install
pnpm dev      # http://localhost:3000 → redirects to /pricing-profile/new
pnpm build    # type check + lint + production build
```

The store is in-memory and reseeds when the process restarts. Seed data covers the 5 products from the brief, customer groups `Independent Retailers` + `VIP`, and customer `Bondi Cellars` (member of both).

## API quickstart

```bash
# List products (filterable)
curl 'http://localhost:3000/api/products?segment=Sparkling'

# Create the brief's scenario
curl -X POST http://localhost:3000/api/pricing-profiles \
  -H 'Content-Type: application/json' \
  -d '{"name":"Wine 10% off","basedOn":"globalWholesale",
       "productIds":["hgvpin216","koybrunv6","koynr1837","koyrie19","lacbnatnv6"],
       "adjustment":{"mode":"dynamic","direction":"decrease","percent":10},
       "customerIds":[],"customerGroupIds":["independent-retailers"]}'

# Resolve a price (Bondi Cellars + Koyama Methode Brut Nature NV)
curl 'http://localhost:3000/api/resolve-price?customerId=bondi-cellars&productId=koybrunv6'
# → { "price": 95, "basePrice": 120, "sourceProfileId": "prof_…", "why": "lowest of 3 matching profiles (placeholder rule)" }
```

| Method | Path | Notes |
|---|---|---|
| GET | `/api/products` | query: `q`, `category`, `segment`, `brand` |
| GET | `/api/customers` | |
| GET | `/api/customer-groups` | |
| GET / POST | `/api/pricing-profiles` | POST body validated with Zod |
| GET / PUT / DELETE | `/api/pricing-profiles/:id` | |
| GET | `/api/resolve-price` | query: `customerId`, `productId` → `{ price, basePrice, sourceProfileId, why }` |

## Precedence rule — current state

**Placeholder for this pass: "lowest final price wins."** Among all profiles that match the customer (directly or via any of their groups) AND include the product, compute each profile's final price and pick the minimum. Tie-break by `createdAt` ascending. If no profile matches, the customer pays `basePrice`.

This rule exists so the resolver endpoint is wired end-to-end. It is **not** the final answer — the brief calls out that the rationale is what's being scored, and that AI will produce a generic rule. The next pass replaces this with a considered specificity-based rule + the plain-English writeup the brief asks for. Under the placeholder rule, the brief's scenario (Profiles A/B/C → Bondi Cellars ordering Koyama Methode Brut Nature NV) resolves to **$95** via Profile C.

## Trade-offs in this pass

- **Lowest-price placeholder, not specificity.** Generic on purpose. Documented and flagged in the `why` string so it's obvious where the next pass plugs in.
- **In-memory store, no persistence beyond process lifetime.** Brief allows it. `globalThis` singleton keeps state across hot-reloads. Swap to SQLite/Postgres without touching API or UI by reimplementing `lib/db/store.ts`.
- **Single-page layout, no wizard gating.** Three cards stacked vertically to match the design reference. Back/Next are visual — keeps state model simple for the skeleton.
- **`Customer assignment` card is wired but minimal.** Persists into the save payload; UX is plain checkboxes, not the multi-step flow in the reference.
- **Round half-up at the calculation boundary** (`Math.round(n * 100) / 100`). Negative results clamp to 0.
- **No OpenAPI/Swagger yet.** Deferred — the routes are small enough that the curl examples above + Zod schemas cover most of what a spec would. `swagger-ui-react` + a hand-written `openapi.yaml` are the planned route.

## What's next

1. **Replace the placeholder precedence rule with a considered specificity-based one**, with the rationale in this README and the resolver code matching it line-for-line. Decide what "All Products" means at resolve time vs save time, and how deleted products fall out.
2. **OpenAPI/Swagger** at `/api/docs` via `swagger-ui-react` against a hand-written `openapi.yaml` derived from the Zod schemas.
3. **UI polish on the customer assignment card** — picker UX, sticky save bar, a "test this profile" panel that hits `/api/resolve-price` from the UI so reviewers can see the resolver working without a terminal.
4. **A few unit tests** around `calculatePrice` (rounding/clamping) and `resolvePrice` (each precedence branch) — the calculation is the easiest place for subtle bugs.

## AI usage

Built with Claude Code (Sonnet/Opus). Full conversation transcripts are committed alongside this code. The AI did the bulk of the typing; I directed the scope (skeleton-first, defer precedence rationale), pushed back on stitched-together generic code, and made the judgement calls flagged in the trade-offs section.
