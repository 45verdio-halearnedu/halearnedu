
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, History, TrendingUp, Users, CheckCircle, FileBarChart } from 'lucide-react';
import { useChamaContributions } from '@/hooks/useChamaContributions';
import { useChamaMembers } from '@/hooks/useChamaMembers';
import EnhancedMakeContributionDialog from './EnhancedMakeContributionDialog';
import ChamaContributionSummary from './ChamaContributionSummary';
import ContributionApprovalsCard from './ContributionApprovalsCard';
import ContributionReportCard from './ContributionReportCard';

interface ChamaContributionsProps {
  chamaId: string;
}

const ChamaContributions: React.FC<ChamaContributionsProps> = ({ chamaId }) => {
  const { canManageChama } = useChamaMembers(chamaId);
  const {
    contributions,
    contributionSummary,
    loading,
    error,
    refetch
  } = useChamaContributions(chamaId);

  const handleContributionMade = () => {
    refetch();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contributions</h2>
          <p className="text-muted-foreground">
            Manage and track chama contributions with approval workflow
          </p>
        </div>
        <EnhancedMakeContributionDialog 
          chamaId={chamaId} 
          onContributionMade={handleContributionMade}
        />
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          {canManageChama && (
            <>
              <TabsTrigger value="approvals" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approvals
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileBarChart className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="summary">
          <ChamaContributionSummary
            contributionSummary={contributionSummary}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Contribution History
              </CardTitle>
              <CardDescription>
                Recent contributions to this chama with approval status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8">Loading contributions...</p>
              ) : contributions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No contributions recorded yet
                </p>
              ) : (
                <div className="space-y-4">
                  {contributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">
                            KES {contribution.amount.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={
                                contribution.status === 'completed' ? 'default' :
                                contribution.status === 'pending' ? 'secondary' :
                                'destructive'
                              }
                            >
                              {contribution.status}
                            </Badge>
                            <Badge variant="outline">
                              {contribution.payment_method?.replace('_', ' ')}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {new Date(contribution.contribution_date).toLocaleDateString()}
                            </p>
                          </div>
                          {contribution.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {contribution.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {contribution.payment_reference && (
                          <p className="text-xs text-muted-foreground">
                            Ref: {contribution.payment_reference}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(contribution.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManageChama && (
          <>
            <TabsContent value="approvals">
              <ContributionApprovalsCard chamaId={chamaId} />
            </TabsContent>

            <TabsContent value="reports">
              <ContributionReportCard chamaId={chamaId} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ChamaContributions;
