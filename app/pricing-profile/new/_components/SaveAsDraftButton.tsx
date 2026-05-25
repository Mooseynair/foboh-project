"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSaveProfile } from "./ProfileFormProvider";

export function SaveAsDraftButton() {
  const save = useSaveProfile();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            const result = await save();
            toast.success("Profile saved", {
              description: `id: ${result.profile.id}`,
            });
          } catch (err) {
            toast.error("Could not save profile", {
              description: err instanceof Error ? err.message : "unknown error",
            });
          }
        })
      }
    >
      {pending ? "Saving…" : "Save as Draft"}
    </Button>
  );
}
