
-- Accorder les permissions sur le schéma app_social
GRANT USAGE ON SCHEMA app_social TO anon;
GRANT USAGE ON SCHEMA app_social TO authenticated;
GRANT USAGE ON SCHEMA app_social TO public;

-- Accorder toutes les permissions sur la table live_streams
GRANT ALL ON app_social.live_streams TO anon;
GRANT ALL ON app_social.live_streams TO authenticated;
GRANT ALL ON app_social.live_streams TO public;

-- Vérifier que les politiques RLS sont bien en place
-- (Ces politiques existent déjà mais nous les listons pour vérification)

-- Politique pour voir les streams publics
-- CREATE POLICY "Anyone can view public livestreams" 
--   ON app_social.live_streams 
--   FOR SELECT 
--   USING (is_public = true);

-- Politique pour voir ses propres streams
-- CREATE POLICY "Users can view their own livestreams" 
--   ON app_social.live_streams 
--   FOR SELECT 
--   USING (created_by = auth.uid());

-- Politique pour créer des streams
-- CREATE POLICY "Users can create livestreams" 
--   ON app_social.live_streams 
--   FOR INSERT 
--   WITH CHECK (created_by = auth.uid());

-- Politique pour modifier ses propres streams
-- CREATE POLICY "Users can update their own livestreams" 
--   ON app_social.live_streams 
--   FOR UPDATE 
--   USING (created_by = auth.uid());

-- Politique pour supprimer ses propres streams
-- CREATE POLICY "Users can delete their own livestreams" 
--   ON app_social.live_streams 
--   FOR DELETE 
--   USING (created_by = auth.uid());
