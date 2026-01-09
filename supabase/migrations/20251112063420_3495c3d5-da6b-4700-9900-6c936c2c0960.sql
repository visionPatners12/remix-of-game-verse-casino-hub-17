-- Create enum for entity_type (if not exists)
DO $$ BEGIN
  CREATE TYPE public.entity_type_enum AS ENUM ('league', 'team');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create top_entities table
CREATE TABLE public.top_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type public.entity_type_enum NOT NULL,
  
  -- Denormalized data for performance
  title text NOT NULL,
  slug text NOT NULL,
  country_name text,
  logo text,
  
  -- Relations to sports_data schema
  sport_id uuid NOT NULL REFERENCES sports_data.sport(id) ON DELETE CASCADE,
  league_id uuid REFERENCES sports_data.league(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique partial index (replaces UNIQUE constraint with WHERE)
CREATE UNIQUE INDEX unique_league_entity_idx 
  ON public.top_entities(entity_type, league_id) 
  WHERE league_id IS NOT NULL;

-- Create indexes for performance
CREATE INDEX idx_top_entities_entity_type ON public.top_entities(entity_type);
CREATE INDEX idx_top_entities_sport_id ON public.top_entities(sport_id);
CREATE INDEX idx_top_entities_league_id ON public.top_entities(league_id) WHERE league_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.top_entities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view top entities
CREATE POLICY "Anyone can view top entities"
  ON public.top_entities
  FOR SELECT
  USING (true);

-- RLS Policy: Service role can manage all
CREATE POLICY "Service can manage top entities"
  ON public.top_entities
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.top_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();