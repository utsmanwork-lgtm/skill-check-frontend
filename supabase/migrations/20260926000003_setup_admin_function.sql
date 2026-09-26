-- Edge function: provision or rotate admin test credential (service-role only)
CREATE OR REPLACE FUNCTION public.setup_admin_test_credential(
  p_email TEXT,
  p_password TEXT
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_created BOOLEAN;
BEGIN
  -- Verify caller is using service role (auth.uid() will be NULL for service-role calls)
  IF auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'This function requires service-role authentication';
  END IF;

  -- Create or find user
  BEGIN
    v_user_id := (SELECT id FROM auth.users WHERE email = p_email LIMIT 1);
    IF v_user_id IS NULL THEN
      -- Create new user
      SELECT id INTO v_user_id FROM auth.users
        WHERE email = auth.users.email
        LIMIT 1;
      -- If user still doesn't exist, we rely on the calling code to create via admin API
      RAISE EXCEPTION 'User % does not exist; create via admin API first', p_email;
    END IF;
    v_created := FALSE;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'User lookup failed: %', SQLEM;
  END;

  -- Update password and role
  UPDATE auth.users
    SET encrypted_password = crypt(p_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = v_user_id;

  UPDATE public.profiles
    SET role = 'admin', aktif = true, updated_at = NOW()
    WHERE id = v_user_id;

  RETURN JSON_BUILD_OBJECT(
    'user_id', v_user_id,
    'email', p_email,
    'role', 'admin',
    'provisioned_at', NOW(),
    'message', 'Test admin credential provisioned via service-role'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.setup_admin_test_credential(TEXT, TEXT) TO service_role;
REVOKE EXECUTE ON FUNCTION public.setup_admin_test_credential(TEXT, TEXT) FROM authenticated, anon;
