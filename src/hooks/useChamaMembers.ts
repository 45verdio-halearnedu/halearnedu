
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ChamaMember {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  total_contributed: number;
  last_contribution_date: string | null;
}

export const useChamaMembers = (chamaId: string) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<ChamaMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user || !chamaId) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('chama_members')
          .select('*')
          .eq('chama_id', chamaId)
          .eq('is_active', true)
          .order('joined_at', { ascending: true });

        if (error) {
          console.error('Error fetching chama members:', error);
          setError('Failed to load members');
          return;
        }

        setMembers(data || []);
      } catch (error) {
        console.error('Unexpected error fetching members:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user, chamaId]);

  const getCurrentMember = (): ChamaMember | null => {
    return members.find(member => member.user_id === user?.id) || null;
  };

  const isAdmin = (): boolean => {
    const currentMember = getCurrentMember();
    return currentMember?.role === 'admin' || false;
  };

  const isTreasurer = (): boolean => {
    const currentMember = getCurrentMember();
    return currentMember?.role === 'treasurer' || false;
  };

  const canManageChama = (): boolean => {
    return isAdmin() || isTreasurer();
  };

  return {
    members,
    loading,
    error,
    getCurrentMember,
    isAdmin,
    isTreasurer,
    canManageChama,
  };
};
