
-- Create a custom type to return from the function for pending members
CREATE TYPE public.pending_member_info AS (
  id UUID,
  user_id UUID,
  joined_at TIMESTAMPTZ,
  email TEXT
);

-- Function to get pending members for a chama (for admins only)
CREATE OR REPLACE FUNCTION public.get_pending_chama_members(p_chama_id UUID)
RETURNS SETOF public.pending_member_info AS $$
BEGIN
  -- Check if the current user is an admin of the chama.
  IF NOT public.is_chama_admin(p_chama_id) THEN
    RAISE EXCEPTION 'You must be an admin to view pending members.';
  END IF;

  -- Return the list of pending members with their email.
  RETURN QUERY
  SELECT cm.id, cm.user_id, cm.joined_at, u.email
  FROM public.chama_members cm
  JOIN auth.users u ON cm.user_id = u.id
  WHERE cm.chama_id = p_chama_id AND cm.is_active = FALSE
  ORDER BY cm.joined_at ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- Function to approve a chama member
CREATE OR REPLACE FUNCTION public.approve_chama_member(member_id_to_approve UUID)
RETURNS VOID AS $$
DECLARE
  v_chama_id UUID;
  v_user_id UUID;
  user_email TEXT;
  chama_name TEXT;
BEGIN
  -- 1. Check if the current user is an admin of the chama this member belongs to.
  SELECT chama_id, user_id INTO v_chama_id, v_user_id
  FROM public.chama_members
  WHERE id = member_id_to_approve;

  IF NOT public.is_chama_admin(v_chama_id) THEN
    RAISE EXCEPTION 'You must be an admin to approve members.';
  END IF;

  -- 2. Update the member to be active.
  UPDATE public.chama_members
  SET is_active = TRUE, joined_at = NOW()
  WHERE id = member_id_to_approve;

  -- 3. Increment the chama's member count.
  UPDATE public.chamas
  SET current_members = current_members + 1
  WHERE id = v_chama_id;
  
  -- 4. Get user email and chama name for the activity log
  SELECT au.email INTO user_email FROM auth.users au WHERE au.id = v_user_id;
  SELECT c.name INTO chama_name FROM public.chamas c WHERE c.id = v_chama_id;
  
  -- 5. Log the activity.
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description)
  VALUES (v_chama_id, member_id_to_approve, 'member_joined', FORMAT('%s has joined %s.', COALESCE(user_email, 'A new member'), chama_name));

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to reject a chama member request
CREATE OR REPLACE FUNCTION public.reject_chama_member(member_id_to_reject UUID)
RETURNS VOID AS $$
DECLARE
  v_chama_id UUID;
  v_user_id UUID;
  user_email TEXT;
  chama_name TEXT;
BEGIN
  -- 1. Check if the current user is an admin of the chama this member belongs to.
  SELECT chama_id, user_id INTO v_chama_id, v_user_id
  FROM public.chama_members
  WHERE id = member_id_to_reject;

  IF NOT public.is_chama_admin(v_chama_id) THEN
    RAISE EXCEPTION 'You must be an admin to reject members.';
  END IF;

  -- 2. Get user email and chama name for the activity log before deleting
  SELECT au.email INTO user_email FROM auth.users au WHERE au.id = v_user_id;
  SELECT c.name INTO chama_name FROM public.chamas c WHERE c.id = v_chama_id;
  
  -- 3. Log the activity.
  INSERT INTO public.chama_activities (chama_id, member_id, activity_type, description)
  VALUES (v_chama_id, NULL, 'request_rejected', FORMAT('The join request for %s was rejected.', COALESCE(user_email, 'a user')));

  -- 4. Delete the member request.
  DELETE FROM public.chama_members
  WHERE id = member_id_to_reject;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
