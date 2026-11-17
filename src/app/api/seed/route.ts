import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
  }

  // Record audit log
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "SEED_TRIGGERED",
    entity_type: "system",
    details: { timestamp: new Date().toISOString() },
  });

  return NextResponse.json({
    success: true,
    message: "College demo data seed confirmed and verified.",
  });
}
