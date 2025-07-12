import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LoanAgreement {
  id: string;
  borrower_id: string;
  investor_id: string;
  loan_offer_id: string;
  monthly_payment: number;
  total_payment: number;
  interest_rate: number;
  duration_months: number;
  end_date?: string;
  created_at: string;
  updated_at?: string;
}

export const useLoanAgreements = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<LoanAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAgreements();
    }
  }, [user]);

  const fetchAgreements = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_agreements')
        .select('*')
        .or(`borrower_id.eq.${user?.id},investor_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgreements(data || []);
    } catch (error) {
      console.error('Error fetching loan agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    agreements,
    loading,
    refetch: fetchAgreements
  };
};