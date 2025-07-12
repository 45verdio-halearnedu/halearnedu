
-- First, create a custom type to represent the combined data structure
CREATE TYPE public.p2p_listing_with_profile AS (
  id uuid,
  user_id uuid,
  type text,
  asset text,
  amount numeric,
  price_per_unit numeric,
  currency text,
  payment_method text,
  description text,
  is_active boolean,
  created_at timestamptz,
  user_profiles json
);

-- Then, create the function to fetch listings and join them with user profiles
CREATE OR REPLACE FUNCTION public.get_p2p_listings_with_profiles()
RETURNS SETOF public.p2p_listing_with_profile
LANGUAGE sql
STABLE
AS $$
  SELECT
    l.id,
    l.user_id,
    l.type,
    l.asset,
    l.amount,
    l.price_per_unit,
    l.currency,
    l.payment_method,
    l.description,
    l.is_active,
    l.created_at,
    json_build_object(
      'display_name', p.display_name,
      'avatar_url', p.avatar_url
    ) AS user_profiles
  FROM
    public.p2p_listings AS l
  LEFT JOIN
    public.user_profiles AS p ON l.user_id = p.user_id
  WHERE
    l.is_active = true
  ORDER BY
    l.created_at DESC;
$$;
