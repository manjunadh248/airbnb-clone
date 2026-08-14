// ==============================
// Learning Roadmap type definitions
// ==============================

export type GapSeverity = 'critical' | 'moderate' | 'minor';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ResourceType = 'video' | 'course' | 'documentation' | 'tutorial' | 'book';

export interface Resource {
  title: string;
  type: ResourceType;
  url: string;
  platform: string;
  estimatedDuration: string;
  isFree: boolean;
}

export interface LearningSkill {
  name: string;
  currentLevel: number;       // 0–100
  targetLevel: number;        // 0–100
  gapSeverity: GapSeverity;
  estimatedTime: string;      // e.g., "2 weeks"
  difficulty: DifficultyLevel;
  resources: Resource[];
  completed: boolean;
  order: number;              // position in learning path
}

export interface LearningPlan {
  skills: LearningSkill[];
  totalEstimatedTime: string;
  generatedAt: string;
}
