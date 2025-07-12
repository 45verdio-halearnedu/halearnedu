
-- Create M-Pesa transactions table
CREATE TABLE public.mpesa_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  transaction_type VARCHAR NOT NULL, -- 'c2b', 'b2c', 'stk_push'
  amount NUMERIC NOT NULL,
  phone_number VARCHAR NOT NULL,
  merchant_request_id VARCHAR,
  checkout_request_id VARCHAR,
  mpesa_receipt_number VARCHAR,
  transaction_date TIMESTAMP WITH TIME ZONE,
  result_code INTEGER,
  result_desc TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'cancelled'
  callback_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own M-Pesa transactions" 
  ON public.mpesa_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own M-Pesa transactions" 
  ON public.mpesa_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update M-Pesa transactions" 
  ON public.mpesa_transactions 
  FOR UPDATE 
  USING (true);

-- Create M-Pesa payment methods table for chamas
CREATE TABLE public.chama_mpesa_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES public.chamas(id) NOT NULL,
  method_type VARCHAR NOT NULL, -- 'till', 'paybill', 'phone'
  method_name VARCHAR NOT NULL,
  method_number VARCHAR NOT NULL,
  account_number VARCHAR, -- For paybill
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for chama M-Pesa methods
ALTER TABLE public.chama_mpesa_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chama members can view M-Pesa methods" 
  ON public.chama_mpesa_methods 
  FOR SELECT 
  USING (is_chama_member(chama_id));

CREATE POLICY "Chama admins can manage M-Pesa methods" 
  ON public.chama_mpesa_methods 
  FOR ALL 
  USING (is_chama_admin_or_treasurer(chama_id))
  WITH CHECK (is_chama_admin_or_treasurer(chama_id));

-- Function to initiate STK Push
CREATE OR REPLACE FUNCTION public.initiate_mpesa_payment(
  p_phone_number VARCHAR,
  p_amount NUMERIC,
  p_account_reference VARCHAR DEFAULT 'Payment',
  p_transaction_desc VARCHAR DEFAULT 'Payment'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id UUID;
  v_result jsonb;
BEGIN
  -- Insert transaction record
  INSERT INTO public.mpesa_transactions (
    user_id, transaction_type, amount, phone_number, status
  ) VALUES (
    auth.uid(), 'stk_push', p_amount, p_phone_number, 'pending'
  ) RETURNING id INTO v_transaction_id;

  -- Return transaction details for frontend processing
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'message', 'Transaction initiated. Please complete payment on your phone.'
  );
END;
$$;

-- Function to handle M-Pesa callback
CREATE OR REPLACE FUNCTION public.process_mpesa_callback(
  p_transaction_id UUID,
  p_result_code INTEGER,
  p_result_desc TEXT,
  p_mpesa_receipt_number VARCHAR DEFAULT NULL,
  p_callback_data JSONB DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction RECORD;
  v_status VARCHAR;
BEGIN
  -- Determine status based on result code
  v_status := CASE 
    WHEN p_result_code = 0 THEN 'success'
    ELSE 'failed'
  END;

  -- Update transaction
  UPDATE public.mpesa_transactions
  SET 
    result_code = p_result_code,
    result_desc = p_result_desc,
    mpesa_receipt_number = p_mpesa_receipt_number,
    status = v_status,
    callback_data = p_callback_data,
    transaction_date = CASE WHEN p_result_code = 0 THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = p_transaction_id
  RETURNING * INTO v_transaction;

  -- If successful and it's a contribution, update user wallet
  IF v_status = 'success' THEN
    UPDATE public.user_wallets
    SET balance = balance + (v_transaction.amount / 130) -- Convert KES to USD approximation
    WHERE user_id = v_transaction.user_id;

    -- Add wallet transaction record
    INSERT INTO public.wallet_transactions (
      user_id, type, amount, description, status
    ) VALUES (
      v_transaction.user_id,
      'mpesa_deposit',
      v_transaction.amount / 130,
      FORMAT('M-Pesa deposit - %s', v_transaction.mpesa_receipt_number),
      'completed'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', v_status,
    'message', CASE WHEN v_status = 'success' THEN 'Payment completed successfully' ELSE 'Payment failed' END
  );
END;
$$;

-- Add M-Pesa payment option to existing payment methods hook
INSERT INTO public.chama_mpesa_methods (chama_id, method_type, method_name, method_number)
SELECT 
  id as chama_id,
  'phone' as method_type,
  'M-Pesa STK Push' as method_name,
  'STK_PUSH' as method_number
FROM public.chamas
WHERE NOT EXISTS (
  SELECT 1 FROM public.chama_mpesa_methods 
  WHERE chama_id = chamas.id AND method_type = 'phone'
);
