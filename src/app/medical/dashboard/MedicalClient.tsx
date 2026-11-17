"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rehabExerciseSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import {
  InjuryRecord,
  RehabilitationExercise,
  Profile,
} from "@/types/database";
import {
  Stethoscope,
  Bandage,
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  Clock,
  Send,
  User,
  ShieldAlert,
} from "lucide-react";
import { z } from "zod";

type RehabFormValues = z.infer<typeof rehabExerciseSchema>;

interface MedicalClientProps {
  medicalStaffId: string;
  assignedAthletes: Profile[];
  injuries: Array<InjuryRecord & { athlete_name?: string }>;
  exercises: Array<RehabilitationExercise & { athlete_name?: string }>;
}

export function MedicalClient({
  medicalStaffId,
  assignedAthletes,
  injuries,
  exercises,
}: MedicalClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const todayStr = new Date().toISOString().split("T")[0];

  const [athleteList, setAthleteList] = useState<Profile[]>(assignedAthletes);
  const [injuryList, setInjuryList] = useState(injuries);
  const [exerciseList, setExerciseList] = useState(exercises);

  const [assignEmail, setAssignEmail] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMsg, setAssignMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [rehabLoading, setRehabLoading] = useState(false);
  const [rehabSuccess, setRehabSuccess] = useState(false);

  const [updatingInjuryId, setUpdatingInjuryId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RehabFormValues>({
    resolver: zodResolver(rehabExerciseSchema),
    defaultValues: {
      athlete_id: assignedAthletes[0]?.id || "",
      exercise_name: "",
      instructions: "",
      scheduled_date: todayStr,
    },
  });

  // Assign athlete by email
  const handleAssignAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignEmail.trim()) return;

    setAssignLoading(true);
    setAssignMsg(null);

    const { data: athlete, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", assignEmail.trim().toLowerCase())
      .single();

    if (pErr || !athlete) {
      setAssignMsg({ type: "error", text: "No athlete found with that email." });
      setAssignLoading(false);
      return;
    }

    const { error: aErr } = await supabase.from("medical_assignments").insert({
      medical_staff_id: medicalStaffId,
      athlete_id: athlete.id,
    });

    if (aErr) {
      if (aErr.code === "23505") {
        setAssignMsg({ type: "error", text: "Athlete is already assigned to your care." });
      } else {
        setAssignMsg({ type: "error", text: aErr.message });
      }
    } else {
      setAthleteList((prev) => [...prev, athlete as Profile]);
      setAssignMsg({
        type: "success",
        text: `Assigned ${athlete.full_name} to your medical care!`,
      });
      setAssignEmail("");
      router.refresh();
    }
    setAssignLoading(false);
  };

  // Prescribe rehabilitation exercise
  const onPrescribeRehab = async (values: RehabFormValues) => {
    setRehabLoading(true);
    setRehabSuccess(false);

    const payload = {
      athlete_id: values.athlete_id,
      assigned_by: medicalStaffId,
      exercise_name: values.exercise_name,
      instructions: values.instructions,
      scheduled_date: values.scheduled_date,
      completed: false,
    };

    const { data, error } = await supabase
      .from("rehabilitation_exercises")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      const athleteObj = athleteList.find((a) => a.id === values.athlete_id);
      setExerciseList((prev) => [
        { ...(data as RehabilitationExercise), athlete_name: athleteObj?.full_name },
        ...prev,
      ]);
      setRehabSuccess(true);
      reset({
        athlete_id: values.athlete_id,
        exercise_name: "",
        instructions: "",
        scheduled_date: todayStr,
      });

      // Send notification to the athlete
      await supabase.from("notifications").insert({
        user_id: values.athlete_id,
        title: "New Rehabilitation Drill Assigned",
        message: `Your physiotherapist assigned: "${values.exercise_name}" scheduled for ${values.scheduled_date}.`,
        type: "info",
      });

      router.refresh();
    }
    setRehabLoading(false);
  };

  // Update injury status and clinical notes
  const updateInjuryStatus = async (
    injuryId: string,
    status: "active" | "recovering" | "resolved",
    athleteId: string
  ) => {
    setUpdatingInjuryId(injuryId);
    const notes = editingNotes[injuryId];

    const updatePayload: { status: "active" | "recovering" | "resolved"; updated_at: string; medical_notes?: string } = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updatePayload.medical_notes = notes;
    }

    const { error } = await supabase
      .from("injury_records")
      .update(updatePayload)
      .eq("id", injuryId);

    if (!error) {
      setInjuryList((prev) =>
        prev.map((i) =>
          i.id === injuryId
            ? { ...i, status, medical_notes: notes ?? i.medical_notes }
            : i
        )
      );

      // Notify athlete of status clearance
      await supabase.from("notifications").insert({
        user_id: athleteId,
        title: "Injury Status Updated",
        message: `Your sports medical staff updated your status to: "${status}".`,
        type: status === "resolved" ? "success" : "info",
      });

      router.refresh();
    }
    setUpdatingInjuryId(null);
  };

  const activeInjuries = injuryList.filter((i) => i.status !== "resolved");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Sports Physiotherapy & Medical Care Suite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Medical & Rehabilitation Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage assigned collegiate athletes, diagnose discomfort reports, and assign rehabilitation drills
          </p>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs text-purple-300">
          <Stethoscope className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Authorized Sports Medicine Console</span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Supervised Athletes</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-100">
              {athleteList.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">Assigned</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Athletes under direct rehabilitation monitoring
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Active Injury Reports</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Bandage className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-400">
              {activeInjuries.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Requiring clinical treatment or modified training
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Rehab Prescriptions</span>
            <div className="w-7 h-7 rounded-lg bg-sports-green/10 text-sports-green flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-sports-green">
              {exerciseList.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">Assigned</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {exerciseList.filter((e) => e.completed).length} completed by athletes
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-navy-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">High Pain Cases</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400">
              {injuryList.filter((i) => i.pain_level >= 6 && i.status !== "resolved").length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">Pain &ge; 6</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Flagged for restricted physical workload
          </p>
        </div>
      </div>

      {/* Assign Athlete to Medical Care */}
      <div className="glass-card rounded-2xl p-6 border border-navy-800">
        <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-purple-400" />
          Assign Athlete to Medical Care
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Add an athlete by their registered email address to monitor their injury recovery
        </p>

        {assignMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              assignMsg.type === "success"
                ? "bg-sports-green/10 text-sports-green border border-sports-green/30"
                : "bg-rose-950/30 text-rose-300 border border-rose-900/50"
            }`}
          >
            {assignMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{assignMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleAssignAthlete} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            placeholder="Athlete registered email (e.g. athlete@athletecare.in)"
            className="flex-1 px-3.5 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
          <button
            type="submit"
            disabled={assignLoading}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-slate-100 font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Authorize Athlete
          </button>
        </form>
      </div>

      {/* Prescribe Rehabilitation Exercise Form */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
        <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-purple-400" />
          Prescribe Rehabilitation Exercise
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Assign targeted physical therapy drills to an authorized athlete
        </p>

        {rehabSuccess && (
          <div className="mb-6 p-3.5 rounded-xl bg-sports-green/10 border border-sports-green/30 text-sports-green text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Rehabilitation exercise assigned and dispatched to athlete portal!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onPrescribeRehab)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Athlete
              </label>
              <select
                {...register("athlete_id")}
                className="w-full px-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
              >
                {athleteList.length === 0 && (
                  <option value="">No authorized athletes</option>
                )}
                {athleteList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name} ({a.email})
                  </option>
                ))}
              </select>
              {errors.athlete_id && (
                <p className="mt-1 text-xs text-rose-400">{errors.athlete_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Scheduled Date
              </label>
              <input
                type="date"
                {...register("scheduled_date")}
                className="w-full px-3 py-2 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Exercise Name / Drill
            </label>
            <input
              type="text"
              {...register("exercise_name")}
              placeholder="e.g. Nordic Hamstring Eccentric Curls, Copenhagen Adductor Plank"
              className="w-full px-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
            {errors.exercise_name && (
              <p className="mt-1 text-xs text-rose-400">{errors.exercise_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Clinical Instructions & Repetitions
            </label>
            <textarea
              {...register("instructions")}
              rows={3}
              placeholder="e.g. 3 sets of 8 repetitions, 5-second controlled eccentric descent. Stop if sharp pain exceeds 3/10."
              className="w-full px-3 py-2 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
            {errors.instructions && (
              <p className="mt-1 text-xs text-rose-400">{errors.instructions.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={rehabLoading || athleteList.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-slate-100 font-bold text-xs shadow-md disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
            Assign Rehabilitation Routine
          </button>
        </form>
      </div>

      {/* Injury Reports & Medical Status Clearance */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
        <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Bandage className="w-4 h-4 text-rose-400" />
          Reported Injuries & Medical Status Clearance
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Update rehabilitation status and append official medical notes (Athletes cannot clear themselves)
        </p>

        {injuryList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-navy-800 rounded-xl">
            No injury reports logged for assigned athletes.
          </div>
        ) : (
          <div className="space-y-4">
            {injuryList.map((inj) => (
              <div
                key={inj.id}
                className="p-5 rounded-2xl bg-navy-850/80 border border-navy-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-navy-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">
                        {inj.athlete_name || "Assigned Athlete"}
                      </span>
                      <span className="text-xs font-semibold text-rose-400">
                        &bull; {inj.body_area}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          inj.pain_level >= 7
                            ? "bg-rose-500/20 text-rose-400"
                            : inj.pain_level >= 4
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        Pain: {inj.pain_level}/10
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Reported on {inj.injury_date}
                    </span>
                  </div>

                  {/* Status Badges & Quick Action */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={inj.status}
                      disabled={updatingInjuryId === inj.id}
                      onChange={(e) =>
                        updateInjuryStatus(
                          inj.id,
                          e.target.value as "active" | "recovering" | "resolved",
                          inj.athlete_id
                        )
                      }
                      className="px-2.5 py-1 bg-navy-900 border border-navy-800 rounded-lg text-xs font-semibold text-slate-200 capitalize focus:outline-none focus:ring-1 focus:ring-purple-400"
                    >
                      <option value="active">Active (Restricted)</option>
                      <option value="recovering">Recovering (Drills)</option>
                      <option value="resolved">Resolved (Cleared)</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-slate-300">
                  <strong className="text-slate-400 font-semibold block mb-0.5">
                    Athlete Symptom Description:
                  </strong>
                  <p className="bg-navy-900 p-2.5 rounded-lg border border-navy-800/60 leading-relaxed">
                    {inj.injury_description}
                  </p>
                </div>

                {/* Medical Notes Input */}
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-purple-400 mb-1">
                    Physiotherapist Clinical Notes & Recommendations
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue={inj.medical_notes || ""}
                      onChange={(e) =>
                        setEditingNotes((prev) => ({
                          ...prev,
                          [inj.id]: e.target.value,
                        }))
                      }
                      placeholder="Add diagnostic notes, ice/heat protocols, or return-to-play clearance notes..."
                      className="flex-1 px-3 py-1.5 bg-navy-900 border border-navy-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <button
                      type="button"
                      disabled={updatingInjuryId === inj.id}
                      onClick={() =>
                        updateInjuryStatus(inj.id, inj.status, inj.athlete_id)
                      }
                      className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-slate-200 border border-navy-700"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescribed Rehabilitation Exercises Compliance Table */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sports-green" />
          Rehabilitation Exercise Compliance Tracking
        </h3>

        {exerciseList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-navy-800 rounded-xl">
            No exercises prescribed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="pb-3">Athlete</th>
                  <th className="pb-3">Exercise Drill</th>
                  <th className="pb-3">Scheduled Date</th>
                  <th className="pb-3">Instructions</th>
                  <th className="pb-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {exerciseList.map((ex) => (
                  <tr key={ex.id} className="hover:bg-navy-850/40">
                    <td className="py-3 font-semibold text-slate-200">
                      {ex.athlete_name || "Assigned Athlete"}
                    </td>
                    <td className="py-3 font-bold text-slate-100">
                      {ex.exercise_name}
                    </td>
                    <td className="py-3 text-slate-400">{ex.scheduled_date}</td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">
                      {ex.instructions}
                    </td>
                    <td className="py-3">
                      {ex.completed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prominent Medical Notice */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/50 flex items-start gap-3 text-purple-200 text-xs">
        <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-purple-300 block mb-0.5">
            Sports Medicine Authorization & Ethical Notice
          </span>
          AthleteCare rehabilitation tracking provides an asynchronous communication link between certified sports physiotherapists and collegiate athletes. It is not an automated medical decision device. All return-to-play clearances and exercise progressions should be based on clinical examination.
        </div>
      </div>
    </div>
  );
}
