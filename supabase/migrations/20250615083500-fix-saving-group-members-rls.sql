
-- Fix infinite recursion in saving_group_members RLS policies

-- Create security definer function to check if user is member of a group
CREATE OR REPLACE FUNCTION public.is_saving_group_member(group_id_to_check uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.saving_group_members
    WHERE user_id = auth.uid() AND group_id = group_id_to_check AND is_active = true
  );
$$;

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Group members can view group memberships" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can update their membership" ON public.saving_group_members;

-- Create new RLS policies without recursion
CREATE POLICY "Users can view their own memberships"
  ON public.saving_group_members
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view memberships of groups they belong to"
  ON public.saving_group_members
  FOR SELECT
  USING (
    group_id IN (
      SELECT DISTINCT sgm.group_id 
      FROM public.saving_group_members sgm 
      WHERE sgm.user_id = auth.uid() AND sgm.is_active = true
    )
  );

CREATE POLICY "Users can join groups themselves"
  ON public.saving_group_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership"
  ON public.saving_group_members
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_saving_group_member(uuid) TO authenticated;
