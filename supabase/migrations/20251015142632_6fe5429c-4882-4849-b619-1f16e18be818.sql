-- Étape 1: Ajouter la colonne media JSONB à simple_posts
ALTER TABLE social_post.simple_posts 
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;

-- Étape 2: Migrer les données existantes de simple_post_media vers simple_posts.media
UPDATE social_post.simple_posts sp
SET media = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', spm.id,
        'type', spm.type,
        'url', spm.url,
        'storagePath', spm.storage_path,
        'fileSizeBytes', spm.file_size_bytes,
        'mimeType', spm.mime_type,
        'position', spm.position
      ) ORDER BY spm.position
    )
    FROM social_post.simple_post_media spm
    WHERE spm.simple_post_id = sp.id
  ),
  '[]'::jsonb
);

-- Étape 3: Supprimer les politiques RLS de simple_post_media
DROP POLICY IF EXISTS "authenticated_insert_simple_post_media" ON social_post.simple_post_media;
DROP POLICY IF EXISTS "Anyone can view media from public posts" ON social_post.simple_post_media;

-- Étape 4: Supprimer la fonction helper RLS
DROP FUNCTION IF EXISTS social_post.user_owns_simple_post(uuid, uuid);

-- Étape 5: Supprimer la table simple_post_media
DROP TABLE IF EXISTS social_post.simple_post_media CASCADE;