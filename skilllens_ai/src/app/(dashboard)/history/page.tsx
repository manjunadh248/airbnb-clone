'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/shared/GlassCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { FileSearch, Clock, ArrowRight, History as HistoryIcon } from 'lucide-react';
import type { AssessmentSummary } from '@/types/assessment';

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/assessments')
      .then(res => res.json())
      .then(data => {
        setAssessments(data.assessments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading history..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-primary" />
          Assessment History
        </h1>
        <p className="text-muted-foreground mt-1">
          {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} completed
        </p>
      </div>

      {assessments.length === 0 ? (
        <GlassCard className="text-center py-16">
          <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No history yet</h2>
          <p className="text-muted-foreground">Complete your first assessment to see it here.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {assessments.map((assessment, i) => (
            <motion.div
              key={assessment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/results/${assessment._id}`}>
                <div className="glass-card p-5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileSearch className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {assessment.jobTitle || 'Untitled'}
                      </h3>
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
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted-foreground">Match</p>
                      <p className="text-lg font-bold text-primary">{assessment.matchPercentage}%</p>
                    </div>
                    {assessment.overallScore > 0 && (
                      <div className="text-right hidden md:block">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="text-lg font-bold">{assessment.overallScore}/100</p>
                      </div>
                    )}
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
