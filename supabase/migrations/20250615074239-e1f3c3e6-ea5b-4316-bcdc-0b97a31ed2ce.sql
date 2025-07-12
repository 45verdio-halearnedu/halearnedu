
-- Function to create a P2P trade (escrow) and deactivate the listing
CREATE OR REPLACE FUNCTION public.create_p2p_trade(p_listing_id uuid)
RETURNS uuid -- return the new escrow id
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_listing public.p2p_listings;
  v_buyer_id uuid;
  v_seller_id uuid;
  v_new_escrow_id uuid;
BEGIN
  -- 1. Get the listing details and lock it for update
  SELECT * INTO v_listing FROM public.p2p_listings WHERE id = p_listing_id AND is_active = true FOR UPDATE;

  -- 2. Check if listing exists and is not active
  IF v_listing IS NULL THEN
    RAISE EXCEPTION 'Listing not found or is not active.';
  END IF;

  -- 3. Check that the user is not trading with themselves
  IF v_listing.user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot trade with yourself.';
  END IF;
  
  -- 4. Determine buyer and seller
  IF v_listing.type = 'sell' THEN
    -- The listing creator is selling, the current user is buying
    v_seller_id := v_listing.user_id;
    v_buyer_id := auth.uid();
  ELSE -- type is 'buy'
    -- The listing creator is buying, the current user is selling
    v_buyer_id := v_listing.user_id;
    v_seller_id := auth.uid();
  END IF;

  -- 5. Create the escrow record
  INSERT INTO public.p2p_escrows (listing_id, buyer_id, seller_id, asset, amount, currency, status)
  VALUES (p_listing_id, v_buyer_id, v_seller_id, v_listing.asset, v_listing.amount, v_listing.currency, 'pending')
  RETURNING id INTO v_new_escrow_id;
  
  -- 6. Deactivate the original listing
  UPDATE public.p2p_listings
  SET is_active = false
  WHERE id = p_listing_id;

  -- 7. Return the new escrow ID
  RETURN v_new_escrow_id;
END;
$$;
