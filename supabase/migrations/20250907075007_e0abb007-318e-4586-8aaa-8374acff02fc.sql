-- Fonction pour synchroniser l'email avec auth.users lors des mises à jour
CREATE OR REPLACE FUNCTION public.sync_email_with_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auth_user_record RECORD;
BEGIN
  -- Vérifier si l'email a changé
  IF OLD.email IS DISTINCT FROM NEW.email AND NEW.email IS NOT NULL THEN
    -- Vérifier que l'utilisateur existe dans auth.users
    SELECT id INTO auth_user_record FROM auth.users WHERE id = NEW.id;
    
    IF FOUND THEN
      -- Mettre à jour l'email dans auth.users
      UPDATE auth.users 
      SET email = NEW.email, 
          updated_at = now()
      WHERE id = NEW.id;
      
      -- Log pour debugging
      RAISE NOTICE 'Email synchronized for user %: % -> %', NEW.id, OLD.email, NEW.email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour synchroniser l'email automatiquement
CREATE OR REPLACE TRIGGER sync_user_email_with_auth
  AFTER UPDATE OF email ON public.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_email_with_auth();