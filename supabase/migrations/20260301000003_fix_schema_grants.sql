-- Fix missing standard Supabase permissions on public schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant USAGE on private schema so authenticated and anon roles can evaluate RLS functions located there
GRANT USAGE ON SCHEMA private TO postgres, anon, authenticated, service_role;
