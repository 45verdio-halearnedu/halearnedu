
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, TrendingUp, Calendar, Settings, UserPlus } from 'lucide-react';
import ChamaCard from './ChamaCard';
import CreateChamaDialog from './CreateChamaDialog';
import JoinChamaDialog from './JoinChamaDialog';

interface Chama {
  id: string;
  name: string;
  description: string;
  contribution_amount: number;
  contribution_frequency: string;
  max_members: number;
  current_members: number;
  total_savings: number;
  status: string;
  created_at: string;
  created_by: string;
}

interface ChamaMembership {
  id: string;
  role: string;
  total_contributed: number;
  joined_at: string;
  chamas: Chama;
}

const ChamaManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('my-chamas');

  const { data: myChamas = [], isLoading: myLoading } = useQuery({
    queryKey: ['my-chamas', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('chama_members')
        .select(`
          id,
          role,
          total_contributed,
          joined_at,
          chamas (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as ChamaMembership[];
    },
    enabled: !!user
  });

  const { data: availableChamas = [], isLoading: availableLoading } = useQuery({
    queryKey: ['available-chamas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chamas')
        .select('*')
        .eq('status', 'active')
        .filter('current_members', 'lt', 'max_members')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter out chamas the user is already a member of
      const myChamaIds = myChamas.map(membership => membership.chamas.id);
      return (data as Chama[]).filter(chama => !myChamaIds.includes(chama.id));
    },
    enabled: !!user && myChamas.length >= 0
  });

  const joinChamaMutation = useMutation({
    mutationFn: async ({ chamaId, message }: { chamaId: string; message: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('chama_members')
        .insert({
          chama_id: chamaId,
          user_id: user.id,
          role: 'member',
          is_active: false // Requires approval
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-chamas'] });
      queryClient.invalidateQueries({ queryKey: ['available-chamas'] });
      toast({
        title: "Join Request Sent",
        description: "Your request to join the Chama has been sent for approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join Chama",
        variant: "destructive",
      });
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalSavings = myChamas.reduce((sum, membership) => sum + membership.total_contributed, 0);
  const totalChamas = myChamas.length;

  if (!user) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="text-gray-600">Please sign in to manage your Chamas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chama Management</h1>
          <p className="text-gray-600">Manage your savings groups and contributions</p>
        </div>
        <CreateChamaDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Chamas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChamas}</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSavings)}</div>
            <p className="text-xs text-muted-foreground">Across all Chamas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Chamas</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableChamas.length}</div>
            <p className="text-xs text-muted-foreground">You can join</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-chamas">My Chamas</TabsTrigger>
          <TabsTrigger value="available">Available Chamas</TabsTrigger>
        </TabsList>

        <TabsContent value="my-chamas" className="space-y-6">
          {myLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myChamas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myChamas.map((membership) => (
                <ChamaCard
                  key={membership.id}
                  chama={membership.chamas}
                  userRole={membership.role}
                  userContributions={membership.total_contributed}
                  showManageButton={membership.role === 'admin' || membership.role === 'treasurer'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Users className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium text-lg mb-2">No Chamas Yet</h3>
              <p className="text-gray-500 mb-4">You haven't joined any Chamas yet.</p>
              <div className="flex gap-2 justify-center">
                <CreateChamaDialog>
                  <Button>Create Chama</Button>
                </CreateChamaDialog>
                <Button variant="outline" onClick={() => setActiveTab('available')}>
                  Browse Available
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          {availableLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableChamas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableChamas.map((chama) => (
                <div key={chama.id}>
                  <ChamaCard
                    chama={chama}
                    onJoin={(chamaId) => joinChamaMutation.mutate({ chamaId, message: '' })}
                    isJoining={joinChamaMutation.isPending}
                  />
                  <div className="mt-2">
                    <JoinChamaDialog
                      chamaId={chama.id}
                      chamaName={chama.name}
                      onJoin={(chamaId, message) => joinChamaMutation.mutate({ chamaId, message })}
                      isJoining={joinChamaMutation.isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Users className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium text-lg mb-2">No Available Chamas</h3>
              <p className="text-gray-500 mb-4">All Chamas are currently full or you're already a member.</p>
              <CreateChamaDialog>
                <Button>Create New Chama</Button>
              </CreateChamaDialog>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChamaManagement;
