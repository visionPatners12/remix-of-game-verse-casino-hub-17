-- Nettoyer les références orphelines avant d'ajouter les foreign keys
DELETE FROM public.user_preferences 
WHERE sport_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM sports_data.sport WHERE id = user_preferences.sport_id);

DELETE FROM public.user_preferences 
WHERE league_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM sports_data.league WHERE id = user_preferences.league_id);

DELETE FROM public.user_preferences 
WHERE team_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM sports_data.teams WHERE id = user_preferences.team_id);

-- Ajouter les foreign key constraints vers sports_data
ALTER TABLE public.user_preferences
  ADD CONSTRAINT fk_user_preferences_sport
    FOREIGN KEY (sport_id) 
    REFERENCES sports_data.sport(id)
    ON DELETE CASCADE;

ALTER TABLE public.user_preferences
  ADD CONSTRAINT fk_user_preferences_league
    FOREIGN KEY (league_id) 
    REFERENCES sports_data.league(id)
    ON DELETE CASCADE;

ALTER TABLE public.user_preferences
  ADD CONSTRAINT fk_user_preferences_team
    FOREIGN KEY (team_id) 
    REFERENCES sports_data.teams(id)
    ON DELETE CASCADE;

-- Créer des index pour améliorer les performances des jointures
CREATE INDEX IF NOT EXISTS idx_user_preferences_sport_id ON public.user_preferences(sport_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_league_id ON public.user_preferences(league_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_team_id ON public.user_preferences(team_id);