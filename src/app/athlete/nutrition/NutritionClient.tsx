"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nutritionRecordSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { NutritionRecord } from "@/types/database";
import { NutritionMacroChart } from "@/components/charts/NutritionMacroChart";
import {
  Utensils,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { z } from "zod";

type NutritionFormValues = z.infer<typeof nutritionRecordSchema>;

interface NutritionClientProps {
  athleteId: string;
  initialRecords: NutritionRecord[];
}

export function NutritionClient({ athleteId, initialRecords }: NutritionClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const todayStr = new Date().toISOString().split("T")[0];

  const [records, setRecords] = useState<NutritionRecord[]>(initialRecords);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NutritionFormValues>({
    resolver: zodResolver(nutritionRecordSchema),
    defaultValues: {
      record_date: todayStr,
      meal_type: "breakfast",
      meal_description: "",
      protein_g: 0,
      carbohydrates_g: 0,
      fats_g: 0,
      water_intake_ml: 250,
    },
  });

  // Filter records for selected date
  const dateMeals = records.filter((r) => r.record_date === selectedDate);
  const dayProtein = dateMeals.reduce((sum, m) => sum + (Number(m.protein_g) || 0), 0);
  const dayCarbs = dateMeals.reduce((sum, m) => sum + (Number(m.carbohydrates_g) || 0), 0);
  const dayFats = dateMeals.reduce((sum, m) => sum + (Number(m.fats_g) || 0), 0);
  const dayWater = dateMeals.reduce((sum, m) => sum + (Number(m.water_intake_ml) || 0), 0);

  const quickFoods = [
    {
      name: "3 Boiled Eggs",
      mealType: "breakfast" as const,
      protein: 18,
      carbs: 2,
      fats: 15,
      water: 100,
    },
    {
      name: "Sattu Drink (50g) in Water",
      mealType: "snack" as const,
      protein: 11,
      carbs: 32,
      fats: 3,
      water: 350,
    },
    {
      name: "Moong Sprouts (100g) Salad",
      mealType: "snack" as const,
      protein: 14,
      carbs: 30,
      fats: 2,
      water: 150,
    },
    {
      name: "Paneer (100g) with Roti & Dal",
      mealType: "lunch" as const,
      protein: 26,
      carbs: 55,
      fats: 22,
      water: 300,
    },
    {
      name: "Oats with Milk & Banana",
      mealType: "breakfast" as const,
      protein: 15,
      carbs: 65,
      fats: 8,
      water: 250,
    },
  ];

  const applyQuickFood = (food: (typeof quickFoods)[0]) => {
    setValue("meal_type", food.mealType);
    setValue("meal_description", food.name);
    setValue("protein_g", food.protein);
    setValue("carbohydrates_g", food.carbs);
    setValue("fats_g", food.fats);
    setValue("water_intake_ml", food.water);
  };

  const onSubmit = async (values: NutritionFormValues) => {
    setLoading(true);
    setSuccessMsg(null);

    const payload = {
      athlete_id: athleteId,
      record_date: selectedDate,
      meal_type: values.meal_type,
      meal_description: values.meal_description,
      protein_g: values.protein_g,
      carbohydrates_g: values.carbohydrates_g,
      fats_g: values.fats_g,
      water_intake_ml: values.water_intake_ml,
    };

    const { data, error } = await supabase
      .from("nutrition_records")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      setRecords((prev) => [data as NutritionRecord, ...prev]);
      setSuccessMsg(`Logged ${values.meal_type} successfully!`);
      reset({
        record_date: selectedDate,
        meal_type: "lunch",
        meal_description: "",
        protein_g: 0,
        carbohydrates_g: 0,
        fats_g: 0,
        water_intake_ml: 250,
      });
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("nutrition_records").delete().eq("id", id);
    if (!error) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* Date Header */}
      <div className="glass-card rounded-2xl p-6 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-sports-green" />
            Athletic Nutrition & Hydration Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track daily macronutrients and hydration balance to support physical recovery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sports-green shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setValue("record_date", e.target.value);
            }}
            className="bg-navy-850 border border-navy-800 text-slate-100 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sports-green"
          />
        </div>
      </div>

      {/* Daily Nutrition Macro Chart Component */}
      <NutritionMacroChart
        protein={dayProtein}
        carbs={dayCarbs}
        fats={dayFats}
        waterMl={dayWater}
      />

      {/* Meal Logging Form & Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
          <h3 className="text-base font-bold text-slate-100 mb-1">
            Log a Meal or Snack
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Record meal details and estimated macronutrient values
          </p>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-sports-green/10 border border-sports-green/20 text-sports-green text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Meal Category
                </label>
                <select
                  {...register("meal_type")}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green capitalize"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Water Included (ml)
                </label>
                <input
                  type="number"
                  step="50"
                  {...register("water_intake_ml", { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Meal Description
              </label>
              <input
                type="text"
                {...register("meal_description")}
                placeholder="e.g. 2 whole wheat rotis, 150g paneer bhurji, cucumber salad"
                className="w-full px-3 py-2.5 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
              />
              {errors.meal_description && (
                <p className="mt-1 text-xs text-rose-400">
                  {errors.meal_description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-sports-green mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="1"
                  {...register("protein_g", { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sports-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cyan-400 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  step="1"
                  {...register("carbohydrates_g", { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  Fats (g)
                </label>
                <input
                  type="number"
                  step="1"
                  {...register("fats_g", { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sports-green hover:bg-sports-green-hover text-navy-950 font-bold text-xs shadow-md disabled:opacity-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Meal to Daily Log
            </button>
          </form>
        </div>

        {/* Quick Food Shortcuts & Suggestions */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 sm:p-7 border border-navy-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sports-green" />
            <h3 className="text-base font-bold text-slate-100">
              Affordable Athletic Presets
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Quick-click Indian collegiate athletic staple meals with precalculated macros:
          </p>

          <div className="space-y-2">
            {quickFoods.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyQuickFood(q)}
                className="w-full text-left p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-800 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-200">{q.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {q.protein}g Protein &bull; {q.carbs}g Carbs &bull; {q.fats}g Fats
                  </p>
                </div>
                <span className="text-[10px] text-sports-green font-bold uppercase px-2 py-0.5 rounded bg-sports-green/10">
                  {q.mealType}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logged Meals for Selected Date */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-navy-800">
        <h3 className="text-base font-bold text-slate-100 mb-4">
          Meals Logged on {selectedDate}
        </h3>

        {dateMeals.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-navy-800 rounded-xl">
            No meals logged for this date.
          </div>
        ) : (
          <div className="space-y-3">
            {dateMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-800 flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold capitalize text-slate-200">
                      {meal.meal_type}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      &bull; {meal.meal_description}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span className="text-sports-green font-medium">P: {meal.protein_g}g</span>
                    <span className="text-cyan-400 font-medium">C: {meal.carbohydrates_g}g</span>
                    <span className="text-amber-400 font-medium">F: {meal.fats_g}g</span>
                    {meal.water_intake_ml > 0 && (
                      <span className="text-blue-400 font-medium">Water: {meal.water_intake_ml} ml</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(meal.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                  title="Delete meal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational Nutrition Disclaimer */}
      <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 text-xs text-slate-400 leading-relaxed space-y-1">
        <strong className="text-slate-300 font-semibold block">
          Educational Nutrition Guidance Notice:
        </strong>
        The meal presets and dietary suggestions shown here are basic athletic guidance for educational demonstration and awareness. They do not constitute personalized clinical dietary advice or prescription. Athletes with specific nutritional conditions or medical requirements should consult registered sports dietitians.
      </div>
    </div>
  );
}
