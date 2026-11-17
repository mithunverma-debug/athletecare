# AthleteCare — Daily Wellness, Readiness & Rehabilitation Platform

> **A Centralized Sports Health & Readiness Management Platform for Collegiate Athletes, Coaches, and Medical Staff.**  
> *Developed as a production-grade College Capstone Web Development Project in Sports Fitness / Health Management.*

---

## 1. Project Overview & Objectives

In collegiate and amateur athletic departments, monitoring athlete workload, recovery, and injury risk is often hindered by fragmented communication and informal verbal check-ins. This frequently leads to overtraining, undetected chronic fatigue, and delayed rehabilitation.

**AthleteCare** is an integrated full-stack web platform engineered to:
- Enable athletes to log daily physical wellness (sleep, hydration, mood, fatigue, and muscle soreness) in under 60 seconds.
- Compute a transparent **100-Point Readiness Index** with scientific weighting and traffic-light guidance (Green, Yellow, Red).
- Provide head coaches with aggregated team readiness insights and training availability statuses while strictly protecting athlete medical privacy.
- Empower sports physiotherapists and medical personnel to manage injury reports, prescribe targeted rehabilitation exercises, track drill compliance, and authorize return-to-play clearances.
- Provide platform administrators with role governance, user activation/deactivation, and immutable security audit logs.

> **Academic & Demonstrative Notice:**  
> AthleteCare is engineered strictly for educational demonstration and daily lifestyle athletic self-tracking. It is **NOT** a medical diagnostic device, emergency response triage system, or pharmaceutical prescription software. All readiness indicators are educational scores. Acute or severe trauma requires immediate evaluation by certified sports physicians.

---

## 2. Technology Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React icons.
- **Data Visualization:** Recharts (Interactive Area charts for readiness progression and Donut charts for macronutrients).
- **Form Management & Validation:** React Hook Form, Zod.
- **Backend & APIs:** Next.js Server Actions, Route Handlers, Edge Middleware for role-based route protection.
- **Database & Authentication:** Supabase PostgreSQL, Supabase Auth (bcrypt encrypted sessions), Row Level Security (RLS) on all 9 tables.
- **Measurement Standards:** Indian athletic units (Centimetres, Kilograms, Millilitres/Litres, DD-MM-YYYY dates, Asia/Kolkata timezone).
- **Deployment:** Vercel (Hosting & Serverless Functions), GitHub (Version Control).

---

## 3. Key Modules & Route Architecture

| Route | Module | Description | Access Level |
|---|---|---|---|
| `/` | **Landing Page** | Showcase hero, 6 feature cards, 3 stakeholder columns, workflow cycle, capstone synopsis | Public |
| `/login` | **Authentication** | Secure email/password login with college demo quick-fill shortcuts | Public |
| `/register` | **Athlete Registration** | Public onboarding; strictly defaults to `athlete` role (anti-privilege escalation) | Public |
| `/forgot-password` | **Password Recovery** | Dispatches reset instructions via Supabase Auth | Public |
| `/reset-password` | **Password Update** | Secure password change form | Authenticated |
| `/athlete/dashboard` | **Athlete Dashboard** | 100-pt readiness gauge, 7-day progression chart, macro overview, assigned rehab drills | Athlete / Admin |
| `/athlete/wellness` | **Daily Wellness Log** | Morning check-in form with live score preview, duplicate check-in prevention, historical table | Athlete / Admin |
| `/athlete/nutrition` | **Nutrition & Hydration** | Meal logger (breakfast, lunch, dinner, snack), macros chart, affordable Indian athletic presets | Athlete / Admin |
| `/athlete/injuries` | **Injuries & Rehab** | Body area pain logger (1-10), consecutive pain flags (&ge;6 for 4 check-ins), rehab drill checkboxes | Athlete / Admin |
| `/athlete/profile` | **Athlete Profile** | Anthropometric tracking (height in cm, weight in kg, age from DOB, BMI calculation, position) | Athlete / Admin |
| `/coach/dashboard` | **Coach Dashboard** | Team roster, aggregated readiness averages, training availability (Full / Modified / Rest), privacy-shielded | Coach / Admin |
| `/medical/dashboard` | **Medical Suite** | Assigned athletes, pain history, clinical notes input, rehab exercise prescription, compliance tracker | Medical / Admin |
| `/admin/dashboard` | **Admin Console** | System stats, user activation/deactivation, role promotion/demotion, security audit log viewer, demo seeder | Admin Only |

---

## 4. Transparent 100-Point Readiness Engine

AthleteCare implements an educational scoring formula with a maximum of **100 points**:

$$\text{Readiness Score} = S_{\text{sleep}} + H_{\text{hydration}} + M_{\text{mood}} + F_{\text{fatigue}} + R_{\text{soreness}}$$

| Component | Max Points | Metric Normalization |
|---|---|---|
| **Sleep** | **25 pts** | Duration: 7.0–9.0h optimal (15 pts), scaled down if &lt;6h or &gt;10h. Quality: 1–10 rating normalized to 10 pts. |
| **Hydration** | **20 pts** | Scaled linearly against a 3,000 ml target ($\min(1, \frac{\text{intake}}{3000}) \times 20$). |
| **Mood** | **15 pts** | Scaled linearly from 1 to 10 emotional focus scale ($\frac{\text{mood}-1}{9} \times 15$). |
| **Fatigue** | **20 pts** | Inverted scale: level 1 is fresh (20 pts), level 10 is exhausted (0 pts). |
| **Soreness** | **20 pts** | Inverted scale: level 1 is none (20 pts), level 10 is severe pain (0 pts). |

### Classification & Action Thresholds
- **Optimal (80–100 pts) — Green:** Cleared for high-intensity training, sprint intervals, and competitive matches.
- **Moderate (60–79 pts) — Yellow:** Monitored status. Coach advised to schedule tactical drills and moderate loads.
- **Low (&lt;60 pts) — Red:** High fatigue flag. Recommended active recovery, mobility, or total rest.
- **Consecutive High Pain Alert:** If pain &ge; 6 is reported for 4 or more consecutive check-ins, the athlete is automatically flagged for mandatory clinical review by sports medical staff.

---

## 5. Database Schema & Security Architecture

The database is built on Supabase PostgreSQL with 9 relational tables protected by **Row Level Security (RLS)**:

```
                    ┌───────────────────────────┐
                    │        auth.users         │
                    └─────────────┬─────────────┘
                                  │ 1:1
                    ┌─────────────▼─────────────┐
                    │      public.profiles      │
                    └──────┬─────────────┬──────┘
                           │             │
        ┌──────────────────┼─────────────┼──────────────────┐
        │ 1:N              │ 1:N         │ 1:N              │ 1:N
┌───────▼──────────┐ ┌─────▼───────┐ ┌───▼──────────┐ ┌─────▼──────────────┐
│ wellness_records │ │  nutrition  │ │injury_records│ │ team_memberships   │
└──────────────────┘ └─────────────┘ └───────┬──────┘ └────────────────────┘
                                             │ 1:N
                                     ┌───────▼───────────┐
                                     │   rehab_exercises │
                                     └───────────────────┘
```

### Row Level Security Matrix
- **Athletes:** Can only view and update their own profiles, wellness logs, nutrition records, and report their own injuries. Cannot view other athletes' data. Cannot promote their own role. Cannot clear their own medical status.
- **Coaches:** Can view team memberships and aggregated readiness metrics for assigned athletes. **Strict Privacy Rule:** Denied access to private medical notes, injury descriptions, and mental health notes.
- **Medical Staff:** Can access injury reports, assign rehabilitation exercises, and update recovery clearance for assigned athletes.
- **Administrators:** Can manage accounts, toggle activation, reassign roles, and inspect immutable audit logs.

---

## 6. Pre-Configured Demo Accounts for College Evaluation

For university presentation and defense, the database contains pre-configured realistic demonstration accounts (Password for all demo accounts: `AthleteCare@2026`):

| Persona | Email | Role | Features Demonstrated |
|---|---|---|---|
| **Collegiate Athlete** | `athlete@athletecare.in` | `athlete` | Daily check-in, 7-day readiness chart, meal logging, hamstring rehab completion |
| **Head Coach** | `coach@athletecare.in` | `coach` | Team roster, 4-athlete readiness baseline, training availability indicators, privacy shield |
| **Sports Physiotherapist** | `medical@athletecare.in` | `medical` | Injury diagnoses, clinical note authoring, exercise prescription, compliance tracking |
| **System Administrator** | `admin@athletecare.in` | `admin` | User management, role promotion/demotion, account activation toggle, audit logs |

---

## 7. Local Installation & Development

### Prerequisites
- Node.js `v18.17+` or `v20+` or `v24+`
- npm `v9+` or `v11+`
- Git

### Steps
```bash
# 1. Clone repository
git clone https://github.com/csashishgupta/athletecare.git
cd athletecare

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env.local
cp .env.example .env.local

# Add your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://kvruyhkyknldhhsvhflt.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 4. Run automated tests
node --test tests/readiness.test.mjs

# 5. Run typecheck & linter
npx tsc --noEmit
npm run lint

# 6. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

---

## 8. Verification & QA Status

- [x] Public Landing Page (`/`) with Hero, Feature Cards, Stakeholder Sections, and Synopsis.
- [x] Supabase Auth (`/login`, `/register`, `/forgot-password`, `/reset-password`).
- [x] Athlete Dashboard (`/athlete/dashboard`) with dynamic readiness calculation and Recharts.
- [x] Daily Wellness Tracking (`/athlete/wellness`) with duplicate prevention and history table.
- [x] Nutrition & Hydration (`/athlete/nutrition`) with macro donut chart and affordable Indian presets.
- [x] Injury Management (`/athlete/injuries`) with pain slider, consecutive pain alerts, and rehab checkboxes.
- [x] Athlete Profile (`/athlete/profile`) with cm/kg units, age calculation, and BMI estimation.
- [x] Coach Dashboard (`/coach/dashboard`) with team readiness radar and strict privacy compliance.
- [x] Medical Staff Console (`/medical/dashboard`) with exercise prescription and status clearance.
- [x] Admin Console (`/admin/dashboard`) with user role management, deactivation toggle, and audit logs.
- [x] Supabase PostgreSQL: 9 relational tables with Row Level Security (RLS) active and verified.
- [x] 100% TypeScript compilation (`tsc --noEmit` pass with 0 errors).
- [x] 100% ESLint verification (`npm run lint` pass with 0 warnings/errors).
- [x] Next.js 15 production build (`npm run build` pass with 19/19 routes compiled).
- [x] Automated unit tests (`node --test tests/readiness.test.mjs` pass with 5/5 tests passing).

---

## 9. License

Developed for academic evaluation and demonstration under the MIT License.
