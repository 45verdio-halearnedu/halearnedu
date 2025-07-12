
-- 1. Table for P2P Listings (offers)
CREATE TABLE public.p2p_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  asset TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Table for Escrow Transactions
CREATE TABLE public.p2p_escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.p2p_listings(id),
  asset TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, cancelled, completed, disputed
  payment_confirmed BOOLEAN NOT NULL DEFAULT false,
  released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Table for In-app Chat (simple thread per trade)
CREATE TABLE public.p2p_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES public.p2p_escrows(id),
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Table for Ratings (per trade)
CREATE TABLE public.p2p_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES public.p2p_escrows(id),
  rater_id UUID NOT NULL,
  ratee_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Table for Simple KYC/Verification
CREATE TABLE public.p2p_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  selfie_url TEXT,
  id_document_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Enable Row-level Security for all tables
ALTER TABLE public.p2p_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p2p_escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p2p_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p2p_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p2p_verifications ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for main tables (users can see/create/update their own only)
-- Listings
CREATE POLICY "Users can view all active listings" ON public.p2p_listings FOR SELECT USING (is_active = true OR user_id = auth.uid());
CREATE POLICY "Users can insert listings" ON public.p2p_listings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own listings" ON public.p2p_listings FOR UPDATE USING (user_id = auth.uid());

-- Escrows
CREATE POLICY "Party users can view escrow" ON public.p2p_escrows FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Party users can insert escrow" ON public.p2p_escrows FOR INSERT WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Party users can update their escrow" ON public.p2p_escrows FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Chat
CREATE POLICY "Users can chat in their escrow" ON public.p2p_chats FOR SELECT USING (EXISTS (SELECT 1 FROM public.p2p_escrows e WHERE e.id = escrow_id AND (e.buyer_id = auth.uid() OR e.seller_id = auth.uid())));
CREATE POLICY "Users can insert chat in their escrow" ON public.p2p_chats FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.p2p_escrows e WHERE e.id = escrow_id AND (e.buyer_id = auth.uid() OR e.seller_id = auth.uid())));

-- Ratings
CREATE POLICY "Users can rate their trade partner" ON public.p2p_ratings FOR INSERT WITH CHECK (rater_id = auth.uid());

-- Verifications
CREATE POLICY "User can see and edit their own verifications" ON public.p2p_verifications FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
