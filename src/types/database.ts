export type UserRole = 'athlete' | 'coach' | 'medical' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  primary_sport: string | null;
  playing_position: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WellnessRecord {
  id: string;
  athlete_id: string;
  record_date: string; // YYYY-MM-DD
  sleep_hours: number;
  sleep_quality: number; // 1-10
  water_intake_ml: number;
  mood_rating: number; // 1-10
  fatigue_level: number; // 1-10 (1 = low, 10 = exhausted)
  soreness_level: number; // 1-10 (1 = none, 10 = severe)
  activity_notes: string | null;
  wellness_notes: string | null;
  readiness_score: number | null; // 0-100
  created_at: string;
  updated_at: string;
}

export interface NutritionRecord {
  id: string;
  athlete_id: string;
  record_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_description: string;
  protein_g: number;
  carbohydrates_g: number;
  fats_g: number;
  water_intake_ml: number;
  created_at: string;
}

export interface InjuryRecord {
  id: string;
  athlete_id: string;
  body_area: string;
  pain_level: number; // 1-10
  injury_description: string;
  injury_date: string;
  status: 'active' | 'recovering' | 'resolved';
  medical_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RehabilitationExercise {
  id: string;
  athlete_id: string;
  assigned_by: string;
  injury_id: string | null;
  exercise_name: string;
  instructions: string;
  scheduled_date: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface MedicalAssignment {
  id: string;
  athlete_id: string;
  medical_staff_id: string;
  assigned_at: string;
}

export interface TeamMembership {
  id: string;
  athlete_id: string;
  coach_id: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface ReadinessBreakdown {
  totalScore: number | null;
  status: 'optimal' | 'moderate' | 'low' | 'incomplete';
  statusColor: 'green' | 'yellow' | 'red' | 'gray';
  statusLabel: string;
  components: {
    sleep: { score: number; max: 25; label: string };
    hydration: { score: number; max: 20; label: string };
    mood: { score: number; max: 15; label: string };
    fatigue: { score: number; max: 20; label: string };
    soreness: { score: number; max: 20; label: string };
  };
  disclaimer: string;
}
