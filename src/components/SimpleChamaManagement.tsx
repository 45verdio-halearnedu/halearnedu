import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, TrendingUp, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import CreateChamaDialog from './CreateChamaDialog';
import JoinChamaDialog from './JoinChamaDialog';
import CurrencyDisplay from './CurrencyDisplay';

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
}

interface MyChamaData extends Chama {
  role: string;
  total_contributed: number;
  joined_at: string;
}

const SimpleChamaManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [joiningChamaId, setJoiningChamaId] = useState<string | null>(null);

  const { data: myChamas = [], isLoading: myLoading } = useQuery({
    queryKey: ['my-chamas', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('chama_members')
        .select(`
          role,
          total_contributed,
          joined_at,
          chamas (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      
      return data?.map(item => ({
        ...item.chamas,
        role: item.role,
        total_contributed: item.total_contributed,
        joined_at: item.joined_at
      })) as MyChamaData[];
    },
    enabled: !!user
  });

  const { data: availableChamas = [], isLoading: availableLoading } = useQuery({
    queryKey: ['available-chamas', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get chamas user is not a member of
      const { data: memberChamas } = await supabase
        .from('chama_members')
        .select('chama_id')
        .eq('user_id', user.id);
      
      const excludeIds = memberChamas?.map(m => m.chama_id) || [];
      
      let query = supabase
        .from('chamas')
        .select('*')
        .eq('status', 'active')
        .filter('current_members', 'lt', 'max_members');
      
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data as Chama[];
    },
    enabled: !!user
  });

  const handleJoinChama = async (chamaId: string, message: string) => {
    if (!user) return;
    
    setJoiningChamaId(chamaId);
    
    try {
      const { error } = await supabase
        .from('chama_members')
        .insert({
          chama_id: chamaId,
          user_id: user.id,
          role: 'member',
          is_active: false // Pending approval
        });
      
      if (error) throw error;
      
      toast({
        title: "Join Request Sent",
        description: "Your request to join the chama has been sent for approval.",
      });
      
      // Refresh data
      window.location.reload();
    } catch (error: any) {
      console.error('Error joining chama:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send join request",
        variant: "destructive",
      });
    } finally {
      setJoiningChamaId(null);
    }
  };

  const handleViewDetails = (chamaId: string) => {
    console.log('Navigating to chama details:', chamaId);
    navigate(`/chama/${chamaId}`);
    toast({
      title: "Opening Chama Details",
      description: "Loading your chama dashboard...",
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
          <p className="text-gray-600">Please sign in to access chama features.</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chama Management</h2>
          <p className="text-gray-600">Create and manage your savings groups</p>
        </div>
        <CreateChamaDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Chamas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myChamas.length}</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={myChamas.reduce((sum, chama) => sum + (chama.total_contributed || 0), 0)}
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground">Across all chamas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Chamas</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableChamas.length}</div>
            <p className="text-xs text-muted-foreground">Ready to join</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-chamas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-chamas">My Chamas</TabsTrigger>
          <TabsTrigger value="available">Available Chamas</TabsTrigger>
        </TabsList>

        <TabsContent value="my-chamas" className="space-y-4">
          {myLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : myChamas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">You haven't joined any chamas yet</p>
                <p className="text-sm text-gray-500 mt-1">Create one or join an existing chama below!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myChamas.map((chama) => (
                <Card key={chama.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {chama.name}
                          <Badge variant={chama.role === 'admin' ? 'default' : 'secondary'}>
                            {chama.role}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{chama.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">My Contribution</p>
                        <CurrencyDisplay 
                          amount={chama.total_contributed || 0}
                          className="text-lg font-bold"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Members</p>
                        <p className="font-medium">{chama.current_members}/{chama.max_members}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Contribution</p>
                        <CurrencyDisplay 
                          amount={chama.contribution_amount}
                          className="font-medium"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500">Total Savings</p>
                        <CurrencyDisplay 
                          amount={chama.total_savings || 0}
                          className="font-medium"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500">Joined</p>
                        <p className="font-medium">{formatDate(chama.joined_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleViewDetails(chama.id)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {availableLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : availableChamas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">No chamas available to join right now</p>
                <p className="text-sm text-gray-500 mt-1">Create a new chama to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availableChamas.map((chama) => (
                <Card key={chama.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{chama.name}</CardTitle>
                        <CardDescription>{chama.description}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        {chama.current_members}/{chama.max_members} members
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Contribution</p>
                          <CurrencyDisplay 
                            amount={chama.contribution_amount}
                            className="font-medium"
                          />
                        </div>
                        <div>
                          <p className="text-gray-500">Frequency</p>
                          <p className="font-medium capitalize">{chama.contribution_frequency}</p>
                        </div>
                      </div>
                      <JoinChamaDialog
                        chamaId={chama.id}
                        chamaName={chama.name}
                        onJoin={handleJoinChama}
                        isJoining={joiningChamaId === chama.id}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleChamaManagement;
