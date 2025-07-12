import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Users, Target, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react';
import CurrencyDisplay from './CurrencyDisplay';
import { useLoanOffers } from '@/hooks/useLoanOffers';
import { useLoanAgreements } from '@/hooks/useLoanAgreements';
import { format } from 'date-fns';

const EnhancedInvestorDashboard: React.FC = () => {
  const { offers } = useLoanOffers();
  const { agreements } = useLoanAgreements();

  // Calculate metrics
  const totalInvested = agreements.reduce((sum, agreement) => sum + agreement.monthly_payment * agreement.duration_months, 0);
  const activeLoans = agreements.filter(a => a.end_date && new Date(a.end_date) > new Date()).length;
  const totalReturns = agreements.reduce((sum, agreement) => {
    const totalReturn = agreement.total_payment - (agreement.monthly_payment * agreement.duration_months);
    return sum + totalReturn;
  }, 0);
  const avgReturn = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  const pendingOffers = offers.filter(o => o.status === 'pending').length;
  const acceptedOffers = offers.filter(o => o.status === 'accepted').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investor Dashboard</h1>
          <p className="text-muted-foreground">Monitor your loan investments and portfolio performance</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Portfolio
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={totalInvested * 130}
              className="text-2xl font-bold"
              showToggle={false}
            />
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOffers} pending offers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={totalReturns * 130}
              className="text-2xl font-bold"
              showToggle={false}
            />
            <p className="text-xs text-muted-foreground">
              {avgReturn.toFixed(1)}% average return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Performance</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{avgReturn.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Outperforming market by 3.2%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Overview */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active-loans">Active Loans</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Investment Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Distribution</CardTitle>
              <CardDescription>Your portfolio breakdown by loan status and risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Performing Loans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">65%</span>
                    <CurrencyDisplay amount={totalInvested * 0.65 * 130} className="text-sm" showToggle={false} />
                  </div>
                </div>
                <Progress value={65} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">At Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">25%</span>
                    <CurrencyDisplay amount={totalInvested * 0.25 * 130} className="text-sm" showToggle={false} />
                  </div>
                </div>
                <Progress value={25} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">New Opportunities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">10%</span>
                    <CurrencyDisplay amount={totalInvested * 0.10 * 130} className="text-sm" showToggle={false} />
                  </div>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest investment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agreements.slice(0, 5).map((agreement) => (
                  <div key={agreement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Loan Agreement Activated</p>
                        <p className="text-sm text-muted-foreground">
                          {agreement.duration_months} months • {agreement.interest_rate}% interest
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <CurrencyDisplay 
                        amount={agreement.monthly_payment * agreement.duration_months * 130}
                        className="font-semibold"
                        showToggle={false}
                      />
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(agreement.created_at), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-loans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Loan Agreements</CardTitle>
              <CardDescription>Monitor your active investments and repayment schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agreements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No active loan agreements yet.</p>
                  </div>
                ) : (
                  agreements.map((agreement) => (
                    <div key={agreement.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Active</Badge>
                            <span className="text-sm text-muted-foreground">
                              Agreement #{agreement.id.slice(0, 8)}
                            </span>
                          </div>
                          <p className="font-medium mt-1">
                            {agreement.duration_months} months @ {agreement.interest_rate}% interest
                          </p>
                        </div>
                        <CurrencyDisplay 
                          amount={agreement.monthly_payment * agreement.duration_months * 130}
                          className="text-lg font-semibold"
                          showToggle={false}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Monthly Payment</p>
                          <CurrencyDisplay 
                            amount={agreement.monthly_payment * 130}
                            className="font-medium"
                            showToggle={false}
                          />
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Return</p>
                          <CurrencyDisplay 
                            amount={agreement.total_payment * 130}
                            className="font-medium"
                            showToggle={false}
                          />
                        </div>
                        <div>
                          <p className="text-muted-foreground">Progress</p>
                          <div className="flex items-center gap-2">
                            <Progress value={35} className="h-2 flex-1" />
                            <span className="text-xs">35%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Loan Offers</CardTitle>
              <CardDescription>Track the status of your investment offers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No loan offers made yet.</p>
                  </div>
                ) : (
                  offers.map((offer) => (
                    <div key={offer.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className={
                            offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {offer.status}
                          </Badge>
                          <p className="font-medium mt-1">
                            {offer.offered_interest_rate}% interest rate
                          </p>
                        </div>
                        <CurrencyDisplay 
                          amount={offer.offered_amount * 130}
                          className="text-lg font-semibold"
                          showToggle={false}
                        />
                      </div>
                      
                      {offer.message && (
                        <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                          {offer.message}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Offered on {format(new Date(offer.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Return Rate</span>
                  <span className="font-semibold text-green-600">+{avgReturn.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Default Rate</span>
                  <span className="font-semibold">2.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Portfolio Diversification</span>
                  <span className="font-semibold">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Risk Score</span>
                  <Badge variant="outline">Moderate</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Projections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Expected Income</span>
                  <CurrencyDisplay 
                    amount={agreements.reduce((sum, a) => sum + a.monthly_payment, 0) * 130}
                    className="font-semibold"
                    showToggle={false}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">New Opportunities</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Available Capital</span>
                  <CurrencyDisplay 
                    amount={250000}
                    className="font-semibold"
                    showToggle={false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedInvestorDashboard;