-- Harden profile role management: only admins may modify role or aktif.
DROP POLICY IF EXISTS profiles_update_name_for_self ON public.profiles;
DROP POLICY IF EXISTS profiles_update_role_for_admin ON public.profiles;

CREATE POLICY profiles_update_for_admin ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can read their own profile so login routing works; elevated roles still list profiles.
DROP POLICY IF EXISTS profiles_read_for_auth ON public.profiles;
CREATE POLICY profiles_read_own_or_guru ON public.profiles
  FOR SELECT
  USING (id = auth.uid() OR public.is_guru());
