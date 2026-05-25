import { listCustomers } from "@/lib/db/store";

export async function GET() {
  return Response.json({ customers: listCustomers() });
}
