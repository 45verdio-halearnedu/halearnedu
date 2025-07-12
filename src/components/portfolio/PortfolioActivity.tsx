
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PortfolioActivity: React.FC = () => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest transactions and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          No recent activity found
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioActivity;
