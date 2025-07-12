
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MpesaTransaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  phone_number: string;
  merchant_request_id?: string;
  checkout_request_id?: string;
  mpesa_receipt_number?: string;
  transaction_date?: string;
  result_code?: number;
  result_desc?: string;
  status: string;
  callback_data?: any;
  created_at: string;
  updated_at: string;
}

export const useMpesa = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching M-Pesa transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Unexpected error fetching M-Pesa transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateStkPush = async (phoneNumber: string, amount: number, accountReference?: string, transactionDesc?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to make payments",
        variant: "destructive",
      });
      return null;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone_number: phoneNumber,
          amount: amount,
          account_reference: accountReference || 'Payment',
          transaction_desc: transactionDesc || 'Payment'
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "STK Push Sent",
          description: data.message,
        });
        
        // Refresh transactions
        await fetchTransactions();
        return data.transaction_id;
      } else {
        throw new Error(data.error || 'STK Push failed');
      }
    } catch (error) {
      console.error('STK Push error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const checkTransactionStatus = async (transactionId: string) => {
    try {
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return null;
    }
  };

  return {
    transactions,
    loading,
    processing,
    initiateStkPush,
    checkTransactionStatus,
    refetch: fetchTransactions
  };
};
