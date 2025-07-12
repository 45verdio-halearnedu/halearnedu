
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PortfolioSettings: React.FC = () => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your portfolio settings and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Edit Profile</Button>
      </CardContent>
    </Card>
  );
};

export default PortfolioSettings;
