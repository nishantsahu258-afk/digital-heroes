-- Create the winner-proofs bucket (private by default)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('winner-proofs', 'winner-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage.objects on this bucket
-- NOTE: We must ensure RLS is enabled on storage.objects, which it typically is by default in Supabase

-- Policy: Users can insert their own proof images
-- The file path must start with their user ID (e.g., "winner-proofs/uid/filename.png")
CREATE POLICY "Users can upload their own winner proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'winner-proofs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own proof images
CREATE POLICY "Users can read their own winner proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'winner-proofs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can read ALL winner proofs
CREATE POLICY "Admins can read all winner proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'winner-proofs' 
    AND private.is_admin()
);
