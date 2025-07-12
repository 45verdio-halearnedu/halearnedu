
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanApplication } from '@/hooks/useLoans';

interface ActiveLoanCardProps {
  loan: LoanApplication;
}

const ActiveLoanCard: React.FC<ActiveLoanCardProps> = ({ loan }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-0 shadow-sm hover-scale">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Loan #{loan.id.slice(0, 8)}</CardTitle>
            <CardDescription>Active since {loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString() : new Date(loan.created_at).toLocaleDateString()}</CardDescription>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(loan.status)}`}>
            Active
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Principal Amount</p>
            <p className="font-medium">{loan.amount} USDC</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Monthly Payment</p>
            <p className="font-medium">{loan.monthly_payment ? `${loan.monthly_payment} USDC` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Duration</p>
            <p className="font-medium">{loan.duration_months} months</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Next Payment Due</p>
            <p className="font-medium">
              {loan.next_payment_due ? new Date(loan.next_payment_due).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveLoanCard;
