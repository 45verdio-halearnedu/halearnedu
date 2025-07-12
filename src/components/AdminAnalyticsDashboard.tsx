
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, DollarSign, CreditCard, AlertTriangle, Activity } from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import CurrencyDisplay from './CurrencyDisplay';

interface AdminAnalyticsDashboardProps {
  chamaId: string;
}

const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({ chamaId }) => {
  const { analytics, pendingContributions, loading, error } = useAdminAnalytics(chamaId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_members}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{analytics.active_members} active</span>
              {analytics.pending_members > 0 && (
                <Badge variant="outline" className="text-xs">
                  {analytics.pending_members} pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={analytics.total_contributions}
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground">All time total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Contributions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={analytics.monthly_contributions}
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contribution Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.contribution_rate.toFixed(1)}%</div>
            <Progress value={analytics.contribution_rate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Loan Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Loan Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Loans</span>
              <CurrencyDisplay amount={analytics.total_loans} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Loans</span>
              <Badge variant="default">{analytics.active_loans}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Contribution</span>
              <CurrencyDisplay amount={analytics.average_contribution} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Contributions
            </CardTitle>
            <CardDescription>
              {pendingContributions.length} members with overdue contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingContributions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>All members are up to date!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {pendingContributions.slice(0, 5).map((contribution) => (
                  <div key={contribution.member_id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{contribution.member_email.split('@')[0]}</p>
                      <p className="text-muted-foreground">
                        {contribution.days_overdue} days overdue
                      </p>
                    </div>
                    <CurrencyDisplay 
                      amount={contribution.expected_amount}
                      className="text-sm"
                    />
                  </div>
                ))}
                {pendingContributions.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{pendingContributions.length - 5} more members
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
