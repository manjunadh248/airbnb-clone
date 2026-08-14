'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/shared/GlassCard';
import {
  Send,
  Brain,
  User,
  Loader2,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

// Helper: extract plain text from a UIMessage (parts-based)
function getMessageText(msg: { parts?: Array<{ type: string; text?: string }>; content?: string }): string {
  // Fallback for content string
  if (typeof msg.content === 'string' && msg.content) return msg.content;
  // Parts-based content (AI SDK v6)
  if (msg.parts) {
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && typeof p.text === 'string')
      .map(p => p.text)
      .join('');
  }
  return '';
}

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentId = searchParams.get('id');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [localMessages, setLocalMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; text: string }>
  >([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // We'll use a simpler fetch-based approach for compatibility with AI SDK v6
  // since the transport API may vary. This gives us full control.

  // Initialize with greeting
  useEffect(() => {
    if (localMessages.length === 0 && assessmentId) {
      setLocalMessages([
        {
          id: 'greeting',
          role: 'assistant',
          text: "Hello! I'm your SkillLens AI interviewer. I've reviewed your resume and the job description, and I'll be assessing your skills through a series of conversational questions. Let's begin!\n\nReady? Just type \"Let's go!\" or ask me anything to start.",
        },
      ]);
    }
  }, [assessmentId, localMessages.length]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, isStreaming]);

  // Check for interview end
  useEffect(() => {
    const last = localMessages[localMessages.length - 1];
    if (last?.role === 'assistant') {
      const text = last.text.toLowerCase();
      if (
        text.includes('would you like to see your results') ||
        text.includes('that covers the main areas')
      ) {
        setIsFinished(true);
      }
    }
  }, [localMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;

    const userMsg = inputValue.trim();
    setInputValue('');

    // Add user message
    const newMessages = [
      ...localMessages,
      { id: `user-${Date.now()}`, role: 'user' as const, text: userMsg },
    ];
    setLocalMessages(newMessages);
    setIsStreaming(true);

    try {
      // Build message history for API
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, assessmentId }),
      });

      if (!res.ok) throw new Error('Interview request failed');

      // Read streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      const assistantId = `assistant-${Date.now()}`;

      // Add placeholder for assistant message
      setLocalMessages(prev => [...prev, { id: assistantId, role: 'assistant', text: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;

          // Update the assistant message in place
          setLocalMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, text: assistantText } : m
            )
          );
        }
      }
    } catch (error) {
      console.error('Interview error:', error);
      setLocalMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: "I'm sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFinishInterview = async () => {
    try {
      await fetch('/api/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId }),
      });
      router.push(`/results/${assessmentId}`);
    } catch (error) {
      console.error('Failed to finish interview:', error);
    }
  };

  if (!assessmentId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <GlassCard className="text-center max-w-md mx-auto py-12">
          <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Assessment Selected</h2>
          <p className="text-muted-foreground mb-6">
            Please complete an analysis first to start the AI interview.
          </p>
          <Button onClick={() => router.push('/analyze')} className="bg-primary hover:bg-primary/90">
            Go to Analysis
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Interview
          </h1>
          <p className="text-sm text-muted-foreground">
            Answer questions to assess your skill levels
          </p>
        </div>
        {(isFinished || localMessages.length > 6) && (
          <Button onClick={handleFinishInterview} className="bg-primary hover:bg-primary/90">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Finish & Get Scores
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4"
      >
        <AnimatePresence initial={false}>
          {localMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-1">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] px-4 py-3 ${
                  message.role === 'user'
                    ? 'chat-bubble-user'
                    : 'chat-bubble-ai'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isStreaming && localMessages[localMessages.length - 1]?.text === '' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="chat-bubble-ai px-4 py-3 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary/50 typing-dot" />
              <div className="w-2 h-2 rounded-full bg-primary/50 typing-dot" />
              <div className="w-2 h-2 rounded-full bg-primary/50 typing-dot" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-white/5">
        {isFinished ? (
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Interview Complete!</p>
                <p className="text-sm text-muted-foreground">Ready to generate your scores</p>
              </div>
            </div>
            <Button onClick={handleFinishInterview} className="bg-primary hover:bg-primary/90">
              View Results
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 bg-white/5 border-white/10 focus:border-primary py-6"
              disabled={isStreaming}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-primary hover:bg-primary/90 h-12 w-12"
              disabled={isStreaming || !inputValue.trim()}
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        )}

        <div className="flex items-center gap-3 mt-3">
          <Badge variant="outline" className="text-xs">
            {localMessages.filter(m => m.role === 'user').length} answers
          </Badge>
          <p className="text-xs text-muted-foreground">
            Tip: Give detailed, practical answers for better scores
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
