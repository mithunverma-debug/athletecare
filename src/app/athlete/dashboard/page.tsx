import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReadinessGauge } from "@/components/dashboard/ReadinessGauge";
import { WeeklyWellnessChart } from "@/components/charts/WeeklyWellnessChart";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { calculateReadinessScore, checkConsecutivePainAlert } from "@/lib/calculations/readiness";
import {
  Profile,
  WellnessRecord,
  NutritionRecord,
  InjuryRecord,
  RehabilitationExercise,
} from "@/types/database";
import {
  HeartPulse,
  Moon,
  Droplets,
  Smile,
  Dumbbell,
  AlertTriangle,
  Calendar,
  Utensils,
  Bandage,
} from "lucide-react";

export default async function AthleteDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Athlete Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // 2. Fetch Wellness Records (Latest 7 records for history)
  const { data: wellnessRecords } = await supabase
    .from("wellness_records")
    .select("*")
    .eq("athlete_id", user.id)
    .order("record_date", { ascending: false })
    .limit(7);

  const records = (wellnessRecords || []) as WellnessRecord[];
  const todayWellness = records.find((r) => r.record_date === todayStr) || records[0];

  // Calculate readiness score
  const readinessBreakdown = calculateReadinessScore(
    todayWellness
      ? {
          sleep_hours: todayWellness.sleep_hours,
          sleep_quality: todayWellness.sleep_quality,
          water_intake_ml: todayWellness.water_intake_ml,
          mood_rating: todayWellness.mood_rating,
          fatigue_level: todayWellness.fatigue_level,
          soreness_level: todayWellness.soreness_level,
        }
      : {}
  );

  // Format 7-day trend chart data (chronological order)
  const chartData = [...records].reverse().map((r) => ({
    date: r.record_date,
    displayDate: new Date(r.record_date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    readiness: Number(r.readiness_score) || 0,
    sleep: Number(r.sleep_hours) || 0,
    fatigue: Number(r.fatigue_level) || 0,
    soreness: Number(r.soreness_level) || 0,
  }));

  // 3. Fetch Today's Nutrition Records
  const { data: nutritionData } = await supabase
    .from("nutrition_records")
    .select("*")
    .eq("athlete_id", user.id)
    .eq("record_date", todayStr);

  const meals = (nutritionData || []) as NutritionRecord[];
  const totalProtein = meals.reduce((sum, m) => sum + (Number(m.protein_g) || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (Number(m.carbohydrates_g) || 0), 0);
  const totalFats = meals.reduce((sum, m) => sum + (Number(m.fats_g) || 0), 0);
  const totalWater = meals.reduce((sum, m) => sum + (Number(m.water_intake_ml) || 0), 0);

  // 4. Fetch Active Injuries & Rehab
  const { data: injuryData } = await supabase
    .from("injury_records")
    .select("*")
    .eq("athlete_id", user.id)
    .order("injury_date", { ascending: false });

  const injuries = (injuryData || []) as InjuryRecord[];
  const activeInjuries = injuries.filter((i) => i.status !== "resolved");

  // Check 4-day consecutive pain alert
  const painAlert = checkConsecutivePainAlert(injuries);

  // 5. Fetch Pending Rehab Exercises
  const { data: rehabData } = await supabase
    .from("rehabilitation_exercises")
    .select("*")
    .eq("athlete_id", user.id)
    .eq("completed", false)
    .order("scheduled_date", { ascending: true })
    .limit(4);

  const pendingRehab = (rehabData || []) as RehabilitationExercise[];

  return (
    <DashboardLayout profile={profile as Profile}>
      <div className="space-y-6">
        {/* Welcome Header & Quick Action */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-sports-green uppercase tracking-wider">
                {profile.primary_sport ? `${profile.primary_sport} Athlete` : "Collegiate Athlete"}
              </span>
              {profile.playing_position && (
                <span className="text-xs text-slate-400">&bull; {profile.playing_position}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Welcome back, {profile.full_name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Indian Standard Date:{" "}
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/athlete/wellness"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sports-green hover:bg-sports-green-hover text-navy-950 font-bold text-sm shadow-md shadow-sports-green/10 hover:shadow-sports-green/20 transition-all"
            >
              <HeartPulse className="w-4 h-4" />
              {todayWellness?.record_date === todayStr ? "Update Check-in" : "Daily Check-in"}
            </Link>
          </div>
        </div>

        {/* High Pain Review Alert (if flagged) */}
        {painAlert.hasConsecutivePain && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-start gap-3 text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-rose-300">
                Authorized Sports Medical Review Flagged
              </p>
              <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">
                {painAlert.alertMessage} Please check in with your athletic department physiotherapist before participating in high-load drills.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic 100-Point Readiness Gauge */}
        <ReadinessGauge
          breakdown={readinessBreakdown}
          recordDate={todayWellness?.record_date}
        />

        {/* 4 Quick Stat Summaries (From Database) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sleep Summary */}
          <div className="glass-card p-5 rounded-2xl border border-navy-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Sleep Log</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-100">
                {todayWellness ? `${todayWellness.sleep_hours}h` : "--"}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">
                {todayWellness ? `(${todayWellness.sleep_quality}/10 qual)` : "No entry"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {todayWellness && todayWellness.sleep_hours >= 7
                ? "Optimal restorative sleep"
                : "Sleep below recommended 7h target"}
            </p>
          </div>

          {/* Water Intake Summary */}
          <div className="glass-card p-5 rounded-2xl border border-navy-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Hydration Status</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-100">
                {todayWellness ? `${todayWellness.water_intake_ml}` : "--"}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">ml</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {todayWellness && todayWellness.water_intake_ml >= 2500
                ? "Hydration target achieved"
                : "Target: 3,000 ml daily"}
            </p>
          </div>

          {/* Fatigue & Mood */}
          <div className="glass-card p-5 rounded-2xl border border-navy-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Fatigue & Mood</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Smile className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-100">
                {todayWellness ? `${todayWellness.fatigue_level}/10` : "--"}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">
                {todayWellness ? `Mood: ${todayWellness.mood_rating}/10` : "Awaiting log"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {todayWellness && todayWellness.fatigue_level <= 4
                ? "Low physical fatigue"
                : "Elevated muscular fatigue"}
            </p>
          </div>

          {/* Active Injuries / Soreness */}
          <div className="glass-card p-5 rounded-2xl border border-navy-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Injury & Soreness</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Bandage className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-100">
                {activeInjuries.length}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">
                Active concerns
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {activeInjuries.length === 0
                ? "Fully cleared for training"
                : `${activeInjuries[0].body_area} under care`}
            </p>
          </div>
        </div>

        {/* Weekly Trend Chart & Nutrition Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <WeeklyWellnessChart data={chartData} />
          </div>

          {/* Quick Nutrition Snapshot */}
          <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-navy-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-sports-green" />
                  Today&apos;s Nutrition
                </h3>
                <Link
                  href="/athlete/nutrition"
                  className="text-xs text-sports-green hover:underline font-semibold"
                >
                  Log meal &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-navy-850 border border-navy-800">
                  <span className="text-slate-400">Protein Intake</span>
                  <span className="font-bold text-slate-100">{totalProtein}g</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-navy-850 border border-navy-800">
                  <span className="text-slate-400">Carbohydrates</span>
                  <span className="font-bold text-slate-100">{totalCarbs}g</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-navy-850 border border-navy-800">
                  <span className="text-slate-400">Healthy Fats</span>
                  <span className="font-bold text-slate-100">{totalFats}g</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-navy-850 border border-navy-800">
                  <span className="text-slate-400">Water from Meals</span>
                  <span className="font-bold text-cyan-400">{totalWater} ml</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-navy-800 mt-4">
              <span className="text-[11px] text-slate-400 block leading-tight">
                Nutrition fuels athletic recovery. Add eggs, paneer, sprouts, or dal to hit protein targets.
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Rehabilitation Exercises & Recent Wellness Records */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rehab Exercises */}
          <div className="glass-card p-6 rounded-2xl border border-navy-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-purple-400" />
                Assigned Rehabilitation Drills
              </h3>
              <Link
                href="/athlete/injuries"
                className="text-xs text-sports-green hover:underline font-semibold"
              >
                View all &rarr;
              </Link>
            </div>

            {pendingRehab.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active rehabilitation exercises assigned by medical staff.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRehab.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {ex.exercise_name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {ex.instructions}
                      </p>
                      <span className="text-[10px] text-purple-400 mt-1 block">
                        Scheduled: {ex.scheduled_date}
                      </span>
                    </div>
                    <Link
                      href="/athlete/injuries"
                      className="text-xs text-sports-green hover:underline shrink-0 font-medium"
                    >
                      Complete &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Daily Logs Table */}
          <div className="glass-card p-6 rounded-2xl border border-navy-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sports-green" />
                Recent Wellness Logs
              </h3>
              <Link
                href="/athlete/wellness"
                className="text-xs text-sports-green hover:underline font-semibold"
              >
                Log history &rarr;
              </Link>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No wellness check-ins recorded yet. Start your first check-in today!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-navy-800">
                    <tr>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Sleep</th>
                      <th className="pb-2">Water</th>
                      <th className="pb-2">Readiness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/60">
                    {records.slice(0, 4).map((r) => (
                      <tr key={r.id} className="hover:bg-navy-850/40">
                        <td className="py-2.5 font-medium text-slate-200">
                          {r.record_date}
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {r.sleep_hours}h ({r.sleep_quality}/10)
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {r.water_intake_ml} ml
                        </td>
                        <td className="py-2.5 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] ${
                              (r.readiness_score || 0) >= 80
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : (r.readiness_score || 0) >= 60
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {r.readiness_score || 0}/100
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Educational Disclaimer */}
        <DisclaimerBanner />
      </div>
    </DashboardLayout>
  );
}
