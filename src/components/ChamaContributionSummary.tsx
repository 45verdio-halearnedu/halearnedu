
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Calendar, PiggyBank } from 'lucide-react';
import CurrencyDisplay from './CurrencyDisplay';

interface ContributionSummary {
  member_id: string;
  member_email: string;
  total_contributed: number;
  last_contribution_date: string | null;
  contribution_count: number;
}

interface ChamaContributionSummaryProps {
  contributionSummary: ContributionSummary[];
  loading: boolean;
}

const ChamaContributionSummary: React.FC<ChamaContributionSummaryProps> = ({ 
  contributionSummary, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalContributions = contributionSummary.reduce((sum, member) => sum + (member.total_contributed || 0), 0);
  const totalMembers = contributionSummary.length;
  const averageContribution = totalMembers > 0 ? totalContributions / totalMembers : 0;
  const topContributor = contributionSummary.reduce((top, member) => 
    (member.total_contributed || 0) > (top.total_contributed || 0) ? member : top, 
    contributionSummary[0] || null
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={totalContributions}
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground">Group total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Member</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={averageContribution}
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground">Per member</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Contributing members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Contributor</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {topContributor ? topContributor.member_email.split('@')[0] : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topContributor ? (
                <CurrencyDisplay amount={topContributor.total_contributed || 0} />
              ) : 'No contributions yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Member Contributions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member Contributions
          </CardTitle>
          <CardDescription>Individual contribution breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contributionSummary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No contribution data available</p>
              </div>
            ) : (
              contributionSummary
                .sort((a, b) => (b.total_contributed || 0) - (a.total_contributed || 0))
                .map((member, index) => {
                  const contributionPercentage = totalContributions > 0 
                    ? ((member.total_contributed || 0) / totalContributions) * 100 
                    : 0;
                  
                  return (
                    <div key={member.member_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{member.member_email.split('@')[0]}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{member.contribution_count} contributions</span>
                              {member.last_contribution_date && (
                                <>
                                  <span>•</span>
                                  <span>Last: {new Date(member.last_contribution_date).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <CurrencyDisplay 
                            amount={member.total_contributed || 0}
                            className="text-lg font-semibold"
                          />
                          <p className="text-xs text-muted-foreground">
                            {contributionPercentage.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={contributionPercentage} 
                        className="h-2" 
                      />
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChamaContributionSummary;
