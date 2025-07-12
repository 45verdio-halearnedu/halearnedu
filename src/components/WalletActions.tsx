
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet } from '@/hooks/useWallet';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone, Banknote, Plus, Minus } from "lucide-react";
import CurrencyDisplay from './CurrencyDisplay';

const WalletActions: React.FC = () => {
  const { wallet, fetchWalletData } = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  // Convert USD amounts to KES for display
  const convertToKES = (usdAmount: number) => usdAmount * 130;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please enter amount and select payment method",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const depositAmount = parseFloat(amount);
      // Update wallet balance
      const newBalance = (wallet?.balance || 0) + depositAmount;
      await supabase
        .from('user_wallets')
        .update({ balance: newBalance })
        .eq('user_id', user?.id);

      // Create transaction record
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user?.id,
          type: 'deposit',
          amount: depositAmount,
          description: `Deposit via ${paymentMethod}${accountDetails ? ` - ${accountDetails}` : ''}`,
          status: 'completed'
        });

      await fetchWalletData();
      toast({
        title: "Deposit Successful",
        description: `${amount} USDC has been added to your wallet`,
      });
      setIsDepositOpen(false);
      setAmount('');
      setPaymentMethod('');
      setAccountDetails('');
    } catch (error) {
      toast({
        title: "Deposit Failed",
        description: "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please enter amount and select payment method",
        variant: "destructive",
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > (wallet?.balance || 0)) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update wallet balance
      const newBalance = (wallet?.balance || 0) - withdrawAmount;
      await supabase
        .from('user_wallets')
        .update({ balance: newBalance })
        .eq('user_id', user?.id);

      // Create transaction record
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user?.id,
          type: 'withdrawal',
          amount: -withdrawAmount,
          description: `Withdrawal to ${paymentMethod}${accountDetails ? ` - ${accountDetails}` : ''}`,
          status: 'completed'
        });

      await fetchWalletData();
      toast({
        title: "Withdrawal Successful",
        description: `${amount} USDC has been withdrawn from your wallet`,
      });
      setIsWithdrawOpen(false);
      setAmount('');
      setPaymentMethod('');
      setAccountDetails('');
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <div className="flex gap-4">
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
            <Plus size={16} />
            Deposit
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Add money to your LendChain wallet
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="amount" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="amount">Amount</TabsTrigger>
              <TabsTrigger value="method">Payment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="amount" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="deposit-amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    USDC
                  </div>
                </div>
                {amount && (
                  <div className="text-sm text-gray-600">
                    ≈ <CurrencyDisplay amount={convertToKES(parseFloat(amount))} showToggle={false} />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Quick amounts</Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickAmount(quickAmount)}
                      className="text-xs"
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="method" className="space-y-4">
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-method">Payment Method</Label>
                  <Select onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">
                        <div className="flex items-center gap-2">
                          <Smartphone size={16} />
                          M-Pesa
                        </div>
                      </SelectItem>
                      <SelectItem value="airtel-money">
                        <div className="flex items-center gap-2">
                          <Smartphone size={16} />
                          Airtel Money
                        </div>
                      </SelectItem>
                      <SelectItem value="bank-transfer">
                        <div className="flex items-center gap-2">
                          <Banknote size={16} />
                          Bank Transfer
                        </div>
                      </SelectItem>
                      <SelectItem value="credit-card">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {paymentMethod && (
                  <div className="space-y-2">
                    <Label htmlFor="account-details">
                      {paymentMethod === 'mpesa' || paymentMethod === 'airtel-money' 
                        ? 'Phone Number' 
                        : paymentMethod === 'bank-transfer' 
                          ? 'Account Number' 
                          : 'Card Number'
                      }
                    </Label>
                    <Input
                      id="account-details"
                      value={accountDetails}
                      onChange={(e) => setAccountDetails(e.target.value)}
                      placeholder={
                        paymentMethod === 'mpesa' || paymentMethod === 'airtel-money' 
                          ? '+254 700 000 000' 
                          : paymentMethod === 'bank-transfer' 
                            ? 'Account number' 
                            : '1234 5678 9012 3456'
                      }
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDepositOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !amount || !paymentMethod}>
                    {loading ? 'Processing...' : `Deposit $${amount || '0'}`}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Minus size={16} />
            Withdraw
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw money from your LendChain wallet
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="amount" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="amount">Amount</TabsTrigger>
              <TabsTrigger value="method">Withdrawal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="amount" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="withdraw-amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    max={wallet?.balance || 0}
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    USDC
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Available: <CurrencyDisplay amount={convertToKES(wallet?.balance || 0)} showToggle={false} />
                </p>
                {amount && (
                  <div className="text-sm text-gray-600">
                    ≈ <CurrencyDisplay amount={convertToKES(parseFloat(amount))} showToggle={false} />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Quick amounts</Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.filter(amt => amt <= (wallet?.balance || 0)).map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickAmount(quickAmount)}
                      className="text-xs"
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="method" className="space-y-4">
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-method">Withdrawal Method</Label>
                  <Select onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select withdrawal method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">
                        <div className="flex items-center gap-2">
                          <Smartphone size={16} />
                          M-Pesa
                        </div>
                      </SelectItem>
                      <SelectItem value="airtel-money">
                        <div className="flex items-center gap-2">
                          <Smartphone size={16} />
                          Airtel Money
                        </div>
                      </SelectItem>
                      <SelectItem value="bank-transfer">
                        <div className="flex items-center gap-2">
                          <Banknote size={16} />
                          Bank Transfer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {paymentMethod && (
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-account-details">
                      {paymentMethod === 'mpesa' || paymentMethod === 'airtel-money' 
                        ? 'Phone Number' 
                        : 'Account Number'
                      }
                    </Label>
                    <Input
                      id="withdraw-account-details"
                      value={accountDetails}
                      onChange={(e) => setAccountDetails(e.target.value)}
                      placeholder={
                        paymentMethod === 'mpesa' || paymentMethod === 'airtel-money' 
                          ? '+254 700 000 000' 
                          : 'Account number'
                      }
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsWithdrawOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !amount || !paymentMethod}>
                    {loading ? 'Processing...' : `Withdraw $${amount || '0'}`}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletActions;
