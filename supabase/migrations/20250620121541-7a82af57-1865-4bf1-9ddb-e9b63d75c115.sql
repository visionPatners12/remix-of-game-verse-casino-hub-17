
-- Supprimer complètement le store - tables backend
-- Supprimer d'abord la fonction purchase_item qui référence les tables
DROP FUNCTION IF EXISTS public.purchase_item(uuid, uuid, numeric, text);

-- Supprimer les tables store dans l'ordre des dépendances
DROP TABLE IF EXISTS public.user_items CASCADE;
DROP TABLE IF EXISTS public.avatars CASCADE; 
DROP TABLE IF EXISTS public.store_items CASCADE;

-- Nettoyer la colonne avatar_url des users si elle référençait le store
-- (on garde la colonne mais on supprime juste les références store)
