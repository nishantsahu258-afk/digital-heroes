-- Fix the RLS policies for storage.objects
DROP POLICY IF EXISTS "Users can upload their own winner proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own winner proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all winner proofs" ON storage.objects;

CREATE POLICY "Users can upload their own winner proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'winner-proofs' 
    AND owner = auth.uid()
    AND (name LIKE auth.uid()::text || '/%')
);

CREATE POLICY "Users can read their own winner proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'winner-proofs' 
    AND (name LIKE auth.uid()::text || '/%')
);

CREATE POLICY "Admins can read all winner proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'winner-proofs' 
    AND private.is_admin()
);
