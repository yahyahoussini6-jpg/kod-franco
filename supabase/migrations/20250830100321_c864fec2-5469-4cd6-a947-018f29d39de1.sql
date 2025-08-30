-- Ensure pgcrypto is available (already attempted, but safe to keep idempotent)
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Make tracking code generator robust by pinning search_path and schema-qualifying extension funcs
CREATE OR REPLACE FUNCTION public.make_tracking_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
  select 'TRK-' || upper(substr(encode(extensions.gen_random_bytes(6),'hex'),1,8));
$function$;

-- Optional: revalidate default by touching orders definition (no-op change)
COMMENT ON FUNCTION public.make_tracking_code() IS 'Generates order tracking codes using pgcrypto and a fixed search_path.';