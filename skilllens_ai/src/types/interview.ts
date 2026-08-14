// ==============================
// Interview / Chat type definitions
// ==============================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface InterviewMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  skillContext?: string;      // which skill this question targets
}

export interface SkillScore {
  skillName: string;
  resumeScore: number;        // from resume analysis (0–100)
  interviewScore: number;     // from AI interview (0–100)
  compositeScore: number;     // weighted combination
  weight: number;             // importance weight (0–1)
  rationale: string;          // AI explanation of score
}

export interface InterviewState {
  isActive: boolean;
  currentSkill: string | null;
  questionsAsked: number;
  skillsAssessed: string[];
  totalSkillsToAssess: number;
}
