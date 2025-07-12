
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Smartphone, CreditCard } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import MpesaPayment from './MpesaPayment';
import CurrencyDisplay from './CurrencyDisplay';

const MobileMoneyTransfer: React.FC = () => {
  const { toast } = useToast();
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: '',
    provider: '',
    message: ''
  });

  const handleTransfer = () => {
    if (!transferData.recipient || !transferData.amount || !transferData.provider) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // For now, just show a success message
    toast({
      title: "Transfer Initiated",
      description: `Transfer of KES ${transferData.amount} to ${transferData.recipient} via ${transferData.provider} has been initiated.`,
    });

    // Reset form
    setTransferData({
      recipient: '',
      amount: '',
      provider: '',
      message: ''
    });
  };

  const handleMpesaSuccess = (transactionId: string) => {
    toast({
      title: "Payment Successful",
      description: "Your M-Pesa payment has been completed successfully.",
    });
  };

  const handleMpesaError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send Money</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="mpesa">M-Pesa Pay</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Send Money
              </CardTitle>
              <CardDescription>
                Transfer money to another mobile money account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Mobile Money Provider</Label>
                <Select onValueChange={(value) => setTransferData(prev => ({ ...prev, provider: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="airtel">Airtel Money</SelectItem>
                    <SelectItem value="tkash">T-Kash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Phone Number</Label>
                <Input
                  id="recipient"
                  type="tel"
                  placeholder="0700123456"
                  value={transferData.recipient}
                  onChange={(e) => setTransferData(prev => ({ ...prev, recipient: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={transferData.amount}
                  onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Input
                  id="message"
                  placeholder="Transfer message"
                  value={transferData.message}
                  onChange={(e) => setTransferData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <Button onClick={handleTransfer} className="w-full">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Send KES {transferData.amount || '0'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Deposit to Wallet
              </CardTitle>
              <CardDescription>
                Add money to your wallet from mobile money
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Smartphone className="h-6 w-6 mb-2 text-green-600" />
                    M-Pesa
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Smartphone className="h-6 w-6 mb-2 text-red-600" />
                    Airtel Money
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Smartphone className="h-6 w-6 mb-2 text-blue-600" />
                    T-Kash
                  </Button>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Select your mobile money provider to deposit funds
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mpesa" className="space-y-4">
          <MpesaPayment
            onSuccess={handleMpesaSuccess}
            onError={handleMpesaError}
            accountReference="Wallet Deposit"
            transactionDesc="Deposit to LendChain Wallet"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileMoneyTransfer;
