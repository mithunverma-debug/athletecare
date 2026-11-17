import { z } from "zod";

// --- Authentication Schemas ---
export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  primarySport: z.string().optional(),
  playingPosition: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// --- Profile Update Schema ---
export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  date_of_birth: z.string().optional().nullable(),
  height_cm: z.number().min(50, "Height must be between 50 and 260 cm").max(260).optional().nullable(),
  weight_kg: z.number().min(20, "Weight must be between 20 and 250 kg").max(250).optional().nullable(),
  primary_sport: z.string().min(2, "Please enter your sport").optional().nullable(),
  playing_position: z.string().optional().nullable(),
});

// --- Wellness Record Schema ---
export const wellnessRecordSchema = z.object({
  record_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  sleep_hours: z.number().min(0, "Sleep hours cannot be negative").max(24, "Sleep cannot exceed 24h"),
  sleep_quality: z.number().int().min(1).max(10),
  water_intake_ml: z.number().min(0, "Water intake cannot be negative").max(10000, "Water intake exceeds normal limit"),
  mood_rating: z.number().int().min(1).max(10),
  fatigue_level: z.number().int().min(1).max(10),
  soreness_level: z.number().int().min(1).max(10),
  activity_notes: z.string().max(500).optional().nullable(),
  wellness_notes: z.string().max(500).optional().nullable(),
});

// --- Nutrition Record Schema ---
export const nutritionRecordSchema = z.object({
  record_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  meal_description: z.string().min(2, "Description must be at least 2 characters").max(300),
  protein_g: z.number().min(0).max(500),
  carbohydrates_g: z.number().min(0).max(1000),
  fats_g: z.number().min(0).max(500),
  water_intake_ml: z.number().min(0).max(5000),
});

// --- Injury Record Schema ---
export const injuryRecordSchema = z.object({
  body_area: z.string().min(2, "Please specify affected body area"),
  pain_level: z.number().int().min(1).max(10),
  injury_description: z.string().min(5, "Please describe the symptoms or injury").max(600),
  injury_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export const medicalUpdateInjurySchema = z.object({
  status: z.enum(["active", "recovering", "resolved"]),
  medical_notes: z.string().max(1000).optional().nullable(),
});

// --- Rehabilitation Exercise Schema ---
export const rehabExerciseSchema = z.object({
  athlete_id: z.string().uuid("Invalid athlete ID"),
  injury_id: z.string().uuid().optional().nullable(),
  exercise_name: z.string().min(3, "Exercise name must be at least 3 characters").max(150),
  instructions: z.string().min(5, "Instructions must be provided").max(800),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});
