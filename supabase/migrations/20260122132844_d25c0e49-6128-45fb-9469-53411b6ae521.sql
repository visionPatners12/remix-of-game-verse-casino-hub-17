-- Ajouter colonnes pour le nouveau format sur tournaments
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS players_per_match INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS tournament_format TEXT DEFAULT 'ludo_4p';

-- Mettre à jour les contraintes pour 16 et 64 joueurs uniquement
ALTER TABLE public.tournaments
DROP CONSTRAINT IF EXISTS valid_bracket_size;

ALTER TABLE public.tournaments
ADD CONSTRAINT valid_tournament_size 
CHECK (bracket_size IN (16, 64));

-- Mettre à jour total_rounds basé sur bracket_size
-- 16 joueurs = 2 rounds (Quarts + Finale)
-- 64 joueurs = 3 rounds (Round 1 + Demis + Finale)

-- Créer table tournament_participants
CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'playing', 'eliminated', 'winner')),
  final_position INTEGER,
  prize_amount NUMERIC DEFAULT 0,
  tx_hash TEXT,
  UNIQUE(tournament_id, user_id)
);

-- Créer table tournament_matches (lie aux ludo_games)
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  ludo_game_id UUID REFERENCES public.ludo_games(id),
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  winner_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  UNIQUE(tournament_id, round_number, match_number)
);

-- Créer table tournament_match_players
CREATE TABLE IF NOT EXISTS public.tournament_match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.tournament_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  seed_position INTEGER CHECK (seed_position BETWEEN 1 AND 4),
  result TEXT CHECK (result IN ('pending', 'winner', 'eliminated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, user_id),
  UNIQUE(match_id, seed_position)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament 
ON public.tournament_participants(tournament_id);

CREATE INDEX IF NOT EXISTS idx_tournament_participants_user 
ON public.tournament_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament 
ON public.tournament_matches(tournament_id);

CREATE INDEX IF NOT EXISTS idx_tournament_matches_round 
ON public.tournament_matches(tournament_id, round_number);

CREATE INDEX IF NOT EXISTS idx_tournament_match_players_match 
ON public.tournament_match_players(match_id);

CREATE INDEX IF NOT EXISTS idx_tournament_match_players_user 
ON public.tournament_match_players(user_id);

-- RLS Policies
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_match_players ENABLE ROW LEVEL SECURITY;

-- Lecture publique des tournois
CREATE POLICY "Anyone can view tournaments" ON public.tournaments 
FOR SELECT USING (true);

-- Lecture publique des participants
CREATE POLICY "Anyone can view tournament participants" ON public.tournament_participants 
FOR SELECT USING (true);

-- Utilisateurs peuvent rejoindre les tournois
CREATE POLICY "Users can join tournaments" ON public.tournament_participants 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service peut gérer les participants
CREATE POLICY "Service can manage participants" ON public.tournament_participants 
FOR ALL USING (true) WITH CHECK (true);

-- Lecture publique des matchs
CREATE POLICY "Anyone can view tournament matches" ON public.tournament_matches 
FOR SELECT USING (true);

-- Service peut gérer les matchs
CREATE POLICY "Service can manage matches" ON public.tournament_matches 
FOR ALL USING (true) WITH CHECK (true);

-- Lecture publique des joueurs de match
CREATE POLICY "Anyone can view match players" ON public.tournament_match_players 
FOR SELECT USING (true);

-- Service peut gérer les joueurs de match
CREATE POLICY "Service can manage match players" ON public.tournament_match_players 
FOR ALL USING (true) WITH CHECK (true);