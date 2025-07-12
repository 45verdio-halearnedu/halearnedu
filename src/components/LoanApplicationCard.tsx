
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoanApplication } from '@/hooks/useLoans';

interface LoanApplicationCardProps {
  application: LoanApplication;
}

const LoanApplicationCard: React.FC<LoanApplicationCardProps> = ({ application }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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
            <CardTitle>Loan Application #{application.id.slice(0, 8)}</CardTitle>
            <CardDescription>Submitted on {new Date(application.created_at).toLocaleDateString()}</CardDescription>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(application.status)}`}>
            {application.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Amount</p>
            <p className="font-medium">{application.amount} USDC</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
            <p className="font-medium">{application.interest_rate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Duration</p>
            <p className="font-medium">{application.duration_months} months</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Funding</p>
            <p className="font-medium">{application.funding_progress ?? 0}%</p>
          </div>
        </div>
        {application.purpose && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Purpose</p>
            <p className="text-sm font-medium">{application.purpose}</p>
          </div>
        )}
        {application.status === 'rejected' && application.rejection_reason && (
          <div className="my-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <p className="text-sm font-semibold">Rejection Reason</p>
            <p className="text-sm">{application.rejection_reason}</p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Funding Progress</span>
              <span className="text-sm font-medium">{application.funding_progress ?? 0}%</span>
            </div>
            <Progress value={application.funding_progress ?? 0} className="h-2" />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">View Details</Button>
            {application.status === 'pending' && (
              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanApplicationCard;
