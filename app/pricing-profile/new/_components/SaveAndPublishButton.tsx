"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProfileForm, useSaveProfile } from "./ProfileFormProvider";

export function SaveAndPublishButton() {
  const router = useRouter();
  const { state } = useProfileForm();
  const save = useSaveProfile();
  const [pending, startTransition] = useTransition();

  const allComplete =
    state.basicCompleted && state.productsCompleted && state.customersCompleted;

  return (
    <Button
      disabled={pending || !allComplete}
      onClick={() =>
        startTransition(async () => {
          try {
            const result = await save();
            toast.success("Profile published", {
              description: `id: ${result.profile.id}`,
            });
            router.push("/profiles");
          } catch (err) {
            toast.error("Could not publish profile", {
              description: err instanceof Error ? err.message : "unknown error",
            });
          }
        })
      }
    >
      {pending ? "Publishing…" : "Save and Publish"}
    </Button>
  );
}
