
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLoans } from '@/hooks/useLoans';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useLoanOffers } from '@/hooks/useLoanOffers';
import LoanOfferDialog from './LoanOfferDialog';
import CurrencyDisplay from './CurrencyDisplay';
import { format } from 'date-fns';
import { Filter, Search, RefreshCw } from 'lucide-react';

const InvestorLoanView: React.FC = () => {
  const { marketplaceLoans, loading, refetch } = useLoans();
  const { profile, canLend } = useUserProfile();
  const { offers } = useLoanOffers();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [filterAmount, setFilterAmount] = useState('all');

  if (!profile || !canLend()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            You need an investor or lender profile to view loan opportunities.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading loan applications...</span>
      </div>
    );
  }

  const getTitle = () => {
    if (profile.profile_type === 'lender') {
      return 'Lending Opportunities';
    }
    return 'Investment Opportunities';
  };

  const getDescription = () => {
    if (profile.profile_type === 'lender') {
      return 'Browse loan applications from borrowers seeking direct lending';
    }
    return 'Browse loan applications from borrowers seeking funding';
  };

  // Convert USD amounts to KES for display
  const convertToKES = (usdAmount: number) => usdAmount * 130;

  // Filter and sort loans
  const filteredLoans = marketplaceLoans
    .filter(loan => {
      if (searchTerm && !loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterAmount !== 'all') {
        const amount = loan.amount;
        switch (filterAmount) {
          case 'small':
            return amount <= 5000;
          case 'medium':
            return amount > 5000 && amount <= 20000;
          case 'large':
            return amount > 20000;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'interest_rate':
          return b.interest_rate - a.interest_rate;
        case 'duration':
          return a.duration_months - b.duration_months;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Calculate user's active offers
  const myOffers = offers.filter(offer => offer.investor_id === profile.user_id);
  const totalOffered = myOffers.reduce((sum, offer) => sum + offer.offered_amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary for Investors/Lenders */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLoans.length}</div>
            <p className="text-xs text-gray-600">Loan applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">My Active Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myOffers.length}</div>
            <p className="text-xs text-gray-600">Pending offers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay 
                amount={convertToKES(totalOffered)} 
                showToggle={false}
              />
            </div>
            <p className="text-xs text-gray-600">Across all offers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.success_rate || 0}%</div>
            <p className="text-xs text-gray-600">Successful investments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {getTitle()}
              </CardTitle>
              <CardDescription>
                {getDescription()}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="interest_rate">Interest Rate</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAmount} onValueChange={setFilterAmount}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Amounts</SelectItem>
                <SelectItem value="small">≤ $5,000</SelectItem>
                <SelectItem value="medium">$5,001 - $20,000</SelectItem>
                <SelectItem value="large">&gt; $20,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loan Applications Grid */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-12">
              {searchTerm || filterAmount !== 'all' ? (
                <div>
                  <p className="text-gray-500 mb-2">No loan applications match your filters.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterAmount('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500">No loan applications available for {profile.profile_type === 'lender' ? 'lending' : 'investment'}.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Borrowers need to submit loan applications for them to appear here.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLoans.map((application) => {
                const hasExistingOffer = myOffers.some(offer => offer.loan_application_id === application.id);
                
                return (
                  <div key={application.id} className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="mb-2">
                          <CurrencyDisplay amount={convertToKES(application.amount)} showToggle={false} />
                        </div>
                        <p className="text-sm text-gray-500">
                          {application.duration_months} months @ {application.interest_rate}%
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {application.status}
                        </Badge>
                        {hasExistingOffer && (
                          <Badge variant="outline" className="text-xs">
                            Offer Made
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      {application.purpose && (
                        <div>
                          <span className="font-medium text-gray-700">Purpose:</span>
                          <p className="text-gray-600 mt-1">{application.purpose}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        {application.monthly_payment && (
                          <div>
                            <span className="text-gray-500 text-xs">Monthly Payment:</span>
                            <div className="font-medium">
                              <CurrencyDisplay amount={convertToKES(application.monthly_payment)} showToggle={false} />
                            </div>
                          </div>
                        )}
                        
                        {application.total_payment && (
                          <div>
                            <span className="text-gray-500 text-xs">Total Return:</span>
                            <div className="font-medium">
                              <CurrencyDisplay amount={convertToKES(application.total_payment)} showToggle={false} />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Funding Progress:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${Math.min(application.funding_progress || 0, 100)}%`}}
                            ></div>
                          </div>
                          <span className="font-medium text-xs">{application.funding_progress || 0}%</span>
                        </div>
                      </div>
                    </div>

                    {application.collateral && (
                      <div className="p-3 bg-gray-50 rounded text-sm">
                        <span className="font-medium text-gray-700">Collateral:</span>
                        <p className="text-gray-600 mt-1">{application.collateral}</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 border-t pt-3">
                      Applied: {format(new Date(application.created_at), 'MMM d, yyyy')}
                    </div>

                    <LoanOfferDialog loanApplication={application}>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={hasExistingOffer}
                      >
                        {hasExistingOffer 
                          ? 'Offer Already Made' 
                          : `Make ${profile.profile_type === 'lender' ? 'Loan' : 'Investment'} Offer`
                        }
                      </Button>
                    </LoanOfferDialog>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorLoanView;
