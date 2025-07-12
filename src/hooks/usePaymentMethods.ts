
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PaymentMethod {
  id: string;
  chama_id: string;
  method_type: 'till' | 'paybill' | 'phone';
  method_name: string;
  method_number: string;
  account_number?: string;
  is_active: boolean;
  created_at: string;
}

export const usePaymentMethods = (chamaId: string) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && chamaId) {
      fetchPaymentMethods();
    }
  }, [user, chamaId]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('chama_mpesa_methods')
        .select('*')
        .eq('chama_id', chamaId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching payment methods:', error);
        setError('Failed to load payment methods');
        return;
      }

      // Type-cast the data to ensure method_type is properly typed
      const typedData = (data || []).map(method => ({
        ...method,
        method_type: method.method_type as 'till' | 'paybill' | 'phone'
      }));

      setPaymentMethods(typedData);
    } catch (error) {
      console.error('Unexpected error fetching payment methods:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id' | 'created_at' | 'is_active'>) => {
    try {
      const { data, error } = await supabase
        .from('chama_mpesa_methods')
        .insert([{ ...method, chama_id: chamaId }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchPaymentMethods();
      return data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    try {
      const { data, error } = await supabase
        .from('chama_mpesa_methods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchPaymentMethods();
      return data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chama_mpesa_methods')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  };

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    refetch: fetchPaymentMethods
  };
};
