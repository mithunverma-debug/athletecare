"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { injuryRecordSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { InjuryRecord, RehabilitationExercise } from "@/types/database";
import { checkConsecutivePainAlert } from "@/lib/calculations/readiness";
import {
  Bandage,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Dumbbell,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { z } from "zod";

type InjuryFormValues = z.infer<typeof injuryRecordSchema>;

interface InjuriesClientProps {
  athleteId: string;
  initialInjuries: InjuryRecord[];
  initialExercises: RehabilitationExercise[];
}

export function InjuriesClient({
  athleteId,
  initialInjuries,
  initialExercises,
}: InjuriesClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const todayStr = new Date().toISOString().split("T")[0];

  const [injuries, setInjuries] = useState<InjuryRecord[]>(initialInjuries);
  const [exercises, setExercises] = useState<RehabilitationExercise[]>(initialExercises);
  const [loading, setLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<InjuryFormValues>({
    resolver: zodResolver(injuryRecordSchema),
    defaultValues: {
      body_area: "Knee",
      pain_level: 4,
      injury_description: "",
      injury_date: todayStr,
    },
  });

  const watchedPain = watch("pain_level");
  const painAlert = checkConsecutivePainAlert(injuries);

  const bodyAreas = [
    "Head / Neck",
    "Shoulder (Rotator cuff)",
    "Upper Arm / Biceps / Triceps",
    "Elbow",
    "Wrist / Hand",
    "Upper Back / Thoracic",
    "Lower Back (Lumbar)",
    "Hip / Groin",
    "Thigh / Hamstring / Quadriceps",
    "Knee (ACL/MCL/Meniscus)",
    "Lower Leg / Shin / Calf",
    "Ankle",
    "Foot / Plantar",
  ];

  const onSubmit = async (values: InjuryFormValues) => {
    setLoading(true);
    setReportSuccess(false);

    const payload = {
      athlete_id: athleteId,
      body_area: values.body_area,
      pain_level: values.pain_level,
      injury_description: values.injury_description,
      injury_date: values.injury_date,
      status: "active" as const,
    };

    const { data, error } = await supabase
      .from("injury_records")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      setInjuries((prev) => [data as InjuryRecord, ...prev]);
      setReportSuccess(true);
      reset({
        body_area: "Knee",
        pain_level: 4,
        injury_description: "",
        injury_date: todayStr,
      });

      // Also create an in-app notification for the athlete
      await supabase.from("notifications").insert({
        user_id: athleteId,
        title: "Injury Report Submitted",
        message: `Your report for ${values.body_area} (Pain: ${values.pain_level}/10) has been logged and shared with assigned sports medical staff.`,
        type: "alert",
      });

      router.refresh();
    }
    setLoading(false);
  };

  // Toggle exercise completion
  const toggleExercise = async (id: string, currentCompleted: boolean) => {
    const updatedStatus = !currentCompleted;
    const completedAt = updatedStatus ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("rehabilitation_exercises")
      .update({
        completed: updatedStatus,
        completed_at: completedAt,
      })
      .eq("id", id);

    if (!error) {
      setExercises((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, completed: updatedStatus, completed_at: completedAt }
            : e
        )
      );
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="glass-card rounded-2xl p-6 border border-navy-800">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Bandage className="w-5 h-5 text-sports-green" />
          Injury Management & Rehabilitation Care
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Log physical discomfort, complete prescribed rehabilitation exercises, and track recovery
        </p>
      </div>

      {/* 4-Day Consecutive Pain Flag */}
      {painAlert.hasConsecutivePain && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-start gap-3 text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-rose-300">
              High Pain Alert Flagged
            </h4>
            <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">
              {painAlert.alertMessage} Please inform your team coach and arrange a clinical assessment with athletic medical personnel.
            </p>
          </div>
        </div>
      )}

      {/* Assigned Rehabilitation Exercises Section */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-purple-400" />
              Prescribed Rehabilitation Exercises
            </h3>
            <p className="text-xs text-slate-400">
              Exercises assigned to you by authorized sports medical staff
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {exercises.filter((e) => e.completed).length} / {exercises.length} Completed
          </span>
        </div>

        {exercises.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-navy-800 rounded-xl">
            No active rehabilitation exercises currently assigned.
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                  ex.completed
                    ? "bg-navy-900/40 border-navy-800/60 opacity-80"
                    : "bg-navy-850/80 border-navy-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={ex.completed}
                  onChange={() => toggleExercise(ex.id, ex.completed)}
                  className="mt-1 w-4 h-4 rounded border-navy-700 bg-navy-900 text-sports-green focus:ring-sports-green accent-sports-green cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-bold ${
                        ex.completed ? "line-through text-slate-400" : "text-slate-100"
                      }`}
                    >
                      {ex.exercise_name}
                    </p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {ex.scheduled_date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {ex.instructions}
                  </p>

                  {ex.completed && ex.completed_at && (
                    <span className="text-[10px] text-sports-green font-semibold mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed on {new Date(ex.completed_at).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Injury / Pain Form */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
        <h3 className="text-base font-bold text-slate-100 mb-1">
          Report Pain or Injury Discomfort
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Log any acute or lingering pain. Medical staff will be notified to guide your recovery.
        </p>

        {reportSuccess && (
          <div className="mb-6 p-3.5 rounded-xl bg-sports-green/10 border border-sports-green/30 text-sports-green text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Injury report logged successfully. Your medical staff has been notified.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Body Area
              </label>
              <select
                {...register("body_area")}
                className="w-full px-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
              >
                {bodyAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date of Injury / Pain Onset
              </label>
              <input
                type="date"
                {...register("injury_date")}
                className="w-full px-3 py-2 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
              />
            </div>
          </div>

          {/* Pain Level Slider */}
          <div className="p-4 rounded-xl bg-navy-850/60 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Pain Level (1 to 10 Scale)
              </label>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  watchedPain >= 7
                    ? "bg-rose-500/20 text-rose-400"
                    : watchedPain >= 4
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                Level {watchedPain}/10 -{" "}
                {watchedPain >= 7 ? "Severe" : watchedPain >= 4 ? "Moderate" : "Mild"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              {...register("pain_level", { valueAsNumber: true })}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 (Barely noticeable)</span>
              <span>5 (Impacting drills)</span>
              <span>10 (Severe / Unable to bear weight)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description of Discomfort or Mechanism
            </label>
            <textarea
              {...register("injury_description")}
              rows={3}
              placeholder="Describe when the pain started, whether it is sharp or dull, swelling, and movements that trigger it..."
              className="w-full px-3 py-2 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
            />
            {errors.injury_description && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.injury_description.message}
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-navy-850/40 border border-navy-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-slate-300 font-semibold">Important Medical Rule:</span> In compliance with athletic medical standards, athletes cannot medically clear their own injuries. Return-to-play clearance is strictly authorized by certified sports medical staff.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sports-green hover:bg-sports-green-hover text-navy-950 font-bold text-xs shadow-md disabled:opacity-50 transition-all"
          >
            <Plus className="w-4 h-4" />
            Submit Injury Report
          </button>
        </form>
      </div>

      {/* Historical Injury Records Table */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
        <h3 className="text-base font-bold text-slate-100 mb-4">
          Previous Injury & Recovery Records
        </h3>

        {injuries.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-navy-800 rounded-xl">
            No past injuries on file.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Body Area</th>
                  <th className="pb-3">Pain Level</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Medical Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {injuries.map((i) => (
                  <tr key={i.id} className="hover:bg-navy-850/40">
                    <td className="py-3 font-semibold text-slate-300 whitespace-nowrap">
                      {i.injury_date}
                    </td>
                    <td className="py-3 font-bold text-slate-200">{i.body_area}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          i.pain_level >= 7
                            ? "bg-rose-500/10 text-rose-400"
                            : i.pain_level >= 4
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {i.pain_level}/10
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">
                      {i.injury_description}
                    </td>
                    <td className="py-3 capitalize">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          i.status === "active"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : i.status === "recovering"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {i.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 italic text-[11px]">
                      {i.medical_notes || "Awaiting staff review"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prominent Medical Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/50 flex items-start gap-3 text-amber-200 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5">
            Emergency & Professional Medical Disclaimer
          </span>
          AthleteCare provides self-tracking and rehabilitation task logs for athletic teams. It does not provide medical diagnostics, medical triage, or automated clinical advice. Serious or sudden trauma, fractures, or concussions require immediate in-person emergency sports medical evaluation.
        </div>
      </div>
    </div>
  );
}
