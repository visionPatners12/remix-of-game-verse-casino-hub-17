
-- Table simple pour stocker les hashtags
CREATE TABLE public.hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  match_id BIGINT REFERENCES public.sport_matches(id),
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter des colonnes hashtags directement aux tables existantes
ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS hashtags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.p2p_bets ADD COLUMN IF NOT EXISTS hashtags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.forecasts ADD COLUMN IF NOT EXISTS hashtags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.match_opinions ADD COLUMN IF NOT EXISTS hashtags JSONB DEFAULT '[]'::jsonb;

-- Table pour les streams live si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  streamer_id UUID REFERENCES auth.users(id),
  viewer_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled',
  started_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  hashtags JSONB DEFAULT '[]'::jsonb,
  thumbnail TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fonction pour générer des hashtags automatiques pour les matchs
CREATE OR REPLACE FUNCTION generate_match_hashtag(team_a TEXT, team_b TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  clean_team_a TEXT;
  clean_team_b TEXT;
  hashtag TEXT;
BEGIN
  -- Nettoyer les noms d'équipe (supprimer espaces, caractères spéciaux)
  clean_team_a := UPPER(REGEXP_REPLACE(team_a, '[^A-Za-z0-9]', '_', 'g'));
  clean_team_b := UPPER(REGEXP_REPLACE(team_b, '[^A-Za-z0-9]', '_', 'g'));
  
  -- Limiter la longueur pour éviter des hashtags trop longs
  clean_team_a := LEFT(clean_team_a, 10);
  clean_team_b := LEFT(clean_team_b, 10);
  
  hashtag := '#' || clean_team_a || '_vs_' || clean_team_b;
  
  RETURN hashtag;
END;
$$;

-- Fonction pour créer automatiquement des hashtags pour les matchs
CREATE OR REPLACE FUNCTION create_match_hashtags()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  hashtag_name TEXT;
BEGIN
  -- Générer le hashtag pour le match
  hashtag_name := generate_match_hashtag(NEW.team_a, NEW.team_b);
  
  -- Insérer le hashtag s'il n'existe pas déjà
  INSERT INTO public.hashtags (name, match_id)
  VALUES (hashtag_name, NEW.id)
  ON CONFLICT (name) DO UPDATE SET
    match_id = NEW.id,
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement des hashtags lors de l'ajout de matchs
CREATE TRIGGER create_match_hashtags_trigger
  AFTER INSERT OR UPDATE ON public.sport_matches
  FOR EACH ROW EXECUTE FUNCTION create_match_hashtags();

-- Fonction pour mettre à jour le compteur d'usage des hashtags
CREATE OR REPLACE FUNCTION update_hashtag_usage_from_content()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  hashtag_text TEXT;
  hashtag_id UUID;
BEGIN
  -- Pour les insertions/mises à jour, traiter les nouveaux hashtags
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    -- Parcourir tous les hashtags dans le JSONB
    FOR hashtag_text IN SELECT jsonb_array_elements_text(NEW.hashtags)
    LOOP
      -- Créer le hashtag s'il n'existe pas et récupérer son ID
      INSERT INTO public.hashtags (name)
      VALUES (hashtag_text)
      ON CONFLICT (name) DO UPDATE SET
        usage_count = hashtags.usage_count + 1,
        updated_at = now()
      RETURNING id INTO hashtag_id;
      
      -- Si le hashtag existait déjà, juste incrémenter le compteur
      IF hashtag_id IS NULL THEN
        UPDATE public.hashtags 
        SET usage_count = usage_count + 1, updated_at = now()
        WHERE name = hashtag_text;
      END IF;
    END LOOP;
  END IF;
  
  -- Pour les suppressions, décrémenter les compteurs
  IF TG_OP = 'DELETE' THEN
    FOR hashtag_text IN SELECT jsonb_array_elements_text(OLD.hashtags)
    LOOP
      UPDATE public.hashtags 
      SET usage_count = GREATEST(usage_count - 1, 0), updated_at = now()
      WHERE name = hashtag_text;
    END LOOP;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers pour maintenir les compteurs d'usage automatiquement
CREATE TRIGGER social_posts_hashtag_usage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION update_hashtag_usage_from_content();

CREATE TRIGGER p2p_bets_hashtag_usage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.p2p_bets
  FOR EACH ROW EXECUTE FUNCTION update_hashtag_usage_from_content();

CREATE TRIGGER forecasts_hashtag_usage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.forecasts
  FOR EACH ROW EXECUTE FUNCTION update_hashtag_usage_from_content();

CREATE TRIGGER match_opinions_hashtag_usage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.match_opinions
  FOR EACH ROW EXECUTE FUNCTION update_hashtag_usage_from_content();

CREATE TRIGGER live_streams_hashtag_usage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.live_streams
  FOR EACH ROW EXECUTE FUNCTION update_hashtag_usage_from_content();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_hashtags_name ON public.hashtags(name);
CREATE INDEX IF NOT EXISTS idx_hashtags_trending ON public.hashtags(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_hashtags_usage ON public.hashtags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_hashtags ON public.social_posts USING gin(hashtags);
CREATE INDEX IF NOT EXISTS idx_live_streams_hashtags ON public.live_streams USING gin(hashtags);

-- RLS pour les hashtags (lecture publique)
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hashtags are viewable by everyone" ON public.hashtags FOR SELECT USING (true);
CREATE POLICY "Live streams are viewable by everyone" ON public.live_streams FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create live streams" ON public.live_streams FOR INSERT WITH CHECK (auth.uid() = streamer_id);
CREATE POLICY "Users can update their live streams" ON public.live_streams FOR UPDATE USING (auth.uid() = streamer_id);

-- Fonction utilitaire pour rechercher du contenu par hashtag
CREATE OR REPLACE FUNCTION search_content_by_hashtag(hashtag_name TEXT)
RETURNS TABLE(
  content_type TEXT,
  content_id UUID,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  priority INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Lives en cours (priorité 1)
  SELECT 
    'live_stream'::TEXT,
    ls.id,
    ls.title,
    ls.created_at,
    ls.streamer_id,
    1 as priority
  FROM public.live_streams ls
  WHERE ls.hashtags ? hashtag_name
    AND ls.status = 'live'
    AND ls.is_public = true
  
  UNION ALL
  
  -- Posts sociaux (priorité 2)
  SELECT 
    'social_post'::TEXT,
    sp.id,
    COALESCE(LEFT(sp.content, 100), '')::TEXT,
    sp.created_at,
    sp.user_id,
    2 as priority
  FROM public.social_posts sp
  WHERE sp.hashtags ? hashtag_name
  
  UNION ALL
  
  -- Paris P2P (priorité 3)
  SELECT 
    'p2p_bet'::TEXT,
    pb.id,
    COALESCE(pb.creator_prediction, '')::TEXT,
    pb.created_at,
    pb.creator_id,
    3 as priority
  FROM public.p2p_bets pb
  WHERE pb.hashtags ? hashtag_name
    AND pb.status = 'pending'
  
  UNION ALL
  
  -- Prédictions/Forecasts (priorité 4)
  SELECT 
    'forecast'::TEXT,
    f.id,
    f.label,
    f.created_at,
    f.user_id,
    4 as priority
  FROM public.forecasts f
  WHERE f.hashtags ? hashtag_name
    AND f.is_public = true
  
  ORDER BY priority, created_at DESC;
END;
$$;
