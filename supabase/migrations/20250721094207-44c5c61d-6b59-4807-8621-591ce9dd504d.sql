
-- Create the livestream_status enum in app_social schema
CREATE TYPE app_social.livestream_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled', 'backstage');

-- Create the live_streams table with all necessary fields
CREATE TABLE app_social.live_streams (
  call_id TEXT PRIMARY KEY,                  -- ID du call Stream (clé primaire)
  
  -- Données du livestream
  title TEXT,                                -- Titre du live
  description TEXT,                          -- Description
  game_id TEXT,                              -- ID du match/jeu associé
  hashtags JSONB DEFAULT '[]',               -- Hashtags du stream
  tags JSONB DEFAULT '[]',                   -- Tags supplémentaires
  is_public BOOLEAN DEFAULT true,            -- Visibilité du stream
  starts_at TIMESTAMPTZ,                     -- Heure de début programmée
  created_by UUID,                           -- ID du créateur
  
  -- Statut du livestream
  status app_social.livestream_status DEFAULT 'scheduled',
  
  -- Statistiques
  participant_count INTEGER DEFAULT 0,       -- Nombre de participants
  peak_viewers INTEGER DEFAULT 0,            -- Pic de viewers
  is_live BOOLEAN DEFAULT false,             -- Statut live actuel
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_app_social_live_streams_created_by ON app_social.live_streams(created_by);
CREATE INDEX idx_app_social_live_streams_is_public ON app_social.live_streams(is_public);
CREATE INDEX idx_app_social_live_streams_status ON app_social.live_streams(status);
CREATE INDEX idx_app_social_live_streams_is_live ON app_social.live_streams(is_live);

-- RLS Policies
ALTER TABLE app_social.live_streams ENABLE ROW LEVEL SECURITY;

-- Politique pour voir les streams publics
CREATE POLICY "Anyone can view public livestreams" 
  ON app_social.live_streams 
  FOR SELECT 
  USING (is_public = true);

-- Politique pour voir ses propres streams
CREATE POLICY "Users can view their own livestreams" 
  ON app_social.live_streams 
  FOR SELECT 
  USING (created_by = auth.uid());

-- Politique pour créer des streams
CREATE POLICY "Users can create livestreams" 
  ON app_social.live_streams 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- Politique pour modifier ses propres streams
CREATE POLICY "Users can update their own livestreams" 
  ON app_social.live_streams 
  FOR UPDATE 
  USING (created_by = auth.uid());

-- Politique pour supprimer ses propres streams
CREATE POLICY "Users can delete their own livestreams" 
  ON app_social.live_streams 
  FOR DELETE 
  USING (created_by = auth.uid());

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION app_social.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_live_streams_updated_at 
  BEFORE UPDATE ON app_social.live_streams 
  FOR EACH ROW EXECUTE FUNCTION app_social.update_updated_at_column();
