
-- Create table for chama contributions tracking
CREATE TABLE IF NOT EXISTS public.chama_contributions_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.chama_members(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50) DEFAULT 'mobile_money',
  payment_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.chama_contributions_new ENABLE ROW LEVEL SECURITY;

-- RLS policies for contributions
CREATE POLICY "Members can view their chama contributions"
  ON public.chama_contributions_new
  FOR SELECT
  USING (
    chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Members can insert their own contributions"
  ON public.chama_contributions_new
  FOR INSERT
  WITH CHECK (
    chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid() AND is_active = true)
    AND member_id IN (SELECT id FROM public.chama_members WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins can update contributions in their chamas"
  ON public.chama_contributions_new
  FOR UPDATE
  USING (
    chama_id IN (
      SELECT chama_id FROM public.chama_members 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Function to make a contribution
CREATE OR REPLACE FUNCTION public.make_chama_contribution(
  p_chama_id UUID,
  p_amount NUMERIC,
  p_payment_method VARCHAR DEFAULT 'mobile_money',
  p_payment_reference VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_member_id UUID;
  v_contribution_id UUID;
  v_chama_name TEXT;
  v_user_email TEXT;
BEGIN
  -- Get the member ID for the current user in this chama
  SELECT id INTO v_member_id
  FROM public.chama_members
  WHERE user_id = auth.uid() AND chama_id = p_chama_id AND is_active = true;

  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'You are not an active member of this chama.';
  END IF;

  -- Insert the contribution
  INSERT INTO public.chama_contributions_new (
    chama_id, member_id, amount, payment_method, payment_reference, notes
  ) VALUES (
    p_chama_id, v_member_id, p_amount, p_payment_method, p_payment_reference, p_notes
  ) RETURNING id INTO v_contribution_id;

  -- Update member's total contribution
  UPDATE public.chama_members
  SET total_contributed = total_contributed + p_amount,
      last_contribution_date = now()
  WHERE id = v_member_id;

  -- Update chama's total savings
  UPDATE public.chamas
  SET total_savings = total_savings + p_amount
  WHERE id = p_chama_id;

  -- Get data for activity log
  SELECT c.name INTO v_chama_name FROM public.chamas c WHERE c.id = p_chama_id;
  SELECT au.email INTO v_user_email FROM auth.users au WHERE au.id = auth.uid();

  -- Log the activity
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description, amount)
  VALUES (
    p_chama_id, 
    v_member_id, 
    'contribution_made', 
    FORMAT('%s contributed KES %s to %s.', 
           COALESCE(v_user_email, 'A member'), 
           p_amount::TEXT, 
           v_chama_name),
    p_amount
  );

  RETURN v_contribution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contribution summary for a chama
CREATE OR REPLACE FUNCTION public.get_chama_contribution_summary(p_chama_id UUID)
RETURNS TABLE(
  member_id UUID,
  member_email TEXT,
  total_contributed NUMERIC,
  last_contribution_date TIMESTAMP WITH TIME ZONE,
  contribution_count INTEGER
) AS $$
BEGIN
  -- Check if user is a member of the chama
  IF NOT public.is_chama_member(p_chama_id) THEN
    RAISE EXCEPTION 'You must be a member to view contribution summary.';
  END IF;

  RETURN QUERY
  SELECT 
    cm.id as member_id,
    au.email as member_email,
    cm.total_contributed,
    cm.last_contribution_date,
    COALESCE(contrib_count.count, 0)::INTEGER as contribution_count
  FROM public.chama_members cm
  JOIN auth.users au ON cm.user_id = au.id
  LEFT JOIN (
    SELECT member_id, COUNT(*)::INTEGER as count
    FROM public.chama_contributions_new
    WHERE chama_id = p_chama_id
    GROUP BY member_id
  ) contrib_count ON cm.id = contrib_count.member_id
  WHERE cm.chama_id = p_chama_id AND cm.is_active = true
  ORDER BY cm.total_contributed DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chama_contributions_new_chama_id ON public.chama_contributions_new(chama_id);
CREATE INDEX IF NOT EXISTS idx_chama_contributions_new_member_id ON public.chama_contributions_new(member_id);
CREATE INDEX IF NOT EXISTS idx_chama_contributions_new_date ON public.chama_contributions_new(contribution_date);
