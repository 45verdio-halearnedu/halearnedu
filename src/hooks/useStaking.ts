
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StakingPool {
  id: string;
  name: string;
  currency: string;
  apy: number;
  min_stake: number;
  max_stake: number | null;
  total_staked: number | null;
  is_active: boolean | null;
}

export interface UserStake {
  id: string;
  pool_id: string;
  amount: number;
  rewards_earned: number | null;
  stake_date: string;
  last_reward_date: string | null;
  is_active: boolean | null;
  staking_pools: StakingPool;
}

export const useStaking = () => {
  const { user } = useAuth();
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [userStakes, setUserStakes] = useState<UserStake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStakingPools();
    if (user) {
      fetchUserStakes();
    }
  }, [user]);

  const fetchStakingPools = async () => {
    try {
      const { data, error } = await supabase
        .from('staking_pools')
        .select('*')
        .eq('is_active', true)
        .order('apy', { ascending: false });

      if (error) throw error;
      setStakingPools(data || []);
    } catch (error) {
      console.error('Error fetching staking pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStakes = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stakes')
        .select(`
          *,
          staking_pools (*)
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('stake_date', { ascending: false });

      if (error) throw error;
      setUserStakes(data || []);
    } catch (error) {
      console.error('Error fetching user stakes:', error);
    }
  };

  const createStake = async (poolId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('user_stakes')
        .insert({
          user_id: user?.id,
          pool_id: poolId,
          amount
        });

      if (error) throw error;
      await fetchUserStakes();
    } catch (error) {
      console.error('Error creating stake:', error);
      throw error;
    }
  };

  return {
    stakingPools,
    userStakes,
    loading,
    createStake,
    fetchStakingPools,
    fetchUserStakes
  };
};
