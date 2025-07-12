
-- 1. Add activity and chat support
CREATE TABLE IF NOT EXISTS public.chama_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.chama_members(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL,
  amount NUMERIC(12,2),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Track individual loan repayments to support repayment plans
CREATE TABLE IF NOT EXISTS public.chama_loan_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.chama_loans(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed'
);

-- 3. Add chama settings: penalty, interest, voting threshold, auto-distribution
CREATE TABLE IF NOT EXISTS public.chama_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  late_payment_penalty NUMERIC(5,2) DEFAULT 5.0,
  loan_interest_rate NUMERIC(5,2) DEFAULT 10.0,
  max_loan_amount NUMERIC(12,2),
  voting_threshold NUMERIC(5,2) DEFAULT 50.0,
  auto_distribution_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Add group chat per chama (for simplicity as a messages table)
CREATE TABLE IF NOT EXISTS public.chama_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.chama_members(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Add basic reputation table for chama members
CREATE TABLE IF NOT EXISTS public.member_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.chama_members(id) ON DELETE CASCADE,
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  contribution_score NUMERIC(5,2) DEFAULT 0,
  repayment_score NUMERIC(5,2) DEFAULT 0,
  participation_score NUMERIC(5,2) DEFAULT 0,
  overall_score NUMERIC(5,2) DEFAULT 0,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Enable Row Level Security
ALTER TABLE public.chama_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_reputation ENABLE ROW LEVEL SECURITY;

-- 7. RLS - Allow chama members to see activities/messages/rep.
CREATE POLICY "Members can view their chama activities" 
  ON public.chama_activities 
  FOR SELECT 
  USING (
    chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can insert activities for their chama" 
  ON public.chama_activities 
  FOR INSERT 
  WITH CHECK (
    chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can view loan repayments for their chama"
  ON public.chama_loan_repayments
  FOR SELECT
  USING (
    loan_id IN (
      SELECT id FROM public.chama_loans WHERE chama_id IN (
        SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can view settings for their chama"
  ON public.chama_settings
  FOR SELECT
  USING (
    chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins/treasurers can update settings for their chama"
  ON public.chama_settings
  FOR UPDATE
  USING (
    chama_id IN (
      SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid() AND role IN ('admin','treasurer')
    )
  );

CREATE POLICY "Members can view messages for their chama"
  ON public.chama_messages
  FOR SELECT
  USING (
    chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can send messages in their chama"
  ON public.chama_messages
  FOR INSERT
  WITH CHECK (
    chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can view reputation"
  ON public.member_reputation
  FOR SELECT
  USING (
    chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
  );

-- 8. Indexing for performance
CREATE INDEX IF NOT EXISTS idx_chama_activity_chama_id ON public.chama_activities(chama_id);
CREATE INDEX IF NOT EXISTS idx_chama_messages_chama_id ON public.chama_messages(chama_id);

