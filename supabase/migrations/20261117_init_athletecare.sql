-- ==============================================================================
-- AthleteCare Database Migration: Complete Schema & RLS Security
-- Project: AthleteCare — Sports Fitness & Health Management
-- Stack: Supabase PostgreSQL, Row Level Security, Triggers
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'athlete' CHECK (role IN ('athlete', 'coach', 'medical', 'admin')),
  date_of_birth date,
  height_cm numeric CHECK (height_cm IS NULL OR (height_cm > 0 AND height_cm < 300)),
  weight_kg numeric CHECK (weight_kg IS NULL OR (weight_kg > 0 AND weight_kg < 500)),
  primary_sport text,
  playing_position text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper function to check role
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- Trigger to auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'athlete' -- Default to athlete role (anti-privilege escalation)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 2. WELLNESS RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.wellness_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  record_date date NOT NULL,
  sleep_hours numeric NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality integer NOT NULL CHECK (sleep_quality BETWEEN 1 AND 10),
  water_intake_ml integer NOT NULL CHECK (water_intake_ml >= 0),
  mood_rating integer NOT NULL CHECK (mood_rating BETWEEN 1 AND 10),
  fatigue_level integer NOT NULL CHECK (fatigue_level BETWEEN 1 AND 10),
  soreness_level integer NOT NULL CHECK (soreness_level BETWEEN 1 AND 10),
  activity_notes text,
  wellness_notes text,
  readiness_score numeric CHECK (readiness_score IS NULL OR (readiness_score >= 0 AND readiness_score <= 100)),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_athlete_record_date UNIQUE (athlete_id, record_date)
);

CREATE INDEX IF NOT EXISTS idx_wellness_athlete_date ON public.wellness_records(athlete_id, record_date);

-- 3. NUTRITION RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.nutrition_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  record_date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_description text NOT NULL,
  protein_g numeric DEFAULT 0 CHECK (protein_g >= 0),
  carbohydrates_g numeric DEFAULT 0 CHECK (carbohydrates_g >= 0),
  fats_g numeric DEFAULT 0 CHECK (fats_g >= 0),
  water_intake_ml integer DEFAULT 0 CHECK (water_intake_ml >= 0),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_athlete_date ON public.nutrition_records(athlete_id, record_date);

-- 4. INJURY RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.injury_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body_area text NOT NULL,
  pain_level integer NOT NULL CHECK (pain_level BETWEEN 1 AND 10),
  injury_description text NOT NULL,
  injury_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'recovering', 'resolved')),
  medical_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_injury_athlete_status ON public.injury_records(athlete_id, status);

-- 5. REHABILITATION EXERCISES TABLE
CREATE TABLE IF NOT EXISTS public.rehabilitation_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  injury_id uuid REFERENCES public.injury_records(id) ON DELETE SET NULL,
  exercise_name text NOT NULL,
  instructions text NOT NULL,
  scheduled_date date NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rehab_athlete_date ON public.rehabilitation_exercises(athlete_id, scheduled_date);

-- 6. MEDICAL ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.medical_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medical_staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  CONSTRAINT unique_medical_assignment UNIQUE (athlete_id, medical_staff_id)
);

-- 7. TEAM MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_team_membership UNIQUE (athlete_id, coach_id)
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'alert', 'success', 'warning')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injury_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rehabilitation_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Coaches can view their team profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.team_memberships WHERE coach_id = auth.uid() AND athlete_id = profiles.id));
CREATE POLICY "Medical staff can view assigned athlete profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.medical_assignments WHERE medical_staff_id = auth.uid() AND athlete_id = profiles.id));
CREATE POLICY "Staff profiles are visible to authenticated users" ON public.profiles FOR SELECT USING (role IN ('coach', 'medical', 'admin'));
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Wellness Records
CREATE POLICY "Athletes can view own wellness" ON public.wellness_records FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Coaches can view team wellness" ON public.wellness_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.team_memberships WHERE coach_id = auth.uid() AND athlete_id = wellness_records.athlete_id));
CREATE POLICY "Medical staff can view assigned athlete wellness" ON public.wellness_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.medical_assignments WHERE medical_staff_id = auth.uid() AND athlete_id = wellness_records.athlete_id));
CREATE POLICY "Admins can view all wellness" ON public.wellness_records FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Athletes can insert own wellness" ON public.wellness_records FOR INSERT WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "Athletes can update own wellness" ON public.wellness_records FOR UPDATE USING (athlete_id = auth.uid()) WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "Athletes can delete own wellness" ON public.wellness_records FOR DELETE USING (athlete_id = auth.uid());

-- Nutrition Records
CREATE POLICY "Athletes can view own nutrition" ON public.nutrition_records FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Coaches can view team nutrition" ON public.nutrition_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.team_memberships WHERE coach_id = auth.uid() AND athlete_id = nutrition_records.athlete_id));
CREATE POLICY "Medical staff can view assigned athlete nutrition" ON public.nutrition_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.medical_assignments WHERE medical_staff_id = auth.uid() AND athlete_id = nutrition_records.athlete_id));
CREATE POLICY "Athletes can insert own nutrition" ON public.nutrition_records FOR INSERT WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "Athletes can update own nutrition" ON public.nutrition_records FOR UPDATE USING (athlete_id = auth.uid());
CREATE POLICY "Athletes can delete own nutrition" ON public.nutrition_records FOR DELETE USING (athlete_id = auth.uid());

-- Injury Records (Strict privacy: coaches excluded)
CREATE POLICY "Athletes can view own injuries" ON public.injury_records FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Medical staff can view assigned athlete injuries" ON public.injury_records FOR SELECT USING (EXISTS (SELECT 1 FROM public.medical_assignments WHERE medical_staff_id = auth.uid() AND athlete_id = injury_records.athlete_id));
CREATE POLICY "Admins can view all injuries" ON public.injury_records FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Athletes can report own injuries" ON public.injury_records FOR INSERT WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "Medical staff can update injuries" ON public.injury_records FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.medical_assignments WHERE medical_staff_id = auth.uid() AND athlete_id = injury_records.athlete_id) OR public.get_user_role(auth.uid()) = 'admin'
);

-- Rehabilitation Exercises
CREATE POLICY "Athletes can view assigned exercises" ON public.rehabilitation_exercises FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Medical staff can view exercises" ON public.rehabilitation_exercises FOR SELECT USING (
  assigned_by = auth.uid() OR EXISTS (SELECT 1 FROM public.medical_assignments WHERE medical_staff_id = auth.uid() AND athlete_id = rehabilitation_exercises.athlete_id) OR public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Medical staff can assign exercises" ON public.rehabilitation_exercises FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('medical', 'admin'));
CREATE POLICY "Athletes can update exercise completion" ON public.rehabilitation_exercises FOR UPDATE USING (athlete_id = auth.uid() OR assigned_by = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');

-- Medical Assignments
CREATE POLICY "Athletes can view their medical assignments" ON public.medical_assignments FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Medical staff can view their assignments" ON public.medical_assignments FOR SELECT USING (medical_staff_id = auth.uid());
CREATE POLICY "Admins can manage medical assignments" ON public.medical_assignments FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Team Memberships
CREATE POLICY "Athletes can view their team membership" ON public.team_memberships FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Coaches can view their team members" ON public.team_memberships FOR SELECT USING (coach_id = auth.uid());
CREATE POLICY "Coaches and admins can manage team memberships" ON public.team_memberships FOR ALL USING (coach_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Audit Logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
