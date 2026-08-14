// ==============================
// API: Scoring Engine
// POST /api/scoring — Calculate composite scores and generate radar chart
// ==============================

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import { isAIEnabled, openai } from '@/lib/openai';
import { ANSWER_EVALUATION_PROMPT } from '@/lib/prompts';
import {
  calculateCompositeScores,
  calculateJobFitPercentage,
  generateRadarChartData,
} from '@/lib/scoring-engine';
import {
  DEMO_SKILL_SCORES,
  DEMO_RADAR_DATA,
  DEMO_OVERALL_SCORE,
  DEMO_JOB_FIT,
} from '@/lib/demo-data';
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

    let skillScores, radarChartData, overallScore, jobFitPercentage;

    if (db) {
      const assessment = await Assessment.findOne({
        _id: assessmentId,
        userId: session.user.id,
      });

      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      if (isAIEnabled && assessment.interviewMessages?.length > 0) {
        const evalResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: ANSWER_EVALUATION_PROMPT },
            {
              role: 'user',
              content: `Evaluate this interview conversation:\n\n${JSON.stringify(assessment.interviewMessages)}\n\nSkills to evaluate: ${assessment.missingSkills.map((s: { name: string }) => s.name).join(', ')}, ${assessment.matchedSkills.map((s: { skill: string }) => s.skill).join(', ')}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });

        const evalData = JSON.parse(evalResponse.choices[0].message.content || '{}');
        const interviewScores: Record<string, number> = {};
        if (evalData.scores) {
          for (const score of evalData.scores) {
            interviewScores[score.skill || score.skillName] = score.score || 0;
          }
        }

        skillScores = calculateCompositeScores(assessment.matchedSkills, interviewScores);
        radarChartData = generateRadarChartData(skillScores);
        overallScore = Math.round(
          skillScores.reduce((sum: number, s: { compositeScore: number }) => sum + s.compositeScore, 0) / Math.max(skillScores.length, 1)
        );
        const missingCritical = assessment.missingSkills.filter(
          (s: { importance: string }) => s.importance === 'critical'
        ).length;
        jobFitPercentage = calculateJobFitPercentage(skillScores, missingCritical, assessment.jdSkills.length);
      } else {
        skillScores = DEMO_SKILL_SCORES;
        radarChartData = DEMO_RADAR_DATA;
        overallScore = DEMO_OVERALL_SCORE;
        jobFitPercentage = DEMO_JOB_FIT;
      }

      assessment.skillScores = skillScores;
      assessment.radarChartData = radarChartData;
      assessment.overallScore = overallScore;
      assessment.jobFitPercentage = jobFitPercentage;
      assessment.interviewStatus = 'completed';
      assessment.status = 'completed';
      await assessment.save();
    } else {
      // Demo mode — in-memory
      skillScores = DEMO_SKILL_SCORES;
      radarChartData = DEMO_RADAR_DATA;
      overallScore = DEMO_OVERALL_SCORE;
      jobFitPercentage = DEMO_JOB_FIT;

      const assessment = demoAssessments.get(assessmentId);
      if (assessment) {
        assessment.skillScores = skillScores;
        assessment.radarChartData = radarChartData;
        assessment.overallScore = overallScore;
        assessment.jobFitPercentage = jobFitPercentage;
        assessment.interviewStatus = 'completed';
        assessment.status = 'completed';
      }
    }

    return NextResponse.json({
      skillScores,
      radarChartData,
      overallScore,
      jobFitPercentage,
      isDemo: !isAIEnabled,
    });
  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate scores' },
      { status: 500 }
    );
  }
}
