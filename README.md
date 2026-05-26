# FOBOH Pricing Profile

Supplier-facing pricing profile builder, built for the FOBOH engineering challenge. Lets a supplier browse + filter products, multi-select them into a profile, apply a fixed ($) or dynamic (%) increase/decrease adjustment, preview the new prices, and save the profile via an API. There's also a `/api/resolve-price` endpoint that takes a customer + product and returns the resolved price under the precedence rule.

> The precedence rule below is the final answer, not a placeholder — rationale and trade-offs are in [Precedence rule](#precedence-rule).

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
# → { "price": 95, "basePrice": 120, "sourceProfileId": "prof_…", "why": "Lowest of 3 matching profiles" }
```

| Method | Path | Notes |
|---|---|---|
| GET | `/api/products` | query: `q`, `category`, `segment`, `brand` |
| GET | `/api/customers` | |
| GET | `/api/customer-groups` | |
| GET / POST | `/api/pricing-profiles` | POST body validated with Zod |
| GET / PUT / DELETE | `/api/pricing-profiles/:id` | |
| GET | `/api/resolve-price` | query: `customerId`, `productId` → `{ price, basePrice, sourceProfileId, why }` |
| GET | `/api/openapi.json` | OpenAPI 3 spec, generated from the Zod schemas |

Also browsable in the app: **`/profiles`** lists saved profiles (delete, jump back to create), **`/checkout`** is a resolve-price preview UI (pick a customer or group + products, see what the resolver returns), and **`/api-docs`** renders Swagger UI against `/api/openapi.json`.

## Precedence rule

**Lowest final price wins.** Among all profiles that match the customer (directly or via any of their groups) AND include the product, compute each profile's final price and pick the minimum. Tie-break by `createdAt` ascending. If no profile matches, the customer pays `basePrice`.

### Why this rule

- **Customer-friendly by construction.** When multiple profiles legitimately apply to a customer (direct + via group, or via two groups), they get the best deal they qualify for. No surprises like "you'd have gotten a better price if you hadn't been promoted to VIP last week."
- **Operator-friendly to reason about.** No specificity scoring, no group-size tiebreakers, no "which profile took precedence and why" debugging. The resolver's answer is mechanical and inspectable: it was the cheapest of N matching profiles, and the `why` string says exactly that.
- **Stable under overlap.** Suppliers stacking promos (category-wide discount + customer-group loyalty program) get additive intent honored — the more aggressive promo applies, and the gentler one becomes the floor for customers who don't qualify for the deeper one.
- **`createdAt` tiebreak is FIFO and deterministic.** When two profiles produce the same final price, the older one wins. Re-creating a profile to "win" requires deliberately deleting the old one — no accidental override from editing.
- **Honest about its trade-off.** It costs the supplier revenue when promos overlap. That's a deliberate call: the tool is supplier-facing, but the *resolver* models what the customer actually pays, and customer trust beats squeezing the last dollar from overlap edge cases. Suppliers who don't want overlap shouldn't create overlapping profiles — the tool doesn't prevent it, but the rule doesn't reward it either.

### Worked example

The brief's scenario: customer **Bondi Cellars** (member of both `Independent Retailers` and `VIP`) ordering **Koyama Methode Brut Nature NV** (`$120` base) with Profiles A, B, C from the brief all matching. Each profile's final price for that product is computed; **Profile C** wins at **$95** because it produces the lowest. The `why` string returned by `/api/resolve-price` reads `"Lowest of 3 matching profiles"`.

## Trade-offs

- **In-memory store, no persistence beyond process lifetime.** Brief allows it. `globalThis` singleton keeps state across hot-reloads. Swap to SQLite/Postgres without touching API or UI by reimplementing `lib/db/store.ts`.
- **Single-page create flow, no wizard gating.** Three cards stacked vertically to match the design reference. Back/Next are visual — keeps state model simple.
- **`Customer assignment` card is wired but minimal.** Persists into the save payload; UX is plain checkboxes, not the multi-step flow in the reference.
- **Round half-up at the calculation boundary** (`Math.round(n * 100) / 100`). Negative results clamp to 0.
- **OpenAPI spec is generated from Zod, not hand-authored.** Means the spec can't drift from runtime validation — but the descriptions are sparse since they're not curated.

## What's next

1. **UI polish on the customer assignment card** — picker UX, sticky save bar, mobile nav (the sidebar is desktop-only today).
2. **Unit tests** around `calculatePrice` (rounding/clamping) and `resolvePriceForSubject` (each branch, plus the brief's worked example as an integration check). The calculation is the easiest place for subtle bugs.
3. **Persistence** — swap the in-memory store for SQLite/Postgres without changing the API or UI surface.

## AI usage

Built with Claude Code (Sonnet/Opus). Full conversation transcripts are committed alongside this code. The AI did the bulk of the typing; I directed the scope, pushed back on stitched-together generic code, and made the judgement calls flagged in the trade-offs section.
