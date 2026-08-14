'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import {
  FileSearch,
  Plus,
  BarChart3,
  Target,
  BookOpen,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { AssessmentSummary } from '@/types/assessment';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/assessments')
      .then((res) => res.json())
      .then((data) => {
        setAssessments(data.assessments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const latestAssessment = assessments[0];
  const completedCount = assessments.filter((a) => a.status === 'completed').length;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
          >
            {greeting()}, {session?.user?.name?.split(' ')[0] || 'there'}! 👋
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your skill assessment overview
          </p>
        </div>
        <Link href="/analyze">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard delay={0}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Assessments</p>
              <p className="text-3xl font-bold mt-1">
                <AnimatedCounter value={assessments.length} />
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold mt-1">
                <AnimatedCounter value={completedCount} />
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Best Job Fit</p>
              <p className="text-3xl font-bold mt-1">
                <AnimatedCounter
                  value={latestAssessment?.jobFitPercentage || 0}
                  suffix="%"
                />
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-accent" />
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Score</p>
              <p className="text-3xl font-bold mt-1">
                <AnimatedCounter
                  value={
                    completedCount > 0
                      ? Math.round(
                          assessments
                            .filter((a) => a.status === 'completed')
                            .reduce((sum, a) => sum + (a.overallScore || 0), 0) / completedCount
                        )
                      : 0
                  }
                  suffix="/100"
                />
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-500" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Assessments or Empty State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 skeleton-shimmer h-24 rounded-xl" />
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <GlassCard className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <FileSearch className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No assessments yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload your resume and paste a job description to get your first AI-powered skill assessment.
          </p>
          <Link href="/analyze">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Start Your First Assessment
            </Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Assessments</h2>
          {assessments.slice(0, 5).map((assessment, i) => (
            <motion.div
              key={assessment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={
                assessment.status === 'completed'
                  ? `/results/${assessment._id}`
                  : assessment.status === 'interview'
                  ? `/interview?id=${assessment._id}`
                  : `/analyze`
              }>
                <div className="glass-card p-5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileSearch className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{assessment.jobTitle || 'Untitled Assessment'}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </span>
                        <Badge variant={
                          assessment.status === 'completed' ? 'default' :
                          assessment.status === 'interview' ? 'secondary' : 'outline'
                        }>
                          {assessment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {assessment.matchPercentage > 0 && (
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-muted-foreground">Match</p>
                        <p className="text-lg font-bold text-primary">{assessment.matchPercentage}%</p>
                      </div>
                    )}
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {assessments.length > 5 && (
            <div className="text-center pt-4">
              <Link href="/history">
                <Button variant="ghost" className="text-primary">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View All History
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
