import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NutritionClient } from "./NutritionClient";
import { Profile, NutritionRecord } from "@/types/database";

export default async function AthleteNutritionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const { data: nutritionRecords } = await supabase
    .from("nutrition_records")
    .select("*")
    .eq("athlete_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardLayout profile={profile as Profile}>
      <NutritionClient
        athleteId={user.id}
        initialRecords={(nutritionRecords || []) as NutritionRecord[]}
      />
    </DashboardLayout>
  );
}
