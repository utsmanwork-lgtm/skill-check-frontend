-- Remove the unused RPC: provisioning occurs only via the GoTrue Admin API with the service-role secret held server-side.
DROP FUNCTION IF EXISTS public.setup_admin_test_credential(TEXT, TEXT);
