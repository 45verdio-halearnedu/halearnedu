
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useLoans } from '@/hooks/useLoans';
import { Loader2 } from 'lucide-react';

interface LoanApplicationDialogProps {
  children: React.ReactNode;
}

const LoanApplicationDialog: React.FC<LoanApplicationDialogProps> = ({ children }) => {
  const { toast } = useToast();
  const { submitLoanApplication } = useLoans();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: 5000,
    duration_months: 12,
    interest_rate: 5.2,
    collateral: '',
    purpose: '',
  });

  const calculateMonthlyPayment = () => {
    const r = formData.interest_rate / 100 / 12;
    const n = formData.duration_months;
    const p = formData.amount;
    const monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return monthlyPayment;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const monthlyPayment = calculateMonthlyPayment();
      await submitLoanApplication({
        amount: formData.amount,
        interest_rate: formData.interest_rate,
        duration_months: formData.duration_months,
        collateral: formData.collateral,
        monthly_payment: monthlyPayment,
        total_payment: monthlyPayment * formData.duration_months,
      });

      toast({
        title: "Application Submitted",
        description: `Your loan application for $${formData.amount} has been submitted successfully.`,
      });
      
      setOpen(false);
      setFormData({
        amount: 5000,
        duration_months: 12,
        interest_rate: 5.2,
        collateral: '',
        purpose: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit loan application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for a Loan</DialogTitle>
          <DialogDescription>
            Fill out the form below to submit your loan application.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Loan Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              min="1000"
              max="50000"
              step="100"
            />
            <div className="pt-2">
              <Slider
                value={[formData.amount]}
                max={50000}
                min={1000}
                step={100}
                onValueChange={(value) => setFormData(prev => ({ ...prev, amount: value[0] }))}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$1,000</span>
                <span>$25,000</span>
                <span>$50,000</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Months)</Label>
            <Select value={formData.duration_months.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, duration_months: Number(value) }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
                <SelectItem value="36">36 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest_rate">Interest Rate (%)</Label>
            <Input
              id="interest_rate"
              type="number"
              value={formData.interest_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, interest_rate: Number(e.target.value) }))}
              min="1"
              max="15"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Loan Purpose</Label>
            <Select value={formData.purpose} onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select loan purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collateral">Collateral (Optional)</Label>
            <Textarea
              id="collateral"
              placeholder="Describe any collateral you can offer..."
              value={formData.collateral}
              onChange={(e) => setFormData(prev => ({ ...prev, collateral: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Loan Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Monthly Payment:</span>
                <span className="font-medium">${calculateMonthlyPayment().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Payment:</span>
                <span className="font-medium">${(calculateMonthlyPayment() * formData.duration_months).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.purpose}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanApplicationDialog;
