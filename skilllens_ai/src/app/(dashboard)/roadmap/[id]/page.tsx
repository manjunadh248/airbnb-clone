'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import GlassCard from '@/components/shared/GlassCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  BookOpen,
  Clock,
  ExternalLink,
  CheckCircle2,
  Circle,
  Video,
  GraduationCap,
  FileText,
  Sparkles,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import type { Assessment } from '@/types/assessment';
import type { LearningSkill, Resource } from '@/types/roadmap';

const resourceIcons: Record<string, React.ElementType> = {
  video: Video,
  course: GraduationCap,
  documentation: FileText,
  tutorial: BookOpen,
  book: BookOpen,
};

const severityColors: Record<string, string> = {
  critical: 'text-destructive bg-destructive/10',
  moderate: 'text-amber-500 bg-amber-500/10',
  minor: 'text-green-500 bg-green-500/10',
};

export default function RoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    if (id === 'latest') {
      fetch('/api/assessments')
        .then(res => res.json())
        .then(data => {
          if (data.assessments?.[0]) {
            router.replace(`/roadmap/${data.assessments[0]._id}`);
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

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: id }),
      });
      const updated = await fetch(`/api/assessments/${id}`).then(r => r.json());
      setAssessment(updated.assessment);
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  };

  if (loading) return <LoadingSpinner text="Loading roadmap..." />;
  if (!assessment) return <div className="text-center py-20 text-muted-foreground">Assessment not found</div>;

  const plan = assessment.learningPlan;

  if (!plan || !plan.skills || plan.skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <GlassCard className="text-center max-w-md mx-auto py-12">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Generate Learning Roadmap</h2>
          <p className="text-muted-foreground mb-6">
            Create a personalized learning path based on your skill assessment results.
          </p>
          <Button onClick={handleGenerate} disabled={generating} className="bg-primary hover:bg-primary/90">
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate Roadmap
          </Button>
        </GlassCard>
      </div>
    );
  }

  const completedSkills = plan.skills.filter((s: LearningSkill) => s.completed).length;
  const progressPct = Math.round((completedSkills / plan.skills.length) * 100);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Learning Roadmap
        </h1>
        <p className="text-muted-foreground mt-1">{assessment.jobTitle}</p>
      </div>

      {/* Progress Overview */}
      <GlassCard hover={false}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Overall Progress</p>
            <p className="text-2xl font-bold">{completedSkills}/{plan.skills.length} skills</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Est. {plan.totalEstimatedTime}</span>
          </div>
        </div>
        <Progress value={progressPct} className="h-3" />
      </GlassCard>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

        <div className="space-y-6">
          {plan.skills
            .sort((a: LearningSkill, b: LearningSkill) => a.order - b.order)
            .map((skill: LearningSkill, i: number) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-16"
            >
              {/* Timeline node */}
              <div className={`absolute left-4 top-6 w-5 h-5 rounded-full border-2 ${
                skill.completed
                  ? 'bg-green-500 border-green-500'
                  : 'bg-background border-primary'
              }`}>
                {skill.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>

              <GlassCard hover={false} className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{skill.name}</h3>
                      <Badge className={`text-xs ${severityColors[skill.gapSeverity]}`}>
                        {skill.gapSeverity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {skill.estimatedTime}
                      </span>
                      <Badge variant="outline" className="text-xs">{skill.difficulty}</Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-muted-foreground">Skill Level</p>
                    <p className="text-lg font-bold">
                      <span className="text-destructive">{skill.currentLevel}</span>
                      <ArrowRight className="w-3 h-3 inline mx-1 text-muted-foreground" />
                      <span className="text-green-500">{skill.targetLevel}</span>
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Current</span>
                    <span>Target</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-progress"
                      style={{ width: `${skill.currentLevel}%` }}
                    />
                  </div>
                </div>

                {/* Resources */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Resources</p>
                  {skill.resources.map((resource: Resource, j: number) => {
                    const Icon = resourceIcons[resource.type] || BookOpen;
                    return (
                      <a
                        key={j}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 bg-white/3 rounded-lg hover:bg-white/6 transition-colors group"
                      >
                        <Icon className="w-4 h-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {resource.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{resource.platform}</span>
                            <span className="text-xs text-muted-foreground">· {resource.estimatedDuration}</span>
                            {resource.isFree && <Badge variant="secondary" className="text-xs py-0">Free</Badge>}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
