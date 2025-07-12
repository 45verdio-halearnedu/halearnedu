
-- Fix the get_chama_contribution_summary function to return correct types
CREATE OR REPLACE FUNCTION public.get_chama_contribution_summary(p_chama_id uuid)
RETURNS TABLE(
  member_id uuid, 
  member_email text, 
  total_contributed numeric, 
  last_contribution_date timestamp with time zone, 
  contribution_count integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is a member of the chama
  IF NOT public.is_chama_member(p_chama_id) THEN
    RAISE EXCEPTION 'You must be a member to view contribution summary.';
  END IF;

  RETURN QUERY
  SELECT 
    cm.id as member_id,
    au.email::text as member_email,
    cm.total_contributed,
    cm.last_contribution_date,
    COALESCE(contrib_count.count, 0)::INTEGER as contribution_count
  FROM public.chama_members cm
  JOIN auth.users au ON cm.user_id = au.id
  LEFT JOIN (
    SELECT ccn.member_id, COUNT(*)::INTEGER as count
    FROM public.chama_contributions_new ccn
    WHERE ccn.chama_id = p_chama_id
    GROUP BY ccn.member_id
  ) contrib_count ON cm.id = contrib_count.member_id
  WHERE cm.chama_id = p_chama_id AND cm.is_active = true
  ORDER BY cm.total_contributed DESC;
END;
$$;

-- Also fix the get_pending_contributions function
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
    au.email::text as member_email,
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
