-- Étape 1: Nettoyer toutes les politiques existantes sur storage.objects pour post-media
DROP POLICY IF EXISTS "Public can view post-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload post-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own post-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own post-media" ON storage.objects;

-- Étape 2: Créer une fonction helper pour extraire le userId du path
CREATE OR REPLACE FUNCTION public.extract_user_id_from_path(path text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN (split_part(path, '/', 1))::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Étape 3: Créer les 4 politiques RLS optimisées

-- Policy 1: SELECT - Lecture publique
CREATE POLICY "public_read_post_media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'post-media');

-- Policy 2: INSERT - Upload authentifié avec comparaison UUID = UUID
CREATE POLICY "authenticated_insert_post_media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-media' 
  AND public.extract_user_id_from_path(name) = auth.uid()
);

-- Policy 3: UPDATE - Mise à jour par le propriétaire
CREATE POLICY "owner_update_post_media"
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

-- Policy 4: DELETE - Suppression par le propriétaire
CREATE POLICY "owner_delete_post_media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-media' 
  AND owner = auth.uid()
);