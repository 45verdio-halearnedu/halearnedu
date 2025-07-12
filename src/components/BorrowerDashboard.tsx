
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoans } from '@/hooks/useLoans';
import { useUserProfile } from '@/hooks/useUserProfile';
import LoanOfferStatus from './LoanOfferStatus';
import CurrencyDisplay from './CurrencyDisplay';
import { format } from 'date-fns';

const BorrowerDashboard: React.FC = () => {
  const { userApplications, loading } = useLoans();
  const { profile } = useUserProfile();

  if (!profile || profile.profile_type !== 'borrower') {
    return null;
  }

  if (loading) {
    return <div className="text-center py-4">Loading your loan applications...</div>;
  }

  const pendingApplications = userApplications.filter(app => app.status === 'pending');
  const approvedApplications = userApplications.filter(app => app.status === 'approved');
  const fundedApplications = userApplications.filter(app => app.status === 'funded');

  // Convert USD amounts to KES for display (approximate conversion rate)
  const convertToKES = (usdAmount: number) => usdAmount * 130;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Borrower Dashboard</h2>
        <p className="text-gray-600">Manage your loan applications and track funding status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingApplications.length}</div>
            <p className="text-sm text-gray-600">Waiting for offers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fundedApplications.length}</div>
            <p className="text-sm text-gray-600">Currently funded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay 
                amount={convertToKES(profile.total_borrowed || 0)} 
                showToggle={false}
              />
            </div>
            <p className="text-sm text-gray-600">Lifetime borrowing</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Your Loan Applications</CardTitle>
          <CardDescription>Track the status of your loan requests</CardDescription>
        </CardHeader>
        <CardContent>
          {userApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No loan applications yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Go to the Marketplace to apply for your first loan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CurrencyDisplay amount={convertToKES(application.amount)} />
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          application.status === 'funded' ? 'bg-green-100 text-green-800' :
                          application.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Duration:</span> {application.duration_months} months</p>
                        <p><span className="font-medium">Interest Rate:</span> {application.interest_rate}%</p>
                        {application.monthly_payment && (
                          <p><span className="font-medium">Monthly Payment:</span> 
                            <CurrencyDisplay amount={convertToKES(application.monthly_payment)} showToggle={false} />
                          </p>
                        )}
                        <p><span className="font-medium">Funding Progress:</span> {application.funding_progress}%</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Applied: {format(new Date(application.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>

                  {/* Show offers for this application */}
                  <LoanOfferStatus loanApplicationId={application.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BorrowerDashboard;
