-- ==============================================================================
-- AthleteCare Seed Data for Demonstration & College Evaluation
-- Accounts:
--   Athlete: athlete@athletecare.in / AthleteCare@2026
--   Coach: coach@athletecare.in / AthleteCare@2026
--   Medical: medical@athletecare.in / AthleteCare@2026
--   Admin: admin@athletecare.in / AthleteCare@2026
-- ==============================================================================

-- 1. Create Demo Users in auth.users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token, email_change_token_new, reauthentication_token)
VALUES
('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@athletecare.in', crypt('AthleteCare@2026', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vikram Verma (Admin)"}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'coach@athletecare.in', crypt('AthleteCare@2026', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Coach Rahul Dravid"}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'medical@athletecare.in', crypt('AthleteCare@2026', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Ananya Sen (Physiotherapist)"}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'athlete@athletecare.in', crypt('AthleteCare@2026', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Virat Sharma"}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'rohit.sharma@athletecare.in', crypt('AthleteCare@2026', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rohit Sharma"}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'sunil.chhetri@athletecare.in', crypt('AthleteCare@2026', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sunil Chhetri"}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'pv.sindhu@athletecare.in', crypt('AthleteCare@2026', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"P. V. Sindhu"}', now(), now(), 'authenticated', 'authenticated', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 2. Update Profiles
UPDATE public.profiles SET role = 'admin', full_name = 'Vikram Verma (Admin)' WHERE id = 'a0000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role = 'coach', full_name = 'Coach Rahul Dravid', primary_sport = 'Cricket' WHERE id = 'c0000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role = 'medical', full_name = 'Dr. Ananya Sen (Physiotherapist)', primary_sport = 'Sports Medicine' WHERE id = 'd0000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role = 'athlete', full_name = 'Virat Sharma', date_of_birth = '2002-11-05', height_cm = 175, weight_kg = 72, primary_sport = 'Cricket', playing_position = 'Top-Order Batsman' WHERE id = '10000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role = 'athlete', full_name = 'Rohit Sharma', date_of_birth = '2001-04-30', height_cm = 178, weight_kg = 79, primary_sport = 'Cricket', playing_position = 'Opening Batsman' WHERE id = '10000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role = 'athlete', full_name = 'Sunil Chhetri', date_of_birth = '2000-08-03', height_cm = 170, weight_kg = 68, primary_sport = 'Football', playing_position = 'Forward / Striker' WHERE id = '10000000-0000-0000-0000-000000000003';
UPDATE public.profiles SET role = 'athlete', full_name = 'P. V. Sindhu', date_of_birth = '2001-07-05', height_cm = 179, weight_kg = 65, primary_sport = 'Badminton', playing_position = 'Women Singles' WHERE id = '10000000-0000-0000-0000-000000000004';

-- 3. Team Memberships & Medical Assignments
INSERT INTO public.team_memberships (athlete_id, coach_id) VALUES
('10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO public.medical_assignments (athlete_id, medical_staff_id) VALUES
('10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
