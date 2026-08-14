// ==============================
// API: Resume + JD Analysis
// POST /api/analyze — AI-powered skill extraction and gap analysis
// Works with MongoDB OR demo mode (in-memory)
// ==============================

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import User from '@/models/User';
import { analyzeRequestSchema } from '@/lib/validators';
import { isAIEnabled, openai } from '@/lib/openai';
import {
  RESUME_EXTRACTION_PROMPT,
  JD_ANALYSIS_PROMPT,
  SKILL_GAP_PROMPT,
} from '@/lib/prompts';
import {
  DEMO_RESUME_SKILLS,
  DEMO_JD_SKILLS,
  DEMO_MATCHED_SKILLS,
  DEMO_MISSING_SKILLS,
  DEMO_JOB_TITLE,
  DEMO_MATCH_PERCENTAGE,
  DEMO_COSINE_SIMILARITY,
} from '@/lib/demo-data';

// In-memory assessment store for demo mode
export const demoAssessments = new Map<string, Record<string, unknown>>();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { resumeText, jobDescription, resumeFileName } = parsed.data;

    let resumeSkills, jdSkills, jobTitle, matchedSkills, missingSkills, matchPercentage, cosineSimilarity;

    if (isAIEnabled) {
      // ── Real AI Analysis ──
      const resumeResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: RESUME_EXTRACTION_PROMPT },
          { role: 'user', content: `Resume:\n\n${resumeText}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const resumeData = JSON.parse(resumeResponse.choices[0].message.content || '{}');
      resumeSkills = resumeData.skills || [];

      const jdResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: JD_ANALYSIS_PROMPT },
          { role: 'user', content: `Job Description:\n\n${jobDescription}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const jdData = JSON.parse(jdResponse.choices[0].message.content || '{}');
      jdSkills = jdData.skills || [];
      jobTitle = jdData.jobTitle || 'Position';

      const gapResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SKILL_GAP_PROMPT },
          {
            role: 'user',
            content: `Resume Skills:\n${JSON.stringify(resumeSkills)}\n\nJD Requirements:\n${JSON.stringify(jdSkills)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const gapData = JSON.parse(gapResponse.choices[0].message.content || '{}');
      matchedSkills = gapData.matchedSkills || [];
      missingSkills = gapData.missingSkills || [];
      matchPercentage = gapData.matchPercentage || 0;
      cosineSimilarity = matchPercentage / 100;
    } else {
      // ── Demo Mode ──
      resumeSkills = DEMO_RESUME_SKILLS;
      jdSkills = DEMO_JD_SKILLS;
      jobTitle = DEMO_JOB_TITLE;
      matchedSkills = DEMO_MATCHED_SKILLS;
      missingSkills = DEMO_MISSING_SKILLS;
      matchPercentage = DEMO_MATCH_PERCENTAGE;
      cosineSimilarity = DEMO_COSINE_SIMILARITY;
    }

    // Try to save to MongoDB, fallback to in-memory
    const db = await connectToDatabase();
    let assessmentId: string;

    if (db) {
      const assessment = await Assessment.create({
        userId: session.user.id,
        status: 'analyzing',
        resumeText,
        resumeFileName,
        resumeSkills,
        jobDescription,
        jobTitle,
        jdSkills,
        matchPercentage,
        matchedSkills,
        missingSkills,
        cosineSimilarity,
        interviewStatus: 'pending',
      });
      await User.findByIdAndUpdate(session.user.id, {
        $push: { assessments: assessment._id },
      });
      assessmentId = assessment._id.toString();
    } else {
      // Demo mode — in-memory storage
      assessmentId = `demo-assessment-${Date.now()}`;
      const assessmentData = {
        _id: assessmentId,
        userId: session.user.id,
        status: 'analyzing',
        resumeText,
        resumeFileName: resumeFileName || 'resume.pdf',
        resumeSkills,
        jobDescription,
        jobTitle,
        jdSkills,
        matchPercentage,
        matchedSkills,
        missingSkills,
        cosineSimilarity,
        interviewStatus: 'pending',
        interviewMessages: [],
        skillScores: [],
        radarChartData: [],
        overallScore: 0,
        jobFitPercentage: 0,
        learningPlan: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoAssessments.set(assessmentId, assessmentData);
    }

    return NextResponse.json({
      assessmentId,
      jobTitle,
      matchPercentage,
      cosineSimilarity,
      resumeSkills,
      jdSkills,
      matchedSkills,
      missingSkills,
      isDemo: !isAIEnabled,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume and job description' },
      { status: 500 }
    );
  }
}
