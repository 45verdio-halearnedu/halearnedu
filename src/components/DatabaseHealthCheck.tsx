
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface HealthCheck {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const DatabaseHealthCheck: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateCheck = (name: string, status: HealthCheck['status'], message: string, details?: string) => {
    setChecks(prev => {
      const existing = prev.find(c => c.name === name);
      const newCheck = { name, status, message, details };
      if (existing) {
        return prev.map(c => c.name === name ? newCheck : c);
      }
      return [...prev, newCheck];
    });
  };

  const runHealthChecks = async () => {
    setIsRunning(true);
    setChecks([]);

    // 1. Database Connection Test
    updateCheck('Database Connection', 'pending', 'Testing connection...');
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) throw error;
      updateCheck('Database Connection', 'success', 'Database connected successfully');
    } catch (error: any) {
      updateCheck('Database Connection', 'error', 'Database connection failed', error.message);
    }

    // 2. Authentication Test
    updateCheck('Authentication', 'pending', 'Checking auth status...');
    if (user) {
      updateCheck('Authentication', 'success', `User authenticated: ${user.email}`);
    } else {
      updateCheck('Authentication', 'warning', 'No user currently authenticated');
    }

    // 3. User Profile Table Test
    if (user) {
      updateCheck('User Profile', 'pending', 'Checking user profile...');
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          updateCheck('User Profile', 'success', `Profile found: ${data.display_name || 'No display name'}`);
        } else {
          updateCheck('User Profile', 'warning', 'No profile found for current user');
        }
      } catch (error: any) {
        updateCheck('User Profile', 'error', 'Profile check failed', error.message);
      }
    }

    // 4. Wallet System Test
    if (user) {
      updateCheck('Wallet System', 'pending', 'Checking wallet...');
      try {
        const { data, error } = await supabase
          .from('user_wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          updateCheck('Wallet System', 'success', `Wallet found: ${data.balance || 0} ${data.currency || 'USDC'}`);
        } else {
          updateCheck('Wallet System', 'warning', 'No wallet found for current user');
        }
      } catch (error: any) {
        updateCheck('Wallet System', 'error', 'Wallet check failed', error.message);
      }
    }

    // 5. Loan Applications Table Test
    updateCheck('Loan Applications', 'pending', 'Checking loan applications...');
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('count')
        .limit(1);

      if (error) throw error;
      updateCheck('Loan Applications', 'success', 'Loan applications table accessible');
    } catch (error: any) {
      updateCheck('Loan Applications', 'error', 'Loan applications check failed', error.message);
    }

    // 6. Loan Offers Table Test
    updateCheck('Loan Offers', 'pending', 'Checking loan offers...');
    try {
      const { data, error } = await supabase
        .from('loan_offers')
        .select('count')
        .limit(1);

      if (error) throw error;
      updateCheck('Loan Offers', 'success', 'Loan offers table accessible');
    } catch (error: any) {
      updateCheck('Loan Offers', 'error', 'Loan offers check failed', error.message);
    }

    // 7. Notifications System Test
    if (user) {
      updateCheck('Notifications', 'pending', 'Checking notifications...');
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('count')
          .eq('user_id', user.id)
          .limit(1);

        if (error) throw error;
        updateCheck('Notifications', 'success', 'Notifications system accessible');
      } catch (error: any) {
        updateCheck('Notifications', 'error', 'Notifications check failed', error.message);
      }
    }

    // 8. Disputes System Test
    updateCheck('Disputes System', 'pending', 'Checking disputes...');
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('count')
        .limit(1);

      if (error) throw error;
      updateCheck('Disputes System', 'success', 'Disputes system accessible');
    } catch (error: any) {
      updateCheck('Disputes System', 'error', 'Disputes check failed', error.message);
    }

    // 9. Staking System Test
    updateCheck('Staking System', 'pending', 'Checking staking pools...');
    try {
      const { data, error } = await supabase
        .from('staking_pools')
        .select('*')
        .eq('is_active', true)
        .limit(5);

      if (error) throw error;
      updateCheck('Staking System', 'success', `Found ${data?.length || 0} active staking pools`);
    } catch (error: any) {
      updateCheck('Staking System', 'error', 'Staking system check failed', error.message);
    }

    setIsRunning(false);

    // Show summary toast
    const successCount = checks.filter(c => c.status === 'success').length;
    const errorCount = checks.filter(c => c.status === 'error').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;

    if (errorCount === 0) {
      toast({
        title: "Health Check Complete",
        description: `${successCount} checks passed successfully${warningCount > 0 ? `, ${warningCount} warnings` : ''}`,
      });
    } else {
      toast({
        title: "Issues Found",
        description: `${errorCount} errors, ${warningCount} warnings found`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheck['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  useEffect(() => {
    // Auto-run health checks on component mount
    runHealthChecks();
  }, [user]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Database & Backend Health Check
          {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Comprehensive testing of database connectivity and backend functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runHealthChecks} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Health Checks...' : 'Run Health Checks'}
          </Button>

          {checks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Health Check Results:</h3>
              {checks.map((check, index) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{check.name}</span>
                        {getStatusBadge(check.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                      {check.details && (
                        <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">
                          {check.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {checks.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {checks.filter(c => c.status === 'success').length}
                  </div>
                  <div className="text-green-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {checks.filter(c => c.status === 'warning').length}
                  </div>
                  <div className="text-yellow-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {checks.filter(c => c.status === 'error').length}
                  </div>
                  <div className="text-red-600">Errors</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseHealthCheck;
