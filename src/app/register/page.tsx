"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Activity, Lock, Mail, User, Trophy, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { z } from "zod";

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      primarySport: "",
      playingPosition: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    setLoading(true);

    try {
      // 1. Sign up user via Supabase Auth
      // Role is intentionally NOT passed or accepted here.
      // Database trigger automatically assigns role 'athlete'.
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) {
        setServerError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // If sports info was provided, update profile with primary_sport & playing_position
        if (values.primarySport || values.playingPosition) {
          await supabase
            .from("profiles")
            .update({
              primary_sport: values.primarySport || null,
              playing_position: values.playingPosition || null,
            })
            .eq("id", data.user.id);
        }

        // If email confirmation is not required, session is active
        if (data.session) {
          router.push("/athlete/dashboard");
          router.refresh();
        } else {
          setSuccess(true);
          setLoading(false);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to complete registration.";
      setServerError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 subtle-gradient relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-sports-green flex items-center justify-center text-navy-950 shadow-lg shadow-sports-green/20 group-hover:scale-105 transition-transform">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Join Athlete<span className="text-sports-green">Care</span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Create your athlete profile to start logging daily wellness & recovery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-card py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-navy-800">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-sports-green/10 border border-sports-green/20 text-sports-green flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Registration Successful!
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Your athlete profile has been registered. You can now sign in to access your daily wellness tracking dashboard.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sports-green hover:bg-sports-green-hover text-navy-950 font-bold text-sm shadow-md"
              >
                Sign In Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {serverError && (
                <div className="mb-6 p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-start gap-2.5 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      {...register("fullName")}
                      placeholder="e.g. Virat Sharma"
                      className="block w-full pl-9 pr-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sports-green focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-rose-400">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="athlete@team.in"
                      className="block w-full pl-9 pr-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sports-green focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Sport
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        {...register("primarySport")}
                        placeholder="Cricket / Football"
                        className="block w-full pl-9 pr-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sports-green focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Position
                    </label>
                    <input
                      type="text"
                      {...register("playingPosition")}
                      placeholder="e.g. All-rounder"
                      className="block w-full px-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sports-green focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      {...register("password")}
                      placeholder="Minimum 6 characters"
                      className="block w-full pl-9 pr-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sports-green focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      {...register("confirmPassword")}
                      placeholder="Repeat password"
                      className="block w-full pl-9 pr-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sports-green focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-navy-850/60 border border-navy-800 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-medium">Security Notice:</span> Public registrations are registered with the default <strong>Athlete</strong> role. Privileged Coach, Medical Staff, and Admin roles are provisioned exclusively by platform administrators.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sports-green hover:bg-sports-green-hover text-navy-950 font-bold text-sm transition-all duration-200 shadow-md shadow-sports-green/10 hover:shadow-sports-green/20 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Athlete Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-400">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="text-sports-green hover:underline font-semibold"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
