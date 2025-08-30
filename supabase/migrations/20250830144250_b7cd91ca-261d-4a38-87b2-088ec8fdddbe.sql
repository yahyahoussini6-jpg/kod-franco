-- Create a dedicated public bucket for product images that allows common image MIME types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('product-images', 'product-images', true, NULL, ARRAY['image/png','image/jpeg','image/webp','image/jpg','image/gif','image/svg+xml']);
  ELSE
    UPDATE storage.buckets
    SET public = true,
        allowed_mime_types = ARRAY['image/png','image/jpeg','image/webp','image/jpg','image/gif','image/svg+xml']
    WHERE id = 'product-images';
  END IF;
END $$;

-- RLS policies for product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view product images'
  ) THEN
    CREATE POLICY "Public can view product images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload product images'
  ) THEN
    CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can update product images'
  ) THEN
    CREATE POLICY "Authenticated users can update product images"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can delete product images'
  ) THEN
    CREATE POLICY "Authenticated users can delete product images"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
  END IF;
END $$;