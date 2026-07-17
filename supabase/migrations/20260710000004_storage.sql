-- ============================================================
-- Migration 004: Storage setup for models
-- Karnataka Study App
-- ============================================================

-- Create a bucket named "models" if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('models', 'models', true)
ON CONFLICT (id) DO NOTHING;


-- Allow public read access to the models bucket
CREATE POLICY "Public Read Access for Models"
ON storage.objects FOR SELECT
USING (bucket_id = 'models');

-- Allow admins to insert/upload files to the models bucket
-- We need to check if the user is an admin by querying public.profiles
CREATE POLICY "Admin Upload Access for Models"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'models' AND
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Allow admins to update files in the models bucket
CREATE POLICY "Admin Update Access for Models"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'models' AND
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Allow admins to delete files in the models bucket
CREATE POLICY "Admin Delete Access for Models"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'models' AND
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
