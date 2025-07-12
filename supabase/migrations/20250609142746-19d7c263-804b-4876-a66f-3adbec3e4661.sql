
-- Create referral system table
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) NOT NULL,
  referred_id UUID REFERENCES auth.users(id) NOT NULL,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  bonus_earned DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referred_id)
);

-- Create saving groups (chamas/saccos) table
CREATE TABLE public.saving_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  group_type VARCHAR(20) DEFAULT 'chama' CHECK (group_type IN ('chama', 'sacco', 'investment_club')),
  target_amount DECIMAL(15,2),
  contribution_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (contribution_frequency IN ('weekly', 'monthly', 'quarterly')),
  min_contribution DECIMAL(10,2) DEFAULT 0,
  max_members INTEGER DEFAULT 50,
  current_members INTEGER DEFAULT 0,
  total_saved DECIMAL(15,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saving group memberships table
CREATE TABLE public.saving_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.saving_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'treasurer', 'secretary', 'member')),
  total_contributed DECIMAL(10,2) DEFAULT 0,
  last_contribution_date TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(group_id, user_id)
);

-- Create lender ratings table
CREATE TABLE public.lender_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lender_id UUID REFERENCES auth.users(id) NOT NULL,
  borrower_id UUID REFERENCES auth.users(id) NOT NULL,
  loan_application_id UUID REFERENCES public.loan_applications(id),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  terms_rating INTEGER CHECK (terms_rating BETWEEN 1 AND 5),
  reliability_rating INTEGER CHECK (reliability_rating BETWEEN 1 AND 5),
  overall_rating DECIMAL(2,1) CHECK (overall_rating BETWEEN 1.0 AND 5.0),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lender_id, borrower_id, loan_application_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saving_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saving_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lender_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_referrals
CREATE POLICY "Users can view their own referrals" 
  ON public.user_referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" 
  ON public.user_referrals 
  FOR INSERT 
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their referrals" 
  ON public.user_referrals 
  FOR UPDATE 
  USING (auth.uid() = referrer_id);

-- RLS Policies for saving_groups
CREATE POLICY "Anyone can view active saving groups" 
  ON public.saving_groups 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can create saving groups" 
  ON public.saving_groups 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators and admins can update groups" 
  ON public.saving_groups 
  FOR UPDATE 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.saving_group_members 
      WHERE group_id = public.saving_groups.id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for saving_group_members
CREATE POLICY "Group members can view group memberships" 
  ON public.saving_group_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.saving_group_members sgm 
      WHERE sgm.group_id = public.saving_group_members.group_id 
      AND sgm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups" 
  ON public.saving_group_members 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their membership" 
  ON public.saving_group_members 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for lender_ratings
CREATE POLICY "Users can view ratings for lenders" 
  ON public.lender_ratings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Borrowers can create ratings" 
  ON public.lender_ratings 
  FOR INSERT 
  WITH CHECK (auth.uid() = borrower_id);

CREATE POLICY "Borrowers can update their ratings" 
  ON public.lender_ratings 
  FOR UPDATE 
  USING (auth.uid() = borrower_id);

-- Create functions for community features
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  SELECT 'REF' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) INTO code;
  RETURN code;
END;
$$;

-- Function to calculate average lender rating
CREATE OR REPLACE FUNCTION public.get_lender_average_rating(lender_user_id UUID)
RETURNS DECIMAL(2,1)
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(AVG(overall_rating), 0.0)
  FROM public.lender_ratings
  WHERE lender_id = lender_user_id;
$$;

-- Trigger to update saving group member count
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.saving_groups 
    SET current_members = current_members + 1
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.saving_groups 
    SET current_members = current_members - 1
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_group_member_count
  AFTER INSERT OR DELETE ON public.saving_group_members
  FOR EACH ROW EXECUTE FUNCTION public.update_group_member_count();
