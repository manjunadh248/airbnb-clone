// ==============================
// Demo / Mock Data
// Used when OPENAI_API_KEY is not set — provides a realistic demo experience
// ==============================

import type { Skill, SkillMatch } from '@/types/skill';
import type { SkillScore } from '@/types/interview';
import type { RadarDataPoint } from '@/types/assessment';
import type { LearningPlan } from '@/types/roadmap';

/** Simulated resume skills for a full-stack developer */
export const DEMO_RESUME_SKILLS: Skill[] = [
  { name: 'JavaScript', category: 'technical', proficiency: 85, source: '4+ years building web applications with JavaScript/TypeScript' },
  { name: 'React', category: 'technical', proficiency: 80, source: 'Built multiple production SPAs using React and Next.js' },
  { name: 'Node.js', category: 'technical', proficiency: 75, source: 'Developed REST APIs with Express and Node.js' },
  { name: 'Python', category: 'technical', proficiency: 70, source: 'Used Python for data analysis and automation scripts' },
  { name: 'SQL', category: 'technical', proficiency: 65, source: 'Managed PostgreSQL databases with complex queries' },
  { name: 'Git', category: 'tool', proficiency: 85, source: 'Daily Git workflow with branching strategies' },
  { name: 'Docker', category: 'tool', proficiency: 55, source: 'Containerized applications for deployment' },
  { name: 'Communication', category: 'soft', proficiency: 80, source: 'Led cross-team meetings and presented to stakeholders' },
  { name: 'Problem Solving', category: 'soft', proficiency: 85, source: 'Debugged complex production issues under time pressure' },
  { name: 'Agile', category: 'domain', proficiency: 75, source: 'Worked in Scrum teams with sprint planning and retrospectives' },
];

/** Simulated JD skills for a Senior Full-Stack Engineer */
export const DEMO_JD_SKILLS: Skill[] = [
  { name: 'TypeScript', category: 'technical', importance: 'critical', required: true },
  { name: 'React', category: 'technical', importance: 'critical', required: true },
  { name: 'Node.js', category: 'technical', importance: 'critical', required: true },
  { name: 'GraphQL', category: 'technical', importance: 'important', required: true },
  { name: 'AWS', category: 'tool', importance: 'important', required: true },
  { name: 'PostgreSQL', category: 'technical', importance: 'important', required: true },
  { name: 'Docker', category: 'tool', importance: 'important', required: false },
  { name: 'Kubernetes', category: 'tool', importance: 'nice-to-have', required: false },
  { name: 'CI/CD', category: 'domain', importance: 'important', required: true },
  { name: 'System Design', category: 'domain', importance: 'critical', required: true },
  { name: 'Team Leadership', category: 'soft', importance: 'important', required: true },
  { name: 'Microservices', category: 'domain', importance: 'nice-to-have', required: false },
];

/** Simulated matched skills */
export const DEMO_MATCHED_SKILLS: SkillMatch[] = [
  { skill: 'React', category: 'technical', resumeScore: 80, jdRelevance: 95, matchConfidence: 0.95 },
  { skill: 'Node.js', category: 'technical', resumeScore: 75, jdRelevance: 90, matchConfidence: 0.92 },
  { skill: 'TypeScript', category: 'technical', resumeScore: 72, jdRelevance: 95, matchConfidence: 0.85 },
  { skill: 'PostgreSQL', category: 'technical', resumeScore: 65, jdRelevance: 80, matchConfidence: 0.88 },
  { skill: 'Docker', category: 'tool', resumeScore: 55, jdRelevance: 70, matchConfidence: 0.90 },
  { skill: 'Team Leadership', category: 'soft', resumeScore: 70, jdRelevance: 75, matchConfidence: 0.78 },
];

/** Simulated missing skills */
export const DEMO_MISSING_SKILLS: Skill[] = [
  { name: 'GraphQL', category: 'technical', importance: 'important', required: true },
  { name: 'AWS', category: 'tool', importance: 'important', required: true },
  { name: 'Kubernetes', category: 'tool', importance: 'nice-to-have', required: false },
  { name: 'CI/CD', category: 'domain', importance: 'important', required: true },
  { name: 'System Design', category: 'domain', importance: 'critical', required: true },
  { name: 'Microservices', category: 'domain', importance: 'nice-to-have', required: false },
];

/** Simulated skill scores after interview */
export const DEMO_SKILL_SCORES: SkillScore[] = [
  { skillName: 'React', resumeScore: 80, interviewScore: 82, compositeScore: 80, weight: 0.95, rationale: 'Strong resume evidence (80/100). Excellent interview performance (82/100). Overall composite: 80/100.' },
  { skillName: 'Node.js', resumeScore: 75, interviewScore: 70, compositeScore: 72, weight: 0.90, rationale: 'Strong resume evidence (75/100). Adequate interview demonstration (70/100). Overall composite: 72/100.' },
  { skillName: 'TypeScript', resumeScore: 72, interviewScore: 68, compositeScore: 69, weight: 0.95, rationale: 'Moderate resume presence (72/100). Adequate interview demonstration (68/100). Overall composite: 69/100.' },
  { skillName: 'PostgreSQL', resumeScore: 65, interviewScore: 60, compositeScore: 62, weight: 0.80, rationale: 'Moderate resume presence (65/100). Adequate interview demonstration (60/100). Overall composite: 62/100.' },
  { skillName: 'Docker', resumeScore: 55, interviewScore: 45, compositeScore: 48, weight: 0.70, rationale: 'Limited resume evidence (55/100). Needs improvement in interview (45/100). Overall composite: 48/100.' },
  { skillName: 'System Design', resumeScore: 30, interviewScore: 55, compositeScore: 46, weight: 0.95, rationale: 'Limited resume evidence (30/100). Adequate interview demonstration (55/100). Overall composite: 46/100.' },
  { skillName: 'GraphQL', resumeScore: 0, interviewScore: 35, compositeScore: 18, weight: 0.80, rationale: 'No resume evidence. Needs improvement in interview (35/100). Overall composite: 18/100.' },
  { skillName: 'AWS', resumeScore: 10, interviewScore: 40, compositeScore: 27, weight: 0.80, rationale: 'Limited resume evidence (10/100). Needs improvement in interview (40/100). Overall composite: 27/100.' },
];

/** Simulated radar chart data */
export const DEMO_RADAR_DATA: RadarDataPoint[] = DEMO_SKILL_SCORES.map(s => ({
  skill: s.skillName,
  score: s.compositeScore,
  fullMark: 100,
}));

/** Simulated learning plan */
export const DEMO_LEARNING_PLAN: LearningPlan = {
  totalEstimatedTime: '8-10 weeks',
  generatedAt: new Date().toISOString(),
  skills: [
    {
      name: 'System Design',
      currentLevel: 46,
      targetLevel: 85,
      gapSeverity: 'critical',
      estimatedTime: '3 weeks',
      difficulty: 'advanced',
      completed: false,
      order: 1,
      resources: [
        { title: 'System Design Interview by Alex Xu', type: 'book', url: 'https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF', platform: 'Amazon', estimatedDuration: '2 weeks', isFree: false },
        { title: 'System Design Primer', type: 'documentation', url: 'https://github.com/donnemartin/system-design-primer', platform: 'GitHub', estimatedDuration: '1 week', isFree: true },
        { title: 'Gaurav Sen - System Design', type: 'video', url: 'https://www.youtube.com/c/GauravSensei', platform: 'YouTube', estimatedDuration: '10 hours', isFree: true },
      ],
    },
    {
      name: 'GraphQL',
      currentLevel: 18,
      targetLevel: 75,
      gapSeverity: 'critical',
      estimatedTime: '2 weeks',
      difficulty: 'intermediate',
      completed: false,
      order: 2,
      resources: [
        { title: 'GraphQL Full Course', type: 'course', url: 'https://www.udemy.com/course/graphql-bootcamp/', platform: 'Udemy', estimatedDuration: '12 hours', isFree: false },
        { title: 'How to GraphQL', type: 'tutorial', url: 'https://www.howtographql.com/', platform: 'HowToGraphQL', estimatedDuration: '5 hours', isFree: true },
        { title: 'Official GraphQL Docs', type: 'documentation', url: 'https://graphql.org/learn/', platform: 'GraphQL.org', estimatedDuration: '3 hours', isFree: true },
      ],
    },
    {
      name: 'AWS',
      currentLevel: 27,
      targetLevel: 70,
      gapSeverity: 'moderate',
      estimatedTime: '2 weeks',
      difficulty: 'intermediate',
      completed: false,
      order: 3,
      resources: [
        { title: 'AWS Certified Cloud Practitioner', type: 'course', url: 'https://www.udemy.com/course/aws-certified-cloud-practitioner-new/', platform: 'Udemy', estimatedDuration: '14 hours', isFree: false },
        { title: 'AWS Free Tier Hands-On', type: 'tutorial', url: 'https://aws.amazon.com/free/', platform: 'AWS', estimatedDuration: 'Ongoing', isFree: true },
        { title: 'TechWorld with Nana - AWS', type: 'video', url: 'https://www.youtube.com/c/TechWorldwithNana', platform: 'YouTube', estimatedDuration: '6 hours', isFree: true },
      ],
    },
    {
      name: 'CI/CD',
      currentLevel: 35,
      targetLevel: 70,
      gapSeverity: 'moderate',
      estimatedTime: '1 week',
      difficulty: 'intermediate',
      completed: false,
      order: 4,
      resources: [
        { title: 'GitHub Actions Tutorial', type: 'tutorial', url: 'https://docs.github.com/en/actions', platform: 'GitHub', estimatedDuration: '4 hours', isFree: true },
        { title: 'CI/CD Pipeline with Jenkins', type: 'video', url: 'https://www.youtube.com/watch?v=7KCS70sCoK0', platform: 'YouTube', estimatedDuration: '3 hours', isFree: true },
      ],
    },
    {
      name: 'Docker',
      currentLevel: 48,
      targetLevel: 70,
      gapSeverity: 'minor',
      estimatedTime: '1 week',
      difficulty: 'intermediate',
      completed: false,
      order: 5,
      resources: [
        { title: 'Docker Deep Dive', type: 'course', url: 'https://www.pluralsight.com/courses/docker-deep-dive-update', platform: 'Pluralsight', estimatedDuration: '6 hours', isFree: false },
        { title: 'Docker Official Docs', type: 'documentation', url: 'https://docs.docker.com/get-started/', platform: 'Docker', estimatedDuration: '3 hours', isFree: true },
      ],
    },
  ],
};

/** Demo job title */
export const DEMO_JOB_TITLE = 'Senior Full-Stack Engineer';

/** Demo match percentage */
export const DEMO_MATCH_PERCENTAGE = 62;

/** Demo overall score */
export const DEMO_OVERALL_SCORE = 58;

/** Demo job fit */
export const DEMO_JOB_FIT = 54;

/** Demo cosine similarity */
export const DEMO_COSINE_SIMILARITY = 0.73;
