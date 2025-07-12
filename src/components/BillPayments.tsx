
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from '@/hooks/useWallet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Zap, Wifi, Phone, Car, Home, CreditCard, Calendar as CalendarIcon, 
  Bell, Clock, Filter, Search, Download, Receipt, Users, TrendingUp,
  AlertCircle, CheckCircle2, XCircle, Eye, Settings, Plus
} from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth } from "date-fns";
import CurrencyDisplay from './CurrencyDisplay';

interface BillHistory {
  id: string;
  provider: string;
  amount: number;
  accountNumber: string;
  billType: string;
  paidDate: Date;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  receiptNumber?: string;
  splitWith?: string[];
}

interface AutoPaySchedule {
  id: string;
  provider: string;
  accountNumber: string;
  amount: number;
  billType: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  nextDueDate: Date;
  isActive: boolean;
  reminderDays: number;
}

const BillPayments: React.FC = () => {
  const { wallet, fetchWalletData } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [billData, setBillData] = useState({
    provider: '',
    accountNumber: '',
    amount: '',
    billType: '',
    dueDate: '',
    isRecurring: false,
    reminderDays: 3,
    splitBill: false,
    splitUsers: [] as string[]
  });

  // Mock data for demonstration
  const [billHistory] = useState<BillHistory[]>([
    {
      id: '1',
      provider: 'Kenya Power',
      amount: 150,
      accountNumber: '123456789',
      billType: 'electricity',
      paidDate: new Date('2024-06-10'),
      dueDate: new Date('2024-06-15'),
      status: 'paid',
      receiptNumber: 'KP2024001'
    },
    {
      id: '2',
      provider: 'Safaricom Fiber',
      amount: 80,
      accountNumber: '987654321',
      billType: 'internet',
      paidDate: new Date('2024-06-12'),
      dueDate: new Date('2024-06-20'),
      status: 'paid',
      receiptNumber: 'SF2024002'
    },
    {
      id: '3',
      provider: 'NHIF',
      amount: 200,
      accountNumber: '456789123',
      billType: 'insurance',
      paidDate: new Date(),
      dueDate: new Date('2024-06-25'),
      status: 'pending'
    }
  ]);

  const [autoPaySchedules] = useState<AutoPaySchedule[]>([
    {
      id: '1',
      provider: 'Kenya Power',
      accountNumber: '123456789',
      amount: 150,
      billType: 'electricity',
      frequency: 'monthly',
      nextDueDate: new Date('2024-07-15'),
      isActive: true,
      reminderDays: 3
    },
    {
      id: '2',
      provider: 'Safaricom Fiber',
      accountNumber: '987654321',
      amount: 80,
      billType: 'internet',
      frequency: 'monthly',
      nextDueDate: new Date('2024-07-20'),
      isActive: false,
      reminderDays: 5
    }
  ]);

  const billCategories = [
    { id: 'electricity', name: 'Electricity', icon: Zap, providers: ['Kenya Power', 'Umeme', 'TANESCO'], color: 'text-yellow-600' },
    { id: 'water', name: 'Water', icon: Home, providers: ['Nairobi Water', 'NWSC', 'DAWASCO'], color: 'text-blue-600' },
    { id: 'internet', name: 'Internet', icon: Wifi, providers: ['Safaricom Fiber', 'Zuku', 'Liquid Telecom'], color: 'text-green-600' },
    { id: 'mobile', name: 'Mobile Airtime', icon: Phone, providers: ['Safaricom', 'Airtel', 'Telkom'], color: 'text-purple-600' },
    { id: 'insurance', name: 'Insurance', icon: Car, providers: ['NHIF', 'Jubilee', 'CIC'], color: 'text-red-600' },
    { id: 'credit', name: 'Credit Cards', icon: CreditCard, providers: ['KCB', 'Equity', 'Standard Chartered'], color: 'text-indigo-600' }
  ];

  const convertToKES = (usdAmount: number) => usdAmount * 130;

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billData.provider || !billData.accountNumber || !billData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(billData.amount);
    if (amount > (wallet?.balance || 0)) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this payment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful",
        description: `Bill payment of ${amount} USDC to ${billData.provider} completed successfully`,
      });
      
      setBillData({
        provider: '',
        accountNumber: '',
        amount: '',
        billType: '',
        dueDate: '',
        isRecurring: false,
        reminderDays: 3,
        splitBill: false,
        splitUsers: []
      });
      await fetchWalletData();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process bill payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      failed: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || variants.failed;
  };

  const filteredHistory = billHistory.filter(bill => {
    const matchesSearch = bill.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.accountNumber.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalSpent = billHistory.reduce((sum, bill) => sum + (bill.status === 'paid' ? bill.amount : 0), 0);
  const pendingAmount = billHistory.reduce((sum, bill) => sum + (bill.status === 'pending' ? bill.amount : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Bill Management</h1>
          <p className="text-gray-500 mt-1">Comprehensive billing solution with smart features</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Available Balance</div>
          <div className="text-2xl font-bold">
            <CurrencyDisplay amount={convertToKES(wallet?.balance || 0)} showToggle={false} />
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={convertToKES(totalSpent)} showToggle={false} />
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={convertToKES(pendingAmount)} showToggle={false} />
            </div>
            <p className="text-xs text-muted-foreground">3 bills due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Pay Active</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {autoPaySchedules.filter(s => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">of {autoPaySchedules.length} schedules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">Payment reliability</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pay-bills" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pay-bills">Pay Bills</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="auto-pay">Auto-Pay</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pay-bills" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {billCategories.map((category) => (
              <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
                <CardHeader className="text-center pb-4">
                  <category.icon className={`h-16 w-16 mx-auto ${category.color} mb-2`} />
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <CardDescription>Quick and secure payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayBill} className="space-y-4">
                    <div>
                      <Label>Provider *</Label>
                      <Select onValueChange={(value) => setBillData(prev => ({ ...prev, provider: value, billType: category.id }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {category.providers.map(provider => (
                            <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Account/Phone Number *</Label>
                      <Input
                        value={billData.accountNumber}
                        onChange={(e) => setBillData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder={category.id === 'mobile' ? '+254 700 000 000' : 'Enter account number'}
                      />
                    </div>

                    <div>
                      <Label>Amount (USDC) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={billData.amount}
                        onChange={(e) => setBillData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Enter amount"
                      />
                    </div>

                    <div>
                      <Label>Due Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Select due date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Set up recurring payment</Label>
                        <Switch
                          checked={billData.isRecurring}
                          onCheckedChange={(checked) => setBillData(prev => ({ ...prev, isRecurring: checked }))}
                        />
                      </div>

                      {billData.isRecurring && (
                        <div>
                          <Label>Reminder (days before due)</Label>
                          <Select onValueChange={(value) => setBillData(prev => ({ ...prev, reminderDays: parseInt(value) }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reminder" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 day</SelectItem>
                              <SelectItem value="3">3 days</SelectItem>
                              <SelectItem value="5">5 days</SelectItem>
                              <SelectItem value="7">7 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Label>Split bill with others</Label>
                        <Switch
                          checked={billData.splitBill}
                          onCheckedChange={(checked) => setBillData(prev => ({ ...prev, splitBill: checked }))}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <Receipt className="mr-2 h-4 w-4" />
                          {category.id === 'mobile' ? 'Buy Airtime' : 'Pay Bill'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by provider or account number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.provider}</TableCell>
                    <TableCell>{bill.accountNumber}</TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={convertToKES(bill.amount)} showToggle={false} />
                    </TableCell>
                    <TableCell>{format(bill.dueDate, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(bill.status)}
                        <Badge className={getStatusBadge(bill.status)}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {bill.receiptNumber && (
                        <Badge variant="outline">{bill.receiptNumber}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {bill.status === 'paid' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="auto-pay" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Auto-Pay Schedules</h3>
              <p className="text-gray-500">Manage your recurring bill payments</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </div>

          <div className="grid gap-4">
            {autoPaySchedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {billCategories.find(cat => cat.id === schedule.billType)?.icon && (
                          React.createElement(billCategories.find(cat => cat.id === schedule.billType)!.icon, {
                            className: `h-8 w-8 ${billCategories.find(cat => cat.id === schedule.billType)?.color}`
                          })
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{schedule.provider}</h4>
                        <p className="text-sm text-gray-500">Account: {schedule.accountNumber}</p>
                        <p className="text-sm text-gray-500">
                          Next payment: {format(schedule.nextDueDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        <CurrencyDisplay amount={convertToKES(schedule.amount)} showToggle={false} />
                      </div>
                      <div className="text-sm text-gray-500 capitalize">{schedule.frequency}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Switch checked={schedule.isActive} />
                        <span className="text-sm">{schedule.isActive ? 'Active' : 'Paused'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bill Reminders & Notifications
              </CardTitle>
              <CardDescription>
                Stay on top of your bills with smart reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium">NHIF Payment Due</h4>
                      <p className="text-sm text-gray-600">Due in 3 days - KES 26,000</p>
                    </div>
                  </div>
                  <Button size="sm">Pay Now</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Electricity Bill Reminder</h4>
                      <p className="text-sm text-gray-600">Auto-pay scheduled for tomorrow</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Auto-Pay</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Internet Bill Paid</h4>
                      <p className="text-sm text-gray-600">Successfully paid yesterday</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Receipt className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billCategories.slice(0, 4).map((category, index) => {
                    const percentage = Math.floor(Math.random() * 80) + 20;
                    return (
                      <div key={category.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category.name}</span>
                          <span>{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wallet Balance</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mobile Money</span>
                    <span className="font-semibold">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bill Payment Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    <CurrencyDisplay amount={convertToKES(totalSpent * 12)} showToggle={false} />
                  </div>
                  <div className="text-sm text-blue-600">Projected Annual Spending</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    <CurrencyDisplay amount={convertToKES(50)} showToggle={false} />
                  </div>
                  <div className="text-sm text-green-600">Avg. Monthly Savings with Auto-Pay</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">95%</div>
                  <div className="text-sm text-purple-600">On-Time Payment Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillPayments;
