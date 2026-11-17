"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Activity, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { z } from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setServerError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Query user profile to route correctly
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, is_active")
          .eq("id", data.user.id)
          .single();

        if (profile?.is_active === false) {
          await supabase.auth.signOut();
          setServerError("This account has been deactivated by an administrator.");
          setLoading(false);
          return;
        }

        const role = profile?.role || "athlete";
        const redirectPath =
          role === "coach"
            ? "/coach/dashboard"
            : role === "medical"
            ? "/medical/dashboard"
            : role === "admin"
            ? "/admin/dashboard"
            : "/athlete/dashboard";

        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setServerError(msg);
      setLoading(false);
    }
  };

  // Demo accounts helper
  const fillDemo = (email: string) => {
    setValue("email", email);
    setValue("password", "AthleteCare@2026");
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
          Athlete<span className="text-sports-green">Care</span> Portal
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Sign in to access your daily sports wellness & readiness analytics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-card py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-navy-800">
          {serverError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-sports-green hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sports-green focus:border-transparent transition-all"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
              )}
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
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* College Demo Credentials Shortcuts */}
          <div className="mt-6 pt-5 border-t border-navy-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sports-green" />
                College Demo Quick-Fill:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo("athlete@athletecare.in")}
                className="p-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-800 text-left transition-colors"
              >
                <span className="font-semibold text-emerald-400 block text-[11px]">Athlete Demo</span>
                <span className="text-[10px] text-slate-400">athlete@athletecare.in</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("coach@athletecare.in")}
                className="p-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-800 text-left transition-colors"
              >
                <span className="font-semibold text-cyan-400 block text-[11px]">Coach Demo</span>
                <span className="text-[10px] text-slate-400">coach@athletecare.in</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("medical@athletecare.in")}
                className="p-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-800 text-left transition-colors"
              >
                <span className="font-semibold text-purple-400 block text-[11px]">Medical Staff</span>
                <span className="text-[10px] text-slate-400">medical@athletecare.in</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("admin@athletecare.in")}
                className="p-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-800 text-left transition-colors"
              >
                <span className="font-semibold text-rose-400 block text-[11px]">Admin Demo</span>
                <span className="text-[10px] text-slate-400">admin@athletecare.in</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an athlete account?{" "}
            <Link
              href="/register"
              className="text-sports-green hover:underline font-semibold"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
