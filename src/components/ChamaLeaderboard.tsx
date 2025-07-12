
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Users } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CurrencyDisplay from './CurrencyDisplay';

interface LeaderboardMember {
  member_id: string;
  member_email: string;
  total_contributed: number;
  last_contribution_date: string | null;
  role: string;
  joined_at: string;
  rank: number;
  contribution_count: number;
}

interface ChamaLeaderboardProps {
  chamaId: string;
}

const ChamaLeaderboard: React.FC<ChamaLeaderboardProps> = ({ chamaId }) => {
  const { user } = useAuth();

  const { data: leaderboardData = [], isLoading } = useQuery({
    queryKey: ['chama-leaderboard', chamaId],
    queryFn: async () => {
      if (!user || !chamaId) return [];
      
      const { data, error } = await supabase.rpc('get_chama_leaderboard', {
        p_chama_id: chamaId
      });
      
      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }
      
      return data as LeaderboardMember[];
    },
    enabled: !!user && !!chamaId
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <div className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</div>;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'treasurer':
        return 'bg-blue-100 text-blue-800';
      case 'secretary':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member Leaderboard
          </CardTitle>
          <CardDescription>Member rankings based on contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Member Leaderboard
        </CardTitle>
        <CardDescription>Member rankings based on total contributions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboardData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No members found</p>
            </div>
          ) : (
            leaderboardData.map((member) => (
              <div
                key={member.member_id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  member.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {getRankIcon(member.rank)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">
                        {member.member_email.split('@')[0]}
                      </p>
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{member.contribution_count} contributions</span>
                      <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                      {member.last_contribution_date && (
                        <span>Last: {new Date(member.last_contribution_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <CurrencyDisplay 
                    amount={member.total_contributed || 0}
                    className="text-lg font-bold text-green-600"
                  />
                  <p className="text-xs text-gray-500">Total Contributed</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChamaLeaderboard;
