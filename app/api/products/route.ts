import type { NextRequest } from "next/server";
import { listProducts } from "@/lib/db/store";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const products = listProducts({
    q: sp.get("q") ?? undefined,
    category: sp.get("category") ?? undefined,
    segment: sp.get("segment") ?? undefined,
    brand: sp.get("brand") ?? undefined,
  });
  return Response.json({ products });
}
