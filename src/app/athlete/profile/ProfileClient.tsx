"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import {
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Activity,
  CheckCircle,
  Save,
  AlertCircle,
} from "lucide-react";
import { z } from "zod";

type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

interface ProfileClientProps {
  initialProfile: Profile;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: profile.full_name || "",
      date_of_birth: profile.date_of_birth || "",
      height_cm: profile.height_cm ? Number(profile.height_cm) : null,
      weight_kg: profile.weight_kg ? Number(profile.weight_kg) : null,
      primary_sport: profile.primary_sport || "",
      playing_position: profile.playing_position || "",
    },
  });

  // Calculate age from DOB
  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const age = calculateAge(profile.date_of_birth);

  // Calculate BMI
  const calculateBMI = (heightCm: number | null, weightKg: number | null) => {
    if (!heightCm || !weightKg || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  };

  const bmi = calculateBMI(
    profile.height_cm ? Number(profile.height_cm) : null,
    profile.weight_kg ? Number(profile.weight_kg) : null
  );

  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        date_of_birth: values.date_of_birth || null,
        height_cm: values.height_cm || null,
        weight_kg: values.weight_kg || null,
        primary_sport: values.primary_sport || null,
        playing_position: values.playing_position || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message);
    } else if (data) {
      setProfile(data as Profile);
      setSuccessMsg("Athlete profile updated successfully!");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Overview Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-navy-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sports-green/10 border border-sports-green/20 flex items-center justify-center text-sports-green shadow-lg">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                  {profile.full_name}
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sports-green/10 text-sports-green border border-sports-green/20">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {profile.email}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Registered on</span>
            <span className="text-xs font-semibold text-slate-200">
              {new Date(profile.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Athletic Bio Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-800 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Age
            </span>
            <span className="text-lg font-bold text-slate-100">
              {age ? `${age} yrs` : "--"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-800 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-1">
              <Ruler className="w-3.5 h-3.5 text-sports-green" />
              Height
            </span>
            <span className="text-lg font-bold text-slate-100">
              {profile.height_cm ? `${profile.height_cm} cm` : "--"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-800 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-1">
              <Weight className="w-3.5 h-3.5 text-cyan-400" />
              Weight
            </span>
            <span className="text-lg font-bold text-slate-100">
              {profile.weight_kg ? `${profile.weight_kg} kg` : "--"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-800 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Est. BMI
            </span>
            <span className="text-lg font-bold text-slate-100">
              {bmi ? `${bmi}` : "--"}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-navy-800">
        <h3 className="text-base font-bold text-slate-100 mb-1">
          Edit Profile Information
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Keep your anthropometric and sports information up to date
        </p>

        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-sports-green/10 border border-sports-green/30 text-sports-green text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                {...register("full_name")}
                className="w-full px-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-rose-400">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                {...register("date_of_birth")}
                className="w-full px-3 py-2 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Height (Centimetres - cm)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 178"
                {...register("height_cm", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
              />
              {errors.height_cm && (
                <p className="mt-1 text-xs text-rose-400">{errors.height_cm.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Weight (Kilograms - kg)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 74.5"
                {...register("weight_kg", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
              />
              {errors.weight_kg && (
                <p className="mt-1 text-xs text-rose-400">{errors.weight_kg.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Sport
              </label>
              <input
                type="text"
                placeholder="e.g. Cricket, Football, Badminton, Athletics"
                {...register("primary_sport")}
                className="w-full px-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Playing Position / Specialization
              </label>
              <input
                type="text"
                placeholder="e.g. Fast Bowler, Midfielder, Sprinter"
                {...register("playing_position")}
                className="w-full px-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sports-green hover:bg-sports-green-hover text-navy-950 font-bold text-xs shadow-md disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
