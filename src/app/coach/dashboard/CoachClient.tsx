"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WeeklyWellnessChart } from "@/components/charts/WeeklyWellnessChart";
import {
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  Search,
} from "lucide-react";

interface TeamAthlete {
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

interface CoachClientProps {
  coachId: string;
  athletes: TeamAthlete[];
  weeklyTeamTrend: Array<{
    date: string;
    displayDate: string;
    readiness: number;
    sleep: number;
    fatigue: number;
    soreness: number;
  }>;
}

export function CoachClient({ coachId, athletes, weeklyTeamTrend }: CoachClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newAthleteEmail, setNewAthleteEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Statistics
  const totalAthletes = athletes.length;
  const activeCount = athletes.filter((a) => a.latestScore != null).length;
  const attentionCount = athletes.filter(
    (a) => a.latestScore != null && a.latestScore < 60
  ).length;

  const validScores = athletes.filter((a) => a.latestScore != null).map((a) => a.latestScore!);
  const teamAverageReadiness =
    validScores.length > 0
      ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length)
      : 0;

  // Filter athletes
  const filteredAthletes = athletes.filter((a) => {
    const matchesSearch =
      a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.primary_sport && a.primary_sport.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.playing_position && a.playing_position.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === "attention") {
      return matchesSearch && a.latestScore != null && a.latestScore < 60;
    }
    if (filterStatus === "optimal") {
      return matchesSearch && a.latestScore != null && a.latestScore >= 80;
    }
    return matchesSearch;
  });

  const handleAddAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthleteEmail.trim()) return;

    setAdding(true);
    setAddMsg(null);

    // 1. Search for profile by email
    const { data: athleteProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("email", newAthleteEmail.trim().toLowerCase())
      .single();

    if (profileErr || !athleteProfile) {
      setAddMsg({ type: "error", text: "No registered athlete found with that email." });
      setAdding(false);
      return;
    }

    if (athleteProfile.role !== "athlete") {
      setAddMsg({ type: "error", text: "Selected user is not an athlete." });
      setAdding(false);
      return;
    }

    // 2. Add to team_memberships
    const { error: teamErr } = await supabase.from("team_memberships").insert({
      coach_id: coachId,
      athlete_id: athleteProfile.id,
    });

    if (teamErr) {
      if (teamErr.code === "23505") {
        setAddMsg({ type: "error", text: "Athlete is already in your team roster." });
      } else {
        setAddMsg({ type: "error", text: teamErr.message });
      }
    } else {
      setAddMsg({
        type: "success",
        text: `Added ${athleteProfile.full_name} to your team roster!`,
      });
      setNewAthleteEmail("");
      router.refresh();
    }

    setAdding(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Head Coach Roster Hub
            </span>
            <span className="text-xs text-slate-500">&bull; Privacy Compliant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Team Readiness & Availability
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Calibrate daily training loads based on aggregated athlete wellness indicators
          </p>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-navy-850 border border-navy-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-sports-green shrink-0" />
          <span>Strict Coach Privacy: Zero access to confidential medical details</span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Team Roster</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-100">{totalAthletes}</span>
            <span className="text-xs text-slate-400 ml-1.5">Athletes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {activeCount} active check-ins logged
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Avg Team Readiness</span>
            <div className="w-7 h-7 rounded-lg bg-sports-green/10 text-sports-green flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-100">
              {teamAverageReadiness}
            </span>
            <span className="text-xs text-sports-green ml-1.5 font-bold">/100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {teamAverageReadiness >= 80
              ? "High team readiness for peak training"
              : teamAverageReadiness >= 60
              ? "Moderate baseline; monitor fatigue"
              : "Low team baseline; reduce workload"}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Attention Flagged</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-400">
              {attentionCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">Athletes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {attentionCount === 0
              ? "All athletes above fatigue threshold"
              : "Readiness score below 60/100"}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Peak Availability</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-sports-green">
              {athletes.filter((a) => a.trainingAvailability === "Full Training").length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Cleared for full competitive scrimmage
          </p>
        </div>
      </div>

      {/* Weekly Team Trend Chart */}
      <WeeklyWellnessChart data={weeklyTeamTrend} />

      {/* Add Athlete to Team Form */}
      <div className="glass-card rounded-2xl p-6 border border-navy-800">
        <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-cyan-400" />
          Assign Athlete to Team Roster
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Add an athlete by their registered email address to view their training readiness
        </p>

        {addMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              addMsg.type === "success"
                ? "bg-sports-green/10 text-sports-green border border-sports-green/30"
                : "bg-rose-950/30 text-rose-300 border border-rose-900/50"
            }`}
          >
            {addMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{addMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleAddAthlete} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={newAthleteEmail}
            onChange={(e) => setNewAthleteEmail(e.target.value)}
            placeholder="Enter athlete registered email (e.g. athlete@athletecare.in)"
            className="flex-1 px-3.5 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Add to Team
          </button>
        </form>
      </div>

      {/* Athlete Roster Table */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Athlete Readiness Roster
            </h3>
            <p className="text-xs text-slate-400">
              Real-time wellness markers and training availability
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search athlete or sport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-navy-850 border border-navy-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sports-green"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-navy-850 border border-navy-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sports-green"
            >
              <option value="all">All Athletes</option>
              <option value="optimal">Optimal (&ge;80)</option>
              <option value="attention">Needs Attention (&lt;60)</option>
            </select>
          </div>
        </div>

        {filteredAthletes.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-navy-800 rounded-xl">
            {athletes.length === 0
              ? "No athletes currently in your roster. Add your first athlete above!"
              : "No athletes match your search or filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="pb-3">Athlete</th>
                  <th className="pb-3">Sport & Position</th>
                  <th className="pb-3">Readiness Score</th>
                  <th className="pb-3">Training Status</th>
                  <th className="pb-3">Sleep</th>
                  <th className="pb-3">Hydration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filteredAthletes.map((a) => (
                  <tr key={a.id} className="hover:bg-navy-850/40">
                    <td className="py-3.5">
                      <p className="font-bold text-slate-200">{a.full_name}</p>
                      <p className="text-[10px] text-slate-400">{a.email}</p>
                    </td>
                    <td className="py-3.5 text-slate-300">
                      <span>{a.primary_sport || "Athlete"}</span>
                      {a.playing_position && (
                        <span className="text-[10px] text-slate-400 block">
                          {a.playing_position}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      {a.latestScore != null ? (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                            a.statusColor === "green"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : a.statusColor === "yellow"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {a.latestScore}/100
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No entry</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          a.trainingAvailability === "Full Training"
                            ? "bg-sports-green/10 text-sports-green"
                            : a.trainingAvailability === "Modified Drills"
                            ? "bg-amber-500/10 text-amber-400"
                            : a.trainingAvailability === "Rest Recommended"
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {a.trainingAvailability}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-300">
                      {a.sleepHours != null ? `${a.sleepHours}h` : "--"}
                    </td>
                    <td className="py-3.5 text-slate-300">
                      {a.waterMl != null ? `${a.waterMl} ml` : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
