// ==============================
// Zod Validation Schemas
// Used for API input validation
// ==============================

import { z } from 'zod';

/** Validate the analyze request (JD text + uploaded resume text) */
export const analyzeRequestSchema = z.object({
  resumeText: z.string().min(50, 'Resume text must be at least 50 characters'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
  resumeFileName: z.string().min(1, 'Resume file name is required'),
});

/** Validate a chat message from the interview */
export const chatMessageSchema = z.object({
  assessmentId: z.string().min(1, 'Assessment ID is required'),
  message: z.string().min(1, 'Message cannot be empty'),
});

/** Validate scoring request */
export const scoringRequestSchema = z.object({
  assessmentId: z.string().min(1, 'Assessment ID is required'),
});

/** Validate roadmap generation request */
export const roadmapRequestSchema = z.object({
  assessmentId: z.string().min(1, 'Assessment ID is required'),
});

/** Validate user registration */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/** Validate user login */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
