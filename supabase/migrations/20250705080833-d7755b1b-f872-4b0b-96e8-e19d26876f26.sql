
-- Fix the get_pending_chama_members function to handle the type mismatch
DROP FUNCTION IF EXISTS public.get_pending_chama_members(uuid);

CREATE OR REPLACE FUNCTION public.get_pending_chama_members(p_chama_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  joined_at timestamp with time zone,
  email text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is an admin of the chama.
  IF NOT public.is_chama_admin(p_chama_id) THEN
    RAISE EXCEPTION 'You must be an admin to view pending members.';
  END IF;

  -- Return the list of pending members with their email.
  RETURN QUERY
  SELECT 
    cm.id, 
    cm.user_id, 
    cm.joined_at, 
    au.email::text as email
  FROM public.chama_members cm
  JOIN auth.users au ON cm.user_id = au.id
  WHERE cm.chama_id = p_chama_id AND cm.is_active = FALSE
  ORDER BY cm.joined_at ASC;
END;
$$;

-- Fix the get_chama_contribution_summary function to resolve ambiguous column reference
DROP FUNCTION IF EXISTS public.get_chama_contribution_summary(uuid);

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
    au.email as member_email,
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
