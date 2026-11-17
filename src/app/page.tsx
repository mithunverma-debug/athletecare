import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import {
  Activity,
  HeartPulse,
  Utensils,
  Bandage,
  ShieldCheck,
  Users,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Moon,
  Droplets,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-sports-green selection:text-navy-950">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden subtle-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sports-green/10 border border-sports-green/30 text-sports-green text-xs font-semibold mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sports Fitness & Health Management Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
                Elevate Athlete Health.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sports-green via-sports-green-light to-cyan-400">
                  Track Readiness.
                </span>{" "}
                Prevent Fatigue.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
                A centralized wellness platform connecting collegiate and amateur athletes with team coaches and sports physiotherapists. Monitor daily sleep, hydration, mood, nutrition, and rehabilitation progress.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-sports-green hover:bg-sports-green-hover text-navy-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-sports-green/20 hover:scale-[1.02]"
                >
                  Start Tracking Wellness <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-navy-900 hover:bg-navy-850 text-slate-200 border border-navy-800 font-semibold text-sm transition-all duration-200"
                >
                  Stakeholder Login &rarr;
                </Link>
              </div>

              <div className="mt-6">
                <DisclaimerBanner compact />
              </div>
            </div>

            {/* Visual Hero Dashboard Preview Card */}
            <div className="mt-14 max-w-5xl mx-auto">
              <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-2xl border border-navy-800 relative">
                <div className="flex items-center justify-between pb-4 border-b border-navy-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                    <span className="ml-2 text-xs font-semibold text-slate-400">
                      AthleteCare Live Performance Suite
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-sports-green bg-sports-green/10 px-2.5 py-0.5 rounded-full border border-sports-green/20">
                    Active System
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {/* Readiness Metric */}
                  <div className="p-4 rounded-xl bg-navy-850/80 border border-navy-800">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Readiness Index</span>
                      <Activity className="w-4 h-4 text-sports-green" />
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-100 flex items-baseline gap-1.5">
                      88<span className="text-xs font-semibold text-sports-green">/100 Optimal</span>
                    </div>
                    <div className="mt-2 w-full bg-navy-800 rounded-full h-1.5">
                      <div className="bg-sports-green h-1.5 rounded-full w-[88%]"></div>
                    </div>
                  </div>

                  {/* Sleep Metric */}
                  <div className="p-4 rounded-xl bg-navy-850/80 border border-navy-800">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Sleep Duration</span>
                      <Moon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-100 flex items-baseline gap-1.5">
                      8.2<span className="text-xs font-semibold text-slate-400">Hours</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Quality score: 9/10 (Deep recovery)</p>
                  </div>

                  {/* Hydration Metric */}
                  <div className="p-4 rounded-xl bg-navy-850/80 border border-navy-800">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Hydration</span>
                      <Droplets className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-100 flex items-baseline gap-1.5">
                      3,200<span className="text-xs font-semibold text-slate-400">ml</span>
                    </div>
                    <p className="mt-2 text-[11px] text-cyan-400">Target surpassed (+200 ml)</p>
                  </div>

                  {/* Pain & Status Metric */}
                  <div className="p-4 rounded-xl bg-navy-850/80 border border-navy-800">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Pain & Soreness</span>
                      <Bandage className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-100 flex items-baseline gap-1.5">
                      Level 2<span className="text-xs font-semibold text-emerald-400">Mild</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Hamstring rehab 100% completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KEY PLATFORM FEATURES */}
        <section id="features" className="py-20 border-t border-navy-800 bg-navy-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-sports-green uppercase tracking-wider mb-2">
                Core Functionality
              </h2>
              <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">
                Designed for Comprehensive Athletic Wellness
              </h3>
              <p className="mt-3 text-sm text-slate-400">
                AthleteCare digitizes the athletic support cycle with specialized modules for physical wellness, nutrition, injury rehabilitation, and team readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="glass-card glass-card-hover p-6 rounded-2xl border border-navy-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-sports-green/10 border border-sports-green/20 flex items-center justify-center text-sports-green shadow-md">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-100">Daily Wellness Check-In</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fast morning check-in recording sleep duration, quality rating, hydration in ml, mood, fatigue, and muscle soreness with duplicate prevention.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card glass-card-hover p-6 rounded-2xl border border-navy-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-md">
                  <Activity className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-100">100-Point Readiness Engine</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Transparent, scientifically weighted readiness scoring: Sleep (25 pts), Hydration (20 pts), Mood (15 pts), Fatigue (20 pts), and Soreness (20 pts).
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card glass-card-hover p-6 rounded-2xl border border-navy-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-md">
                  <Utensils className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-100">Nutrition & Hydration Log</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log breakfast, lunch, dinner, and snacks with protein, carbohydrates, fats, and water tracking, accompanied by affordable Indian athletic food guidance.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="glass-card glass-card-hover p-6 rounded-2xl border border-navy-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-md">
                  <Bandage className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-100">Injury & Rehabilitation Hub</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Body-area pain reporting (scale 1-10), consecutive high-pain automated alerts (pain &ge; 6 for 4 check-ins), and rehab exercise completion tracking.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="glass-card glass-card-hover p-6 rounded-2xl border border-navy-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-100">Coach Team Readiness Radar</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aggregated readiness overviews, training availability indicators, and privacy-first design preventing unauthorized access to confidential medical details.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="glass-card glass-card-hover p-6 rounded-2xl border border-navy-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-100">Medical Staff Suite</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Authorized physiotherapists assign targeted rehabilitation routines, monitor exercise compliance, review pain histories, and update recovery clearance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STAKEHOLDER BENEFITS */}
        <section id="roles" className="py-20 border-t border-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-sports-green uppercase tracking-wider mb-2">
                Three-Way Synergy
              </h2>
              <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">
                Empowering the Entire Sports Program
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Athlete Column */}
              <div className="glass-card p-6 rounded-2xl border border-navy-800 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase">
                  For Athletes
                </div>
                <h4 className="text-xl font-bold text-slate-100">
                  Build Health Awareness
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sports-green shrink-0 mt-0.5" />
                    <span>Understand daily body signals before fatigue turns into injury.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sports-green shrink-0 mt-0.5" />
                    <span>Track water intake and nutrition tailored with affordable Indian foods.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sports-green shrink-0 mt-0.5" />
                    <span>Follow rehabilitation exercises prescribed directly by team physiotherapists.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sports-green shrink-0 mt-0.5" />
                    <span>View visual progress graphs of your physical recovery.</span>
                  </li>
                </ul>
              </div>

              {/* Coach Column */}
              <div className="glass-card p-6 rounded-2xl border border-navy-800 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase">
                  For Coaches
                </div>
                <h4 className="text-xl font-bold text-slate-100">
                  Smarter Training Loads
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>View aggregated team readiness before scheduling high-intensity sessions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Identify athletes needing reduced load or tactical substitution.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Privacy compliance: Zero access to confidential medical or psychological notes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Prevent overtraining syndrome and season-ending burnout.</span>
                  </li>
                </ul>
              </div>

              {/* Medical Column */}
              <div className="glass-card p-6 rounded-2xl border border-navy-800 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase">
                  For Medical Staff
                </div>
                <h4 className="text-xl font-bold text-slate-100">
                  Targeted Rehabilitation
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Access dedicated injury reports for authorized assigned athletes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Assign scheduled rehab exercises with precise physical instructions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Automatic notifications when an athlete reports consecutive high pain &ge; 6.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Exclusive medical authority: athletes cannot medically clear themselves.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 border-t border-navy-800 bg-navy-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-sports-green uppercase tracking-wider mb-2">
                The Daily Workflow
              </h2>
              <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">
                How AthleteCare Works Every Morning
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-navy-800 relative">
                <div className="text-4xl font-black text-navy-800 mb-2">01</div>
                <h4 className="text-base font-bold text-slate-100 mb-1">Morning Check-In</h4>
                <p className="text-xs text-slate-400">
                  Athlete submits a 60-second wellness log (sleep, hydration, fatigue, soreness, and mood).
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-navy-800 relative">
                <div className="text-4xl font-black text-navy-800 mb-2">02</div>
                <h4 className="text-base font-bold text-slate-100 mb-1">Readiness Engine</h4>
                <p className="text-xs text-slate-400">
                  Algorithm calculates an educational 100-point score classified as Green, Yellow, or Red.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-navy-800 relative">
                <div className="text-4xl font-black text-navy-800 mb-2">03</div>
                <h4 className="text-base font-bold text-slate-100 mb-1">Coach Overview</h4>
                <p className="text-xs text-slate-400">
                  Coach views team training availability without intruding on private health details.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-navy-800 relative">
                <div className="text-4xl font-black text-navy-800 mb-2">04</div>
                <h4 className="text-base font-bold text-slate-100 mb-1">Rehabilitation Care</h4>
                <p className="text-xs text-slate-400">
                  Physiotherapists review reported pain and assign rehabilitation drills until full recovery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECT SYNOPSIS CALLOUT */}
        <section id="about" className="py-20 border-t border-navy-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-card rounded-2xl p-8 sm:p-10 border border-navy-800 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sports-green/10 border border-sports-green/20 text-sports-green flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">
                    College Full-Stack Capstone Synopsis
                  </h3>
                  <p className="text-xs text-slate-400">
                    Department of Computer Science & Sports Engineering
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The objective of the <strong>AthleteCare</strong> capstone project is to develop a production-ready sports wellness ecosystem addressing the lack of centralized health and fatigue tracking in collegiate athletic departments. Traditional training programs often rely on verbal feedback, leading to late discovery of overuse injuries and chronic fatigue.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-800">
                  <strong className="text-slate-200 block mb-1">Architectural Rigor</strong>
                  <span className="text-slate-400">
                    Built with Next.js 15 App Router, TypeScript, Supabase PostgreSQL, and strict database Row Level Security (RLS) guaranteeing role isolation.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-800">
                  <strong className="text-slate-200 block mb-1">Ethical Privacy Safeguards</strong>
                  <span className="text-slate-400">
                    Strict separation between coaching training readiness and confidential medical records prevents stigmatization and privacy violations.
                  </span>
                </div>
              </div>

              <DisclaimerBanner />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
