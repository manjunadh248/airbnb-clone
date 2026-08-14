'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  Target,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import type { Assessment } from '@/types/assessment';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    if (id === 'latest') {
      // Fetch latest assessment
      fetch('/api/assessments')
        .then(res => res.json())
        .then(data => {
          if (data.assessments?.[0]) {
            router.replace(`/results/${data.assessments[0]._id}`);
          } else {
            router.replace('/analyze');
          }
        });
      return;
    }

    fetch(`/api/assessments/${id}`)
      .then(res => res.json())
      .then(data => {
        setAssessment(data.assessment);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  const handleGenerateScores = async () => {
    setScoring(true);
    try {
      const res = await fetch('/api/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh assessment
        const updated = await fetch(`/api/assessments/${id}`).then(r => r.json());
        setAssessment(updated.assessment);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }
    setScoring(false);
  };

  if (loading) return <LoadingSpinner text="Loading results..." />;
  if (!assessment) return <div className="text-center py-20 text-muted-foreground">Assessment not found</div>;

  const hasScores = assessment.skillScores && assessment.skillScores.length > 0;
  const hasRadar = assessment.radarChartData && assessment.radarChartData.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{assessment.jobTitle || 'Assessment Results'}</h1>
          <p className="text-muted-foreground mt-1">
            {assessment.resumeFileName} · {new Date(assessment.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          {assessment.interviewStatus !== 'completed' && (
            <Link href={`/interview?id=${assessment._id}`}>
              <Button className="bg-primary hover:bg-primary/90">
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Interview
              </Button>
            </Link>
          )}
          {hasScores && (
            <Link href={`/roadmap/${assessment._id}`}>
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                View Roadmap
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard glow="primary" delay={0}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Skill Match</p>
            <p className="text-4xl font-bold text-primary">
              <AnimatedCounter value={assessment.matchPercentage} suffix="%" />
            </p>
            <p className="text-xs text-muted-foreground mt-1">Resume vs Job Description</p>
          </div>
        </GlassCard>

        <GlassCard glow={hasScores ? 'accent' : 'none'} delay={0.1}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
            <p className="text-4xl font-bold text-accent">
              <AnimatedCounter value={assessment.overallScore || 0} suffix="/100" />
            </p>
            <p className="text-xs text-muted-foreground mt-1">Composite Performance</p>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Job Fit</p>
            <p className="text-4xl font-bold">
              <AnimatedCounter value={assessment.jobFitPercentage || 0} suffix="%" />
            </p>
            <p className="text-xs text-muted-foreground mt-1">Overall Compatibility</p>
          </div>
        </GlassCard>
      </div>

      {/* Generate Scores Button (if interview done but no scores) */}
      {!hasScores && assessment.interviewStatus === 'completed' && (
        <GlassCard hover={false} className="text-center py-8">
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Interview Complete!</h3>
          <p className="text-muted-foreground mb-4">Generate your composite scores and radar chart</p>
          <Button onClick={handleGenerateScores} disabled={scoring} className="bg-primary hover:bg-primary/90">
            {scoring ? <LoadingSpinner size="sm" /> : <BarChart3 className="w-4 h-4 mr-2" />}
            Generate Scores
          </Button>
        </GlassCard>
      )}

      {/* Radar Chart + Skill Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <GlassCard hover={false} delay={0.3}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Skill Radar
          </h2>
          {hasRadar ? (
            <div className="h-[350px] radar-glow">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={assessment.radarChartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="oklch(0.623 0.265 262.881)"
                    fill="oklch(0.623 0.265 262.881)"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Complete the interview to generate your skill radar chart
            </div>
          )}
        </GlassCard>

        {/* Matched Skills */}
        <GlassCard hover={false} delay={0.4}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Matched Skills
          </h2>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {assessment.matchedSkills?.map((match, i) => (
              <motion.div
                key={match.skill}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center justify-between p-3 bg-white/3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{match.skill}</p>
                    <Badge variant="outline" className="text-xs mt-0.5">{match.category}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{match.resumeScore}</p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Missing Skills */}
      {assessment.missingSkills && assessment.missingSkills.length > 0 && (
        <GlassCard hover={false} delay={0.5}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            Missing Skills
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {assessment.missingSkills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 p-3 bg-white/3 rounded-lg"
              >
                <XCircle className="w-4 h-4 text-destructive/60 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{skill.name}</p>
                  <Badge
                    variant={skill.importance === 'critical' ? 'destructive' : 'outline'}
                    className="text-xs mt-0.5"
                  >
                    {skill.importance}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Skill Scores Detail */}
      {hasScores && (
        <GlassCard hover={false} delay={0.6}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Detailed Skill Scores
          </h2>
          <div className="space-y-4">
            {assessment.skillScores.map((score, i) => (
              <motion.div
                key={score.skillName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{score.skillName}</span>
                  <span className="text-sm font-bold text-primary">{score.compositeScore}/100</span>
                </div>
                <Progress value={score.compositeScore} className="h-2" />
                <p className="text-xs text-muted-foreground">{score.rationale}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        {assessment.interviewStatus !== 'completed' && (
          <Link href={`/interview?id=${assessment._id}`}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <MessageSquare className="w-5 h-5 mr-2" />
              Start AI Interview
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        )}
        {hasScores && (
          <Link href={`/roadmap/${assessment._id}`}>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <BookOpen className="w-5 h-5 mr-2" />
              Generate Learning Roadmap
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
