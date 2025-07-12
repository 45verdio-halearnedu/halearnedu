-- Add payment details and loan agreement tables for the loan workflow

-- Add payment details to loan offers
ALTER TABLE public.loan_offers 
ADD COLUMN payment_method TEXT,
ADD COLUMN payment_number TEXT,
ADD COLUMN disbursement_status TEXT DEFAULT 'pending',
ADD COLUMN disbursed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN agreement_terms JSONB;

-- Create loan agreements table
CREATE TABLE public.loan_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID REFERENCES public.loan_applications(id) NOT NULL,
  loan_offer_id UUID REFERENCES public.loan_offers(id) NOT NULL,
  borrower_id UUID NOT NULL,
  investor_id UUID NOT NULL,
  principal_amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  duration_months INTEGER NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  total_payment NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_number TEXT NOT NULL,
  disbursed_amount NUMERIC DEFAULT 0,
  repaid_amount NUMERIC DEFAULT 0,
  next_payment_due DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on loan agreements
ALTER TABLE public.loan_agreements ENABLE ROW LEVEL SECURITY;

-- Create policies for loan agreements
CREATE POLICY "Borrowers can view their agreements" 
  ON public.loan_agreements 
  FOR SELECT 
  USING (auth.uid() = borrower_id);

CREATE POLICY "Investors can view their agreements" 
  ON public.loan_agreements 
  FOR SELECT 
  USING (auth.uid() = investor_id);

CREATE POLICY "System can create agreements" 
  ON public.loan_agreements 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update agreements" 
  ON public.loan_agreements 
  FOR UPDATE 
  USING (true);

-- Create loan repayments table
CREATE TABLE public.loan_repayments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID REFERENCES public.loan_agreements(id) NOT NULL,
  borrower_id UUID NOT NULL,
  investor_id UUID NOT NULL,
  payment_amount NUMERIC NOT NULL,
  principal_amount NUMERIC NOT NULL,
  interest_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  mpesa_receipt_number TEXT,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on loan repayments
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;

-- Create policies for loan repayments
CREATE POLICY "Borrowers can view their repayments" 
  ON public.loan_repayments 
  FOR SELECT 
  USING (auth.uid() = borrower_id);

CREATE POLICY "Investors can view their repayments" 
  ON public.loan_repayments 
  FOR SELECT 
  USING (auth.uid() = investor_id);

CREATE POLICY "Borrowers can create repayments" 
  ON public.loan_repayments 
  FOR INSERT 
  WITH CHECK (auth.uid() = borrower_id);

-- Create notifications table for loan workflow
CREATE TABLE public.loan_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'offer_received', 'offer_accepted', 'payment_requested', 'payment_sent', 'repayment_due'
  reference_id UUID, -- Can be loan_application_id, loan_offer_id, or agreement_id
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.loan_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their notifications" 
  ON public.loan_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.loan_notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their notifications" 
  ON public.loan_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to create loan agreement when offer is accepted
CREATE OR REPLACE FUNCTION public.create_loan_agreement(
  p_loan_offer_id UUID,
  p_payment_method TEXT,
  p_payment_number TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer_record RECORD;
  v_application_record RECORD;
  v_agreement_id UUID;
  v_monthly_payment NUMERIC;
  v_total_payment NUMERIC;
  v_next_payment_due DATE;
BEGIN
  -- Get offer details
  SELECT * INTO v_offer_record
  FROM public.loan_offers
  WHERE id = p_loan_offer_id;

  -- Get application details
  SELECT * INTO v_application_record
  FROM public.loan_applications
  WHERE id = v_offer_record.loan_application_id;

  -- Calculate payments
  v_monthly_payment := (v_offer_record.offered_amount * (1 + (v_offer_record.offered_interest_rate / 100))) / v_application_record.duration_months;
  v_total_payment := v_monthly_payment * v_application_record.duration_months;
  v_next_payment_due := CURRENT_DATE + INTERVAL '1 month';

  -- Create agreement
  INSERT INTO public.loan_agreements (
    loan_application_id,
    loan_offer_id,
    borrower_id,
    investor_id,
    principal_amount,
    interest_rate,
    duration_months,
    monthly_payment,
    total_payment,
    payment_method,
    payment_number,
    next_payment_due
  ) VALUES (
    v_offer_record.loan_application_id,
    p_loan_offer_id,
    v_application_record.borrower_id,
    v_offer_record.investor_id,
    v_offer_record.offered_amount,
    v_offer_record.offered_interest_rate,
    v_application_record.duration_months,
    v_monthly_payment,
    v_total_payment,
    p_payment_method,
    p_payment_number,
    v_next_payment_due
  ) RETURNING id INTO v_agreement_id;

  -- Update offer status
  UPDATE public.loan_offers
  SET status = 'accepted',
      payment_method = p_payment_method,
      payment_number = p_payment_number,
      updated_at = now()
  WHERE id = p_loan_offer_id;

  -- Update application status
  UPDATE public.loan_applications
  SET status = 'funded',
      updated_at = now()
  WHERE id = v_offer_record.loan_application_id;

  -- Create notification for investor
  INSERT INTO public.loan_notifications (
    user_id,
    title,
    message,
    type,
    reference_id
  ) VALUES (
    v_offer_record.investor_id,
    'Payment Details Provided',
    'The borrower has provided payment details. You can now disburse the loan.',
    'payment_requested',
    v_agreement_id
  );

  RETURN v_agreement_id;
END;
$$;