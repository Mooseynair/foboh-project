import { deleteProfile, getProfile, updateProfile } from "@/lib/db/store";
import { PricingProfileInputSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const profile = getProfile(id);
  if (!profile) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ profile });
}

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = PricingProfileInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const profile = updateProfile(id, parsed.data);
  if (!profile) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ profile });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const ok = deleteProfile(id);
  if (!ok) return Response.json({ error: "not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
