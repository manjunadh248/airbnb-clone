// ==============================
// API: Learning Roadmap Generation
// POST /api/roadmap — AI-generated personalized learning path
// ==============================

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import { isAIEnabled, openai } from '@/lib/openai';
import { ROADMAP_GENERATION_PROMPT } from '@/lib/prompts';
import { DEMO_LEARNING_PLAN } from '@/lib/demo-data';
import { demoAssessments } from '@/app/api/analyze/route';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessmentId } = await req.json();
    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    let learningPlan;

    if (db) {
      const assessment = await Assessment.findOne({
        _id: assessmentId,
        userId: session.user.id,
      });

      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      if (isAIEnabled) {
        const gapSummary = [
          ...assessment.missingSkills.map((s: { name: string; importance: string }) => ({
            name: s.name, currentLevel: 0, importance: s.importance,
          })),
          ...assessment.skillScores
            .filter((s: { compositeScore: number }) => s.compositeScore < 60)
            .map((s: { skillName: string; compositeScore: number }) => ({
              name: s.skillName, currentLevel: s.compositeScore, importance: 'important',
            })),
        ];

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: ROADMAP_GENERATION_PROMPT },
            {
              role: 'user',
              content: `Job Title: ${assessment.jobTitle}\n\nSkill Gaps to Address:\n${JSON.stringify(gapSummary, null, 2)}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5,
        });

        const roadmapData = JSON.parse(response.choices[0].message.content || '{}');
        learningPlan = {
          skills: roadmapData.skills || [],
          totalEstimatedTime: roadmapData.totalEstimatedTime || 'Variable',
          generatedAt: new Date().toISOString(),
        };
      } else {
        learningPlan = DEMO_LEARNING_PLAN;
      }

      assessment.learningPlan = learningPlan;
      await assessment.save();
    } else {
      // Demo mode
      learningPlan = DEMO_LEARNING_PLAN;
      const assessment = demoAssessments.get(assessmentId);
      if (assessment) {
        assessment.learningPlan = learningPlan;
      }
    }

    return NextResponse.json({
      learningPlan,
      isDemo: !isAIEnabled,
    });
  } catch (error) {
    console.error('Roadmap error:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning roadmap' },
      { status: 500 }
    );
  }
}
