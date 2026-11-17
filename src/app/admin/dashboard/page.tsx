import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminClient } from "./AdminClient";
import { Profile, AuditLog } from "@/types/database";

export default async function AdminDashboardPage() {
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

  if (!profile || profile.role !== "admin") {
    // If not admin, redirect to athlete or respective dashboard
    redirect(
      profile?.role === "coach"
        ? "/coach/dashboard"
        : profile?.role === "medical"
        ? "/medical/dashboard"
        : "/athlete/dashboard"
    );
  }

  // 1. Fetch all registered users
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Fetch system audit logs
  const { data: auditLogs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);

  // 3. Fetch count statistics
  const { count: wellnessCount } = await supabase
    .from("wellness_records")
    .select("*", { count: "exact", head: true });

  const { count: nutritionCount } = await supabase
    .from("nutrition_records")
    .select("*", { count: "exact", head: true });

  const { count: injuryCount } = await supabase
    .from("injury_records")
    .select("*", { count: "exact", head: true });

  const { count: exerciseCount } = await supabase
    .from("rehabilitation_exercises")
    .select("*", { count: "exact", head: true });

  return (
    <DashboardLayout profile={profile as Profile}>
      <AdminClient
        adminId={user.id}
        users={(users || []) as Profile[]}
        auditLogs={(auditLogs || []) as AuditLog[]}
        stats={{
          totalWellness: wellnessCount || 0,
          totalNutrition: nutritionCount || 0,
          totalInjuries: injuryCount || 0,
          totalExercises: exerciseCount || 0,
        }}
      />
    </DashboardLayout>
  );
}
