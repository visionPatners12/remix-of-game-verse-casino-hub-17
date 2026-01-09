
-- Créer la table livestreams avec les données custom seulement
CREATE TABLE livestreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifiants Stream
  call_id TEXT NOT NULL UNIQUE,              -- ID du call Stream (généré par nous)
  
  -- Données custom du livestream
  title TEXT,                                -- Titre du live
  description TEXT,                          -- Description
  game_id TEXT,                              -- ID du match/jeu associé
  hashtags JSONB DEFAULT '[]',               -- Hashtags du stream
  tags JSONB DEFAULT '[]',                   -- Tags supplémentaires
  is_public BOOLEAN DEFAULT true,            -- Visibilité du stream
  starts_at TIMESTAMPTZ,                     -- Heure de début programmée
  created_by UUID,                           -- ID du créateur
  
  -- Statistiques
  participant_count INTEGER DEFAULT 0,       -- Nombre de participants
  peak_viewers INTEGER DEFAULT 0,            -- Pic de viewers
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE livestreams ENABLE ROW LEVEL SECURITY;

-- Politique pour voir les streams publics
CREATE POLICY "Anyone can view public livestreams" 
  ON livestreams 
  FOR SELECT 
  USING (is_public = true);

-- Politique pour voir ses propres streams
CREATE POLICY "Users can view their own livestreams" 
  ON livestreams 
  FOR SELECT 
  USING (created_by = auth.uid());

-- Politique pour créer des streams
CREATE POLICY "Users can create livestreams" 
  ON livestreams 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- Politique pour modifier ses propres streams
CREATE POLICY "Users can update their own livestreams" 
  ON livestreams 
  FOR UPDATE 
  USING (created_by = auth.uid());
