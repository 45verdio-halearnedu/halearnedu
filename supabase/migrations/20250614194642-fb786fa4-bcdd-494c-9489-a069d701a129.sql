
-- supabase/migrations/20250614211500_refactor_chama_rls_policies.sql

-- 1. Create helper functions with SECURITY DEFINER to prevent recursion
-- Checks if the current user is a member of a specific chama.
CREATE OR REPLACE FUNCTION public.is_chama_member(chama_id_to_check uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE user_id = auth.uid() AND chama_id = chama_id_to_check AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Checks if the current user is an admin of a specific chama.
CREATE OR REPLACE FUNCTION public.is_chama_admin(chama_id_to_check uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE user_id = auth.uid() AND chama_id = chama_id_to_check AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Checks if the current user is an admin or treasurer of a specific chama.
CREATE OR REPLACE FUNCTION public.is_chama_admin_or_treasurer(chama_id_to_check uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chama_members
    WHERE user_id = auth.uid() AND chama_id = chama_id_to_check AND role IN ('admin', 'treasurer') AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- 2. Drop old policies
DROP POLICY IF EXISTS "Users can view chamas they are members of" ON public.chamas;
DROP POLICY IF EXISTS "Chama admins can update their chamas" ON public.chamas;
DROP POLICY IF EXISTS "Users can view chama members of their chamas" ON public.chama_members;
DROP POLICY IF EXISTS "Chama admins can manage members" ON public.chama_members;
DROP POLICY IF EXISTS "Members can view their chama activities" ON public.chama_activities;
DROP POLICY IF EXISTS "Members can insert activities for their chama" ON public.chama_activities;
DROP POLICY IF EXISTS "Members can view loan repayments for their chama" ON public.chama_loan_repayments;
DROP POLICY IF EXISTS "Members can view settings for their chama" ON public.chama_settings;
DROP POLICY IF EXISTS "Admins/treasurers can update settings for their chama" ON public.chama_settings;
DROP POLICY IF EXISTS "Members can view messages for their chama" ON public.chama_messages;
DROP POLICY IF EXISTS "Members can send messages in their chama" ON public.chama_messages;
DROP POLICY IF EXISTS "Members can view reputation" ON public.member_reputation;


-- 3. Create new, improved policies using the helper functions
-- on chamas
CREATE POLICY "Users can view chamas they are members of" ON public.chamas FOR SELECT USING (public.is_chama_member(id));
CREATE POLICY "Chama admins can update their chamas" ON public.chamas FOR UPDATE USING (public.is_chama_admin_or_treasurer(id));

-- on chama_members (This is where recursion was a risk)
CREATE POLICY "Users can view members of their chamas" ON public.chama_members FOR SELECT USING (public.is_chama_member(chama_id));
CREATE POLICY "Chama admins can manage members" ON public.chama_members FOR ALL USING (public.is_chama_admin(chama_id));

-- on chama_activities
CREATE POLICY "Members can view their chama activities" ON public.chama_activities FOR SELECT USING (public.is_chama_member(chama_id));
CREATE POLICY "Members can insert activities for their chama" ON public.chama_activities FOR INSERT WITH CHECK (public.is_chama_member(chama_id));

-- on chama_loan_repayments
CREATE POLICY "Members can view loan repayments for their chama" ON public.chama_loan_repayments FOR SELECT USING (EXISTS (SELECT 1 FROM public.chama_loans l WHERE l.id = loan_id AND public.is_chama_member(l.chama_id)));

-- on chama_settings
CREATE POLICY "Members can view settings for their chama" ON public.chama_settings FOR SELECT USING (public.is_chama_member(chama_id));
CREATE POLICY "Admins/treasurers can update settings for their chama" ON public.chama_settings FOR UPDATE USING (public.is_chama_admin_or_treasurer(chama_id));

-- on chama_messages
CREATE POLICY "Members can view messages for their chama" ON public.chama_messages FOR SELECT USING (public.is_chama_member(chama_id));
CREATE POLICY "Members can send messages in their chama" ON public.chama_messages FOR INSERT WITH CHECK (public.is_chama_member(chama_id));

-- on member_reputation
CREATE POLICY "Members can view reputation" ON public.member_reputation FOR SELECT USING (public.is_chama_member(chama_id));

