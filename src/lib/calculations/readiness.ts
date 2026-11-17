import { ReadinessBreakdown } from "@/types/database";

export interface WellnessInputs {
  sleep_hours?: number | null;
  sleep_quality?: number | null; // 1-10
  water_intake_ml?: number | null; // in ml
  mood_rating?: number | null; // 1-10
  fatigue_level?: number | null; // 1-10 (1 = fresh, 10 = exhausted)
  soreness_level?: number | null; // 1-10 (1 = none, 10 = extreme)
}

/**
 * Calculates a transparent, 100-point educational readiness score based on daily wellness metrics.
 * 
 * Formula Breakdown:
 * 1. Sleep (Max 25 pts):
 *    - Sleep Duration (Max 15 pts): 8h optimal (15 pts), 7-9h (13-15 pts), <5h or >11h penalized.
 *    - Sleep Quality (Max 10 pts): scaled linearly from 1-10 rating.
 * 2. Hydration (Max 20 pts):
 *    - Target 3000 ml: scaled linearly up to 3000 ml.
 * 3. Mood (Max 15 pts):
 *    - Scaled linearly from 1-10 rating.
 * 4. Fatigue (Max 20 pts):
 *    - Inverted scale: fatigue of 1 is best (20 pts), fatigue of 10 is exhausted (0 pts).
 * 5. Muscle Soreness (Max 20 pts):
 *    - Inverted scale: soreness of 1 is none (20 pts), soreness of 10 is severe (0 pts).
 * 
 * Total = 0 to 100 points.
 */
export function calculateReadinessScore(inputs: WellnessInputs): ReadinessBreakdown {
  const disclaimer =
    "AthleteCare readiness scores provide indicative daily wellness trends for educational demonstration and athletic self-awareness. This is NOT a medical diagnosis, emergency response, or clearance for sports participation.";

  // Check if any mandatory inputs are missing
  if (
    inputs.sleep_hours == null ||
    inputs.sleep_quality == null ||
    inputs.water_intake_ml == null ||
    inputs.mood_rating == null ||
    inputs.fatigue_level == null ||
    inputs.soreness_level == null
  ) {
    return {
      totalScore: null,
      status: "incomplete",
      statusColor: "gray",
      statusLabel: "Incomplete Data",
      components: {
        sleep: { score: 0, max: 25, label: "Awaiting entry" },
        hydration: { score: 0, max: 20, label: "Awaiting entry" },
        mood: { score: 0, max: 15, label: "Awaiting entry" },
        fatigue: { score: 0, max: 20, label: "Awaiting entry" },
        soreness: { score: 0, max: 20, label: "Awaiting entry" },
      },
      disclaimer,
    };
  }

  // 1. Sleep: Duration (15 pts) + Quality (10 pts)
  let sleepDurationScore = 0;
  const hours = inputs.sleep_hours;
  if (hours >= 7 && hours <= 9) {
    sleepDurationScore = 15;
  } else if (hours >= 6 && hours < 7) {
    sleepDurationScore = 12;
  } else if (hours > 9 && hours <= 10) {
    sleepDurationScore = 13;
  } else if (hours >= 5 && hours < 6) {
    sleepDurationScore = 8;
  } else if (hours > 10 && hours <= 11) {
    sleepDurationScore = 9;
  } else {
    sleepDurationScore = Math.max(0, Math.min(6, hours * 1.2));
  }
  const sleepQualityScore = Math.min(10, Math.max(1, inputs.sleep_quality));
  const sleepTotal = Math.round((sleepDurationScore + sleepQualityScore) * 10) / 10;

  // 2. Hydration (Max 20 pts, 3000 ml target)
  const hydrationRatio = Math.min(1, Math.max(0, inputs.water_intake_ml / 3000));
  const hydrationTotal = Math.round(hydrationRatio * 20 * 10) / 10;

  // 3. Mood (Max 15 pts, 1-10 scale)
  const moodRatio = Math.min(1, Math.max(0, (inputs.mood_rating - 1) / 9));
  const moodTotal = Math.round(moodRatio * 15 * 10) / 10;

  // 4. Fatigue (Max 20 pts, Inverted scale: 1 is best, 10 is worst)
  const fatigueRatio = Math.min(1, Math.max(0, (10 - inputs.fatigue_level) / 9));
  const fatigueTotal = Math.round(fatigueRatio * 20 * 10) / 10;

  // 5. Soreness (Max 20 pts, Inverted scale: 1 is best, 10 is worst)
  const sorenessRatio = Math.min(1, Math.max(0, (10 - inputs.soreness_level) / 9));
  const sorenessTotal = Math.round(sorenessRatio * 20 * 10) / 10;

  const total = Math.min(100, Math.max(0, Math.round(sleepTotal + hydrationTotal + moodTotal + fatigueTotal + sorenessTotal)));

  let status: 'optimal' | 'moderate' | 'low' = 'moderate';
  let statusColor: 'green' | 'yellow' | 'red' = 'yellow';
  let statusLabel = 'Moderate Readiness';

  if (total >= 80) {
    status = 'optimal';
    statusColor = 'green';
    statusLabel = 'Optimal Readiness (80-100)';
  } else if (total >= 60) {
    status = 'moderate';
    statusColor = 'yellow';
    statusLabel = 'Moderate Readiness (60-79)';
  } else {
    status = 'low';
    statusColor = 'red';
    statusLabel = 'Low Readiness (<60)';
  }

  return {
    totalScore: total,
    status,
    statusColor,
    statusLabel,
    components: {
      sleep: { score: sleepTotal, max: 25, label: `${inputs.sleep_hours}h (${inputs.sleep_quality}/10 quality)` },
      hydration: { score: hydrationTotal, max: 20, label: `${inputs.water_intake_ml} ml` },
      mood: { score: moodTotal, max: 15, label: `${inputs.mood_rating}/10 mood` },
      fatigue: { score: fatigueTotal, max: 20, label: `Level ${inputs.fatigue_level}/10` },
      soreness: { score: sorenessTotal, max: 20, label: `Level ${inputs.soreness_level}/10` },
    },
    disclaimer,
  };
}

/**
 * Checks if the athlete has reported pain >= 6 for 4 or more consecutive records/days.
 * If true, flags the athlete for authorized medical review.
 */
export function checkConsecutivePainAlert(
  painHistory: Array<{ pain_level: number; injury_date?: string; record_date?: string }>
): { hasConsecutivePain: boolean; count: number; alertMessage: string | null } {
  if (!painHistory || painHistory.length < 4) {
    return { hasConsecutivePain: false, count: 0, alertMessage: null };
  }

  // Count consecutive high pain entries from latest
  let consecutiveCount = 0;
  for (let i = 0; i < painHistory.length; i++) {
    if (painHistory[i].pain_level >= 6) {
      consecutiveCount++;
    } else {
      break;
    }
  }

  if (consecutiveCount >= 4) {
    return {
      hasConsecutivePain: true,
      count: consecutiveCount,
      alertMessage: `High pain alert: Reported pain level 6 or higher for ${consecutiveCount} consecutive check-ins. Flagged for review by sports medical staff.`,
    };
  }

  return { hasConsecutivePain: false, count: consecutiveCount, alertMessage: null };
}
