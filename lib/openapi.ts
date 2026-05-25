import { z } from "zod";
import {
  AdjustmentSchema,
  CustomerGroupSchema,
  CustomerSchema,
  ErrorResponseSchema,
  PricingProfileInputSchema,
  PricingProfileSchema,
  ProductSchema,
  ResolvedPriceSchema,
} from "@/lib/schemas";

const toSchema = (schema: z.ZodType) =>
  z.toJSONSchema(schema, { target: "openapi-3.0" });

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const jsonResponse = (description: string, schemaName: string) => ({
  description,
  content: {
    "application/json": { schema: ref(schemaName) },
  },
});

const errorResponse = (description: string) =>
  jsonResponse(description, "ErrorResponse");

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "FOBOH Pricing Profile API",
    version: "0.1.0",
    description:
      "REST API for the FOBOH supplier-facing pricing profile tool. " +
      "Backed by an in-memory store; all data resets when the server restarts.",
  },
  servers: [{ url: "/", description: "Current host" }],
  tags: [
    { name: "Products" },
    { name: "Customers" },
    { name: "Customer Groups" },
    { name: "Pricing Profiles" },
    { name: "Resolver" },
  ],
  components: {
    schemas: {
      Adjustment: toSchema(AdjustmentSchema),
      Product: toSchema(ProductSchema),
      Customer: toSchema(CustomerSchema),
      CustomerGroup: toSchema(CustomerGroupSchema),
      PricingProfile: toSchema(PricingProfileSchema),
      PricingProfileInput: toSchema(PricingProfileInputSchema),
      PricingProfilePatch: toSchema(PricingProfileInputSchema.partial()),
      ResolvedPrice: toSchema(ResolvedPriceSchema),
      ErrorResponse: toSchema(ErrorResponseSchema),
    },
  },
  paths: {
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        description:
          "Returns the catalog. Optional query params apply a case-insensitive " +
          "match on title/SKU (q) and exact-match filters.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Free-text search against title and SKU",
          },
          {
            name: "category",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Exact match on subCategory",
          },
          {
            name: "segment",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "brand",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Matching products",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["products"],
                  properties: {
                    products: {
                      type: "array",
                      items: ref("Product"),
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/customers": {
      get: {
        tags: ["Customers"],
        summary: "List customers",
        responses: {
          "200": {
            description: "All customers",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["customers"],
                  properties: {
                    customers: { type: "array", items: ref("Customer") },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/customer-groups": {
      get: {
        tags: ["Customer Groups"],
        summary: "List customer groups",
        responses: {
          "200": {
            description: "All customer groups",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["customerGroups"],
                  properties: {
                    customerGroups: {
                      type: "array",
                      items: ref("CustomerGroup"),
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/pricing-profiles": {
      get: {
        tags: ["Pricing Profiles"],
        summary: "List pricing profiles",
        responses: {
          "200": {
            description: "All profiles, in insertion order",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["profiles"],
                  properties: {
                    profiles: {
                      type: "array",
                      items: ref("PricingProfile"),
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Pricing Profiles"],
        summary: "Create a pricing profile",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: ref("PricingProfileInput") },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["profile"],
                  properties: { profile: ref("PricingProfile") },
                },
              },
            },
          },
          "400": errorResponse("Invalid JSON body or schema validation failed"),
        },
      },
    },
    "/api/pricing-profiles/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      get: {
        tags: ["Pricing Profiles"],
        summary: "Get a pricing profile",
        responses: {
          "200": {
            description: "Found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["profile"],
                  properties: { profile: ref("PricingProfile") },
                },
              },
            },
          },
          "404": errorResponse("Profile not found"),
        },
      },
      put: {
        tags: ["Pricing Profiles"],
        summary: "Update a pricing profile",
        description:
          "Partial update. Any field from PricingProfileInput may be provided; " +
          "omitted fields are left unchanged.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: ref("PricingProfilePatch") },
          },
        },
        responses: {
          "200": {
            description: "Updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["profile"],
                  properties: { profile: ref("PricingProfile") },
                },
              },
            },
          },
          "400": errorResponse("Invalid JSON body or schema validation failed"),
          "404": errorResponse("Profile not found"),
        },
      },
      delete: {
        tags: ["Pricing Profiles"],
        summary: "Delete a pricing profile",
        responses: {
          "204": { description: "Deleted" },
          "404": errorResponse("Profile not found"),
        },
      },
    },
    "/api/resolve-price": {
      get: {
        tags: ["Resolver"],
        summary: "Resolve the final price for a customer + product",
        description:
          "Applies the current precedence rule across all profiles that match " +
          "the customer (directly or via a customer group) and include the product.",
        parameters: [
          {
            name: "customerId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "productId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Resolved price",
            content: {
              "application/json": { schema: ref("ResolvedPrice") },
            },
          },
          "400": errorResponse("Missing customerId or productId"),
          "404": errorResponse("Customer or product not found"),
        },
      },
    },
  },
} as const;
