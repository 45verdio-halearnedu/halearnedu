
import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import CreateProfileDialog from './CreateProfileDialog';
import InvestorLoanView from './InvestorLoanView';
import BorrowerDashboard from './BorrowerDashboard';
import DatabaseHealthCheck from './DatabaseHealthCheck';
import TransactionAnalytics from './TransactionAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL params or default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-4">Please log in to access the dashboard.</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to LendChain!</h2>
        <p className="text-gray-600 mb-6">
          To get started, please create your profile and choose your role on the platform.
        </p>
        <CreateProfileDialog />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile.display_name || user.email}!
        </h1>
        <p className="text-gray-600">
          Role: {profile.profile_type.charAt(0).toUpperCase() + profile.profile_type.slice(1)}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="transition-all duration-200">
            Overview
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="transition-all duration-200">
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="analytics" className="transition-all duration-200">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="health" className="transition-all duration-200">
            System Health
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          {profile.profile_type === 'borrower' ? (
            <BorrowerDashboard />
          ) : (
            <InvestorLoanView />
          )}
        </TabsContent>
        
        <TabsContent value="marketplace" className="space-y-6 animate-fade-in">
          <InvestorLoanView />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6 animate-fade-in">
          <TransactionAnalytics />
        </TabsContent>
        
        <TabsContent value="health" className="space-y-6 animate-fade-in">
          <DatabaseHealthCheck />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
