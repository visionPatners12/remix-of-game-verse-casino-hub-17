-- Grant permissions sur le schéma sports_data pour exposer les RPCs à l'API REST
GRANT USAGE ON SCHEMA sports_data TO anon, authenticated, service_role;

-- Grant permissions sur toutes les fonctions (routines) du schéma sports_data
GRANT ALL ON ALL ROUTINES IN SCHEMA sports_data TO anon, authenticated, service_role;

-- Permissions par défaut pour les futures fonctions créées dans sports_data
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA sports_data 
  GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- Forcer PostgREST à recharger son cache de schéma
NOTIFY pgrst, 'reload schema';