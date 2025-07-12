
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Plus, Users, Target, Calendar, Receipt } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CurrencyDisplay from '@/components/CurrencyDisplay';

const TuitionWalletsPage: React.FC = () => {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWallet, setNewWallet] = useState({
    studentName: '',
    schoolName: '',
    classLevel: '',
    targetAmount: '',
    targetDeadline: ''
  });

  // Mock data - will be replaced with actual Supabase queries
  const studentWallets = [
    {
      id: '1',
      studentName: 'Sarah Mwangi',
      schoolName: 'Nairobi International School',
      classLevel: 'Form 3',
      balance: 145000,
      targetAmount: 200000,
      targetDeadline: '2024-08-15',
      sponsors: 3,
      lastPayment: '2024-01-05',
      nextPaymentDue: '2024-02-01'
    },
    {
      id: '2',
      studentName: 'David Kiprotich',
      schoolName: 'Moi University',
      classLevel: 'Year 2',
      balance: 85000,
      targetAmount: 120000,
      targetDeadline: '2024-06-30',
      sponsors: 2,
      lastPayment: '2023-12-15',
      nextPaymentDue: '2024-01-15'
    }
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'contribution',
      amount: 15000,
      description: 'Monthly contribution from Uncle John',
      date: '2024-01-10',
      walletId: '1'
    },
    {
      id: '2',
      type: 'payment',
      amount: -35000,
      description: 'Term 1 fees payment - Nairobi International School',
      date: '2024-01-05',
      walletId: '1'
    },
    {
      id: '3',
      type: 'contribution',
      amount: 20000,
      description: 'Contribution from Grandmother',
      date: '2023-12-28',
      walletId: '2'
    }
  ];

  const sponsors = [
    {
      id: '1',
      name: 'Uncle John Mwangi',
      relationship: 'Uncle',
      totalContributed: 45000,
      monthlyContribution: 15000,
      walletId: '1'
    },
    {
      id: '2',
      name: 'Grandmother Mary',
      relationship: 'Grandmother',
      totalContributed: 30000,
      monthlyContribution: 10000,
      walletId: '1'
    },
    {
      id: '3',
      name: 'Family Friend Paul',
      relationship: 'Family Friend',
      totalContributed: 20000,
      monthlyContribution: 5000,
      walletId: '1'
    }
  ];

  const handleCreateWallet = () => {
    if (!newWallet.studentName || !newWallet.schoolName || !newWallet.targetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Wallet Created",
      description: `Education wallet for ${newWallet.studentName} has been created`,
    });

    setNewWallet({
      studentName: '',
      schoolName: '',
      classLevel: '',
      targetAmount: '',
      targetDeadline: ''
    });
    setShowCreateForm(false);
  };

  const handlePayFees = (walletId: string, studentName: string) => {
    toast({
      title: "Payment Initiated",
      description: `Fee payment for ${studentName} has been initiated`,
    });
  };

  const handleInviteSponsor = (walletId: string) => {
    toast({
      title: "Invitation Sent",
      description: "Sponsor invitation has been sent successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Education & Tuition Wallets</h1>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Wallet
        </Button>
      </div>

      <Tabs defaultValue="wallets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallets">My Wallets</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Education Wallet</CardTitle>
                <CardDescription>
                  Set up a savings wallet for your child's education expenses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    value={newWallet.studentName}
                    onChange={(e) => setNewWallet({...newWallet, studentName: e.target.value})}
                    placeholder="Enter student's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolName">School/Institution *</Label>
                  <Input
                    id="schoolName"
                    value={newWallet.schoolName}
                    onChange={(e) => setNewWallet({...newWallet, schoolName: e.target.value})}
                    placeholder="Enter school or institution name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="classLevel">Class/Year</Label>
                    <Input
                      id="classLevel"
                      value={newWallet.classLevel}
                      onChange={(e) => setNewWallet({...newWallet, classLevel: e.target.value})}
                      placeholder="e.g., Form 2, Year 1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetAmount">Target Amount (KES) *</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={newWallet.targetAmount}
                      onChange={(e) => setNewWallet({...newWallet, targetAmount: e.target.value})}
                      placeholder="200000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="targetDeadline">Target Date</Label>
                  <Input
                    id="targetDeadline"
                    type="date"
                    value={newWallet.targetDeadline}
                    onChange={(e) => setNewWallet({...newWallet, targetDeadline: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateWallet}>Create Wallet</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {studentWallets.map((wallet) => {
              const progressPercentage = (wallet.balance / wallet.targetAmount) * 100;
              return (
                <Card key={wallet.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5" />
                          {wallet.studentName}
                        </CardTitle>
                        <CardDescription>
                          {wallet.schoolName} • {wallet.classLevel}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {wallet.sponsors} sponsors
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Savings Progress</span>
                          <span>{progressPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <CurrencyDisplay amount={wallet.balance} showToggle={false} />
                          <CurrencyDisplay amount={wallet.targetAmount} showToggle={false} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">Target Date</span>
                          <span className="font-medium">{wallet.targetDeadline}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Last Payment</span>
                          <span className="font-medium">{wallet.lastPayment}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Next Due</span>
                          <span className="font-medium">{wallet.nextPaymentDue}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handlePayFees(wallet.id, wallet.studentName)}>
                          Pay Fees
                        </Button>
                        <Button variant="outline" onClick={() => handleInviteSponsor(wallet.id)}>
                          Invite Sponsor
                        </Button>
                        <Button variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sponsors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sponsors</CardTitle>
              <CardDescription>
                Family and friends contributing to education expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{sponsor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {sponsor.relationship} • 
                        <CurrencyDisplay amount={sponsor.totalContributed} showToggle={false} className="ml-1" />
                        {' '}total contributed
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Monthly: <CurrencyDisplay amount={sponsor.monthlyContribution} showToggle={false} />
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View History
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                All contributions and fee payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'contribution' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {transaction.type === 'contribution' ? <Users className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}
                      <CurrencyDisplay amount={Math.abs(transaction.amount)} showToggle={false} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={230000} className="text-2xl font-bold" />
                <p className="text-xs text-muted-foreground">
                  Across 2 students
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sponsors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Contributing monthly
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Jan 15</div>
                <p className="text-xs text-muted-foreground">
                  David's university fees
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TuitionWalletsPage;
