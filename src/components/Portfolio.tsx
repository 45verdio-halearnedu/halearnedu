
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from '@/hooks/useUserProfile';
import CreateProfileDialog from './CreateProfileDialog';
import ProfileHeader from './portfolio/ProfileHeader';
import PortfolioOverview from './portfolio/PortfolioOverview';
import PortfolioActivity from './portfolio/PortfolioActivity';
import PortfolioSettings from './portfolio/PortfolioSettings';

const Portfolio: React.FC = () => {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
        </div>
        <div className="text-center py-12">Loading portfolio...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
        </div>
        <Card className="border-0 shadow-md">
          <CardHeader className="text-center">
            <CardTitle>Create Your Portfolio</CardTitle>
            <CardDescription>
              Set up your investor, lender, or borrower profile to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CreateProfileDialog />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getBadgeVariant = () => {
    if (profile.profile_type === 'investor' || profile.profile_type === 'lender') {
      return 'default';
    }
    return 'secondary';
  };

  const getProfileTypeDisplay = () => {
    switch (profile.profile_type) {
      case 'investor':
        return 'Investor';
      case 'lender':
        return 'Lender';
      case 'borrower':
        return 'Borrower';
      default:
        return profile.profile_type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
        <Badge variant={getBadgeVariant()}>
          {getProfileTypeDisplay()}
        </Badge>
      </div>

      <ProfileHeader profile={profile} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <PortfolioOverview profile={profile} />
        </TabsContent>

        <TabsContent value="activity" className="pt-6">
          <PortfolioActivity />
        </TabsContent>

        <TabsContent value="settings" className="pt-6">
          <PortfolioSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Portfolio;
