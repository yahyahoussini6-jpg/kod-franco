-- Create product reviews table
CREATE TABLE public.product_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  customer_phone text NOT NULL,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view approved reviews" 
ON public.product_reviews 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Anyone can submit reviews" 
ON public.product_reviews 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can manage all reviews" 
ON public.product_reviews 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to verify purchase and approve review
CREATE OR REPLACE FUNCTION public.verify_and_approve_review(
  p_review_id uuid,
  p_phone text,
  p_product_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  order_exists boolean := false;
BEGIN
  -- Check if customer has purchased this product
  SELECT EXISTS(
    SELECT 1 
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.client_phone = p_phone 
      AND oi.product_id = p_product_id
      AND o.status IN ('livree', 'confirmee', 'en_preparation', 'expediee')
  ) INTO order_exists;
  
  IF order_exists THEN
    -- Update review as verified and approved
    UPDATE public.product_reviews
    SET is_verified = true,
        is_approved = true,
        updated_at = now()
    WHERE id = p_review_id;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$function$;

-- Create function to get product rating stats
CREATE OR REPLACE FUNCTION public.get_product_rating_stats(p_product_id uuid)
RETURNS TABLE(
  average_rating numeric,
  total_reviews bigint,
  rating_distribution jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      AVG(rating) as avg_rating,
      COUNT(*) as total_count,
      jsonb_object_agg(
        rating::text, 
        count
      ) as distribution
    FROM (
      SELECT 
        rating,
        COUNT(*) as count
      FROM public.product_reviews 
      WHERE product_id = p_product_id 
        AND is_approved = true
      GROUP BY rating
    ) rating_counts
  )
  SELECT 
    ROUND(avg_rating, 1),
    total_count,
    COALESCE(distribution, '{}'::jsonb)
  FROM stats;
END;
$function$;

-- Add trigger for updated_at
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();