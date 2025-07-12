
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMobileMoney } from '@/hooks/useMobileMoney';
import { useToast } from "@/hooks/use-toast";
import { Smartphone } from "lucide-react";

const MobileMoneySetup: React.FC = () => {
  const { addAccount } = useMobileMoney();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    provider: '' as 'mpesa' | 'airtel_money' | '',
    phone_number: '',
    account_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider) {
      toast({
        title: "Error",
        description: "Please select a mobile money provider",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addAccount({
        provider: formData.provider as 'mpesa' | 'airtel_money',
        phone_number: formData.phone_number,
        account_name: formData.account_name || undefined
      });
      toast({
        title: "Success",
        description: "Mobile money account added successfully!",
      });
      setIsOpen(false);
      setFormData({ provider: '', phone_number: '', account_name: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add mobile money account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Smartphone size={16} />
          Setup Mobile Money
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Setup Mobile Money Account</DialogTitle>
          <DialogDescription>
            Add your mobile money account to enable staking and withdrawals
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value as 'mpesa' | 'airtel_money' }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select mobile money provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="airtel_money">Airtel Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="+254 700 000 000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name (Optional)</Label>
            <Input
              id="account_name"
              value={formData.account_name}
              onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
              placeholder="Your name as it appears on the account"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MobileMoneySetup;
