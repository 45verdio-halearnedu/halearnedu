
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, History, Gift } from 'lucide-react';
import CurrencyDisplay from './CurrencyDisplay';
import { useToast } from "@/hooks/use-toast";

interface ChamaWalletProps {
  chamaData: any;
  isTreasurer: boolean;
  chamaId: string;
}

const ChamaWallet: React.FC<ChamaWalletProps> = ({ chamaData, isTreasurer, chamaId }) => {
  const { toast } = useToast();

  const handleWalletAction = (action: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `${action} feature will be available soon!`,
    });
  };

  // Mock wallet balance - in real app this would come from user wallet
  const walletBalance = 5000;
  const legacyPoints = 150;

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              My Wallet Balance
            </CardTitle>
            <CardDescription>Your personal wallet for transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={walletBalance}
              className="text-4xl font-bold mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleWalletAction("Top Up Wallet")}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Top Up via M-Pesa
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleWalletAction("Withdraw Funds")}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Legacy Points
            </CardTitle>
            <CardDescription>Redeemable reward points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{legacyPoints}</div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => handleWalletAction("Redeem Points")}
            >
              Redeem for Credit
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common wallet operations</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => handleWalletAction("Send Money")}
          >
            <ArrowUpRight className="h-6 w-6 mb-2" />
            Send Money
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => handleWalletAction("Request Money")}
          >
            <ArrowDownLeft className="h-6 w-6 mb-2" />
            Request Money
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => handleWalletAction("Pay Bills")}
          >
            <PlusCircle className="h-6 w-6 mb-2" />
            Pay Bills
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => handleWalletAction("Buy Airtime")}
          >
            <Wallet className="h-6 w-6 mb-2" />
            Buy Airtime
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>Your recent wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <ArrowDownLeft className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">M-Pesa Top Up</p>
                  <p className="text-sm text-muted-foreground">Jan 15, 2024 • 2:30 PM</p>
                </div>
              </div>
              <div className="text-right">
                <CurrencyDisplay 
                  amount={2000}
                  className="font-semibold text-green-600"
                />
                <Badge variant="outline" className="text-xs">
                  Completed
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <PlusCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Chama Contribution</p>
                  <p className="text-sm text-muted-foreground">Jan 10, 2024 • 10:15 AM</p>
                </div>
              </div>
              <div className="text-right">
                <CurrencyDisplay 
                  amount={-5000}
                  className="font-semibold text-red-600"
                />
                <Badge variant="outline" className="text-xs">
                  Completed
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Gift className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Points Redemption</p>
                  <p className="text-sm text-muted-foreground">Jan 5, 2024 • 3:45 PM</p>
                </div>
              </div>
              <div className="text-right">
                <CurrencyDisplay 
                  amount={500}
                  className="font-semibold text-green-600"
                />
                <Badge variant="outline" className="text-xs">
                  Completed
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => handleWalletAction("View All Transactions")}
            >
              View All Transactions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* M-Pesa Integration */}
      <Card>
        <CardHeader>
          <CardTitle>M-Pesa Integration</CardTitle>
          <CardDescription>Connect your M-Pesa account for seamless transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">M-Pesa Account</p>
                <p className="text-sm text-muted-foreground">+254 7XX XXX XXX</p>
              </div>
            </div>
            <Badge variant="default">Connected</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChamaWallet;
