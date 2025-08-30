-- Enable the pgcrypto extension for gen_random_bytes function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate the make_tracking_code function to ensure it works
CREATE OR REPLACE FUNCTION public.make_tracking_code()
RETURNS text
LANGUAGE sql
AS $function$
  select 'TRK-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,8));
$function$;