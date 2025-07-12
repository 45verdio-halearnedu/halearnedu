
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Gift, Star, Plus, TrendingUp, Clock, Award } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import CreateSavingGroupDialog from './CreateSavingGroupDialog';
import JoinSavingGroupDialog from './JoinSavingGroupDialog';
import ReferralManagement from './ReferralManagement';
import SimpleChamaManagement from './SimpleChamaManagement';

interface SavingGroup {
  id: string;
  name: string;
  description: string;
  group_type: string;
  target_amount: number;
  contribution_frequency: string;
  min_contribution: number;
  max_members: number;
  current_members: number;
  total_saved: number;
  created_at: string;
}

interface GroupMembership {
  id: string;
  role: string;
  total_contributed: number;
  joined_at: string;
  saving_groups: SavingGroup;
}

const CommunityHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const { data: savingGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['saving-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saving_groups')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavingGroup[];
    },
    enabled: !!user
  });

  const { data: myGroups = [], isLoading: myGroupsLoading } = useQuery({
    queryKey: ['my-saving-groups', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('saving_group_members')
        .select(`
          *,
          saving_groups (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as GroupMembership[];
    },
    enabled: !!user
  });

  const { data: referralStats } = useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id);
      
      if (error) throw error;
      
      const totalReferrals = data.length;
      const completedReferrals = data.filter(r => r.status === 'completed').length;
      const totalEarned = data.reduce((sum, r) => sum + (r.bonus_earned || 0), 0);
      
      return {
        totalReferrals,
        completedReferrals,
        totalEarned
      };
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
          <p className="text-gray-600">Please sign in to access community features.</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Community Hub</h1>
        <p className="text-gray-600">Connect, save together, and grow your financial network</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myGroups.length}</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(myGroups.reduce((sum, g) => sum + (g.total_contributed || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Earnings</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(referralStats?.totalEarned || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {referralStats?.completedReferrals || 0} successful referrals
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chamas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chamas">Chamas</TabsTrigger>
          <TabsTrigger value="groups">Saving Groups</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="chamas" className="space-y-6">
          <SimpleChamaManagement />
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Available Saving Groups</h2>
            <CreateSavingGroupDialog />
          </div>

          {groupsLoading ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savingGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {group.group_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Badge variant="secondary">
                        {group.current_members}/{group.max_members}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Target Amount:</span>
                        <span className="font-medium">{formatCurrency(group.target_amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Min. Contribution:</span>
                        <span className="font-medium">{formatCurrency(group.min_contribution)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Frequency:</span>
                        <span className="font-medium capitalize">{group.contribution_frequency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Saved:</span>
                        <span className="font-medium">{formatCurrency(group.total_saved)}</span>
                      </div>
                    </div>

                    <JoinSavingGroupDialog groupId={group.id} groupName={group.name} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-groups" className="space-y-6">
          <h2 className="text-xl font-semibold">My Saving Groups</h2>
          
          {myGroupsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {myGroups.map((membership) => {
                const group = membership.saving_groups;
                return (
                  <Card key={membership.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{group.group_type.replace('_', ' ')}</Badge>
                            <Badge variant={membership.role === 'admin' ? 'default' : 'secondary'}>
                              {membership.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">My Contributions</p>
                          <p className="text-lg font-bold">{formatCurrency(membership.total_contributed)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Members</p>
                          <p className="font-medium">{group.current_members}/{group.max_members}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Saved</p>
                          <p className="font-medium">{formatCurrency(group.total_saved)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Target</p>
                          <p className="font-medium">{formatCurrency(group.target_amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Joined</p>
                          <p className="font-medium">{formatDate(membership.joined_at)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {myGroups.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>You haven't joined any saving groups yet</p>
                  <p className="text-sm">Check out available groups to get started!</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <ReferralManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHub;
