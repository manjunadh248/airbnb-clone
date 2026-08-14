// ==============================
// Skill-related type definitions
// ==============================

export type SkillCategory = 'technical' | 'soft' | 'domain' | 'tool';
export type SkillImportance = 'critical' | 'important' | 'nice-to-have';

export interface Skill {
  name: string;
  category: SkillCategory;
  proficiency?: number;       // 0–100, estimated from resume
  importance?: SkillImportance;
  source?: string;            // evidence from resume text
  required?: boolean;         // from JD analysis
}

export interface SkillMatch {
  skill: string;
  category: SkillCategory;
  resumeScore: number;        // proficiency from resume (0–100)
  jdRelevance: number;        // importance weighting from JD (0–100)
  matchConfidence: number;    // semantic similarity score (0–1)
}
