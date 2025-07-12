
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AdminAnalytics {
  total_members: number;
  active_members: number;
  pending_members: number;
  total_contributions: number;
  monthly_contributions: number;
  total_loans: number;
  active_loans: number;
  average_contribution: number;
  contribution_rate: number;
}

export interface PendingContribution {
  member_id: string;
  member_email: string;
  last_contribution_date: string | null;
  days_overdue: number;
  expected_amount: number;
}

export const useAdminAnalytics = (chamaId: string) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [pendingContributions, setPendingContributions] = useState<PendingContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && chamaId) {
      fetchAnalytics();
      fetchPendingContributions();
    }
  }, [user, chamaId]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_analytics', {
        p_chama_id: chamaId
      });

      if (error) {
        console.error('Error fetching admin analytics:', error);
        setError('Failed to load analytics');
        return;
      }

      if (data && data.length > 0) {
        setAnalytics(data[0]);
      }
    } catch (error) {
      console.error('Unexpected error fetching analytics:', error);
      setError('An unexpected error occurred');
    }
  };

  const fetchPendingContributions = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_contributions', {
        p_chama_id: chamaId
      });

      if (error) {
        console.error('Error fetching pending contributions:', error);
        return;
      }

      setPendingContributions(data || []);
    } catch (error) {
      console.error('Unexpected error fetching pending contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordManualDeposit = async (
    amount: number,
    paymentMethod: string = 'mobile_money',
    paymentReference?: string,
    description?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('record_manual_deposit', {
        p_chama_id: chamaId,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_payment_reference: paymentReference,
        p_description: description
      });

      if (error) throw error;

      // Refresh analytics after successful deposit
      await fetchAnalytics();
      return data;
    } catch (error) {
      console.error('Error recording manual deposit:', error);
      throw error;
    }
  };

  const processPayment = async (
    amount: number,
    paymentMethod: string = 'mobile_money',
    paymentReference?: string,
    description?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('process_payment', {
        p_chama_id: chamaId,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_payment_reference: paymentReference,
        p_description: description
      });

      if (error) throw error;

      // Refresh analytics after successful payment
      await fetchAnalytics();
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  return {
    analytics,
    pendingContributions,
    loading,
    error,
    recordManualDeposit,
    processPayment,
    refetch: () => {
      fetchAnalytics();
      fetchPendingContributions();
    }
  };
};
