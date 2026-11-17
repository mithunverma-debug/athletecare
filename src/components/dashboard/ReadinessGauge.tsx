"use client";

import React from "react";
import { ReadinessBreakdown } from "@/types/database";
import { Moon, Droplets, Smile, Zap, Dumbbell, AlertCircle } from "lucide-react";

interface ReadinessGaugeProps {
  breakdown: ReadinessBreakdown;
  recordDate?: string;
}

export function ReadinessGauge({ breakdown, recordDate }: ReadinessGaugeProps) {
  const { totalScore, status, statusColor, statusLabel, components } = breakdown;

  // Determine stroke color and background
  const strokeColor =
    statusColor === "green"
      ? "#10B981"
      : statusColor === "yellow"
      ? "#F59E0B"
      : statusColor === "red"
      ? "#F43F5E"
      : "#64748B";

  const glowClass =
    statusColor === "green"
      ? "text-sports-green border-sports-green/30 shadow-sports-green/10"
      : statusColor === "yellow"
      ? "text-amber-400 border-amber-500/30 shadow-amber-500/10"
      : statusColor === "red"
      ? "text-rose-400 border-rose-500/30 shadow-rose-500/10"
      : "text-slate-400 border-slate-700";

  // SVG circular progress calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    totalScore != null
      ? circumference - (totalScore / 100) * circumference
      : circumference;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Daily Readiness Index
            {status === "incomplete" && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-normal">
                Check-in needed
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {recordDate ? `Normalized for ${recordDate}` : "Today's holistic wellness score"}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${glowClass}`}>
          {statusLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Circular Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center py-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-navy-800"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={strokeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Score in Center */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              {totalScore != null ? (
                <>
                  <span className="text-4xl font-extrabold tracking-tight text-slate-100">
                    {totalScore}
                  </span>
                  <span className="text-xs font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
                    Score / 100
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8 text-slate-500 mb-1" />
                  <span className="text-xs text-slate-400 font-medium">
                    No Record
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sports-green"></span> 80+ Optimal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> 60-79 Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> &lt;60 Low
            </span>
          </div>
        </div>

        {/* 5 Component Breakdowns */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Weighted Wellness Inputs (Max 100 Pts)
          </div>

          {/* Sleep */}
          <div className="p-2.5 rounded-xl bg-navy-850/70 border border-navy-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-200">Sleep</span>
                <p className="text-[11px] text-slate-400">{components.sleep.label}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-100">
                {components.sleep.score} / {components.sleep.max}
              </span>
              <span className="text-[10px] text-slate-400 block">pts</span>
            </div>
          </div>

          {/* Hydration */}
          <div className="p-2.5 rounded-xl bg-navy-850/70 border border-navy-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-200">Hydration</span>
                <p className="text-[11px] text-slate-400">{components.hydration.label}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-100">
                {components.hydration.score} / {components.hydration.max}
              </span>
              <span className="text-[10px] text-slate-400 block">pts</span>
            </div>
          </div>

          {/* Mood */}
          <div className="p-2.5 rounded-xl bg-navy-850/70 border border-navy-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Smile className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-200">Mood</span>
                <p className="text-[11px] text-slate-400">{components.mood.label}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-100">
                {components.mood.score} / {components.mood.max}
              </span>
              <span className="text-[10px] text-slate-400 block">pts</span>
            </div>
          </div>

          {/* Fatigue */}
          <div className="p-2.5 rounded-xl bg-navy-850/70 border border-navy-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sports-green/10 border border-sports-green/20 flex items-center justify-center text-sports-green">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-200">Energy & Fatigue</span>
                <p className="text-[11px] text-slate-400">{components.fatigue.label}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-100">
                {components.fatigue.score} / {components.fatigue.max}
              </span>
              <span className="text-[10px] text-slate-400 block">pts</span>
            </div>
          </div>

          {/* Soreness */}
          <div className="p-2.5 rounded-xl bg-navy-850/70 border border-navy-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-200">Muscle Freshness</span>
                <p className="text-[11px] text-slate-400">{components.soreness.label}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-100">
                {components.soreness.score} / {components.soreness.max}
              </span>
              <span className="text-[10px] text-slate-400 block">pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
