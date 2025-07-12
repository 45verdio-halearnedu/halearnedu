
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PendingApproval {
  approval_id: string;
  contribution_id: string;
  member_name: string;
  member_email: string;
  amount: number;
  payment_method: string;
  payment_reference?: string;
  notes?: string;
  submitted_at: string;
}

export interface ContributionReport {
  member_name: string;
  member_email: string;
  member_phone: string;
  member_id: string;
  user_id: string;
  total_contributed: number;
  contribution_count: number;
  last_contribution_date: string | null;
  pending_contributions: number;
  approved_contributions: number;
  rejected_contributions: number;
}

export const useContributionApprovals = (chamaId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [contributionReport, setContributionReport] = useState<ContributionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && chamaId) {
      fetchPendingApprovals();
      fetchContributionReport();
    }
  }, [user, chamaId]);

  const fetchPendingApprovals = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_contribution_approvals' as any, {
        p_chama_id: chamaId
      });

      if (error) {
        console.error('Error fetching pending approvals:', error);
        setError('Failed to load pending approvals');
        return;
      }

      setPendingApprovals((data as any) || []);
    } catch (error) {
      console.error('Unexpected error fetching pending approvals:', error);
      setError('An unexpected error occurred');
    }
  };

  const fetchContributionReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_chama_contribution_report' as any, {
        p_chama_id: chamaId
      });

      if (error) {
        console.error('Error fetching contribution report:', error);
        setError('Failed to load contribution report');
        return;
      }

      setContributionReport((data as any) || []);
    } catch (error) {
      console.error('Unexpected error fetching contribution report:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const approveContribution = async (approvalId: string, approved: boolean, rejectionReason?: string) => {
    try {
      const { data, error } = await supabase.rpc('approve_contribution' as any, {
        p_approval_id: approvalId,
        p_approved: approved,
        p_rejection_reason: rejectionReason || null
      });

      if (error) {
        console.error('Error processing approval:', error);
        toast({
          title: "Error",
          description: "Failed to process approval",
          variant: "destructive",
        });
        return false;
      }

      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        // Refresh data
        await Promise.all([fetchPendingApprovals(), fetchContributionReport()]);
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Unexpected error processing approval:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    pendingApprovals,
    contributionReport,
    loading,
    error,
    approveContribution,
    refetch: () => Promise.all([fetchPendingApprovals(), fetchContributionReport()])
  };
};
