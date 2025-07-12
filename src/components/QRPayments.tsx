
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { QrCode, Camera, Scan, Send, Receipt } from "lucide-react";

const QRPayments: React.FC = () => {
  const { wallet, fetchWalletData } = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState({
    amount: '',
    description: '',
    recipientId: ''
  });
  const [qrData, setQrData] = useState('');
  const [scannedData, setScannedData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate QR code data for receiving payments
  const generateQRCode = () => {
    if (!paymentData.amount) {
      toast({
        title: "Error",
        description: "Please enter an amount to generate QR code",
        variant: "destructive",
      });
      return;
    }

    const qrPayload = {
      type: 'payment_request',
      userId: user?.id,
      amount: parseFloat(paymentData.amount),
      description: paymentData.description,
      timestamp: new Date().toISOString()
    };

    setQrData(JSON.stringify(qrPayload));
    toast({
      title: "QR Code Generated",
      description: "Share this QR code to receive payment",
    });
  };

  // Simulate QR code scanning
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would use a QR code reader library
      // For demo purposes, we'll simulate reading QR data
      const simulatedQRData = {
        type: 'payment_request',
        userId: 'demo-user-123',
        amount: 25.50,
        description: 'Coffee and pastry',
        timestamp: new Date().toISOString()
      };
      
      setScannedData(JSON.stringify(simulatedQRData));
      toast({
        title: "QR Code Scanned",
        description: "Payment details extracted from QR code",
      });
    }
  };

  const processScannedPayment = async () => {
    try {
      const paymentDetails = JSON.parse(scannedData);
      
      if (paymentDetails.amount > (wallet?.balance || 0)) {
        toast({
          title: "Insufficient Funds",
          description: "You don't have enough balance for this payment",
          variant: "destructive",
        });
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Payment Successful",
        description: `${paymentDetails.amount} USDC sent successfully`,
      });
      
      setScannedData('');
      await fetchWalletData();
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "Could not process the scanned QR code",
        variant: "destructive",
      });
    }
  };

  const sendQuickPayment = async (amount: number) => {
    if (!paymentData.recipientId) {
      toast({
        title: "Error",
        description: "Please enter recipient phone number or ID",
        variant: "destructive",
      });
      return;
    }

    if (amount > (wallet?.balance || 0)) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this payment",
        variant: "destructive",
      });
      return;
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Payment Sent",
      description: `${amount} USDC sent to ${paymentData.recipientId}`,
    });
    
    setPaymentData(prev => ({ ...prev, recipientId: '' }));
    await fetchWalletData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">QR Payments</h1>
        <div className="text-sm text-gray-500">
          Balance: {wallet?.balance || 0} USDC
        </div>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate QR</TabsTrigger>
          <TabsTrigger value="scan">Scan & Pay</TabsTrigger>
          <TabsTrigger value="quick">Quick Send</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Generate Payment QR Code
              </CardTitle>
              <CardDescription>
                Create a QR code for others to scan and pay you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount (USDC)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label>Description (Optional)</Label>
                  <Input
                    value={paymentData.description}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What's this for?"
                  />
                </div>
              </div>
              
              <Button onClick={generateQRCode} className="w-full">
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
              </Button>

              {qrData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-gray-400" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      QR Code for {paymentData.amount} USDC
                    </p>
                    <p className="text-xs text-gray-500">
                      {paymentData.description}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Scan QR Code to Pay
              </CardTitle>
              <CardDescription>
                Upload or scan a QR code to make a payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-24 flex-col"
                >
                  <Camera className="h-8 w-8 mb-2" />
                  Upload QR Image
                </Button>
                
                <Button 
                  variant="outline"
                  className="h-24 flex-col"
                  onClick={() => {
                    // Simulate camera scanning
                    const simulatedQRData = {
                      type: 'payment_request',
                      userId: 'demo-merchant-456',
                      amount: 15.75,
                      description: 'Restaurant bill',
                      timestamp: new Date().toISOString()
                    };
                    setScannedData(JSON.stringify(simulatedQRData));
                  }}
                >
                  <Scan className="h-8 w-8 mb-2" />
                  Camera Scan
                </Button>
              </div>

              {scannedData && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Payment Details</h4>
                  {(() => {
                    try {
                      const details = JSON.parse(scannedData);
                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span className="font-medium">{details.amount} USDC</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Description:</span>
                            <span>{details.description || 'No description'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recipient:</span>
                            <span>{details.userId}</span>
                          </div>
                          <Button onClick={processScannedPayment} className="w-full mt-3">
                            <Send className="mr-2 h-4 w-4" />
                            Confirm Payment
                          </Button>
                        </div>
                      );
                    } catch {
                      return <p className="text-red-600">Invalid QR code data</p>;
                    }
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Quick Send Money
              </CardTitle>
              <CardDescription>
                Send money quickly using phone number or user ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Phone Number or User ID</Label>
                <Input
                  value={paymentData.recipientId}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, recipientId: e.target.value }))}
                  placeholder="+254 700 000 000 or user@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => sendQuickPayment(10)}
                  variant="outline"
                  className="h-16 flex-col"
                >
                  <div className="text-lg font-bold">$10</div>
                  <div className="text-xs">Quick Send</div>
                </Button>
                
                <Button 
                  onClick={() => sendQuickPayment(25)}
                  variant="outline"
                  className="h-16 flex-col"
                >
                  <div className="text-lg font-bold">$25</div>
                  <div className="text-xs">Quick Send</div>
                </Button>
                
                <Button 
                  onClick={() => sendQuickPayment(50)}
                  variant="outline"
                  className="h-16 flex-col"
                >
                  <div className="text-lg font-bold">$50</div>
                  <div className="text-xs">Quick Send</div>
                </Button>
                
                <Button 
                  onClick={() => sendQuickPayment(100)}
                  variant="outline"
                  className="h-16 flex-col"
                >
                  <div className="text-lg font-bold">$100</div>
                  <div className="text-xs">Quick Send</div>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Label>Custom Amount</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter custom amount"
                  />
                  <Button 
                    onClick={() => paymentData.amount && sendQuickPayment(parseFloat(paymentData.amount))}
                    disabled={!paymentData.amount}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QRPayments;
