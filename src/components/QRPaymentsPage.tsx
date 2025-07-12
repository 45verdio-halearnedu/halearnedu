
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Scan, Download, Share } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const QRPaymentsPage: React.FC = () => {
  const { toast } = useToast();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [description, setDescription] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);

  const generateQRCode = () => {
    if (!paymentAmount) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }

    // Simulate QR code generation
    const qrData = {
      amount: parseFloat(paymentAmount),
      description: description || 'Payment request',
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };

    setQrCode(`data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="none" stroke="black" stroke-width="2"/>
        <text x="100" y="110" text-anchor="middle" font-size="12" fill="black">QR Code</text>
        <text x="100" y="125" text-anchor="middle" font-size="10" fill="black">KES ${qrData.amount}</text>
        <text x="100" y="140" text-anchor="middle" font-size="8" fill="gray">${qrData.id}</text>
      </svg>
    `)}`);

    toast({
      title: "QR Code Generated",
      description: `Payment request for KES ${paymentAmount} created`,
    });
  };

  const scanQR = () => {
    // Simulate QR scanning
    toast({
      title: "QR Scanner",
      description: "Camera access would be requested in a real implementation",
    });
  };

  const shareQR = () => {
    if (navigator.share && qrCode) {
      navigator.share({
        title: 'Payment Request',
        text: `Payment request for KES ${paymentAmount}`,
        url: qrCode
      });
    } else {
      toast({
        title: "QR Code Copied",
        description: "QR code link copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">QR Payments</h1>
        <Button onClick={scanQR} variant="outline" className="flex items-center gap-2">
          <Scan className="h-4 w-4" />
          Scan QR
        </Button>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate QR</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Create Payment Request
                </CardTitle>
                <CardDescription>
                  Generate a QR code for others to pay you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (KES)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this payment for?"
                  />
                </div>
                <Button onClick={generateQRCode} className="w-full">
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your QR Code</CardTitle>
                <CardDescription>
                  Share this QR code to receive payments
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {qrCode ? (
                  <>
                    <div className="flex justify-center">
                      <img src={qrCode} alt="Payment QR Code" className="border rounded-lg" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={shareQR}>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-12">
                    <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Generate a QR code to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent QR Payments</CardTitle>
              <CardDescription>
                Your recent QR payment activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: '1', amount: 2500, description: 'Lunch payment', date: '2024-01-10', status: 'completed' },
                  { id: '2', amount: 1200, description: 'Coffee', date: '2024-01-09', status: 'pending' },
                  { id: '3', amount: 5000, description: 'Group payment', date: '2024-01-08', status: 'completed' }
                ].map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">KES {payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{payment.description}</p>
                      <p className="text-xs text-gray-400">{payment.date}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QRPaymentsPage;
