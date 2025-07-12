
-- Drop all existing policies on saving_group_members to start fresh
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can view memberships of groups they belong to" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can join groups themselves" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.saving_group_members;

-- Create simplified RLS policies that don't cause recursion
CREATE POLICY "Users can view their own memberships only"
  ON public.saving_group_members
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships"
  ON public.saving_group_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships"
  ON public.saving_group_members
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships"
  ON public.saving_group_members
  FOR DELETE
  USING (auth.uid() = user_id);
