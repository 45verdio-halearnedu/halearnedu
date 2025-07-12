
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreateDisputeDialog from './CreateDisputeDialog';
import DisputesList from './DisputesList';

interface Dispute {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

const Disputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleDisputeCreated = () => {
    fetchDisputes();
  };

  if (loading) {
    return <div className="p-6">Loading disputes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Disputes & Support</h1>
        <Button variant="outline">Contact Support</Button>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>My Disputes</CardTitle>
          <CardDescription>Track and manage your dispute tickets</CardDescription>
        </CardHeader>
        <CardContent>
          {disputes.length === 0 ? (
            <div className="text-center py-8">
              <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-loan-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">No Active Disputes</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You don't have any active disputes. If you encounter any issues with your loans, 
                you can create a new dispute ticket.
              </p>
              <CreateDisputeDialog onDisputeCreated={handleDisputeCreated} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-end">
                <CreateDisputeDialog onDisputeCreated={handleDisputeCreated} />
              </div>
              <DisputesList disputes={disputes} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Support Resources</CardTitle>
            <CardDescription>Get help with common issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-medium mb-1">How does loan collateral work?</h3>
              <p className="text-sm text-gray-500">
                Learn about the collateral requirements and liquidation process.
              </p>
              <Button variant="link" className="text-loan-primary p-0 h-auto mt-1">
                Read guide
              </Button>
            </div>
            <div className="border-b pb-3">
              <h3 className="font-medium mb-1">Understanding interest rates</h3>
              <p className="text-sm text-gray-500">
                How interest rates are calculated and applied to your loans.
              </p>
              <Button variant="link" className="text-loan-primary p-0 h-auto mt-1">
                Read guide
              </Button>
            </div>
            <div>
              <h3 className="font-medium mb-1">Dispute resolution process</h3>
              <p className="text-sm text-gray-500">
                Learn how the dispute resolution process works within our platform.
              </p>
              <Button variant="link" className="text-loan-primary p-0 h-auto mt-1">
                Read guide
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Support Tickets</CardTitle>
            <CardDescription>Status of your support requests</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">You haven't created any support tickets yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Disputes;
