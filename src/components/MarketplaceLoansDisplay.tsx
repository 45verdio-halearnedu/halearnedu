
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanApplication } from '@/hooks/useLoans';
import { format } from 'date-fns';
import CurrencyDisplay from './CurrencyDisplay';

interface MarketplaceLoansDisplayProps {
  marketplaceLoans: LoanApplication[];
  loading: boolean;
}

const MarketplaceLoansDisplay: React.FC<MarketplaceLoansDisplayProps> = ({
  marketplaceLoans,
  loading
}) => {
  // Convert USD amounts to KES for display
  const convertToKES = (usdAmount: number) => usdAmount * 130;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Available Loan Applications</CardTitle>
        <CardDescription>Browse loan applications seeking funding in the marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading marketplace loans...</div>
        ) : marketplaceLoans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No loan applications available in the marketplace.</p>
            <p className="text-sm text-gray-400 mt-2">
              New loan applications will appear here for investors to review.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {marketplaceLoans.map((application) => (
              <div key={application.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="mb-2">
                      <CurrencyDisplay amount={convertToKES(application.amount)} showToggle={false} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {application.duration_months} months @ {application.interest_rate}%
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {application.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {application.purpose && (
                    <div>
                      <span className="font-medium text-gray-700">Purpose:</span>
                      <p className="text-gray-600">{application.purpose}</p>
                    </div>
                  )}
                  
                  {application.monthly_payment && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Monthly Payment:</span>
                      <CurrencyDisplay amount={convertToKES(application.monthly_payment)} showToggle={false} />
                    </div>
                  )}
                  
                  {application.total_payment && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Return:</span>
                      <CurrencyDisplay amount={convertToKES(application.total_payment)} showToggle={false} />
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Funding Progress:</span>
                    <span className="font-medium">{application.funding_progress || 0}%</span>
                  </div>
                </div>

                {application.collateral && (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium text-gray-700">Collateral:</span>
                    <p className="text-gray-600">{application.collateral}</p>
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  Applied: {format(new Date(application.created_at), 'MMM d, yyyy')}
                </div>

                <div className="pt-2 text-xs text-blue-600">
                  Available for investor offers
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketplaceLoansDisplay;
