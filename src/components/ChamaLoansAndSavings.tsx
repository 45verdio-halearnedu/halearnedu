
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, PlusCircle, Calculator, Building2, CreditCard, Target } from 'lucide-react';
import CurrencyDisplay from './CurrencyDisplay';
import { useToast } from "@/hooks/use-toast";

interface ChamaLoansAndSavingsProps {
  chamaData: any;
  isTreasurer: boolean;
  chamaId: string;
}

const ChamaLoansAndSavings: React.FC<ChamaLoansAndSavingsProps> = ({ chamaData, isTreasurer, chamaId }) => {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `${action} feature will be available soon!`,
    });
  };

  // Mock data - in real app this would come from API
  const totalSavingsAcrossGroups = (chamaData.totalContributed || 0) + 15000; // Other groups
  const loanLimit = Math.floor(totalSavingsAcrossGroups * 2.5); // 2.5x savings
  const creditScore = 720;

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={totalSavingsAcrossGroups}
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loan Limit</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CurrencyDisplay 
              amount={loanLimit}
              className="text-2xl font-bold"
            />
            <p className="text-xs text-muted-foreground">Based on your savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditScore}</div>
            <p className="text-xs text-muted-foreground">Excellent rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No active loans</p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Breakdown</CardTitle>
          <CardDescription>Your savings across different groups and categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{chamaData.name}</p>
                <p className="text-sm text-muted-foreground">Current group</p>
              </div>
              <div className="text-right">
                <CurrencyDisplay 
                  amount={chamaData.totalContributed || 0}
                  className="font-semibold"
                />
                <div className="w-32 mt-1">
                  <Progress value={65} className="h-2" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Education Savers Group</p>
                <p className="text-sm text-muted-foreground">Other group</p>
              </div>
              <div className="text-right">
                <CurrencyDisplay 
                  amount={15000}
                  className="font-semibold"
                />
                <div className="w-32 mt-1">
                  <Progress value={35} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Eligibility Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Loan Eligibility Calculator
          </CardTitle>
          <CardDescription>See how much you can borrow based on your savings and credit score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Current Eligibility</h4>
                <CurrencyDisplay 
                  amount={loanLimit}
                  className="text-2xl font-bold text-blue-600"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum loan amount you can request
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Savings</span>
                  <CurrencyDisplay amount={totalSavingsAcrossGroups} />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Credit Score Multiplier</span>
                  <span>2.5x</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>Loan Limit</span>
                  <CurrencyDisplay amount={loanLimit} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full"
                onClick={() => handleAction("Calculate Loan")}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Custom Loan
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-2"><strong>Tips to increase your loan limit:</strong></p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Increase your savings contributions</li>
                  <li>Maintain good repayment history</li>
                  <li>Join additional savings groups</li>
                  <li>Improve your credit score</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings History */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Savings History</CardTitle>
          <CardDescription>Track your savings progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <PlusCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Monthly Contribution</p>
                  <p className="text-sm text-muted-foreground">Jan 2024 • {chamaData.name}</p>
                </div>
              </div>
              <div className="text-right">
                <CurrencyDisplay 
                  amount={chamaData.contribution_amount}
                  className="font-semibold text-green-600"
                />
                <Badge variant="outline" className="text-xs">Completed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Education Fund Contribution</p>
                  <p className="text-sm text-muted-foreground">Jan 2024 • Education Savers</p>
                </div>
              </div>
              <div className="text-right">
                <CurrencyDisplay 
                  amount={3000}
                  className="font-semibold text-blue-600"
                />
                <Badge variant="outline" className="text-xs">Completed</Badge>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button 
              variant="outline"
              onClick={() => handleAction("View Full History")}
            >
              View Complete Savings History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Partner Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Partner Financial Services
          </CardTitle>
          <CardDescription>Enhanced services available based on your credit score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">KCB Bank Partnership</p>
                  <Badge variant="outline" className="text-xs">Available</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Access to personal loans up to KES 500,000 at competitive rates
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAction("KCB Partnership")}
              >
                Learn More
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Credit Builder Program</p>
                  <Badge variant="outline" className="text-xs">Eligible</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Improve your credit score with our structured program
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAction("Credit Builder")}
              >
                Join Program
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChamaLoansAndSavings;
