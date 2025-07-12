
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Coins, ArrowUpDown, TrendingUp, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TokenData {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface Transaction {
  id: string;
  amount: number;
  transactionType: string;
  description: string;
  source: string;
  createdAt: string;
}

const TokenManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tokenData, setTokenData] = useState<TokenData>({
    balance: 0,
    totalEarned: 0,
    totalSpent: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchangeAmount, setExchangeAmount] = useState('');

  useEffect(() => {
    if (user) {
      fetchTokenData();
      fetchTransactions();
    }
  }, [user]);

  const fetchTokenData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setTokenData({
          balance: data.balance || 0,
          totalEarned: data.total_earned || 0,
          totalSpent: data.total_spent || 0
        });
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setTransactions(data.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        transactionType: tx.transaction_type,
        description: tx.description || '',
        source: tx.source,
        createdAt: tx.created_at
      })));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleTokenExchange = async (fromToken: string, toToken: string) => {
    if (!exchangeAmount || !user) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(exchangeAmount);
    if (amount > tokenData.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough tokens for this exchange",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate token exchange
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Exchange Successful",
        description: `${amount} ${fromToken} exchanged for ${toToken}`,
      });
      
      setExchangeAmount('');
      await fetchTokenData();
      await fetchTransactions();
    } catch (error) {
      toast({
        title: "Exchange Failed",
        description: "Failed to process token exchange",
        variant: "destructive",
      });
    }
  };

  const earnTokens = async (source: string, amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          transaction_type: 'earn',
          source: source,
          description: `Earned tokens from ${source}`
        });

      if (error) throw error;

      toast({
        title: "Tokens Earned",
        description: `You earned ${amount} tokens from ${source}`,
      });

      await fetchTokenData();
      await fetchTransactions();
    } catch (error) {
      console.error('Error earning tokens:', error);
      toast({
        title: "Error",
        description: "Failed to process token earning",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Token Management</h1>
        <div className="text-center py-12">Loading token data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Token Management</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Coins className="h-4 w-4" />
          Token Stats
        </Button>
      </div>

      {/* Token Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenData.balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenData.totalEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenData.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time spending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exchange" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exchange">Exchange</TabsTrigger>
          <TabsTrigger value="earn">Earn Tokens</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="exchange" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Token Exchange
              </CardTitle>
              <CardDescription>
                Exchange your tokens for other currencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount to Exchange</Label>
                <Input
                  id="amount"
                  type="number"
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(e.target.value)}
                  placeholder="Enter token amount"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Button 
                  onClick={() => handleTokenExchange('TOKENS', 'KES')}
                  className="w-full"
                >
                  Exchange to KES
                </Button>
                <Button 
                  onClick={() => handleTokenExchange('TOKENS', 'USD')}
                  variant="outline"
                  className="w-full"
                >
                  Exchange to USD
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earn" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Referral Bonus</CardTitle>
                <CardDescription>
                  Earn tokens by referring friends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => earnTokens('referral', 100)}
                  className="w-full"
                >
                  Earn 100 Tokens
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Login</CardTitle>
                <CardDescription>
                  Get daily login rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => earnTokens('daily_login', 25)}
                  className="w-full"
                >
                  Claim 25 Tokens
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loan Activity</CardTitle>
                <CardDescription>
                  Earn from successful loans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => earnTokens('loan_activity', 50)}
                  className="w-full"
                >
                  Earn 50 Tokens
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your token transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{transaction.transactionType}</p>
                        <p className="text-sm text-gray-500">{transaction.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.transactionType === 'earn' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 'earn' ? '+' : '-'}{transaction.amount}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenManagementPage;
