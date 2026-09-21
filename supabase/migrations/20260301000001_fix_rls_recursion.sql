-- Create private schema for security functions if not exists
CREATE SCHEMA IF NOT EXISTS private;

-- Create the helper function
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid();
$$;

-- Revoke default execute and grant to authenticated
REVOKE EXECUTE ON FUNCTION private.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO service_role;

-- Replace policies
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (private.is_admin());

DROP POLICY IF EXISTS "Admins have full access to subscriptions" ON public.subscriptions;
CREATE POLICY "Admins have full access to subscriptions" ON public.subscriptions FOR ALL USING (private.is_admin());

DROP POLICY IF EXISTS "Admins have full access to scores" ON public.scores;
CREATE POLICY "Admins have full access to scores" ON public.scores FOR ALL USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can manage charities" ON public.charities;
CREATE POLICY "Admins can manage charities" ON public.charities FOR ALL USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can manage draws" ON public.draws;
CREATE POLICY "Admins can manage draws" ON public.draws FOR ALL USING (private.is_admin());

DROP POLICY IF EXISTS "Admins have full access to draw entries" ON public.draw_entries;
CREATE POLICY "Admins have full access to draw entries" ON public.draw_entries FOR ALL USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can manage winners" ON public.winners;
CREATE POLICY "Admins can manage winners" ON public.winners FOR ALL USING (private.is_admin());
