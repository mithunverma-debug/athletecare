import test from "node:test";
import assert from "node:assert/strict";

// Recreate calculation logic for standalone test verification
function calculateReadinessScore(inputs) {
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
    };
  }

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

  const hydrationRatio = Math.min(1, Math.max(0, inputs.water_intake_ml / 3000));
  const hydrationTotal = Math.round(hydrationRatio * 20 * 10) / 10;

  const moodRatio = Math.min(1, Math.max(0, (inputs.mood_rating - 1) / 9));
  const moodTotal = Math.round(moodRatio * 15 * 10) / 10;

  const fatigueRatio = Math.min(1, Math.max(0, (10 - inputs.fatigue_level) / 9));
  const fatigueTotal = Math.round(fatigueRatio * 20 * 10) / 10;

  const sorenessRatio = Math.min(1, Math.max(0, (10 - inputs.soreness_level) / 9));
  const sorenessTotal = Math.round(sorenessRatio * 20 * 10) / 10;

  const total = Math.min(100, Math.max(0, Math.round(sleepTotal + hydrationTotal + moodTotal + fatigueTotal + sorenessTotal)));

  let status = 'moderate';
  let statusColor = 'yellow';

  if (total >= 80) {
    status = 'optimal';
    statusColor = 'green';
  } else if (total >= 60) {
    status = 'moderate';
    statusColor = 'yellow';
  } else {
    status = 'low';
    statusColor = 'red';
  }

  return { totalScore: total, status, statusColor };
}

function checkConsecutivePainAlert(painHistory) {
  if (!painHistory || painHistory.length < 4) {
    return { hasConsecutivePain: false, count: 0 };
  }
  let consecutiveCount = 0;
  for (let i = 0; i < painHistory.length; i++) {
    if (painHistory[i].pain_level >= 6) {
      consecutiveCount++;
    } else {
      break;
    }
  }
  return { hasConsecutivePain: consecutiveCount >= 4, count: consecutiveCount };
}

test("Readiness Score: Optimal Condition should score >= 80 (Green)", () => {
  const result = calculateReadinessScore({
    sleep_hours: 8.0,
    sleep_quality: 9,
    water_intake_ml: 3200,
    mood_rating: 9,
    fatigue_level: 2,
    soreness_level: 2,
  });

  assert.equal(result.status, "optimal");
  assert.equal(result.statusColor, "green");
  assert.ok(result.totalScore >= 80 && result.totalScore <= 100);
});

test("Readiness Score: Low Condition (Fatigued / Sleep Deprived) should score < 60 (Red)", () => {
  const result = calculateReadinessScore({
    sleep_hours: 4.0,
    sleep_quality: 3,
    water_intake_ml: 1200,
    mood_rating: 3,
    fatigue_level: 9,
    soreness_level: 8,
  });

  assert.equal(result.status, "low");
  assert.equal(result.statusColor, "red");
  assert.ok(result.totalScore < 60);
});

test("Readiness Score: Incomplete inputs should return null score and incomplete status", () => {
  const result = calculateReadinessScore({
    sleep_hours: 7.5,
    sleep_quality: null,
    water_intake_ml: 2500,
    mood_rating: null,
    fatigue_level: 3,
    soreness_level: 2,
  });

  assert.equal(result.totalScore, null);
  assert.equal(result.status, "incomplete");
  assert.equal(result.statusColor, "gray");
});

test("Consecutive Pain Alert: Flagged when pain >= 6 for 4+ consecutive reports", () => {
  const painReports = [
    { pain_level: 7 },
    { pain_level: 6 },
    { pain_level: 8 },
    { pain_level: 7 },
    { pain_level: 2 },
  ];
  const alert = checkConsecutivePainAlert(painReports);
  assert.equal(alert.hasConsecutivePain, true);
  assert.equal(alert.count, 4);
});

test("Consecutive Pain Alert: Not flagged when pain has broken below 6", () => {
  const painReports = [
    { pain_level: 7 },
    { pain_level: 3 }, // breaks streak
    { pain_level: 8 },
    { pain_level: 7 },
  ];
  const alert = checkConsecutivePainAlert(painReports);
  assert.equal(alert.hasConsecutivePain, false);
});
