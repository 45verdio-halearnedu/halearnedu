import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoanOffer } from '@/hooks/useLoanOffers';
import CurrencyDisplay from './CurrencyDisplay';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoanOfferCardProps {
  offer: LoanOffer;
  userRole: 'borrower' | 'investor';
  onStatusUpdate: (offerId: string, status: string) => Promise<void>;
  onAcceptWithPayment?: (offerId: string, paymentMethod: string, paymentNumber: string) => Promise<void>;
  onDisburse?: (offerId: string) => Promise<void>;
}

const LoanOfferCard: React.FC<LoanOfferCardProps> = ({ 
  offer, 
  userRole, 
  onStatusUpdate, 
  onAcceptWithPayment,
  onDisburse 
}) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentNumber, setPaymentNumber] = useState<string>('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleAcceptOffer = () => {
    setShowPaymentDialog(true);
  };

  const handleRejectOffer = async () => {
    setLoading(true);
    try {
      await onStatusUpdate(offer.id, 'rejected');
      toast({
        title: "Offer Rejected",
        description: "The loan offer has been rejected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject the offer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPaymentDetails = async () => {
    if (!paymentMethod || !paymentNumber) {
      toast({
        title: "Error",
        description: "Please provide payment method and number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (onAcceptWithPayment) {
        await onAcceptWithPayment(offer.id, paymentMethod, paymentNumber);
        toast({
          title: "Payment Details Submitted",
          description: "Your payment details have been sent to the investor.",
        });
        setShowPaymentDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit payment details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async () => {
    setLoading(true);
    try {
      if (onDisburse) {
        await onDisburse(offer.id);
        toast({
          title: "Loan Disbursed",
          description: "The loan has been successfully disbursed to the borrower.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disburse the loan.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Loan Offer
              </CardTitle>
              <CardDescription>
                {userRole === 'borrower' ? 'Offer from investor' : 'Your offer to borrower'}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(offer.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(offer.status)}
                {offer.status}
              </div>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Offered Amount</Label>
              <CurrencyDisplay 
                amount={offer.offered_amount * 130} 
                className="text-lg font-semibold"
                showToggle={false}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Interest Rate</Label>
              <p className="text-lg font-semibold">{offer.offered_interest_rate}%</p>
            </div>
          </div>

          {offer.message && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Message</Label>
              <p className="text-sm bg-gray-50 p-3 rounded-md">{offer.message}</p>
            </div>
          )}

          {offer.payment_method && offer.payment_number && (
            <div className="bg-blue-50 p-3 rounded-md">
              <Label className="text-sm font-medium text-blue-800">Payment Details Provided</Label>
              <p className="text-sm text-blue-700">
                {offer.payment_method}: {offer.payment_number}
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Created: {format(new Date(offer.created_at), 'MMM d, yyyy h:mm a')}
          </div>

          {/* Action buttons based on user role and offer status */}
          <div className="flex gap-2 pt-2">
            {userRole === 'borrower' && offer.status === 'pending' && (
              <>
                <Button onClick={handleAcceptOffer} className="flex-1">
                  Accept Offer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRejectOffer}
                  disabled={loading}
                  className="flex-1"
                >
                  Reject
                </Button>
              </>
            )}
            
            {userRole === 'investor' && offer.status === 'accepted' && offer.payment_method && (
              <Button onClick={handleDisburse} disabled={loading} className="w-full">
                Send Money to Borrower
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Payment Details</DialogTitle>
            <DialogDescription>
              Please provide your payment details so the investor can send you the loan amount.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="paymentNumber">
                {paymentMethod === 'mpesa' ? 'M-Pesa Number' : 
                 paymentMethod === 'bank' ? 'Bank Account Number' : 'Payment Number'}
              </Label>
              <Input
                id="paymentNumber"
                placeholder={
                  paymentMethod === 'mpesa' ? '+254 7XX XXX XXX' :
                  paymentMethod === 'bank' ? 'Account number' : 'Payment number'
                }
                value={paymentNumber}
                onChange={(e) => setPaymentNumber(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPaymentDetails} disabled={loading}>
              Submit Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoanOfferCard;