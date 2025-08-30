-- Create storage bucket for 3D models
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('models', 'models', true, 52428800, ARRAY['model/obj', 'application/octet-stream', 'text/plain']);

-- Create storage policies for 3D models
CREATE POLICY "Anyone can view models" ON storage.objects
FOR SELECT USING (bucket_id = 'models');

CREATE POLICY "Authenticated users can upload models" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'models' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update models" ON storage.objects
FOR UPDATE USING (bucket_id = 'models' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete models" ON storage.objects
FOR DELETE USING (bucket_id = 'models' AND auth.role() = 'authenticated');

-- Add variables column to products table for storing colors, sizes, etc.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '{}';

-- Add model_url column to store the 3D model file path
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_url TEXT;

-- Create an index on variables for better query performance
CREATE INDEX IF NOT EXISTS idx_products_variables ON public.products USING GIN (variables);