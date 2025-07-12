
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, Award, PlayCircle, FileText, TrendingUp, DollarSign, Shield } from 'lucide-react';
import LearningContentViewer from './education/LearningContentViewer';
import ProgressTracker from './education/ProgressTracker';

interface LearningContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  category: string;
  difficulty_level: string;
  estimated_duration: number;
  content_body: string;
  is_published: boolean;
}

interface UserProgress {
  id: string;
  content_id: string;
  status: string;
  score: number;
  time_spent: number;
  completed_at: string;
}

const Education: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchLearningContent();
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchLearningContent = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLearningContent(data || []);
    } catch (error) {
      console.error('Error fetching learning content:', error);
      toast({
        title: "Error",
        description: "Failed to load learning content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const startLearning = async (content: LearningContent) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your learning progress",
        variant: "destructive",
      });
      return;
    }

    setSelectedContent(content);

    // Check if progress exists, if not create it
    const existingProgress = userProgress.find(p => p.content_id === content.id);
    if (!existingProgress) {
      try {
        const { error } = await supabase
          .from('user_learning_progress')
          .insert({
            user_id: user.id,
            content_id: content.id,
            status: 'in_progress'
          });

        if (error) throw error;
        await fetchUserProgress();
      } catch (error) {
        console.error('Error creating progress record:', error);
      }
    }
  };

  const getContentProgress = (contentId: string) => {
    const progress = userProgress.find(p => p.content_id === contentId);
    return progress;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'blockchain_basics': return <BookOpen className="h-4 w-4" />;
      case 'staking': return <TrendingUp className="h-4 w-4" />;
      case 'borrowing': return <DollarSign className="h-4 w-4" />;
      case 'app_functionality': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="h-5 w-5" />;
      case 'article': return <FileText className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const categories = [
    { id: 'all', label: 'All Content', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'blockchain_basics', label: 'Blockchain Basics', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'staking', label: 'Staking', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'borrowing', label: 'Borrowing', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'app_functionality', label: 'App Guide', icon: <Shield className="h-4 w-4" /> },
  ];

  const filteredContent = activeCategory === 'all' 
    ? learningContent 
    : learningContent.filter(content => content.category === activeCategory);

  const completedCount = userProgress.filter(p => p.status === 'completed').length;
  const inProgressCount = userProgress.filter(p => p.status === 'in_progress').length;

  if (selectedContent) {
    return (
      <LearningContentViewer
        content={selectedContent}
        progress={getContentProgress(selectedContent.id)}
        onBack={() => setSelectedContent(null)}
        onProgressUpdate={fetchUserProgress}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Education Center</h1>
          <p className="text-gray-600 mt-2">
            Master blockchain finance, staking, borrowing, and platform features
          </p>
        </div>
        {user && (
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award className="h-4 w-4" />
              <span>{completedCount} completed • {inProgressCount} in progress</span>
            </div>
          </div>
        )}
      </div>

      {user && (
        <ProgressTracker 
          totalContent={learningContent.length}
          completedCount={completedCount}
          inProgressCount={inProgressCount}
        />
      )}

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="flex items-center gap-2"
            >
              {category.icon}
              <span className="hidden sm:inline">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((content) => {
                const progress = getContentProgress(content.id);
                const isCompleted = progress?.status === 'completed';
                const isInProgress = progress?.status === 'in_progress';

                return (
                  <Card 
                    key={content.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg border-l-4 ${
                      isCompleted ? 'border-l-green-500' : 
                      isInProgress ? 'border-l-blue-500' : 
                      'border-l-gray-200'
                    }`}
                    onClick={() => startLearning(content)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(content.content_type)}
                          <Badge className={getDifficultyColor(content.difficulty_level)}>
                            {content.difficulty_level}
                          </Badge>
                        </div>
                        {isCompleted && (
                          <Award className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {content.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {content.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{content.estimated_duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(content.category)}
                          <span className="capitalize">
                            {content.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {progress && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>
                              {progress.status === 'completed' ? '100%' : 
                               progress.status === 'in_progress' ? '50%' : '0%'}
                            </span>
                          </div>
                          <Progress 
                            value={
                              progress.status === 'completed' ? 100 : 
                              progress.status === 'in_progress' ? 50 : 0
                            } 
                            className="h-2"
                          />
                        </div>
                      )}

                      <Button 
                        className="w-full" 
                        variant={isCompleted ? "outline" : "default"}
                      >
                        {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start Learning'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && filteredContent.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-xl text-gray-600 mb-2">
                  No content available
                </CardTitle>
                <CardDescription>
                  Content for this category is coming soon!
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Education;
