
import React, { useState } from 'react';
import { useLoans } from '@/hooks/useLoans';
import { useUserProfile } from '@/hooks/useUserProfile';
import InvestorLoanView from './InvestorLoanView';
import LoanApplicationForm from './LoanApplicationForm';
import LoanSummaryCard from './LoanSummaryCard';
import MarketplaceLoansDisplay from './MarketplaceLoansDisplay';
import MonetizationInfo from './MonetizationInfo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import LoanApplicationDialog from './LoanApplicationDialog';

interface LoanMarketplaceProps {
  onSubmitApplication?: () => void;
}

const LoanMarketplace: React.FC<LoanMarketplaceProps> = ({ onSubmitApplication }) => {
  const { marketplaceLoans, loading, refetch } = useLoans();
  const { profile } = useUserProfile();
  const [loanAmount, setLoanAmount] = useState(5000);
  const [duration, setDuration] = useState(12);
  const [interestRate, setInterestRate] = useState(5.2);

  const calculateMonthlyPayment = () => {
    const r = interestRate / 100 / 12;
    const n = duration;
    const p = loanAmount;
    const monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return monthlyPayment.toFixed(2);
  };

  // Calculate marketplace statistics
  const totalLoansAvailable = marketplaceLoans.length;
  const totalAmountAvailable = marketplaceLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const averageInterestRate = marketplaceLoans.length > 0 
    ? (marketplaceLoans.reduce((sum, loan) => sum + loan.interest_rate, 0) / marketplaceLoans.length).toFixed(1)
    : '0';

  // If user is an investor, show the investor view with loan applications
  if (profile?.profile_type === 'investor') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Investment Marketplace</h1>
            <p className="text-gray-600">Discover loan opportunities and grow your portfolio</p>
          </div>
          <Badge variant="default" className="bg-blue-600">
            Investor
          </Badge>
        </div>

        {/* Marketplace Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Loans</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLoansAvailable}</div>
              <p className="text-xs text-muted-foreground">Active applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Available</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmountAvailable.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all loans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Interest Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageInterestRate}%</div>
              <p className="text-xs text-muted-foreground">Expected return</p>
            </CardContent>
          </Card>
        </div>

        <InvestorLoanView />
      </div>
    );
  }

  // For borrowers, show marketplace loans and application form
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loan Marketplace</h1>
          <p className="text-gray-600">Access funding from investors and grow your business</p>
        </div>
        <div className="flex gap-2">
          {profile?.profile_type === 'borrower' && (
            <Badge variant="secondary">
              Borrower
            </Badge>
          )}
          <LoanApplicationDialog>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Apply for Loan
            </Button>
          </LoanApplicationDialog>
        </div>
      </div>

      {/* Marketplace Statistics for Borrowers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lenders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Ready to fund</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funded Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,500</div>
            <p className="text-xs text-muted-foreground">Across 8 loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Applications funded</p>
          </CardContent>
        </Card>
      </div>

      {/* Display available loan opportunities */}
      <MarketplaceLoansDisplay marketplaceLoans={marketplaceLoans} loading={loading} />

      {/* Loan Application Form for Borrowers */}
      {profile?.profile_type === 'borrower' && (
        <div>
          <div className="mb-6">
            <MonetizationInfo />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <LoanApplicationForm onSubmitApplication={() => {
                onSubmitApplication?.();
                refetch(); // Refresh marketplace after submission
              }} />
            </div>
            <div>
              <LoanSummaryCard
                loanAmount={loanAmount}
                interestRate={interestRate}
                duration={duration}
                calculateMonthlyPayment={calculateMonthlyPayment}
              />
            </div>
          </div>
        </div>
      )}

      {/* Call to action for non-borrowers */}
      {!profile?.profile_type && (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Ready to Get Funded?</CardTitle>
            <CardDescription>
              Create your borrower profile to access loans from our network of investors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-blue-600 hover:bg-blue-700" size="lg">
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LoanMarketplace;
