
-- Auto-assign admin role to first user if no admins exist
CREATE OR REPLACE FUNCTION public.auto_assign_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If no admin exists yet, make this user an admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on profile creation (which happens on every signup via handle_new_user)
CREATE TRIGGER on_profile_created_assign_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_first_admin();

-- Assign admin role to the existing user who has no role
INSERT INTO public.user_roles (user_id, role)
SELECT '7c8fee23-a500-4b8d-b414-d853be4a81b1', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = '7c8fee23-a500-4b8d-b414-d853be4a81b1' AND role = 'admin'
);
