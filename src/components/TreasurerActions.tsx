
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, CreditCard, Users, AlertCircle, CheckCircle, FileBarChart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { useContributionApprovals } from '@/hooks/useContributionApprovals';

interface TreasurerActionsProps {
  chamaId: string;
}

const TreasurerActions: React.FC<TreasurerActionsProps> = ({ chamaId }) => {
  const { toast } = useToast();
  const { recordManualDeposit, processPayment, pendingContributions } = useAdminAnalytics(chamaId);
  const { pendingApprovals } = useContributionApprovals(chamaId);
  
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
  
  const [depositForm, setDepositForm] = useState({
    amount: '',
    paymentMethod: 'mobile_money',
    paymentReference: '',
    description: ''
  });
  
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    paymentMethod: 'mobile_money',
    paymentReference: '',
    description: ''
  });

  const [processing, setProcessing] = useState(false);

  const handleRecordDeposit = async () => {
    if (!depositForm.amount) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      await recordManualDeposit(
        parseFloat(depositForm.amount),
        depositForm.paymentMethod,
        depositForm.paymentReference || undefined,
        depositForm.description || undefined
      );

      toast({
        title: "Success",
        description: `Deposit of KES ${depositForm.amount} recorded successfully`,
      });
      
      setDepositDialogOpen(false);
      setDepositForm({
        amount: '',
        paymentMethod: 'mobile_money',
        paymentReference: '',
        description: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record deposit",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!withdrawalForm.amount) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      await processPayment(
        parseFloat(withdrawalForm.amount),
        withdrawalForm.paymentMethod,
        withdrawalForm.paymentReference || undefined,
        withdrawalForm.description || undefined
      );

      toast({
        title: "Success",
        description: `Payment of KES ${withdrawalForm.amount} processed successfully`,
      });
      
      setWithdrawalDialogOpen(false);
      setWithdrawalForm({
        amount: '',
        paymentMethod: 'mobile_money',
        paymentReference: '',
        description: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pendingApprovals.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Contributions awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Overdue Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingContributions.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Members with overdue payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileBarChart className="h-4 w-4 text-blue-600" />
              Total Managed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pendingApprovals.reduce((sum, approval) => sum + approval.amount, 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              KES pending approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Treasurer Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Treasurer Actions</CardTitle>
          <CardDescription>Manage chama finances and member contributions</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-20 flex-col gap-2">
                <PlusCircle className="h-6 w-6" />
                Record Deposit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Manual Deposit</DialogTitle>
                <DialogDescription>Record a manual deposit to the chama account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deposit-amount">Amount (KES)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select 
                    value={depositForm.paymentMethod} 
                    onValueChange={(value) => setDepositForm(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deposit-reference">Payment Reference (Optional)</Label>
                  <Input
                    id="deposit-reference"
                    value={depositForm.paymentReference}
                    onChange={(e) => setDepositForm(prev => ({ ...prev, paymentReference: e.target.value }))}
                    placeholder="Transaction ID or reference"
                  />
                </div>
                <div>
                  <Label htmlFor="deposit-description">Description (Optional)</Label>
                  <Textarea
                    id="deposit-description"
                    value={depositForm.description}
                    onChange={(e) => setDepositForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional notes"
                  />
                </div>
                <Button onClick={handleRecordDeposit} className="w-full" disabled={processing}>
                  {processing ? 'Recording...' : 'Record Deposit'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <CreditCard className="h-6 w-6" />
                Process Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Payment/Withdrawal</DialogTitle>
                <DialogDescription>Process a payment or withdrawal from the chama account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="withdrawal-amount">Amount (KES)</Label>
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select 
                    value={withdrawalForm.paymentMethod} 
                    onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="withdrawal-reference">Payment Reference (Optional)</Label>
                  <Input
                    id="withdrawal-reference"
                    value={withdrawalForm.paymentReference}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, paymentReference: e.target.value }))}
                    placeholder="Transaction ID or reference"
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawal-description">Description (Optional)</Label>
                  <Textarea
                    id="withdrawal-description"
                    value={withdrawalForm.description}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Purpose of payment"
                  />
                </div>
                <Button onClick={handleProcessPayment} className="w-full" disabled={processing}>
                  {processing ? 'Processing...' : 'Process Payment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={pendingDialogOpen} onOpenChange={setPendingDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <AlertCircle className="h-6 w-6" />
                View Overdue
                {pendingContributions.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {pendingContributions.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Overdue Contributions</DialogTitle>
                <DialogDescription>Members with overdue contributions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingContributions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>All members are up to date with their contributions!</p>
                  </div>
                ) : (
                  pendingContributions.map((contribution) => (
                    <div key={contribution.member_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{contribution.member_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {contribution.days_overdue} days overdue
                        </p>
                        {contribution.last_contribution_date && (
                          <p className="text-xs text-muted-foreground">
                            Last: {new Date(contribution.last_contribution_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">KES {contribution.expected_amount}</p>
                        <p className="text-xs text-muted-foreground">Expected</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreasurerActions;
