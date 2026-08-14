// GET /api/assessments/[id] — Get single assessment
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import { demoAssessments } from '@/app/api/analyze/route';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = await connectToDatabase();

    if (db) {
      const assessment = await Assessment.findOne({
        _id: id,
        userId: session.user.id,
      }).lean();

      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      return NextResponse.json({ assessment });
    } else {
      // Demo mode — in-memory
      const assessment = demoAssessments.get(id);
      if (!assessment || assessment.userId !== session.user.id) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      return NextResponse.json({ assessment });
    }
  } catch (error) {
    console.error('Get assessment error:', error);
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
  }
}
