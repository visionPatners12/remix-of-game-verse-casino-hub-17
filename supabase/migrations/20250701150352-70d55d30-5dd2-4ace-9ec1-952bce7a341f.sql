
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

-- Vérifier si la table existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'app_social' 
    AND table_name = 'live_streams'
);
