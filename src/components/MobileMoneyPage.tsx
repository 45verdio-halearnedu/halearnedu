
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, ArrowUpDown, Plus, CreditCard, History, TrendingUp, Zap, Shield, Users, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobileMoney } from '@/hooks/useMobileMoney';
import { useWallet } from '@/hooks/useWallet';
import MobileMoneyTransfer from './MobileMoneyTransfer';
import MobileMoneyHistory from './MobileMoneyHistory';
import CurrencyDisplay from './CurrencyDisplay';
import { Badge } from "@/components/ui/badge";

const MobileMoneyPage: React.FC = () => {
  const { toast } = useToast();
  const { accounts, loading } = useMobileMoney();
  const { wallet } = useWallet();

  const mobileProviders = [
    { 
      id: 'mpesa', 
      name: 'M-Pesa', 
      color: 'bg-gradient-to-r from-green-600 to-green-700', 
      users: '30M+',
      features: ['Instant Transfer', '24/7 Support', 'Low Fees']
    },
    { 
      id: 'airtel', 
      name: 'Airtel Money', 
      color: 'bg-gradient-to-r from-red-600 to-red-700', 
      users: '15M+',
      features: ['Quick Setup', 'Nationwide Coverage', 'Bonus Rewards']
    },
    { 
      id: 'tkash', 
      name: 'T-Kash', 
      color: 'bg-gradient-to-r from-blue-600 to-blue-700', 
      users: '5M+',
      features: ['Fast Processing', 'Secure Transactions', 'Mobile App']
    }
  ];

  const quickActions = [
    { name: 'Send Money', amount: 500, popular: true, icon: ArrowUpDown, color: 'text-blue-600' },
    { name: 'Buy Airtime', amount: 100, popular: false, icon: Smartphone, color: 'text-green-600' },
    { name: 'Pay Bills', amount: 1500, popular: true, icon: CreditCard, color: 'text-purple-600' },
    { name: 'Buy Goods', amount: 2000, popular: false, icon: Zap, color: 'text-orange-600' }
  ];

  const handleQuickDeposit = async (provider: string, amount: number) => {
    toast({
      title: "Deposit Initiated",
      description: `Deposit of KES ${amount.toLocaleString()} from ${provider} initiated. You will receive an SMS prompt shortly.`,
    });
  };

  const handleQuickWithdraw = async (provider: string, amount: number) => {
    if (!wallet || wallet.balance < amount / 130) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Initiated",
      description: `Withdrawal of KES ${amount.toLocaleString()} to ${provider} initiated`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Mobile Money
              </h1>
              <p className="text-gray-600 mt-1">Send, receive, and manage your mobile money transactions seamlessly</p>
            </div>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Link Account
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Wallet Balance</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              <CurrencyDisplay amount={(wallet?.balance || 0) * 130} showToggle={false} />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Available for transfers
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">This Month</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">KES 45,230</div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Linked Accounts</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Smartphone className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{accounts.length}</div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Shield className="h-3 w-3 text-blue-500" />
              All verified & secure
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="transfer" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="transfer" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Transfer
          </TabsTrigger>
          <TabsTrigger value="deposit" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Withdraw
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="space-y-6 mt-8">
          <MobileMoneyTransfer />
        </TabsContent>

        <TabsContent value="deposit" className="space-y-6 mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mobileProviders.map((provider) => (
              <Card key={provider.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 ${provider.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{provider.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    Deposit money from your {provider.name} account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Network Coverage:</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200">Nationwide</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Users:</span>
                      <span className="font-semibold text-gray-900">{provider.users}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Features:</span>
                      <div className="flex flex-wrap gap-2">
                        {provider.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      size="sm" 
                      onClick={() => handleQuickDeposit(provider.name, 1000)}
                      className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
                    >
                      +1K
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleQuickDeposit(provider.name, 5000)}
                      className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
                    >
                      +5K
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleQuickDeposit(provider.name, 10000)}
                      className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
                    >
                      +10K
                    </Button>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600">
                    Custom Amount
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6 mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mobileProviders.map((provider) => (
              <Card key={provider.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 ${provider.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{provider.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    Withdraw money to your {provider.name} account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Available Balance:</span>
                      <span className="font-semibold text-gray-900">
                        <CurrencyDisplay amount={(wallet?.balance || 0) * 130} showToggle={false} />
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Limit:</span>
                      <span className="font-semibold text-gray-900">KES 150,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Processing Time:</span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">Instant</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleQuickWithdraw(provider.name, 1000)}
                      className="text-xs border-gray-200 hover:bg-gray-50"
                    >
                      -1K
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleQuickWithdraw(provider.name, 5000)}
                      className="text-xs border-gray-200 hover:bg-gray-50"
                    >
                      -5K
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleQuickWithdraw(provider.name, 10000)}
                      className="text-xs border-gray-200 hover:bg-gray-50"
                    >
                      -10K
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50">
                    Custom Amount
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-8">
          <MobileMoneyHistory />
        </TabsContent>
      </Tabs>

      {/* Enhanced Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600">
                Common mobile money transactions for faster access
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-6 flex flex-col items-center space-y-3 relative border-0 bg-gray-50 hover:bg-gray-100 transition-all duration-200 group"
              >
                {action.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1">
                    Popular
                  </Badge>
                )}
                <div className={`p-3 bg-white rounded-lg group-hover:scale-105 transition-transform duration-200`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{action.name}</div>
                  <div className="text-sm text-gray-500">~KES {action.amount.toLocaleString()}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileMoneyPage;
