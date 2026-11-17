"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile, AuditLog, UserRole } from "@/types/database";
import {
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
} from "lucide-react";

interface AdminClientProps {
  adminId: string;
  users: Profile[];
  auditLogs: AuditLog[];
  stats: {
    totalWellness: number;
    totalNutrition: number;
    totalInjuries: number;
    totalExercises: number;
  };
}

export function AdminClient({ adminId, users, auditLogs, stats }: AdminClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [userList, setUserList] = useState<Profile[]>(users);
  const logs = auditLogs;
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Stats
  const totalUsers = userList.length;
  const athletesCount = userList.filter((u) => u.role === "athlete").length;
  const coachesCount = userList.filter((u) => u.role === "coach").length;
  const medicalCount = userList.filter((u) => u.role === "medical").length;

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle role change
  const handleRoleChange = async (targetUser: Profile, newRole: UserRole) => {
    setUpdatingUserId(targetUser.id);
    setStatusMsg(null);

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", targetUser.id);

    if (error) {
      setStatusMsg({ type: "error", text: error.message });
    } else {
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );

      // Log into audit_logs
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: "ROLE_CHANGE",
        entity_type: "profile",
        entity_id: targetUser.id,
        details: {
          user_email: targetUser.email,
          previous_role: targetUser.role,
          new_role: newRole,
        },
      });

      setStatusMsg({
        type: "success",
        text: `Updated ${targetUser.full_name}'s role to ${newRole}.`,
      });
      router.refresh();
    }
    setUpdatingUserId(null);
  };

  // Toggle user active status
  const handleToggleActive = async (targetUser: Profile) => {
    setUpdatingUserId(targetUser.id);
    setStatusMsg(null);
    const newActiveState = !targetUser.is_active;

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: newActiveState, updated_at: new Date().toISOString() })
      .eq("id", targetUser.id);

    if (error) {
      setStatusMsg({ type: "error", text: error.message });
    } else {
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: newActiveState } : u))
      );

      // Log into audit_logs
      await supabase.from("audit_logs").insert({
        actor_id: adminId,
        action: newActiveState ? "USER_ACTIVATED" : "USER_DEACTIVATED",
        entity_type: "profile",
        entity_id: targetUser.id,
        details: { user_email: targetUser.email },
      });

      setStatusMsg({
        type: "success",
        text: `${targetUser.full_name}'s account has been ${newActiveState ? "activated" : "deactivated"}.`,
      });
      router.refresh();
    }
    setUpdatingUserId(null);
  };

  // Trigger Demo Seed API
  const handleSeedDemoData = async () => {
    if (!confirm("Seed realistic sample demonstration data for collegiate presentation?")) {
      return;
    }

    setSeeding(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setStatusMsg({
          type: "success",
          text: "Demo data seeded successfully! Sample records created.",
        });
        router.refresh();
      } else {
        setStatusMsg({
          type: "error",
          text: data.error || "Failed to seed demo data.",
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error running seed process.";
      setStatusMsg({
        type: "error",
        text: message,
      });
    }
    setSeeding(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              System Security & Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Platform Administration Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage user accounts, assign privileged roles, and monitor security audit logs
          </p>
        </div>

        <button
          onClick={handleSeedDemoData}
          disabled={seeding}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sports-green/10 hover:bg-sports-green/20 text-sports-green border border-sports-green/30 text-xs font-bold transition-all shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          {seeding ? "Seeding Demo Data..." : "Seed College Demo Data"}
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            statusMsg.type === "success"
              ? "bg-sports-green/10 text-sports-green border border-sports-green/30"
              : "bg-rose-950/30 text-rose-300 border border-rose-900/50"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Platform Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-navy-800">
          <span className="text-xs text-slate-400 block">Total Users</span>
          <span className="text-2xl font-black text-slate-100">{totalUsers}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-navy-800">
          <span className="text-xs text-emerald-400 block">Athletes</span>
          <span className="text-2xl font-black text-emerald-400">{athletesCount}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-navy-800">
          <span className="text-xs text-cyan-400 block">Coaches</span>
          <span className="text-2xl font-black text-cyan-400">{coachesCount}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-navy-800">
          <span className="text-xs text-purple-400 block">Medical Staff</span>
          <span className="text-2xl font-black text-purple-400">{medicalCount}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-navy-800">
          <span className="text-xs text-slate-400 block">Wellness Logs</span>
          <span className="text-2xl font-black text-slate-100">{stats.totalWellness}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-navy-800">
          <span className="text-xs text-rose-400 block">Injuries Logged</span>
          <span className="text-2xl font-black text-rose-400">{stats.totalInjuries}</span>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              User Accounts & Role Permissions
            </h3>
            <p className="text-xs text-slate-400">
              Control account activation and provision privileged stakeholder roles
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search user or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-navy-850 border border-navy-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sports-green"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-navy-850 border border-navy-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sports-green"
            >
              <option value="all">All Roles</option>
              <option value="athlete">Athletes</option>
              <option value="coach">Coaches</option>
              <option value="medical">Medical Staff</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-navy-800">
              <tr>
                <th className="pb-3">User</th>
                <th className="pb-3">Current Role</th>
                <th className="pb-3">Account Status</th>
                <th className="pb-3">Modify Role</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-navy-850/40">
                  <td className="py-3">
                    <p className="font-bold text-slate-200">{u.full_name}</p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        u.role === "athlete"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : u.role === "coach"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          : u.role === "medical"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                        <UserCheck className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 text-[11px]">
                        <UserX className="w-3.5 h-3.5" /> Deactivated
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <select
                      value={u.role}
                      disabled={updatingUserId === u.id}
                      onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                      className="px-2 py-1 bg-navy-900 border border-navy-800 rounded-lg text-xs text-slate-200 capitalize focus:outline-none focus:ring-1 focus:ring-sports-green"
                    >
                      <option value="athlete">Athlete</option>
                      <option value="coach">Coach</option>
                      <option value="medical">Medical Staff</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={updatingUserId === u.id}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        u.is_active
                          ? "border-rose-900/50 text-rose-400 hover:bg-rose-950/30"
                          : "border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/30"
                      }`}
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Log Viewer */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
        <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
          <FileText className="w-4 h-4 text-sports-green" />
          Security Audit Logs
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Immutable tracking of administrative actions, role modifications, and status changes
        </p>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-navy-800 rounded-xl">
            No audit records logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Entity Type</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-navy-850/40">
                    <td className="py-2.5 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 font-bold text-sports-green">
                      {log.action}
                    </td>
                    <td className="py-2.5 text-slate-300">{log.entity_type}</td>
                    <td className="py-2.5 text-slate-400 max-w-md truncate">
                      {JSON.stringify(log.details || {})}
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
