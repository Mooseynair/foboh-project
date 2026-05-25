import type { NextRequest } from "next/server";
import { resolvePrice } from "@/lib/db/store";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const customerId = sp.get("customerId");
  const productId = sp.get("productId");
  if (!customerId || !productId) {
    return Response.json(
      { error: "customerId and productId are required" },
      { status: 400 },
    );
  }
  const result = resolvePrice(customerId, productId);
  if ("error" in result) {
    return Response.json(result, { status: 404 });
  }
  return Response.json(result);
}
