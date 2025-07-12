
-- Create member credentials table for role assignments
CREATE TABLE IF NOT EXISTS public.member_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.chama_members(id) ON DELETE CASCADE,
  credential_type VARCHAR NOT NULL, -- 'treasurer', 'secretary', 'admin'
  credential_value TEXT NOT NULL, -- could be a code, email, or identifier
  is_used BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.chama_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(chama_id, credential_type, credential_value)
);

-- Enable RLS on member credentials
ALTER TABLE public.member_credentials ENABLE ROW LEVEL SECURITY;

-- Policy for member credentials - only chama admins can manage
CREATE POLICY "Chama admins can manage credentials" 
ON public.member_credentials 
FOR ALL 
USING (is_chama_admin(chama_id))
WITH CHECK (is_chama_admin(chama_id));

-- Policy for members to view credentials in their chama
CREATE POLICY "Members can view credentials for their chama" 
ON public.member_credentials 
FOR SELECT 
USING (is_chama_member(chama_id));

-- Create chama leaderboard view for member rankings
CREATE OR REPLACE VIEW public.chama_leaderboard AS
SELECT 
  cm.id as member_id,
  cm.chama_id,
  cm.user_id,
  au.email as member_email,
  cm.total_contributed,
  cm.last_contribution_date,
  cm.role,
  cm.joined_at,
  RANK() OVER (PARTITION BY cm.chama_id ORDER BY cm.total_contributed DESC) as rank,
  COALESCE(contrib_count.count, 0) as contribution_count
FROM public.chama_members cm
JOIN auth.users au ON cm.user_id = au.id
LEFT JOIN (
  SELECT member_id, COUNT(*) as count
  FROM public.chama_contributions_new
  GROUP BY member_id
) contrib_count ON cm.id = contrib_count.member_id
WHERE cm.is_active = true;

-- Function to assign role using credentials
CREATE OR REPLACE FUNCTION public.assign_role_with_credential(
  p_chama_id UUID,
  p_credential_value TEXT,
  p_credential_type TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credential_record RECORD;
  v_member_id UUID;
  v_result JSONB;
BEGIN
  -- Get the current user's member ID in this chama
  SELECT id INTO v_member_id
  FROM public.chama_members
  WHERE user_id = auth.uid() AND chama_id = p_chama_id AND is_active = true;

  IF v_member_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'You are not a member of this chama');
  END IF;

  -- Find the credential
  SELECT * INTO v_credential_record
  FROM public.member_credentials
  WHERE chama_id = p_chama_id 
    AND credential_value = p_credential_value 
    AND credential_type = p_credential_type
    AND is_used = false;

  IF v_credential_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or already used credential');
  END IF;

  -- Update member role
  UPDATE public.chama_members
  SET role = p_credential_type
  WHERE id = v_member_id;

  -- Mark credential as used
  UPDATE public.member_credentials
  SET is_used = true, used_at = now()
  WHERE id = v_credential_record.id;

  -- Log activity
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description)
  VALUES (
    p_chama_id,
    v_member_id,
    'role_assigned',
    FORMAT('Member assigned %s role using credentials', p_credential_type)
  );

  RETURN jsonb_build_object('success', true, 'message', FORMAT('Successfully assigned %s role', p_credential_type));
END;
$$;

-- Function to create member credentials (admin only)
CREATE OR REPLACE FUNCTION public.create_member_credential(
  p_chama_id UUID,
  p_credential_type TEXT,
  p_credential_value TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_member_id UUID;
BEGIN
  -- Check if user is admin
  SELECT id INTO v_admin_member_id
  FROM public.chama_members
  WHERE user_id = auth.uid() AND chama_id = p_chama_id AND role = 'admin' AND is_active = true;

  IF v_admin_member_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only admins can create credentials');
  END IF;

  -- Insert credential
  INSERT INTO public.member_credentials (chama_id, credential_type, credential_value, created_by)
  VALUES (p_chama_id, p_credential_type, p_credential_value, v_admin_member_id);

  RETURN jsonb_build_object('success', true, 'message', 'Credential created successfully');
END;
$$;

-- Function to get chama leaderboard
CREATE OR REPLACE FUNCTION public.get_chama_leaderboard(p_chama_id UUID)
RETURNS TABLE(
  member_id UUID,
  member_email TEXT,
  total_contributed NUMERIC,
  last_contribution_date TIMESTAMP WITH TIME ZONE,
  role VARCHAR,
  joined_at TIMESTAMP WITH TIME ZONE,
  rank BIGINT,
  contribution_count BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    cl.member_id,
    cl.member_email,
    cl.total_contributed,
    cl.last_contribution_date,
    cl.role,
    cl.joined_at,
    cl.rank,
    cl.contribution_count
  FROM public.chama_leaderboard cl
  WHERE cl.chama_id = p_chama_id
    AND is_chama_member(p_chama_id)
  ORDER BY cl.rank ASC;
$$;

-- Create loans and savings tables if they don't exist
CREATE TABLE IF NOT EXISTS public.chama_savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.chama_members(id) ON DELETE CASCADE,
  goal_name VARCHAR NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR DEFAULT 'active'
);

ALTER TABLE public.chama_savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can manage their savings goals"
ON public.chama_savings_goals
FOR ALL
USING (member_id IN (
  SELECT id FROM public.chama_members 
  WHERE user_id = auth.uid() AND chama_id = chama_savings_goals.chama_id
))
WITH CHECK (member_id IN (
  SELECT id FROM public.chama_members 
  WHERE user_id = auth.uid() AND chama_id = chama_savings_goals.chama_id
));

-- Create chama loan requests table
CREATE TABLE IF NOT EXISTS public.chama_loan_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES public.chama_members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  purpose TEXT NOT NULL,
  interest_rate NUMERIC DEFAULT 5.0,
  duration_months INTEGER NOT NULL,
  monthly_payment NUMERIC,
  total_repayment NUMERIC,
  status VARCHAR DEFAULT 'pending',
  approved_by UUID REFERENCES public.chama_members(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.chama_loan_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can create loan requests for their chama"
ON public.chama_loan_requests
FOR INSERT
WITH CHECK (borrower_id IN (
  SELECT id FROM public.chama_members 
  WHERE user_id = auth.uid() AND chama_id = chama_loan_requests.chama_id
));

CREATE POLICY "Members can view loan requests in their chama"
ON public.chama_loan_requests
FOR SELECT
USING (is_chama_member(chama_id));

CREATE POLICY "Admins/treasurers can update loan requests"
ON public.chama_loan_requests
FOR UPDATE
USING (is_chama_admin_or_treasurer(chama_id));
