import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CoachClient } from "./CoachClient";
import { Profile } from "@/types/database";

interface CoachAthleteCard {
  id: string;
  full_name: string;
  email: string;
  primary_sport: string | null;
  playing_position: string | null;
  latestScore: number | null;
  sleepHours: number | null;
  waterMl: number | null;
  trainingAvailability: "Full Training" | "Modified Drills" | "Rest Recommended" | "Awaiting Check-in";
  statusColor: "green" | "yellow" | "red" | "gray";
}

interface TrendPoint {
  date: string;
  displayDate: string;
  readiness: number;
  sleep: number;
  fatigue: number;
  soreness: number;
}

export default async function CoachDashboardPage() {
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

  if (!profile || (profile.role !== "coach" && profile.role !== "admin")) {
    redirect("/login");
  }

  // 1. Fetch team memberships for this coach
  const { data: memberships } = await supabase
    .from("team_memberships")
    .select("athlete_id")
    .eq("coach_id", user.id);

  const athleteIds = (memberships || []).map((m) => m.athlete_id);

  let teamAthletesData: CoachAthleteCard[] = [];
  let weeklyTeamTrend: TrendPoint[] = [];

  if (athleteIds.length > 0) {
    // 2. Fetch athlete profiles
    const { data: athletes } = await supabase
      .from("profiles")
      .select("*")
      .in("id", athleteIds);

    // 3. Fetch latest wellness records for these athletes
    const { data: wellnessRecords } = await supabase
      .from("wellness_records")
      .select("*")
      .in("athlete_id", athleteIds)
      .order("record_date", { ascending: false });

    const allRecords = wellnessRecords || [];

    teamAthletesData = (athletes || []).map((athlete) => {
      const athleteRecords = allRecords.filter((r) => r.athlete_id === athlete.id);
      const latest = athleteRecords[0];

      let availability: "Full Training" | "Modified Drills" | "Rest Recommended" | "Awaiting Check-in" =
        "Awaiting Check-in";
      let statusColor: "green" | "yellow" | "red" | "gray" = "gray";

      if (latest && latest.readiness_score != null) {
        const score = Number(latest.readiness_score);
        if (score >= 80) {
          availability = "Full Training";
          statusColor = "green";
        } else if (score >= 60) {
          availability = "Modified Drills";
          statusColor = "yellow";
        } else {
          availability = "Rest Recommended";
          statusColor = "red";
        }
      }

      return {
        id: athlete.id,
        full_name: athlete.full_name,
        email: athlete.email,
        primary_sport: athlete.primary_sport,
        playing_position: athlete.playing_position,
        latestScore: latest?.readiness_score ? Number(latest.readiness_score) : null,
        sleepHours: latest?.sleep_hours ? Number(latest.sleep_hours) : null,
        waterMl: latest?.water_intake_ml ? Number(latest.water_intake_ml) : null,
        trainingAvailability: availability,
        statusColor,
      };
    });

    // 4. Calculate 7-day average trend
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    weeklyTeamTrend = past7Days.map((dateStr) => {
      const dayRecords = allRecords.filter((r) => r.record_date === dateStr);
      const avgReadiness =
        dayRecords.length > 0
          ? Math.round(
              dayRecords.reduce((sum, r) => sum + (Number(r.readiness_score) || 0), 0) /
                dayRecords.length
            )
          : 75;
      const avgSleep =
        dayRecords.length > 0
          ? Math.round(
              (dayRecords.reduce((sum, r) => sum + (Number(r.sleep_hours) || 0), 0) /
                dayRecords.length) *
                10
            ) / 10
          : 7.5;

      return {
        date: dateStr,
        displayDate: new Date(dateStr).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        readiness: avgReadiness,
        sleep: avgSleep,
        fatigue: 3,
        soreness: 2,
      };
    });
  }

  return (
    <DashboardLayout profile={profile as Profile}>
      <CoachClient
        coachId={user.id}
        athletes={teamAthletesData}
        weeklyTeamTrend={weeklyTeamTrend}
      />
    </DashboardLayout>
  );
}
