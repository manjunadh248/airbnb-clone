// ==============================
// API: Interview Chat (Streaming)
// POST /api/interview — AI-powered conversational assessment
// ==============================

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import { INTERVIEW_SYSTEM_PROMPT } from '@/lib/prompts';
import { isAIEnabled } from '@/lib/openai';
import { demoAssessments } from '@/app/api/analyze/route';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, assessmentId } = await req.json();

    if (!assessmentId) {
      return new Response(JSON.stringify({ error: 'Assessment ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Try to load assessment (MongoDB or in-memory)
    const db = await connectToDatabase();
    let assessment: Record<string, unknown> | null = null;

    if (db) {
      assessment = await Assessment.findOne({
        _id: assessmentId,
        userId: session.user.id,
      });
    } else {
      const demoData = demoAssessments.get(assessmentId);
      if (demoData && demoData.userId === session.user.id) {
        assessment = demoData;
      }
    }

    if (!assessment) {
      return new Response(JSON.stringify({ error: 'Assessment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update interview status
    if (assessment.interviewStatus === 'pending') {
      assessment.interviewStatus = 'in_progress';
      assessment.status = 'interview';
      if (db && typeof (assessment as { save?: () => Promise<void> }).save === 'function') {
        await (assessment as { save: () => Promise<void> }).save();
      }
    }

    // Build skill context
    const missingSkills = (assessment.missingSkills as Array<{ name: string; importance: string }>) || [];
    const matchedSkills = (assessment.matchedSkills as Array<{ skill: string; resumeScore: number }>) || [];

    const skillContext = `
CANDIDATE PROFILE:
- Job Title: ${assessment.jobTitle}
- Match Percentage: ${assessment.matchPercentage}%

SKILLS TO ASSESS:
${missingSkills.map((s) => `- ${s.name} (${s.importance}) — MISSING`).join('\n')}

WEAK SKILLS:
${matchedSkills.filter((s) => s.resumeScore < 60).map((s) => `- ${s.skill} (score: ${s.resumeScore}/100)`).join('\n')}

Focus on the most critical gaps first. Ask practical, scenario-based questions.
`;

    if (!isAIEnabled) {
      // Demo mode — return pre-crafted responses
      const demoResponses = [
        "Great! Let's start with **System Design**, which is a critical skill for this role. Can you walk me through how you would design a URL shortening service like bit.ly? Consider the high-level architecture, database choices, and how you'd handle millions of requests.",
        "That's a good start! You've covered the basics well. Now let's dig deeper — how would you handle the **scalability** aspect? What if this service needs to handle 100 million URLs? Think about caching strategies, database sharding, and load balancing.",
        "Excellent thinking! Now let's move on to **GraphQL**. Can you explain the key differences between GraphQL and REST APIs? When would you choose one over the other in a real project?",
        "Good explanation! Let's test your practical knowledge — if you were building a social media feed using GraphQL, how would you handle pagination and real-time updates (like new posts appearing)?",
        "Nice work! Let's shift to **AWS**. Which AWS services would you use to deploy a Node.js application with a database, and how would you set up a basic CI/CD pipeline?",
        "Great overview! That covers the main areas I wanted to assess. Based on our conversation, you've shown solid fundamentals with room to grow in system design and cloud architecture. Would you like to see your results?",
      ];

      const userMsgCount = messages.filter((m: { role: string }) => m.role === 'user').length;
      const responseIndex = Math.min(userMsgCount, demoResponses.length - 1);
      const text = demoResponses[responseIndex];

      // Return as a plain text stream
      return new Response(text, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Real AI streaming
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: INTERVIEW_SYSTEM_PROMPT + '\n\n' + skillContext,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Interview error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process interview' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
