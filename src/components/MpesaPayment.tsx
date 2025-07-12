
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMpesa } from '@/hooks/useMpesa';
import CurrencyDisplay from './CurrencyDisplay';
import { format } from 'date-fns';

interface MpesaPaymentProps {
  amount?: number;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
  accountReference?: string;
  transactionDesc?: string;
}

const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  amount: defaultAmount,
  onSuccess,
  onError,
  accountReference = 'Payment',
  transactionDesc = 'Payment'
}) => {
  const { initiateStkPush, processing, transactions } = useMpesa();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(defaultAmount?.toString() || '');

  const handlePayment = async () => {
    if (!phoneNumber || !amount) {
      onError?.('Please enter phone number and amount');
      return;
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      onError?.('Please enter a valid phone number');
      return;
    }

    // Format phone number to 254 format
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    const transactionId = await initiateStkPush(
      formattedPhone,
      parseFloat(amount),
      accountReference,
      transactionDesc
    );

    if (transactionId) {
      onSuccess?.(transactionId);
    } else {
      onError?.('Failed to initiate payment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Smartphone className="h-5 w-5 text-green-600" />
            </div>
            M-Pesa Payment
          </CardTitle>
          <CardDescription>
            Pay using M-Pesa STK Push. You'll receive a prompt on your phone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0700123456 or 254700123456"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={processing}
            />
            <p className="text-xs text-gray-500">
              Enter your Safaricom number to receive the STK push
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={processing || Boolean(defaultAmount)}
              min="1"
            />
          </div>

          <Button 
            onClick={handlePayment} 
            disabled={processing || !phoneNumber || !amount}
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Initiating Payment...
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-2" />
                Pay KES {amount || '0'}
              </>
            )}
          </Button>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong>
            </p>
            <ol className="text-sm text-blue-700 mt-2 list-decimal list-inside space-y-1">
              <li>Click "Pay" to initiate the payment</li>
              <li>You'll receive an STK push notification on your phone</li>
              <li>Enter your M-Pesa PIN to complete the payment</li>
              <li>You'll receive a confirmation SMS from M-Pesa</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      <CurrencyDisplay amount={transaction.amount} showToggle={false} />
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.phone_number} • {format(new Date(transaction.created_at), 'MMM dd, HH:mm')}
                    </p>
                    {transaction.mpesa_receipt_number && (
                      <p className="text-xs text-gray-400">
                        Receipt: {transaction.mpesa_receipt_number}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MpesaPayment;
