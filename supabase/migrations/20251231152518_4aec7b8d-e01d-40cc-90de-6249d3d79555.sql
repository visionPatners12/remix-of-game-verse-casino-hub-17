-- Table unique pour les prédictions Polymarket
-- Référence directement un market (relation 1:1)

CREATE TABLE social_post.polymarket_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Référence Polymarket (TEXT car c'est le type dans polymarket.markets)
  market_id TEXT NOT NULL REFERENCES polymarket.markets(id) ON DELETE RESTRICT,
  
  -- Snapshot des données au moment de la prédiction
  event_title TEXT NOT NULL,
  event_image TEXT,
  market_question TEXT,
  
  -- Prédiction de l'utilisateur
  outcome TEXT NOT NULL,              -- 'Yes' ou 'No'
  odds NUMERIC NOT NULL,              -- Cote au moment de la prédiction
  probability NUMERIC,                -- Ex: 0.65 pour 65%
  
  -- Contenu utilisateur
  analysis TEXT,
  confidence INTEGER CHECK (confidence >= 1 AND confidence <= 5),
  
  -- Métadonnées
  category TEXT,
  end_date TIMESTAMPTZ,
  
  -- Statut et résultat
  status social_post.predictions_status NOT NULL DEFAULT 'pending',
  is_won BOOLEAN,
  final_outcome TEXT,
  settled_at TIMESTAMPTZ,
  
  -- Visibilité et engagement
  visibility TEXT NOT NULL DEFAULT 'public',
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Premium tip
  is_premium BOOLEAN DEFAULT false,
  
  -- Intégration GetStream
  stream_activity_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_polymarket_predictions_user ON social_post.polymarket_predictions(user_id);
CREATE INDEX idx_polymarket_predictions_market ON social_post.polymarket_predictions(market_id);
CREATE INDEX idx_polymarket_predictions_status ON social_post.polymarket_predictions(status);
CREATE INDEX idx_polymarket_predictions_created ON social_post.polymarket_predictions(created_at DESC);

-- Trigger pour updated_at
CREATE TRIGGER update_polymarket_predictions_updated_at
  BEFORE UPDATE ON social_post.polymarket_predictions
  FOR EACH ROW
  EXECUTE FUNCTION social_post.update_updated_at_column();

-- Activer RLS
ALTER TABLE social_post.polymarket_predictions ENABLE ROW LEVEL SECURITY;

-- Politique : lecture des prédictions publiques ou ses propres prédictions
CREATE POLICY "Anyone can view public polymarket predictions"
  ON social_post.polymarket_predictions FOR SELECT
  USING (visibility = 'public' OR user_id = auth.uid());

-- Politique : création de ses propres prédictions
CREATE POLICY "Users can create their own polymarket predictions"
  ON social_post.polymarket_predictions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Politique : mise à jour de ses propres prédictions
CREATE POLICY "Users can update their own polymarket predictions"
  ON social_post.polymarket_predictions FOR UPDATE
  USING (user_id = auth.uid());

-- Politique : suppression de ses propres prédictions
CREATE POLICY "Users can delete their own polymarket predictions"
  ON social_post.polymarket_predictions FOR DELETE
  USING (user_id = auth.uid());

-- Commentaire sur la table
COMMENT ON TABLE social_post.polymarket_predictions IS 'Prédictions utilisateurs sur les marchés Polymarket - relation 1:1 avec polymarket.markets';