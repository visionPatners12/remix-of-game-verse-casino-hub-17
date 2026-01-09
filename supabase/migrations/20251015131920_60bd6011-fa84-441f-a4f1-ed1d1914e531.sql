-- Policy 1: SELECT - Tout le monde peut voir les médias publics du bucket post-media
CREATE POLICY "Public can view post-media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'post-media');

-- Policy 2: INSERT - Utilisateurs authentifiés peuvent uploader dans leur dossier
CREATE POLICY "Authenticated users can upload post-media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: UPDATE - Utilisateurs peuvent mettre à jour leurs propres fichiers
CREATE POLICY "Users can update own post-media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-media' 
  AND owner = auth.uid()
)
WITH CHECK (
  bucket_id = 'post-media' 
  AND owner = auth.uid()
);

-- Policy 4: DELETE - Utilisateurs peuvent supprimer leurs propres fichiers
CREATE POLICY "Users can delete own post-media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-media' 
  AND owner = auth.uid()
);