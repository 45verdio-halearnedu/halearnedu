
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface WalletData {
  id: string;
  balance: number;
  locked_collateral: number;
  currency: string;
  wallet_address: string | null;
  is_connected: boolean;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  created_at: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchTransactions();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const connectWallet = async () => {
    try {
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      const { error } = await supabase
        .from('user_wallets')
        .update({ is_connected: true, wallet_address: mockAddress })
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchWalletData();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return { wallet, transactions, loading, connectWallet, fetchWalletData };
};
