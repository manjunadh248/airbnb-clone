// ==============================
// Scoring Engine — Weighted composite scoring
// ==============================

import type { SkillMatch } from '@/types/skill';
import type { SkillScore } from '@/types/interview';
import type { RadarDataPoint } from '@/types/assessment';

/** Scoring weights configuration */
const WEIGHTS = {
  resume: 0.30,      // 30% from resume analysis
  interview: 0.50,   // 50% from interview performance
  experience: 0.20,  // 20% from experience relevance
} as const;

/** Penalty multipliers for missing critical skills */
const MISSING_CRITICAL_PENALTY = 0.15;  // 15% penalty per missing critical skill
const MAX_PENALTY = 0.45;               // cap total penalty at 45%

/**
 * Calculate composite skill scores combining resume + interview performance.
 * Returns an array of SkillScore objects.
 */
export function calculateCompositeScores(
  matchedSkills: SkillMatch[],
  interviewScores: Record<string, number>,
  experienceYears?: number
): SkillScore[] {
  return matchedSkills.map((match) => {
    const interviewScore = interviewScores[match.skill] ?? 0;
    const experienceBonus = Math.min((experienceYears || 0) * 3, 15);

    const compositeScore = Math.round(
      WEIGHTS.resume * match.resumeScore +
      WEIGHTS.interview * interviewScore +
      WEIGHTS.experience * (match.resumeScore * 0.5 + experienceBonus)
    );

    return {
      skillName: match.skill,
      resumeScore: match.resumeScore,
      interviewScore,
      compositeScore: Math.min(compositeScore, 100),
      weight: match.jdRelevance / 100,
      rationale: generateScoreRationale(match, interviewScore, compositeScore),
    };
  });
}

/**
 * Calculate overall job fit percentage.
 * Combines composite scores with coverage analysis and missing skill penalties.
 */
export function calculateJobFitPercentage(
  skillScores: SkillScore[],
  missingCriticalCount: number,
  totalJDSkills: number
): number {
  if (skillScores.length === 0) return 0;

  // Weighted average of composite scores
  const totalWeight = skillScores.reduce((sum, s) => sum + s.weight, 0);
  const weightedAvg = totalWeight > 0
    ? skillScores.reduce((sum, s) => sum + s.compositeScore * s.weight, 0) / totalWeight
    : 0;

  // Coverage factor — what percentage of JD skills are addressed
  const coverageFactor = totalJDSkills > 0
    ? Math.min(skillScores.length / totalJDSkills, 1)
    : 0.5;

  // Missing critical skills penalty
  const penalty = Math.min(
    missingCriticalCount * MISSING_CRITICAL_PENALTY,
    MAX_PENALTY
  );

  const fitPercentage = weightedAvg * coverageFactor * (1 - penalty);
  return Math.round(Math.max(fitPercentage, 0));
}

/**
 * Generate radar chart data from skill scores.
 * Selects top 8 skills for clean visualization.
 */
export function generateRadarChartData(
  skillScores: SkillScore[]
): RadarDataPoint[] {
  // Sort by weight (importance) and take top 8
  const topSkills = [...skillScores]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8);

  return topSkills.map((s) => ({
    skill: s.skillName,
    score: s.compositeScore,
    fullMark: 100,
  }));
}

/**
 * Generate a human-readable rationale for a skill score.
 */
function generateScoreRationale(
  match: SkillMatch,
  interviewScore: number,
  compositeScore: number
): string {
  const parts: string[] = [];

  if (match.resumeScore >= 70) {
    parts.push(`Strong resume evidence (${match.resumeScore}/100)`);
  } else if (match.resumeScore >= 40) {
    parts.push(`Moderate resume presence (${match.resumeScore}/100)`);
  } else {
    parts.push(`Limited resume evidence (${match.resumeScore}/100)`);
  }

  if (interviewScore > 0) {
    if (interviewScore >= 70) {
      parts.push(`excellent interview performance (${interviewScore}/100)`);
    } else if (interviewScore >= 40) {
      parts.push(`adequate interview demonstration (${interviewScore}/100)`);
    } else {
      parts.push(`needs improvement in interview (${interviewScore}/100)`);
    }
  }

  parts.push(`Overall composite: ${compositeScore}/100`);
  return parts.join('. ') + '.';
}
