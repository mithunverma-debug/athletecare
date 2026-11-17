import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InjuriesClient } from "./InjuriesClient";
import { Profile, InjuryRecord, RehabilitationExercise } from "@/types/database";

export default async function AthleteInjuriesPage() {
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

  // Fetch injuries and rehabilitation exercises
  const { data: injuries } = await supabase
    .from("injury_records")
    .select("*")
    .eq("athlete_id", user.id)
    .order("injury_date", { ascending: false });

  const { data: exercises } = await supabase
    .from("rehabilitation_exercises")
    .select("*")
    .eq("athlete_id", user.id)
    .order("scheduled_date", { ascending: true });

  return (
    <DashboardLayout profile={profile as Profile}>
      <InjuriesClient
        athleteId={user.id}
        initialInjuries={(injuries || []) as InjuryRecord[]}
        initialExercises={(exercises || []) as RehabilitationExercise[]}
      />
    </DashboardLayout>
  );
}
