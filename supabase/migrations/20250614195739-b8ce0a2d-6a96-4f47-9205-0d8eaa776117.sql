
-- Create loan_applications table enhancements
ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS purpose TEXT,
ADD COLUMN IF NOT EXISTS repayment_method TEXT DEFAULT 'wallet',
ADD COLUMN IF NOT EXISTS guarantors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS eligibility_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_payment_due DATE;

-- Create loan repayments table for tracking payments
CREATE TABLE IF NOT EXISTS public.loan_repayments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  late_fee NUMERIC DEFAULT 0,
  proof_of_payment_url TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create loan policies table for admin configuration
CREATE TABLE IF NOT EXISTS public.loan_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_type TEXT NOT NULL, -- 'interest_rate', 'max_amount', 'eligibility_criteria', etc.
  policy_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create loan notifications table
CREATE TABLE IF NOT EXISTS public.loan_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loan_application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'due_reminder', 'approval', 'rejection', 'overdue'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for loan_repayments
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loan repayments" ON public.loan_repayments 
FOR SELECT USING (
  loan_application_id IN (
    SELECT id FROM loan_applications WHERE borrower_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own loan repayments" ON public.loan_repayments 
FOR INSERT WITH CHECK (
  loan_application_id IN (
    SELECT id FROM loan_applications WHERE borrower_id = auth.uid()
  )
);

-- Add RLS policies for loan_policies (admin only for modifications)
ALTER TABLE public.loan_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view loan policies" ON public.loan_policies 
FOR SELECT TO authenticated USING (is_active = true);

-- Add RLS policies for loan_notifications
ALTER TABLE public.loan_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loan notifications" ON public.loan_notifications 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own loan notifications" ON public.loan_notifications 
FOR UPDATE USING (user_id = auth.uid());

-- Add function to calculate loan eligibility
CREATE OR REPLACE FUNCTION public.calculate_loan_eligibility(user_id_param UUID, requested_amount NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  user_profile RECORD;
  total_contributions NUMERIC := 0;
  active_loans_count INTEGER := 0;
  eligibility_score NUMERIC := 0;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM user_profiles WHERE user_id = user_id_param;
  
  -- Calculate total contributions (simplified - you might want to make this more sophisticated)
  SELECT COALESCE(SUM(amount), 0) INTO total_contributions 
  FROM chama_contributions cc
  JOIN chama_members cm ON cc.member_id = cm.id
  WHERE cm.user_id = user_id_param;
  
  -- Count active loans
  SELECT COUNT(*) INTO active_loans_count 
  FROM loan_applications 
  WHERE borrower_id = user_id_param AND status IN ('active', 'approved');
  
  -- Calculate eligibility score (0-100)
  eligibility_score := LEAST(100, 
    (total_contributions / GREATEST(requested_amount, 1)) * 50 + -- 50% based on contribution ratio
    (CASE WHEN active_loans_count = 0 THEN 30 ELSE GREATEST(0, 30 - active_loans_count * 10) END) + -- 30% based on existing loans
    20 -- 20% base score
  );
  
  RETURN ROUND(eligibility_score, 2);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Insert default loan policies
INSERT INTO loan_policies (policy_type, policy_value) VALUES 
  ('default_interest_rate', '{"rate": 5.0, "description": "Default annual interest rate"}'),
  ('max_loan_amount', '{"amount": 50000, "description": "Maximum loan amount in local currency"}'),
  ('min_eligibility_score', '{"score": 60, "description": "Minimum eligibility score required for loan approval"}'),
  ('late_payment_penalty', '{"rate": 2.0, "description": "Late payment penalty percentage"}')
ON CONFLICT DO NOTHING;
