
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, BookOpen, CheckCircle, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LearningContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  category: string;
  difficulty_level: string;
  estimated_duration: number;
  content_body: string;
}

interface UserProgress {
  id: string;
  content_id: string;
  status: string;
  score: number;
  time_spent: number;
  completed_at: string;
}

interface LearningContentViewerProps {
  content: LearningContent;
  progress: UserProgress | undefined;
  onBack: () => void;
  onProgressUpdate: () => void;
}

const LearningContentViewer: React.FC<LearningContentViewerProps> = ({
  content,
  progress,
  onBack,
  onProgressUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [startTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(progress?.status === 'completed');
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const markAsCompleted = async () => {
    if (!user || !progress) return;

    try {
      const { error } = await supabase
        .from('user_learning_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          time_spent: (progress.time_spent || 0) + timeSpent,
          score: 100
        })
        .eq('id', progress.id);

      if (error) throw error;

      setIsCompleted(true);
      onProgressUpdate();
      
      toast({
        title: "Congratulations! 🎉",
        description: "You've completed this learning module!",
      });
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const updateProgress = async () => {
    if (!user || !progress) return;

    try {
      await supabase
        .from('user_learning_progress')
        .update({
          time_spent: (progress.time_spent || 0) + timeSpent,
          status: progress.status === 'not_started' ? 'in_progress' : progress.status
        })
        .eq('id', progress.id);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (timeSpent > 0 && timeSpent % 30 === 0) { // Update every 30 seconds
        updateProgress();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      updateProgress(); // Final update when component unmounts
    };
  }, [timeSpent]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Education Center
        </Button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {content.title}
            </h1>
            <p className="text-gray-600 mb-4">
              {content.description}
            </p>
            <div className="flex items-center gap-4">
              <Badge className={getDifficultyColor(content.difficulty_level)}>
                {content.difficulty_level}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{content.estimated_duration} min read</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <BookOpen className="h-4 w-4" />
                <span className="capitalize">{content.content_type}</span>
              </div>
            </div>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Completed</span>
            </div>
          )}
        </div>

        {user && progress && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Progress</span>
                <span className="text-sm text-gray-500">
                  Time: {formatTime(timeSpent)} / {content.estimated_duration}:00
                </span>
              </div>
              <Progress 
                value={isCompleted ? 100 : Math.min((timeSpent / (content.estimated_duration * 60)) * 100, 95)} 
                className="h-2"
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="p-8">
          {content.content_type === 'video' ? (
            <div className="text-center py-12">
              <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Video Content
              </h3>
              <p className="text-gray-500 mb-6">
                Video learning content would be displayed here
              </p>
              <div className="prose max-w-none">
                <ReactMarkdown>{content.content_body}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-6 text-gray-900" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-800" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-800" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-4 text-gray-700 leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="mb-4 ml-6 space-y-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="mb-4 ml-6 space-y-2" {...props} />,
                  li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                  code: ({ node, ...props }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm" {...props} />,
                }}
              >
                {content.content_body}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {user && progress && !isCompleted && (
        <div className="text-center">
          <Button 
            onClick={markAsCompleted}
            size="lg"
            className="px-8"
            disabled={timeSpent < 60} // Require at least 1 minute of reading
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Mark as Completed
          </Button>
          {timeSpent < 60 && (
            <p className="text-sm text-gray-500 mt-2">
              Spend at least 1 minute reading to mark as completed
            </p>
          )}
        </div>
      )}

      {!user && (
        <Card className="text-center">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Track Your Progress</h3>
            <p className="text-gray-600 mb-4">
              Sign in to track your learning progress and earn completion badges
            </p>
            <Button>Sign In to Track Progress</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningContentViewer;
