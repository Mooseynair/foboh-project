import { createProfile, listProfiles } from "@/lib/db/store";
import { PricingProfileInputSchema } from "@/lib/schemas";

export async function GET() {
  return Response.json({ profiles: listProfiles() });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = PricingProfileInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const profile = createProfile(parsed.data);
  return Response.json({ profile }, { status: 201 });
}
