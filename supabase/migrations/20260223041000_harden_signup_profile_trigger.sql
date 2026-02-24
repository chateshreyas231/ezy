-- Harden signup provisioning to avoid client-side RLS failures on profiles/users writes.
-- This trigger creates profiles + users rows from auth.users metadata.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  requested_role text;
  safe_role text;
  safe_name text;
BEGIN
  requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'buyer');

  safe_role := CASE
    WHEN requested_role IN ('buyer', 'seller', 'buyer_agent', 'seller_agent', 'support')
      THEN requested_role
    ELSE 'buyer'
  END;

  safe_name := NULLIF(COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), '');

  INSERT INTO public.profiles (
    id,
    role,
    display_name,
    verification_level
  )
  VALUES (
    NEW.id,
    safe_role,
    safe_name,
    0
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = EXCLUDED.role,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    updated_at = now();

  INSERT INTO public.users (
    id,
    email,
    name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    safe_name,
    safe_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

