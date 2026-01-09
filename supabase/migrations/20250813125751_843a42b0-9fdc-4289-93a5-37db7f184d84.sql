-- Add privy_id column to users table for better user identification
ALTER TABLE public.users 
ADD COLUMN privy_id TEXT UNIQUE;

-- Update the handle_new_user function to handle privy_id from Privy auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Handle Privy users with privy_id from raw_user_meta_data
  IF NEW.raw_user_meta_data->>'auth_method' = 'privy' THEN
    INSERT INTO public.users (
      id, 
      privy_id,
      username, 
      email,
      first_name,
      last_name,
      phone,
      country
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'privy_id', -- Store the actual Privy DID
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'email', -- This can be the user's real email or null
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'country'
    );
  -- Handle wallet users
  ELSIF NEW.raw_user_meta_data->>'auth_method' = 'wallet' THEN
    INSERT INTO public.users (
      id, 
      privy_id,
      username, 
      email,
      first_name,
      last_name,
      phone,
      country
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'privy_id', -- Store the actual Privy DID
      NEW.raw_user_meta_data->>'wallet_address', -- Username = adresse wallet
      NULL, -- Pas d'email visible
      NULL, -- Pas de prénom
      NULL, -- Pas de nom
      NULL, -- Pas de téléphone  
      NULL  -- Pas de pays
    );
  ELSE
    -- Pour les autres utilisateurs (email/password), utiliser les données normales
    INSERT INTO public.users (
      id, 
      email, 
      first_name, 
      last_name, 
      username, 
      phone, 
      country
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.raw_user_meta_data ->> 'username',
      NEW.raw_user_meta_data ->> 'phone',
      NEW.raw_user_meta_data ->> 'country'
    );
  END IF;
  RETURN NEW;
END;
$function$;