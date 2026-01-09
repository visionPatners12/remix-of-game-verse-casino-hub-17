-- Create entity_type enum
CREATE TYPE entity_type_enum AS ENUM ('sport', 'league', 'team');

-- Drop the generated column
ALTER TABLE user_preferences DROP COLUMN entity_type;

-- Add entity_type as a regular enum column
ALTER TABLE user_preferences 
ADD COLUMN entity_type entity_type_enum NOT NULL DEFAULT 'sport'::entity_type_enum;

-- Update existing rows to have correct entity_type values
UPDATE user_preferences 
SET entity_type = CASE 
  WHEN sport_id IS NOT NULL THEN 'sport'::entity_type_enum
  WHEN league_id IS NOT NULL THEN 'league'::entity_type_enum
  WHEN team_id IS NOT NULL THEN 'team'::entity_type_enum
END;

-- Update the trigger function to use the enum type
CREATE OR REPLACE FUNCTION public.up_pref_assign_position()
RETURNS trigger
LANGUAGE plpgsql
AS $$
declare
  v_entity_type entity_type_enum;
begin
  -- Sécurité : exactement une FK non nulle
  if num_nonnulls(new.sport_id, new.league_id, new.team_id) <> 1 then
    raise exception 'Exactly one of (sport_id, league_id, team_id) must be set';
  end if;

  v_entity_type := case
                     when new.sport_id  is not null then 'sport'::entity_type_enum
                     when new.league_id is not null then 'league'::entity_type_enum
                     when new.team_id   is not null then 'team'::entity_type_enum
                   end;

  if new.position is null or new.position <= 0 then
    select coalesce(max(position) + 1, 1)
      into new.position
    from public.user_preferences
    where user_id = new.user_id
      and entity_type = v_entity_type;
  end if;

  -- Assigner automatiquement entity_type si pas défini
  if new.entity_type is null then
    new.entity_type := v_entity_type;
  end if;

  return new;
end;
$$;