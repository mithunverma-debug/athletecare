import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WellnessFormClient } from "./WellnessFormClient";
import { Profile, WellnessRecord } from "@/types/database";

export default async function AthleteWellnessPage() {
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

  // Fetch all historical wellness records for this athlete
  const { data: wellnessRecords } = await supabase
    .from("wellness_records")
    .select("*")
    .eq("athlete_id", user.id)
    .order("record_date", { ascending: false });

  return (
    <DashboardLayout profile={profile as Profile}>
      <WellnessFormClient
        athleteId={user.id}
        initialRecords={(wellnessRecords || []) as WellnessRecord[]}
      />
    </DashboardLayout>
  );
}
