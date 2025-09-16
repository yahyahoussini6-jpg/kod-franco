-- Add foreign key constraints for product relationships
ALTER TABLE public.product_relationships 
ADD CONSTRAINT fk_product_relationships_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.product_relationships 
ADD CONSTRAINT fk_product_relationships_related_product_id 
FOREIGN KEY (related_product_id) REFERENCES public.products(id) ON DELETE CASCADE;