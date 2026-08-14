'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/shared/GlassCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  Upload,
  FileText,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Handle file upload
  const handleFileUpload = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResumeText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setFile(null);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileUpload(droppedFile);
    },
    [handleFileUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFileUpload(selectedFile);
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) {
      setError('Please upload a resume and enter a job description');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          resumeFileName: file?.name || 'pasted-resume.txt',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Navigate to results
      router.push(`/results/${data.assessmentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 glow-primary">
            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Profile</h2>
          <p className="text-muted-foreground mb-6">
            AI is extracting skills and comparing against job requirements...
          </p>
          <LoadingSpinner text="This may take a few seconds" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Analyze Skills</h1>
        <p className="text-muted-foreground mt-1">
          Upload your resume and paste the job description to get started
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resume Upload */}
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Resume
          </h2>

          {!file && !resumeText ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/2'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
              <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-medium mb-1">
                {dragOver ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse · PDF, DOCX, TXT
              </p>
            </div>
          ) : uploading ? (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-12 text-center">
              <LoadingSpinner text="Extracting text from resume..." />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{file?.name || 'Resume uploaded'}</p>
                    <p className="text-xs text-muted-foreground">
                      {resumeText.length.toLocaleString()} characters extracted
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); setResumeText(''); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Or paste your resume text here..."
                className="min-h-[200px] bg-white/5 border-white/10 text-sm font-mono"
              />
            </div>
          )}

          {!file && !resumeText && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Or paste your resume text:</p>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="min-h-[150px] bg-white/5 border-white/10"
              />
            </div>
          )}
        </GlassCard>

        {/* Job Description */}
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Job Description
          </h2>

          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here...&#10;&#10;Include the job title, required skills, responsibilities, and qualifications for the most accurate analysis."
            className="min-h-[350px] bg-white/5 border-white/10"
          />

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              {jobDescription.length} characters
            </Badge>
            {jobDescription.length >= 50 && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Analyze Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-lg px-12 py-6 glow-primary"
          disabled={!resumeText || jobDescription.length < 50 || analyzing}
          onClick={handleAnalyze}
        >
          {analyzing ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-5 h-5 mr-2" />
          )}
          Analyze Skills
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
