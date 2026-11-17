"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  User,
  HeartPulse,
  Utensils,
  Bandage,
  Users,
  Stethoscope,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { Profile } from "@/types/database";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { createClient } from "@/lib/supabase/client";

interface DashboardLayoutProps {
  profile: Profile;
  children: React.ReactNode;
}

export function DashboardLayout({ profile, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Build role-specific navigation links
  const getNavLinks = () => {
    if (profile.role === "athlete") {
      return [
        {
          label: "Dashboard",
          href: "/athlete/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Daily Wellness",
          href: "/athlete/wellness",
          icon: HeartPulse,
        },
        {
          label: "Nutrition & Water",
          href: "/athlete/nutrition",
          icon: Utensils,
        },
        {
          label: "Injuries & Rehab",
          href: "/athlete/injuries",
          icon: Bandage,
        },
        {
          label: "My Profile",
          href: "/athlete/profile",
          icon: User,
        },
      ];
    } else if (profile.role === "coach") {
      return [
        {
          label: "Team Dashboard",
          href: "/coach/dashboard",
          icon: Users,
        },
      ];
    } else if (profile.role === "medical") {
      return [
        {
          label: "Medical & Rehab",
          href: "/medical/dashboard",
          icon: Stethoscope,
        },
      ];
    } else {
      // Admin
      return [
        {
          label: "Admin Overview",
          href: "/admin/dashboard",
          icon: ShieldAlert,
        },
      ];
    }
  };

  const navLinks = getNavLinks();

  const roleBadgeColor = {
    athlete: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    coach: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    medical: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    admin: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  }[profile.role];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-navy-800 bg-navy-900/60 backdrop-blur-xl transition-all duration-300 z-30 sticky top-0 h-screen ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 border-b border-navy-800 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-sports-green flex items-center justify-center text-navy-950 shrink-0 shadow-md">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-extrabold text-base tracking-tight text-slate-100">
                  Athlete<span className="text-sports-green">Care</span>
                </span>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  {profile.role} portal
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-sports-green text-navy-950 font-bold shadow-md shadow-sports-green/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-navy-850/80"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-navy-950" : "text-slate-400"}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout in Footer */}
        <div className="p-3 border-t border-navy-800 bg-navy-950/40">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-navy-900 border border-navy-800 mb-2">
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {profile.full_name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {profile.email}
                </p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${roleBadgeColor}`}>
                {profile.role}
              </span>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  profile.role === "athlete" ? "bg-sports-green" : "bg-cyan-400"
                }`}
                title={`${profile.full_name} (${profile.role})`}
              />
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title="Log out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 sm:h-20 border-b border-navy-800 bg-navy-950/80 backdrop-blur-xl sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl bg-navy-850 border border-navy-800 text-slate-300"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                  {profile.role}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  AthleteCare Sports Management
                </span>
              </div>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationsDropdown userId={profile.id} />

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-200">
                {profile.full_name}
              </span>
              <span className="text-[11px] text-slate-400">
                {profile.primary_sport ? `${profile.primary_sport}` : "Amateur Athlete"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="sm:hidden p-2 rounded-xl bg-navy-850 text-rose-400 hover:bg-navy-800 border border-navy-800"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Slide-down Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-b border-navy-800 bg-navy-900/95 backdrop-blur-xl px-4 py-4 space-y-1.5 animate-in slide-in-from-top-2">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${
                    isActive
                      ? "bg-sports-green text-navy-950 font-bold"
                      : "text-slate-300 hover:bg-navy-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-navy-800 flex justify-between items-center text-xs">
              <div>
                <p className="font-semibold text-slate-200">{profile.full_name}</p>
                <p className="text-slate-400 text-[10px]">{profile.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-rose-400 font-semibold px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-900/40"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
