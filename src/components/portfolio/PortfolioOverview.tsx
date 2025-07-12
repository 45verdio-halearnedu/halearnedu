
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Star, TrendingUp } from "lucide-react";
import { UserProfile } from '@/hooks/useUserProfile';

interface PortfolioOverviewProps {
  profile: UserProfile;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ profile }) => {
  const getMetricLabel = () => {
    switch (profile.profile_type) {
      case 'lender':
        return 'Total Lent';
      case 'investor':
        return 'Total Invested';
      case 'borrower':
        return 'Total Borrowed';
      default:
        return 'Total Amount';
    }
  };

  const getMetricValue = () => {
    if (profile.profile_type === 'borrower') {
      return profile.total_borrowed || 0;
    }
    return profile.total_funded || 0;
  };

  const getSuccessRateLabel = () => {
    switch (profile.profile_type) {
      case 'lender':
        return 'Successful loans';
      case 'investor':
        return 'Successful investments';
      case 'borrower':
        return 'On-time repayments';
      default:
        return 'Success rate';
    }
  };

  const getProfileTypeDisplay = () => {
    switch (profile.profile_type) {
      case 'investor':
        return 'Investor';
      case 'lender':
        return 'Lender';
      case 'borrower':
        return 'Borrower';
      default:
        return profile.profile_type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getMetricLabel()}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${getMetricValue()}
            </div>
            <p className="text-xs text-muted-foreground">
              All time {profile.profile_type === 'borrower' ? 'borrowing' : profile.profile_type === 'lender' ? 'lending' : 'investing'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.success_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {getSuccessRateLabel()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Your Capabilities</CardTitle>
          <CardDescription>
            What you can do as a {getProfileTypeDisplay().toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            {profile.profile_type === 'borrower' && (
              <>
                <div className="flex items-center text-green-600">
                  ✓ Apply for loans
                </div>
                <div className="flex items-center text-green-600">
                  ✓ Manage loan applications
                </div>
                <div className="flex items-center text-green-600">
                  ✓ Track repayment schedules
                </div>
              </>
            )}
            {(profile.profile_type === 'investor' || profile.profile_type === 'lender') && (
              <>
                <div className="flex items-center text-green-600">
                  ✓ View all loan applications
                </div>
                <div className="flex items-center text-green-600">
                  ✓ Make loan offers
                </div>
                <div className="flex items-center text-green-600">
                  ✓ Fund loans
                </div>
                <div className="flex items-center text-green-600">
                  ✓ Manage disputes
                </div>
                <div className="flex items-center text-green-600">
                  ✓ Post notifications
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioOverview;
