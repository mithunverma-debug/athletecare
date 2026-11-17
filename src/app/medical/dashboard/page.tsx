import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MedicalClient } from "./MedicalClient";
import { Profile, InjuryRecord, RehabilitationExercise } from "@/types/database";

export default async function MedicalDashboardPage() {
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

  if (!profile || (profile.role !== "medical" && profile.role !== "admin")) {
    redirect("/login");
  }

  // 1. Fetch assigned athletes for this medical staff
  const { data: assignments } = await supabase
    .from("medical_assignments")
    .select("athlete_id")
    .eq("medical_staff_id", user.id);

  const athleteIds = (assignments || []).map((a) => a.athlete_id);

  let assignedAthletes: Profile[] = [];
  let injuriesWithNames: Array<InjuryRecord & { athlete_name?: string }> = [];
  let exercisesWithNames: Array<RehabilitationExercise & { athlete_name?: string }> = [];

  if (athleteIds.length > 0) {
    // 2. Fetch profiles
    const { data: athletes } = await supabase
      .from("profiles")
      .select("*")
      .in("id", athleteIds);

    assignedAthletes = (athletes || []) as Profile[];

    // 3. Fetch injury reports for assigned athletes
    const { data: injuries } = await supabase
      .from("injury_records")
      .select("*")
      .in("athlete_id", athleteIds)
      .order("created_at", { ascending: false });

    injuriesWithNames = (injuries || []).map((inj) => {
      const match = assignedAthletes.find((a) => a.id === inj.athlete_id);
      return {
        ...inj,
        athlete_name: match ? match.full_name : "Athlete",
      };
    });

    // 4. Fetch rehabilitation exercises
    const { data: exercises } = await supabase
      .from("rehabilitation_exercises")
      .select("*")
      .in("athlete_id", athleteIds)
      .order("created_at", { ascending: false });

    exercisesWithNames = (exercises || []).map((ex) => {
      const match = assignedAthletes.find((a) => a.id === ex.athlete_id);
      return {
        ...ex,
        athlete_name: match ? match.full_name : "Athlete",
      };
    });
  }

  return (
    <DashboardLayout profile={profile as Profile}>
      <MedicalClient
        medicalStaffId={user.id}
        assignedAthletes={assignedAthletes}
        injuries={injuriesWithNames}
        exercises={exercisesWithNames}
      />
    </DashboardLayout>
  );
}
