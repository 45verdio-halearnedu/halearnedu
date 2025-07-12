
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, TrendingUp, Target } from 'lucide-react';

interface ProgressTrackerProps {
  totalContent: number;
  completedCount: number;
  inProgressCount: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  totalContent,
  completedCount,
  inProgressCount
}) => {
  const completionPercentage = totalContent > 0 ? (completedCount / totalContent) * 100 : 0;
  const notStartedCount = totalContent - completedCount - inProgressCount;

  const getProgressLevel = () => {
    if (completionPercentage >= 90) return { level: 'Expert', color: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' };
    if (completionPercentage >= 70) return { level: 'Advanced', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' };
    if (completionPercentage >= 40) return { level: 'Intermediate', color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800' };
    if (completionPercentage >= 10) return { level: 'Beginner', color: 'text-green-600', badge: 'bg-green-100 text-green-800' };
    return { level: 'Getting Started', color: 'text-gray-600', badge: 'bg-gray-100 text-gray-800' };
  };

  const progressLevel = getProgressLevel();

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Your Learning Progress
          </CardTitle>
          <Badge className={progressLevel.badge}>
            {progressLevel.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {completedCount}/{totalContent} completed ({Math.round(completionPercentage)}%)
              </span>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-3 bg-white/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-blue-600">{inProgressCount}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-gray-500" />
              </div>
              <div className="text-lg font-bold text-gray-500">{notStartedCount}</div>
              <div className="text-xs text-gray-600">Not Started</div>
            </div>
          </div>

          {completionPercentage > 0 && (
            <div className="bg-white/60 rounded-lg p-3 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Next Steps</span>
              </div>
              <p className="text-sm text-gray-600">
                {completionPercentage < 25 
                  ? "Great start! Continue with the Blockchain Basics to build your foundation."
                  : completionPercentage < 50
                  ? "You're making excellent progress! Try exploring the Staking section next."
                  : completionPercentage < 75
                  ? "Well done! You're becoming an expert. Check out the Advanced Borrowing strategies."
                  : completionPercentage < 100
                  ? "Almost there! Complete the remaining modules to become a LendChain expert."
                  : "Congratulations! You've mastered all available content. Check back for new modules!"
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
