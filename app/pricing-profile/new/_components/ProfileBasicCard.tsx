"use client";

import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useProfileForm,
  useProfileFormActions,
} from "./ProfileFormProvider";

export function ProfileBasicCard() {
  const { state } = useProfileForm();
  const { setBasic, markBasicCompleted } = useProfileFormActions();
  const completed = state.basicCompleted;

  return (
    <Card id="profile-basic-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">
            {completed && state.name ? state.name : "Basic Pricing Profile"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {completed
              ? state.description || "No description"
              : "Name and describe this pricing profile"}
          </p>
        </div>
        <Badge variant={completed ? "default" : "secondary"} className="shrink-0">
          {completed ? "● Completed" : "● Not Started"}
        </Badge>
      </CardHeader>
      <CardContent>
        {completed ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markBasicCompleted(false)}
          >
            <Pencil className="mr-1 size-3.5" />
            Make Changes
          </Button>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              markBasicCompleted(true);
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="profile-name">Profile name</Label>
              <Input
                id="profile-name"
                value={state.name}
                onChange={(e) => setBasic(e.target.value, state.description)}
                placeholder="e.g. VIP Discount — Q1"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="profile-description">Description</Label>
              <Input
                id="profile-description"
                value={state.description}
                onChange={(e) => setBasic(state.name, e.target.value)}
                placeholder="What this profile is for"
              />
            </div>
            <div>
              <Button type="submit" size="sm" disabled={!state.name.trim()}>
                Mark as complete
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
