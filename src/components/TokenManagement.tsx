
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Gift } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TokenTransaction {
  id: string;
  transaction_type: 'earn' | 'spend' | 'stake' | 'unstake';
  amount: number;
  source: string;
  description?: string;
  created_at: string;
}

interface UserTokens {
  id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
}

const TokenManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stakeAmount, setStakeAmount] = useState('');

  const { data: userTokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['user-tokens', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // First try to get existing record
      let { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // If no record exists, create one
      if (error && error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('user_tokens')
          .insert({
            user_id: user.id,
            balance: 1000, // Starting balance
            total_earned: 1000,
            total_spent: 0
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        data = newData;
      } else if (error) {
        throw error;
      }
      
      return data as UserTokens;
    },
    enabled: !!user
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['token-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as TokenTransaction[];
    },
    enabled: !!user
  });

  const updateTokensMutation = useMutation({
    mutationFn: async ({ amount, type, source, description }: {
      amount: number;
      type: 'earn' | 'spend' | 'stake' | 'unstake';
      source: string;
      description: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Check balance for spending/staking operations
      if ((type === 'spend' || type === 'stake') && userTokens && userTokens.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Call the edge function to update tokens
      const { data, error } = await supabase.functions.invoke('update-user-tokens', {
        body: {
          p_user_id: user.id,
          p_amount: amount,
          p_transaction_type: type,
          p_source: source,
          p_description: description,
          p_reference_id: null
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['token-transactions'] });
    },
    onError: (error: any) => {
      console.error('Token update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update tokens",
        variant: "destructive",
      });
    }
  });

  const handleStake = () => {
    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive",
      });
      return;
    }

    if (amount < 100) {
      toast({
        title: "Minimum Stake Required",
        description: "Minimum stake amount is 100 VDO tokens",
        variant: "destructive",
      });
      return;
    }

    updateTokensMutation.mutate({
      amount,
      type: 'stake',
      source: 'staking',
      description: `Staked ${amount} VDO tokens`
    }, {
      onSuccess: () => {
        toast({
          title: "Tokens Staked!",
          description: `Successfully staked ${amount} VDO tokens`,
        });
        setStakeAmount('');
      }
    });
  };

  const handleClaimRewards = () => {
    const rewardAmount = 100;
    
    updateTokensMutation.mutate({
      amount: rewardAmount,
      type: 'earn',
      source: 'daily_reward',
      description: 'Daily login reward'
    }, {
      onSuccess: () => {
        toast({
          title: "Rewards Claimed!",
          description: `You earned ${rewardAmount} VDO tokens`,
        });
      }
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'spend': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'stake': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'unstake': return <ArrowDownRight className="h-4 w-4 text-orange-600" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn': return 'text-green-600';
      case 'spend': return 'text-red-600';
      case 'stake': return 'text-blue-600';
      case 'unstake': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Coins className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to manage your VDO tokens.</p>
        </CardContent>
      </Card>
    );
  }

  if (tokensLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTokens?.balance || 0}</div>
            <p className="text-xs text-muted-foreground">VDO Tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTokens?.total_earned || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTokens?.total_spent || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Reward</CardTitle>
            <Gift className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-2"
              onClick={handleClaimRewards}
              disabled={updateTokensMutation.isPending}
            >
              {updateTokensMutation.isPending ? 'Claiming...' : 'Claim Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="stake">Stake Tokens</TabsTrigger>
          <TabsTrigger value="rewards">Earn Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest token activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <p className="font-medium">{transaction.description || transaction.source}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                          {transaction.transaction_type === 'earn' ? '+' : '-'}{transaction.amount}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.transaction_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>No transactions yet</p>
                      <p className="text-sm">Start earning tokens by completing activities!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stake" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Stake VDO Tokens</CardTitle>
              <CardDescription>
                Stake your tokens to earn additional rewards. Minimum stake: 100 VDO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stake-amount">Stake Amount</Label>
                  <Input
                    id="stake-amount"
                    type="number"
                    placeholder="Enter amount to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="100"
                    max={userTokens?.balance || 0}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available balance: {userTokens?.balance || 0} VDO
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Staking Benefits</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Earn 12% APY on staked tokens</li>
                    <li>• Unlock premium features</li>
                    <li>• Priority access to new investments</li>
                    <li>• Monthly bonus rewards</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleStake}
                  disabled={!stakeAmount || parseFloat(stakeAmount) < 100 || updateTokensMutation.isPending || !userTokens || userTokens.balance < parseFloat(stakeAmount || '0')}
                  className="w-full"
                >
                  {updateTokensMutation.isPending ? 'Staking...' : 'Stake Tokens'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ways to Earn VDO Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Complete Learning Content</p>
                      <p className="text-sm text-gray-500">Articles, videos, quizzes</p>
                    </div>
                    <Badge>25-50 VDO</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Successful Loan Repayment</p>
                      <p className="text-sm text-gray-500">As a borrower</p>
                    </div>
                    <Badge>100+ VDO</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Lend to Borrowers</p>
                      <p className="text-sm text-gray-500">Platform fee rewards</p>
                    </div>
                    <Badge>50+ VDO</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Daily Login</p>
                      <p className="text-sm text-gray-500">Once per day</p>
                    </div>
                    <Badge>100 VDO</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Refer Friends</p>
                      <p className="text-sm text-gray-500">Per successful referral</p>
                    </div>
                    <Badge>500 VDO</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Utility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Premium AI Insights</p>
                      <p className="text-sm text-gray-500">Monthly subscription</p>
                    </div>
                    <Badge variant="outline">1000 VDO</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Reduce Platform Fees</p>
                      <p className="text-sm text-gray-500">Up to 50% discount</p>
                    </div>
                    <Badge variant="outline">500+ VDO</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Priority Support</p>
                      <p className="text-sm text-gray-500">VIP customer service</p>
                    </div>
                    <Badge variant="outline">200 VDO</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Governance Voting</p>
                      <p className="text-sm text-gray-500">Platform decisions</p>
                    </div>
                    <Badge variant="outline">Free</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenManagement;
