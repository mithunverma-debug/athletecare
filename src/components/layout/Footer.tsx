import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-navy-950 border-t border-navy-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sports-green flex items-center justify-center text-navy-950 shadow-md">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold text-slate-100">
                Athlete<span className="text-sports-green">Care</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              A centralized daily wellness, fatigue, nutrition, and rehabilitation management platform designed for amateur and collegiate athletic programs, coaches, and sports medical professionals.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-800">
                Indian Standard Units (cm, kg, ml, DD-MM-YYYY)
              </span>
              <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-800">
                Asia/Kolkata
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Dashboards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/athlete/dashboard" className="hover:text-sports-green transition-colors">
                  Athlete Wellness & Profile
                </Link>
              </li>
              <li>
                <Link href="/athlete/wellness" className="hover:text-sports-green transition-colors">
                  Daily Check-in & Readiness
                </Link>
              </li>
              <li>
                <Link href="/athlete/nutrition" className="hover:text-sports-green transition-colors">
                  Nutrition & Hydration Log
                </Link>
              </li>
              <li>
                <Link href="/athlete/injuries" className="hover:text-sports-green transition-colors">
                  Injury Reporting & Rehab
                </Link>
              </li>
              <li>
                <Link href="/coach/dashboard" className="hover:text-sports-green transition-colors">
                  Coach Team Readiness
                </Link>
              </li>
              <li>
                <Link href="/medical/dashboard" className="hover:text-sports-green transition-colors">
                  Medical & Rehab Management
                </Link>
              </li>
            </ul>
          </div>

          {/* College Project Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Project Information
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>College Full-Stack Capstone Project</li>
              <li>Sports Fitness / Health Management</li>
              <li>Built with Next.js 15 & Supabase</li>
              <li>PostgreSQL Row Level Security (RLS)</li>
              <li className="pt-2">
                <Link href="/login" className="text-sports-green font-medium hover:underline">
                  Sign in to Portal &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 text-[11px] text-slate-400 leading-relaxed mb-8">
          <strong className="text-slate-300 font-semibold block mb-0.5">
            Academic & Demonstrative Notice:
          </strong>
          AthleteCare is developed strictly for educational demonstration and daily lifestyle athletic self-tracking. It is NOT a medical diagnosis system, emergency triage utility, or treatment prescription software. All fitness readiness metrics are indicative educational scores. Severe pain, concussions, or acute physical injuries require prompt evaluation by certified physicians or sports medicine personnel.
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AthleteCare. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with sports science principles for collegiate teams
          </p>
        </div>
      </div>
    </footer>
  );
}
