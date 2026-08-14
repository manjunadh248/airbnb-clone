// ==============================
// API: Assessments CRUD
// GET /api/assessments — List user's assessments
// ==============================

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import { demoAssessments } from '@/app/api/analyze/route';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();

    if (db) {
      const assessments = await Assessment.find({ userId: session.user.id })
        .select('jobTitle status matchPercentage overallScore jobFitPercentage resumeFileName createdAt')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      return NextResponse.json({ assessments });
    } else {
      // Demo mode — in-memory
      const assessments = Array.from(demoAssessments.values())
        .filter((a) => a.userId === session.user.id)
        .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())
        .map((a) => ({
          _id: a._id,
          jobTitle: a.jobTitle,
          status: a.status,
          matchPercentage: a.matchPercentage,
          overallScore: a.overallScore || 0,
          jobFitPercentage: a.jobFitPercentage || 0,
          resumeFileName: a.resumeFileName,
          createdAt: a.createdAt,
        }));

      return NextResponse.json({ assessments });
    }
  } catch (error) {
    console.error('List assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}
