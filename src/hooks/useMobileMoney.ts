
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MobileMoneyAccount {
  id: string;
  provider: 'mpesa' | 'airtel_money';
  phone_number: string;
  account_name: string | null;
  is_verified: boolean | null;
  is_active: boolean | null;
}

export const useMobileMoney = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<MobileMoneyAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('mobile_money_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Properly transform the data to match our interface
      const transformedAccounts: MobileMoneyAccount[] = (data || []).map(account => ({
        id: account.id,
        provider: account.provider as 'mpesa' | 'airtel_money',
        phone_number: account.phone_number,
        account_name: account.account_name,
        is_verified: account.is_verified,
        is_active: account.is_active
      }));
      
      setAccounts(transformedAccounts);
    } catch (error) {
      console.error('Error fetching mobile money accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (accountData: {
    provider: 'mpesa' | 'airtel_money';
    phone_number: string;
    account_name?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('mobile_money_accounts')
        .insert({
          user_id: user?.id,
          ...accountData
        });

      if (error) throw error;
      await fetchAccounts();
    } catch (error) {
      console.error('Error adding mobile money account:', error);
      throw error;
    }
  };

  const removeAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('mobile_money_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;
      await fetchAccounts();
    } catch (error) {
      console.error('Error removing mobile money account:', error);
      throw error;
    }
  };

  return {
    accounts,
    loading,
    addAccount,
    removeAccount,
    fetchAccounts
  };
};
