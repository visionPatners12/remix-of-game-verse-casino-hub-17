-- Create ENUMs for Ludo game
CREATE TYPE game_status_enum AS ENUM ('created', 'active', 'finished', 'abandoned');
CREATE TYPE ludo_color_enum AS ENUM ('R', 'G', 'Y', 'B');

-- Create ludo_games table
CREATE TABLE public.ludo_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Game state
  positions jsonb NOT NULL DEFAULT '{
    "R":[-2,-2,-2,-2],
    "G":[-2,-2,-2,-2], 
    "Y":[-2,-2,-2,-2],
    "B":[-2,-2,-2,-2]
  }',
  turn ludo_color_enum NOT NULL DEFAULT 'R',
  dice int CHECK (dice >= 1 AND dice <= 6),
  status game_status_enum NOT NULL DEFAULT 'created',
  
  -- Game settings
  extra_turn_on_six boolean DEFAULT true,
  max_players int DEFAULT 4 CHECK (max_players BETWEEN 2 AND 4),
  current_players int DEFAULT 0,
  winner ludo_color_enum,
  
  -- Metadata
  game_name text,
  created_by uuid REFERENCES auth.users(id),
  
  -- Versioning & timestamps
  rev int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ludo_game_players junction table
CREATE TABLE public.ludo_game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES ludo_games(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  color ludo_color_enum NOT NULL,
  position int CHECK (position BETWEEN 1 AND 4),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(game_id, user_id),
  UNIQUE(game_id, color)
);

-- Enable Row Level Security
ALTER TABLE public.ludo_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ludo_game_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ludo_games
CREATE POLICY "Users can view games they participate in"
ON public.ludo_games
FOR SELECT
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM ludo_game_players 
    WHERE game_id = ludo_games.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create games"
ON public.ludo_games
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Players can update games during their turn"
ON public.ludo_games
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM ludo_game_players 
    WHERE game_id = ludo_games.id AND user_id = auth.uid()
  )
);

-- RLS Policies for ludo_game_players
CREATE POLICY "Users can view game players for games they're in"
ON public.ludo_game_players
FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM ludo_game_players lgp2
    WHERE lgp2.game_id = ludo_game_players.game_id AND lgp2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join games"
ON public.ludo_game_players
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create optimized indexes
CREATE INDEX ON ludo_games (status) WHERE status IN ('created', 'active');
CREATE INDEX ON ludo_games (created_by);
CREATE INDEX ON ludo_games (created_at DESC);
CREATE INDEX ON ludo_game_players (user_id);
CREATE INDEX ON ludo_game_players (game_id);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_ludo_games_updated_at
BEFORE UPDATE ON public.ludo_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate positions JSON structure
CREATE OR REPLACE FUNCTION validate_ludo_positions(positions jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check if all required colors exist
  IF NOT (positions ? 'R' AND positions ? 'G' AND positions ? 'Y' AND positions ? 'B') THEN
    RETURN false;
  END IF;
  
  -- Check if each color has exactly 4 positions
  IF jsonb_array_length(positions->'R') != 4 OR
     jsonb_array_length(positions->'G') != 4 OR
     jsonb_array_length(positions->'Y') != 4 OR
     jsonb_array_length(positions->'B') != 4 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Add constraint to validate positions
ALTER TABLE public.ludo_games 
ADD CONSTRAINT valid_positions 
CHECK (validate_ludo_positions(positions));

-- Function to update current_players count
CREATE OR REPLACE FUNCTION update_current_players_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ludo_games 
    SET current_players = (
      SELECT COUNT(*) FROM ludo_game_players WHERE game_id = NEW.game_id
    )
    WHERE id = NEW.game_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ludo_games 
    SET current_players = (
      SELECT COUNT(*) FROM ludo_game_players WHERE game_id = OLD.game_id
    )
    WHERE id = OLD.game_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to automatically update current_players
CREATE TRIGGER update_current_players_trigger
AFTER INSERT OR DELETE ON ludo_game_players
FOR EACH ROW
EXECUTE FUNCTION update_current_players_count();