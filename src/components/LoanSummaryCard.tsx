
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LoanSummaryCardProps {
  loanAmount: number;
  interestRate: number;
  duration: number;
  calculateMonthlyPayment: () => string;
}

const LoanSummaryCard: React.FC<LoanSummaryCardProps> = ({
  loanAmount,
  interestRate,
  duration,
  calculateMonthlyPayment
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Loan Summary</CardTitle>
        <CardDescription>Estimated costs and payment schedule</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-b pb-4 pt-2">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Loan Amount:</span>
            <span className="font-medium">{loanAmount} USDC</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Interest Rate:</span>
            <span className="font-medium">{interestRate}%</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Duration:</span>
            <span className="font-medium">{duration} months</span>
          </div>
        </div>
        
        <div className="border-b pb-4">
          <div className="flex justify-between mb-2 font-medium">
            <span className="text-gray-500">Monthly Payment:</span>
            <span>{calculateMonthlyPayment()} USDC</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Total Interest:</span>
            <span>{(parseFloat(calculateMonthlyPayment()) * duration - loanAmount).toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Total Payment:</span>
            <span>{(parseFloat(calculateMonthlyPayment()) * duration).toFixed(2)} USDC</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Application Timeline:</h4>
          <ol className="space-y-3 text-sm">
            <li className="flex">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">1</div>
              <p className="text-gray-500">Application submitted</p>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs mr-2">2</div>
              <p className="text-gray-500">Investors review request</p>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs mr-2">3</div>
              <p className="text-gray-500">Funding transferred to wallet</p>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs mr-2">4</div>
              <p className="text-gray-500">Repayments begin according to schedule</p>
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanSummaryCard;
