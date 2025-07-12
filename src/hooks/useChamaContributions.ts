
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ChamaContribution {
  id: string;
  chama_id: string;
  member_id: string;
  amount: number;
  contribution_date: string;
  payment_method: string;
  payment_reference?: string;
  status: string;
  created_at: string;
  notes?: string;
}

export interface ContributionSummary {
  member_id: string;
  member_email: string;
  total_contributed: number;
  last_contribution_date: string | null;
  contribution_count: number;
}

export const useChamaContributions = (chamaId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contributions, setContributions] = useState<ChamaContribution[]>([]);
  const [contributionSummary, setContributionSummary] = useState<ContributionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && chamaId) {
      fetchContributions();
      fetchContributionSummary();
    }
  }, [user, chamaId]);

  const fetchContributions = async () => {
    try {
      const { data, error } = await supabase
        .from('chama_contributions_new')
        .select('*')
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contributions:', error);
        setError('Failed to load contributions');
        return;
      }

      setContributions(data || []);
    } catch (error) {
      console.error('Unexpected error fetching contributions:', error);
      setError('An unexpected error occurred');
    }
  };

  const fetchContributionSummary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_chama_contribution_summary', {
        p_chama_id: chamaId
      });

      if (error) {
        console.error('Error fetching contribution summary:', error);
        setError('Failed to load contribution summary');
        return;
      }

      setContributionSummary(data || []);
    } catch (error) {
      console.error('Unexpected error fetching contribution summary:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const makeContribution = async (
    amount: number,
    paymentMethod: string = 'mobile_money',
    paymentReference?: string,
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('make_chama_contribution', {
        p_chama_id: chamaId,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_payment_reference: paymentReference,
        p_notes: notes
      });

      if (error) {
        console.error('Error making contribution:', error);
        toast({
          title: "Error",
          description: "Failed to make contribution",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Contribution made successfully",
      });

      // Refresh data
      await Promise.all([fetchContributions(), fetchContributionSummary()]);
      
      return data;
    } catch (error) {
      console.error('Unexpected error making contribution:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    contributions,
    contributionSummary,
    loading,
    error,
    makeContribution,
    refetch: () => Promise.all([fetchContributions(), fetchContributionSummary()])
  };
};
