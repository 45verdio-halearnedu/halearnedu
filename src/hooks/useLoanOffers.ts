import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LoanOffer {
  id: string;
  loan_application_id: string;
  investor_id: string;
  offered_amount: number;
  offered_interest_rate: number;
  message: string | null;
  status: string;
  payment_method?: string;
  payment_number?: string;
  disbursement_status?: string;
  created_at: string;
  updated_at: string;
}

export const useLoanOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOffers();
      
      // Set up real-time subscription for loan offers
      const channel = supabase
        .channel('loan-offers-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'loan_offers'
          },
          (payload) => {
            console.log('Loan offer change detected:', payload);
            fetchOffers(); // Refresh offers when changes occur
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchOffers = async () => {
    try {
      // First get offers made by the current user (investor)
      const { data: investorOffers, error: investorError } = await supabase
        .from('loan_offers')
        .select('*')
        .eq('investor_id', user?.id)
        .order('created_at', { ascending: false });

      if (investorError) throw investorError;

      // Then get offers on applications by the current user (borrower)
      const { data: borrowerOffers, error: borrowerError } = await supabase
        .from('loan_offers')
        .select(`
          *,
          loan_applications!inner(borrower_id)
        `)
        .eq('loan_applications.borrower_id', user?.id)
        .order('created_at', { ascending: false });

      if (borrowerError) throw borrowerError;

      // Combine and deduplicate
      const allOffers = [...(investorOffers || []), ...(borrowerOffers || [])];
      const uniqueOffers = allOffers.filter((offer, index, self) => 
        index === self.findIndex(o => o.id === offer.id)
      );

      setOffers(uniqueOffers);
    } catch (error) {
      console.error('Error fetching loan offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOffer = async (offerData: {
    loan_application_id: string;
    offered_amount: number;
    offered_interest_rate: number;
    message?: string;
  }) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to create offers');
      }

      const { error } = await supabase
        .from('loan_offers')
        .insert({
          investor_id: user.id,
          ...offerData,
          status: 'pending'
        });

      if (error) throw error;
      
      // Refresh offers after creating
      await fetchOffers();
    } catch (error) {
      console.error('Error creating loan offer:', error);
      throw error;
    }
  };

  const updateOfferStatus = async (offerId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('loan_offers')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId);

      if (error) throw error;
      
      // Refresh offers after updating
      await fetchOffers();
    } catch (error) {
      console.error('Error updating offer status:', error);
      throw error;
    }
  };

  const acceptOfferWithPayment = async (offerId: string, paymentMethod: string, paymentNumber: string) => {
    try {
      // Update the offer with payment details and mark as accepted
      const { error } = await supabase
        .from('loan_offers')
        .update({
          status: 'accepted',
          payment_method: paymentMethod,
          payment_number: paymentNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId);

      if (error) throw error;

      await fetchOffers();
      return offerId;
    } catch (error) {
      console.error('Error accepting offer with payment:', error);
      throw error;
    }
  };

  return { 
    offers, 
    loading, 
    createOffer, 
    updateOfferStatus,
    acceptOfferWithPayment,
    refetch: fetchOffers
  };
};