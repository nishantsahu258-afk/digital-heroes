-- ============================================================
-- AUTH FIX: Fix handle_new_user trigger function and profiles RLS
-- ============================================================

-- 1. Recreate the handle_new_user trigger function with exact schema-matching columns
-- SECURITY DEFINER allows inserting into public.profiles as postgres
-- SET search_path = '' prevents search_path hijacking
-- Only existing columns are inserted (id, email, role, charity_id, charity_contribution_percent)
-- Foreign key validity for charity_id is verified before insertion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_charity_id UUID := NULL;
  v_raw_charity TEXT;
BEGIN
  -- Extract charity_id metadata if provided
  v_raw_charity := new.raw_user_meta_data->>'charity_id';
  
  -- Validate UUID format and ensure it exists in charities table to prevent FK violations
  IF v_raw_charity IS NOT NULL AND v_raw_charity ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    IF EXISTS (SELECT 1 FROM public.charities WHERE id = v_raw_charity::UUID) THEN
      v_charity_id := v_raw_charity::UUID;
    END IF;
  END IF;

  -- Insert profile row with existing columns only
  INSERT INTO public.profiles (
    id,
    email,
    role,
    charity_id,
    charity_contribution_percent
  )
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    'user',
    v_charity_id,
    10
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log warning without aborting auth.users creation
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
    RETURN new;
END;
$$;

-- 2. Ensure the trigger is attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Ensure permissions and policies on profiles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON TABLE public.profiles TO postgres, anon, authenticated, service_role;

-- Ensure user can insert own profile as fallback if needed
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure users can read their own profile
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update their charity info" ON public.profiles;
CREATE POLICY "Users can update their charity info" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- 4. Ensure private.is_admin exists and works cleanly
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO postgres, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION private.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO service_role;

-- Admin access policy using private.is_admin()
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles 
  FOR ALL USING (private.is_admin());
