-- Ensure RLS is enabled on storage.objects and allow authenticated uploads to the 'models' bucket

-- Enable RLS (safe to run if already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload images/files to the 'models' bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to upload to models'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload to models"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'models');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow users to update their files in models'
  ) THEN
    CREATE POLICY "Allow users to update their files in models"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'models' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'models' AND owner = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow users to delete their files in models'
  ) THEN
    CREATE POLICY "Allow users to delete their files in models"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'models' AND owner = auth.uid());
  END IF;
END $$;