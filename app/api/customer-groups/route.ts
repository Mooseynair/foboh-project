import { listCustomerGroups } from "@/lib/db/store";

export async function GET() {
  return Response.json({ customerGroups: listCustomerGroups() });
}
