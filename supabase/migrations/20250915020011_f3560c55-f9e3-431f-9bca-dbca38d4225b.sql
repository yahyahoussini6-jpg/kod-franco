-- Fix the generate_return_code function by adding proper security settings
CREATE OR REPLACE FUNCTION generate_return_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 'RET-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,8));
$$;