
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Calendar, DollarSign, TrendingUp, Settings, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CurrencyDisplay from '@/components/CurrencyDisplay';
import ChamaActivities from "./ChamaActivities";
import ChamaChat from "./ChamaChat";
import ChamaMemberManagement from "./ChamaMemberManagement";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

const ChamasPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newChama, setNewChama] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    contributionFrequency: 'monthly',
    maxMembers: '20'
  });

  const [myChamasDB, setMyChamasDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [discoverableChamas, setDiscoverableChamas] = useState<any[]>([]);
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const [joiningChamaId, setJoiningChamaId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyChamas = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("chama_members")
          .select(`
            id, chama_id, role, is_active, total_contributed,
            chamas (
              id, name, description, contribution_amount, contribution_frequency, 
              max_members, current_members, total_savings, status, created_at
            )
          `)
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (error) {
          console.error("Error fetching chamas:", error);
          toast({
            title: "Error",
            description: "Failed to load your chamas",
            variant: "destructive",
          });
          return;
        }

        const chamasData = data
          ?.filter((m) => m.chamas && m.chama_id)
          .map((m) => ({
            memberId: m.id,
            chamaId: m.chama_id,
            role: m.role,
            myContribution: m.total_contributed,
            ...m.chamas,
          })) || [];

        setMyChamasDB(chamasData);
      } catch (error) {
        console.error("Unexpected error fetching chamas:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchDiscoverableChamas = async () => {
      if (!user) return;

      setLoadingDiscover(true);
      try {
        const { data: memberData, error: memberError } = await supabase
          .from('chama_members')
          .select('chama_id')
          .eq('user_id', user.id);

        if (memberError) {
          throw memberError;
        }
        
        const myChamaIds = memberData.map(m => m.chama_id);

        let query = supabase
          .from('chamas')
          .select('*')
          .eq('status', 'active');
        
        if (myChamaIds.length > 0) {
          query = query.not('id', 'in', `(${myChamaIds.join(',')})`);
        }
        
        const { data, error } = await query;

        if (error) throw error;
        
        setDiscoverableChamas(data || []);

      } catch (error) {
        console.error("Error fetching discoverable chamas:", error);
        toast({
            title: "Error",
            description: "Failed to load discoverable chamas.",
            variant: "destructive",
        });
      } finally {
        setLoadingDiscover(false);
      }
    };

    fetchMyChamas();
    fetchDiscoverableChamas();
  }, [user, toast]);

  const handleCreateChama = async () => {
    if (!newChama.name || !newChama.contributionAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a chama",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      // First create the chama
      const { data: chamaData, error: chamaError } = await supabase
        .from("chamas")
        .insert({
          name: newChama.name,
          description: newChama.description,
          contribution_amount: parseFloat(newChama.contributionAmount),
          contribution_frequency: newChama.contributionFrequency,
          max_members: parseInt(newChama.maxMembers),
          created_by: user.id,
          current_members: 1,
        })
        .select()
        .single();

      if (chamaError) {
        console.error("Error creating chama:", chamaError);
        toast({
          title: "Creation Failed",
          description: chamaError.message,
          variant: "destructive",
        });
        return;
      }

      // Then add the creator as an admin member
      const { error: memberError } = await supabase
        .from("chama_members")
        .insert({
          chama_id: chamaData.id,
          user_id: user.id,
          role: 'admin',
          is_active: true,
        });

      if (memberError) {
        console.error("Error adding creator as member:", memberError);
        toast({
          title: "Warning",
          description: "Chama created but failed to add you as admin",
          variant: "destructive",
        });
      }

      // Add initial activity
      await supabase
        .from("chama_activities")
        .insert({
          chama_id: chamaData.id,
          member_id: null,
          activity_type: 'chama_created',
          description: `${newChama.name} was created by ${user.email}`,
        });

      toast({
        title: "Success",
        description: `${newChama.name} has been created successfully! You can now manage it.`,
      });

      // Reset form and refresh data
      setNewChama({
        name: '',
        description: '',
        contributionAmount: '',
        contributionFrequency: 'monthly',
        maxMembers: '20'
      });
      setShowCreateForm(false);

      // Refresh the chamas list
      window.location.reload();
    } catch (error) {
      console.error("Unexpected error creating chama:", error);
      toast({
        title: "Creation Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleJoinChama = async (chamaId: string, chamaName: string) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      return;
    }
    setJoiningChamaId(chamaId);

    try {
        const { data: existing, error: checkError } = await supabase
            .from('chama_members')
            .select('id, is_active')
            .eq('user_id', user.id)
            .eq('chama_id', chamaId)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
            toast({
                title: existing.is_active ? "Already a Member" : "Request Pending",
                description: existing.is_active 
                    ? `You are already an active member of ${chamaName}.`
                    : `Your request to join ${chamaName} is pending approval.`,
            });
            return;
        }

        const { data: newMember, error: insertError } = await supabase
            .from('chama_members')
            .insert({
                chama_id: chamaId,
                user_id: user.id,
                role: 'member',
                is_active: false, // Pending approval
            })
            .select('id')
            .single();

        if (insertError) throw insertError;
        if (!newMember) throw new Error("Failed to create membership record.");

        await supabase
          .from("chama_activities")
          .insert({
            chama_id: chamaId,
            member_id: newMember.id,
            activity_type: 'join_request',
            description: `${user.email || 'A new user'} requested to join the chama.`,
          });

        toast({
            title: "Request Sent",
            description: `Your request to join ${chamaName} has been sent for approval.`,
        });

        setDiscoverableChamas(prev => prev.filter(chama => chama.id !== chamaId));

    } catch (error: any) {
        console.error("Error joining chama:", error);
        toast({
            title: "Error",
            description: error.message || "Failed to send join request.",
            variant: "destructive",
        });
    } finally {
        setJoiningChamaId(null);
    }
  };

  const handleNavigateToChama = (chamaId: string, chamaName: string) => {
    // For now, we'll show expanded details inline
    // In the future, you could navigate to a dedicated chama page
    toast({
      title: "Chama Details",
      description: `Viewing details for ${chamaName}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Digital Chamas</h1>
          <p className="text-gray-600">Create and manage your savings groups</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)} 
          className="flex items-center gap-2"
          disabled={creating}
        >
          <Plus className="h-4 w-4" />
          Create New Chama
        </Button>
      </div>

      <Tabs defaultValue="my-chamas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-chamas">My Chamas ({myChamasDB.length})</TabsTrigger>
          <TabsTrigger value="discover">Discover ({discoverableChamas.length})</TabsTrigger>
          <TabsTrigger value="analytics">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="my-chamas" className="space-y-4">
          {showCreateForm && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Create New Chama</CardTitle>
                <CardDescription className="text-green-700">
                  Set up a new savings group and start your financial journey together
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Chama Name *</Label>
                    <Input
                      id="name"
                      value={newChama.name}
                      onChange={(e) => setNewChama({...newChama, name: e.target.value})}
                      placeholder="e.g., Sunrise Savings Group"
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Monthly Contribution (KES) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newChama.contributionAmount}
                      onChange={(e) => setNewChama({...newChama, contributionAmount: e.target.value})}
                      placeholder="5000"
                      disabled={creating}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newChama.description}
                    onChange={(e) => setNewChama({...newChama, description: e.target.value})}
                    placeholder="What is this chama for? (e.g., Emergency fund, Investment goals)"
                    disabled={creating}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Contribution Frequency</Label>
                    <select
                      id="frequency"
                      value={newChama.contributionFrequency}
                      onChange={(e) => setNewChama({...newChama, contributionFrequency: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      disabled={creating}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="maxMembers">Maximum Members</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      value={newChama.maxMembers}
                      onChange={(e) => setNewChama({...newChama, maxMembers: e.target.value})}
                      placeholder="20"
                      disabled={creating}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleCreateChama} 
                    disabled={creating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {creating ? "Creating..." : "Create Chama"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>Loading your chamas...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myChamasDB.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No Chamas Yet</h3>
                    <CardDescription className="mb-4">
                      You haven't joined any chamas yet. Create your first one to start saving with others!
                    </CardDescription>
                    <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Chama
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myChamasDB.map((chama) => (
                  <Card key={chama.chamaId || chama.id} className="hover:shadow-md transition-shadow">
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
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleNavigateToChama(chama.chamaId || chama.id, chama.name)}
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {chama.current_members}/{chama.max_members} members
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <CurrencyDisplay 
                            amount={chama.contribution_amount} 
                            showToggle={false} 
                            className="text-sm" 
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <CurrencyDisplay 
                            amount={chama.total_savings || 0} 
                            showToggle={false} 
                            className="text-sm" 
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">
                            {chama.contribution_frequency}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <ChamaMemberManagement chamaId={chama.chamaId || chama.id} />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <ChamaActivities chamaId={chama.chamaId || chama.id} />
                          <ChamaChat
                            chamaId={chama.chamaId || chama.id}
                            memberId={chama.memberId || null}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discover & Join Chamas</CardTitle>
              <CardDescription>
                Find public chamas that match your savings goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDiscover ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>Loading available chamas...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {discoverableChamas.length === 0 ? (
                     <div className="text-center py-8">
                       <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                       <p className="text-sm text-muted-foreground">No new chamas to discover at the moment.</p>
                       <p className="text-xs text-muted-foreground mt-1">Create your own or check back later!</p>
                     </div>
                  ) : (
                    discoverableChamas.map((chama) => (
                      <div key={chama.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{chama.name}</h3>
                            <Badge variant="outline">{chama.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{chama.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{chama.current_members}/{chama.max_members} members</span>
                            <span>•</span>
                            <CurrencyDisplay amount={chama.contribution_amount} showToggle={false} className="text-xs" />
                            <span>per {chama.contribution_frequency}</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleJoinChama(chama.id, chama.name)}
                          disabled={joiningChamaId === chama.id || chama.current_members >= chama.max_members}
                          className="ml-4"
                        >
                          {joiningChamaId === chama.id ? 'Requesting...' : 
                           chama.current_members >= chama.max_members ? 'Full' : 'Request to Join'}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay 
                  amount={myChamasDB.reduce((sum, chama) => sum + (chama.total_savings || 0), 0)} 
                  className="text-2xl font-bold" 
                />
                <p className="text-xs text-muted-foreground">
                  Across {myChamasDB.length} chama{myChamasDB.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Chamas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myChamasDB.length}</div>
                <p className="text-xs text-muted-foreground">
                  {myChamasDB.filter(c => c.role === 'admin').length} as admin
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Contributions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay 
                  amount={myChamasDB.reduce((sum, chama) => sum + (chama.myContribution || 0), 0)} 
                  className="text-2xl font-bold" 
                />
                <p className="text-xs text-muted-foreground">
                  Total contributed
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChamasPage;
