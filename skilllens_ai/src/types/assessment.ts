// ==============================
// Assessment type definitions
// ==============================

import { Skill, SkillMatch } from './skill';
import { InterviewMessage, SkillScore } from './interview';
import { LearningPlan } from './roadmap';

export type AssessmentStatus = 'analyzing' | 'interview' | 'completed';
export type InterviewStatus = 'pending' | 'in_progress' | 'completed';

export interface RadarDataPoint {
  skill: string;
  score: number;
  fullMark: number;
}

export interface Assessment {
  _id: string;
  userId: string;
  status: AssessmentStatus;

  // Resume data
  resumeText: string;
  resumeFileName: string;
  resumeSkills: Skill[];

  // Job description data
  jobDescription: string;
  jobTitle: string;
  jdSkills: Skill[];

  // Analysis results
  matchPercentage: number;
  matchedSkills: SkillMatch[];
  missingSkills: Skill[];
  cosineSimilarity: number;

  // Interview data
  interviewStatus: InterviewStatus;
  interviewMessages: InterviewMessage[];
  skillScores: SkillScore[];

  // Composite scores
  overallScore: number;
  jobFitPercentage: number;
  radarChartData: RadarDataPoint[];

  // Learning plan
  learningPlan?: LearningPlan;

  createdAt: string;
  updatedAt: string;
}

/** Subset of Assessment used on the dashboard list */
export interface AssessmentSummary {
  _id: string;
  jobTitle: string;
  status: AssessmentStatus;
  matchPercentage: number;
  overallScore: number;
  jobFitPercentage: number;
  resumeFileName: string;
  createdAt: string;
}
