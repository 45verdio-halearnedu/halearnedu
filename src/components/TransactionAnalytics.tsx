
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import CurrencyDisplay from './CurrencyDisplay';

const TransactionAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Convert USD amounts to KES for display
  const convertToKES = (usdAmount: number) => usdAmount * 130;

  // Mock data for analytics
  const spendingData = [
    { category: 'Bills', amount: 450, percentage: 30 },
    { category: 'Food', amount: 280, percentage: 19 },
    { category: 'Transport', amount: 150, percentage: 10 },
    { category: 'Entertainment', amount: 200, percentage: 13 },
    { category: 'Shopping', amount: 320, percentage: 21 },
    { category: 'Others', amount: 100, percentage: 7 }
  ];

  const monthlyData = [
    { month: 'Jan', income: 3000, expenses: 2200, savings: 800 },
    { month: 'Feb', income: 3200, expenses: 2400, savings: 800 },
    { month: 'Mar', income: 2800, expenses: 2100, savings: 700 },
    { month: 'Apr', income: 3500, expenses: 2600, savings: 900 },
    { month: 'May', income: 3300, expenses: 2500, savings: 800 },
    { month: 'Jun', income: 3600, expenses: 2700, savings: 900 }
  ];

  const dailyTransactions = [
    { day: 'Mon', sent: 120, received: 200 },
    { day: 'Tue', sent: 80, received: 150 },
    { day: 'Wed', sent: 200, received: 100 },
    { day: 'Thu', sent: 150, received: 300 },
    { day: 'Fri', sent: 250, received: 180 },
    { day: 'Sat', sent: 100, received: 250 },
    { day: 'Sun', sent: 75, received: 120 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const totalSpent = spendingData.reduce((sum, item) => sum + item.amount, 0);
  const avgDaily = totalSpent / 30;
  const topCategory = spendingData.reduce((max, item) => item.amount > max.amount ? item : max);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Transaction Analytics</h1>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={convertToKES(totalSpent)} showToggle={false} />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={convertToKES(avgDaily)} showToggle={false} />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% from last week
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topCategory.category}</div>
            <p className="text-xs text-muted-foreground">
              <CurrencyDisplay amount={convertToKES(topCategory.amount)} showToggle={false} /> ({topCategory.percentage}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +23% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="spending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="spending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Your expenses breakdown for this month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>Detailed breakdown with amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spendingData.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          <CurrencyDisplay amount={convertToKES(item.amount)} showToggle={false} />
                        </div>
                        <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income vs Expenses</CardTitle>
              <CardDescription>Track your financial health over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Bar dataKey="income" fill="#10B981" name="Income" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                  <Bar dataKey="savings" fill="#3B82F6" name="Savings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Transaction Flow</CardTitle>
              <CardDescription>Money sent vs received over the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyTransactions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Line type="monotone" dataKey="sent" stroke="#EF4444" strokeWidth={2} name="Sent" />
                  <Line type="monotone" dataKey="received" stroke="#10B981" strokeWidth={2} name="Received" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Smart Insights</CardTitle>
                <CardDescription>AI-powered financial recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Spending Optimization</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        You spent 15% more on entertainment this month. Consider setting a budget limit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Savings Opportunity</h4>
                      <p className="text-sm text-green-700 mt-1">
                        You could save $120/month by reducing food delivery expenses by 20%.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Bill Reminder</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your electricity bill is due in 3 days. Auto-pay is not enabled.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Goals</CardTitle>
                <CardDescription>Track your progress this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Spending Limit</span>
                    <span>$1,350 / $1,500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Savings Target</span>
                    <span>$480 / $600</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Investment Goal</span>
                    <span>$200 / $400</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '50%' }}></div>
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

export default TransactionAnalytics;
