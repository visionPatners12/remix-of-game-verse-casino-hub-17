-- Migration complète pour les nouvelles tables de favoris et tipsters

-- 1. Supprimer l'ancienne structure
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TYPE IF EXISTS public.entity_type CASCADE;

-- 2. Tables de favoris spécialisées
-- Sports favoris
CREATE TABLE public.user_favorite_sports (
  user_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
  position smallint,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, sport_id)
);
CREATE INDEX ON public.user_favorite_sports (sport_id);
-- Un seul "primary" par user
CREATE UNIQUE INDEX user_fav_sport_one_primary
  ON public.user_favorite_sports (user_id) WHERE is_primary;

-- Équipes favorites
CREATE TABLE public.user_favorite_teams (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  position smallint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, team_id)
);
CREATE INDEX ON public.user_favorite_teams (team_id);

-- Ligues favorites
CREATE TABLE public.user_favorite_leagues (
  user_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE RESTRICT,
  position smallint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, league_id)
);
CREATE INDEX ON public.user_favorite_leagues (league_id);

-- 3. Tables pour les tipsters
-- Profils tipster (SANS le champ specialties)
CREATE TABLE public.tipster_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  monthly_price decimal(10,2) NOT NULL,
  description text NOT NULL,
  experience text,
  tips_won integer DEFAULT 0,
  tips_total integer DEFAULT 0,
  avg_odds decimal(4,2),
  yield_pct decimal(5,2),
  is_active boolean DEFAULT true,
  split_contract_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Spécialités des tipsters (table de relation)
CREATE TABLE public.tipster_specialties (
  tipster_profile_id uuid NOT NULL REFERENCES public.tipster_profiles(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (tipster_profile_id, sport_id)
);
CREATE INDEX ON public.tipster_specialties (sport_id);

-- Abonnements aux tipsters
CREATE TABLE public.tipster_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tipster_profile_id uuid NOT NULL REFERENCES public.tipster_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  subscription_start timestamptz DEFAULT now(),
  subscription_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(subscriber_id, tipster_profile_id)
);

-- 4. Tables auxiliaires
-- Portefeuilles utilisateur
CREATE TABLE public.user_wallet (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  wallet_type text NOT NULL DEFAULT 'evm',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, wallet_address)
);
CREATE UNIQUE INDEX user_wallet_one_primary ON public.user_wallet (user_id) WHERE is_primary;

-- Équipes populaires
CREATE TABLE public.top_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  rank integer NOT NULL,
  popularity_score integer DEFAULT 0,
  region text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_id, sport_id)
);
CREATE INDEX ON public.top_teams (sport_id, rank);

-- 5. Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.user_favorite_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipster_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipster_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipster_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_teams ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour les favoris
-- Sports favoris
CREATE POLICY "Users can view their own favorite sports" 
ON public.user_favorite_sports FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public favorite sports" 
ON public.user_favorite_sports FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = user_favorite_sports.user_id AND users.is_profile_public = true));

CREATE POLICY "Users can manage their own favorite sports" 
ON public.user_favorite_sports FOR ALL 
USING (auth.uid() = user_id);

-- Équipes favorites
CREATE POLICY "Users can view their own favorite teams" 
ON public.user_favorite_teams FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public favorite teams" 
ON public.user_favorite_teams FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = user_favorite_teams.user_id AND users.is_profile_public = true));

CREATE POLICY "Users can manage their own favorite teams" 
ON public.user_favorite_teams FOR ALL 
USING (auth.uid() = user_id);

-- Ligues favorites
CREATE POLICY "Users can view their own favorite leagues" 
ON public.user_favorite_leagues FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public favorite leagues" 
ON public.user_favorite_leagues FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = user_favorite_leagues.user_id AND users.is_profile_public = true));

CREATE POLICY "Users can manage their own favorite leagues" 
ON public.user_favorite_leagues FOR ALL 
USING (auth.uid() = user_id);

-- 7. Politiques RLS pour les tipsters
-- Profils tipster
CREATE POLICY "Anyone can view active tipster profiles" 
ON public.tipster_profiles FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can view their own tipster profile" 
ON public.tipster_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tipster profile" 
ON public.tipster_profiles FOR ALL 
USING (auth.uid() = user_id);

-- Spécialités tipster
CREATE POLICY "Anyone can view tipster specialties" 
ON public.tipster_specialties FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.tipster_profiles WHERE tipster_profiles.id = tipster_specialties.tipster_profile_id AND tipster_profiles.is_active = true));

CREATE POLICY "Tipsters can manage their own specialties" 
ON public.tipster_specialties FOR ALL 
USING (EXISTS (SELECT 1 FROM public.tipster_profiles WHERE tipster_profiles.id = tipster_specialties.tipster_profile_id AND tipster_profiles.user_id = auth.uid()));

-- Abonnements tipster
CREATE POLICY "Users can view their own subscriptions" 
ON public.tipster_subscriptions FOR SELECT 
USING (auth.uid() = subscriber_id);

CREATE POLICY "Tipsters can view their subscribers" 
ON public.tipster_subscriptions FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.tipster_profiles WHERE tipster_profiles.id = tipster_subscriptions.tipster_profile_id AND tipster_profiles.user_id = auth.uid()));

CREATE POLICY "Users can manage their own subscriptions" 
ON public.tipster_subscriptions FOR ALL 
USING (auth.uid() = subscriber_id);

-- 8. Politiques RLS pour les tables auxiliaires
-- Portefeuilles
CREATE POLICY "Users can view their own wallets" 
ON public.user_wallet FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wallets" 
ON public.user_wallet FOR ALL 
USING (auth.uid() = user_id);

-- Top équipes (lecture publique)
CREATE POLICY "Anyone can view top teams" 
ON public.top_teams FOR SELECT 
USING (true);

-- 9. Triggers pour updated_at
CREATE TRIGGER update_user_favorite_sports_updated_at
BEFORE UPDATE ON public.user_favorite_sports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_favorite_teams_updated_at
BEFORE UPDATE ON public.user_favorite_teams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_favorite_leagues_updated_at
BEFORE UPDATE ON public.user_favorite_leagues
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tipster_profiles_updated_at
BEFORE UPDATE ON public.tipster_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tipster_subscriptions_updated_at
BEFORE UPDATE ON public.tipster_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_wallet_updated_at
BEFORE UPDATE ON public.user_wallet
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_top_teams_updated_at
BEFORE UPDATE ON public.top_teams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();