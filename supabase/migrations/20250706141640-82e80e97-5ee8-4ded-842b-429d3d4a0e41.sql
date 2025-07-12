
-- Add payment approval system tables
CREATE TABLE IF NOT EXISTS public.chama_contribution_approvals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contribution_id uuid REFERENCES public.chama_contributions_new(id) NOT NULL,
  treasurer_id uuid REFERENCES public.chama_members(id) NOT NULL,
  approved_by uuid REFERENCES public.chama_members(id),
  approval_status character varying DEFAULT 'pending',
  treasurer_phone character varying DEFAULT '0705448355',
  payment_reference character varying,
  approved_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on contribution approvals
ALTER TABLE public.chama_contribution_approvals ENABLE ROW LEVEL SECURITY;

-- RLS policies for contribution approvals
CREATE POLICY "Treasurers can manage approvals" ON public.chama_contribution_approvals
FOR ALL USING (public.is_chama_admin_or_treasurer(
  (SELECT c.chama_id FROM public.chama_contributions_new ccn 
   JOIN public.chama_members cm ON ccn.member_id = cm.id 
   WHERE ccn.id = contribution_id)
));

CREATE POLICY "Members can view their contribution approvals" ON public.chama_contribution_approvals
FOR SELECT USING (
  contribution_id IN (
    SELECT ccn.id FROM public.chama_contributions_new ccn
    JOIN public.chama_members cm ON ccn.member_id = cm.id
    WHERE cm.user_id = auth.uid()
  )
);

-- Add payment method options table
CREATE TABLE IF NOT EXISTS public.chama_payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id uuid REFERENCES public.chamas(id) NOT NULL,
  method_type character varying NOT NULL, -- 'till', 'paybill', 'phone'
  method_name character varying NOT NULL,
  method_number character varying NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on payment methods
ALTER TABLE public.chama_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment methods
CREATE POLICY "Chama members can view payment methods" ON public.chama_payment_methods
FOR SELECT USING (public.is_chama_member(chama_id));

CREATE POLICY "Admins can manage payment methods" ON public.chama_payment_methods
FOR ALL USING (public.is_chama_admin_or_treasurer(chama_id));

-- Insert default payment methods for existing chamas
INSERT INTO public.chama_payment_methods (chama_id, method_type, method_name, method_number)
SELECT id, 'phone', 'Treasurer M-Pesa', '0705448355' FROM public.chamas
ON CONFLICT DO NOTHING;

-- Enhanced contribution function with approval workflow
CREATE OR REPLACE FUNCTION public.make_chama_contribution_with_approval(
  p_chama_id uuid,
  p_amount numeric,
  p_payment_method character varying DEFAULT 'mobile_money',
  p_payment_reference character varying DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_payment_method_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_id UUID;
  v_contribution_id UUID;
  v_treasurer_id UUID;
  v_approval_id UUID;
  v_chama_name TEXT;
  v_user_email TEXT;
  v_payment_method_info RECORD;
BEGIN
  -- Get the member ID for the current user in this chama
  SELECT id INTO v_member_id
  FROM public.chama_members
  WHERE user_id = auth.uid() AND chama_id = p_chama_id AND is_active = true;

  IF v_member_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'You are not an active member of this chama.');
  END IF;

  -- Get treasurer ID
  SELECT id INTO v_treasurer_id
  FROM public.chama_members
  WHERE chama_id = p_chama_id AND role = 'treasurer' AND is_active = true
  LIMIT 1;

  -- If no treasurer, get admin
  IF v_treasurer_id IS NULL THEN
    SELECT id INTO v_treasurer_id
    FROM public.chama_members
    WHERE chama_id = p_chama_id AND role = 'admin' AND is_active = true
    LIMIT 1;
  END IF;

  -- Get payment method info if provided
  IF p_payment_method_id IS NOT NULL THEN
    SELECT * INTO v_payment_method_info
    FROM public.chama_payment_methods
    WHERE id = p_payment_method_id AND chama_id = p_chama_id;
  END IF;

  -- Insert the contribution with pending status
  INSERT INTO public.chama_contributions_new (
    chama_id, member_id, amount, payment_method, payment_reference, notes, status
  ) VALUES (
    p_chama_id, v_member_id, p_amount, p_payment_method, p_payment_reference, p_notes, 'pending'
  ) RETURNING id INTO v_contribution_id;

  -- Create approval record
  INSERT INTO public.chama_contribution_approvals (
    contribution_id, treasurer_id, payment_reference
  ) VALUES (
    v_contribution_id, v_treasurer_id, p_payment_reference
  ) RETURNING id INTO v_approval_id;

  -- Get data for activity log
  SELECT c.name INTO v_chama_name FROM public.chamas c WHERE c.id = p_chama_id;
  SELECT au.email INTO v_user_email FROM auth.users au WHERE au.id = auth.uid();

  -- Log the activity
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description, amount)
  VALUES (
    p_chama_id, 
    v_member_id, 
    'contribution_pending', 
    FORMAT('%s submitted a contribution of KES %s to %s (Pending approval).', 
           COALESCE(v_user_email, 'A member'), 
           p_amount::TEXT, 
           v_chama_name),
    p_amount
  );

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Contribution submitted successfully and is pending treasurer approval.',
    'contribution_id', v_contribution_id,
    'approval_id', v_approval_id,
    'treasurer_phone', '0705448355'
  );
END;
$$;

-- Function to approve/reject contributions
CREATE OR REPLACE FUNCTION public.approve_contribution(
  p_approval_id uuid,
  p_approved boolean,
  p_rejection_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_approval_record RECORD;
  v_contribution_record RECORD;
  v_member_record RECORD;
  v_chama_name TEXT;
BEGIN
  -- Get approval record with contribution details
  SELECT ca.*, ccn.chama_id, ccn.member_id, ccn.amount, ccn.payment_method
  INTO v_approval_record
  FROM public.chama_contribution_approvals ca
  JOIN public.chama_contributions_new ccn ON ca.contribution_id = ccn.id
  WHERE ca.id = p_approval_id;

  IF v_approval_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Approval record not found.');
  END IF;

  -- Check if user is treasurer or admin
  IF NOT public.is_chama_admin_or_treasurer(v_approval_record.chama_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Access denied. Treasurer permissions required.');
  END IF;

  IF p_approved THEN
    -- Approve the contribution
    UPDATE public.chama_contribution_approvals
    SET approval_status = 'approved',
        approved_by = (SELECT id FROM public.chama_members WHERE user_id = auth.uid() AND chama_id = v_approval_record.chama_id),
        approved_at = now()
    WHERE id = p_approval_id;

    -- Update contribution status
    UPDATE public.chama_contributions_new
    SET status = 'completed'
    WHERE id = v_approval_record.contribution_id;

    -- Update member's total contribution
    UPDATE public.chama_members
    SET total_contributed = total_contributed + v_approval_record.amount,
        last_contribution_date = now()
    WHERE id = v_approval_record.member_id;

    -- Update chama's total savings
    UPDATE public.chamas
    SET total_savings = total_savings + v_approval_record.amount
    WHERE id = v_approval_record.chama_id;

    -- Log activity
    INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description, amount)
    VALUES (
      v_approval_record.chama_id,
      v_approval_record.member_id,
      'contribution_approved',
      FORMAT('Contribution of KES %s approved by treasurer.', v_approval_record.amount::TEXT),
      v_approval_record.amount
    );

    RETURN jsonb_build_object('success', true, 'message', 'Contribution approved successfully.');
  ELSE
    -- Reject the contribution
    UPDATE public.chama_contribution_approvals
    SET approval_status = 'rejected',
        approved_by = (SELECT id FROM public.chama_members WHERE user_id = auth.uid() AND chama_id = v_approval_record.chama_id),
        approved_at = now(),
        rejection_reason = p_rejection_reason
    WHERE id = p_approval_id;

    -- Update contribution status
    UPDATE public.chama_contributions_new
    SET status = 'rejected'
    WHERE id = v_approval_record.contribution_id;

    -- Log activity
    INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description, amount)
    VALUES (
      v_approval_record.chama_id,
      v_approval_record.member_id,
      'contribution_rejected',
      FORMAT('Contribution of KES %s rejected by treasurer. Reason: %s', 
             v_approval_record.amount::TEXT, 
             COALESCE(p_rejection_reason, 'No reason provided')),
      v_approval_record.amount
    );

    RETURN jsonb_build_object('success', true, 'message', 'Contribution rejected.');
  END IF;
END;
$$;

-- Function to get contribution reports with member details
CREATE OR REPLACE FUNCTION public.get_chama_contribution_report(p_chama_id uuid)
RETURNS TABLE(
  member_name text,
  member_email text,
  member_phone text,
  member_id uuid,
  user_id uuid,
  total_contributed numeric,
  contribution_count bigint,
  last_contribution_date timestamp with time zone,
  pending_contributions numeric,
  approved_contributions numeric,
  rejected_contributions numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin or treasurer
  IF NOT public.is_chama_admin_or_treasurer(p_chama_id) THEN
    RAISE EXCEPTION 'Access denied. Admin or treasurer permissions required.';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(p.full_name, au.email) as member_name,
    au.email as member_email,
    COALESCE(p.phone_number, 'Not provided') as member_phone,
    cm.id as member_id,
    cm.user_id,
    COALESCE(cm.total_contributed, 0) as total_contributed,
    COALESCE(contrib_stats.contribution_count, 0) as contribution_count,
    cm.last_contribution_date,
    COALESCE(contrib_stats.pending_amount, 0) as pending_contributions,
    COALESCE(contrib_stats.approved_amount, 0) as approved_contributions,
    COALESCE(contrib_stats.rejected_amount, 0) as rejected_contributions
  FROM public.chama_members cm
  JOIN auth.users au ON cm.user_id = au.id
  LEFT JOIN public.profiles p ON cm.user_id = p.user_id
  LEFT JOIN (
    SELECT 
      ccn.member_id,
      COUNT(*) as contribution_count,
      SUM(CASE WHEN ccn.status = 'pending' THEN ccn.amount ELSE 0 END) as pending_amount,
      SUM(CASE WHEN ccn.status = 'completed' THEN ccn.amount ELSE 0 END) as approved_amount,
      SUM(CASE WHEN ccn.status = 'rejected' THEN ccn.amount ELSE 0 END) as rejected_amount
    FROM public.chama_contributions_new ccn
    WHERE ccn.chama_id = p_chama_id
    GROUP BY ccn.member_id
  ) contrib_stats ON cm.id = contrib_stats.member_id
  WHERE cm.chama_id = p_chama_id AND cm.is_active = true
  ORDER BY cm.total_contributed DESC;
END;
$$;

-- Function to get pending approvals for treasurers
CREATE OR REPLACE FUNCTION public.get_pending_contribution_approvals(p_chama_id uuid)
RETURNS TABLE(
  approval_id uuid,
  contribution_id uuid,
  member_name text,
  member_email text,
  amount numeric,
  payment_method character varying,
  payment_reference character varying,
  notes text,
  submitted_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin or treasurer
  IF NOT public.is_chama_admin_or_treasurer(p_chama_id) THEN
    RAISE EXCEPTION 'Access denied. Admin or treasurer permissions required.';
  END IF;

  RETURN QUERY
  SELECT 
    ca.id as approval_id,
    ca.contribution_id,
    COALESCE(p.full_name, au.email) as member_name,
    au.email as member_email,
    ccn.amount,
    ccn.payment_method,
    ccn.payment_reference,
    ccn.notes,
    ccn.created_at as submitted_at
  FROM public.chama_contribution_approvals ca
  JOIN public.chama_contributions_new ccn ON ca.contribution_id = ccn.id
  JOIN public.chama_members cm ON ccn.member_id = cm.id
  JOIN auth.users au ON cm.user_id = au.id
  LEFT JOIN public.profiles p ON cm.user_id = p.user_id
  WHERE ccn.chama_id = p_chama_id 
    AND ca.approval_status = 'pending'
  ORDER BY ccn.created_at ASC;
END;
$$;
