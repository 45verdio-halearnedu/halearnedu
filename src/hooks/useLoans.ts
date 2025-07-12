
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Loan {
  id: string;
  amount: number;
  interest_rate: number;
  duration_months: number;
  collateral_required: string | null;
  status: string;
  created_at: string;
}

export interface LoanApplication {
  id: string;
  borrower_id: string;
  loan_id: string | null;
  amount: number;
  interest_rate: number;
  duration_months: number;
  collateral: string | null;
  status: string;
  monthly_payment: number | null;
  total_payment: number | null;
  funding_progress: number;
  created_at: string;
  updated_at: string;
  purpose: string | null;
  repayment_method: string | null;
  guarantors: any;
  documents: any;
  eligibility_score: number | null;
  rejection_reason: string | null;
  disbursed_at: string | null;
  next_payment_due: string | null;
}

export const useLoans = () => {
  const { user } = useAuth();
  const [marketplaceLoans, setMarketplaceLoans] = useState<LoanApplication[]>([]);
  const [userApplications, setUserApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMarketplaceLoans();
      fetchUserApplications();
      
      // Set up real-time subscription for loan applications
      const channel = supabase
        .channel('loan-applications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'loan_applications'
          },
          (payload) => {
            console.log('Loan application change detected:', payload);
            fetchMarketplaceLoans();
            fetchUserApplications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // If no user, still fetch marketplace loans for public viewing
      fetchMarketplaceLoans();
    }
  }, [user]);

  const fetchMarketplaceLoans = async () => {
    try {
      // Fetch all pending loan applications for the marketplace
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMarketplaceLoans(data || []);
    } catch (error) {
      console.error('Error fetching marketplace loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('borrower_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserApplications(data || []);
    } catch (error) {
      console.error('Error fetching loan applications:', error);
    }
  };

  const submitLoanApplication = async (applicationData: {
    amount: number;
    interest_rate: number;
    duration_months: number;
    collateral: string;
    monthly_payment: number;
    total_payment: number;
    purpose?: string;
    repayment_method?: string;
  }) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to submit loan application');
      }

      const { data, error } = await supabase
        .from('loan_applications')
        .insert({
          borrower_id: user.id,
          amount: applicationData.amount,
          interest_rate: applicationData.interest_rate,
          duration_months: applicationData.duration_months,
          collateral: applicationData.collateral,
          monthly_payment: applicationData.monthly_payment,
          total_payment: applicationData.total_payment,
          purpose: applicationData.purpose || null,
          repayment_method: applicationData.repayment_method || 'wallet',
          status: 'pending',
          funding_progress: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting loan application:', error);
        throw error;
      }

      console.log('Loan application submitted successfully:', data);
      
      // Refresh both user applications and marketplace
      await Promise.all([
        fetchUserApplications(),
        fetchMarketplaceLoans()
      ]);
      
      return data;
    } catch (error) {
      console.error('Error submitting loan application:', error);
      throw error;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, additionalData?: any) => {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      const { error } = await supabase
        .from('loan_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;
      
      // Refresh data after update
      await Promise.all([
        fetchUserApplications(),
        fetchMarketplaceLoans()
      ]);
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  };

  const refetch = async () => {
    setLoading(true);
    await Promise.all([
      fetchMarketplaceLoans(),
      user ? fetchUserApplications() : Promise.resolve()
    ]);
  };

  return { 
    marketplaceLoans, 
    userApplications, 
    loading, 
    submitLoanApplication,
    updateApplicationStatus,
    refetch
  };
};
