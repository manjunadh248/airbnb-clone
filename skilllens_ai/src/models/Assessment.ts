// ==============================
// Mongoose Models — Assessment
// Stores the complete analysis pipeline results
// ==============================

import mongoose, { Schema, models, type Document } from 'mongoose';

const SkillSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['technical', 'soft', 'domain', 'tool'], required: true },
  proficiency: { type: Number, min: 0, max: 100 },
  importance: { type: String, enum: ['critical', 'important', 'nice-to-have'] },
  source: { type: String },
  required: { type: Boolean },
}, { _id: false });

const SkillMatchSchema = new Schema({
  skill: { type: String, required: true },
  category: { type: String, required: true },
  resumeScore: { type: Number, required: true },
  jdRelevance: { type: Number, required: true },
  matchConfidence: { type: Number, required: true },
}, { _id: false });

const MessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: String, required: true },
  skillContext: { type: String },
}, { _id: false });

const SkillScoreSchema = new Schema({
  skillName: { type: String, required: true },
  resumeScore: { type: Number, required: true },
  interviewScore: { type: Number, required: true },
  compositeScore: { type: Number, required: true },
  weight: { type: Number, required: true },
  rationale: { type: String, required: true },
}, { _id: false });

const ResourceSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'course', 'documentation', 'tutorial', 'book'], required: true },
  url: { type: String, required: true },
  platform: { type: String, required: true },
  estimatedDuration: { type: String, required: true },
  isFree: { type: Boolean, required: true },
}, { _id: false });

const LearningSkillSchema = new Schema({
  name: { type: String, required: true },
  currentLevel: { type: Number, required: true },
  targetLevel: { type: Number, required: true },
  gapSeverity: { type: String, enum: ['critical', 'moderate', 'minor'], required: true },
  estimatedTime: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  resources: [ResourceSchema],
  completed: { type: Boolean, default: false },
  order: { type: Number, required: true },
}, { _id: false });

const RadarDataSchema = new Schema({
  skill: { type: String, required: true },
  score: { type: Number, required: true },
  fullMark: { type: Number, default: 100 },
}, { _id: false });

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  status: 'analyzing' | 'interview' | 'completed';
  resumeText: string;
  resumeFileName: string;
  resumeSkills: typeof SkillSchema[];
  jobDescription: string;
  jobTitle: string;
  jdSkills: typeof SkillSchema[];
  matchPercentage: number;
  matchedSkills: typeof SkillMatchSchema[];
  missingSkills: typeof SkillSchema[];
  cosineSimilarity: number;
  interviewStatus: 'pending' | 'in_progress' | 'completed';
  interviewMessages: typeof MessageSchema[];
  skillScores: typeof SkillScoreSchema[];
  overallScore: number;
  jobFitPercentage: number;
  radarChartData: typeof RadarDataSchema[];
  learningPlan?: {
    skills: typeof LearningSkillSchema[];
    totalEstimatedTime: string;
    generatedAt: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['analyzing', 'interview', 'completed'], default: 'analyzing' },

    // Resume data
    resumeText: { type: String, required: true },
    resumeFileName: { type: String, required: true },
    resumeSkills: [SkillSchema],

    // Job description data
    jobDescription: { type: String, required: true },
    jobTitle: { type: String, default: '' },
    jdSkills: [SkillSchema],

    // Analysis results
    matchPercentage: { type: Number, default: 0 },
    matchedSkills: [SkillMatchSchema],
    missingSkills: [SkillSchema],
    cosineSimilarity: { type: Number, default: 0 },

    // Interview data
    interviewStatus: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    interviewMessages: [MessageSchema],
    skillScores: [SkillScoreSchema],

    // Composite scores
    overallScore: { type: Number, default: 0 },
    jobFitPercentage: { type: Number, default: 0 },
    radarChartData: [RadarDataSchema],

    // Learning plan
    learningPlan: {
      skills: [LearningSkillSchema],
      totalEstimatedTime: { type: String },
      generatedAt: { type: String },
    },
  },
  { timestamps: true }
);

const Assessment = models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
export default Assessment;
