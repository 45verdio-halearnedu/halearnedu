
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Pencil, List } from "lucide-react";
import { useLoans } from '@/hooks/useLoans';
import { useSearchParams } from 'react-router-dom';
import LoanCalculator from './LoanCalculator';
import LoanPolicies from './LoanPolicies';
import LoanApplicationCard from './LoanApplicationCard';
import ActiveLoanCard from './ActiveLoanCard';
import LoanApplicationDialog from './LoanApplicationDialog';
import LoanOfferStatus from './LoanOfferStatus';

const MyLoans: React.FC = () => {
  const { userApplications, loading } = useLoans();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get('tab') || 'applications';
  const activeSubTab = searchParams.get('subtab') || 'all';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value, subtab: 'all' });
  };
  
  const handleSubTabChange = (value: string) => {
    setSearchParams({ tab: activeTab, subtab: value });
  };

  const activeLoans = userApplications.filter(app => app.status === 'active');
  const pendingLoans = userApplications.filter(app => app.status === 'pending');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Loan Center</h1>
        </div>
        <div className="text-center py-12">Loading your loan information...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Loan Center</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applications">
            <FileText className="mr-2 h-4 w-4" /> My Applications
          </TabsTrigger>
          <TabsTrigger value="calculator">
            <Pencil className="mr-2 h-4 w-4" /> Loan Calculator
          </TabsTrigger>
          <TabsTrigger value="policies">
            <List className="mr-2 h-4 w-4" /> Policies & FAQ
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications" className="pt-4 animate-fade-in">
          <Tabs value={activeSubTab} onValueChange={handleSubTabChange} className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
              <TabsTrigger value="all">All Loans</TabsTrigger>
              <TabsTrigger value="active">Active ({activeLoans.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingLoans.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="pt-4">
              {userApplications.length > 0 ? (
                <div className="grid gap-4">
                  {userApplications.map((app) => (
                    <div key={app.id} className="space-y-4">
                      {app.status === 'active' 
                        ? <ActiveLoanCard loan={app} />
                        : <LoanApplicationCard application={app} />
                      }
                      {/* Show loan offers for each application */}
                      <LoanOfferStatus loanApplicationId={app.id} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">No Loan History</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't applied for any loans yet.</p>
                  <LoanApplicationDialog>
                    <Button variant="default" className="bg-loan-primary hover:bg-blue-600">
                      Apply for a Loan
                    </Button>
                  </LoanApplicationDialog>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active" className="pt-4">
              {activeLoans.length > 0 ? (
                <div className="grid gap-4">
                  {activeLoans.map((loan) => (
                    <div key={loan.id} className="space-y-4">
                      <ActiveLoanCard loan={loan} />
                      <LoanOfferStatus loanApplicationId={loan.id} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                  <h3 className="font-medium text-lg mb-2">No Active Loans</h3>
                  <p className="text-gray-500 dark:text-gray-400">You don't have any active loans at the moment.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="pt-4">
              {pendingLoans.length > 0 ? (
                <div className="grid gap-4">
                  {pendingLoans.map((loan) => (
                    <div key={loan.id} className="space-y-4">
                      <LoanApplicationCard application={loan} />
                      <LoanOfferStatus loanApplicationId={loan.id} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                  <h3 className="font-medium text-lg mb-2">No Pending Loans</h3>
                  <p className="text-gray-500 dark:text-gray-400">You don't have any pending loan requests.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="calculator" className="pt-4 animate-fade-in">
          <LoanCalculator />
        </TabsContent>
        
        <TabsContent value="policies" className="pt-4 animate-fade-in">
          <LoanPolicies />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyLoans;
