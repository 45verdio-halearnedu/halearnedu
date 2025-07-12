import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useLoanOffers } from '@/hooks/useLoanOffers';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import CurrencyDisplay from './CurrencyDisplay';
import { Eye, MessageSquare, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

interface LoanOfferStatusProps {
  loanApplicationId: string;
}

const LoanOfferStatus: React.FC<LoanOfferStatusProps> = ({ loanApplicationId }) => {
  const { offers, updateOfferStatus, acceptOfferWithPayment } = useLoanOffers();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentNumber, setPaymentNumber] = useState<string>('');

  const applicationOffers = offers.filter(offer => offer.loan_application_id === loanApplicationId);

  const handleAcceptOffer = (offerId: string) => {
    setShowPaymentDialog(offerId);
  };

  const handleSubmitPaymentDetails = async (offerId: string) => {
    if (!paymentMethod || !paymentNumber) {
      toast({
        title: "Error",
        description: "Please provide payment method and number.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(offerId);
    try {
      await acceptOfferWithPayment(offerId, paymentMethod, paymentNumber);
      toast({
        title: "Payment Details Submitted",
        description: "Your payment details have been sent to the investor. They can now disburse the loan.",
      });
      setShowPaymentDialog(null);
      setPaymentMethod('');
      setPaymentNumber('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit payment details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    setActionLoading(offerId);
    try {
      await updateOfferStatus(offerId, 'rejected');
      toast({
        title: "Offer Rejected",
        description: "The loan offer has been rejected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisburse = async (offerId: string) => {
    setActionLoading(offerId);
    try {
      // Here you would implement the actual disbursement logic
      // For now, we'll just update the status
      await updateOfferStatus(offerId, 'disbursed');
      toast({
        title: "Loan Disbursed",
        description: "The loan has been successfully disbursed to the borrower.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disburse loan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Convert USD amounts to KES for display
  const convertToKES = (usdAmount: number) => usdAmount * 130;

  // Categorize offers
  const pendingOffers = applicationOffers.filter(offer => offer.status === 'pending');
  const acceptedOffers = applicationOffers.filter(offer => offer.status === 'accepted');
  const disbursedOffers = applicationOffers.filter(offer => offer.status === 'disbursed');
  const rejectedOffers = applicationOffers.filter(offer => offer.status === 'rejected');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disbursed':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disbursed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const isInvestor = (offer: any) => offer.investor_id === user?.id;

  if (applicationOffers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Loan Offers
          </CardTitle>
          <CardDescription>No offers received yet for this application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Waiting for investors to make offers...</p>
            <p className="text-sm mt-1">You'll be notified when offers come in</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Loan Offers ({applicationOffers.length})
            </div>
            <div className="flex gap-2">
              {pendingOffers.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {pendingOffers.length} Pending
                </Badge>
              )}
              {acceptedOffers.length > 0 && (
                <Badge className="text-xs bg-green-600">
                  {acceptedOffers.length} Accepted
                </Badge>
              )}
              {disbursedOffers.length > 0 && (
                <Badge className="text-xs bg-blue-600">
                  {disbursedOffers.length} Disbursed
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>Review and manage offers from investors and lenders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pending Offers First */}
          {pendingOffers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pending Offers ({pendingOffers.length})
              </h4>
              {pendingOffers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-4 space-y-3 bg-yellow-50 border-yellow-200">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <CurrencyDisplay amount={convertToKES(offer.offered_amount)} />
                        <Badge className={`text-xs ${getStatusColor(offer.status)}`}>
                          {getStatusIcon(offer.status)}
                          <span className="ml-1">{offer.status}</span>
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Interest Rate:</span>
                          <p className="font-medium">{offer.offered_interest_rate}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Offered:</span>
                          <p className="font-medium">{format(new Date(offer.created_at), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    </div>
                    
                    {!isInvestor(offer) && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={actionLoading === offer.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === offer.id ? 'Processing...' : 'Accept & Add Payment'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectOffer(offer.id)}
                          disabled={actionLoading === offer.id}
                        >
                          {actionLoading === offer.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {offer.message && (
                    <div className="p-3 bg-white rounded text-sm border-l-4 border-blue-500">
                      <p className="font-medium text-gray-700">Message from {isInvestor(offer) ? 'you' : 'lender'}:</p>
                      <p className="mt-1">{offer.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Accepted Offers - Payment Details Provided */}
          {acceptedOffers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Accepted Offers - Ready for Disbursement ({acceptedOffers.length})
              </h4>
              {acceptedOffers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-4 space-y-3 bg-green-50 border-green-200">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CurrencyDisplay amount={convertToKES(offer.offered_amount)} />
                        <Badge className={`text-xs ${getStatusColor(offer.status)}`}>
                          {getStatusIcon(offer.status)}
                          <span className="ml-1">{offer.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Interest Rate: {offer.offered_interest_rate}%
                      </p>
                      
                      {offer.payment_method && offer.payment_number && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-sm font-medium text-blue-800">Payment Details Provided:</p>
                          <p className="text-sm text-blue-700">
                            {offer.payment_method}: {offer.payment_number}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {isInvestor(offer) && offer.payment_method && (
                      <Button
                        size="sm"
                        onClick={() => handleDisburse(offer.id)}
                        disabled={actionLoading === offer.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {actionLoading === offer.id ? 'Disbursing...' : 'Send Money'}
                      </Button>
                    )}
                  </div>
                  
                  {offer.message && (
                    <div className="p-3 bg-white rounded text-sm">
                      <p className="font-medium text-gray-700">Message from {isInvestor(offer) ? 'you' : 'lender'}:</p>
                      <p className="mt-1">{offer.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Disbursed Offers - Active Loans */}
          {disbursedOffers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Active Loans ({disbursedOffers.length})
              </h4>
              {disbursedOffers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-4 space-y-3 bg-blue-50 border-blue-200">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CurrencyDisplay amount={convertToKES(offer.offered_amount)} />
                        <Badge className={`text-xs ${getStatusColor(offer.status)}`}>
                          {getStatusIcon(offer.status)}
                          <span className="ml-1">Loan Active</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Interest Rate: {offer.offered_interest_rate}% • 
                        {isInvestor(offer) ? ' Earning returns' : ' Start repayments'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rejected Offers */}
          {rejectedOffers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Rejected Offers ({rejectedOffers.length})
              </h4>
              {rejectedOffers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-4 space-y-3 bg-gray-50 border-gray-200 opacity-75">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CurrencyDisplay amount={convertToKES(offer.offered_amount)} />
                        <Badge className={`text-xs ${getStatusColor(offer.status)}`}>
                          {getStatusIcon(offer.status)}
                          <span className="ml-1">{offer.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Interest Rate: {offer.offered_interest_rate}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={!!showPaymentDialog} onOpenChange={() => setShowPaymentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Details</DialogTitle>
            <DialogDescription>
              Provide your payment details so the investor can send you the loan amount.
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
            <Button variant="outline" onClick={() => setShowPaymentDialog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => showPaymentDialog && handleSubmitPaymentDetails(showPaymentDialog)} 
              disabled={!paymentMethod || !paymentNumber || !!actionLoading}
            >
              {actionLoading ? 'Submitting...' : 'Submit Payment Details'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoanOfferStatus;