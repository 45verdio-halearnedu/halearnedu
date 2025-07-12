
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from '@/hooks/useWallet';
import { useToast } from "@/hooks/use-toast";
import WalletActions from './WalletActions';
import CurrencyDisplay from './CurrencyDisplay';
import { format } from 'date-fns';

const Wallet: React.FC = () => {
  const { wallet, transactions, loading, connectWallet } = useWallet();
  const { toast } = useToast();

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading wallet...</div>
      </div>
    );
  }

  // Convert USD amounts to KES for display
  const balanceInKES = (wallet?.balance || 0) * 130; // Approximate conversion
  const collateralInKES = (wallet?.locked_collateral || 0) * 130;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <WalletActions />
      </div>

      {/* Wallet Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={balanceInKES} showToggle={false} />
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for investment or loan applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Collateral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={collateralInKES} showToggle={false} />
            </div>
            <p className="text-xs text-muted-foreground">
              Collateral for active loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallet?.is_connected ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-xs text-muted-foreground">
              {wallet?.wallet_address ? `${wallet.wallet_address.slice(0, 6)}...${wallet.wallet_address.slice(-4)}` : 'No wallet connected'}
            </p>
            {!wallet?.is_connected && (
              <Button 
                onClick={handleConnectWallet}
                className="mt-2"
                size="sm"
              >
                Connect Wallet
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Recent wallet transactions and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{transaction.type}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.description || 'No description'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(transaction.created_at), 'PPp')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}
                      <CurrencyDisplay 
                        amount={Math.abs(transaction.amount) * 130} 
                        showToggle={false} 
                      />
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
