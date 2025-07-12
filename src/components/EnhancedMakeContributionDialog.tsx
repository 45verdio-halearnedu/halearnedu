
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Smartphone, CreditCard, Wallet } from 'lucide-react';
import { useChamaContributions } from '@/hooks/useChamaContributions';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useMpesa } from '@/hooks/useMpesa';
import { useToast } from '@/hooks/use-toast';
import MpesaPayment from './MpesaPayment';

interface EnhancedMakeContributionDialogProps {
  chamaId: string;
  onContributionMade?: () => void;
}

const EnhancedMakeContributionDialog: React.FC<EnhancedMakeContributionDialogProps> = ({
  chamaId,
  onContributionMade
}) => {
  const { makeContribution } = useChamaContributions(chamaId);
  const { paymentMethods } = usePaymentMethods(chamaId);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'mobile_money',
    paymentReference: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) {
      toast({
        title: "Error",
        description: "Please enter contribution amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await makeContribution(
        parseFloat(formData.amount),
        formData.paymentMethod,
        formData.paymentReference,
        formData.notes
      );
      
      setIsOpen(false);
      setFormData({
        amount: '',
        paymentMethod: 'mobile_money',
        paymentReference: '',
        notes: ''
      });
      onContributionMade?.();
    } catch (error) {
      console.error('Error making contribution:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaSuccess = async (transactionId: string) => {
    try {
      // Create contribution record with M-Pesa reference
      await makeContribution(
        parseFloat(formData.amount),
        'mpesa',
        transactionId,
        formData.notes || 'M-Pesa contribution'
      );
      
      setIsOpen(false);
      setFormData({
        amount: '',
        paymentMethod: 'mobile_money',
        paymentReference: '',
        notes: ''
      });
      onContributionMade?.();
      
      toast({
        title: "Contribution Successful",
        description: "Your M-Pesa contribution has been recorded successfully.",
      });
    } catch (error) {
      console.error('Error recording M-Pesa contribution:', error);
      toast({
        title: "Error",
        description: "Payment successful but failed to record contribution. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Make Contribution
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Make Contribution</DialogTitle>
          <DialogDescription>
            Contribute to the chama using various payment methods
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="mpesa">M-Pesa Pay</TabsTrigger>
            <TabsTrigger value="wallet">From Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_money">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Mobile Money
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.method_type}>
                        {method.method_name} - {method.method_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-reference">Payment Reference (Optional)</Label>
                <Input
                  id="payment-reference"
                  value={formData.paymentReference}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
                  placeholder="Transaction ID, Receipt number, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this contribution"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Recording...' : 'Record Contribution'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="mpesa" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mpesa-amount">Amount (KES)</Label>
                <Input
                  id="mpesa-amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter contribution amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesa-notes">Notes (Optional)</Label>
                <Textarea
                  id="mpesa-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>

              {formData.amount && (
                <MpesaPayment
                  amount={parseFloat(formData.amount)}
                  onSuccess={handleMpesaSuccess}
                  onError={(error) => {
                    toast({
                      title: "Payment Failed",
                      description: error,
                      variant: "destructive",
                    });
                  }}
                  accountReference="Chama Contribution"
                  transactionDesc={`Contribution to chama - KES ${formData.amount}`}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Wallet Payment</span>
              </div>
              <p className="text-sm text-yellow-700">
                This feature allows you to contribute directly from your wallet balance. 
                Coming soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedMakeContributionDialog;
