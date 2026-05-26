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

## Precedence Rule
The tricky part of this whole multiple-profile-matching problem is that you're trying to give the best price to the customer while also protecting margin for yourself and the supplier. It's a delicate balancing act.

### The rule: lowest price wins
Of all the profiles that match a given customer and product, the one that produces the lowest price for the customer wins.
If no profiles match, the customer pays the base list price. If the calculation somehow produces a negative number, it gets clamped to $0.

### Why I went with this
As a wholesale supplier you want to stay competitive. Small differences in price get multiplied across bulk orders, so being the brand that consistently gives customers the best deal they qualify for is what keeps them coming back and pulls new ones across from competitors. That's what drives the business long-term.
The other thing is it's just simple. There's no hidden ranking of "is sub-category more specific than brand," no judgement calls about which tier outranks which. A ranking system should only be built once you have real-world data showing which signals actually predict commercial intent. Without that, you're just guessing.

## Trade-offs
The biggest trade-off is obviously margin. Always picking the lowest price means you're not getting the best value for the supplier. I thought about this a lot, but I landed on customer value being more important because the whole point of pricing profiles existing in the first place is to discount stock and show the best value to the customer so they're more likely to buy. If that's the main job, then growth comes from customers coming back, which comes from offering the best prices. 
I also considered going by specificity where you weight profiles by how narrowly they target a customer or product, so a customer-specific SKU price would beat a group discount on a whole category. The problem is that without real-world data you're basically making up weights, and I couldn't justify the judgement calls (is segment more specific than brand? is sub-category? Is an independent retailer more specific than a VIP? who decides?). 
The real reason I rejected specificity though is a customer-trust thing. Imagine a flash sale of 50% off all wine, and Bondi Cellars has a bespoke $95 price on one specific bottle that lists at $120. Under specificity-first, every wine in Bondi's cart gets 50% off except the bottle they have a "bespoke" deal on, which now costs more than the flash sale price would have. From Bondi's seat at checkout this looks like they're getting shafted on the one product their loyalty was supposed to earn them a better deal on. They feel scammed, trust breaks, and they switch suppliers. In the digital age where it's easier than ever to compare prices, that kind of mismatch erodes customer trust which ultimately pushes customers away.



## What's next

1. **UI polish** — saw the Figma design too late. Need to align UI with exisitng UI.
2. **Unit tests** around `calculatePrice` (rounding/clamping) and `resolvePriceForSubject` (each branch, plus the brief's worked example as an integration check). The calculation is the easiest place for subtle bugs.
3. **Persistence** — swap the in-memory store for SQLite/Postgres without changing the API or UI surface.
