-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, handicap, charity_id, charity_contribution_percent)
  VALUES (
    new.id,
    new.email,
    'user',
    NULLIF(new.raw_user_meta_data->>'handicap', '')::DECIMAL,
    NULLIF(new.raw_user_meta_data->>'charity_id', '')::UUID,
    10
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
