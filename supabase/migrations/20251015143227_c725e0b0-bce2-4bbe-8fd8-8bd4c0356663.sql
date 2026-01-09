-- Supprimer l'ancienne policy INSERT
DROP POLICY IF EXISTS "authenticated_insert_post_media" ON storage.objects;

-- Créer une nouvelle policy INSERT corrigée
-- Elle doit autoriser l'insertion SI :
-- 1. bucket_id = 'post-media'
-- 2. L'utilisateur insère dans son propre dossier (path commence par son UUID)
-- 3. Le owner sera automatiquement défini par Supabase
CREATE POLICY "authenticated_insert_post_media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);