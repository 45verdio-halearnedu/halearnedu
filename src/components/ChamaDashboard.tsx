
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, PlusCircle, AlertCircle, CreditCard, Activity } from 'lucide-react';
import CurrencyDisplay from './CurrencyDisplay';
import PendingMembersCard from './PendingMembersCard';
import AdminAnalyticsDashboard from './AdminAnalyticsDashboard';
import TreasurerActions from './TreasurerActions';

interface ChamaDashboardProps {
  chamaData: any;
  isTreasurer: boolean;
  chamaId: string;
}

const ChamaDashboard: React.FC<ChamaDashboardProps> = ({ chamaData, isTreasurer, chamaId }) => {
  const isAdmin = chamaData.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Wallet Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={5000} // This would come from user wallet
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground">Individual wallet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">720</div>
            <p className="text-xs text-muted-foreground">Good standing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Legacy Points</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground">Redeemable points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Balance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={chamaData.total_savings || 0}
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground">Total group savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Status */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution Status</CardTitle>
          <CardDescription>Your contribution status for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Monthly Contribution</p>
                <p className="text-sm text-muted-foreground">Due: End of month</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="default">Paid</Badge>
              <CurrencyDisplay 
                amount={chamaData.contribution_amount}
                className="text-sm text-muted-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Analytics Dashboard */}
      {isAdmin && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Admin Analytics</h3>
            <Badge variant="default">Admin View</Badge>
          </div>
          <AdminAnalyticsDashboard chamaId={chamaId} />
        </div>
      )}

      {/* Admin-specific pending members section */}
      {isAdmin && (
        <PendingMembersCard chamaId={chamaId} />
      )}

      {/* Treasurer Actions */}
      {isTreasurer && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Treasurer Tools</h3>
            <Badge variant="secondary">Treasurer Access</Badge>
          </div>
          <TreasurerActions chamaId={chamaId} />
        </div>
      )}

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent transactions and group updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 border-l-4 border-green-500 bg-green-50">
              <PlusCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Contribution Made</p>
                <p className="text-sm text-muted-foreground">You contributed KES 5,000 • 2 days ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">New Member Joined</p>
                <p className="text-sm text-muted-foreground">John Doe joined the group • 1 week ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border-l-4 border-orange-500 bg-orange-50">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Credit Score Update</p>
                <p className="text-sm text-muted-foreground">Your credit score increased to 720 • 2 weeks ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChamaDashboard;
