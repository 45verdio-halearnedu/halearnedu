
-- Disable Row Level Security on saving_group_members to fix the recursion error
-- WARNING: This makes the table's data accessible to all authenticated users.
ALTER TABLE public.saving_group_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on the table to ensure a clean state
DROP POLICY IF EXISTS "Users can view their own memberships only" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can view memberships of groups they belong to" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can join groups themselves" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.saving_group_members;
DROP POLICY IF EXISTS "Users can view members of their chamas" ON public.saving_group_members;
DROP POLICY IF EXISTS "Chama admins can manage members" ON public.saving_group_members;
