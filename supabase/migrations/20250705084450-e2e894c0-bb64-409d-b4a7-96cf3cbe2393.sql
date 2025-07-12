
-- Create admin dashboard functions and tables
CREATE OR REPLACE FUNCTION public.get_admin_analytics(p_chama_id uuid)
RETURNS TABLE(
  total_members integer,
  active_members integer,
  pending_members integer,
  total_contributions numeric,
  monthly_contributions numeric,
  total_loans numeric,
  active_loans integer,
  average_contribution numeric,
  contribution_rate numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_chama_admin(p_chama_id) THEN
    RAISE EXCEPTION 'Access denied. Admin permissions required.';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::integer FROM chama_members WHERE chama_id = p_chama_id) as total_members,
    (SELECT COUNT(*)::integer FROM chama_members WHERE chama_id = p_chama_id AND is_active = true) as active_members,
    (SELECT COUNT(*)::integer FROM chama_members WHERE chama_id = p_chama_id AND is_active = false) as pending_members,
    (SELECT COALESCE(SUM(amount), 0) FROM chama_contributions_new WHERE chama_id = p_chama_id) as total_contributions,
    (SELECT COALESCE(SUM(amount), 0) FROM chama_contributions_new WHERE chama_id = p_chama_id AND contribution_date >= date_trunc('month', now())) as monthly_contributions,
    (SELECT COALESCE(SUM(amount), 0) FROM chama_loans WHERE chama_id = p_chama_id) as total_loans,
    (SELECT COUNT(*)::integer FROM chama_loans WHERE chama_id = p_chama_id AND status = 'active') as active_loans,
    (SELECT COALESCE(AVG(amount), 0) FROM chama_contributions_new WHERE chama_id = p_chama_id) as average_contribution,
    (SELECT CASE WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN last_contribution_date >= date_trunc('month', now()) THEN 1 END) * 100.0 / COUNT(*)) ELSE 0 END FROM chama_members WHERE chama_id = p_chama_id AND is_active = true) as contribution_rate;
END;
$$;

-- Create central wallet transactions table
CREATE TABLE IF NOT EXISTS public.chama_wallet_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id uuid REFERENCES public.chamas(id) NOT NULL,
  transaction_type character varying NOT NULL, -- 'deposit', 'withdrawal', 'transfer'
  amount numeric NOT NULL,
  description text,
  processed_by uuid REFERENCES public.chama_members(id),
  payment_method character varying DEFAULT 'mobile_money',
  payment_reference character varying,
  status character varying DEFAULT 'completed',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on wallet transactions
ALTER TABLE public.chama_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallet transactions
CREATE POLICY "Admins can manage wallet transactions" ON public.chama_wallet_transactions
FOR ALL USING (public.is_chama_admin_or_treasurer(chama_id));

CREATE POLICY "Members can view wallet transactions" ON public.chama_wallet_transactions
FOR SELECT USING (public.is_chama_member(chama_id));

-- Function to record manual deposit
CREATE OR REPLACE FUNCTION public.record_manual_deposit(
  p_chama_id uuid,
  p_amount numeric,
  p_payment_method character varying DEFAULT 'mobile_money',
  p_payment_reference character varying DEFAULT NULL,
  p_description text DEFAULT 'Manual deposit by treasurer'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Check if user is admin or treasurer
  IF NOT public.is_chama_admin_or_treasurer(p_chama_id) THEN
    RAISE EXCEPTION 'Access denied. Admin or treasurer permissions required.';
  END IF;

  -- Get the member ID for the current user
  SELECT id INTO v_member_id
  FROM public.chama_members
  WHERE user_id = auth.uid() AND chama_id = p_chama_id AND is_active = true;

  -- Record the transaction
  INSERT INTO public.chama_wallet_transactions (
    chama_id, transaction_type, amount, description, processed_by, payment_method, payment_reference
  ) VALUES (
    p_chama_id, 'deposit', p_amount, p_description, v_member_id, p_payment_method, p_payment_reference
  ) RETURNING id INTO v_transaction_id;

  -- Update chama total savings
  UPDATE public.chamas
  SET total_savings = total_savings + p_amount
  WHERE id = p_chama_id;

  -- Log activity
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description, amount)
  VALUES (
    p_chama_id, 
    v_member_id, 
    'manual_deposit', 
    FORMAT('Manual deposit of KES %s processed', p_amount::TEXT),
    p_amount
  );

  RETURN v_transaction_id;
END;
$$;

-- Function to process payment/withdrawal
CREATE OR REPLACE FUNCTION public.process_payment(
  p_chama_id uuid,
  p_amount numeric,
  p_payment_method character varying DEFAULT 'mobile_money',
  p_payment_reference character varying DEFAULT NULL,
  p_description text DEFAULT 'Payment processed by treasurer'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_id UUID;
  v_transaction_id UUID;
  v_current_balance NUMERIC;
BEGIN
  -- Check if user is admin or treasurer
  IF NOT public.is_chama_admin_or_treasurer(p_chama_id) THEN
    RAISE EXCEPTION 'Access denied. Admin or treasurer permissions required.';
  END IF;

  -- Check available balance
  SELECT total_savings INTO v_current_balance FROM public.chamas WHERE id = p_chama_id;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds. Available balance: KES %', v_current_balance;
  END IF;

  -- Get the member ID for the current user
  SELECT id INTO v_member_id
  FROM public.chama_members
  WHERE user_id = auth.uid() AND chama_id = p_chama_id AND is_active = true;

  -- Record the transaction
  INSERT INTO public.chama_wallet_transactions (
    chama_id, transaction_type, amount, description, processed_by, payment_method, payment_reference
  ) VALUES (
    p_chama_id, 'withdrawal', p_amount, p_description, v_member_id, p_payment_method, p_payment_reference
  ) RETURNING id INTO v_transaction_id;

  -- Update chama total savings
  UPDATE public.chamas
  SET total_savings = total_savings - p_amount
  WHERE id = p_chama_id;

  -- Log activity
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description, amount)
  VALUES (
    p_chama_id, 
    v_member_id, 
    'payment_processed', 
    FORMAT('Payment of KES %s processed', p_amount::TEXT),
    p_amount
  );

  RETURN v_transaction_id;
END;
$$;

-- Function to get pending contributions (members who haven't contributed this month)
CREATE OR REPLACE FUNCTION public.get_pending_contributions(p_chama_id uuid)
RETURNS TABLE(
  member_id uuid,
  member_email text,
  last_contribution_date timestamp with time zone,
  days_overdue integer,
  expected_amount numeric
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
    cm.id as member_id,
    au.email as member_email,
    cm.last_contribution_date,
    CASE 
      WHEN cm.last_contribution_date IS NULL THEN EXTRACT(days FROM now() - cm.joined_at)::integer
      ELSE EXTRACT(days FROM now() - cm.last_contribution_date)::integer
    END as days_overdue,
    c.contribution_amount as expected_amount
  FROM public.chama_members cm
  JOIN auth.users au ON cm.user_id = au.id
  JOIN public.chamas c ON cm.chama_id = c.id
  WHERE cm.chama_id = p_chama_id 
    AND cm.is_active = true
    AND (
      cm.last_contribution_date IS NULL OR 
      cm.last_contribution_date < date_trunc('month', now())
    )
  ORDER BY 
    CASE 
      WHEN cm.last_contribution_date IS NULL THEN cm.joined_at
      ELSE cm.last_contribution_date
    END ASC;
END;
$$;
