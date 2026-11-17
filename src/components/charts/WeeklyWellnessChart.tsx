"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface DailyTrendPoint {
  date: string;
  displayDate: string;
  readiness: number;
  sleep: number;
  fatigue: number;
  soreness: number;
}

interface WeeklyWellnessChartProps {
  data: DailyTrendPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-900 border border-navy-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-semibold text-slate-200 border-b border-navy-800 pb-1 mb-1">
          {label}
        </p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400 capitalize">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}:
            </span>
            <span className="font-bold text-slate-100">
              {item.name === "sleep" ? `${item.value} hrs` : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function WeeklyWellnessChart({ data }: WeeklyWellnessChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 h-72 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>No wellness trend data available yet.</p>
        <span className="text-xs text-slate-400 mt-1">Complete daily check-ins to build your trend chart.</span>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-navy-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100">Readiness & Sleep Progression</h3>
          <p className="text-xs text-slate-400">7-Day wellness trajectory and physical recovery</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sports-green"></span> Readiness (0-100)
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Sleep (Hours)
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E294B" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#1E294B" }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              domain={[0, 100]}
              tickLine={false}
              axisLine={{ stroke: "#1E294B" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="readiness"
              name="readiness"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#readinessGrad)"
            />
            <Area
              type="monotone"
              dataKey="sleep"
              name="sleep"
              stroke="#06B6D4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#sleepGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
