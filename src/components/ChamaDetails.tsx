
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, TrendingUp, Settings, MessageSquare, History, PlusCircle, Home, Wallet, CreditCard, UserCircle } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import CurrencyDisplay from './CurrencyDisplay';
import ChamaActivities from './ChamaActivities';
import ChamaChat from './ChamaChat';
import ChamaMemberManagement from './ChamaMemberManagement';
import ChamaContributions from './ChamaContributions';
import ChamaDashboard from './ChamaDashboard';
import ChamaGroups from './ChamaGroups';
import ChamaWallet from './ChamaWallet';
import ChamaLoansAndSavings from './ChamaLoansAndSavings';
import ChamaProfile from './ChamaProfile';
import ChamaLeaderboard from './ChamaLeaderboard';
import RoleAssignmentDialog from './RoleAssignmentDialog';
import CredentialManagement from './CredentialManagement';

const ChamaDetails: React.FC = () => {
  const { chamaId } = useParams<{ chamaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: chamaData, isLoading } = useQuery({
    queryKey: ['chama-details', chamaId],
    queryFn: async () => {
      if (!user || !chamaId) return null;
      
      const { data, error } = await supabase
        .from('chama_members')
        .select(`
          id,
          role,
          total_contributed,
          joined_at,
          chamas (
            id, name, description, contribution_amount, contribution_frequency,
            max_members, current_members, total_savings, status, created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('chama_id', chamaId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      
      return {
        memberId: data.id,
        role: data.role,
        totalContributed: data.total_contributed,
        joinedAt: data.joined_at,
        ...data.chamas
      };
    },
    enabled: !!user && !!chamaId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!chamaData) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Chama Not Found</h3>
        <p className="text-gray-600 mb-4">You don't have access to this chama or it doesn't exist.</p>
        <Button onClick={() => navigate('/community')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isTreasurer = chamaData.role === 'treasurer' || chamaData.role === 'admin';
  const isAdmin = chamaData.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/community')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{chamaData.name}</h1>
              <Badge variant={chamaData.role === 'admin' ? 'default' : 'secondary'}>
                {chamaData.role}
              </Badge>
            </div>
            <p className="text-gray-600">{chamaData.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RoleAssignmentDialog chamaId={chamaId!} />
        </div>
      </div>

      {/* Enhanced Tab System */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="loans-savings" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Loans & Savings
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="legacy" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Legacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="space-y-6">
            <ChamaDashboard 
              chamaData={chamaData} 
              isTreasurer={isTreasurer}
              chamaId={chamaId!}
            />
            
            {/* Add Leaderboard to Dashboard */}
            <ChamaLeaderboard chamaId={chamaId!} />
            
            {/* Admin-only credential management */}
            {isAdmin && (
              <CredentialManagement 
                chamaId={chamaId!} 
                isAdmin={isAdmin}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <ChamaGroups 
            chamaData={chamaData} 
            isTreasurer={isTreasurer}
            chamaId={chamaId!}
          />
        </TabsContent>

        <TabsContent value="wallet">
          <ChamaWallet 
            chamaData={chamaData} 
            isTreasurer={isTreasurer}
            chamaId={chamaId!}
          />
        </TabsContent>

        <TabsContent value="loans-savings">
          <ChamaLoansAndSavings 
            chamaData={chamaData} 
            isTreasurer={isTreasurer}
            chamaId={chamaId!}
          />
        </TabsContent>

        <TabsContent value="profile">
          <ChamaProfile 
            chamaData={chamaData} 
            isTreasurer={isTreasurer}
            chamaId={chamaId!}
          />
        </TabsContent>

        {/* Legacy Tab - Keep existing functionality */}
        <TabsContent value="legacy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chamaData.current_members}/{chamaData.max_members}
                </div>
                <p className="text-xs text-muted-foreground">Active members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay 
                  amount={chamaData.total_savings || 0}
                  className="text-2xl font-bold"
                />
                <p className="text-xs text-muted-foreground">Group total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Contributions</CardTitle>
                <PlusCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay 
                  amount={chamaData.totalContributed || 0}
                  className="text-2xl font-bold"
                />
                <p className="text-xs text-muted-foreground">Your total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contribution</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay 
                  amount={chamaData.contribution_amount}
                  className="text-2xl font-bold"
                />
                <p className="text-xs text-muted-foreground capitalize">
                  Per {chamaData.contribution_frequency}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="contributions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contributions">Contributions</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="contributions">
              <ChamaContributions chamaId={chamaId!} />
            </TabsContent>

            <TabsContent value="members">
              <ChamaMemberManagement chamaId={chamaId!} />
            </TabsContent>

            <TabsContent value="activities">
              <ChamaActivities chamaId={chamaId!} />
            </TabsContent>

            <TabsContent value="chat">
              <ChamaChat chamaId={chamaId!} memberId={chamaData.memberId} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChamaDetails;
