'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Brain,
  FileSearch,
  MessageSquare,
  Target,
  BookOpen,
  ArrowRight,
  Sparkles,
  BarChart3,
  Zap,
  Shield,
} from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'Resume + JD Analyzer',
    description: 'AI extracts skills from your resume and compares against job requirements with semantic matching.',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: MessageSquare,
    title: 'AI Interview Agent',
    description: 'ChatGPT-style conversational assessment that dynamically probes your skill gaps.',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    icon: Target,
    title: 'Skill Scoring Engine',
    description: 'Weighted composite scoring with interactive radar charts and job fit percentage.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: BookOpen,
    title: 'Learning Roadmap',
    description: 'Personalized path with curated resources, time estimates, and progress tracking.',
    color: 'from-amber-500 to-orange-600',
  },
];

const stats = [
  { value: '50+', label: 'Skills Tracked' },
  { value: '95%', label: 'Accuracy Rate' },
  { value: '10k+', label: 'Assessments' },
  { value: '24/7', label: 'AI Available' },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export default function LandingPage() {
  return (
    <div className="gradient-bg min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">SkillLens AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-pink-500/8 rounded-full blur-[80px] animate-float-slow" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Skill Assessment Platform</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Know Your Skills.{' '}
            <span className="text-gradient">Bridge the Gap.</span>
            <br />
            Land the Job.
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Upload your resume, paste a job description, and let AI analyze your skill gaps,
            conduct an interactive assessment, and generate a personalized learning roadmap.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 glow-primary">
                Start Free Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/10 hover:bg-white/5">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete Assessment Pipeline
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From resume upload to personalized learning plan — powered by advanced AI.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="glass-card p-8 group cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Four simple steps to career clarity</p>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: '01', icon: FileSearch, title: 'Upload & Analyze', desc: 'Drop your resume and paste the job description. AI extracts and matches skills instantly.' },
              { step: '02', icon: MessageSquare, title: 'AI Interview', desc: 'Chat with our AI interviewer who dynamically probes your skill gaps with scenario-based questions.' },
              { step: '03', icon: BarChart3, title: 'Get Your Scores', desc: 'View your composite skill scores, interactive radar chart, and overall job fit percentage.' },
              { step: '04', icon: Zap, title: 'Learn & Grow', desc: 'Follow your personalized learning roadmap with curated resources and progress tracking.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="glass-card p-6 flex items-start gap-6"
              >
                <div className="text-4xl font-bold text-primary/30 shrink-0">{item.step}</div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-12 glow-primary"
        >
          <Shield className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Discover Your Skill Gaps?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of professionals who use SkillLens AI to prepare for their dream jobs.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-10 py-6">
              Start Your Free Assessment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">SkillLens AI © {new Date().getFullYear()}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-Powered Skill Assessment & Career Development
          </p>
        </div>
      </footer>
    </div>
  );
}
