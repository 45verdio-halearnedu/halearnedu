
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLoanOffers } from '@/hooks/useLoanOffers';
import { useToast } from "@/hooks/use-toast";
import { LoanApplication } from '@/hooks/useLoans';

interface LoanOfferDialogProps {
  loanApplication: LoanApplication;
  children: React.ReactNode;
}

const LoanOfferDialog: React.FC<LoanOfferDialogProps> = ({ loanApplication, children }) => {
  const { createOffer } = useLoanOffers();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    offered_amount: loanApplication.amount,
    offered_interest_rate: loanApplication.interest_rate,
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createOffer({
        loan_application_id: loanApplication.id,
        offered_amount: formData.offered_amount,
        offered_interest_rate: formData.offered_interest_rate,
        message: formData.message || undefined
      });

      toast({
        title: "Offer Submitted",
        description: "Your loan offer has been submitted successfully.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Make a Loan Offer</DialogTitle>
          <DialogDescription>
            Submit your offer for this loan application
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offered_amount">Offer Amount (USDC)</Label>
              <Input
                id="offered_amount"
                type="number"
                value={formData.offered_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, offered_amount: Number(e.target.value) }))}
                max={loanApplication.amount}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offered_interest_rate">Interest Rate (%)</Label>
              <Input
                id="offered_interest_rate"
                type="number"
                step="0.1"
                value={formData.offered_interest_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, offered_interest_rate: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Add a message to your offer..."
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Loan Application Details</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Requested Amount:</span> {loanApplication.amount} USDC</p>
              <p><span className="font-medium">Duration:</span> {loanApplication.duration_months} months</p>
              <p><span className="font-medium">Requested Rate:</span> {loanApplication.interest_rate}%</p>
              {loanApplication.collateral && (
                <p><span className="font-medium">Collateral:</span> {loanApplication.collateral}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanOfferDialog;
