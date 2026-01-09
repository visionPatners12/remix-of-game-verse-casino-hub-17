
-- Vérifier la structure de la table app_social.live_streams
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'app_social' 
AND table_name = 'live_streams'
ORDER BY ordinal_position;

-- Vérifier les contraintes NOT NULL
SELECT 
    column_name,
    constraint_name,
    constraint_type
FROM information_schema.constraint_column_usage ccu
JOIN information_schema.table_constraints tc ON ccu.constraint_name = tc.constraint_name
WHERE ccu.table_schema = 'app_social' 
AND ccu.table_name = 'live_streams'
AND tc.constraint_type = 'NOT NULL';
