
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Target, Calendar, TrendingUp, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ChamaCardProps {
  chama: {
    id: string;
    name: string;
    description: string;
    contribution_amount: number;
    contribution_frequency: string;
    current_members: number;
    max_members: number;
    total_savings: number;
    status: string;
    created_at: string;
  };
  userRole?: string;
  userContributions?: number;
  onJoin?: (chamaId: string) => void;
  isJoining?: boolean;
  showManageButton?: boolean;
}

const ChamaCard: React.FC<ChamaCardProps> = ({ 
  chama, 
  userRole, 
  userContributions = 0,
  onJoin,
  isJoining = false,
  showManageButton = false
}) => {
  const navigate = useNavigate();
  const progressPercentage = (chama.current_members / chama.max_members) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleManage = () => {
    navigate(`/chama/${chama.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{chama.name}</CardTitle>
            <CardDescription className="mt-1">{chama.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={chama.status === 'active' ? 'default' : 'secondary'}>
              {chama.status}
            </Badge>
            {userRole && (
              <Badge variant="outline" className="capitalize">
                {userRole}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{chama.current_members}/{chama.max_members}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{formatCurrency(chama.contribution_amount)}</p>
              <p className="text-xs text-muted-foreground">Per {chama.contribution_frequency}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Member Progress</span>
            <span className="text-sm text-muted-foreground">{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{formatCurrency(chama.total_savings)}</p>
              <p className="text-xs text-muted-foreground">Total Savings</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                Created {format(new Date(chama.created_at), 'MMM yyyy')}
              </p>
            </div>
          </div>
        </div>

        {userRole && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Your Contributions</p>
            <p className="text-lg font-bold text-blue-900">{formatCurrency(userContributions)}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!userRole && onJoin && (
            <Button 
              onClick={() => onJoin(chama.id)} 
              disabled={isJoining || chama.current_members >= chama.max_members}
              className="flex-1"
            >
              {isJoining ? 'Joining...' : 'Join Chama'}
            </Button>
          )}
          
          {showManageButton && (
            <Button variant="outline" onClick={handleManage} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Manage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChamaCard;
