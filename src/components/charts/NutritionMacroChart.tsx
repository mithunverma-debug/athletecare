"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface NutritionMacroChartProps {
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  waterMl: number; // in ml
  targetWaterMl?: number;
}

export function NutritionMacroChart({
  protein,
  carbs,
  fats,
  waterMl,
  targetWaterMl = 3000,
}: NutritionMacroChartProps) {
  const totalGrams = protein + carbs + fats;

  const data = [
    { name: "Protein", value: protein, color: "#10B981" },
    { name: "Carbs", value: carbs, color: "#06B6D4" },
    { name: "Fats", value: fats, color: "#F59E0B" },
  ];

  // Calories estimation: 4 kcal/g protein, 4 kcal/g carb, 9 kcal/g fat
  const estimatedCalories = Math.round(protein * 4 + carbs * 4 + fats * 9);
  const waterPercentage = Math.min(100, Math.round((waterMl / targetWaterMl) * 100));

  return (
    <div className="glass-card rounded-2xl p-6 border border-navy-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Macronutrients & Hydration</h3>
          <p className="text-xs text-slate-400">Daily logged nutritional breakdown</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400 block">Est. Energy</span>
          <span className="text-lg font-bold text-sports-green">{estimatedCalories} kcal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Pie Chart / Donut */}
        <div className="h-44 flex items-center justify-center relative">
          {totalGrams > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => [`${value ?? 0}g`, "Intake"]}
                    contentStyle={{
                      backgroundColor: "#0B132B",
                      borderColor: "#1E294B",
                      borderRadius: "8px",
                      color: "#F8FAFC",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-100">{totalGrams}g</span>
                <span className="text-[10px] text-slate-400 uppercase">Total Macros</span>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-slate-500">
              No meals logged today yet.
            </div>
          )}
        </div>

        {/* Macro Bars & Hydration */}
        <div className="space-y-3.5">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sports-green" />
                Protein
              </span>
              <span className="font-bold text-slate-100">{protein}g</span>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-2">
              <div
                className="bg-sports-green h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${totalGrams > 0 ? (protein / totalGrams) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Carbohydrates
              </span>
              <span className="font-bold text-slate-100">{carbs}g</span>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-2">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${totalGrams > 0 ? (carbs / totalGrams) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Fats */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Fats
              </span>
              <span className="font-bold text-slate-100">{fats}g</span>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-2">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${totalGrams > 0 ? (fats / totalGrams) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Hydration Bar */}
          <div className="pt-2 border-t border-navy-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cyan-400 font-medium">Hydration Status</span>
              <span className="font-bold text-slate-100">
                {waterMl} / {targetWaterMl} ml ({waterPercentage}%)
              </span>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-2.5">
              <div
                className="bg-cyan-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${waterPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
